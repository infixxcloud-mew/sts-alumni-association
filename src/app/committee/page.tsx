import { LegacyCommitteePage } from "@/components/legacy/legacy-list-pages";
import { siteData } from "@/lib/site-data";

export const metadata = {
  title: "委员会 - 泗里街高级(华侨)中学 - 校友会",
};

export default function CommitteePage() {
  return <LegacyCommitteePage members={siteData.committees} />;
}
