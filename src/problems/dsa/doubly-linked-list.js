/*
	Doubly linked list implementation
	operations
	- display
	- insert
	- pop
	- shift
	- unshift
*/

class Node {
  constructor(value) {
    this.value = value;
    this.next = null; // Pointer to the next node
    this.prev = null; // Pointer to the previous node
  }
}

class DoublyLinkedList {

	constructor() {
		this.head = null;
		this.tail = null;
	}

	display() {
		if (!this.head) {
			return null;
		}
		let temp = this.head;
		const arr = [];
		while(temp) {
			arr.push(temp.value);
			temp = temp.next;
		}
		return arr;
	}

	insert(value) {
		const newNode = new Node(value);
		if (!this.head) {
			this.head = newNode;
			this.tail = newNode;
		} else {
			this.tail.next = newNode;
			newNode.prev = this.tail;
			this.tail = newNode;
		}
		console.log('inserted', value);
	}

	/* delete from end */
	pop() {
		if (!this.tail) {
			return;
		} else if (this.head == this.tail) {
			this.head = null;
			this.tail = null;
		} else {
			const removedNode = this.tail;
			this.tail = removedNode.prev;
			this.tail.next = null;
			removedNode.prev = null;
			return removedNode.value;
		}
	}

	/* remove new node at starting */
	shift() {
		if (!this.head) return null;
		else if (this.head === this.tail) {
			this.head = null;
			this.tail = null;
		} else {
			const removedNode = this.head;
			this.head = removedNode.next;
			this.head.prev = null;
			removedNode.next = null;
			return removedNode.value;
		}
	}

	/* add new node at starting */
	unshift(value) {
		const newNode = new Node(value);
		if (!this.head) {
			this.head = newNode;
			this.tail = newNode;
		}
		this.head.prev = newNode;
		newNode.next = this.head;
		this.head = newNode;
	}
}

const list = new DoublyLinkedList();

// Test Adding Data
list.insert(20);       // [20]
list.insert(30);       // [20, 30]
list.unshift(10);    // [10, 20, 30]
console.log("Current List:", list.display()); // Output: [10, 20, 30]

// Test Removing Data
console.log("Popped:", list.pop());           // Output: 30
console.log("Shifted:", list.shift());       // Output: 10
console.log("Final List:", list.display());  // Output: [20]