import { PicksView } from "@/components/picks-view";
import { getPicksSnapshot } from "@/lib/content";
import { detailInfoMap } from "@/lib/repo-detail";

export default function Home() {
  const snapshot = getPicksSnapshot();
  const entries = snapshot?.entries ?? [];

  return (
    <div className="wrap py-4 md:py-5">
      {/* 首屏只放精选：标题留给读屏和 SEO，视觉上让列表自己说话 */}
      <h1 className="sr-only">最近值得看的 AI 项目</h1>

      {snapshot ? (
        <PicksView entries={entries} syncedAt={snapshot.syncedAt} details={detailInfoMap()} />
      ) : (
        <div className="panel px-5 py-10 text-small text-muted">精选还没同步，先跑一次 pnpm sync:picks。</div>
      )}
    </div>
  );
}
