// API Configuration
const API_BASE = 'https://68c8b85aceef5a150f622643.mockapi.io';
const REFUND_ENDPOINT = `${API_BASE}/admin`;

// Global variables
let refundBookingsData = [];
let filteredData = [];

// DOM Elements - Initialize after DOM is loaded
let loadingIndicator, tableContainer, noDataMessage, bookingTableBody, searchInput, exportAllBtn;

// Refund Status configuration for styling
const refundStatusConfig = {
  'pending': { class: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  'approved': { class: 'bg-green-100 text-green-800', label: 'Approved' },
  'rejected': { class: 'bg-red-100 text-red-800', label: 'Rejected' }
};

// Booking Status configuration
const statusConfig = {
  'cancelled': { class: 'bg-red-100 text-red-800', label: 'Cancelled' },
  'canceled': { class: 'bg-red-100 text-red-800', label: 'Cancelled' }
};

// Initialize DOM elements
function initializeDOMElements() {
  loadingIndicator = document.getElementById('loadingIndicator');
  tableContainer = document.getElementById('tableContainer');
  noDataMessage = document.getElementById('noDataMessage');
  bookingTableBody = document.getElementById('bookingTableBody');
  searchInput = document.getElementById('searchInput');
  exportAllBtn = document.getElementById('exportAllBtn');
  
  console.log('DOM Elements initialized:', {
    loadingIndicator: !!loadingIndicator,
    tableContainer: !!tableContainer,
    noDataMessage: !!noDataMessage,
    bookingTableBody: !!bookingTableBody,
    searchInput: !!searchInput,
    exportAllBtn: !!exportAllBtn
  });
}

// Utility Functions
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
}

function formatTime(timeString) {
  if (!timeString) return 'N/A';
  if (timeString.includes(':')) return timeString;
  return `${timeString}:00`;
}

function formatPrice(price) {
  if (!price) return '$0';
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

function getRefundStatusBadge(refundStatus) {
  const statusLower = (refundStatus || 'pending').toLowerCase();
  const config = refundStatusConfig[statusLower] || { class: 'bg-gray-100 text-gray-800', label: refundStatus };
  
  return `
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}">
      • ${config.label}
    </span>
  `;
}

// API Functions
async function fetchRefundBookingsData() {
  try {
    console.log('Starting to fetch refund booking data...');
    showLoading(true);
    
    const response = await fetch(REFUND_ENDPOINT);
    console.log('Fetch response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Raw API response:', data);
    
    // CORRECTED: Extract refund bookings from nested structure based on your exact API structure
    if (Array.isArray(data) && data.length > 0 && data[0].refundBookings) {
      refundBookingsData = data[0].refundBookings;
      console.log('Extracted refund bookings from array:', refundBookingsData);
    } else if (data.refundBookings) {
      refundBookingsData = data.refundBookings;
      console.log('Extracted refund bookings from object:', refundBookingsData);
    } else {
      // FIXED: Don't use the array directly, show no data instead
      refundBookingsData = [];
      console.log('No refund bookings found in response');
    }
    
    filteredData = [...refundBookingsData];
    console.log('Final refundBookingsData length:', refundBookingsData.length);
    
    if (refundBookingsData.length === 0) {
      console.log('No refund bookings found, showing no data message');
      showNoData();
    } else {
      console.log('Rendering table with refund bookings');
      renderTable();
    }
    
  } catch (error) {
    console.error('Error fetching refund bookings data:', error);
    showError('Failed to load refund booking records. Please try again later.');
  } finally {
    showLoading(false);
  }
}


// UI Functions
function showLoading(show) {
  console.log('showLoading called with:', show);
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

function showNoData() {
  console.log('showNoData called');
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
  
  const noDataContent = noDataMessage.querySelector('.text-gray-500');
  if (noDataContent) {
    noDataContent.innerHTML = `
      <svg class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Error Loading Data</h3>
      <p class="mt-1 text-sm text-gray-500">${message}</p>
      <button onclick="fetchRefundBookingsData()" class="mt-4 px-4 py-2 bg-[#1D1354] text-white rounded-lg hover:bg-[#2E1B8C] transition-colors">
        Try Again
      </button>
    `;
  }
}

function renderTable() {
  console.log('renderTable called with filteredData length:', filteredData.length);
  
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
          No refund requests match your search criteria.
        </td>
      </tr>
    `;
    return;
  }
  
  try {
    bookingTableBody.innerHTML = filteredData.map(booking => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${booking.orderId}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.userName}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.phoneNo}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.categoryType}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.roomNo}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(booking.date)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatTime(booking.checkIn)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatTime(booking.checkOut)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(booking.bookedDate)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatPrice(booking.refundAmount)}</td>
        <td class="px-6 py-4 whitespace-nowrap">${getStatusBadge(booking.status)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          ${getActionButtons(booking)}
        </td>
      </tr>
    `).join('');
    
    console.log('Table rendered successfully');
  } catch (error) {
    console.error('Error rendering table:', error);
    showError('Error displaying refund booking records');
  }
}

// Generate action buttons based on refund status
function getActionButtons(booking) {
  const refundStatus = booking.refundStatus.toLowerCase();
  
  if (refundStatus === 'pending') {
    return `
      <div class="flex items-center gap-2">
        <button 
          class="text-green-600 hover:text-green-900 p-1 rounded transition-colors" 
          title="Approve Refund"
          onclick="approveRefund(${booking.id})"
        >
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button 
          class="text-red-600 hover:text-red-900 p-1 rounded transition-colors" 
          title="Reject Refund"
          onclick="rejectRefund(${booking.id})"
        >
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;
  } else {
    return `
      <div class="flex items-center">
        ${getRefundStatusBadge(booking.refundStatus)}
      </div>
    `;
  }
}

// Refund Management Functions
function approveRefund(bookingId) {
  const booking = refundBookingsData.find(b => b.id == bookingId);
  if (!booking) return;
  
  const confirmMessage = `Approve refund of ${booking.refundAmount} for ${booking.userName}?\n\nBooking Details:\n- Order ID: ${booking.orderId}\n- Room: ${booking.categoryType} ${booking.roomNo}\n- Reason: ${booking.refundReason}`;
  
  if (confirm(confirmMessage)) {
    // Update booking status
    booking.refundStatus = 'approved';
    booking.refundProcessedDate = new Date().toISOString().split('T')[0];
    
    // Re-render table
    renderTable();
    
    // Show success message
    showSuccessMessage(`✅ Refund approved for ${booking.userName} - ${booking.refundAmount} will be processed`);
    
    console.log('Approved refund for booking:', booking);
  }
}

function rejectRefund(bookingId) {
  const booking = refundBookingsData.find(b => b.id == bookingId);
  if (!booking) return;
  
  const reason = prompt(`Reject refund for ${booking.userName}?\n\nOriginal reason: ${booking.refundReason}\n\nPlease provide rejection reason:`);
  if (reason === null) return;
  
  if (reason.trim() === '') {
    alert('Please provide a valid rejection reason.');
    return;
  }
  
  // Update booking status
  booking.refundStatus = 'rejected';
  booking.rejectionReason = reason.trim();
  booking.refundProcessedDate = new Date().toISOString().split('T')[0];
  booking.refundAmount = '$0';
  
  // Re-render table
  renderTable();
  
  // Show success message
  showSuccessMessage(`❌ Refund rejected for ${booking.userName} - Reason: ${reason.trim()}`);
  
  console.log('Rejected refund for booking:', booking);
}

// Success message function
function showSuccessMessage(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md';
  successDiv.innerHTML = `
    <div class="flex items-start">
      <svg class="w-5 h-5 mr-3 mt-0.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
      </svg>
      <span class="text-sm font-medium">${message}</span>
    </div>
  `;
  
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    if (document.body.contains(successDiv)) {
      document.body.removeChild(successDiv);
    }
  }, 4000);
}

// Search and Filter Functions
function handleSearch() {
  if (!searchInput) return;
  
  const searchTerm = searchInput.value.toLowerCase().trim();
  console.log('Search term:', searchTerm);
  
  if (searchTerm === '') {
    filteredData = [...refundBookingsData];
  } else {
    filteredData = refundBookingsData.filter(booking => {
      return (
        booking.userName.toLowerCase().includes(searchTerm) ||
        booking.phoneNo.toLowerCase().includes(searchTerm) ||
        booking.orderId.toString().toLowerCase().includes(searchTerm) ||
        booking.categoryType.toLowerCase().includes(searchTerm) ||
        booking.roomNo.toLowerCase().includes(searchTerm) ||
        booking.refundStatus.toLowerCase().includes(searchTerm) ||
        booking.refundReason.toLowerCase().includes(searchTerm)
      );
    });
  }
  
  console.log('Filtered results:', filteredData.length);
  renderTable();
}

// Export Functions
function exportAllRefundBookingsAsPDF() {
  if (refundBookingsData.length === 0) {
    alert('No data to export');
    return;
  }
  
  if (typeof window.jspdf === 'undefined') {
    alert('PDF library not loaded. Please refresh the page and try again.');
    return;
  }
  
  try {
    console.log('Starting PDF generation...');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Zyra Hotel - Refund Booking Records', 14, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')} | Records: ${filteredData.length}`, 14, 28);
    
    if (typeof doc.autoTable === 'function') {
      console.log('Using autoTable for PDF generation');
      
      const headers = ['Order ID', 'Guest Name', 'Phone', 'Room Type', 'Room No', 'Date', 'Check In', 'Check Out', 'Refund Amount', 'Status', 'Reason'];
      
      const rows = filteredData.map(booking => [
        booking.orderId.toString(),
        booking.userName,
        booking.phoneNo,
        booking.categoryType,
        booking.roomNo,
        formatDate(booking.date),
        formatTime(booking.checkIn),
        formatTime(booking.checkOut),
        formatPrice(booking.refundAmount),
        booking.refundStatus,
        booking.refundReason.substring(0, 20) + '...'
      ]);
      
      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 35,
        styles: { 
          fontSize: 7,
          cellPadding: 2
        },
        headStyles: { 
          fillColor: [29, 19, 84],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        }
      });
    }
    
    doc.save(`refund-bookings-${new Date().toISOString().split('T')[0]}.pdf`);
    console.log('PDF generated successfully');
    
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Error generating PDF: ' + error.message);
  }
}

// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded - Initializing refund booking records');
  
  initializeDOMElements();
  
  setTimeout(() => {
    console.log('Starting data fetch...');
    fetchRefundBookingsData();
  }, 100);
  
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
  
  if (exportAllBtn) {
    exportAllBtn.addEventListener('click', exportAllRefundBookingsAsPDF);
  }
  
  const filtersBtn = document.getElementById('filtersBtn');
  if (filtersBtn) {
    filtersBtn.addEventListener('click', function() {
      alert('Filters functionality: Filter by status, date range, or refund amount');
    });
  }
  
  console.log('Event listeners set up');
});

// Make functions available globally for onclick handlers
window.approveRefund = approveRefund;
window.rejectRefund = rejectRefund;
window.fetchRefundBookingsData = fetchRefundBookingsData;
window.exportAllRefundBookingsAsPDF = exportAllRefundBookingsAsPDF;
