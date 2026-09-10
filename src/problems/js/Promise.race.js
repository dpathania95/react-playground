/*
	return a promise with its first settle value;
*/

function PromiseRace(iterable = []) {
	return new Promise((resolve, reject) => {
		if (!iterable.length) {
			return;
		}
		for(let i=0; i<iterable.length;i++) {
			Promise.resolve(iterable[i]).then(resolve, reject);
		}
	});
}

const promise1 = new Promise((resolve, reject) => reject(1))
const promise2 = new Promise((resolve) => resolve(3))

// const promise1 = Promise.reject(1);
// const promise2 = Promise.resolve(3);

PromiseRace([promise1, promise2]).catch((value) => {
  console.log('value', value);
});

Promise.race([promise1, promise2]).catch((value) => {
  console.log('value11', value);
});