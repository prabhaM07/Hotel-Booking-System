// API Configuration
const API_BASE = 'https://68c8b85aceef5a150f622643.mockapi.io';
const BOOKINGS_ENDPOINT = `${API_BASE}/admin`;

// Global variables
let bookingsData = [];
let filteredData = [];

// DOM Elements - Initialize after DOM is loaded
let loadingIndicator, tableContainer, noDataMessage, bookingTableBody, searchInput, exportAllBtn;

// Status configuration for styling
const statusConfig = {
  'pending': { class: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  'completed': { class: 'bg-green-100 text-green-800', label: 'Completed' },
  'cancelled': { class: 'bg-red-100 text-red-800', label: 'Canceled' },
  'canceled': { class: 'bg-red-100 text-red-800', label: 'Canceled' }
};

// Initialize DOM elements
function initializeDOMElements() {
  loadingIndicator = document.getElementById('loadingIndicator');
  tableContainer = document.getElementById('tableContainer');
  noDataMessage = document.getElementById('noDataMessage');
  bookingTableBody = document.getElementById('bookingTableBody');
  searchInput = document.getElementById('searchInput');
  exportAllBtn = document.getElementById('exportAllBtn');
  
  // Debug: Check if elements exist
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

// API Functions
async function fetchBookingsData() {
  try {
    console.log('Starting to fetch booking data...');
    showLoading(true);
    
    const response = await fetch(BOOKINGS_ENDPOINT);
    console.log('Fetch response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Raw API response:', data);
    
    // Extract bookings from nested structure
    if (Array.isArray(data) && data.length > 0 && data[0].bookings) {
      bookingsData = data[0].bookings;
      console.log('Extracted bookings from array:', bookingsData);
    } else if (data.bookings) {
      bookingsData = data.bookings;
      console.log('Extracted bookings from object:', bookingsData);
    } else {
      bookingsData = Array.isArray(data) ? data : [];
      console.log('Using data as direct array:', bookingsData);
    }
    
    filteredData = [...bookingsData];
    console.log('Final bookingsData length:', bookingsData.length);
    
    if (bookingsData.length === 0) {
      console.log('No bookings found, showing no data message');
      showNoData();
    } else {
      console.log('Rendering table with bookings');
      renderTable();
    }
    
  } catch (error) {
    console.error('Error fetching bookings data:', error);
    showError('Failed to load booking records. Please try again later.');
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
  console.log('Loading display updated:', {
    loading: loadingIndicator.style.display,
    table: tableContainer.style.display,
    noData: noDataMessage.style.display
  });
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
          No records match your search criteria.
        </td>
      </tr>
    `;
    return;
  }
  
  try {
    bookingTableBody.innerHTML = filteredData.map(booking => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${booking.orderId || booking.id}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.userName || booking.name || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.phoneNo || booking.phone || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.categoryType || booking.roomType || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.roomNo || booking.room || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(booking.date)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatTime(booking.checkIn)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatTime(booking.checkOut)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(booking.bookedDate)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatPrice(booking.price)}</td>
        <td class="px-6 py-4 whitespace-nowrap">${getStatusBadge(booking.status || 'pending')}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button 
            class="text-gray-600 hover:text-gray-900 p-1 rounded transition-colors" 
            title="Download"
            onclick="downloadBooking(${booking.id || booking.orderId})"
          >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </td>
      </tr>
    `).join('');
    
    console.log('Table rendered successfully');
  } catch (error) {
    console.error('Error rendering table:', error);
    showError('Error displaying booking records');
  }
}

// Search and Filter Functions
function handleSearch() {
  if (!searchInput) return;
  
  const searchTerm = searchInput.value.toLowerCase().trim();
  console.log('Search term:', searchTerm);
  
  if (searchTerm === '') {
    filteredData = [...bookingsData];
  } else {
    filteredData = bookingsData.filter(booking => {
      return (
        (booking.userName || booking.name || '').toLowerCase().includes(searchTerm) ||
        (booking.phoneNo || booking.phone || '').toLowerCase().includes(searchTerm) ||
        (booking.orderId || booking.id || '').toString().toLowerCase().includes(searchTerm) ||
        (booking.categoryType || booking.roomType || '').toLowerCase().includes(searchTerm) ||
        (booking.roomNo || booking.room || '').toLowerCase().includes(searchTerm) ||
        (booking.status || '').toLowerCase().includes(searchTerm)
      );
    });
  }
  
  console.log('Filtered results:', filteredData.length);
  renderTable();
}

// Export Functions
function downloadBooking(bookingId) {
  const booking = bookingsData.find(b => (b.id || b.orderId) == bookingId);
  if (booking) {
    const bookingDetails = `
Booking Details
===============
Order ID: ${booking.orderId || booking.id}
User Name: ${booking.userName || booking.name}
Phone: ${booking.phoneNo || booking.phone}
Room Type: ${booking.categoryType || booking.roomType}
Room Number: ${booking.roomNo || booking.room}
Date: ${formatDate(booking.date)}
Check In: ${formatTime(booking.checkIn)}
Check Out: ${formatTime(booking.checkOut)}
Booked Date: ${formatDate(booking.bookedDate)}
Price: ${formatPrice(booking.price)}
Status: ${booking.status}
    `.trim();
    
    const blob = new Blob([bookingDetails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-${bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

function exportAllBookingsAsPDF() {
  if (bookingsData.length === 0) {
    alert('No data to export');
    return;
  }
  
  // Check if jsPDF is available
  if (typeof window.jspdf === 'undefined') {
    alert('PDF library not loaded. Please refresh the page and try again.');
    return;
  }
  
  try {
    console.log('Starting PDF generation...');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Zyra Hotel - Booking Records', 14, 20);
    
    // Add generation info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')} | Records: ${filteredData.length}`, 14, 28);
    
    // Check if autoTable is available
    if (typeof doc.autoTable === 'function') {
      console.log('Using autoTable for PDF generation');
      
      // Table headers
      const headers = ['Order ID', 'Guest Name', 'Phone', 'Room Type', 'Room No', 'Date', 'Check In', 'Check Out', 'Booked', 'Price', 'Status'];
      
      // Table data
      const rows = filteredData.map(booking => [
        (booking.orderId || booking.id || '').toString(),
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
      
      // Generate table
      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 35,
        styles: { 
          fontSize: 8,
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
    } else {
      console.log('autoTable not available, using manual layout');
      
      // Manual table creation
      let yPos = 40;
      const leftMargin = 14;
      const columnWidths = [25, 35, 35, 30, 25, 25, 20, 20, 25, 20, 25];
      let xPos = leftMargin;
      
      // Headers
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      const headers = ['Order ID', 'Guest Name', 'Phone', 'Room Type', 'Room No', 'Date', 'Check In', 'Check Out', 'Booked', 'Price', 'Status'];
      
      headers.forEach((header, i) => {
        doc.text(header, xPos, yPos);
        xPos += columnWidths[i];
      });
      
      yPos += 8;
      doc.line(leftMargin, yPos, 280, yPos); // Header line
      yPos += 5;
      
      // Data rows
      doc.setFont('helvetica', 'normal');
      filteredData.forEach(booking => {
        if (yPos > 190) { // New page check
          doc.addPage();
          yPos = 20;
        }
        
        xPos = leftMargin;
        const rowData = [
          (booking.orderId || booking.id || '').toString(),
          (booking.userName || booking.name || 'N/A').substring(0, 12),
          (booking.phoneNo || booking.phone || 'N/A').substring(0, 12),
          (booking.categoryType || booking.roomType || 'N/A').substring(0, 10),
          booking.roomNo || booking.room || 'N/A',
          formatDate(booking.date),
          formatTime(booking.checkIn),
          formatTime(booking.checkOut),
          formatDate(booking.bookedDate),
          formatPrice(booking.price),
          booking.status || 'Pending'
        ];
        
        rowData.forEach((data, i) => {
          doc.text(data.toString(), xPos, yPos);
          xPos += columnWidths[i];
        });
        
        yPos += 6;
      });
    }
    
    // Save the PDF
    doc.save(`booking-records-${new Date().toISOString().split('T')[0]}.pdf`);
    console.log('PDF generated successfully');
    
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Error generating PDF: ' + error.message);
  }
}


// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded - Initializing booking records');
  
  // Initialize DOM elements first
  initializeDOMElements();
  
  // Add a small delay to ensure all elements are ready
  setTimeout(() => {
    console.log('Starting data fetch...');
    fetchBookingsData();
  }, 100);
  
  // Set up event listeners
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
  
  if (exportAllBtn) {
    // FIXED: Remove parentheses to pass function reference, not call the function
    exportAllBtn.addEventListener('click', exportAllBookingsAsPDF);
  }
  
  // Filters button (placeholder for now)
  const filtersBtn = document.getElementById('filtersBtn');
  if (filtersBtn) {
    filtersBtn.addEventListener('click', function() {
      alert('Filters functionality can be implemented based on your requirements');
    });
  }
  
  console.log('Event listeners set up');
});

// Make functions available globally for onclick handlers
window.downloadBooking = downloadBooking;
window.fetchBookingsData = fetchBookingsData;
window.exportAllBookingsAsPDF = exportAllBookingsAsPDF;
