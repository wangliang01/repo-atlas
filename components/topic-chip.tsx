export function TopicChip({ topic }: { topic: string }) {
  return (
    <span className="inline-flex items-center border border-line px-2 py-0.5 font-mono text-micro text-muted">
      {topic}
    </span>
  );
}
