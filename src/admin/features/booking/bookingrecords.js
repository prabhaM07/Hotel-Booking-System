// API Configuration
const API_BASE = 'https://68c8b85aceef5a150f622643.mockapi.io';
const BOOKINGS_ENDPOINT = `${API_BASE}/admin/3`;

// Global variables
let bookingsData = [];
let filteredData = [];
let filtersModalOpen = false;

// Add filter state persistence
let currentFilters = {
  dateFrom: '',
  dateTo: '',
  userName: '',
  status: '',
  roomNo: '',
  categoryType: ''
};

// DOM Elements - Initialize after DOM is loaded
let loadingIndicator, tableContainer, noDataMessage, bookingTableBody, searchInput, exportAllBtn, filtersBtn;

// Status configuration object
const statusConfig = {
  'confirmed': { class: 'bg-green-100 text-green-800', label: 'Confirmed' },
  'cancelled': { class: 'bg-red-100 text-red-800', label: 'Cancelled' },
  'completed': { class: 'bg-blue-100 text-blue-800', label: 'Completed' }
};

// Initialize DOM elements
function initializeDOMElements() {
  loadingIndicator = document.getElementById('loadingIndicator');
  tableContainer = document.getElementById('tableContainer');
  noDataMessage = document.getElementById('noDataMessage');
  bookingTableBody = document.getElementById('bookingTableBody');
  searchInput = document.getElementById('searchInput');
  exportAllBtn = document.getElementById('exportAllBtn');
  filtersBtn = document.getElementById('filtersBtn');
}

// Utility Functions
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
}

function formatTime(timeString) {
  if (!timeString) return 'N/A';
  // If it's already in HH:MM format, return as is
  if (timeString.includes(':')) return timeString;
  // If it's a number, convert to time format
  return `${timeString}:00`;
}

function formatPrice(price) {
  if (!price) return '$0';
  // Remove currency symbols and format consistently
  const numericPrice = price.toString().replace(/[^\d.-]/g, '');
  return `$${numericPrice}`;
}

function getStatusBadge(status) {
  const statusLower = status.toLowerCase();
  const config = statusConfig[statusLower] || { class: 'bg-gray-100 text-gray-800', label: status };
  
  return `
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}">
      • ${config.label}
    </span>
  `;
}

function showNoData() {
  if (!loadingIndicator || !tableContainer || !noDataMessage) {
    console.error('DOM elements not found in showNoData');
    return;
  }
  
  loadingIndicator.style.display = 'none';
  tableContainer.style.display = 'none';
  noDataMessage.style.display = 'block';
}

function showError(message) {
  console.log('showError called with:', message);
  if (!loadingIndicator || !tableContainer || !noDataMessage) {
    console.error('DOM elements not found in showError');
    return;
  }
  
  loadingIndicator.style.display = 'none';
  tableContainer.style.display = 'none';
  noDataMessage.style.display = 'block';
  
  // Update no data message to show error
  const noDataContent = noDataMessage.querySelector('.text-gray-500');
  if (noDataContent) {
    noDataContent.innerHTML = `
      <svg class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Error Loading Data</h3>
      <p class="mt-1 text-sm text-gray-500">${message}</p>
      <button onclick="fetchBookingsData()" class="mt-4 px-4 py-2 bg-[#1D1354] text-white rounded-lg hover:bg-[#2E1B8C] transition-colors">
        Try Again
      </button>
    `;
  }
}

function renderTable() {
  if (!loadingIndicator || !tableContainer || !noDataMessage || !bookingTableBody) {
    console.error('DOM elements not found in renderTable');
    return;
  }

  loadingIndicator.style.display = 'none';
  tableContainer.style.display = 'block';
  noDataMessage.style.display = 'none';

  if (filteredData.length === 0) {
    bookingTableBody.innerHTML = `
      <tr>
        <td colspan="12" class="px-6 py-8 text-center text-gray-500">
          No records match your search criteria.
        </td>
      </tr>
    `;
    return;
  }

  try {
    bookingTableBody.innerHTML = filteredData.map(booking => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${booking.bookingId || booking.id}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.firstName || booking.name || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.mobile || booking.mobile || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.roomType || booking.roomType || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.roomno || booking.room || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatTime(booking.checkin)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatTime(booking.checkout)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(booking.bookingDate)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatPrice(booking.pricePerNight)}</td>
        <td class="px-6 py-4 whitespace-nowrap">${getStatusBadge(booking.status || 'pending')}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button 
            class="text-gray-600 hover:text-gray-900 p-1 rounded transition-colors" 
            title="Download"
            onclick="downloadBooking(${booking.bookingId || booking.orderId})"
          >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </td>
      </tr>
    `).join('');
    
  } catch (error) {
    console.error('Error rendering table:', error);
    showError('Error displaying booking records');
  }
}

function showLoading(show) {
  if (!loadingIndicator || !tableContainer || !noDataMessage) {
    console.error('DOM elements not found in showLoading');
    return;
  }
  
  if (show) {
    loadingIndicator.style.display = 'flex';
    tableContainer.style.display = 'none';
    noDataMessage.style.display = 'none';
  } else {
    loadingIndicator.style.display = 'none';
  }
}

// API Functions
async function fetchBookingsData() {
  showLoading(true);
  
  try {
    const response = await fetch(BOOKINGS_ENDPOINT);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // FIXED: Handle different API response structures
    bookingsData = Array.isArray(data) ? data : data.bookings || [];

    filteredData = [...bookingsData];
    
    if (bookingsData.length === 0) {
      showNoData();
    } else {
      renderTable();
      currentPage = 1;
      updatePagination();
    }

    console.log('Bookings loaded:', bookingsData.length, 'records');
    if (filteredData.length > 0) {
      console.log('Sample booking:', filteredData[0]);
    }
  } catch (error) {
    console.error('Fetch error:', error);
    showError('Failed to load booking records. Please try again later.');
  } finally {
    showLoading(false);
  }
}

// ADDED: Search functionality
function performSearch() {
  if (!searchInput) return;
  
  const searchTerm = searchInput.value.trim().toLowerCase();
  
  if (!searchTerm) {
    filteredData = [...bookingsData];
    currentPage = 1;
    updatePagination();
    renderTable();
  } else {
    filteredData = bookingsData.filter(booking => {
      const searchableFields = [
        booking.firstName || booking.name || '',
        booking.mobile || booking.phone || '',
        booking.bookingId || booking.id || '',
        booking.roomType || booking.roomType || '',
        booking.roomno || booking.room || '',
        booking.status || '',
        formatDate(booking.bookingDate),
        formatDate(booking.bookingDate)
      ].join(' ').toLowerCase();
      
      return searchableFields.includes(searchTerm);
    });
  }
  
  renderTable();
  console.log(`Search: "${searchTerm}" - Found ${filteredData.length} results`);
}



// Filter Functions - Updated for dropdown instead of modal
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
    <div id="filtersDropdown" class="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-[#1D1354] p-6 w-80 z-50">
      <!-- Filter Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Filter Bookings</h3>
        <button id="closeFiltersDropdown" class="text-gray-400 hover:text-gray-600 transition-colors">
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
              class="w-full px-3 py-2 border border-[#1D1354] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D1354] focus:border-transparent text-sm"
            >
          </div>
          <div>
            <label for="filterDateTo" class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input 
              type="date" 
              id="filterDateTo" 
              value="${currentFilters.dateTo}"
              class="w-full px-3 py-2 border border-[#1D1354] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D1354] focus:border-transparent text-sm"
            >
          </div>
        </div>

        <!-- Guest Name Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
          <input 
            type="text" 
            id="filterUserName" 
            placeholder="Enter guest name..."
            value="${currentFilters.userName}"
            class="w-full px-3 py-2 border border-[#1D1354] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D1354] focus:border-transparent text-sm"
          >
        </div>

        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select 
            id="filterStatus"
            class="w-full px-3 py-2 border border-[#1D1354] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D1354] focus:border-transparent text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending" ${currentFilters.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${currentFilters.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="completed" ${currentFilters.status === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="cancelled" ${currentFilters.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>

        <!-- Room Number Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
          <input 
            type="text" 
            id="filterRoomNo" 
            placeholder="Enter room number..."
            value="${currentFilters.roomNo}"
            class="w-full px-3 py-2 border border-[#1D1354] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D1354] focus:border-transparent text-sm"
          >
        </div>

        <!-- Category Type Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Room Category</label>
          <input 
            type="text" 
            id="filterCategoryType" 
            placeholder="Enter category..."
            value="${currentFilters.categoryType}"
            class="w-full px-3 py-2 border border-[#1D1354] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D1354] focus:border-transparent text-sm"
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

function showFiltersDropdown() {
  createFiltersDropdown();
  filtersModalOpen = true;
  
  // Add event listeners to dropdown buttons
  document.getElementById('closeFiltersDropdown').addEventListener('click', hideFiltersDropdown);
  document.getElementById('applyFiltersBtn').addEventListener('click', filterBooking);
  document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
  
  // Close dropdown when clicking outside
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 100);
}

// Handle click outside dropdown
function handleClickOutside(e) {
  const dropdown = document.getElementById('filtersDropdown');
  const filtersBtn = document.getElementById('filtersBtn');
  
  if (dropdown && !dropdown.contains(e.target) && !filtersBtn.contains(e.target)) {
    hideFiltersDropdown();
  }
}

function hideFiltersDropdown() {
  const dropdown = document.getElementById('filtersDropdown');
  if (dropdown) {
    dropdown.remove();
  }
  filtersModalOpen = false;
  
  // Remove the click outside listener
  document.removeEventListener('click', handleClickOutside);
}


function hideFiltersDropdown() {
  const dropdown = document.getElementById('filtersDropdown');
  if (dropdown) {
    dropdown.remove();
  }
  filtersModalOpen = false;
}

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

function filterBooking() {
  // Store current filter values
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
    const bUserName = (booking.userName || booking.name || '').toLowerCase();
    const bStatus = (booking.status || '').toLowerCase();
    const bRoomNo = (booking.roomNo || booking.room || '').toLowerCase();
    const bCategory = (booking.categoryType || booking.roomType || '').toLowerCase();
    
    // Parse booking date for comparison
    const bookingDate = parseBookingDate(booking.date);

    // Apply text-based filters
    const userNameMatch = currentFilters.userName ? bUserName.includes(currentFilters.userName.toLowerCase()) : true;
    const statusMatch = currentFilters.status ? bStatus === currentFilters.status.toLowerCase() : true;
    const roomNoMatch = currentFilters.roomNo ? bRoomNo.includes(currentFilters.roomNo.toLowerCase()) : true;
    const categoryMatch = currentFilters.categoryType ? bCategory.includes(currentFilters.categoryType.toLowerCase()) : true;

    // Date range filter
    let dateMatch = true;
    if (bookingDate) {
      if (fromDate && toDate) {
        // Both dates provided - check if booking date is within range
        dateMatch = bookingDate >= fromDate && bookingDate <= toDate;
      } else if (fromDate) {
        // Only from date provided - check if booking date is after or equal
        dateMatch = bookingDate >= fromDate;
      } else if (toDate) {
        // Only to date provided - check if booking date is before or equal
        dateMatch = bookingDate <= toDate;
      }
    } else if (fromDate || toDate) {
      // If date filters are applied but booking has no date, exclude it
      dateMatch = false;
    }

    return userNameMatch && statusMatch && roomNoMatch && categoryMatch && dateMatch;
  });

  currentPage = 1;
  updatePagination();
  renderTable();
  hideFiltersDropdown();
  
  const dateRangeInfo = fromDate || toDate ? 
    `from ${fromDate ? currentFilters.dateFrom : 'start'} to ${toDate ? currentFilters.dateTo : 'end'}` : '';
  console.log(`Filtered ${filteredData.length} records out of ${bookingsData.length} total bookings ${dateRangeInfo}`);
}

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
  currentPage = 1;
  updatePagination();
  renderTable();
  hideFiltersDropdown();
  
  console.log('All filters cleared, showing all booking records');
}




// Export Functions
function exportAllBookingsAsExcel() {
  if (filteredData.length === 0) {
    alert('No data to export');
    return;
  }

  // Check if XLSX library is loaded
  if (typeof XLSX === 'undefined') {
    alert('Excel export library not loaded. Please refresh the page and try again.');
    return;
  }

  try {
    console.log('Starting Excel generation...');

    // Prepare rows for Excel
    const headers = [
      'Order ID', 'Guest Name', 'Phone', 'Room Type', 'Room No',
      'Date', 'Check In', 'Check Out', 'Booked', 'Price', 'Status'
    ];

    const rows = filteredData.map(booking => [
      booking.orderId || booking.id || '',
      booking.userName || booking.name || 'N/A',
      booking.phoneNo || booking.phone || 'N/A',
      booking.categoryType || booking.roomType || 'N/A',
      booking.roomNo || booking.room || 'N/A',
      formatDate(booking.date),
      formatTime(booking.checkIn),
      formatTime(booking.checkOut),
      formatDate(booking.bookedDate),
      formatPrice(booking.price),
      booking.status || 'Pending'
    ]);

    // Add headers to the beginning
    const worksheetData = [headers, ...rows];

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

    // Export to Excel file
    const fileName = `Zyra-Hotel-Bookings-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    console.log('Excel file generated successfully');
  } catch (error) {
    console.error('Excel generation error:', error);
    alert('Error generating Excel: ' + error.message);
  }
}



function downloadBooking(bookingId) {
  const booking = bookingsData.find(b => (b.id || b.orderId) == bookingId);
  if (!booking) {
    alert('Booking not found');
    return;
  }

  // Check if jsPDF is loaded
  if (typeof window.jspdf === 'undefined') {
    alert('PDF library not loaded. Please refresh the page and try again.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Color scheme - Professional admin colors
  const primaryColor = [29, 19, 84];     // #1D1354 - Your brand color
  const secondaryColor = [46, 27, 140];  // #2E1B8C - Darker variant
  const redColor = [220, 38, 127];       // Red for important admin info
  const grayColor = [107, 114, 128];     // Gray-500
  const lightGray = [249, 250, 251];     // Gray-50

  // Helper function to draw colored rectangle
  function drawRect(x, y, width, height, color) {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(x, y, width, height, 'F');
  }

  // Header Background
  drawRect(0, 0, 210, 45, primaryColor);

  // Hotel Logo/Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ZYRA HOTEL', 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Administrative Management System', 14, 28);

  // Document Title - Admin focused
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BOOKING RECORD - ADMIN COPY', 14, 38);

  // Date and Booking ID in header
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const currentDate = new Date().toLocaleDateString('en-GB');
  const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
  doc.text(`Report Generated: ${currentDate} at ${currentTime}`, 130, 20);
  doc.text(`Booking ID: ${booking.orderId || booking.id}`, 130, 28);

  // Reset text color for body
  doc.setTextColor(0, 0, 0);

  // Guest Information Section
  let yPos = 60;
  
  // Section Header
  drawRect(14, yPos - 5, 182, 12, lightGray);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('GUEST DETAILS', 18, yPos + 2);
  
  yPos += 20;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // Guest details - Admin view
  const guestDetails = [
    { label: 'Guest Name:', value: booking.userName || booking.name || 'N/A' },
    { label: 'Contact Number:', value: booking.phoneNo || booking.phone || 'N/A' },
    { label: 'Booking Created:', value: formatDate(booking.bookedDate) }
  ];

  guestDetails.forEach((detail, index) => {
    doc.setFont('helvetica', 'bold');
    doc.text(detail.label, 18, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(detail.value, 65, yPos);
    yPos += 7;
  });

  // Booking Details Section
  yPos += 10;
  
  // Section Header
  drawRect(14, yPos - 5, 182, 12, lightGray);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('BOOKING INFORMATION', 18, yPos + 2);
  
  yPos += 20;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // Booking details - Two columns for admin
  const leftColumnDetails = [
    { label: 'Room Category:', value: booking.categoryType || booking.roomType || 'N/A' },
    { label: 'Room Assigned:', value: booking.roomNo || booking.room || 'N/A' },
    { label: 'Check-in Date:', value: formatDate(booking.date) }
  ];

  const rightColumnDetails = [
    { label: 'Check-in Time:', value: formatTime(booking.checkIn) },
    { label: 'Check-out Time:', value: formatTime(booking.checkOut) },
    { label: 'Booking Status:', value: booking.status || 'Pending' }
  ];

  // Left column
  let leftYPos = yPos;
  leftColumnDetails.forEach((detail) => {
    doc.setFont('helvetica', 'bold');
    doc.text(detail.label, 18, leftYPos);
    doc.setFont('helvetica', 'normal');
    doc.text(detail.value, 65, leftYPos);
    leftYPos += 7;
  });

  // Right column
  let rightYPos = yPos;
  rightColumnDetails.forEach((detail) => {
    doc.setFont('helvetica', 'bold');
    doc.text(detail.label, 110, rightYPos);
    doc.setFont('helvetica', 'normal');
    doc.text(detail.value, 150, rightYPos);
    rightYPos += 7;
  });

  yPos = Math.max(leftYPos, rightYPos) + 5;

  // Payment & Status Section
  yPos += 10;
  
  // Payment background
  drawRect(14, yPos - 5, 182, 25, lightGray);
  drawRect(14, yPos - 5, 3, 25, redColor); // Red left border for admin attention
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('FINANCIAL SUMMARY', 20, yPos + 2);
  
  yPos += 12;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  
  // Payment details
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount:', 20, yPos);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(redColor[0], redColor[1], redColor[2]);
  doc.text(formatPrice(booking.price), 70, yPos);
  
  // Status badge
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Status:', 130, yPos);
  
  const status = (booking.status || 'Pending').toLowerCase();
  let statusColor = grayColor;
  if (status === 'confirmed') statusColor = [34, 197, 94]; // Green
  else if (status === 'cancelled') statusColor = [239, 68, 68]; // Red
  else if (status === 'completed') statusColor = [59, 130, 246]; // Blue
  else if (status === 'pending') statusColor = [245, 158, 11]; // Yellow
  
  drawRect(155, yPos - 4, 30, 8, statusColor);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text((booking.status || 'Pending').toUpperCase(), 158, yPos + 1);

  yPos += 20;
  
  // System Information
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('SYSTEM INFORMATION:', 14, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  
  const systemInfo = [
    `• Record ID: ${booking.id || booking.orderId || 'N/A'}`,
    `• Generated by: Admin Portal`,
    `• Export Date: ${currentDate} ${currentTime}`,
    `• Document Type: Administrative Booking Record`
  ];
  
  systemInfo.forEach(info => {
    doc.text(info, 14, yPos);
    yPos += 4;
  });

  // Footer - Admin focused
  yPos = 280;
  drawRect(0, yPos - 5, 210, 15, primaryColor);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('CONFIDENTIAL - For Internal Use Only | Zyra Hotel Management System', 14, yPos + 2);
  doc.text('Admin Portal | Generated for hotel operations and record keeping', 14, yPos + 8);

  // Save with admin-specific filename
  const fileName = `Admin-Booking-Record-${booking.orderId || booking.id}-${currentDate.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}

// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded - Initializing...');
  
  initializeDOMElements();
  fetchBookingsData();

  // Search functionality - ADDED
  if (searchInput) {
    searchInput.addEventListener('input', performSearch);
    searchInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        performSearch();
      }
    });
    console.log('Search listeners attached');
  } else {
    console.warn('Search input not found!');
  }

  // Export functionality
  if (exportAllBtn) {
    exportAllBtn.addEventListener('click', exportAllBookingsAsExcel);
    console.log('Export button listener attached');
  } else {
    console.warn('Export button not found!');
  }

  // Filters functionality
  // Filters functionality - Updated for toggle behavior
if (filtersBtn) {
  filtersBtn.addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Filter button clicked - toggling dropdown');
    toggleFiltersDropdown(); // Changed from showFiltersModal to toggleFiltersDropdown
  });
  console.log('Filter button listener attached');
} else {
  console.warn('Filters button not found!');
}

// Update Escape key handler
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && filtersModalOpen) {
    hideFiltersDropdown(); // Changed from hideFiltersModal
  }
});


  console.log('All event listeners attached successfully');
});

// Global function exports
window.fetchBookingsData = fetchBookingsData;
window.exportAllBookingsAsExcel = exportAllBookingsAsExcel;
window.downloadBooking = downloadBooking;
window.filterBooking = filterBooking;
window.performSearch = performSearch; 

// Pagination state (single source of truth = filteredData)
let currentPage = 1;
let itemsPerPage = 10;

function getTotalPages() {
  const total = filteredData.length;
  return Math.max(1, Math.ceil(total / itemsPerPage));
}

function getPageData() {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredData.slice(start, end);
}

function updateButtonStyles(button, isDisabled) {
  if (!button) return;
  if (isDisabled) {
    button.classList.add('opacity-40', 'cursor-not-allowed');
    button.classList.remove('hover:border-primary', 'hover:text-primary');
  } else {
    button.classList.remove('opacity-40', 'cursor-not-allowed');
    button.classList.add('hover:border-primary', 'hover:text-primary');
  }
}


// Update pagination controls and labels from filteredData
function updatePagination() {
  const totalItems = filteredData.length;
  const totalPagesCount = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Clamp currentPage into valid range
  if (currentPage > totalPagesCount) currentPage = totalPagesCount;
  if (currentPage < 1) currentPage = 1;

  const startRecord = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endRecord = totalItems > 0 ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  const $start = document.getElementById('startRecord');
  const $end = document.getElementById('endRecord');
  const $total = document.getElementById('totalRecords');
  const $page = document.getElementById('currentPageNumber');
  const $pages = document.getElementById('totalPages');

  if ($start) $start.textContent = startRecord;
  if ($end) $end.textContent = endRecord;
  if ($total) $total.textContent = totalItems;
  if ($page) $page.textContent = totalItems > 0 ? currentPage : 0;
  if ($pages) $pages.textContent = Math.ceil(Math.max(0, totalItems) / Math.max(1, itemsPerPage));

  const prevButton = document.getElementById('prevPage');
  const nextButton = document.getElementById('nextPage');

  const onFirst = currentPage === 1 || totalItems === 0;
  const onLast = currentPage >= totalPagesCount || totalItems === 0;

  if (prevButton) {
    prevButton.disabled = onFirst;
    updateButtonStyles(prevButton, prevButton.disabled);
  }
  if (nextButton) {
    nextButton.disabled = onLast;
    updateButtonStyles(nextButton, nextButton.disabled);
  }
}

// Navigate and render using filteredData
function goToPage(page) {
  const totalPagesCount = getTotalPages();
  if (page >= 1 && page <= totalPagesCount) {
    currentPage = page;
    updatePagination();
    renderTable();
  }
}

// Render only the current page
function renderTable() {
  if (!loadingIndicator || !tableContainer || !noDataMessage || !bookingTableBody) {
    console.error('DOM elements not found in renderTable');
    return;
  }

  loadingIndicator.style.display = 'none';
  tableContainer.style.display = 'block';
  noDataMessage.style.display = 'none';

  if (filteredData.length === 0) {
    bookingTableBody.innerHTML = `
      <tr>
        <td colspan="12" class="px-6 py-8 text-center text-gray-500">
          No records match your search criteria.
        </td>
      </tr>
    `;
    updatePagination(); // keep counters in sync when empty
    return;
  }

  try {
    const pageData = getPageData();
    bookingTableBody.innerHTML = pageData.map(booking => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${booking.bookingId || booking.id}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.firstName || booking.name || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.mobile || booking.mobile || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.roomType || booking.roomType || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.roomno || booking.room || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatTime(booking.checkin)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatTime(booking.checkout)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(booking.bookingDate)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatPrice(booking.pricePerNight)}</td>
        <td class="px-6 py-4 whitespace-nowrap">${getStatusBadge(booking.status || 'pending')}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button 
            class="text-gray-600 hover:text-gray-900 p-1 rounded transition-colors" 
            title="Download"
            onclick="downloadBooking(${booking.bookingId || booking.orderId})"
          >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </td>
      </tr>
    `).join('');

    updatePagination();
  } catch (error) {
    console.error('Error rendering table:', error);
    showError('Error displaying booking records');
  }
}

// Wire up pagination controls safely
const $prev = document.getElementById('prevPage');
const $next = document.getElementById('nextPage');
const $perPage = document.getElementById('itemsPerPage');

if ($prev) {
  $prev.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    if (btn.disabled) return;
    goToPage(currentPage - 1);
  });
}

if ($next) {
  $next.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    if (btn.disabled) return;
    goToPage(currentPage + 1);
  });
}

if ($perPage) {
  $perPage.addEventListener('change', (e) => {
    const val = parseInt(e.target.value, 10);
    itemsPerPage = Number.isFinite(val) && val > 0 ? val : 10;
    currentPage = 1; // reset to first page after page-size change
    updatePagination();
    renderTable();
  });
}

