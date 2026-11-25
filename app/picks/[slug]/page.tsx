import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { PickAside, type PickAsideInfo } from "@/components/pick-aside";
import { CodeBlock } from "@/components/code-block";
import { Figure } from "@/components/figure";
import { Prose, proseComponents } from "@/components/prose";
import { getPicksSnapshot } from "@/lib/content";
import { formatDate } from "@/lib/date";
import { formatStars } from "@/lib/format";
import { preprocessCode } from "@/lib/highlight";
import { extractHeadings } from "@/lib/mdx";
import { detailInfoMap, getAllRepoDetails, getRepoDetail } from "@/lib/repo-detail";
import type { RepoDetailFrontmatter } from "@/lib/schema";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

const components = { ...proseComponents, CodeBlock, Figure };
const mdxOptions = { mdxOptions: { remarkPlugins: [remarkGfm] } };

export function generateStaticParams() {
  return getAllRepoDetails().map((detail) => ({ slug: detail.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = getRepoDetail(slug);
  if (!detail) return { title: "项目不存在 | Repo Atlas" };
  return { title: `${detail.data.title} | Repo Atlas`, description: detail.data.summary };
}

/** 同领域里挑星数最高的 4 个当相关推荐；领域数据来自各自的详情页 */
function relatedPicks(repo: string, domains: RepoDetailFrontmatter["domains"]): PickAsideInfo[] {
  const details = detailInfoMap();
  const wanted = new Set<string>(domains);
  return (getPicksSnapshot()?.entries ?? [])
    .filter((entry) => {
      if (entry.repo === repo) return false;
      const detail = details[entry.repo.toLowerCase()];
      return detail?.domains.some((domain) => wanted.has(domain)) ?? false;
    })
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 4)
    .map((entry) => {
      const detail = details[entry.repo.toLowerCase()];
      return {
        slug: detail!.slug,
        name: entry.name,
        stars: entry.stars,
        summary: detail!.summary,
      };
    });
}

export default async function RepoDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = getRepoDetail(slug);
  if (!detail) notFound();

  const { data, body } = detail;
  const source = await preprocessCode(body);
  // 「来源」留在正文，但目录只列五问：它是书目条目，不该占内容节的一格
  const headings = extractHeadings(body).filter((heading) => heading.text !== "来源");
  const entry = getPicksSnapshot()?.entries.find((item) => item.repo === data.repo);

  return (
    <div className="wrap grid grid-cols-1 gap-4 py-4 md:py-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start xl:gap-5">
      <article className="panel min-w-0 px-5 py-6 md:px-8 md:py-8">
        <h1 className="text-balance text-display font-semibold tracking-tight text-ink">
          {data.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-micro text-muted">
          <span className="font-mono">{data.repo}</span>
          <span className="tabular-nums">收录 {formatDate(data.featuredAt)}</span>
          {entry ? <span className="tabular-nums">★ {formatStars(entry.stars)}</span> : null}
          {entry?.language ? <span>{entry.language}</span> : null}
          <a
            href={`https://github.com/${data.repo}`}
            rel="noopener"
            target="_blank"
            className="font-medium text-accent-ink hover:underline"
          >
            GitHub ↗
          </a>
        </div>

        {data.banner ? (
          // 封面从 README 首图取，外链到 GitHub 原始文件；拿不到宽高，走运行时图片
          // eslint-disable-next-line @next/next/no-img-element -- MDX 内容才在运行时确定，next/image 的必填尺寸给不出来
          <img
            src={data.banner}
            alt={`${data.title}（来自项目 README）`}
            loading="lazy"
            decoding="async"
            className="mt-6 w-full rounded-[6px] border border-line object-cover max-h-[420px]"
          />
        ) : null}

        <div className="mt-8">
          <Prose>
            <MDXRemote source={source} components={components} options={mdxOptions} />
          </Prose>
        </div>
      </article>

      <aside aria-label="项目信息与目录" className="hidden min-w-0 xl:block">
        <PickAside data={data} entry={entry} headings={headings} related={relatedPicks(data.repo, data.domains)} />
      </aside>
    </div>
  );
}
