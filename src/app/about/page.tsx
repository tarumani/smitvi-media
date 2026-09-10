import { AboutPage } from "@/components/Legal";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "About", path: "/about" });
export default function Page() {
  return <AboutPage />;
}
