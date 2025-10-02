// ratings-reviews.js
// Full script with filtered pagination, search/filters, sorting, and robust Prev/Next handling

// =========================
// API Configuration
// =========================
const API_BASE = 'https://68c8b85aceef5a150f622643.mockapi.io';
const RATINGS_REVIEWS_ENDPOINT = `${API_BASE}/admin/8`;

// =========================
/* Global State */
// =========================
let ratingsReviewsData = [];    // raw source from API
let filteredData = [];          // current working set after filters
let currentReviewId = null;     // modal context

// Pagination state (operates on filteredData)
let currentPage = 1;
let itemsPerPage = 10;

// Filter/sort state
const filterState = {
  search: '',
  status: 'unread', // 'all' | 'unread' | 'read'
  minRating: null,  // number or null
  maxRating: null,  // number or null
  dateFrom: null,   // ISO string 'YYYY-MM-DD' or null
  dateTo: null,     // ISO string or null
  sortBy: 'date',   // 'date' | 'rating' | 'userName' | 'roomType' | 'roomNo'
  sortDir: 'desc'   // 'asc' | 'desc'
};

// =========================
/* DOM elements (initialized on DOMContentLoaded) */
// =========================
let loadingIndicator, tableContainer, tableBody, noDataMessage, deleteAllBtn;
let reviewModal, closeReviewModalBtnIcon, closeReviewModalBtn, deleteReviewFromModal;

// Optional filter controls (if present in HTML)
let searchInput, statusFilter, minRatingInput, maxRatingInput, dateFromInput, dateToInput, sortBySelect, sortDirSelect;

// =========================
// Utilities
// =========================
function showLoading() {
  loadingIndicator?.classList.remove('hidden');
  tableContainer?.classList.add('hidden');
  noDataMessage?.classList.add('hidden');
}

function showNoData() {
  loadingIndicator?.classList.add('hidden');
  tableContainer?.classList.add('hidden');
  noDataMessage?.classList.remove('hidden');
}

function showTable() {
  loadingIndicator?.classList.add('hidden');
  tableContainer?.classList.remove('hidden');
  noDataMessage?.classList.add('hidden');
}

function generateStarRating(rating) {
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      starsHtml += '<svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    } else {
      starsHtml += '<svg class="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    }
  }
  return starsHtml;
}

// Safe parse helpers
function parseNumber(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}
function parseDateOnly(v) {
  // Expect 'YYYY-MM-DD'
  if (!v) return null;
  const dt = new Date(v + 'T00:00:00');
  return isNaN(dt.getTime()) ? null : dt;
}

// Debounce
function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// =========================
// Filtering and sorting
// =========================
function applyFiltersAndSort() {
  // Start from full dataset
  let arr = Array.isArray(ratingsReviewsData) ? [...ratingsReviewsData] : [];

  // Status filter
  if (filterState.status === 'unread') {
    arr = arr.filter((r) => !r.read);
  } else if (filterState.status === 'read') {
    arr = arr.filter((r) => !!r.read);
  }

  // Text search across fields
  const term = (filterState.search || '').toLowerCase().trim();
  if (term) {
    arr = arr.filter((r) => {
      const hay = [
        r.userName,
        r.roomType,
        r.roomNo,
        r.description,
        r.status
      ].map((x) => String(x ?? '').toLowerCase());
      return hay.some((s) => s.includes(term));
    });
  }

  // Rating range
  const minR = parseNumber(filterState.minRating);
  const maxR = parseNumber(filterState.maxRating);
  if (minR != null) arr = arr.filter((r) => parseFloat(r.rating) >= minR);
  if (maxR != null) arr = arr.filter((r) => parseFloat(r.rating) <= maxR);

  // Date range (assumes review.date is parsable or 'YYYY-MM-DD')
  const from = parseDateOnly(filterState.dateFrom);
  const to = parseDateOnly(filterState.dateTo);
  if (from) arr = arr.filter((r) => {
    const d = new Date(r.date);
    if (isNaN(d.getTime())) return false;
    return d >= from;
  });
  if (to) arr = arr.filter((r) => {
    const d = new Date(r.date);
    if (isNaN(d.getTime())) return false;
    // inclusive end-of-day
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    return d <= end;
  });

  // Sorting
  const dir = filterState.sortDir === 'asc' ? 1 : -1;
  const by = filterState.sortBy;
  arr.sort((a, b) => {
    let av, bv;
    switch (by) {
      case 'rating':
        av = parseFloat(a.rating) || 0; bv = parseFloat(b.rating) || 0;
        break;
      case 'userName':
        av = String(a.userName || '').toLowerCase(); bv = String(b.userName || '').toLowerCase();
        break;
      case 'roomType':
        av = String(a.roomType || '').toLowerCase(); bv = String(b.roomType || '').toLowerCase();
        break;
      case 'roomNo':
        av = String(a.roomNo || '').toLowerCase(); bv = String(b.roomNo || '').toLowerCase();
        break;
      case 'date':
      default:
        av = new Date(a.date).getTime() || 0; bv = new Date(b.date).getTime() || 0;
        break;
    }
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });

  // Apply to filteredData and reset pagination
  filteredData = arr;
  initializePagination(filteredData);
}

// =========================
// Pagination helpers (filteredData as source of truth)
// =========================
function totalPages() {
  const total = filteredData.length;
  return total > 0 ? Math.ceil(total / itemsPerPage) : 0;
}

function updateButtonStyles(button, isDisabled) {
  if (!button) return;
  if (isDisabled) {
    button.classList.add('opacity-40', 'cursor-not-allowed');
    button.classList.remove('hover:border-primary', 'hover:text-primary');
    button.setAttribute('aria-disabled', 'true');
  } else {
    button.classList.remove('opacity-40', 'cursor-not-allowed');
    button.classList.add('hover:border-primary', 'hover:text-primary');
    button.removeAttribute('aria-disabled');
  }
}

function updatePagination() {
  const totalItems = filteredData.length;
  const pages = totalPages();

  // Clamp current page
  if (pages === 0) currentPage = 0;
  else if (currentPage < 1) currentPage = 1;
  else if (currentPage > pages) currentPage = pages;

  document.getElementById('currentPageNumber').textContent = totalItems > 0 ? currentPage : 0;
  document.getElementById('totalPages').textContent = pages;

  // Buttons
  const prevButton = document.getElementById('prevPage');
  const nextButton = document.getElementById('nextPage');

  const disablePrev = currentPage <= 1 || pages === 0;
  const disableNext = currentPage >= pages || pages === 0;

  if (prevButton) prevButton.disabled = disablePrev;
  if (nextButton) nextButton.disabled = disableNext;

  updateButtonStyles(prevButton, disablePrev);
  updateButtonStyles(nextButton, disableNext);

  // Toggle containers
  if (totalItems === 0) {
    showNoData();
  } else {
    showTable();
  }
}

function initializePagination(data) {
  // Keep filteredData as the working set
  filteredData = Array.isArray(data) ? data : [];
  currentPage = filteredData.length > 0 ? 1 : 0;
  updatePagination();
  if (filteredData.length > 0) renderTable();
}

// Render only the current page slice of filteredData
function renderTable() {
  if (!tableBody) return;

  const total = filteredData.length;
  if (total === 0) {
    tableBody.innerHTML = '';
    showNoData();
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, total);
  const pageData = filteredData.slice(startIndex, endIndex);

  tableBody.innerHTML = '';

  pageData.forEach((review) => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50';
    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${review.id}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${review.userName}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${review.roomType}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${review.roomNo}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${review.date}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div class="flex items-center">
          ${generateStarRating(review.rating)}
          <span class="ml-2 text-yellow-600 font-medium">${review.rating}</span>
        </div>
      </td>
      <td class="px-6 py-4 text-sm text-gray-600 max-w-xs">
        <p class="line-clamp-2">${review.description}</p>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div class="flex gap-3">
          <button class="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors view-btn" title="View" aria-label="View review" data-id="${review.id}">
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button class="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors delete-btn" title="Delete" aria-label="Delete review" data-id="${review.id}">
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// =========================
/* API helpers */
// =========================
async function updateApiData(updatedData) {
  const response = await fetch(RATINGS_REVIEWS_ENDPOINT, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 8, 'ratings-reviews': updatedData })
  });
  if (!response.ok) throw new Error(`Failed to update data: ${response.status}`);
  return response.json();
}

// =========================
// Data operations
// =========================
function fetchRatingsReviews() {
  showLoading();

  fetch(RATINGS_REVIEWS_ENDPOINT)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      // API may return { "ratings-reviews": [...] } or raw array
      ratingsReviewsData = data['ratings-reviews'] || data || [];
      applyFiltersAndSort(); // computes filteredData and initializes pagination
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      showNoData();
    });
}

async function deleteReviewFromApi(reviewId) {
  try {
    const updatedReviews = ratingsReviewsData.filter((review) => String(review.id) !== String(reviewId));
    await updateApiData(updatedReviews);
    ratingsReviewsData = updatedReviews;
    applyFiltersAndSort(); // refresh list respecting current filters and pagination
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    alert('Failed to delete review. Please try again.');
    return false;
  }
}

async function deleteAllReviews() {
  if (filteredData.length === 0) {
    alert('No reviews to delete.');
    return;
  }
  if (!confirm('Are you sure you want to delete all visible reviews? This action cannot be undone.')) return;

  try {
    // Keep only those not in filteredData (delete all visible)
    const remaining = ratingsReviewsData.filter((r) => !filteredData.some((f) => String(f.id) === String(r.id)));
    await updateApiData(remaining);
    ratingsReviewsData = remaining;
    applyFiltersAndSort();
  } catch (error) {
    console.error('Error deleting all reviews:', error);
  }
}

// =========================
// Modal
// =========================
function openReviewModal(reviewId) {
  const numericId = parseInt(reviewId, 10);
  const review = filteredData.find((r) => parseInt(r.id, 10) === numericId);
  if (!review) return;

  currentReviewId = numericId;

  const modalUserName = document.getElementById('modalUserName');
  const modalDate = document.getElementById('modalDate');
  const modalRoomType = document.getElementById('modalRoomType');
  const modalRoomNo = document.getElementById('modalRoomNo');
  const modalRatingText = document.getElementById('modalRatingText');
  const modalDescription = document.getElementById('modalDescription');
  const modalStatus = document.getElementById('modalStatus');
  const modalStarRating = document.getElementById('modalStarRating');

  if (modalUserName) modalUserName.textContent = review.userName;
  if (modalDate) modalDate.textContent = review.date;
  if (modalRoomType) modalRoomType.textContent = review.roomType;
  if (modalRoomNo) modalRoomNo.textContent = review.roomNo;
  if (modalRatingText) modalRatingText.textContent = review.rating;
  if (modalDescription) modalDescription.textContent = review.description;
  if (modalStatus) modalStatus.textContent = review.status || 'Published';
  if (modalStarRating) modalStarRating.innerHTML = generateStarRating(review.rating);

  if (reviewModal) {
    reviewModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal() {
  if (reviewModal) reviewModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
  currentReviewId = null;
}

async function deleteCurrentReview() {
  if (currentReviewId && confirm('Are you sure you want to delete this review?')) {
    const success = await deleteReviewFromApi(currentReviewId);
    if (success) closeModal();
  }
}

// =========================
// Events
// =========================
function initializeDOMElements() {
  // Main
  loadingIndicator = document.getElementById('loadingIndicator');
  tableContainer = document.getElementById('tableContainer');
  tableBody = document.getElementById('tableBody');
  noDataMessage = document.getElementById('noDataMessage');
  deleteAllBtn = document.getElementById('deleteAllBtn');

  // Modal
  reviewModal = document.getElementById('reviewModal');
  closeReviewModalBtnIcon = document.getElementById('closeReviewModal');
  closeReviewModalBtn = document.getElementById('closeReviewModalBtn');
  deleteReviewFromModal = document.getElementById('deleteReviewFromModal');

  // Filters (optional presence)
  searchInput = document.getElementById('searchInput');
  statusFilter = document.getElementById('statusFilter');
  minRatingInput = document.getElementById('minRating');
  maxRatingInput = document.getElementById('maxRating');
  dateFromInput = document.getElementById('dateFrom');
  dateToInput = document.getElementById('dateTo');
  sortBySelect = document.getElementById('sortBy');
  sortDirSelect = document.getElementById('sortDir');
}

function setupEventListeners() {
  // Delete all
  deleteAllBtn?.addEventListener('click', deleteAllReviews);

  // Modal close and delete
  closeReviewModalBtnIcon?.addEventListener('click', closeModal);
  closeReviewModalBtn?.addEventListener('click', closeModal);
  deleteReviewFromModal?.addEventListener('click', deleteCurrentReview);

  // Close modal on backdrop click
  if (reviewModal) {
    reviewModal.addEventListener('click', (e) => {
      if (e.target === reviewModal) closeModal();
    });
  }

  // Prevent modal close on content click
  document.querySelector('.modal-content')?.addEventListener('click', (e) => e.stopPropagation());

  // Table actions (view/delete)
  tableBody?.addEventListener('click', (event) => {
    const viewBtn = event.target.closest('.view-btn');
    const deleteBtn = event.target.closest('.delete-btn');

    if (viewBtn) {
      openReviewModal(viewBtn.dataset.id);
      return;
    }
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      if (confirm('Are you sure you want to delete this review?')) {
        deleteReviewFromApi(id);
      }
    }
  });

  // Pagination controls — use currentTarget for reliable disabled checks
  document.getElementById('prevPage')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    if (btn.disabled) return;
    currentPage -= 1;
    updatePagination();
    renderTable();
  });

  document.getElementById('nextPage')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    if (btn.disabled) return;
    currentPage += 1;
    updatePagination();
    renderTable();
  });

  // Items per page
  document.getElementById('itemsPerPage')?.addEventListener('change', (e) => {
    const next = parseInt(e.currentTarget.value, 10);
    itemsPerPage = Number.isFinite(next) && next > 0 ? next : 10;
    currentPage = filteredData.length > 0 ? 1 : 0;
    updatePagination();
    if (filteredData.length > 0) renderTable();
  });

  // Filters and sorting (optional controls)
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      filterState.search = e.target.value || '';
      // Reset to first page on new query
      currentPage = 1;
      applyFiltersAndSort();
    }, 300));
  }

  statusFilter?.addEventListener('change', (e) => {
    filterState.status = e.currentTarget.value || 'all';
    currentPage = 1;
    applyFiltersAndSort();
  });

  minRatingInput?.addEventListener('change', (e) => {
    filterState.minRating = e.currentTarget.value;
    currentPage = 1;
    applyFiltersAndSort();
  });

  maxRatingInput?.addEventListener('change', (e) => {
    filterState.maxRating = e.currentTarget.value;
    currentPage = 1;
    applyFiltersAndSort();
  });

  dateFromInput?.addEventListener('change', (e) => {
    filterState.dateFrom = e.currentTarget.value || null;
    currentPage = 1;
    applyFiltersAndSort();
  });

  dateToInput?.addEventListener('change', (e) => {
    filterState.dateTo = e.currentTarget.value || null;
    currentPage = 1;
    applyFiltersAndSort();
  });

  sortBySelect?.addEventListener('change', (e) => {
    filterState.sortBy = e.currentTarget.value || 'date';
    currentPage = 1;
    applyFiltersAndSort();
  });

  sortDirSelect?.addEventListener('change', (e) => {
    filterState.sortDir = e.currentTarget.value || 'desc';
    currentPage = 1;
    applyFiltersAndSort();
  });

  // Escape to close modal
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && reviewModal && !reviewModal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

// =========================
// Boot
// =========================
document.addEventListener('DOMContentLoaded', () => {
  initializeDOMElements();
  setupEventListeners();
  fetchRatingsReviews();
});
