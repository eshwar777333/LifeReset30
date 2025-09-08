import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type SoundKey =
  | 'timer:start'
  | 'timer:pause'
  | 'timer:end'
  | 'task:complete'
  | 'day:complete'
  | 'error'
  | 'save';

type Ctx = {
  enabled: boolean;
  toggle: () => void;
  play: (key: SoundKey) => void;
};

const SoundCtx = createContext<Ctx | null>(null);

function createAudioContext() {
  const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
  return AC ? new AC() : null;
}

function env(gainNode: GainNode, ctx: AudioContext, attack = 0.005, decay = 0.15, peak = 0.9, sustain = 0.0001) {
  const now = ctx.currentTime;
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(0.000001, now);
  gainNode.gain.linearRampToValueAtTime(peak, now + attack);
  gainNode.gain.exponentialRampToValueAtTime(sustain, now + attack + decay);
}

function playTone(ctx: AudioContext, freq: number, duration = 0.15, type: OscillatorType = 'sine', gainDb = -10) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const vol = Math.pow(10, gainDb / 20);
  o.type = type;
  o.frequency.value = freq;
  o.connect(g);
  g.connect(ctx.destination);
  env(g, ctx, 0.005, Math.max(0.08, duration - 0.02), vol, 0.0001);
  o.start();
  o.stop(ctx.currentTime + duration + 0.05);
}

function glide(ctx: AudioContext, from: number, to: number, duration = 0.18, type: OscillatorType = 'sine', gainDb = -8) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const vol = Math.pow(10, gainDb / 20);
  o.type = type;
  o.frequency.setValueAtTime(from, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, to), ctx.currentTime + duration);
  o.connect(g);
  g.connect(ctx.destination);
  env(g, ctx, 0.005, Math.max(0.1, duration - 0.02), vol, 0.0001);
  o.start();
  o.stop(ctx.currentTime + duration + 0.05);
}

function chord(ctx: AudioContext, freqs: number[], duration = 0.5, gainDb = -6) {
  const vol = Math.pow(10, gainDb / 20) / Math.max(1, freqs.length);
  const now = ctx.currentTime;
  freqs.forEach(f => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = f;
    o.connect(g);
    g.connect(ctx.destination);
    env(g, ctx, 0.005, duration - 0.05, vol, 0.0001);
    o.start(now);
    o.stop(now + duration + 0.05);
  });
}

function shimmer(ctx: AudioContext, seq: number[] = [1200, 1600, 2000], step = 0.12) {
  const now = ctx.currentTime;
  seq.forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = f;
    o.connect(g);
    g.connect(ctx.destination);
    const t0 = now + i * step;
    g.gain.setValueAtTime(0.000001, t0);
    g.gain.linearRampToValueAtTime(0.5, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + step);
    o.start(t0);
    o.stop(t0 + step + 0.05);
  });
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem('ep-sound-enabled') || 'true'); } catch { return true; }
  });
  const ctxRef = useRef<AudioContext | null>(null);
  const resumedRef = useRef(false);

  // Lazy create AudioContext on first play to satisfy autoplay policies
  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = createAudioContext();
    const ctx = ctxRef.current;
    if (ctx && ctx.state === 'suspended' && !resumedRef.current) {
      ctx.resume().catch(() => {});
      resumedRef.current = true;
    }
    return ctx;
  }, []);

  useEffect(() => {
    try { localStorage.setItem('ep-sound-enabled', JSON.stringify(enabled)); } catch {}
  }, [enabled]);

  const play = useCallback((key: SoundKey) => {
    if (!enabled) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    switch (key) {
      case 'timer:start':
        playTone(ctx, 800, 0.12, 'square', -10);
        break;
      case 'timer:pause':
        playTone(ctx, 500, 0.08, 'sine', -12);
        break;
      case 'timer:end':
        chord(ctx, [660, 880, 1320], 0.55, -6);
        break;
      case 'task:complete':
        glide(ctx, 1200, 880, 0.18, 'sine', -8);
        break;
      case 'day:complete':
        shimmer(ctx);
        break;
      case 'error':
        playTone(ctx, 140, 0.16, 'square', -10);
        break;
      case 'save':
        playTone(ctx, 900, 0.08, 'triangle', -12);
        break;
    }
  }, [enabled, ensureCtx]);

  const toggle = useCallback(() => setEnabled(e => !e), []);

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play]);
  return <SoundCtx.Provider value={value}>{children}</SoundCtx.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundCtx);
  if (!ctx) throw new Error('useSound must be used within SoundProvider');
  return ctx;
}
