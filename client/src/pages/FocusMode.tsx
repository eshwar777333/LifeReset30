import { useEffect, useMemo, useRef, useState } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { notify } from '@/lib/notify';
import { useSound } from '@/hooks/useSound';

export default function FocusMode() {
  const [minutes, setMinutes] = useState(25);
  const [ambient, setAmbient] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { play } = useSound();

  const timer = useTimer({
    initialTime: minutes * 60,
    onComplete: () => {
      notify('Focus session complete', { body: 'Great job! Take a short break.' });
      play('timer:end');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    },
  });

  useEffect(() => {
    // update duration when idle
    if (!timer.isActive) {
      timer.reset();
    }
  }, [minutes]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (ambient && timer.isActive && !timer.isPaused) {
      audioRef.current.volume = 0.2;
      audioRef.current.loop = true;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [ambient, timer.isActive, timer.isPaused]);

  const percent = useMemo(() => Math.round(timer.progress), [timer.progress]);

  return (
    <div className="fixed inset-0 bg-background z-40 pt-20 md:pt-24 overflow-auto">
      <div className="container mx-auto px-4 lg:px-6 pb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <h2 className="text-xl md:text-2xl font-bold mb-4">Focus Mode</h2>
              <div className="text-5xl md:text-6xl font-black mb-2">{timer.formatTime()}</div>
              <div className="text-xs md:text-sm text-muted-foreground mb-6">{percent}%</div>

              <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full sm:w-auto">
                <select className="bg-muted rounded px-3 py-2 w-full sm:w-auto" value={minutes} onChange={e => setMinutes(parseInt(e.target.value))} disabled={timer.isActive}>
                  {[15, 20, 25, 30, 45, 60].map(m => <option key={m} value={m}>{m} min</option>)}
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={ambient} onChange={e => setAmbient(e.target.checked)} /> Ambient sound
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {!timer.isActive ? (
                  <Button size="lg" className="w-full sm:w-auto" onClick={() => { play('timer:start'); timer.start(); }}><i className="fas fa-play mr-2"></i>Start</Button>
                ) : (
                  <>
                    <Button size="lg" className="w-full sm:w-auto" onClick={() => { play('timer:pause'); (timer.isPaused ? timer.resume : timer.pause)(); }}>
                      <i className={`fas fa-${timer.isPaused ? 'play' : 'pause'} mr-2`}></i>
                      {timer.isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => { play('timer:pause'); timer.stop(); }}><i className="fas fa-stop mr-2"></i>Stop</Button>
                  </>
                )}
              </div>

              <audio ref={audioRef} src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_7f0d1cebc2.mp3?filename=rain-ambient-110997.mp3" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
