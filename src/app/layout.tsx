import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "泗里街高级(华侨)中学 - 校友会",
  description:
    "欢迎来到泗里街高级(华侨)中学校友会的官方网站! 我们致力于连接和联系所有泗里街高级(华侨)中学的校友。无论你是毕业多年的校友还是新近离校的学生, 这里都是你留下足迹、分享经历的家园。通过这个平台，您可以了解校友会的最新活动、校友们的成就以及校园的最新动态。加入我们，与老朋友重聚，结识新朋友，共同追忆校园时光，共享人生经验",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
