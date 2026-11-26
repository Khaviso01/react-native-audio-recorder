// Formatting helpers for zero-padded time strings, millisecond durations, and compact timestamps
const pad = (n: number): string => String(n).padStart(2, '0');

// Format milliseconds as M:SS or HH:MM:SS (when long is true or duration reaches at least one hour)
export const fmt = (ms: number = 0, long: boolean = false): string => {
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return long || h ? `${pad(h)}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
};

// Format a Unix epoch timestamp into a concise locale date and time string
export const when = (t: number): string =>
  new Date(t).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
