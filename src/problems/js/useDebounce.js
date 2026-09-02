import {useEffect, useState} from 'react';

function debounce(cb, delay=200) {
	let timeout;
	return function(...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			cb.apply(this, args);
		}, delay);
	}
}

export function useDebounced(value, delay=200) {
	const [debouncedValue, setDebouncedValue] = useState();

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			if (timeout) clearInterval(timeout);
		}
	}, [value, delay]);

	return debouncedValue;
}