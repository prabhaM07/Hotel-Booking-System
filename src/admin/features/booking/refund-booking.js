// API Configuration
const API_BASE = 'https://68c8b85aceef5a150f622643.mockapi.io';
const BOOKINGS_ENDPOINT = `${API_BASE}/admin/4`;

// Global variables
let bookingsData = [];
let filteredData = [];
let filtersModalOpen = false;

// Add these to store current filter values
let currentFilters = {
  dateFrom: '',
  dateTo: '',
  userName: '',
  status: '',
  roomNo: '',
  categoryType: ''
};



// DOM Elements
let searchInput, loadingIndicator, tableContainer, noDataMessage, bookingTableBody;

// Initialize DOM elements after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize DOM elements
  searchInput = document.getElementById("searchInput");
  loadingIndicator = document.getElementById("loadingIndicator");
  tableContainer = document.getElementById("tableContainer");
  noDataMessage = document.getElementById("noDataMessage");
  bookingTableBody = document.getElementById("bookingTableBody");

  // Initialize event listeners
  initializeEventListeners();
  
  // Fetch booking data
  fetchBookingData();
});

// Initialize all event listeners
function initializeEventListeners() {
  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', performSearch);
  }

  // Filter button
  const filtersBtn = document.getElementById('filtersBtn');
  if (filtersBtn) {
    filtersBtn.addEventListener('click', toggleFiltersDropdown);
  }
}

// Fetch booking data from API
async function fetchBookingData() {
  try {
    showLoadingIndicator();
    const response = await fetch(BOOKINGS_ENDPOINT);
    const data = await response.json();
    
    bookingsData = data.refundBookings || [];
    filteredData = [...bookingsData];
    
    console.log("Fetched refund bookings data:", bookingsData);
    renderTable();
  } catch (error) {
    console.error("Error fetching refund bookings data:", error);
    showError();
  } finally {
    hideLoadingIndicator();
  }
}

// Show loading indicator
function showLoadingIndicator() {
  if (loadingIndicator) {
    loadingIndicator.classList.remove('hidden');
  }
  // Hide the entire table container
  if (tableContainer) {
    tableContainer.classList.add('hidden');
  }
  // Hide no data message while loading
  if (noDataMessage) {
    noDataMessage.classList.add('hidden');
  }
}

// Hide loading indicator
function hideLoadingIndicator() {
  if (loadingIndicator) {
    loadingIndicator.classList.add('hidden');
  }
  // Show the table container again
  if (tableContainer) {
    tableContainer.classList.remove('hidden');
  }
}



// Show error message
function showError() {
  if (noDataMessage) {
    noDataMessage.classList.remove('hidden');
    noDataMessage.innerHTML = `
      <div class="text-red-500">
        <svg class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-red-900">Error loading data</h3>
        <p class="mt-1 text-sm text-red-600">There was an error loading the refund bookings. Please try again later.</p>
      </div>
    `;
  }
}

// Format date function
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

// Get status badge HTML
function getStatusBadge(status) {
  const statusClasses = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'completed': 'bg-blue-100 text-blue-800',
    'cancelled': 'bg-gray-100 text-gray-800'
  };
  
  const statusClass = statusClasses[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
    ${status || 'N/A'}
  </span>`;
}

// Render table with booking data
function renderTable() {
  if (!bookingTableBody) return;

  // Clear existing content
  bookingTableBody.innerHTML = '';

  if (filteredData.length === 0) {
    // Show no data message
    if (noDataMessage) {
      noDataMessage.classList.remove('hidden');
    }
    return;
  }

  // Hide no data message
  if (noDataMessage) {
    noDataMessage.classList.add('hidden');
  }

  // Populate table with data
  filteredData.forEach(booking => {
    const row = document.createElement('tr');
    row.classList.add('hover:bg-gray-50');
    
    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#${booking.orderId || booking.id}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.userName || 'N/A'}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.phoneNo || 'N/A'}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.categoryType || 'N/A'}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.roomNo || 'N/A'}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(booking.date)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.checkIn || 'N/A'}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.checkOut || 'N/A'}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(booking.bookedDate)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${booking.price || 'N/A'}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${getStatusBadge(booking.refundStatus)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-green-600">${booking.refundAmount || 'N/A'}</td>
      <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title="${booking.refundReason || 'N/A'}">${booking.refundReason || 'N/A'}</td>
    `;
    
    bookingTableBody.appendChild(row);
  });
}

// Search functionality
function performSearch() {
  if (!searchInput) return;
  
  const searchTerm = searchInput.value.trim().toLowerCase();
  
  if (!searchTerm) {
    filteredData = [...bookingsData];
  } else {
    filteredData = bookingsData.filter(booking => {
      const searchableFields = [
        booking.userName || '',
        booking.phoneNo || '',
        booking.orderId || booking.id || '',
        booking.categoryType || '',
        booking.roomNo || '',
        booking.refundStatus || '',
        booking.refundReason || '',
        formatDate(booking.date),
        formatDate(booking.bookedDate)
      ].join(' ').toLowerCase();
      
      return searchableFields.includes(searchTerm);
    });
  }
  
  renderTable();
  console.log(`Search: "${searchTerm}" - Found ${filteredData.length} results`);
}

// Filter Functions - Dropdown instead of modal
function createFiltersDropdown() {
  // Remove existing dropdown if present
  const existingDropdown = document.getElementById('filtersDropdown');
  if (existingDropdown) {
    existingDropdown.remove();
  }

  // Find the filter button to position dropdown below it
  const filtersBtn = document.getElementById('filtersBtn');
  if (!filtersBtn) return;

  const dropdownHTML = `
    <div id="filtersDropdown" class="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-80 z-50">
      <!-- Filter Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Filter Refund Bookings</h3>
        <button id="closeFiltersDropdown" class="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close filters">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Filter Fields -->
      <div class="space-y-4">
        <!-- Date Range Filter -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="filterDateFrom" class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input 
              type="date" 
              id="filterDateFrom" 
              value="${currentFilters.dateFrom}"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D1354] focus:border-transparent text-sm"
            >
          </div>
          <div>
            <label for="filterDateTo" class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input 
              type="date" 
              id="filterDateTo" 
              value="${currentFilters.dateTo}"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D1354] focus:border-transparent text-sm"
            >
          </div>
        </div>

        <!-- Guest Name Filter -->
        <div>
          <label for="filterUserName" class="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
          <input 
            type="text" 
            id="filterUserName" 
            placeholder="Enter guest name..."
            value="${currentFilters.userName}"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D1354] focus:border-transparent text-sm"
          >
        </div>

        <!-- Refund Status Filter -->
        <div>
          <label for="filterStatus" class="block text-sm font-medium text-gray-700 mb-1">Refund Status</label>
          <select 
            id="filterStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D1354] focus:border-transparent text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending" ${currentFilters.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="approved" ${currentFilters.status === 'approved' ? 'selected' : ''}>Approved</option>
            <option value="rejected" ${currentFilters.status === 'rejected' ? 'selected' : ''}>Rejected</option>
            <option value="completed" ${currentFilters.status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>

        <!-- Room Number Filter -->
        <div>
          <label for="filterRoomNo" class="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
          <input 
            type="text" 
            id="filterRoomNo" 
            placeholder="Enter room number..."
            value="${currentFilters.roomNo}"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D1354] focus:border-transparent text-sm"
          >
        </div>

        <!-- Category Type Filter -->
        <div>
          <label for="filterCategoryType" class="block text-sm font-medium text-gray-700 mb-1">Room Category</label>
          <input 
            type="text" 
            id="filterCategoryType" 
            placeholder="Enter category..."
            value="${currentFilters.categoryType}"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D1354] focus:border-transparent text-sm"
          >
        </div>
      </div>

      <!-- Filter Buttons -->
      <div class="flex gap-3 mt-6">
        <button 
          id="applyFiltersBtn"
          class="flex-1 px-4 py-2 bg-[#1D1354] text-white rounded-lg hover:bg-[#2E1B8C] transition-colors font-medium text-sm"
        >
          Apply Filters
        </button>
        <button 
          id="clearFiltersBtn"
          class="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
        >
          Clear All
        </button>
      </div>
    </div>
  `;
  
  // Insert dropdown after the filter button's parent container
  const filterContainer = filtersBtn.parentElement;
  filterContainer.style.position = 'relative';
  filterContainer.insertAdjacentHTML('beforeend', dropdownHTML);
}

// Show filters dropdown
function showFiltersDropdown() {
  createFiltersDropdown();
  filtersModalOpen = true; // Keep the same variable name for consistency
  
  // Add event listeners to dropdown buttons
  document.getElementById('closeFiltersDropdown').addEventListener('click', hideFiltersDropdown);
  document.getElementById('applyFiltersBtn').addEventListener('click', filterBooking);
  document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
  
  // Close dropdown when clicking outside
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 100);
}

// Hide filters dropdown
function hideFiltersDropdown() {
  const dropdown = document.getElementById('filtersDropdown');
  if (dropdown) {
    dropdown.remove();
  }
  filtersModalOpen = false;
  
  // Remove the click outside listener
  document.removeEventListener('click', handleClickOutside);
}

// Handle click outside dropdown
function handleClickOutside(e) {
  const dropdown = document.getElementById('filtersDropdown');
  const filtersBtn = document.getElementById('filtersBtn');
  
  if (dropdown && !dropdown.contains(e.target) && !filtersBtn.contains(e.target)) {
    hideFiltersDropdown();
  }
}

// Toggle filters dropdown
function toggleFiltersDropdown() {
  const existingDropdown = document.getElementById('filtersDropdown');
  
  if (existingDropdown) {
    // If dropdown exists, hide it
    hideFiltersDropdown();
  } else {
    // If dropdown doesn't exist, show it
    showFiltersDropdown();
  }
}
// Helper function to convert date string to Date object for comparison
function parseFilterDate(dateString) {
  if (!dateString) return null;
  try {
    return new Date(dateString);
  } catch (error) {
    return null;
  }
}

// Helper function to convert booking date to Date object
function parseBookingDate(dateString) {
  if (!dateString) return null;
  try {
    return new Date(dateString);
  } catch (error) {
    return null;
  }
}

// Apply filters and store current values
function filterBooking() {
  // Get current filter values and store them
  currentFilters.dateFrom = document.getElementById('filterDateFrom')?.value || '';
  currentFilters.dateTo = document.getElementById('filterDateTo')?.value || '';
  currentFilters.userName = document.getElementById('filterUserName')?.value.trim() || '';
  currentFilters.status = document.getElementById('filterStatus')?.value.trim() || '';
  currentFilters.roomNo = document.getElementById('filterRoomNo')?.value.trim() || '';
  currentFilters.categoryType = document.getElementById('filterCategoryType')?.value.trim() || '';

  // Convert date strings to Date objects for comparison
  const fromDate = parseFilterDate(currentFilters.dateFrom);
  const toDate = parseFilterDate(currentFilters.dateTo);

  filteredData = bookingsData.filter(booking => {
    const bUserName = (booking.userName || '').toLowerCase();
    const bStatus = (booking.refundStatus || '').toLowerCase();
    const bRoomNo = (booking.roomNo || '').toLowerCase();
    const bCategory = (booking.categoryType || '').toLowerCase();
    
    // Parse booking date for comparison
    const bookingDate = parseBookingDate(booking.date);

    // Apply filters
    const userNameMatch = currentFilters.userName ? bUserName.includes(currentFilters.userName.toLowerCase()) : true;
    const statusMatch = currentFilters.status ? bStatus === currentFilters.status.toLowerCase() : true;
    const roomNoMatch = currentFilters.roomNo ? bRoomNo.includes(currentFilters.roomNo.toLowerCase()) : true;
    const categoryMatch = currentFilters.categoryType ? bCategory.includes(currentFilters.categoryType.toLowerCase()) : true;
    
    // Date range filter
    let dateMatch = true;
    if (bookingDate) {
      if (fromDate && toDate) {
        dateMatch = bookingDate >= fromDate && bookingDate <= toDate;
      } else if (fromDate) {
        dateMatch = bookingDate >= fromDate;
      } else if (toDate) {
        dateMatch = bookingDate <= toDate;
      }
    } else if (fromDate || toDate) {
      dateMatch = false;
    }

    return userNameMatch && statusMatch && roomNoMatch && categoryMatch && dateMatch;
  });

  renderTable();
  hideFiltersDropdown();
  
  const dateRangeInfo = fromDate || toDate ? 
    `from ${fromDate ? currentFilters.dateFrom : 'start'} to ${toDate ? currentFilters.dateTo : 'end'}` : '';
  console.log(`Filtered ${filteredData.length} records out of ${bookingsData.length} total refund bookings ${dateRangeInfo}`);
}

// Clear all filters and reset stored values
function clearFilters() {
  // Reset all current filter values
  currentFilters = {
    dateFrom: '',
    dateTo: '',
    userName: '',
    status: '',
    roomNo: '',
    categoryType: ''
  };
  
  // Clear search input if exists
  if (searchInput) {
    searchInput.value = '';
  }
  
  // Reset filtered data to show all bookings
  filteredData = [...bookingsData];
  renderTable();
  hideFiltersDropdown();
  
  console.log('All filters cleared, showing all refund bookings');
}
// Clear all filters
function clearFilters() {
  const filterInputs = [
    'filterDateFrom', 
    'filterDateTo',
    'filterUserName', 
    'filterStatus', 
    'filterRoomNo', 
    'filterCategoryType'
  ];
  
  filterInputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.value = '';
    }
  });
  
  if (searchInput) {
    searchInput.value = '';
  }
  
  filteredData = [...bookingsData];
  renderTable();
  hideFiltersDropdown();
}

// Profile dropdown functionality
function toggleProfileDropdown() {
  const dropdown = document.getElementById('profileDropdown');
  const arrow = document.getElementById('dropdownArrow');
  
  if (dropdown.classList.contains('hidden')) {
    dropdown.classList.remove('hidden');
    arrow.style.transform = 'rotate(180deg)';
  } else {
    dropdown.classList.add('hidden');
    arrow.style.transform = 'rotate(0deg)';
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  const profileDropdown = document.getElementById('profileDropdown');
  const profileSection = e.target.closest('.p-4.border-t');
  
  if (profileDropdown && !profileSection && !profileDropdown.classList.contains('hidden')) {
    profileDropdown.classList.add('hidden');
    document.getElementById('dropdownArrow').style.transform = 'rotate(0deg)';
  }
});
