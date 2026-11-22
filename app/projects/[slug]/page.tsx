import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { CodeBlock } from "@/components/code-block";
import { MetaBar } from "@/components/meta-bar";
import { Prose, proseComponents } from "@/components/prose";
import { TopicChip } from "@/components/topic-chip";
import { VerdictBadge } from "@/components/verdict-badge";
import { getAdjacentProjects, getAllProjects, getProject } from "@/lib/content";
import { formatDate } from "@/lib/date";
import { preprocessCode } from "@/lib/highlight";

type PageProps = { params: Promise<{ slug: string }> };

const components = { ...proseComponents, CodeBlock };

// 只有 content/projects 里存在的 slug 才预渲染，其余一律 404，不落到运行时
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "未收录 | Repo Atlas" };
  return {
    title: `${project.data.name} · ${project.data.tagline} | Repo Atlas`,
    description: `${project.data.tagline}。${project.data.highlight}`,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { data, body } = project;
  const { prev, next } = getAdjacentProjects(slug);
  const source = await preprocessCode(body);

  return (
    <article className="wrap py-4 md:py-5">
      <div className="panel px-5 py-6 md:px-8 md:py-8">
        <nav aria-label="面包屑" className="text-micro text-muted">
          <Link href="/" className="transition-colors duration-150 hover:text-accent-ink">
            首页
          </Link>
          <span aria-hidden="true" className="mx-2 text-line">
            /
          </span>
          <span>{data.name}</span>
        </nav>

        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-h1 font-semibold text-ink">{data.name}</h1>
            <VerdictBadge verdict={data.verdict} />
          </div>
          <p className="mt-1.5 text-body text-muted">
            {data.tagline}
            {data.replaces.length > 0 ? (
              <span className="ml-2 text-micro">替代 {data.replaces.join("、")}</span>
            ) : null}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.topics.map((topic) => (
              <TopicChip key={topic} topic={topic} />
            ))}
          </div>

          <div className="mt-5 rounded-[4px] bg-surface-2 px-3 py-2.5">
            <MetaBar data={data} />
          </div>

          <dl className="mt-5 grid gap-4 text-small sm:grid-cols-2">
            <div>
              <dt className="text-micro text-muted">适合</dt>
              <dd className="mt-1 text-ink">{data.forWho}</dd>
            </div>
            <div>
              <dt className="text-micro text-muted">不适合</dt>
              <dd className="mt-1 text-ink">{data.notFor}</dd>
            </div>
          </dl>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,720px)_1fr]">
          <div className="min-w-0">
            {data.screenshot ? (
              <Image
                src={data.screenshot}
                alt={`${data.name} 的界面截图`}
                width={1600}
                height={1000}
                className="w-full rounded-[4px] border border-line"
              />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-[4px] border border-dashed border-line bg-surface-2 px-4 py-5 text-micro text-muted">
                <span>截图待补</span>
                <span>{data.repo}</span>
              </div>
            )}

            <div className="mt-10">
              <Prose>
                <MDXRemote source={source} components={components} />
              </Prose>
            </div>
          </div>

          <aside className="hidden lg:block">
            <p className="sticky top-20 text-micro text-muted">
              最后核实于 {formatDate(data.publishedAt)}
            </p>
          </aside>
        </div>

        {data.alternatives.length > 0 ? (
          <section className="mt-12 border-t border-line pt-6">
            <h2 className="text-h2 font-semibold text-ink">站内替代品</h2>
            <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.alternatives.map((alternativeSlug) => {
                const alternative = getProject(alternativeSlug);
                if (!alternative) return null;
                return (
                  <li key={alternativeSlug}>
                    <Link
                      href={`/projects/${alternativeSlug}`}
                      className="block rounded-[4px] border border-line p-4 transition-colors duration-150 hover:border-accent"
                    >
                      <span className="text-body font-semibold text-ink">
                        {alternative.data.name}
                      </span>
                      <span className="mt-1 block text-small text-muted">
                        {alternative.data.tagline}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <footer className="mt-12 flex items-center justify-between gap-4 border-t border-line pt-5 text-small">
          {prev ? (
            <Link
              href={`/projects/${prev.slug}`}
              className="text-muted transition-colors duration-150 hover:text-accent-ink"
            >
              ← {prev.data.name}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/projects/${next.slug}`}
              className="text-right text-muted transition-colors duration-150 hover:text-accent-ink"
            >
              {next.data.name} →
            </Link>
          ) : (
            <span />
          )}
        </footer>
      </div>
    </article>
  );
}
