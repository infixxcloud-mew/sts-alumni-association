import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "泗里街高级(华侨)中学校友会",
  description: "泗里街高级(华侨)中学校友会官方网站：相册、回忆、通告、委员会与教育基金资料。",
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
