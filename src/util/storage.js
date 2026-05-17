// 난이도별 베스트 클리어 시간을 localStorage 에 저장/조회.
const BEST_TIME_PREFIX = 'best_time_';

export function loadBestTime(difficultyId) {
  try {
    const raw = localStorage.getItem(BEST_TIME_PREFIX + difficultyId);
    if (!raw) return null;
    const n = parseFloat(raw);
    return isFinite(n) ? n : null;
  } catch (_) {
    return null;
  }
}

export function saveBestTime(difficultyId, time) {
  try {
    localStorage.setItem(BEST_TIME_PREFIX + difficultyId, String(time));
  } catch (_) {}
}

// time이 기존 베스트보다 빠르면 저장하고 true 반환.
export function tryUpdateBestTime(difficultyId, time) {
  const prev = loadBestTime(difficultyId);
  if (prev == null || time < prev) {
    saveBestTime(difficultyId, time);
    return true;
  }
  return false;
}
