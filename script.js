const myLibrary = JSON.parse(localStorage.getItem('books')) || [
	new Book('Atomic Habits', 'James Clear', 320, 'Done', 320),
	new Book('The Hobbit', 'J.R.R. Tolkien', 310, 'Reading', 145),
	new Book('1984', 'George Orwell', 328, 'To Read', 0),
	new Book('The Psychology of Money', 'Morgan Housel', 256, 'Reading', 78),
	new Book('Dune', 'Frank Herbert', 688, 'To Read', 0),
	new Book('The Alchemist', 'Paulo Coelho', 208, 'Done', 208),
];

function Book(title, author, pages, status, pagesRead) {
	this.id = crypto.randomUUID();
	this.title = title;
	this.author = author;
	this.pages = pages;
	this.status = status;
	this.pagesRead = pagesRead;
}

const addBookBtn = document.getElementById('add-book');
const cancelBtn = document.getElementById('add-cancel');
const addPanel = document.getElementById('add-panel');
const addToShelf = document.getElementById('add-to-shelf');

// Toggle add panel
addBookBtn.addEventListener('click', () => {
	addPanel.classList.toggle('hidden');
});

cancelBtn.addEventListener('click', () => {
	addPanel.classList.add('hidden');
});

// Construct book and add to library
function addBookToLibrary() {
	const titleInput = document.getElementById('titleInput');
	const authorInput = document.getElementById('authorInput');
	const pagesInput = document.getElementById('pagesInput');
	const statusInput = document.getElementById('statusInput');
	const pagesRead = document.getElementById('pagesRead');

	const book = new Book(
		titleInput.value,
		authorInput.value,
		Number(pagesInput.value),
		statusInput.value,
		Number(pagesRead.value),
	);

	myLibrary.push(book);

	titleInput.value = '';
	authorInput.value = '';
	pagesInput.value = '';
	statusInput.selectedIndex = 0;
	pagesRead.value = '';

	localStorage.setItem('books', JSON.stringify(myLibrary));
}

// Add to shelf handler
addToShelf.addEventListener('click', () => {
	addBookToLibrary();
	console.log(myLibrary);
});
