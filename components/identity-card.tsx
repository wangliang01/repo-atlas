import Image from "next/image";
import { visibleProfileFields, type Profile } from "@/lib/profile";

/**
 * 首页第一屏。访客三秒内要知道：这是谁、在找什么岗、在哪、怎么联系。
 * 375px 下头像和文字上下堆叠：并排时头像吃掉 72px，文字只剩 223px，
 * 「前端出身，在补 Node 和 AI 应用」会被挤出一个孤零零的「用」。
 */
export function IdentityCard({ profile }: { profile: Profile }) {
  const view = visibleProfileFields(profile);
  const name = view.name ?? "Repo Atlas";
  const meta = [view.location].filter(Boolean).join(" · ");

  return (
    <section
      data-testid="identity"
      className="panel flex flex-wrap items-start justify-between gap-x-8 gap-y-4 px-5 py-5 sm:items-center md:px-6 md:py-6"
    >
      <div className="flex min-w-0 flex-1 flex-col items-start gap-3 sm:flex-row sm:gap-5">
        {view.avatar ? (
          <Image
            src={view.avatar}
            alt={view.name ? `${view.name} 的头像` : "头像"}
            width={80}
            height={80}
            priority
            className="size-14 shrink-0 rounded-full object-cover sm:size-20"
          />
        ) : (
          <span
            aria-hidden
            className="grid size-14 shrink-0 place-items-center rounded-full bg-accent-soft text-h1 font-semibold text-accent-ink sm:size-20"
          >
            {name.slice(0, 1)}
          </span>
        )}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="text-display font-semibold tracking-tight text-ink">{name}</h1>
            {/* 「求职中」是全站的目的，不能跟城市一样混在灰字里 */}
            {view.status ? (
              <span className="rounded-[2px] bg-accent-fill px-1.5 py-0.5 text-micro font-medium text-white">
                {view.status}
              </span>
            ) : null}
          </div>
          {view.headline ? <p className="mt-0.5 text-body text-muted">{view.headline}</p> : null}

          <p className="mt-1.5 text-micro text-muted">
            {meta}
            {view.links.map((link) => (
              <span key={link.href}>
                <span aria-hidden className="mx-1.5 text-line">
                  ·
                </span>
                <a
                  href={link.href}
                  rel="noopener"
                  target="_blank"
                  className="text-accent-ink hover:underline"
                >
                  {link.label} ↗
                </a>
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* 技术栈放右边，不然整张卡右边三分之一是空的 */}
      {view.stack.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {view.stack.map((item) => (
            <li key={item} className="rounded-[2px] bg-surface-2 px-2 py-0.5 text-micro text-muted">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
