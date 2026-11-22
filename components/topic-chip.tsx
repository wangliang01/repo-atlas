export function TopicChip({ topic }: { topic: string }) {
  return (
    <span className="inline-flex items-center rounded-[2px] bg-surface-2 px-1.5 py-0.5 text-micro text-muted">
      {topic}
    </span>
  );
}
