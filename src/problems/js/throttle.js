import { useEffect, useState, useRef } from "react";

function throttle(cb, delay=400) {
	let wait = false;
	return function(...args) {
		if (wait) return;
		cb.apply(this, args);
		wait = true;
		setTimeout(() => wait=false, delay);
	}
}

export function useThrottle(value, delay=400) {
	const [throttledValue, setThrottledValue] = useState(value);
	const lastExecuted = useRef(Date.now());

	useEffect(() => {
    const handler = setTimeout(() => {
      const now = Date.now();
      const timeElapsed = now - lastExecuted.current;

      if (timeElapsed >= delay) {
        setThrottledValue(value);
        lastExecuted.current = now;
      }
    }, delay - (Date.now() - lastExecuted.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

	return throttledValue;
}