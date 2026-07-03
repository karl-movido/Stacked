const myLibrary = JSON.parse(localStorage.getItem('books')) || [
	{
		id: crypto.randomUUID(),
		title: 'The Housekeeper and the Professor',
		author: 'Yoko Ogawa',
		pages: 180,
		currentPage: 67,
		status: 'reading',
		pinned: true,
	},
	{
		id: crypto.randomUUID(),
		title: 'The Hobbit',
		author: 'J.R.R. Tolkien',
		pages: 295,
		currentPage: 0,
		status: 'to-read',
		pinned: false,
	},
];

function Book(title, author, pages, status, pagesRead) {
	this.id = crypto.randomUUID();
	this.title = title;
	this.author = author;
	this.pages = pages;
	this.status = status;
	this.pagesRead = pagesRead;
	this.pinned = false;
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

// Display cards on the shelf
function displayBooks() {
	const shelf = document.getElementById('shelf');
	shelf.innerHTML = '';

	myLibrary.forEach((book) => {
		const card = createBookCard(book);
		shelf.appendChild(card);
	});
}

// Create card for books
function createBookCard(book) {
	const card = document.createElement('article');

	card.classList.add('book-card');

	if (book.pinned) {
		card.classList.add('pinned');
	}

	card.classList.add(book.status);

	const progress = Math.round((book.currentPage / book.pages) * 100);

	card.innerHTML = `
		<div class="pin-border"></div>
		<div class="card-top">
			<button class="edit-btn">
				<i data-lucide="square-pen"></i>
			</button>
		</div>
		<div class="card-body">
			<h3 class="title">${book.title}</h3>
			<p class="author"><span>by</span> ${book.author}</p>
			<div class="progress-wrap">
				<div class="progress-label">
					Page
					<span class="page-editor">
						<button class="page-display" id="pageDisplay">${book.currentPage}</button>
						<input type="number" class="current-page-input hidden" id="pageInput" value="${book.currentPage}" min="0" max="${book.pages}" />
					</span>
					of ${book.pages} pages
				</div>
				<div class="progress-bar"><div class="progress-bar-fill" style="width: ${progress}%"></div></div>
			</div>
			<div class="card-actions">
				<button class="pin-btn">
					<i data-lucide="bookmark"></i>
				</button>
				<button class="done-btn">
					<i data-lucide="check"></i>
				</button>
				<button class="status-btn ${book.status}">${formatStatus(book.status)}</button>
			</div>
		</div>
	`;

	return card;
}

// Format helper for status button
function formatStatus(status) {
	switch (status) {
		case 'to-read':
			return 'To read';

		case 'reading':
			return 'Reading';

		case 'done':
			return 'Done';
	}
}

displayBooks();

lucide.createIcons();
