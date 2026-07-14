import { LegacyHomePage } from "@/components/legacy/legacy-home";
import {
  getPublishedCmsAlbums,
  getPublishedCmsContent,
  mergeCmsFirst,
} from "@/lib/cms-data";
import { publishedAlbums, siteData } from "@/lib/site-data";

export default async function Home() {
  const [cmsAlbums, cmsAnnouncements, cmsMemories] = await Promise.all([
    getPublishedCmsAlbums(),
    getPublishedCmsContent("announcement"),
    getPublishedCmsContent("memory"),
  ]);

  return (
    <LegacyHomePage
      albums={mergeCmsFirst(cmsAlbums, publishedAlbums)}
      announcements={mergeCmsFirst(cmsAnnouncements, siteData.announcements)}
      memories={mergeCmsFirst(cmsMemories, siteData.memories)}
      committees={siteData.committees}
    />
  );
}
