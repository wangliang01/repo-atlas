import Image from "next/image";
import Link from "next/link";
import { Toc } from "@/components/toc";
import { formatDate } from "@/lib/date";
import { formatStars } from "@/lib/format";
import type { Heading } from "@/lib/mdx";
import type { RepoDetailFrontmatter } from "@/lib/schema";

export type PickAsideInfo = {
  slug: string;
  name: string;
  stars: number;
  summary: string;
};

type PickAsideProps = {
  data: RepoDetailFrontmatter;
  entry?: {
    avatar?: string;
    owner: string;
    language?: string;
    stars: number;
  };
  headings: Heading[];
  /** 同分类的其他精选，最多 4 条 */
  related: PickAsideInfo[];
};

const VERDICT_LABEL: Record<RepoDetailFrontmatter["verdict"], string> = {
  recommend: "推荐看",
  watch: "再观望",
  avoid: "暂不推荐",
};

/** 掘金式右栏：作者卡（项目信息）+ 目录卡 + 相关推荐卡，三张独立白卡 */
export function PickAside({ data, entry, headings, related }: PickAsideProps) {
  const repoUrl = `https://github.com/${data.repo}`;

  return (
    <div className="sticky top-20 space-y-4">
      <section aria-label="项目信息" className="panel p-4">
        <div className="flex items-center gap-3">
          {entry?.avatar ? (
            <Image
              src={entry.avatar}
              alt={`${entry.owner} 的头像`}
              width={44}
              height={44}
              className="size-11 shrink-0 rounded-full border border-line object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-soft text-body font-semibold text-accent-ink"
            >
              {data.repo.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-body font-semibold text-ink">{data.repo}</p>
            <span className="mt-0.5 inline-block rounded-[2px] bg-accent-soft px-1.5 py-0.5 text-micro font-medium text-accent-ink">
              {VERDICT_LABEL[data.verdict]}
            </span>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-3 border-t border-line pt-3 text-center">
          <div>
            <dt className="text-micro text-muted">Stars</dt>
            <dd className="mt-0.5 text-body font-semibold tabular-nums text-ink">
              {entry ? formatStars(entry.stars) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-micro text-muted">语言</dt>
            <dd className="mt-0.5 truncate text-body font-semibold text-ink">
              {entry?.language ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-micro text-muted">收录</dt>
            <dd className="mt-0.5 text-body font-semibold tabular-nums text-ink">
              {formatDate(data.featuredAt)}
            </dd>
          </div>
        </dl>

        {data.license ? (
          <p className="mt-3 border-t border-line pt-3 text-micro text-muted">
            许可证 <span className="text-ink">{data.license}</span>
          </p>
        ) : null}

        <a
          href={repoUrl}
          rel="noopener"
          target="_blank"
          className="mt-3 block rounded-[4px] bg-accent-fill py-2 text-center text-small font-medium text-white transition-opacity duration-150 hover:opacity-90"
        >
          在 GitHub 打开
        </a>

        <p className="mt-3 text-micro leading-5 text-muted">
          内容基于 README（sha {data.readmeSha.slice(0, 12)}，{formatDate(data.readmeFetchedAt)} 抓取）。
        </p>
      </section>

      {headings.length > 0 ? (
        <section aria-label="目录" className="panel p-4">
          <p className="text-small font-semibold text-ink">目录</p>
          {/* 卡片里已有「目录」标题：压掉 Toc 自带的「本页」，也不让它再自己吸顶 */}
          <div className="[&>nav]:static [&>nav>p]:hidden">
            <Toc items={headings} />
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section aria-label="相关推荐" className="panel p-4">
          <p className="text-small font-semibold text-ink">相关推荐</p>
          <ul className="mt-2">
            {related.map((item) => (
              <li key={item.slug} className="border-b border-line last:border-b-0">
                <Link
                  href={`/picks/${item.slug}`}
                  className="block py-2.5 transition-colors duration-150 hover:bg-surface-2"
                >
                  <span className="block line-clamp-1 text-small font-medium text-ink">
                    {item.name}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 text-micro text-muted">
                    <span className="truncate">{item.summary}</span>
                    <span className="shrink-0 tabular-nums">★ {formatStars(item.stars)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
