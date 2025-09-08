import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Progress = { currentDay: number; streak: number; completedDays: number[] };
type Journal = { day: number; wentWell: string; couldImprove: string; tomorrowPriority: string; createdAt?: string };
type Note = { day: number; content: string; skillPathId?: string; createdAt?: string };
type Task = { id: string; day: number; title: string; description: string; duration: number; category: 'morning'|'skill'|'evening'; completed: boolean };
type SkillPath = { id: string; name: string };

function naiveSentiment(s: string) {
  const pos = ['good','great','amazing','excellent','win','progress','learned','proud','happy','confident','calm'];
  const neg = ['bad','sad','stuck','fail','angry','tired','anxious','worried','frustrated'];
  const t = s.toLowerCase();
  let score = 0;
  for (const w of pos) if (t.includes(w)) score += 1;
  for (const w of neg) if (t.includes(w)) score -= 1;
  return score;
}

export default function WeeklyReview() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [skills, setSkills] = useState<SkillPath[]>([]);
  const [tasksByDay, setTasksByDay] = useState<Record<number, Task[]>>({});

  useEffect(() => {
    // progress
    fetch('/api/progress').then(r => r.json()).then(p => setProgress(p));
    // journals: backend has per-day GET; for now pull last 14 days from local backup if present
    try {
      const local = localStorage.getItem('life-reset-30-app-state');
      if (local) {
        const parsed = JSON.parse(local);
        const arr = (parsed.journalEntries || []).slice(-30).map((j: any) => ({ day: j.day, wentWell: j.wentWell, couldImprove: j.couldImprove, tomorrowPriority: j.tomorrowPriority, createdAt: j.date }));
        setJournals(arr);
      }
    } catch {}
    // notes
    fetch('/api/learning-notes').then(r => r.json()).then((ns) => {
      const arr = (ns || []).map((n: any) => ({ day: n.day, content: n.content, skillPathId: n.skillPathId, createdAt: n.createdAt }));
      setNotes(arr);
    }).catch(() => {});
    // skills for mapping skillPathId -> name
    fetch('/api/skills').then(r => r.json()).then((sk) => {
      const arr = (sk || []).map((s: any) => ({ id: s.id, name: s.name }));
      setSkills(arr);
    }).catch(() => {});
  }, []);

  // Fetch tasks for last 7 days when we have progress
  useEffect(() => {
    const load = async () => {
      if (!progress) return;
      const days = Array.from({ length: 7 }, (_, i) => Math.max(1, (progress.currentDay || 1) - (6 - i)));
      const entries: Record<number, Task[]> = {};
      await Promise.all(days.map(async (d) => {
        try {
          const r = await fetch(`/api/tasks/${d}`);
          if (r.ok) {
            const ts = await r.json();
            entries[d] = (ts || []).map((t: any) => ({
              id: t.id, day: d, title: t.title, description: t.description, duration: t.duration, category: t.category, completed: !!t.completed,
            }));
          } else {
            entries[d] = [];
          }
        } catch { entries[d] = []; }
      }));
      setTasksByDay(entries);
    };
    load();
  }, [progress?.currentDay]);

  const last7Days = useMemo(() => {
    if (!progress) return [] as number[];
    const cur = progress.currentDay || 1;
    return Array.from({ length: 7 }, (_, i) => Math.max(1, cur - (6 - i)));
  }, [progress]);

  const completedList = useMemo(() => {
    if (!progress) return [] as number[];
    const set = new Set(progress.completedDays || []);
    return Array.from(set).sort((a,b) => a-b);
  }, [progress]);

  const sentiment = useMemo(() => {
    const days: { day: number; score: number }[] = [];
    for (const j of journals) {
      const s = naiveSentiment([j.wentWell, j.couldImprove, j.tomorrowPriority].join(' '));
      days.push({ day: j.day, score: s });
    }
    days.sort((a,b) => a.day - b.day);
    return days.slice(-14);
  }, [journals]);

  // Activity analytics
  const activity = useMemo(() => {
    const days = last7Days;
    let totalMinutes = 0;
    let daysWithActivity = 0;
    let mostProductive: { day: number; completed: number; minutes: number } | null = null;
    const byCategory: Record<'morning'|'skill'|'evening', number> = { morning: 0, skill: 0, evening: 0 };

    for (const d of days) {
      const tasks = tasksByDay[d] || [];
      const completed = tasks.filter(t => t.completed);
      if (completed.length > 0) daysWithActivity++;
      const minutes = completed.reduce((sum, t) => sum + (t.duration || 0), 0);
      totalMinutes += minutes;
      for (const t of completed) {
        byCategory[t.category] += (t.duration || 0);
      }
      const info = { day: d, completed: completed.length, minutes };
      if (!mostProductive || info.completed > mostProductive.completed || (info.completed === mostProductive.completed && info.minutes > mostProductive.minutes)) {
        mostProductive = info;
      }
    }

    const completedSet = new Set(progress?.completedDays || []);
    const consistency = days.reduce((acc, d) => acc + (completedSet.has(d) ? 1 : 0), 0);

    return { totalMinutes, avgMinutes: daysWithActivity ? Math.round(totalMinutes / daysWithActivity) : 0, mostProductive, byCategory, consistency };
  }, [last7Days, tasksByDay, progress?.completedDays]);

  const topSkills = useMemo(() => {
    if (!skills.length || !notes.length) return [] as { name: string; count: number }[];
    const byId = new Map(skills.map(s => [s.id, s.name] as const));
    const counts = new Map<string, number>();
    for (const n of notes) {
      if (!n.skillPathId) continue;
      const name = byId.get(n.skillPathId);
      if (!name) continue;
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    const arr = Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
    arr.sort((a,b) => b.count - a.count);
    return arr.slice(0, 5);
  }, [skills, notes]);

  function fmtMinutes(min: number) {
    const h = Math.floor(min / 60); const m = min % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  return (
    <div className="pt-20 pb-24 md:pt-24 md:pb-8">
      <div className="container mx-auto px-4 lg:px-6 mb-12">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-2">Weekly Review</h2>
          <p className="text-muted-foreground">Insights just for you</p>
        </motion.div>

  <div className="grid gap-4 lg:grid-cols-2 lg:gap-8">
          {/* Streak & Completed Days */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg md:text-xl font-bold mb-4">Streak & Completed Days</h3>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
                  <Badge className="bg-primary text-primary-foreground">Streak: {progress?.streak ?? 0}</Badge>
                  <Badge variant="secondary">Current Day: {progress?.currentDay ?? 1}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {completedList.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No completed days yet</div>
                  ) : (
                    completedList.map(d => (
                      <span key={d} className={cn('px-2 py-1 rounded-md text-xs md:text-sm', 'bg-success/20 text-success')}>Day {d}</span>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="pt-6">
                <h3 className="text-lg md:text-xl font-bold mb-4">Sentiment Trend (last 14 entries)</h3>
                {sentiment.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No journal entries yet</div>
                ) : (
                  <div className="flex items-end gap-1 md:gap-2 h-24 md:h-28">
                    {sentiment.map((d, i) => (
                      <div key={i} className={cn('w-3 md:w-4 rounded-t', d.score >= 0 ? 'bg-primary' : 'bg-destructive')} style={{ height: `${(Math.abs(d.score) + 1) * 10}px` }} title={`Day ${d.day}: ${d.score}`}></div>
                    ))}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2">Bar up = positive words; down = negative words</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Summary & Top Skills */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg md:text-xl font-bold mb-4">Activity Summary (last 7 days)</h3>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <div className="text-xl md:text-2xl font-black text-primary">{fmtMinutes(activity.totalMinutes)}</div>
                    <div className="text-sm text-muted-foreground">Total focused time</div>
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-black text-secondary">{fmtMinutes(activity.avgMinutes)}</div>
                    <div className="text-sm text-muted-foreground">Avg per active day</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Category breakdown</div>
                  <div className="flex gap-2 items-end h-20">
                    {(['morning','skill','evening'] as const).map((k) => {
                      const max = Math.max(1, ...Object.values(activity.byCategory));
                      const h = Math.round((activity.byCategory[k] / max) * 100) || 1;
                      const label = k === 'skill' ? 'Skill' : k[0].toUpperCase() + k.slice(1);
                      const color = k === 'morning' ? 'bg-yellow-500' : k === 'skill' ? 'bg-purple-500' : 'bg-blue-500';
                      return (
                        <div key={k} className="flex flex-col items-center">
                          <div className={cn('w-4 md:w-6 rounded', color)} style={{ height: `${Math.max(8,h)}px` }} title={`${label}: ${fmtMinutes(activity.byCategory[k])}`}></div>
                          <div className="text-[10px] md:text-xs text-muted-foreground mt-1">{label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <div><span className="font-medium">Most productive:</span> {activity.mostProductive ? `Day ${activity.mostProductive.day} (${activity.mostProductive.completed} tasks, ${fmtMinutes(activity.mostProductive.minutes)})` : '—'}</div>
                  <div className="mt-1"><span className="font-medium">Consistency:</span> {activity.consistency}/7 completed days</div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="pt-6">
                <h3 className="text-lg md:text-xl font-bold mb-4">Top Skills Touched</h3>
                {topSkills.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No skills activity yet</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {topSkills.map(s => (
                      <Badge key={s.name} variant="secondary" className="text-xs md:text-sm max-w-[48%] md:max-w-none truncate break-words">{s.name} <span className="ml-1 opacity-70">×{s.count}</span></Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
