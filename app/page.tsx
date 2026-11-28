import { PicksView } from "@/components/picks-view";
import { getPicksSnapshot } from "@/lib/content";
import { detailInfoMap, getAllRepoDetails } from "@/lib/repo-detail";

export default function Home() {
  const snapshot = getPicksSnapshot();
  const stats = new Map((snapshot?.entries ?? []).map((entry) => [entry.repo.toLowerCase(), entry]));
  // 首页是人工收藏库：全集来自详情页，GitHub 快照只补 stars / 涨速 / 头像等统计。
  const entries = getAllRepoDetails().map((detail) => {
    const stat = stats.get(detail.data.repo.toLowerCase());
    return {
      name: detail.data.repo.split("/")[1] ?? detail.data.repo,
      repo: detail.data.repo,
      owner: detail.data.repo.split("/")[0] ?? "",
      description: detail.data.summary,
      stars: stat?.stars,
      starsPerDay: stat?.starsPerDay,
      avatar: stat?.avatar,
      language: stat?.language,
      firstSeen: stat?.firstSeen ?? detail.data.featuredAt,
      pushedAt: stat?.pushedAt ?? detail.data.featuredAt,
      why: stat?.why,
      featuredAt: detail.data.featuredAt,
    };
  });
  const syncedAt = snapshot?.syncedAt ?? new Date(0);

  return (
    <div className="wrap py-4 md:py-5">
      {/* 首屏只放收藏库：标题留给读屏和 SEO，视觉上让列表自己说话 */}
      <h1 className="sr-only">我收藏的 GitHub 项目</h1>

      <PicksView entries={entries} syncedAt={syncedAt} details={detailInfoMap()} />
    </div>
  );
}
