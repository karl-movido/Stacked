const myLibrary = JSON.parse(localStorage.getItem('books')) || [
	{
		id: crypto.randomUUID(),
		title: 'The Housekeeper and the Professor',
		author: 'Yoko Ogawa',
		pages: 180,
		pagesRead: 143,
		status: 'reading',
		pinned: true,
	},
	{
		id: crypto.randomUUID(),
		title: 'The Hobbit',
		author: 'J.R.R. Tolkien',
		pages: 295,
		pagesRead: 0,
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

const $ = (id) => document.getElementById(id);

const addBookBtn = $('add-book');
const cancelBtn = $('add-cancel');
const addPanel = $('add-panel');
const addToShelf = $('add-to-shelf');
const filterTab = $('filter-bar');
const bookCard = $('book-card');
const shelf = document.getElementById('shelf');

// Form elements
const titleInput = document.getElementById('titleInput');
const authorInput = document.getElementById('authorInput');
const pagesInput = document.getElementById('pagesInput');
const statusInput = document.getElementById('statusInput');
const pagesRead = document.getElementById('pagesRead');

let activeFilter = 'all';
let formState = 'add';

// Toggle add panel
addBookBtn.addEventListener('click', () => {
	addPanel.classList.remove('hidden');
	addToShelf.innerText = 'Add to shelf';
	resetForm();
});

cancelBtn.addEventListener('click', () => {
	addPanel.classList.add('hidden');
	addToShelf.innerText = 'Add to shelf';
	document.querySelectorAll('.book-card').forEach((card) => {
		card.classList.remove('selected');
	});

	resetForm();
});

// Add to shelf handler
addToShelf.addEventListener('click', () => {
	addBookToLibrary();
	displayBooks(getFilteredBooks(activeFilter));
	updateCounters();
});

function handleCardContainerClick(event) {
	const editBtn = event.target.closest('.edit-btn');
	if (editBtn) {
		const card = editBtn.closest('.book-card');
		if (!card) return;

		const targetId = card.getAttribute('data-id');
		const cardIndex = myLibrary.findIndex((item) => item.id === targetId);
		if (cardIndex === -1) return;

		addPanel.classList.remove('hidden');

		const book = myLibrary.find((book) => book.id === targetId);

		// Assign book property values into the form
		titleInput.value = book.title;
		authorInput.value = book.author;
		pagesInput.value = book.pages;
		statusInput.value = book.status;
		pagesRead.value = book.pagesRead;

		// Update button text to "Update"
		addToShelf.innerText = 'Update';

		document.querySelectorAll('.book-card').forEach((card) => {
			card.classList.remove('selected');
		});

		card.classList.add('selected');
	}
}

// Filter tab click handler
filterTab.addEventListener('click', (event) => {
	const tab = event.target.closest('.filter-tab');
	if (!tab) return;

	const targetTab = tab.getAttribute('data-view');

	console.log(targetTab);
	console.log(activeFilter);

	if (targetTab === 'all') {
		activeFilter = 'all';
	} else if (targetTab === 'pinned') {
		activeFilter = 'pinned';
	} else if (targetTab === 'to-read') {
		activeFilter = 'to-read';
	} else if (targetTab === 'reading') {
		activeFilter = 'reading';
	} else if (targetTab === 'done') {
		activeFilter = 'done';
	}
	document.querySelectorAll('.filter-tab').forEach((tab) => {
		tab.classList.remove('active');
	});

	tab.classList.add('active');

	displayBooks(getFilteredBooks(activeFilter));
});

// Construct book and add to library
function addBookToLibrary() {
	const book = new Book(
		titleInput.value,
		authorInput.value,
		Number(pagesInput.value),
		statusInput.value,
		Number(pagesRead.value),
	);

	myLibrary.push(book);

	resetForm();

	localStorage.setItem('books', JSON.stringify(myLibrary));
}

// Display cards on the shelf
function displayBooks(books) {
	shelf.innerHTML = '';

	books.forEach((book) => {
		const card = createBookCard(book);
		shelf.appendChild(card);
	});

	updateCounters();

	lucide.createIcons();
}

// Create card for books
function createBookCard(book) {
	const card = document.createElement('article');

	card.classList.add('book-card');
	card.setAttribute('data-id', book.id);

	if (book.pinned) {
		card.classList.add('pinned');
	}

	card.classList.add(book.status);

	const progress = Math.round((book.pagesRead / book.pages) * 100);

	card.innerHTML = `
		<div class="pin-border"></div>
		<div class="card-top">
			<button class="edit-btn" id="edit-btn">
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
						<button class="page-display" id="pageDisplay">${book.pagesRead}</button>
						<input type="number" class="current-page-input hidden" id="pageInput" value="${book.pagesRead}" min="0" max="${book.pages}" />
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

// Get books according to filter
function getFilteredBooks(filter) {
	switch (filter) {
		case 'pinned':
			return myLibrary.filter((book) => book.pinned);

		case 'to-read':
			return myLibrary.filter((book) => book.status === 'to-read');

		case 'reading':
			return myLibrary.filter((book) => book.status === 'reading');

		case 'done':
			return myLibrary.filter((book) => book.status === 'done');

		default:
			return myLibrary;
	}
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

// Update counters on filter tabs
function updateCounters() {
	const countAll = $('allCounter');
	const countPinned = $('pinnedCounter');
	const countToRead = $('tbrCounter');
	const countReading = $('readingCounter');
	const countDone = $('doneCounter');

	const totalBooks = myLibrary.length;
	const totalPinned = getFilteredBooks('pinned').length;
	const totalToRead = getFilteredBooks('to-read').length;
	const totalReading = getFilteredBooks('reading').length;
	const totalDone = getFilteredBooks('done').length;

	console.log(totalBooks);

	if (countAll) countAll.innerText = totalBooks;
	if (countPinned) countPinned.innerText = totalPinned;
	if (countToRead) countToRead.innerText = totalToRead;
	if (countReading) countReading.innerText = totalReading;
	if (countDone) countDone.innerText = totalDone;
}

// Helper to reset form values
function resetForm() {
	titleInput.value = '';
	authorInput.value = '';
	pagesInput.value = '';
	statusInput.selectedIndex = 0;
	pagesRead.value = '';
}

shelf.addEventListener('click', handleCardContainerClick);

displayBooks(getFilteredBooks(activeFilter));
updateCounters();

lucide.createIcons();
