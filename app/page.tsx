import { EmptyIssue } from "@/components/empty-issue";
import { Statement } from "@/components/statement";

export default function Home() {
  // 静态生成时算一次；每次部署都会更新，首屏因此能看出站点还活着
  const updatedAt = new Date();

  return (
    <div className="wrap">
      <Statement issue="001" updatedAt={updatedAt} />
      <div className="mt-8">
        <EmptyIssue />
      </div>
    </div>
  );
}
