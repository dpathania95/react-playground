/*
	LRU Cache
*/

class Node {
	constructor(key, value) {
		this.key = key;
		this.value = value;
		this.prev = null;
		this.next = null;
	}
}

class LRUCache {
	constructor(capacity) {
		this.capacity = capacity;
		this.hashMap = new Map();
		this.head = new Node('head');
		this.tail = new Node('tail');
		this.head.next = this.tail;
		this.tail.prev = this.head;
	}

	insertAfterHead(node) {
		if (this.head.next === this.tail) {
			this.head.next = node;
			node.next = this.tail;
			node.prev = this.head;
			this.tail.prev = node;
		} else {
			node.next = this.head.next;
			this.head.next.prev = node;
			node.prev = this.head;
			this.head.next = node;
		}
	}

	delete(node) {
		let prevNode = node.prev;
		let nextNode = node.next;
		prevNode.next = nextNode;
		nextNode.prev = prevNode;
	}

	put(key, value) {
		const node = this.hashMap.get(key);
		if (!node) {
			const newNode = new Node(key, value);
			if (this.hashMap.size < this.capacity) {
				this.insertAfterHead(newNode);
				this.hashMap.set(key, newNode);
			} else {
				this.hashMap.delete(this.tail.prev.key);
				this.delete(this.tail.prev);
				this.insertAfterHead(newNode);
				this.hashMap.set(key, newNode);

			}
		} else {
			node.value = value;
			this.delete(node);
			this.insertAfterHead(node);
		}
	}

	get(key) {
		const node = this.hashMap.get(key);
		if (node) {
			// console.log('before delete');
			// this.displayList();
			this.delete(node);
			// console.log('after dekete')
			// this.displayList();
			this.insertAfterHead(node);
			// console.log('after insert')
			// this.displayList();
			return node.value;
		}
		return -1;
	}

	displayList() {
		let temp = this.head;
		const arr = []
		while(temp) {
			arr.push([temp.key, temp.value]);
			temp = temp.next;
		}
		console.log(arr);
	}
}

const cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
// cache.displayList();
console.log(cache.get(1));
// cache.displayList();
cache.put(3, 3);
console.log(cache.get(2));
cache.put(4, 4);
console.log(cache.get(1));
console.log(cache.get(3));
console.log(cache.get(4));