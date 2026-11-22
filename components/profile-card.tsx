import Image from "next/image";
import { formatDate } from "@/lib/date";
import { visibleProfileFields, type Profile } from "@/lib/profile";

type ProfileCardProps = {
  profile: Profile;
  updatedAt: Date;
  variant: "rail" | "strip";
};

// 个人字段全空时退回站点自己的身份，而不是留一个空盒子或写「未填写」
const FALLBACK_NAME = "Repo Atlas";
const FALLBACK_LINE = "我跑过的开源项目，和它们的真实成色。";

/**
 * 右栏个人信息。数字放在左栏，这里只放「这个人是谁」——
 * 两边都放同一组数字就又是重复。
 */
export function ProfileCard({ profile, updatedAt, variant }: ProfileCardProps) {
  const view = visibleProfileFields(profile);
  const name = view.name ?? FALLBACK_NAME;
  const headline = view.headline ?? FALLBACK_LINE;
  const meta = [view.status, view.location].filter(Boolean).join(" · ");

  const body = (
    <>
      <div className="flex items-center gap-3">
        {view.avatar ? (
          <Image
            src={view.avatar}
            alt={view.name ? `${view.name} 的头像` : "头像"}
            width={56}
            height={56}
            className="size-14 shrink-0 border border-line object-cover"
          />
        ) : null}
        <div className="min-w-0">
          <p className="truncate font-serif text-body font-semibold text-ink">{name}</p>
          <p className="mt-0.5 text-small text-muted">{headline}</p>
        </div>
      </div>

      {meta ? <p className="mt-3 font-mono text-micro text-muted">{meta}</p> : null}

      {view.stack.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {view.stack.map((item) => (
            <li key={item} className="border border-line px-1.5 font-mono text-micro text-muted">
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {view.links.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {view.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                rel="noopener"
                target="_blank"
                className="font-mono text-micro text-accent underline decoration-line underline-offset-4"
              >
                {link.label} ↗
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 border-t border-line pt-3 font-mono text-micro text-muted tabular-nums">
        最近更新 {formatDate(updatedAt)}
      </p>
    </>
  );

  if (variant === "strip") {
    return (
      <section aria-label="关于" className="border-t border-line pt-6">
        {body}
      </section>
    );
  }

  return (
    <section aria-label="关于" className="border border-line p-4">
      {body}
    </section>
  );
}
