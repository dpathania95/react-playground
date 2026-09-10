/*
	Returns a promise having fulfillment value of first promise.
	It rejects when all promises reject including empty array with Aggregate Error.
*/

function PromiseAny(iterable=[]) {
	return new Promise((resolve, reject) => {
		if (!iterable?.length) {
			reject(new AggregateError([], 'All promises were rejected'));
		}
		let nonPromiseCount = 0;
		let rejected=0;
		let resolveIndex = -1;
		for (let i=0;i<iterable.length;i++) {
			const promise = iterable[i];
			if (promise instanceof Promise) {
				promise.then((value) => {
					if (resolveIndex < i && resolveIndex !== -1) {
						resolve(iterable[resolveIndex]);
					} else {
						resolve(value);
					}
				}).catch(() => {
					rejected++;
				}).finally(() => {
					if (rejected === iterable.length) {
						reject(new AggregateError('All promises were rejected'));
					}
				})
			} else {
				nonPromiseCount++;
				if (resolveIndex === -1) {
					resolveIndex = i;
				}
			}
		}
		if (nonPromiseCount === iterable.length) {
			resolve(iterable[0]);
		}
	});
}

const p0 = 1
const p1 = Promise.resolve(2);
const p2 = 3;


const promises = [p0, p1, p2];

PromiseAny(promises).then((value) => console.log(value));