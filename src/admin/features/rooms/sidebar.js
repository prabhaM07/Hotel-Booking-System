// Global variables for profile dropdown
let isProfileDropdownOpen = false;

// Profile dropdown toggle function (called from HTML onclick)
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



// Fix in sidebar.js - Add null checks
function closeProfileDropdownOnOutsideClick(event) {
    const profileDropdown = document.getElementById('profileDropdown');
    const profileButton = document.getElementById('profileButton');
    
    // Add null checks - THIS WAS MISSING
    if (!profileDropdown || !profileButton) return;
    
    const clickedElement = event.target;
    if (clickedElement && !clickedElement.closest('#profileDropdown') && !clickedElement.closest('#profileButton')) {
        profileDropdown.classList.add('hidden');
    }
}


// Handle profile dropdown menu clicks
function initializeProfileDropdown() {
  const dropdownLinks = document.querySelectorAll('#profileDropdown a');
  
  dropdownLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const text = this.textContent.trim();
      
     if (text === 'View Profile') {
        console.log('Navigating to profile...');
        // Add your profile navigation here
        alert('Profile functionality can be implemented here');
      } else if (text === 'Settings') {
        console.log('Navigating to settings...');
        // Add your settings navigation here
        alert('Settings functionality can be implemented here');
      }
      
      // Close dropdown after click
      document.getElementById('profileDropdown').classList.add('hidden');
      document.getElementById('dropdownArrow').style.transform = 'rotate(0deg)';
      isProfileDropdownOpen = false;
    });
  });
  
  // Add event listener for clicking outside dropdown
  document.addEventListener('click', closeProfileDropdownOnOutsideClick);
}

// Main sidebar functionality
document.addEventListener('DOMContentLoaded', function() {
  

  // Get elements
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const externalToggle = document.getElementById("externalToggle");
  const overlay = document.getElementById("overlay");
  const mainContent = document.getElementById("mainContent");
  const bookingToggle = document.getElementById("bookingToggle");
  const bookingSubmenu = document.getElementById("bookingSubmenu");
  const bookingArrow = document.getElementById("bookingArrow");

  let sidebarVisible = true;
  let isMobile = window.innerWidth < 1024;

  // Initialize sidebar state
  function initializeSidebar() {
    if (isMobile) {
      // On mobile, sidebar starts hidden
      sidebar.style.transform = "translateX(-100%)";
      mainContent.style.marginLeft = "0";
      sidebarVisible = false;
    } else {
      // On desktop, sidebar starts visible
      sidebar.style.transform = "translateX(0)";
      mainContent.style.marginLeft = "320px";
      sidebarVisible = true;
    }
    updateToggleButtons();
    updateContentSpacing();
  }

  // Update toggle buttons visibility and state
  function updateToggleButtons() {
    console.log("Updating toggle buttons. Sidebar visible:", sidebarVisible);
    
    if (sidebarVisible) {
      // Sidebar is visible - hide external button, show internal button
      externalToggle.classList.add("hidden");
      sidebarToggle.style.display = "block";
    } else {
      // Sidebar is hidden - show external button, hide internal button
      externalToggle.classList.remove("hidden");
      externalToggle.style.display = "block";
      sidebarToggle.style.display = "none";
    }
  }

  // Update content spacing to avoid overlap
  function updateContentSpacing() {
    const mainContentArea = document.getElementById("mainContentArea");
    const dashboardTitle = document.getElementById("dashboardTitle");
    const headerContent = document.getElementById("headerContent");
    
    if (!sidebarVisible) {
      // When sidebar is hidden, add extra padding to avoid overlap with external toggle
      if (mainContentArea) mainContentArea.style.paddingTop = "4rem";
      if (dashboardTitle) dashboardTitle.style.paddingLeft = "0rem";
      if (headerContent) headerContent.style.paddingLeft = "0rem";
    } else {
      // When sidebar is visible, use normal spacing
      if (mainContentArea) mainContentArea.style.paddingTop = "1rem";
      if (dashboardTitle) dashboardTitle.style.paddingLeft = "0";
      if (headerContent) headerContent.style.paddingLeft = "0";
    }
  }

  // Toggle sidebar function
  function toggleSidebar() {
    sidebarVisible = !sidebarVisible;

    if (sidebarVisible) {
      // Show sidebar
      sidebar.style.transform = "translateX(0)";
      if (isMobile) {
        overlay.classList.remove("hidden");
        mainContent.style.marginLeft = "0";
      } else {
        mainContent.style.marginLeft = "320px";
      }
    } else {
      // Hide sidebar
      sidebar.style.transform = "translateX(-100%)";
      overlay.classList.add("hidden");
      mainContent.style.marginLeft = "0";
    }

    updateToggleButtons();
    updateContentSpacing();
  }

  // Handle window resize
  window.addEventListener("resize", () => {
    const wasMobile = isMobile;
    isMobile = window.innerWidth < 1024;

    if (wasMobile !== isMobile) {
      // Screen size changed - reinitialize
      overlay.classList.add("hidden");
      initializeSidebar();
    }
  });

  // Event listeners for both toggle buttons
  sidebarToggle.addEventListener("click", toggleSidebar);
  externalToggle.addEventListener("click", toggleSidebar);

  // Close sidebar when clicking overlay (mobile only)
  overlay.addEventListener("click", () => {
    if (isMobile && sidebarVisible) {
      toggleSidebar();
    }
  });

  // Booking submenu toggle
  bookingToggle.addEventListener("click", () => {
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

  // Initialize everything
  initializeSidebar();
  initializeProfileDropdown();

  // Initialize booking submenu as open since "Booking Records" is active
  const height = bookingSubmenu.scrollHeight;
  bookingSubmenu.style.maxHeight = "0px";
  bookingArrow.style.transform = "rotate(0deg)";
});

// Make functions available globally for onclick handlers
window.toggleProfileDropdown = toggleProfileDropdown;

