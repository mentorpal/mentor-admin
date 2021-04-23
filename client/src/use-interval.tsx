import React from "react";

interface CancellableFunc {
  (isCancelled: () => boolean): void;
}

export function useInterval(callback: CancellableFunc, delay: number | null) {
  const savedCallback = React.useRef<CancellableFunc>();
  React.useEffect(() => {
    savedCallback.current = callback;
  });
  React.useEffect(() => {
    let mounted = true;
    function tick() {
      if (!mounted) {
        return;
      }
      if (savedCallback.current) {
        savedCallback.current(() => {
          return !mounted;
        });
      }
    }
    if (delay) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
    return () => {
      mounted = false;
    };
  }, [delay]);
}

export default useInterval;
