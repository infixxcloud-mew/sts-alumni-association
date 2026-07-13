export const staticPageContent: Record<
  string,
  {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    facts?: { label: string; value: string }[];
  }
> = {
  "about-us": {
    eyebrow: "About",
    heading: "欢迎来到泗里街高级(华侨)中学校友会",
    paragraphs: [
      "我们自豪地呈现泗里街高级(华侨)中学卓越辉煌的校友们所筑梦的空间。作为一个富有传统和创新精神的学校，我们在华侨社群中有着不可磨灭的历史地位。校友会成立于2003年，这个网站是我们与全球校友共同连接和分享的平台，旨在传承和延续卓越的华侨精神。",
      "在这里，您将发现丰富的校友资源、精彩的校友故事，以及校友们在各行各业取得的卓越成就。我们骄傲地展示泗里街高级(华侨)中学的历史、活动与荣誉传统。",
      "校友会的使命是继承和传承学校精神，将校友们联系在一起。通过校友会，我们可以共同创造更多机会，推动彼此的发展。",
    ],
  },
  "contact-us": {
    eyebrow: "Contact",
    heading: "联络我们",
    paragraphs: [
      "欢迎校友、学生与关心母校发展的朋友与校友会保持联系。",
    ],
    facts: [
      { label: "地址", value: "Peti Surat 78, 96100, Sarikei, Sarawak, Malaysia" },
      { label: "电话", value: "084-655 686" },
      { label: "邮箱", value: "stsalumniassociationweb@gmail.com" },
    ],
  },
};
