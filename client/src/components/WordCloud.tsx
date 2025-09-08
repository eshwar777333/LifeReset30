import React from 'react';

type Word = { text: string; weight: number };

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w));
}

const STOP = new Set([
  'the','and','for','are','you','your','with','that','this','from','have','but','not','was','were','has','had','they','their','them','some','any','can','into','out','over','under','about','after','before','just','like','will','would','could','should','there','then','here','when','what','who','why','how'
]);

export function buildWordWeights(texts: string[]): Word[] {
  const freq = new Map<string, number>();
  for (const t of texts) {
    for (const w of tokenize(t)) {
      freq.set(w, (freq.get(w) || 0) + 1);
    }
  }
  const words = Array.from(freq.entries()).map(([text, weight]) => ({ text, weight }));
  words.sort((a, b) => b.weight - a.weight);
  return words.slice(0, 60);
}

export default function WordCloud({ texts }: { texts: string[] }) {
  const words = buildWordWeights(texts);
  if (words.length === 0) return <div className="text-sm text-muted-foreground">No data yet</div>;
  const max = Math.max(...words.map(w => w.weight));
  const min = Math.min(...words.map(w => w.weight));
  const scale = (w: number) => 12 + ((w - min) / Math.max(1, max - min)) * 24; // 12px..36px

  return (
    <div className="flex flex-wrap gap-2">
      {words.map((w, i) => (
        <span
          key={w.text + i}
          className="rounded-md px-2 py-1 bg-muted"
          style={{ fontSize: `${scale(w.weight)}px`, lineHeight: 1.1 }}
          title={`${w.text} (${w.weight})`}
        >
          {w.text}
        </span>
      ))}
    </div>
  );
}
