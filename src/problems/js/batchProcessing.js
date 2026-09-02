/*
  Design a batch processor with the following requirements:

  Triggering / flushing
  - Size-based flush: send as soon as the queue hits `batchSize`.
  - Time-based flush: if items trickle in slowly, flush whatever is queued
    after `timeout` ms so nothing waits forever.
  - Manual/forced flush: caller can force-send whatever is queued right now.
  - Max batch size cap: never send more than `maxBatchSize` items in one
    batch, even if more have queued up before a flush fires.
  - Reset/clear the pending timer whenever a size-based flush fires early,
    so a stale timeout doesn't also fire later on an empty/partial queue.

  Concurrency / ordering
  - Overlap handling: if a new batch would trigger while one is still
    executing, queue/wait for it - never throw or corrupt shared state.
  - Concurrency limit: cap how many batches can be in flight at once.
  - Backpressure: cap how large the queue can grow if producers outpace
    consumers (reject or block `addTask` beyond the cap).
  - Preserve input order in results where required by the caller.

  Result delivery
  - Per-item result resolution: each `addTask(item)` call returns a promise
    that resolves/rejects with that specific item's outcome.
  - Batch-level hook: notify when a whole batch has finished, with all
    results for that batch.

  Failure handling
  - Partial failure isolation: one item throwing/rejecting must not fail or
    hang the rest of the batch.
  - Retry logic (with backoff) for failed items.
  - Dead-letter items that repeatedly fail instead of blocking the queue.
  - Per-batch execution timeout so a hung task can't wedge the processor.

  Lifecycle
  - Graceful shutdown/drain: flush remaining items and clear all timers on
    `destroy()`/`close()` so nothing is lost and no handles leak.
  - Pause/resume without losing queued state.
  - Safe dynamic reconfiguration of batchSize/timeout at runtime.

  Observability
  - Expose metrics/hooks: actual batch size sent, latency, failure counts,
    current queue depth.
*/
const MAX_BATCH_SIZE = 5;
const DEFAULT_TIMEOUT = 10000; //ms

class BatchProcessing {
	constructor(batchSize = 1, maxBatchSize = MAX_BATCH_SIZE, timeout = DEFAULT_TIMEOUT) {
		this.batchSize = batchSize;
		this.maxBatchSize = maxBatchSize;
		this.queue = [];
		this.timeout = timeout;
		this.isExecuting = false;
	}

	addTask(cb) {
		if (Array.isArray(cb)) {
			console.log('add task as array');
			this.queue.push(...cb);
		} else {
			console.log('add single task');
			this.queue.push(cb);
		}
		this.executeBatch();
	}

	#execute() {
		let result = [];
		this.isExecuting = true;
		const toBeExecuted = this.queue.splice(0, this.batchSize);
		for (let i=0; i<toBeExecuted.length;i++) {
			if (toBeExecuted[i]) {
				const callback = toBeExecuted[i];
				const p = new Promise((resolve) => {
					const response = callback();
					resolve(response);
				});
				p.then((res) => {
					console.log(res);
					result.push(res);
				}).finally(() => {
					if (result.length === this.batchSize) {
						this.isExecuting = false;
						result = [];
					}
				});
			}
		}
		return result;
	}

	executeBatch() {
		if (this.isExecuting) {
			throw new Error('batch in progress');
		}
		if (this.queue.length >= this.batchSize) {
			console.log('executing batch');
			this.#execute();
		}
	}

	flush() {
		setTimeout(() => {
			this.#execute();
		}, this.timeout);
	}
}

const p1 = () => new Promise((res) => res('executed 1'));
const p2= () => new Promise((res) => res('executed 2'));
const p3 = () => new Promise((res) => res('executed 3'));
const p4 = () => new Promise((res) => res('executed 4'));
const p5 = () => new Promise((res) => res('executed 5'));
const p6 = () => new Promise((res) => res('executed 6'));

const batch = new BatchProcessing(3, 5);
batch.addTask(p1);
batch.addTask(p2);
batch.executeBatch();
batch.addTask([p3,p4,p5,p6]);
batch.executeBatch();
setTimeout(() => {
	batch.executeBatch();
}, 2000);