// 초(예: 73.456) → "01:13.45" 같이 시간 포맷.
export function formatTime(seconds) {
  if (seconds == null || !isFinite(seconds)) return '--:--.--';
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  const cs = Math.floor((safe * 100) % 100);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}
