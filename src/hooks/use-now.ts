/**
 * 即時時刻 hook:定時更新 now,驅動現在線/時鐘指針重繪。
 * 間隔預設 30 秒(分鐘級精確度已足夠,避免高頻重繪)。
 */
import { useEffect, useState } from 'react';

export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
