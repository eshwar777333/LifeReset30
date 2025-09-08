import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function MilestoneModal({ open, day, onClose }: { open: boolean; day: number; onClose: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const exportCard = async () => {
    if (!ref.current) return;
    // Simple canvas export (text only) to avoid heavy deps
    const w = 800, h = 400;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // background
    ctx.fillStyle = '#0b0b0c';
    ctx.fillRect(0, 0, w, h);
    // gradient stripe
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#3b82f6');
    grad.addColorStop(1, '#ef4444');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, 8);
    // text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px Inter, system-ui, sans-serif';
    ctx.fillText('Milestone Unlocked', 40, 120);
    ctx.font = 'bold 100px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`Day ${day}`, 40, 230);
    ctx.font = '24px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#d1d5db';
    ctx.fillText('Life Reset 30 — Keep the streak alive!', 40, 290);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `milestone-day-${day}.png`;
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Milestone Unlocked 🎉</DialogTitle>
          <DialogDescription>Congratulations on reaching Day {day}!</DialogDescription>
        </DialogHeader>
        <div ref={ref} className="rounded-lg p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border">
          <div className="text-4xl font-black text-primary">Day {day}</div>
          <div className="text-sm text-muted-foreground mt-2">Consistency wins. Screenshot or export the card to share with future you.</div>
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={exportCard}><i className="fas fa-download mr-2"></i>Export card</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
