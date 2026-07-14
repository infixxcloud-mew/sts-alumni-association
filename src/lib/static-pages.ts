export const staticPageContent: Record<
  string,
  {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    sections?: { title: string; text: string }[];
    facts?: { label: string; value: string }[];
  }
> = {
  "about-us": {
    eyebrow: "关于我们",
    heading: "欢迎来到泗里街高级(华侨)中学校友会",
    paragraphs: [
      "我们自豪地呈现泗里街高级(华侨)中学卓越辉煌的校友们所筑梦的空间作为一个富有传统和创新精神的学校，我们在华侨社群中有着不可磨灭的历史地位这个网站是我们与全球校友共同连接和分享的平台，旨在传承和延续卓越的华侨精神",
      "在这里，您将发现丰富的校友资源、精彩的校友故事，以及我们的校友们在各行各业取得的卓越成就我们骄傲地展示着泗里街高级(华侨)中学的丰富历史和杰出校友们的荣誉传统",
    ],
    sections: [
      {
        title: "我们的使命",
        text: "我们的使命是传承和弘扬卓越的华侨精神，建立一个强大的校友社群，为校友们提供丰富的资源和机会。我们致力于连接校友，建立持久的联系，并搭建一个资源共享的平台。",
      },
      {
        title: "我们的愿景",
        text: "我们的愿景是建立一个强大、团结的校友社群，成为校友们的首选社交和资源平台。我们愿意维护和传承学校的声誉和荣誉传统，使之继续熠熠生辉。",
      },
    ],
  },
  "contact-us": {
    eyebrow: "联络",
    heading: "联络我们",
    paragraphs: [],
    facts: [
      { label: "地址", value: "Peti Surat 78, 96100, Sarikei, Sarawak, Malaysia" },
      { label: "电话", value: "084-655 686" },
      { label: "邮箱", value: "stsalumniassociationweb@gmail.com" },
    ],
  },
};
