// Get elements
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const externalToggle = document.getElementById("externalToggle");
const overlay = document.getElementById("overlay");
const mainContent = document.getElementById("mainContent");
const bookingToggle = document.getElementById("bookingToggle");
const bookingSubmenu = document.getElementById("bookingSubmenu");
const bookingArrow = document.getElementById("bookingArrow");

// Add Modal elements
const addModal = document.getElementById("addModal");
const closeAddModal = document.getElementById("closeAddModal");
const cancelAdd = document.getElementById("cancelAdd");
const addForm = document.getElementById("addRoomForm");
const addRoomBtn = document.getElementById("addRoomBtn");
const addImageInput = document.getElementById("addImageInput");
const addFileName = document.getElementById("addFileName");

// Edit Modal elements
const editModal = document.getElementById("editModal");
const closeEditModal = document.getElementById("closeEditModal");
const cancelEdit = document.getElementById("cancelEdit");
const editForm = document.getElementById("editRoomForm");
const editButtons = document.querySelectorAll(".edit-btn");

// Image Modal elements
const imageModal = document.getElementById("imageModal");
const imageModalTitle = document.getElementById("imageModalTitle");
const cancelImage = document.getElementById("cancelImage");
const submitImage = document.getElementById("submitImage");
const imageButtons = document.querySelectorAll(".image-btn");
const roomImageInput = document.getElementById("roomImageInput");
const roomImageFileName = document.getElementById("roomImageFileName");
const addImageBtn = document.getElementById("addImageBtn");

let sidebarVisible = true;
let isMobile = window.innerWidth < 1024;

// Sample room data for demonstration
const roomData = {
  1: {
    name: "Simple room",
    area: "200 sq.ft",
    price: "$15",
    quantity: "30",
    adult: "5",
    children: "4",
    features: { bedroom: true, kitchen: false, balcony: false },
    facilities: { wifi: true, ac: false, tv: true, heater: false, geyser1: true, geyser2: false },
    description: "A comfortable simple room with basic amenities."
  },
  2: {
    name: "Deluxe room",
    area: "250 sq.ft",
    price: "$25",
    quantity: "25",
    adult: "6",
    children: "5",
    features: { bedroom: true, kitchen: true, balcony: false },
    facilities: { wifi: true, ac: true, tv: true, heater: false, geyser1: true, geyser2: false },
    description: "A spacious deluxe room with modern facilities."
  },
  3: {
    name: "Luxury room",
    area: "300 sq.ft",
    price: "$25",
    quantity: "36",
    adult: "7",
    children: "4",
    features: { bedroom: true, kitchen: true, balcony: true },
    facilities: { wifi: true, ac: true, tv: true, heater: true, geyser1: true, geyser2: true },
    description: "A luxury room with premium amenities and balcony view."
  },
  4: {
    name: "Supreme deluxe room",
    area: "350 sq.ft",
    price: "$35",
    quantity: "30",
    adult: "9",
    children: "3",
    features: { bedroom: true, kitchen: true, balcony: true },
    facilities: { wifi: true, ac: true, tv: true, heater: true, geyser1: true, geyser2: true },
    description: "The ultimate luxury experience with all premium facilities."
  }
};

// Initialize sidebar state
function initializeSidebar() {
  if (isMobile) {
    sidebar.style.transform = "translateX(-100%)";
    mainContent.style.marginLeft = "0";
    sidebarVisible = false;
  } else {
    sidebar.style.transform = "translateX(0)";
    mainContent.style.marginLeft = "320px";
    sidebarVisible = true;
  }
  updateToggleButtons();
  updateContentSpacing();
}

// Update toggle buttons visibility and state
function updateToggleButtons() {
  if (sidebarVisible) {
    externalToggle.classList.add("hidden");
    sidebarToggle.style.display = "block";
  } else {
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
    if (mainContentArea) mainContentArea.style.paddingTop = "4rem";
    if (dashboardTitle) dashboardTitle.style.paddingLeft = "3rem";
    if (headerContent) headerContent.style.paddingLeft = "3rem";
  } else {
    if (mainContentArea) mainContentArea.style.paddingTop = "1rem";
    if (dashboardTitle) dashboardTitle.style.paddingLeft = "0";
    if (headerContent) headerContent.style.paddingLeft = "0";
  }
}

// Toggle sidebar function
function toggleSidebar() {
  sidebarVisible = !sidebarVisible;

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

  updateToggleButtons();
  updateContentSpacing();
}

// Add Modal functions
function openAddModal() {
  addModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeAddModalFn() {
  addModal.classList.add("hidden");
  document.body.style.overflow = "";
  addForm.reset();
  addFileName.textContent = "No file chosen";
}

// Edit Modal functions
function openEditModal(roomId) {
  const room = roomData[roomId];
  if (!room) return;

  // Populate form fields
  document.getElementById("editName").value = room.name;
  document.getElementById("editArea").value = room.area;
  document.getElementById("editPrice").value = room.price;
  document.getElementById("editQuantity").value = room.quantity;
  document.getElementById("editAdult").value = room.adult;
  document.getElementById("editChildren").value = room.children;
  document.getElementById("editDescription").value = room.description;

  // Set checkboxes for features
  document.getElementById("editBedroom").checked = room.features.bedroom;
  document.getElementById("editKitchen").checked = room.features.kitchen;
  document.getElementById("editBalcony").checked = room.features.balcony;

  // Set checkboxes for facilities
  document.getElementById("editWiFi").checked = room.facilities.wifi;
  document.getElementById("editAC").checked = room.facilities.ac;
  document.getElementById("editTV").checked = room.facilities.tv;
  document.getElementById("editHeater").checked = room.facilities.heater;
  document.getElementById("editGeyser1").checked = room.facilities.geyser1;
  document.getElementById("editGeyser2").checked = room.facilities.geyser2;

  // Show modal
  editModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeEditModalFn() {
  editModal.classList.add("hidden");
  document.body.style.overflow = "";
  editForm.reset();
}

// Image Modal functions
function openImageModal(roomId) {
  const room = roomData[roomId];
  if (!room) return;

  // Set modal title
  imageModalTitle.textContent = room.name;
  
  // Show modal
  imageModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeImageModalFn() {
  imageModal.classList.add("hidden");
  document.body.style.overflow = "";
  roomImageFileName.textContent = "No file chosen";
}

// Handle window resize
window.addEventListener("resize", () => {
  const wasMobile = isMobile;
  isMobile = window.innerWidth < 1024;

  if (wasMobile !== isMobile) {
    overlay.classList.add("hidden");
    initializeSidebar();
  }
});

// Event listeners for sidebar
sidebarToggle.addEventListener("click", toggleSidebar);
externalToggle.addEventListener("click", toggleSidebar);

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

// Add Modal event listeners
addRoomBtn.addEventListener("click", openAddModal);
closeAddModal.addEventListener("click", closeAddModalFn);
cancelAdd.addEventListener("click", closeAddModalFn);

// Edit Modal event listeners
editButtons.forEach(button => {
  button.addEventListener("click", (e) => {
    const row = e.target.closest("tr");
    const roomId = row.getAttribute("data-room-id");
    openEditModal(roomId);
  });
});

closeEditModal.addEventListener("click", closeEditModalFn);
cancelEdit.addEventListener("click", closeEditModalFn);

// Image Modal event listeners
imageButtons.forEach(button => {
  button.addEventListener("click", (e) => {
    const row = e.target.closest("tr");
    const roomId = row.getAttribute("data-room-id");
    openImageModal(roomId);
  });
});

cancelImage.addEventListener("click", closeImageModalFn);
submitImage.addEventListener("click", closeImageModalFn);

// Close modals when clicking outside
addModal.addEventListener("click", (e) => {
  if (e.target === addModal) {
    closeAddModalFn();
  }
});

editModal.addEventListener("click", (e) => {
  if (e.target === editModal) {
    closeEditModalFn();
  }
});

imageModal.addEventListener("click", (e) => {
  if (e.target === imageModal) {
    closeImageModalFn();
  }
});

// Handle file input changes
addImageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    addFileName.textContent = file.name;
  } else {
    addFileName.textContent = "No file chosen";
  }
});

roomImageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    roomImageFileName.textContent = file.name;
  } else {
    roomImageFileName.textContent = "No file chosen";
  }
});

// Handle form submissions
addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Room added successfully!");
  closeAddModalFn();
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Room updated successfully!");
  closeEditModalFn();
});

// Add image functionality
addImageBtn.addEventListener("click", () => {
  const file = roomImageInput.files[0];
  if (file) {
    alert("Image added successfully!");
    roomImageFileName.textContent = "No file chosen";
    roomImageInput.value = "";
  } else {
    alert("Please select an image first!");
  }
});

// Close modals on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!addModal.classList.contains("hidden")) {
      closeAddModalFn();
    }
    if (!editModal.classList.contains("hidden")) {
      closeEditModalFn();
    }
    if (!imageModal.classList.contains("hidden")) {
      closeImageModalFn();
    }
  }
});

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initializeSidebar();
});

initializeSidebar();
