// Global variables
let isProfileDropdownOpen = false;
let sidebarVisible = true;
let isMobile = window.innerWidth < 1024;

// Profile dropdown functions
function toggleProfileDropdown() {
  const profileDropdown = document.getElementById('profileDropdown');
  const dropdownArrow = document.getElementById('dropdownArrow');
  
  isProfileDropdownOpen = !isProfileDropdownOpen;
  
  if (isProfileDropdownOpen) {
    profileDropdown.classList.remove('hidden');
    dropdownArrow.style.transform = 'rotate(180deg)';
  } else {
    profileDropdown.classList.add('hidden');
    dropdownArrow.style.transform = 'rotate(0deg)';
  }
}

function closeProfileDropdownOnOutsideClick(event) {
  const profileDropdown = document.getElementById('profileDropdown');
  const profileSection = event.target.closest('.p-4');
  
  if (isProfileDropdownOpen && (!profileSection || !profileSection.contains(event.target))) {
    profileDropdown.classList.add('hidden');
    document.getElementById('dropdownArrow').style.transform = 'rotate(0deg)';
    isProfileDropdownOpen = false;
  }
}

// Auth functions
function checkAuthStatus() {
  const adminUser = localStorage.getItem('adminUser');
  if (!adminUser) {
    // Uncomment if you want to redirect to login
    // window.location.href = '../auth/login.html';
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem('adminUser');
  localStorage.removeItem('dashboardData');
  // Uncomment if you want to redirect to login
  // window.location.href = '../auth/login.html';
  alert('Logged out successfully!');
}

// Sidebar functions
function initializeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const externalToggle = document.getElementById("externalToggle");
  
  if (isMobile) {
    sidebar.style.transform = "translateX(-100%)";
    mainContent.classList.remove("lg:ml-80");
    sidebarVisible = false;
    externalToggle.classList.remove("hidden");
  } else {
    sidebar.style.transform = "translateX(0)";
    mainContent.classList.add("lg:ml-80");
    sidebarVisible = true;
    externalToggle.classList.add("hidden");
  }
  updateContentSpacing();
}

function updateContentSpacing() {
  const mainContentArea = document.getElementById("mainContentArea");
  
  if (!sidebarVisible) {
    if (mainContentArea) mainContentArea.style.paddingLeft = "4rem";
  } else {
    if (mainContentArea) mainContentArea.style.paddingLeft = "";
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const mainContent = document.getElementById("mainContent");
  const externalToggle = document.getElementById("externalToggle");
  
  sidebarVisible = !sidebarVisible;

  if (sidebarVisible) {
    sidebar.style.transform = "translateX(0)";
    externalToggle.classList.add("hidden");
    
    if (isMobile) {
      overlay.classList.remove("hidden");
      mainContent.classList.remove("lg:ml-80");
    } else {
      mainContent.classList.add("lg:ml-80");
    }
  } else {
    sidebar.style.transform = "translateX(-100%)";
    overlay.classList.add("hidden");
    mainContent.classList.remove("lg:ml-80");
    externalToggle.classList.remove("hidden");
  }

  updateContentSpacing();
}

// Initialize profile dropdown
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
        alert('Profile functionality can be implemented here');
      }
      
      document.getElementById('profileDropdown').classList.add('hidden');
      document.getElementById('dropdownArrow').style.transform = 'rotate(0deg)';
      isProfileDropdownOpen = false;
    });
  });
  
  document.addEventListener('click', closeProfileDropdownOnOutsideClick);
}

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
  checkAuthStatus();

  const sidebarToggle = document.getElementById("sidebarToggle");
  const externalToggle = document.getElementById("externalToggle");
  const overlay = document.getElementById("overlay");
  const bookingToggle = document.getElementById("bookingToggle");
  const bookingSubmenu = document.getElementById("bookingSubmenu");
  const bookingArrow = document.getElementById("bookingArrow");

  // Initialize sidebar
  initializeSidebar();
  initializeProfileDropdown();

  // Event listeners for toggle buttons
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
  }
  
  if (externalToggle) {
    externalToggle.addEventListener("click", toggleSidebar);
  }

  // Close sidebar when clicking overlay (mobile)
  if (overlay) {
    overlay.addEventListener("click", () => {
      if (isMobile && sidebarVisible) {
        toggleSidebar();
      }
    });
  }

  // Booking submenu toggle
  if (bookingToggle && bookingSubmenu && bookingArrow) {
    // ENSURE BOOKING SUBMENU STARTS CLOSED
    bookingSubmenu.style.maxHeight = "0px";
    bookingArrow.style.transform = "rotate(0deg)";
    
    bookingToggle.addEventListener("click", () => {
      const currentMaxHeight = bookingSubmenu.style.maxHeight;
      const isOpen = currentMaxHeight && currentMaxHeight !== "0px";

      if (isOpen) {
        // Close submenu
        bookingSubmenu.style.maxHeight = "0px";
        bookingArrow.style.transform = "rotate(0deg)";
      } else {
        // Open submenu
        const height = bookingSubmenu.scrollHeight;
        bookingSubmenu.style.maxHeight = height + "px";
        bookingArrow.style.transform = "rotate(180deg)";
      }
    });
  }

  // Handle window resize
  window.addEventListener("resize", () => {
    const wasMobile = isMobile;
    isMobile = window.innerWidth < 1024;

    if (wasMobile !== isMobile) {
      const overlay = document.getElementById("overlay");
      if (overlay) overlay.classList.add("hidden");
      initializeSidebar();
    }
  });
});

// Make functions available globally
window.toggleProfileDropdown = toggleProfileDropdown;
window.logout = logout;
window.checkAuthStatus = checkAuthStatus;
