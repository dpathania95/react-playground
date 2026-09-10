/*
	returns a promise which fulfills when all promises fulfills with array of fulfillment value.
	If any one promise rejects, it rejects immediately with first rejection.
	when empty array is passed, it resolves to empty array.
*/

function PromiseAll(iterable = []) {
	return new Promise((resolve, reject) => {
		let result = [];
		let resolved = 0;
		if (!iterable.length) return resolve(result);
		for (let i=0;i<iterable.length;i++) {
			const promise = iterable[i];
			if (promise instanceof Promise) {
				promise.then((value) => {
					resolved++;
					result[i]=value;
				}).catch((err) => {
					reject(err);
				}).finally(() => {
					if (resolved === iterable.length) {
						resolve(result);
					}
				})
			} else {
				resolved++;
				result[i] = promise;
			}
		}
		if (resolved === iterable.length) {
			resolve(result);
		}
	});
}

const promise1 = Promise.reject(3);
const promise2 = 42;
const promise3 = new Promise((resolve) => {
  setTimeout(resolve, 100, "foo");
});

PromiseAll([promise1, promise2, promise3]).then((values) => {
  console.log(values);
}).catch((err) => console.log(err));