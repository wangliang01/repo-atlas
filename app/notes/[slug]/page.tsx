import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/code-block";
import { Prose, proseComponents } from "@/components/prose";
import { Toc } from "@/components/toc";
import { getAllNotes, getNote } from "@/lib/content";
import { formatDate } from "@/lib/date";
import { preprocessCode } from "@/lib/highlight";
import { NOTE_KIND_LABEL } from "@/lib/labels";
import { UNRESOLVED_HEADING, extractHeadings, parseNoteSections, readingTimeOf, slugify } from "@/lib/mdx";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

const components = { ...proseComponents, CodeBlock };

// 表格是 GFM 语法，不加这个插件 remark 会把 | 当普通文本
const mdxOptions = { mdxOptions: { remarkPlugins: [remarkGfm] } };

export function generateStaticParams() {
  return getAllNotes().map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return { title: "笔记不存在 | Repo Atlas" };
  return {
    title: `${note.data.title} | Repo Atlas`,
    description: note.data.summary,
  };
}

export default async function NotePage({ params }: PageProps) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  const { data, body } = note;
  const { main, unresolved } = parseNoteSections(body);
  const [mainSource, unresolvedSource] = await Promise.all([
    preprocessCode(main),
    preprocessCode(unresolved),
  ]);
  const headings = extractHeadings(body);

  return (
    <article className="wrap py-10 md:py-16">
      <nav aria-label="面包屑" className="font-mono text-micro text-muted">
        <Link href="/notes" className="transition-colors duration-150 hover:text-ink">
          笔记
        </Link>
        <span aria-hidden="true" className="mx-2 text-line">
          /
        </span>
        <span>{data.title}</span>
      </nav>

      <header className="mt-6 border-b border-line pb-6">
        <h1 className="font-serif text-h1 font-semibold text-ink">{data.title}</h1>
        <p className="mt-3 max-w-[var(--measure)] text-body text-muted">{data.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 font-mono text-micro text-muted">
          <time dateTime={formatDate(data.publishedAt).replace(/\./g, "-")} className="tabular-nums">
            {formatDate(data.publishedAt)}
          </time>
          <span>{NOTE_KIND_LABEL[data.kind]}</span>
          <span>约 {readingTimeOf(body)} 分钟</span>
        </div>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,720px)_1fr]">
        <div className="min-w-0">
          <Prose>
            <MDXRemote source={mainSource} components={components} options={mdxOptions} />
          </Prose>

          <section className="mt-16 border-t border-line pt-6">
            <h2
              id={slugify(UNRESOLVED_HEADING)}
              className="scroll-mt-24 font-serif text-h2 font-semibold text-ink"
            >
              {UNRESOLVED_HEADING}
            </h2>
            <div className="mt-4">
              <Prose>
                <MDXRemote source={unresolvedSource} components={components} options={mdxOptions} />
              </Prose>
            </div>
          </section>
        </div>

        <aside className="hidden xl:block">
          <Toc items={headings} />
        </aside>
      </div>
    </article>
  );
}
