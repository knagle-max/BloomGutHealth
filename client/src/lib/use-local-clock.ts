import { useEffect, useState } from 'react';
/** Read-only clock invalidation; no form dates, records or provider requests are changed. */
export function useLocalClock() {
  const [, redraw] = useState(0);
  useEffect(() => {
    let timer: number | undefined, stopped = false;
    const clear = () => { if (timer !== undefined) window.clearTimeout(timer); timer = undefined; };
    const update = () => {
      clear();
      if (stopped || document.visibilityState === 'hidden') return;
      redraw(value => value + 1);
      timer = window.setTimeout(update, 60000 - Date.now() % 60000 + 5);
    };
    const visible = () => { if (document.visibilityState === 'hidden') clear(); else update(); };
    update();
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', visible);
    return () => { stopped = true; clear(); window.removeEventListener('focus', update); document.removeEventListener('visibilitychange', visible); };
  }, []);
  // A mutation/query render must use its current instant, not the preceding minute's tick.
  return new Date();
}
