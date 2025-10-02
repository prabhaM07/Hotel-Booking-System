// =================== DASHBOARD CONFIGURATION ===================
const API_BASE = 'https://68c8b85aceef5a150f622643.mockapi.io';

// Chart variables
let userAnalyticsChart;
let userTrendsChart;

// Data visibility states
let analyticsDataVisible = {
  totalBookings: true,
  cancelledBookings: true
};

let userDataVisible = {
  totalUsers: true,
  activeUsers: true,
  inactiveUsers: true
};

// Month names array
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];

// Global data storage
let dashboardData = null;

// =================== AUTHENTICATION CHECK ===================

// Check if user is logged in
function checkAuthStatus() {
  const adminUser = localStorage.getItem('adminUser');
 
  return true;
}

// Add logout functionality
function logout() {
  localStorage.removeItem('adminUser');
}

// =================== API DATA INTEGRATION ===================

// Load dashboard data from API and update UI
async function fetchAndIntegrateDashboardData() {
  try {
    const response = await fetch(`${API_BASE}/admin/2`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    dashboardData = await response.json();
    console.log('Fetched fresh dashboard data:', dashboardData);
    
    // Update dashboard components
    updateStatsCards(dashboardData.dashboard.stats);
    updateRecentActivity(dashboardData.dashboard.recentActivity || []);
    updateRoomOccupancy(dashboardData.dashboard.roomOccupancy || {});
    updateAdminInfo(dashboardData.dashboard.admin || {});
    updateActivityBadge(dashboardData.dashboard.recentActivity);
    
    // Initialize charts with real data AFTER data is loaded
    await initializeChartsWithRealData(
      dashboardData.dashboard.analytics, 
      dashboardData.dashboard.bookingTrends
    );
    
    // Setup event listeners AFTER charts are initialized
    setupChartEventListeners();
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showErrorMessage('Unable to load dashboard data. Please refresh the page.');
  }
}

// Show error message in UI
function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
  errorDiv.textContent = message;
  const mainContent = document.getElementById('mainContentArea');
  if (mainContent) {
    mainContent.insertBefore(errorDiv, mainContent.firstChild);
  }
}

// Update stats cards with real data
function updateStatsCards(stats) {
  const bookingsStat = document.querySelector('[data-stat="bookings"]');
  const refundsStat = document.querySelector('[data-stat="refunds"]');
  const queriesStat = document.querySelector('[data-stat="queries"]');
  const cancelledStat = document.querySelector('[data-stat="cancelled"]');
  
  if (bookingsStat && stats.newBookings) bookingsStat.textContent = stats.newBookings;
  if (refundsStat && stats.refundRequests) refundsStat.textContent = stats.refundRequests;
  if (queriesStat && stats.userQueries) queriesStat.textContent = stats.userQueries;
  if (cancelledStat && stats.cancelled) cancelledStat.textContent = stats.cancelled;
}

// Update recent activity with real data
function updateRecentActivity(activities) {
  const activityContainer = document.querySelector('.space-y-3');
  if (!activityContainer || !Array.isArray(activities)) return;
  
  activityContainer.innerHTML = '';
  activities.forEach(activity => {
    const statusColors = {
      'booking': 'green',
      'refund': 'orange', 
      'query': 'blue',
      'cancelled': 'red'
    };
    
    const color = statusColors[activity.type] || 'gray';
    
    const activityElement = `
      <div class="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
        <div class="w-2 h-2 bg-${color}-500 rounded-full mt-2 flex-shrink-0"></div>
        <div class="flex-1">
          <p class="text-sm text-gray-700 font-medium">${activity.message}</p>
          <p class="text-xs text-gray-500 mt-1">${activity.details}</p>
          <p class="text-xs text-gray-400">${activity.timestamp}</p>
        </div>
      </div>
    `;
    activityContainer.innerHTML += activityElement;
  });
}

// Update activity badge count
function updateActivityBadge(activities) {
  const activityBadge = document.getElementById('activityBadge');
  if (activityBadge && Array.isArray(activities)) {
    const newActivities = activities.filter(activity => activity.status === 'new').length;
    activityBadge.textContent = `${newActivities} new`;
  }
}

// Update room occupancy with real data
function updateRoomOccupancy(occupancy) {
  if (!occupancy || !occupancy.deluxe || !occupancy.standard || !occupancy.suite) {
    console.warn("Room occupancy data missing or incomplete.");
    return;
  }
  
  // Deluxe rooms
  const deluxePercent = Math.round((occupancy.deluxe.occupied / occupancy.deluxe.total) * 100);
  const deluxeBar = document.querySelector('[data-room="deluxe"] .bg-green-500');
  const deluxeText = document.querySelector('[data-room="deluxe"] .text-gray-700');
  if (deluxeBar) deluxeBar.style.width = `${deluxePercent}%`;
  if (deluxeText) deluxeText.textContent = `${deluxePercent}%`;
  
  // Standard rooms  
  const standardPercent = Math.round((occupancy.standard.occupied / occupancy.standard.total) * 100);
  const standardBar = document.querySelector('[data-room="standard"] .bg-blue-500');
  const standardText = document.querySelector('[data-room="standard"] .text-gray-700');
  if (standardBar) standardBar.style.width = `${standardPercent}%`;
  if (standardText) standardText.textContent = `${standardPercent}%`;
  
  // Suite rooms
  const suitePercent = Math.round((occupancy.suite.occupied / occupancy.suite.total) * 100);
  const suiteBar = document.querySelector('[data-room="suite"] .bg-orange-500');
  const suiteText = document.querySelector('[data-room="suite"] .text-gray-700');
  if (suiteBar) suiteBar.style.width = `${suitePercent}%`;
  if (suiteText) suiteText.textContent = `${suitePercent}%`;
}

// Update admin info in sidebar
function updateAdminInfo(admin) {
  const adminNameElement = document.querySelector('.sidebar-footer p');
  if (adminNameElement && admin.name) {
    adminNameElement.textContent = admin.name;
  }
}

// =================== CHARTS WITH REAL DATA ===================

// Initialize charts with real API data
async function initializeChartsWithRealData(analytics, bookingTrends) {
  if (!analytics || !bookingTrends) {
    console.error('Analytics or booking trends data missing');
    return;
  }
  
  // Initialize User Trends Chart
  const userCtx = document.getElementById('userTrendsChart');
  if (userCtx) {
    initUserTrendsChartWithRealData(userCtx.getContext('2d'), analytics);
  }
  
  // Initialize Booking Analytics Chart
  const analyticsCtx = document.getElementById('userAnalyticsChart');
  if (analyticsCtx) {
    initUserAnalyticsChartWithRealData(analyticsCtx.getContext('2d'), bookingTrends);
  }
}

// User Trends Chart with real data (12 months)
function initUserTrendsChartWithRealData(ctx, analytics) {
  const datasets = [];

  if (analytics.activeUserTrends && analytics.inactiveUserTrends) {
    datasets.push(
      {
        label: 'Active Users',
        data: analytics.activeUserTrends,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        hidden: !userDataVisible.activeUsers
      },
      {
        label: 'Inactive Users',
        data: analytics.inactiveUserTrends,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        hidden: !userDataVisible.inactiveUsers
      }
    );
  }

  userTrendsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#374151',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          intersect: false,
          mode: 'index',
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + ' users';
            },
            afterBody: function(context) {
              if (analytics.userTrends && analytics.userTrends[context[0].dataIndex]) {
                const index = context[0].dataIndex;
                const total = analytics.userTrends[index];
                return 'Total Users: ' + total.toLocaleString();
              }
              return '';
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Month', color: '#6B7280' },
          grid: { color: '#F3F4F6', drawBorder: false },
          ticks: { color: '#6B7280', font: { size: 11 } }
        },
        y: {
          title: { display: true, text: 'Number of Users', color: '#6B7280' },
          beginAtZero: true,
          grid: { color: '#F3F4F6', drawBorder: false },
          ticks: { 
            color: '#6B7280', 
            font: { size: 11 },
            callback: value => value.toLocaleString()
          }
        }
      }
    }
  });
  
  setupUserTrendsLegend();
}

// Booking Analytics Chart with real data
function initUserAnalyticsChartWithRealData(ctx, bookingTrends) {
  const year = document.getElementById('analyticsYear')?.value || '2025';
  const yearData = bookingTrends[year];
  
  if (!yearData) {
    console.warn(`No booking trends data found for year ${year}`);
    return;
  }
  
  userAnalyticsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: yearData.months || [],
      datasets: [
        {
          label: 'Total Bookings',
          data: yearData.bookings || [],
          backgroundColor: 'rgba(37, 99, 235, 0.8)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
          hidden: !analyticsDataVisible.totalBookings
        },
        {
          label: 'Cancelled Bookings',
          data: yearData.cancelled || [],
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
          hidden: !analyticsDataVisible.cancelledBookings
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#374151',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: context => context.dataset.label + ': ' + context.parsed.y.toLocaleString() + ' bookings'
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Month', color: '#6B7280' },
          ticks: { color: '#4B5563', font: { size: 11 }, maxRotation: 0 },
          grid: { display: false, color: '#F3F4F6' }
        },
        y: {
          title: { display: true, text: 'Number of Bookings', color: '#6B7280' },
          beginAtZero: true,
          ticks: { 
            color: '#4B5563', 
            font: { size: 11 },
            callback: value => value.toLocaleString()
          },
          grid: { color: '#F3F4F6', drawBorder: false }
        }
      }
    }
  });
  
  setupAnalyticsInteractiveLegend();
}

// =================== CHART UPDATE FUNCTIONS ===================

// Setup chart event listeners
function setupChartEventListeners() {
  console.log('Setting up chart event listeners...');
  
  const analyticsYearSelect = document.getElementById('analyticsYear');
  const analyticsStartMonthSelect = document.getElementById('analyticsStartMonth');
  const analyticsEndMonthSelect = document.getElementById('analyticsEndMonth');
  const userYearSelect = document.getElementById('userYearSelect');
  
  if (analyticsYearSelect) {
    analyticsYearSelect.addEventListener('change', updateUserAnalyticsChart);
    console.log('Analytics year select listener added');
  } else {
    console.warn('Analytics year select element not found');
  }
  
  if (analyticsStartMonthSelect) {
    analyticsStartMonthSelect.addEventListener('change', updateUserAnalyticsChart);
    console.log('Analytics start month select listener added');
  } else {
    console.warn('Analytics start month select element not found');
  }
  
  if (analyticsEndMonthSelect) {
    analyticsEndMonthSelect.addEventListener('change', updateUserAnalyticsChart);
    console.log('Analytics end month select listener added');
  } else {
    console.warn('Analytics end month select element not found');
  }
  
  if (userYearSelect) {
    userYearSelect.addEventListener('change', updateUserTrendsChart);
    console.log('User year select listener added');
  } else {
    console.warn('User year select element not found');
  }
}

// Update booking analytics chart with filtering
function updateUserAnalyticsChart() {
  console.log('Updating user analytics chart...');
  
  if (!userAnalyticsChart || !dashboardData) {
    console.warn('Chart or dashboard data not available');
    return;
  }
  
  const yearSelect = document.getElementById('analyticsYear');
  const startMonthSelect = document.getElementById('analyticsStartMonth');
  const endMonthSelect = document.getElementById('analyticsEndMonth');
  
  const selectedYear = parseInt(yearSelect?.value || 2025);
  const selectedStartMonth = parseInt(startMonthSelect?.value || 1);
  const selectedEndMonth = parseInt(endMonthSelect?.value || 12);
  
  if (selectedStartMonth > selectedEndMonth) {
    alert('Start month must be before or equal to end month');
    return;
  }
  
  // FIXED: Correct data path
  const yearData = dashboardData.dashboard.bookingTrends[selectedYear];
  if (!yearData) {
    console.warn(`No data found for year ${selectedYear}`);
    return;
  }
  
  const startIndex = selectedStartMonth - 1;
  const endIndex = selectedEndMonth - 1;
  
  const filteredLabels = yearData.months.slice(startIndex, endIndex + 1);
  const filteredBookings = yearData.bookings.slice(startIndex, endIndex + 1);
  const filteredCancelled = yearData.cancelled.slice(startIndex, endIndex + 1);
  
  userAnalyticsChart.data.labels = filteredLabels;
  userAnalyticsChart.data.datasets[0].data = filteredBookings;
  userAnalyticsChart.data.datasets[1].data = filteredCancelled;
  userAnalyticsChart.data.datasets[0].hidden = !analyticsDataVisible.totalBookings;
  userAnalyticsChart.data.datasets[1].hidden = !analyticsDataVisible.cancelledBookings;
  
  userAnalyticsChart.update('active');
  console.log('Chart updated successfully');
}

// Update user trends chart on year selection
function updateUserTrendsChart() {
  console.log('Updating user trends chart...');
  
  if (!userTrendsChart || !dashboardData) {
    console.warn('Chart or dashboard data not available');
    return;
  }
  
  const yearSelect = document.getElementById('userYearSelect');
  const selectedYear = parseInt(yearSelect?.value || 2025);
  
  // FIXED: Correct data path
  const analytics = dashboardData.dashboard.analytics;
  
  if (analytics.userTrends && userTrendsChart.data.datasets[0]) {
    userTrendsChart.data.datasets[0].data = analytics.userTrends;
  }
  if (analytics.activeUserTrends && userTrendsChart.data.datasets[1]) {
    userTrendsChart.data.datasets[1].data = analytics.activeUserTrends;
  }
  if (analytics.inactiveUserTrends && userTrendsChart.data.datasets[2]) {
    userTrendsChart.data.datasets[2].data = analytics.inactiveUserTrends;
  }
  
  userTrendsChart.data.datasets.forEach((dataset, index) => {
    if (index === 0) dataset.hidden = !userDataVisible.totalUsers;
    if (index === 1) dataset.hidden = !userDataVisible.activeUsers;
    if (index === 2) dataset.hidden = !userDataVisible.inactiveUsers;
  });
  
  userTrendsChart.update('active');
  console.log('User trends chart updated successfully');
}

// =================== INTERACTIVE LEGENDS ===================

// Setup analytics chart legend toggle
function setupAnalyticsInteractiveLegend() {
  const totalLegend = document.getElementById('totalBookingsLegend');
  const cancelledLegend = document.getElementById('cancelledBookingsLegend');
  
  if (totalLegend) {
    totalLegend.addEventListener('click', function() {
      analyticsDataVisible.totalBookings = !analyticsDataVisible.totalBookings;
      if (userAnalyticsChart && userAnalyticsChart.data.datasets[0]) {
        userAnalyticsChart.data.datasets[0].hidden = !analyticsDataVisible.totalBookings;
        userAnalyticsChart.update('active');
        
        const legendBox = this.querySelector('div');
        if (analyticsDataVisible.totalBookings) {
          legendBox.style.opacity = '1';
          this.style.opacity = '1';
        } else {
          legendBox.style.opacity = '0.3';
          this.style.opacity = '0.5';
        }
      }
    });
  }
  
  if (cancelledLegend) {
    cancelledLegend.addEventListener('click', function() {
      analyticsDataVisible.cancelledBookings = !analyticsDataVisible.cancelledBookings;
      if (userAnalyticsChart && userAnalyticsChart.data.datasets[1]) {
        userAnalyticsChart.data.datasets[1].hidden = !analyticsDataVisible.cancelledBookings;
        userAnalyticsChart.update('active');
        
        const legendBox = this.querySelector('div');
        if (analyticsDataVisible.cancelledBookings) {
          legendBox.style.opacity = '1';
          this.style.opacity = '1';
        } else {
          legendBox.style.opacity = '0.3';
          this.style.opacity = '0.5';
        }
      }
    });
  }
}

// Setup user trends chart legend toggle
function setupUserTrendsLegend() {
  const totalLegend = document.getElementById('totalUsersLegend');
  const activeLegend = document.getElementById('activeUsersLegend');
  const inactiveLegend = document.getElementById('inactiveUsersLegend');
  
  if (totalLegend) {
    totalLegend.addEventListener('click', function() {
      userDataVisible.totalUsers = !userDataVisible.totalUsers;
      if (userTrendsChart && userTrendsChart.data.datasets[0]) {
        userTrendsChart.data.datasets[0].hidden = !userDataVisible.totalUsers;
        userTrendsChart.update('active');
        
        const legendBox = this.querySelector('div');
        if (userDataVisible.totalUsers) {
          legendBox.style.opacity = '1';
          this.style.opacity = '1';
        } else {
          legendBox.style.opacity = '0.3';
          this.style.opacity = '0.5';
        }
      }
    });
  }
  
  if (activeLegend) {
    activeLegend.addEventListener('click', function() {
      userDataVisible.activeUsers = !userDataVisible.activeUsers;
      if (userTrendsChart && userTrendsChart.data.datasets[1]) {
        userTrendsChart.data.datasets[1].hidden = !userDataVisible.activeUsers;
        userTrendsChart.update('active');
        
        const legendBox = this.querySelector('div');
        if (userDataVisible.activeUsers) {
          legendBox.style.opacity = '1';
          this.style.opacity = '1';
        } else {
          legendBox.style.opacity = '0.3';
          this.style.opacity = '0.5';
        }
      }
    });
  }
  
  if (inactiveLegend) {
    inactiveLegend.addEventListener('click', function() {
      userDataVisible.inactiveUsers = !userDataVisible.inactiveUsers;
      if (userTrendsChart && userTrendsChart.data.datasets[2]) {
        userTrendsChart.data.datasets[2].hidden = !userDataVisible.inactiveUsers;
        userTrendsChart.update('active');
        
        const legendBox = this.querySelector('div');
        if (userDataVisible.inactiveUsers) {
          legendBox.style.opacity = '1';
          this.style.opacity = '1';
        } else {
          legendBox.style.opacity = '0.3';
          this.style.opacity = '0.5';
        }
      }
    });
  }
}

// =================== PROFILE DROPDOWN FUNCTIONALITY ===================

// Profile dropdown toggle
function toggleProfileDropdown() {
  const dropdown = document.getElementById('profileDropdown');
  const arrow = document.getElementById('dropdownArrow');
  
  if (dropdown && arrow) {
    if (dropdown.classList.contains('hidden')) {
      dropdown.classList.remove('hidden');
      arrow.style.transform = 'rotate(180deg)';
    } else {
      dropdown.classList.add('hidden');
      arrow.style.transform = 'rotate(0deg)';
    }
  }
}

// Close dropdown on clicking outside
function handleOutsideClick(event) {
  const profileSection = event.target.closest('.cursor-pointer');
  const dropdown = document.getElementById('profileDropdown');
  const arrow = document.getElementById('dropdownArrow');
  
  if (!profileSection && dropdown && arrow && !dropdown.classList.contains('hidden')) {
    dropdown.classList.add('hidden');
    arrow.style.transform = 'rotate(0deg)';
  }
}

// Initialize dropdown menu click handling
function initializeProfileDropdown() {
  const dropdownLinks = document.querySelectorAll('#profileDropdown a');
  
  dropdownLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const text = this.textContent.trim();
      
      if (text === 'Logout') {
        if (confirm('Are you sure you want to logout?')) {
          logout();
        }
      } else if (text === 'View Profile') {
        console.log('Navigating to profile...');
      } else if (text === 'Settings') {
        console.log('Navigating to settings...');
      }
      
      // Close dropdown after click
      const dropdown = document.getElementById('profileDropdown');
      const arrow = document.getElementById('dropdownArrow');
      if (dropdown && arrow) {
        dropdown.classList.add('hidden');
        arrow.style.transform = 'rotate(0deg)';
      }
    });
  });
}

// =================== SIDEBAR FUNCTIONALITY ===================

const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const externalToggle = document.getElementById("externalToggle");
const overlay = document.getElementById("overlay");
const mainContent = document.getElementById("mainContent");
const mainContentArea = document.getElementById("mainContentArea");
const dashboardGrid = document.getElementById("dashboardGrid");
const recentActivity = document.getElementById("recentActivity");
const dashboardTitle = document.getElementById("dashboardTitle");
const headerContent = document.getElementById("headerContent");
const bookingToggle = document.getElementById("bookingToggle");
const bookingSubmenu = document.getElementById("bookingSubmenu");
const bookingArrow = document.getElementById("bookingArrow");

let sidebarVisible = true;
let isMobile = window.innerWidth < 1024;

function initializeSidebar() {
  if (isMobile) {
    if (sidebar) sidebar.style.transform = "translateX(-100%)";
    if (mainContent) mainContent.style.marginLeft = "0";
    sidebarVisible = false;
  } else {
    if (sidebar) sidebar.style.transform = "translateX(0)";
    if (mainContent) mainContent.style.marginLeft = "320px";
    sidebarVisible = true;
  }
  updateDashboardGrid();
  updateToggleButtons();
  updateContentSpacing();
}

function updateToggleButtons() {
  if (externalToggle && sidebarToggle) {
    if (sidebarVisible) {
      externalToggle.classList.add("hidden");
      sidebarToggle.style.display = "block";
    } else {
      externalToggle.classList.remove("hidden");
      sidebarToggle.style.display = "none";
    }
  }
}

function updateContentSpacing() {
  if (mainContentArea && dashboardTitle && headerContent) {
    if (!sidebarVisible) {
      mainContentArea.style.paddingTop = "4rem";
      dashboardTitle.style.paddingLeft = "0";
      headerContent.style.paddingLeft = "3rem";
    } else {
      mainContentArea.style.paddingTop = "1rem";
      dashboardTitle.style.paddingLeft = "0";
      headerContent.style.paddingLeft = "0";
    }
  }
}

function updateDashboardGrid() {
  if (dashboardGrid && recentActivity) {
    if (isMobile || !sidebarVisible) {
      dashboardGrid.className = "grid grid-cols-1 gap-0";
      recentActivity.className = "xl:col-span-1 mt-8";
    } else {
      dashboardGrid.className = "grid grid-cols-1 xl:grid-cols-3 gap-8";
    }
  }
}

function toggleSidebar() {
  sidebarVisible = !sidebarVisible;
  
  if (sidebar && mainContent && overlay) {
    if (sidebarVisible) {
      sidebar.style.transform = "translateX(0)";
      if (isMobile) {
        overlay.classList.remove("hidden");
        mainContent.style.marginLeft = "0";
      } else {
        mainContent.style.marginLeft = "320px";
      }
    } else {
      sidebar.style.transform = "translateX(-100%)";
      overlay.classList.add("hidden");
      mainContent.style.marginLeft = "0";
    }
  }
  
  updateDashboardGrid();
  updateToggleButtons();
  updateContentSpacing();
}

// Setup booking dropdown functionality
function setupBookingDropdown() {
  if (bookingToggle && bookingSubmenu && bookingArrow) {
    bookingToggle.addEventListener('click', function() {
      const currentMaxHeight = bookingSubmenu.style.maxHeight;
      const isOpen = currentMaxHeight && currentMaxHeight !== "0px";
      
      if (isOpen) {
        bookingSubmenu.style.maxHeight = "0px";
        bookingArrow.style.transform = "rotate(0deg)";
      } else {
        const height = bookingSubmenu.scrollHeight;
        bookingSubmenu.style.maxHeight = height + "px";
        bookingArrow.style.transform = "rotate(180deg)";
      }
    });
  }
}

// =================== EVENT LISTENERS ===================

window.addEventListener("resize", () => {
  const wasMobile = isMobile;
  isMobile = window.innerWidth < 1024;
  
  if (wasMobile !== isMobile) {
    if (overlay) overlay.classList.add("hidden");
    initializeSidebar();
  }
});

// =================== INITIALIZATION ===================

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded - Initializing dashboard...');
  
  // Check authentication first
  if (!checkAuthStatus()) {
    return;
  }
  
  // Initialize sidebar
  initializeSidebar();
  
  // Setup booking dropdown
  setupBookingDropdown();
  
  // Load dashboard data and initialize charts
  fetchAndIntegrateDashboardData();
  
  // Initialize profile dropdown
  initializeProfileDropdown();
  
  // Add click outside listener for profile dropdown
  document.addEventListener('click', handleOutsideClick);
  
  // Sidebar toggle listeners
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
  }
  if (externalToggle) {
    externalToggle.addEventListener("click", toggleSidebar);
  }
  
  // Overlay click listener
  if (overlay) {
    overlay.addEventListener("click", () => {
      if (isMobile && sidebarVisible) {
        toggleSidebar();
      }
    });
  }
});

// Make functions globally available
window.toggleProfileDropdown = toggleProfileDropdown;
window.logout = logout;

console.log('Dashboard script loaded successfully');
