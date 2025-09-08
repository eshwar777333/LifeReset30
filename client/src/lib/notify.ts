export async function ensurePermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const p = await Notification.requestPermission();
    return p === 'granted';
  }
  return false;
}

export async function notify(title: string, options?: NotificationOptions) {
  const ok = await ensurePermission();
  if (!ok) return;
  try {
    new Notification(title, { silent: true, ...options });
  } catch {}
}

// schedule a one-shot notification using setTimeout (best-effort; resets on reload)
export async function scheduleIn(ms: number, title: string, options?: NotificationOptions) {
  const ok = await ensurePermission();
  if (!ok) return () => {};
  const id = setTimeout(() => notify(title, options), ms);
  return () => clearTimeout(id);
}
