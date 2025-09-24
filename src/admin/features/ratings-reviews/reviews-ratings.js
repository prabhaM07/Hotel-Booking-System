// API Configuration
const API_BASE = 'https://68c8b85aceef5a150f622643.mockapi.io';
const RATINGS_REVIEWS_ENDPOINT = `${API_BASE}/admin/8`;

// Global variables
let ratingsReviewsData = [];
let filteredData = [];
let currentReviewId = null;

// DOM elements - will be initialized after DOM loads
let loadingIndicator, tableContainer, tableBody, noDataMessage, deleteAllBtn;
let reviewModal, closeReviewModal, closeReviewModalBtn, deleteReviewFromModal;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing application...');
    
    // Initialize DOM elements
    initializeDOMElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Fetch initial data
    fetchRatingsReviews();
});

function initializeDOMElements() {
    // Main elements
    loadingIndicator = document.getElementById('loadingIndicator');
    tableContainer = document.getElementById('tableContainer');
    tableBody = document.getElementById('tableBody');
    noDataMessage = document.getElementById('noDataMessage');
    deleteAllBtn = document.getElementById('deleteAllBtn');

    // Modal elements
    reviewModal = document.getElementById('reviewModal');
    closeReviewModal = document.getElementById('closeReviewModal');
    closeReviewModalBtn = document.getElementById('closeReviewModalBtn');
    deleteReviewFromModal = document.getElementById('deleteReviewFromModal');

    console.log('DOM elements initialized:', {
        loadingIndicator: !!loadingIndicator,
        tableContainer: !!tableContainer,
        tableBody: !!tableBody,
        noDataMessage: !!noDataMessage,
        reviewModal: !!reviewModal
    });
}

function setupEventListeners() {
    // Delete all button
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', deleteAllReviews);
    }

    // Modal event listeners
    if (closeReviewModal) {
        closeReviewModal.addEventListener('click', closeModal);
    }
    if (closeReviewModalBtn) {
        closeReviewModalBtn.addEventListener('click', closeModal);
    }
    if (deleteReviewFromModal) {
        deleteReviewFromModal.addEventListener('click', deleteCurrentReview);
    }

    // Close modal when clicking outside
    if (reviewModal) {
        reviewModal.addEventListener('click', (e) => {
            if (e.target === reviewModal) {
                closeModal();
            }
        });
    }

    // Event delegation for table buttons
    if (tableBody) {
        tableBody.addEventListener('click', handleTableButtonClick);
    }

    // Prevent modal close on content click
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        modalContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    console.log('Event listeners set up');
}

function showLoading() {
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    if (tableContainer) tableContainer.classList.add('hidden');
    if (noDataMessage) noDataMessage.classList.add('hidden');
}

function showNoData() {
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    if (tableContainer) tableContainer.classList.add('hidden');
    if (noDataMessage) noDataMessage.classList.remove('hidden');
}

function showTable() {
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    if (tableContainer) tableContainer.classList.remove('hidden');
    if (noDataMessage) noDataMessage.classList.add('hidden');
}

function fetchRatingsReviews() {
    console.log('Fetching ratings and reviews...');
    showLoading();
    
    fetch(RATINGS_REVIEWS_ENDPOINT)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Data received:', data);
            ratingsReviewsData = data['ratings-reviews'] || data || [];
            filteredData = ratingsReviewsData.filter(r => !r.read);
            console.log('Filtered data:', filteredData);
            renderTable();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            showNoData();
        });
}

async function updateApiData(updatedData) {
    try {
        console.log('Updating API with data:', updatedData);
        
        const response = await fetch(RATINGS_REVIEWS_ENDPOINT, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: 8,
                "ratings-reviews": updatedData
            })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to update data: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API update result:', result);
        return result;
        
    } catch (error) {
        console.error('Error updating API data:', error);
        throw error;
    }
}

async function deleteReviewFromApi(reviewId) {
    try {
        console.log('Deleting review with ID:', reviewId);
        
        const updatedReviews = ratingsReviewsData.filter(review => review.id != reviewId);
        console.log('Reviews after deletion:', updatedReviews);
        
        await updateApiData(updatedReviews);
        
        ratingsReviewsData = updatedReviews;
        filteredData = ratingsReviewsData.filter(review => !review.read);
        
        console.log('Local data updated after deletion');
        return true;
    } catch (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review. Please try again.');
        return false;
    }
}

function renderTable() {
    console.log('Rendering table with filtered data:', filteredData);
    
    if (!tableBody) {
        console.error('tableBody element not found');
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        console.log('No data to display, showing no data message');
        showNoData();
        return;
    }
    
    showTable();
    
    filteredData.forEach((review) => {
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
    
    console.log('Table rendered with', filteredData.length, 'rows');
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

function openReviewModal(reviewId) {
    console.log('Opening modal for review ID:', reviewId);
    
    const numericId = parseInt(reviewId);
    const review = filteredData.find(r => parseInt(r.id) === numericId);
    
    if (!review) {
        console.error('Review not found for ID:', reviewId);
        return;
    }

    currentReviewId = numericId;

    // Populate modal fields
    const elements = {
        modalUserName: document.getElementById('modalUserName'),
        modalDate: document.getElementById('modalDate'),
        modalRoomType: document.getElementById('modalRoomType'),
        modalRoomNo: document.getElementById('modalRoomNo'),
        modalRatingText: document.getElementById('modalRatingText'),
        modalDescription: document.getElementById('modalDescription'),
        modalStatus: document.getElementById('modalStatus'),
        modalStarRating: document.getElementById('modalStarRating')
    };

    if (elements.modalUserName) elements.modalUserName.textContent = review.userName;
    if (elements.modalDate) elements.modalDate.textContent = review.date;
    if (elements.modalRoomType) elements.modalRoomType.textContent = review.roomType;
    if (elements.modalRoomNo) elements.modalRoomNo.textContent = review.roomNo;
    if (elements.modalRatingText) elements.modalRatingText.textContent = review.rating;
    if (elements.modalDescription) elements.modalDescription.textContent = review.description;
    if (elements.modalStatus) elements.modalStatus.textContent = review.status || 'Published';

    // Generate star rating for modal
    if (elements.modalStarRating) {
        elements.modalStarRating.innerHTML = generateStarRating(review.rating);
    }

    // Show modal
    if (reviewModal) {
        reviewModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    console.log('Modal opened, currentReviewId set to:', currentReviewId);
}

function closeModal() {
    if (reviewModal) {
        reviewModal.classList.add('hidden');
    }
    document.body.style.overflow = 'auto';
    currentReviewId = null;
    console.log('Modal closed, currentReviewId cleared');
}

async function deleteCurrentReview() {
    if (currentReviewId && confirm('Are you sure you want to delete this review?')) {
        const success = await deleteReviewFromApi(currentReviewId);
        if (success) {
            renderTable();
            closeModal();
        }
    }
}

async function deleteAllReviews() {
    if (filteredData.length === 0) {
        alert('No reviews to delete.');
        return;
    }

    if (confirm('Are you sure you want to delete all visible reviews? This action cannot be undone.')) {
        try {
            for (const review of filteredData) {
                await deleteReviewFromApi(review.id);
            }
            renderTable();
        } catch (error) {
            console.error('Error deleting all reviews:', error);
        }
    }
}

function handleTableButtonClick(event) {
    const viewBtn = event.target.closest('.view-btn');
    const deleteBtn = event.target.closest('.delete-btn');
    
    if (viewBtn) {
        const id = viewBtn.dataset.id;
        console.log('View button clicked for ID:', id);
        openReviewModal(id);
    } else if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        console.log('Delete button clicked for ID:', id);
        if (confirm('Are you sure you want to delete this review?')) {
            deleteReviewFromApi(parseInt(id)).then(success => {
                if (success) {
                    renderTable();
                }
            });
        }
    }
}

// Keyboard support for modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && reviewModal && !reviewModal.classList.contains('hidden')) {
        closeModal();
    }
});
