/*
  Returns a promise which fulfills with array of settled values which is an object
  {
    status: 'fulfilled' | 'rejected',
    value: '' -> incase of fulfilled,
    reason: '' -> incase of rejected,
  }
  It does not reject.
  Upon passing empty array or null value, it resolves with empty array.
*/

function promiseAllSettled(iterable) {
  return new Promise((resolve) => {
    let result = [];
		let settledCount = 0;
    if (!iterable || iterable.length === 0) {
      resolve(result);
    }
    for (let i=0;i<iterable.length;i++) {
      const promise = iterable[i];
      if (promise instanceof Promise) {
        promise.then((value) => {
          result[i] = {status: 'fulfilled', value};
        }).catch((err) => {
          result[i] = {status: 'rejected', reason: err};
        }).finally(() => {
					settledCount++;
          if (settledCount===iterable.length) {
            resolve(result);
          }
        })
      } else {
				settledCount++;
        result[i] = {status: 'fulfilled', value: promise};
      }
    }
    if (settledCount === iterable.length) {
      resolve(result);
    }
  })
}
const p0 = new Promise((resolve) => {
          setTimeout(() => {
            resolve(2);
          }, 10);
        });
const p1 = Promise.resolve(3);
const p2 = 4;
promiseAllSettled([p0,p1,p2]).then((data) => {
	console.log(data);
})