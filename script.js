class Book {
	constructor(title, author, pages, status, pagesRead, pinned = false, id = crypto.randomUUID()) {
		this.id = id;
		this.title = title;
		this.author = author;
		this.pages = pages;
		this.status = status;
		this.pagesRead = pagesRead;
		this.pinned = pinned;
	}

	togglePinned() {
		this.pinned = !this.pinned;
	}

	toggleDone() {
		if (this.status === 'done') {
			this.status = 'reading';
		} else {
			this.status = 'done';
			this.updateProgressBar();
		}
	}

	toggleReadingStatus() {
		if (this.status === 'done') {
			this.status = 'reading';
		} else if (this.status === 'reading') {
			this.status = 'to-read';
		} else {
			this.status = 'reading';
		}
	}

	updateProgressBar() {
		if (this.status === 'done') {
			this.pagesRead = this.pages;
		} else if (this.status === 'to-read') {
			this.pagesRead = 0;
		}
	}

	updatePage(value) {
		this.pagesRead = Number(value);
	}
}

const savedBooks = JSON.parse(localStorage.getItem('books'));

const myLibrary = savedBooks
	? savedBooks.map((book) => {
			new Book(book.title, book.author, book.pages, book.status, book.pagesRead, book.pinned, book.id);
		})
	: [
			new Book('The Housekeeper and the Professor', 'Yoko Ogawa', 180, 'reading', 143, true),
			new Book('The Hobbit', 'J.R.R. Tolkien', 295, 'to-read', 0),
		];

const $ = (id) => document.getElementById(id);

const addBookBtn = $('add-book');
const cancelBtn = $('add-cancel');
const addPanel = $('add-panel');
const addToShelf = $('add-to-shelf');
const filterTab = $('filter-bar');
const bookCard = $('book-card');
const statusBtn = $('status-btn');
const pageDisplay = $('page-display');
const searchInput = $('search-input');
const shelf = document.getElementById('shelf');

// Form elements
const titleInput = document.getElementById('titleInput');
const authorInput = document.getElementById('authorInput');

const statusInput = document.getElementById('statusInput');
const pagesRead = document.getElementById('pagesRead');

let activeFilter = 'all';
let editingBookId = null;
let searchQuery = '';

// ----- HANDLERS -----

// Toggle add panel
addBookBtn.addEventListener('click', () => {
	openFormPanel();
	addToShelf.innerText = 'Add to shelf';
	resetForm();
});

cancelBtn.addEventListener('click', () => {
	closeFormPanel();
	addToShelf.innerText = 'Add to shelf';
	document.querySelectorAll('.book-card').forEach((card) => {
		card.classList.remove('selected');
	});

	editingBookId = null;

	resetForm();
});

// Add to shelf handler
addToShelf.addEventListener('click', () => {
	submitForm();
	displayBooks(getFilteredBooks(activeFilter));
	updateCounters();
});

// Filter tab click handler
filterTab.addEventListener('click', (event) => {
	const tab = event.target.closest('.filter-tab');
	if (!tab) return;

	const targetTab = tab.getAttribute('data-view');

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

// Search query
searchInput.addEventListener('input', () => {
	searchQuery = searchInput.value.trim().toLowerCase();

	renderApp();
});

// ------ MAIN FUNCTIONS -------

// Render app
function renderApp() {
	const filteredBooks = getFilteredBooks(activeFilter);
	const searchedBooks = searchBooks(filteredBooks);
	displayBooks(searchedBooks);
	updateCounters();
}

// Handle action buttons within cards
function handleCardContainerClick(event) {
	// Edit button
	const editBtn = event.target.closest('.edit-btn');
	if (editBtn) {
		const card = editBtn.closest('.book-card');
		if (!card) return;

		const targetId = card.getAttribute('data-id');

		openFormPanel();

		const book = myLibrary.find((book) => book.id === targetId);

		// Assign book property values into the form
		populateForm(book);

		editingBookId = book.id;

		// Update button text to "Update"
		addToShelf.innerText = 'Update';
		document.querySelectorAll('.book-card').forEach((card) => {
			card.classList.remove('selected');
		});

		card.classList.add('selected');
	}

	// Bookmark button
	const pinBtn = event.target.closest('.pin-btn');
	if (pinBtn) {
		const card = pinBtn.closest('.book-card');
		if (!card) return;

		const targetId = card.getAttribute('data-id');

		const book = myLibrary.find((book) => book.id === targetId);

		book.togglePinned();

		saveToLocalStorage();
		renderApp();
	}

	// Done button
	const doneBtn = event.target.closest('.done-btn');
	if (doneBtn) {
		const card = doneBtn.closest('.book-card');
		if (!card) return;

		const targetId = card.getAttribute('data-id');

		const book = myLibrary.find((book) => book.id === targetId);

		book.toggleDone();

		saveToLocalStorage();
		renderApp();
	}

	// Status button
	const statusBtn = event.target.closest('.status-btn');
	if (statusBtn) {
		const card = statusBtn.closest('.book-card');
		if (!card) return;

		const targetId = card.getAttribute('data-id');

		const book = myLibrary.find((book) => book.id === targetId);

		book.toggleReadingStatus();
		book.updateProgressBar();

		saveToLocalStorage();
		renderApp();
	}

	const pageDisplay = event.target.closest('.page-display');
	if (pageDisplay) {
		const card = pageDisplay.closest('.book-card');
		if (!card) return;

		const pageEditor = pageDisplay.closest('.page-editor');
		const pageEdit = pageEditor.querySelector('.page-edit');
		const pageInput = pageEditor.querySelector('.current-page-input');

		const targetId = card.getAttribute('data-id');
		const book = myLibrary.find((book) => book.id === targetId);

		pageDisplay.classList.add('hidden');
		pageEdit.classList.remove('hidden');

		pageInput.value = book.pagesRead;
	}

	const confirmPage = event.target.closest('.confirm-edit.update');
	if (confirmPage) {
		const card = confirmPage.closest('.book-card');
		if (!card) return;

		const pageEditor = confirmPage.closest('.page-editor');
		const pageEdit = pageEditor.querySelector('.page-edit');
		const pageDisplay = pageEditor.querySelector('.page-display');
		const pageInput = pageEditor.querySelector('.current-page-input');

		const targetId = card.getAttribute('data-id');

		const book = myLibrary.find((book) => book.id === targetId);

		book.updatePage(pageInput.value);

		pageDisplay.classList.remove('hidden');
		pageEdit.classList.add('hidden');

		saveToLocalStorage();
		renderApp();
	}

	const cancelPage = event.target.closest('.confirm-edit.cancel');
	if (cancelPage) {
		const card = cancelPage.closest('.book-card');
		if (!card) return;

		const pageEditor = cancelPage.closest('.page-editor');
		const pageEdit = pageEditor.querySelector('.page-edit');
		const pageDisplay = pageEditor.querySelector('.page-display');

		pageDisplay.classList.remove('hidden');
		pageEdit.classList.add('hidden');
	}

	const delBtn = event.target.closest('.del-btn');
	if (delBtn) {
		const card = delBtn.closest('.book-card');

		const targetId = card.getAttribute('data-id');

		deleteBook(targetId);
	}
}

// Construct book and add to library
function addBookToLibrary(bookData) {
	const book = new Book(
		bookData.title,
		bookData.author,
		Number(bookData.pages),
		bookData.status,
		Number(bookData.pagesRead),
	);

	myLibrary.push(book);

	resetForm();

	// Filter tab click handler
	filterTab.addEventListener('click', (event) => {
		const tab = event.target.closest('.filter-tab');
		if (!tab) return;

		const targetTab = tab.getAttribute('data-view');

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
			<button class="del-btn" id="del-btn">
				<i data-lucide="trash"></i>
			</button>
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
						<button class="page-display " id="pageDisplay">${book.pagesRead}</button>
						<span class="page-edit hidden" id="page-edit">
							<input type="number" class="current-page-input" id="pageInput" value="${book.pagesRead}" min="0" max="${book.pages}" />
							<button class="confirm-edit update" >Confirm</button>
							<button class="confirm-edit cancel" >Cancel</button>
						</span>
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
				<button class="status-btn ${book.status}" id="status-btn">${formatStatus(book.status)}</button>
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

// Update values of selected book
function updateBook(id, bookData) {
	const book = myLibrary.find((book) => book.id === id);
	if (!book) return;

	book.title = bookData.title;
	book.author = bookData.author;
	book.pages = bookData.pages;
	book.status = bookData.status;
	book.pagesRead = bookData.pagesRead;

	saveToLocalStorage();
	renderApp();
}

function searchBooks(books) {
	return books.filter(
		(book) => book.title.toLowerCase().includes(searchQuery) || book.author.toLowerCase().includes(searchQuery),
	);
}

// ----- HELPERS -----

// Helper to decide whether to add or update
function submitForm() {
	const bookData = {
		title: titleInput.value,
		author: authorInput.value,
		pages: Number(pagesInput.value),
		status: statusInput.value,
		pagesRead: Number(pagesRead.value),
	};

	if (editingBookId === null) {
		addBookToLibrary(bookData);
	} else {
		updateBook(editingBookId, bookData);
		editingBookId = null;
	}

	saveToLocalStorage();

	renderApp();
	resetForm();
	closeFormPanel();
}

// Helper to reset form values
function resetForm() {
	titleInput.value = '';
	authorInput.value = '';
	pagesInput.value = '';
	statusInput.selectedIndex = 0;
	pagesRead.value = '';
}

// Assign currently selected book properties to the form
function populateForm(book) {
	titleInput.value = book.title;
	authorInput.value = book.author;
	pagesInput.value = book.pages;
	statusInput.value = book.status;
	pagesRead.value = book.pagesRead;
}

// Open the add panel
function openFormPanel() {
	addPanel.classList.remove('hidden');
}

// Close the add panel
function closeFormPanel() {
	addPanel.classList.add('hidden');
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

	if (countAll) countAll.innerText = totalBooks;
	if (countPinned) countPinned.innerText = totalPinned;
	if (countToRead) countToRead.innerText = totalToRead;
	if (countReading) countReading.innerText = totalReading;
	if (countDone) countDone.innerText = totalDone;
}

// Toggle pin button

function deleteBook(id) {
	const bookIndex = myLibrary.findIndex((book) => book.id === id);

	myLibrary.splice(bookIndex, 1);

	saveToLocalStorage();
	renderApp();
}

// Save to localStorage
function saveToLocalStorage() {
	localStorage.setItem('books', JSON.stringify(myLibrary));
}

shelf.addEventListener('click', handleCardContainerClick);

renderApp();

lucide.createIcons();
