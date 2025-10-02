// Global variables for profile dropdown
let isProfileDropdownOpen = false;


// Main sidebar functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication first
  
  // Get elements
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const externalToggle = document.getElementById("externalToggle");
  const overlay = document.getElementById("overlay");
  const mainContent = document.getElementById("mainContent");
  const bookingToggle  = document.getElementById("bookingToggle");
  const bookingSubmenu = document.getElementById("bookingSubmenu");
  const bookingArrow   = document.getElementById("bookingArrow");

  bookingToggle.addEventListener("click", () => {
    bookingSubmenu.classList.toggle("open");
    bookingArrow.classList.toggle("open");
  });


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
      if (dashboardTitle) dashboardTitle.style.paddingLeft = "0";
      if (headerContent) headerContent.style.paddingLeft = "0";
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
  
  // Initialize booking submenu as open since "Booking Records" is active
  const height = bookingSubmenu.scrollHeight;
  bookingSubmenu.style.maxHeight = height + "px";
  bookingArrow.style.transform = "rotate(180deg)";
});


