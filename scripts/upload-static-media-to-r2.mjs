import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const rootDir = process.cwd();
const dataPath = path.join(rootDir, "src/data/generated/site-data.json");
const publicDir = path.join(rootDir, "public");
const dryRun = process.argv.includes("--dry-run");
const statusOnly = process.argv.includes("--status");
const skipExisting =
  process.argv.includes("--skip-existing") || process.argv.includes("--resume");

function loadDotEnv(fileName) {
  return fs
    .readFile(path.join(rootDir, fileName), "utf8")
    .then((content) => {
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
        const index = trimmed.indexOf("=");
        const key = trimmed.slice(0, index).trim();
        const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = value;
      }
    })
    .catch(() => undefined);
}

function requireEnv(key) {
  const value = process.env[key];
  if (!value) throw new Error(`Set ${key} in .env.local first.`);
  return value;
}

function collectMediaPaths(value, paths = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectMediaPaths(item, paths);
    return paths;
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectMediaPaths(item, paths);
    return paths;
  }

  if (typeof value === "string") {
    for (const match of value.matchAll(/\/media\/[^\s"'<>)]*/g)) {
      paths.add(match[0]);
    }
  }

  return paths;
}

function replaceMediaPaths(value, replacements) {
  if (Array.isArray(value)) {
    return value.map((item) => replaceMediaPaths(item, replacements));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        replaceMediaPaths(item, replacements),
      ]),
    );
  }

  if (typeof value === "string") {
    return value.replace(/\/media\/[^\s"'<>)]*/g, (match) =>
      replacements.get(match) ?? match,
    );
  }

  return value;
}

function contentTypeFor(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".png") return "image/png";
  if (extension === ".gif") return "image/gif";
  if (extension === ".bmp") return "image/bmp";
  return "image/webp";
}

function storagePathFor(mediaPath) {
  return `legacy/${mediaPath.replace(/^\/media\//, "")}`;
}

function publicUrlFor(key) {
  const baseUrl = requireEnv("R2_PUBLIC_BASE_URL").replace(/\/$/, "");
  const safeKey = key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${baseUrl}/${safeKey}`;
}

async function listExistingObjects(client, bucket) {
  const objects = new Map();
  let continuationToken;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: "legacy/",
        ContinuationToken: continuationToken,
      }),
    );

    for (const object of response.Contents ?? []) {
      if (object.Key) objects.set(object.Key, object.Size ?? 0);
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return objects;
}

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

async function fileSize(filePath) {
  const stats = await fs.stat(filePath);
  return stats.size;
}

async function main() {
  await loadDotEnv(".env.local");
  await loadDotEnv(".env");

  const raw = await fs.readFile(dataPath, "utf8");
  const siteData = JSON.parse(raw);
  const mediaPaths = Array.from(collectMediaPaths(siteData)).sort();
  const localFiles = [];
  const missing = [];

  for (const mediaPath of mediaPaths) {
    const localPath = path.join(publicDir, mediaPath.replace(/^\//, ""));
    try {
      localFiles.push({
        mediaPath,
        localPath,
        size: await fileSize(localPath),
      });
    } catch {
      missing.push(mediaPath);
    }
  }

  const totalBytes = localFiles.reduce((total, file) => total + file.size, 0);
  console.log(`media references: ${mediaPaths.length}`);
  console.log(`local files: ${localFiles.length}`);
  console.log(`missing files: ${missing.length}`);
  console.log(`local bytes: ${totalBytes}`);

  if (dryRun) return;

  const bucket = requireEnv("R2_BUCKET_NAME");
  const client = getR2Client();
  const existingObjects = await listExistingObjects(client, bucket);
  const localKeys = new Map(
    localFiles.map((file) => [storagePathFor(file.mediaPath), file]),
  );
  const uploadedLocalKeys = Array.from(localKeys.keys()).filter((key) =>
    existingObjects.has(key),
  );

  console.log(`r2 legacy objects: ${existingObjects.size}`);
  console.log(`r2 matching local files: ${uploadedLocalKeys.length}`);

  if (statusOnly) return;

  const replacements = new Map();

  for (const [index, file] of localFiles.entries()) {
    const key = storagePathFor(file.mediaPath);
    replacements.set(file.mediaPath, publicUrlFor(key));

    if (skipExisting && existingObjects.has(key)) {
      if ((index + 1) % 100 === 0 || index + 1 === localFiles.length) {
        console.log(
          `processed ${index + 1}/${localFiles.length} (skipped existing)`,
        );
      }
      continue;
    }

    const body = await fs.readFile(file.localPath);

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentTypeFor(file.localPath),
      }),
    );

    if ((index + 1) % 100 === 0 || index + 1 === localFiles.length) {
      console.log(`processed ${index + 1}/${localFiles.length}`);
    }
  }

  const rewritten = replaceMediaPaths(siteData, replacements);
  await fs.writeFile(dataPath, `${JSON.stringify(rewritten, null, 2)}\n`);
  console.log(`rewrote ${dataPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
