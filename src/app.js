/**
 * Zyra Hotel Booking System - Simplified Function-Based Structure
 * No classes - just functions and variables for easier coding
 */

// ===========================================
// GLOBAL VARIABLES
// ===========================================

let isInitialized = false;
let currentUser = null;
let admin = null;
let users = [];
let currentModal = null;
let currentDropdown = null;
let isDropdownOpen = false;
let slideInterval = null;
let currentSlideIndex = 0;
let totalSlides = 2;
let is3DAnimating = false;
let current3DIndex = 0;
let total3DCards = 0;
let eventListeners = [];
let adultCount = 0;
let childrenCount = 0;
let observers = new Map();

// DOM Elements - will be found when page loads
let carouselSlides = null;
let carouselIndicators = [];
let carousel3DCards = [];
let carousel3DContainer = null;
let mobileIcons = null;
let scrollToTopBtn = null;
let checkinInput = null;
let checkoutInput = null;
let searchButton = null;
let mobileSearchButton = null;

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function getElementById(id) {
  return document.getElementById(id);
}

function querySelectorAll(selector) {
  return document.querySelectorAll(selector);
}

function createElement(tag, className = "", content = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content) element.innerHTML = content;
  return element;
}

function insertHTML(element, position, html) {
  element.insertAdjacentHTML(position, html);
}

function removeElement(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

function addEventListenerSafe(element, event, handler) {
  if (element) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
  }
}

// ===========================================
// API FUNCTIONS
// ===========================================

const API_BASE = "https://68c8b85aceef5a150f622643.mockapi.io";

async function fetchAdminFromAPI() {
  admin = {
    id: 1,
    email: "admin@gmail.com",
    password: "admin123",
    name: "Prabha",
    loggedIn: false,
  };
  return admin;
}

async function fetchUsersFromAPI() {
  try {
    const res = await fetch(`${API_BASE}/users`);
    const data = await res.json();
    users = [];

    if (Array.isArray(data)) {
      users = data.map((userObj) => ({
        id: parseInt(userObj.id, 10),
        email: userObj.email,
        password: userObj.password,
        name: userObj.name,
        loggedIn: userObj.loggedIn || false,
        mobile: userObj.mobile || null,
        avatar: userObj.avatar || null,
      }));
    }

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// ===========================================
// AUTHENTICATION FUNCTIONS
// ===========================================

function findUserByCredentials(emailOrMobile, password) {
  const input = emailOrMobile.trim().toLowerCase();
  return users.find((user) => {
    const emailMatch = user.email.toLowerCase() === input;
    const mobileMatch = user.mobile && user.mobile === input;
    const passwordMatch = user.password === password;
    return (emailMatch || mobileMatch) && passwordMatch;
  });
}

function userExists(email, mobile) {
  return users.find(
    (user) => user.email === email || user.mobile === mobile
  );
}

function login(emailOrMobile, password) {
  const input = emailOrMobile.trim().toLowerCase();
  console.log("Attempt login for:", input);

  // Check admin login
  if (
    admin &&
    admin.email.toLowerCase() === input &&
    admin.password === password
  ) {
    console.log("Admin login success");
    admin.loggedIn = true;
    currentUser = admin;
    return { success: true, user: admin, isAdmin: true };
  }

  // Check user login
  const user = findUserByCredentials(emailOrMobile, password);
  if (user) {
    console.log("User login success:", user.email);
    user.loggedIn = true;
    currentUser = user;
    console.log("logged in user :", user);
    return { success: true, user, isAdmin: false };
  }

  console.log("Invalid credentials for:", input);
  return { success: false, error: "Invalid credentials" };
}

async function register(userData) {
  const { name, email, mobile, password, confirmPassword } = userData;

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters long",
    };
  }

  if (userExists(email, mobile)) {
    return { success: false, error: "User already exists" };
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    mobile,
    password,
    joinYear: new Date().getFullYear(),
    emailVerified: false,
    mobileVerified: false,
    dob: "",
    address: "",
    pincode: "",
    loggedIn: false,
  };

  users.push(newUser);
  currentUser = newUser;

  return { success: true, user: newUser };
}

function logout() {
  if (currentUser) {
    currentUser.loggedIn = false;
  }
  currentUser = null;
  return { success: true };
}

function getCurrentUser() {
  return currentUser ? { ...currentUser } : null;
}

function isLoggedIn() {
  return currentUser !== null;
}

// ===========================================
// DATE UTILITY FUNCTIONS
// ===========================================

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

function compareDates(date1, date2) {
  return new Date(date1) - new Date(date2);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

function validateCheckinDate(checkinDate) {
  if (!checkinDate) {
    return { isValid: false, message: "Check-in date is required" };
  }

  if (!isValidDate(checkinDate)) {
    return { isValid: false, message: "Invalid check-in date" };
  }

  if (compareDates(checkinDate, getTodayString()) < 0) {
    return { isValid: false, message: "Check-in date cannot be in the past" };
  }

  return { isValid: true };
}

function validateCheckoutDate(checkoutDate, checkinDate) {
  if (!checkoutDate) {
    return { isValid: false, message: "Check-out date is required" };
  }

  if (!isValidDate(checkoutDate)) {
    return { isValid: false, message: "Invalid check-out date" };
  }

  if (compareDates(checkoutDate, checkinDate) <= 0) {
    return {
      isValid: false,
      message: "Check-out date must be after check-in date",
    };
  }

  return { isValid: true };
}

function validateDateRange(checkinDate, checkoutDate) {
  const checkinValidation = validateCheckinDate(checkinDate);
  if (!checkinValidation.isValid) {
    return checkinValidation;
  }

  const checkoutValidation = validateCheckoutDate(checkoutDate, checkinDate);
  if (!checkoutValidation.isValid) {
    return checkoutValidation;
  }

  return { isValid: true };
}

// ===========================================
// MESSAGE FUNCTIONS
// ===========================================

function showSuccessMessage(message) {
  showMessage(message, "success");
}

function showErrorMessage(message) {
  showMessage(message, "error");
}

function showMessage(message, type = "success") {
  const messageDiv = createMessageElement(message, type);
  document.body.appendChild(messageDiv);

  setTimeout(() => {
    removeMessage(messageDiv);
  }, 4000);
}

function createMessageElement(message, type) {
  const bgColor =
    type === "success"
      ? "bg-green-100 border-green-400 text-green-700"
      : "bg-red-100 border-red-400 text-red-700";
  const iconColor = type === "success" ? "text-green-500" : "text-red-500";
  const iconPath =
    type === "success"
      ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z";

  const messageDiv = createElement(
    "div",
    `fixed top-4 right-4 ${bgColor} border px-4 py-3 rounded-lg shadow-lg z-[70] max-w-md animate-fadeIn`,
    `
      <div class="flex items-start">
        <svg class="w-5 h-5 mr-3 mt-0.5 ${iconColor}" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="${iconPath}" clip-rule="evenodd"></path>
        </svg>
        <span class="text-sm font-medium">${message}</span>
      </div>
    `
  );

  return messageDiv;
}

function removeMessage(messageDiv) {
  if (document.body.contains(messageDiv)) {
    messageDiv.style.opacity = "0";
    setTimeout(() => removeElement(messageDiv), 300);
  }
}

// ===========================================
// MODAL FUNCTIONS
// ===========================================

function generateLoginModal() {
  return `
    <div class="auth-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] animate-fadeIn">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 relative transform animate-slideUp">
        <button class="close-modal absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200">
          <i class="fas fa-times text-lg" style="color:#F26538"></i>
        </button>

        <div class="p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Login</h2>

          <form id="loginForm">
            <div class="mb-4 p-1">
              <label class="block text-sm text-gray-900 mb-2 ml-4">Email or Mobile</label>
              <input type="text" id="emailOrMobile" placeholder="Enter your Email or Mobile" 
                     class="w-full px-4 py-3 text-sm border border-[#EFB85A] rounded-full focus:outline-none focus:border-[#F26538] transition-all duration-200" required>
            </div>

            <div class="mb-4 p-1">
              <label class="block text-sm text-gray-900 mb-2 ml-4">Password</label>
              <div class="relative">
                <input type="password" id="password" placeholder="Enter your password"
                      class="w-full px-4 py-3 text-sm border border-[#EFB85A] rounded-full 
                            focus:outline-none focus:border-[#F26538] pr-12 transition-all duration-200" required>
                <button type="button" id="togglePassword" 
                      class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 
                            hover:text-gray-600 transition-colors duration-200">
                  <i class="fas fa-eye text-sm" style="color:#F26538" id="eyeIcon"></i>
                </button>
              </div>
            </div>

            <div class="text-right mb-4 p-1">
              <button type="button" class="forgot-password text-sm hover:underline font-medium transition-colors duration-200" style="color:#F26538">
                Forgot Password?
              </button>
            </div>

            <div class="flex justify-center mb-4">
              <button type="submit" id="mass_prabha" class="px-12 py-3 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-full transition duration-200 transform hover:scale-105" style="background-color:#EFB85A">
              <span class = "flex justify-between items-center gap-3 hidden" id = "loading">  
                <l-line-spinner
                    size="20"
                    stroke="3"
                    speed="1"
                    color="white" 
                  ></l-line-spinner> 
                  Logging in...
                </span>
              <span id = "continue_btn" class = ""> Continue </span>
              </button>
            </div>

            <p class="text-center text-sm text-gray-600 mb-4">
              New here? <button type="button" class="show-signup text-gray-900 hover:underline font-medium transition-colors duration-200">Create an account</button>
            </p>

            <div class="relative mb-2">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-xs">
                <span class="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <div class="text-center">
              <div class="flex items-center justify-center space-x-2 text-gray-700 cursor-pointer 
                        hover:text-gray-900 transition-colors duration-200 py-3">
                <span class="flex items-center space-x-2 transition-transform duration-200 hover:scale-110">
                  <i class="fab fa-google text-red-500"></i>
                  <span class="text-sm">Continue With Google</span>
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function generateSignupModal() {
  return `
    <div class="auth-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] animate-fadeIn">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 relative transform animate-slideUp max-h-screen overflow-y-auto">
        <button class="close-modal absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10">
          <i class="fas fa-times text-lg" style="color:#F26538"></i>
        </button>

        <div class="p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Sign Up</h2>

          <form id="signupForm">
            <div class="mb-4 p-1">
              <label class="block text-sm text-gray-900 mb-2 ml-4">Name</label>
              <input type="text" id="name" placeholder="Enter your Name" 
                     class="w-full px-4 py-3 text-sm border border-[#EFB85A] rounded-full focus:outline-none focus:border-[#F26538] transition-all duration-200" required>
            </div>

            <div class="mb-4 p-1">
              <label class="block text-sm text-gray-900 mb-2 ml-4">Email</label>
              <input type="email" id="email" placeholder="Enter your Email" 
                     class="w-full px-4 py-3 text-sm border border-[#EFB85A] rounded-full focus:outline-none focus:border-[#F26538] transition-all duration-200" required>
            </div>

            <div class="mb-4 p-1">
              <label class="block text-sm text-gray-900 mb-2 ml-4">Mobile</label>
              <input type="tel" id="mobile" placeholder="Enter your Mobile Number" 
                     class="w-full px-4 py-3 text-sm border border-[#EFB85A] rounded-full focus:outline-none focus:border-[#F26538] transition-all duration-200" required>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="p-1">
                <label class="block text-sm text-gray-900 mb-2 ml-4">Password</label>
                <input type="password" id="password" placeholder="Enter your password" 
                       class="w-full px-4 py-3 text-sm border border-[#EFB85A] rounded-full focus:outline-none focus:border-[#F26538] transition-all duration-200" required>
              </div>
              <div class="p-1">
                <label class="block text-sm text-gray-900 mb-2 ml-4">Confirm Password</label>
                <input type="password" id="confirmPassword" placeholder="Confirm your password" 
                       class="w-full px-4 py-3 text-sm border border-[#EFB85A] rounded-full focus:outline-none focus:border-[#F26538] transition-all duration-200" required>
              </div>
            </div>

            <p class="text-xs text-gray-500 text-center mb-2">
              The confirmation mail will be sent to your email.
            </p>

            <div class="flex justify-center mb-4">
              <button type="submit" class="px-12 py-3 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-full transition duration-200 transform hover:scale-105" style="background-color:#EFB85A">
                Continue
              </button>
            </div>

            <p class="text-center text-sm text-gray-600 mb-4">
              Have an account? <button type="button" class="show-login text-gray-900 hover:underline font-medium transition-colors duration-200">Login</button>
            </p>

            <div class="relative mb-2">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-xs">
                <span class="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <div class="text-center">
              <div class="flex items-center justify-center space-x-2 text-gray-700 cursor-pointer 
                        hover:text-gray-900 transition-colors duration-200 py-3">
                <span class="flex items-center space-x-2 transition-transform duration-200 hover:scale-110">
                  <i class="fab fa-google text-red-500"></i>
                  <span class="text-sm">Continue With Google</span>
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function showModal(html) {
  closeModal(); // Close any existing modal
  document.body.insertAdjacentHTML("beforeend", html);
  currentModal = document.querySelector(".auth-modal-overlay");
  document.body.style.overflow = "hidden";
  return currentModal;
}

function closeModal() {
  if (currentModal) {
    currentModal.remove();
    currentModal = null;
    document.body.style.overflow = "";
  }
}

function isModalOpen() {
  return currentModal !== null;
}

// ===========================================
// CAROUSEL FUNCTIONS
// ===========================================

function setupHeroCarousel() {
  carouselSlides = getElementById("carouselSlides");
  carouselIndicators = Array.from(querySelectorAll(".carousel-dot"));

  if (!carouselSlides || carouselIndicators.length === 0) return;

  currentSlideIndex = 0;
  totalSlides = 2;

  // Preload images
  preloadCarouselImages();
  
  // Go to first slide
  goToSlide(0);
  
  // Start auto slide
  startAutoSlide();

  // Bind indicator events
  carouselIndicators.forEach((indicator, index) => {
    addEventListenerSafe(indicator, "click", () => {
      stopAutoSlide();
      goToSlide(index);
      startAutoSlide();
    });
  });
}

function preloadCarouselImages() {
  const images = carouselSlides.querySelectorAll("img[data-src]");
  images.forEach((img) => {
    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = img.dataset.src;
      img.classList.add("loaded");
    };
    tempImg.src = img.dataset.src;
  });
}

function goToSlide(index) {
  if (index >= 0 && index < totalSlides) {
    currentSlideIndex = index;
    const translateValue = -(index * 33.3333);
    carouselSlides.style.transform = `translateX(${translateValue}%)`;
    
    // Update indicators
    carouselIndicators.forEach((indicator, i) => {
      indicator.classList.toggle("bg-gray-600", i === index);
    });
  }
}

function nextSlide() {
  const nextIndex = (currentSlideIndex + 1) % totalSlides;
  goToSlide(nextIndex);
}

function startAutoSlide() {
  stopAutoSlide();
  slideInterval = setInterval(() => {
    nextSlide();
  }, 5000);
}

function stopAutoSlide() {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
}

// ===========================================
// 3D CAROUSEL FUNCTIONS
// ===========================================

function setup3DCarousel() {
  carousel3DCards = Array.from(querySelectorAll(".testimonial-card"));
  carousel3DContainer = getElementById("carouselContainer");
  const indicatorsContainer = getElementById("indicators");
  const hoverLeft = getElementById("hoverLeft");
  const hoverRight = getElementById("hoverRight");

  if (!carousel3DCards.length || !carousel3DContainer || !indicatorsContainer) return;

  current3DIndex = 0;
  total3DCards = carousel3DCards.length;
  is3DAnimating = false;

  // Create indicators
  create3DIndicators(indicatorsContainer, total3DCards);
  
  // Update initial positions
  update3DPositions();
  
  // Start auto play
  start3DAutoPlay();

  // Navigation buttons
  if (hoverLeft) {
    addEventListenerSafe(hoverLeft, "click", () => prev3DSlide());
  }
  if (hoverRight) {
    addEventListenerSafe(hoverRight, "click", () => next3DSlide());
  }

  // Indicators
  bind3DIndicatorEvents(indicatorsContainer);

  // Mouse events
  addEventListenerSafe(carousel3DContainer, "mouseenter", () => stop3DAutoPlay());
  addEventListenerSafe(carousel3DContainer, "mouseleave", () => start3DAutoPlay());

  // Touch events
  setup3DTouchEvents();

  // Keyboard events
  setup3DKeyboardEvents();
}

function create3DIndicators(container, totalCards) {
  container.innerHTML = "";
  
  for (let i = 0; i < totalCards; i++) {
    const indicator = createElement("div", "indicator");
    indicator.setAttribute("data-index", i);
    container.appendChild(indicator);
  }
}

function bind3DIndicatorEvents(container) {
  const indicators = container.querySelectorAll(".indicator");
  indicators.forEach((indicator, index) => {
    addEventListenerSafe(indicator, "click", () => goTo3DSlide(index));
  });
}

function update3DIndicators(activeIndex) {
  const indicators = querySelectorAll("#indicators .indicator");
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle("active", index === activeIndex);
  });
}

function getRelative3DPosition(cardIndex, currentIndex) {
  let pos = cardIndex - currentIndex;
  const half = Math.floor(total3DCards / 2);
  if (pos > half) pos -= total3DCards;
  else if (pos < -half) pos += total3DCards;
  return pos;
}

function getTransformFor3DPosition(relativePos) {
  const transforms = {
    0: "translate(-50%,-50%) scale(1.15) rotateY(0deg) translateZ(80px)",
    [-1]: "translate(-50%,-50%) scale(0.95) rotateY(35deg) translateZ(40px) translateX(-130px)",
    1: "translate(-50%,-50%) scale(0.95) rotateY(-35deg) translateZ(40px) translateX(130px)",
    [-2]: "translate(-50%,-50%) scale(0.75) rotateY(55deg) translateZ(0px) translateX(-220px)",
    2: "translate(-50%,-50%) scale(0.75) rotateY(-55deg) translateZ(0px) translateX(220px)",
  };

  return (
    transforms[relativePos] ||
    "translate(-50%,-50%) scale(0.3) rotateY(90deg) translateZ(-100px)"
  );
}

function getClassesFor3DPosition(relativePos) {
  const classes = {
    0: ["z-10", "opacity-100"],
    [-1]: ["z-8", "opacity-85"],
    1: ["z-8", "opacity-85"],
    [-2]: ["z-6", "opacity-60"],
    2: ["z-6", "opacity-60"],
  };

  return (
    classes[relativePos] || ["z-[1]", "opacity-0", "pointer-events-none"]
  );
}

function update3DPositions() {
  carousel3DCards.forEach((card, index) => {
    const relativePos = getRelative3DPosition(index, current3DIndex);
    const transform = getTransformFor3DPosition(relativePos);
    const classes = getClassesFor3DPosition(relativePos);

    // Remove old classes
    card.classList.remove(
      "z-[1]",
      "z-6",
      "z-8",
      "z-10",
      "opacity-0",
      "opacity-60",
      "opacity-85",
      "opacity-100",
      "pointer-events-none"
    );

    card.style.transform = transform;
    card.classList.add(...classes);
  });

  update3DIndicators(current3DIndex);
}

function goTo3DSlide(index) {
  if (
    is3DAnimating ||
    index === current3DIndex ||
    index < 0 ||
    index >= carousel3DCards.length
  ) {
    return;
  }

  is3DAnimating = true;
  current3DIndex = index;
  update3DPositions();

  setTimeout(() => {
    is3DAnimating = false;
  }, 800);
}

function next3DSlide() {
  const nextIndex = (current3DIndex + 1) % total3DCards;
  goTo3DSlide(nextIndex);
}

function prev3DSlide() {
  const prevIndex = (current3DIndex - 1 + total3DCards) % total3DCards;
  goTo3DSlide(prevIndex);
}

function start3DAutoPlay() {
  stop3DAutoPlay();
  slideInterval = setInterval(() => {
    next3DSlide();
  }, 4000);
}

function stop3DAutoPlay() {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
}

function setup3DTouchEvents() {
  let touchStartX = 0;

  addEventListenerSafe(carousel3DContainer, "touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    stop3DAutoPlay();
  });

  addEventListenerSafe(carousel3DContainer, "touchend", (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        next3DSlide();
      } else {
        prev3DSlide();
      }
    }

    start3DAutoPlay();
  });
}

function setup3DKeyboardEvents() {
  addEventListenerSafe(document, "keydown", (e) => {
    if (e.key === "ArrowLeft") {
      prev3DSlide();
    } else if (e.key === "ArrowRight") {
      next3DSlide();
    }
  });
}

// ===========================================
// BOOKING FUNCTIONS
// ===========================================

function setupBookingSystem() {
  checkinInput = getElementById("checkinDate");
  checkoutInput = getElementById("checkoutDate");
  searchButton = getElementById("searchButton");
  mobileSearchButton = getElementById("mobileSearchButton");

  // Adult counter elements
  const adultMinus = getElementById("adultMinus");
  const adultPlus = getElementById("adultPlus");
  const adultDisplay = getElementById("adultCount");

  // Children counter elements
  const childrenMinus = getElementById("childrenMinus");
  const childrenPlus = getElementById("childrenPlus");
  const childrenDisplay = getElementById("childrenCount");

  setupDateInputs();
  setupGuestCounters(
    { minusBtn: adultMinus, plusBtn: adultPlus, display: adultDisplay },
    { minusBtn: childrenMinus, plusBtn: childrenPlus, display: childrenDisplay }
  );

  // Search buttons
  if (searchButton) {
    addEventListenerSafe(searchButton, "click", () => handleBookingSearch());
  }

  if (mobileSearchButton) {
    addEventListenerSafe(mobileSearchButton, "click", () => handleBookingSearch());
  }
}

function setupDateInputs() {
  const today = getTodayString();
  if (checkinInput) checkinInput.min = today;
  if (checkoutInput) checkoutInput.min = today;

  if (checkinInput && checkoutInput) {
    addEventListenerSafe(checkinInput, "change", (e) => {
      const checkinDate = e.target.value;
      if (checkinDate) {
        checkoutInput.min = checkinDate;
        if (
          checkoutInput.value &&
          compareDates(checkoutInput.value, checkinDate) <= 0
        ) {
          checkoutInput.value = "";
        }
      }
    });
  }
}

function setupGuestCounters(adultControls, childrenControls) {
  adultCount = 0;
  childrenCount = 0;

  // Adult controls
  if (adultControls.minusBtn && adultControls.plusBtn && adultControls.display) {
    addEventListenerSafe(adultControls.minusBtn, "click", () => {
      if (adultCount > 0) {
        adultCount--;
        adultControls.display.textContent = adultCount;
      }
    });

    addEventListenerSafe(adultControls.plusBtn, "click", () => {
      adultCount++;
      adultControls.display.textContent = adultCount;
    });
  }

  // Children controls
  if (childrenControls.minusBtn && childrenControls.plusBtn && childrenControls.display) {
    addEventListenerSafe(childrenControls.minusBtn, "click", () => {
      if (childrenCount > 0) {
        childrenCount--;
        childrenControls.display.textContent = childrenCount;
      }
    });

    addEventListenerSafe(childrenControls.plusBtn, "click", () => {
      childrenCount++;
      childrenControls.display.textContent = childrenCount;
    });
  }
}

function getCheckinDate() {
  return checkinInput ? checkinInput.value : "";
}

function getCheckoutDate() {
  return checkoutInput ? checkoutInput.value : "";
}

function getGuestCounts() {
  return {
    adults: adultCount,
    children: childrenCount,
    total: adultCount + childrenCount,
  };
}

function validateBookingData(bookingData) {
  const { checkinDate, checkoutDate, adults } = bookingData;

  // Date validation
  const dateValidation = validateDateRange(checkinDate, checkoutDate);
  if (!dateValidation.isValid) {
    return dateValidation;
  }

  // Guest validation
  if (adults === 0) {
    return { isValid: false, message: "Please add at least one adult guest" };
  }

  return { isValid: true };
}

function handleBookingSearch() {
  const checkinDate = getCheckinDate();
  const checkoutDate = getCheckoutDate();
  const guestCounts = getGuestCounts();

  const bookingData = {
    checkinDate,
    checkoutDate,
    ...guestCounts,
  };

  const validation = validateBookingData(bookingData);

  if (!validation.isValid) {
    showErrorMessage(validation.message);
    return;
  }

  // Success - show search results
  console.log("Search Data:", bookingData);

  const message = `Searching for accommodation from ${checkinDate} to ${checkoutDate} for ${guestCounts.total} guests (${guestCounts.adults} adults, ${guestCounts.children} children)`;
  showSuccessMessage(message);
}

// ===========================================
// DROPDOWN FUNCTIONS
// ===========================================

function generateGuestDropdown() {
  return `
    <div id="filtersDropdown" class="flex flex-col absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden w-80 z-50 animate-fadeIn">
      <div class="py-2">
        <div id="aboutUs" class="px-6 py-3 cursor-pointer transition-all duration-200 flex items-center group hover:bg-gradient-to-r hover:from-pink-50 hover:to-orange-50">
          <svg class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" style="color: #E11162;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-gray-700 font-medium group-hover:font-semibold transition-all duration-200">About us</span>
          <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-1 h-8 rounded-full" style="background: linear-gradient(to bottom, #E11162, #F26538);"></div>
        </div>

        <hr class="border-gray-200 mx-4">

        <div class="login-signup-btn px-6 py-3 cursor-pointer transition-all duration-200 flex items-center group hover:bg-gradient-to-r hover:from-pink-50 hover:to-orange-50">
          <svg class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" style="color: #F26538;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
          </svg>
          <div class="flex flex-col flex-1">
            <span class="text-gray-700 font-medium group-hover:font-semibold transition-all duration-200">Login / Sign up</span>
            <span class="text-gray-500 text-xs">Access your room bookings</span>
          </div>
          <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-1 h-8 rounded-full" style="background: linear-gradient(to bottom, #F26538, #EFB85A);"></div>
        </div>
      </div>
    </div>
  `;
}

function generateLoggedInDropdown() {
  return `
    <div id="filtersDropdown" class="flex flex-col absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden w-80 z-50 animate-fadeIn">
      <div class="py-2">
        <div id="userProfile" class="px-6 py-3 cursor-pointer transition-all duration-200 flex items-center group hover:bg-gradient-to-r hover:from-pink-50 hover:to-orange-50">
          <svg class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" style="color: #E11162;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <div class="flex flex-col flex-1">
            <span class="text-gray-700 font-medium group-hover:font-semibold transition-all duration-200">Profile</span>
            <span class="text-gray-500 text-xs">Edit personal information</span>
          </div>
          <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-1 h-8 rounded-full" style="background: linear-gradient(to bottom, #E11162, #F26538);"></div>
        </div>

        <div class="px-6 py-3 cursor-pointer transition-all duration-200 flex items-center group hover:bg-gradient-to-r hover:from-pink-50 hover:to-orange-50 relative">
          <svg class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" style="color: #F26538;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
          </svg>
          <div class="flex flex-col flex-1">
            <span class="text-gray-700 font-medium group-hover:font-semibold transition-all duration-200">Bookings</span>
            <span class="text-gray-500 text-xs">View past booking history</span>
          </div>
          <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-1 h-8 rounded-full" style="background: linear-gradient(to bottom, #F26538, #EFB85A);"></div>
        </div>

        <hr class="border-gray-200 mx-4">

        <div id="aboutUs" class="px-6 py-3 cursor-pointer transition-all duration-200 flex items-center group hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50">
          <svg class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" style="color: #EFB85A;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-gray-700 font-medium group-hover:font-semibold transition-all duration-200">About us</span>
          <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-1 h-8 rounded-full" style="background: linear-gradient(to bottom, #EFB85A, #F26538);"></div>
        </div>

        <hr class="border-gray-200 mx-4">

        <div class="logout-btn px-6 py-3 cursor-pointer transition-all duration-200 flex items-center group hover:bg-red-50">
          <svg class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200 text-red-600 group-hover:text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span class="text-red-600 font-medium group-hover:text-red-700 group-hover:font-semibold transition-all duration-200">Logout</span>
          <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-1 h-8 rounded-full bg-red-500"></div>
        </div>
      </div>
    </div>
  `;
}

function setupDropdown() {
  mobileIcons = getElementById("mobileIcons");

  if (mobileIcons) {
    addEventListenerSafe(mobileIcons, "click", (e) => {
      e.stopPropagation();
      toggleDropdown();
    });
  }


  // Outside click to close dropdown
  addEventListenerSafe(document, "click", (e) => {
    if (isDropdownOpen && currentDropdown) {
      const isInsideDropdown = currentDropdown.contains(e.target);
      const isInsideIcon = mobileIcons && mobileIcons.contains(e.target);
      
      if (!isInsideDropdown && !isInsideIcon) {
        closeDropdown();
      }
    }
  });
}

function toggleDropdown() {
  if (isDropdownOpen) {
    closeDropdown();
  } else {
    showDropdown();
  }
}
function showDropdown() {
  console.log("🔽 Opening dropdown...");
  closeDropdown();

  const user = getCurrentUser();
  const loggedIn = user && user.loggedIn === true;
  
  console.log("User:", user);
  console.log("Is logged in:", loggedIn);

  const html = loggedIn
    ? generateLoggedInDropdown()
    : generateGuestDropdown();

  insertHTML(mobileIcons, "beforeend", html);
  currentDropdown = getElementById("filtersDropdown");

  if (currentDropdown) {
    isDropdownOpen = true;
    console.log("Dropdown created, HTML:", currentDropdown.innerHTML);
    bindDropdownEvents(currentDropdown, loggedIn);
  } else {
    console.error("❌ Failed to create dropdown!");
  }
}
// Remove the old direct handler and add this to bindDropdownEvents function
function bindDropdownEvents(dropdown, loggedIn) {
  console.log("Binding dropdown events, loggedIn:", loggedIn);
  
  // Handle About Us for both logged in and guest users
  const aboutUsBtn = dropdown.querySelector("#aboutUs");
  if (aboutUsBtn) {
    console.log("Adding About Us click handler");
    addEventListenerSafe(aboutUsBtn, "click", (e) => {
      console.log("🔥 ABOUT US CLICKED!");
      e.preventDefault();
      e.stopPropagation();
      
      closeDropdown();
      
      setTimeout(() => {
        window.location.href = "/src/user/features/aboutUs/about-us.html";
      }, 100);
    });
  }
  
  if (!loggedIn) {
    const loginSignupBtn = dropdown.querySelector(".login-signup-btn");
    if (loginSignupBtn) {
      addEventListenerSafe(loginSignupBtn, "click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        showLoginModal();
        closeDropdown();
      });
    }
  } else {
    // Profile button for logged-in users
    const profileBtn = dropdown.querySelector("#userProfile");
    console.log("Looking for #userProfile, found:", profileBtn);
    
    if (profileBtn) {
      console.log("Adding click handler to profile button");
      
      addEventListenerSafe(profileBtn, "click", (e) => {
        console.log("🔥 PROFILE CLICKED! Event:", e);
        e.preventDefault();
        e.stopPropagation();
        
        closeDropdown();
        
        setTimeout(() => {
          window.location.href = "/src/user/features/profile/profile.html";
        }, 100);
      });
    } else {
      console.error("❌ Profile button not found in dropdown!");
    }

    const logoutBtn = dropdown.querySelector(".logout-btn");
    if (logoutBtn) {
      addEventListenerSafe(logoutBtn, "click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleLogout();
        closeDropdown();
      });
    }
  }
}

document.addEventListener('click', function(e) {
  if (e.target.closest('#homeBookNow-btn')) {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = "/src/user/features/bookings/booking.html";
  }
});

function closeDropdown() {
  if (currentDropdown) {
    removeElement(currentDropdown);
    currentDropdown = null;
    isDropdownOpen = false;
  }
}

// ===========================================
// MODAL EVENT FUNCTIONS
// ===========================================

function showLoginModal() {
  const html = generateLoginModal();
  const modal = showModal(html);
  bindLoginModalEvents(modal);
}

function showSignupModal() {
  const html = generateSignupModal();
  const modal = showModal(html);
  bindSignupModalEvents(modal);
}

function bindLoginModalEvents(modal) {
  // Close button
  const closeBtn = modal.querySelector(".close-modal");
  if (closeBtn) {
    addEventListenerSafe(closeBtn, "click", () => closeModal());
  }

  // Switch to signup
  const signupBtn = modal.querySelector(".show-signup");
  if (signupBtn) {
    addEventListenerSafe(signupBtn, "click", () => {
      closeModal();
      setTimeout(() => showSignupModal(), 150);
    });
  }

  // Password toggle
  const passwordInput = modal.querySelector("#password");
  const toggleBtn = modal.querySelector("#togglePassword");
  const eyeIcon = modal.querySelector("#eyeIcon");
  if (passwordInput && toggleBtn && eyeIcon) {
    addEventListenerSafe(toggleBtn, "click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      eyeIcon.classList.toggle("fa-eye");
      eyeIcon.classList.toggle("fa-eye-slash");
    });
  }

  // Form handler
  const form = modal.querySelector("#loginForm");
  if (form) {
    addEventListenerSafe(form, "submit", (e) => handleLoginSubmit(e, form));
  }
}

function bindSignupModalEvents(modal) {
  // Close button
  const closeBtn = modal.querySelector(".close-modal");
  if (closeBtn) {
    addEventListenerSafe(closeBtn, "click", () => closeModal());
  }

  // Switch to login
  const loginBtn = modal.querySelector(".show-login");
  if (loginBtn) {
    addEventListenerSafe(loginBtn, "click", () => {
      closeModal();
      setTimeout(() => showLoginModal(), 150);
    });
  }

  // Form handler
  const form = modal.querySelector("#signupForm");
  if (form) {
    addEventListenerSafe(form, "submit", (e) => handleSignupSubmit(e, form));
  }
}

function getFieldValue(form, id) {
  const field = form.querySelector(`#${id}`);
  return field ? field.value.trim() : "";
}

function handleLoginSubmit(e, form) {
  e.preventDefault();
  
  const emailOrMobile = getFieldValue(form, "emailOrMobile");
  const password = getFieldValue(form, "password");

  // Find elements within the modal form instead of document
  const loadingElement = form.querySelector("#loading");
  const continueElement = form.querySelector("#continue_btn");

  // Show loading state if elements exist
  if (loadingElement) {
    loadingElement.classList.remove("hidden");
  }
  if (continueElement) {
    continueElement.classList.add("hidden");
  }

  setTimeout(() => {
    const result = login(emailOrMobile, password);

    // Reset loading state
    if (loadingElement) {
      loadingElement.classList.add("hidden");
    }
    if (continueElement) {
      continueElement.classList.remove("hidden");
    }

    if (result.success) {
      // Make sure currentUser is set globally
      currentUser = result.user;
      console.log("✅ User set after login:", currentUser);
      
      showSuccessMessage("Login successful! Welcome back.");
      closeModal();
      closeDropdown();
      
      // Wait a moment then refresh dropdown
      setTimeout(() => {
        showDropdown(); // This should now show logged-in state
      }, 100);
      
      localStorage.setItem('UserId', result.user.id);

      if (result.isAdmin) {
        localStorage.setItem("adminUser", JSON.stringify(result.user));
        setTimeout(() => {
          window.location.href = "/src/admin/features/dashboard/dashboard.html";
        }, 1000);
      }
    } else {
      showErrorMessage(result.error);
    }
  }, 2000);
}

// Add proper error handling to signup
async function handleSignupSubmit(e, form) {
  e.preventDefault();
  
  try {
    const userData = {
      name: getFieldValue(form, "name"),
      email: getFieldValue(form, "email"),
      mobile: getFieldValue(form, "mobile"),
      password: getFieldValue(form, "password"),
      confirmPassword: getFieldValue(form, "confirmPassword"),
    };

    console.log("📝 Signup data:", userData);

    // Validate all required fields
    if (!userData.name || !userData.email || !userData.mobile || !userData.password || !userData.confirmPassword) {
      showErrorMessage("Please fill in all fields");
      return;
    }

    // Check for existing user
    const existingUser = userExists(userData.email, userData.mobile);
    if (existingUser) {
      showErrorMessage("User already exists with this email or mobile number");
      return;
    }

    // Register user locally first
    const result = await register(userData);

    if (result && result.success) {
      try {
        console.log("🌐 Sending to API:", JSON.stringify(userData));

        // POST the new user to the API
        const res = await fetch(`${API_BASE}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("API Error:", errorText);
          throw new Error(`Failed to add user to API: ${res.status}`);
        }

        const newUserFromAPI = await res.json();
        console.log("✅ User created in API:", newUserFromAPI);
        
        // Add new user to local users array
        if (!Array.isArray(users)) {
          users = [];
        }
        users.push(newUserFromAPI);

        showSuccessMessage("Account created successfully! Please log in.");
        closeModal();
        setTimeout(() => showLoginModal(), 300);
        
      } catch (error) {
        console.error("API Error:", error);
        showErrorMessage("Account created locally but failed to sync online. You can still log in.");
        closeModal();
        setTimeout(() => showLoginModal(), 300);
      }
    } else {
      const errorMsg = result ? result.error : "Registration failed";
      console.error("Registration failed:", errorMsg);
      showErrorMessage(errorMsg);
    }
  } catch (error) {
    console.error("Signup error:", error);
    showErrorMessage("An unexpected error occurred during signup");
  }
}

// Add proper error handling to logout
function handleLogout() {
  try {
    console.log("🚪 Handling logout...");
    
    const result = logout();
    console.log("Logout result:", result);
    
    if (result && result.success) {
      showSuccessMessage("Logged out successfully!");
      closeDropdown();
      
      // Refresh dropdown to show guest state
      setTimeout(() => {
        showDropdown();
      }, 100);
    } else {
      console.error("Logout failed:", result);
      showErrorMessage("Logout failed");
    }
  } catch (error) {
    console.error("Logout error:", error);
    showErrorMessage("An error occurred during logout");
  }
}

// Make sure these core functions exist and work properly
function userExists(email, mobile) {
  try {
    if (!Array.isArray(users)) {
      console.warn("Users array not initialized");
      return false;
    }
    return users.find(user => user.email === email || user.mobile === mobile);
  } catch (error) {
    console.error("Error checking if user exists:", error);
    return false;
  }
}

async function register(userData) {
  try {
    const { name, email, mobile, password, confirmPassword } = userData;

    if (password !== confirmPassword) {
      return { success: false, error: "Passwords do not match" };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long" };
    }

    if (userExists(email, mobile)) {
      return { success: false, error: "User already exists" };
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      mobile,
      password,
      joinYear: new Date().getFullYear(),
      emailVerified: false,
      mobileVerified: false,
      dob: "",
      address: "",
      pincode: "",
      loggedIn: false,
    };

    // Add to users array
    if (!Array.isArray(users)) {
      users = [];
    }
    users.push(newUser);

    return { success: true, user: newUser };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Registration failed" };
  }
}

function logout() {
  try {
    if (currentUser) {
      currentUser.loggedIn = false;
    }
    currentUser = null;
    
    // Clear localStorage
    localStorage.removeItem('UserId');
    localStorage.removeItem('adminUser');
    
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: "Logout failed" };
  }
}

// Add missing message functions if they don't exist
function showSuccessMessage(message) {
  if (typeof showMessage === 'function') {
    showMessage(message, "success");
  } else {
    console.log("✅ Success:", message);
    alert("Success: " + message); // Fallback
  }
}

function showErrorMessage(message) {
  if (typeof showMessage === 'function') {
    showMessage(message, "error");
  } else {
    console.error("❌ Error:", message);
    alert("Error: " + message); // Fallback
  }
}

// Make sure required variables exist
if (typeof users === 'undefined') {
   users = [];
}

if (typeof currentUser === 'undefined') {
   currentUser = null;
}

if (typeof API_BASE === 'undefined') {
   API_BASE = "https://68c8b85aceef5a150f622643.mockapi.io";
}

// ===========================================
// SCROLL FUNCTIONS
// ===========================================

function setupScrollToTop() {
  scrollToTopBtn = getElementById("scrollToTopBtn");
  
  if (!scrollToTopBtn) return;

  // Monitor scroll position
  addEventListenerSafe(window, "scroll", () => {
    if (window.scrollY > 300) {
      scrollToTopBtn.classList.remove("hidden");
    } else {
      scrollToTopBtn.classList.add("hidden");
    }
  });

  // Click handler
  addEventListenerSafe(scrollToTopBtn, "click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// ===========================================
// LAZY LOADING FUNCTIONS
// ===========================================

function setupLazyLoading() {
  // Create intersection observer for images
  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.add("loaded");
          }
          imageObserver.unobserve(img);
        }
      });
    },
    { rootMargin: "50px" }
  );

  // Create intersection observer for sections
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const section = entry.target;
          const skeleton = section.querySelector(".loading-skeleton");
          const content = section.querySelector(".section-content");

          if (skeleton && content) {
            skeleton.style.transition = "opacity 0.3s ease-out";
            skeleton.style.opacity = "0";

            setTimeout(() => {
              skeleton.style.display = "none";
              content.style.display = "block";

              setTimeout(() => {
                section.classList.add("loaded");
                loadSectionAssets(content);
                animateContentElements(content);
              }, 100);
            }, 300);
          }
          sectionObserver.unobserve(section);
        }
      });
    },
    { rootMargin: "100px", threshold: 0.1 }
  );

  // Create intersection observer for iframes
  const iframeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const iframe = entry.target;
          if (iframe.dataset.src) {
            iframe.src = iframe.dataset.src;
          }
          iframeObserver.unobserve(iframe);
        }
      });
    },
    { rootMargin: "50px" }
  );

  // Observe lazy images
  const lazyImages = querySelectorAll(".lazy-image");
  lazyImages.forEach((img) => imageObserver.observe(img));

  // Observe lazy sections
  const lazySections = querySelectorAll(".lazy-section");
  lazySections.forEach((section) => sectionObserver.observe(section));

  // Observe lazy iframes
  const lazyIframes = querySelectorAll(".lazy-iframe");
  lazyIframes.forEach((iframe) => iframeObserver.observe(iframe));

  // Store observers for cleanup
  observers.set("images", imageObserver);
  observers.set("sections", sectionObserver);
  observers.set("iframes", iframeObserver);
}

function loadSectionAssets(content) {
  // Load images in content
  const images = content.querySelectorAll(".lazy-image");
  images.forEach((img) => {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.classList.add("loaded");
    }
  });

  // Load iframes in content
  const iframes = content.querySelectorAll(".lazy-iframe");
  iframes.forEach((iframe) => {
    if (iframe.dataset.src) {
      iframe.src = iframe.dataset.src;
    }
  });
}

function animateContentElements(content) {
  const animatedElements = content.querySelectorAll(
    ".slide-in-left, .slide-in-right, .fade-in"
  );
  animatedElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add("loaded");
    }, index * 100);
  });
}

// ===========================================
// MAIN INITIALIZATION FUNCTION
// ===========================================

async function initializeApp() {
  if (isInitialized) return;

  try {
    // Initialize API data
    await fetchAdminFromAPI();
    await fetchUsersFromAPI();

    // Setup all components
    setupHeroCarousel();
    setup3DCarousel();
    setupBookingSystem();
    setupDropdown();
    setupScrollToTop();
    setupLazyLoading();

    // Setup global modal events
    addEventListenerSafe(document, "click", (e) => {
      if (e.target.classList.contains("auth-modal-overlay")) {
        closeModal();
      }
    });

    addEventListenerSafe(document, "keydown", (e) => {
      if (e.key === "Escape" && isModalOpen()) {
        closeModal();
      }
    });

    isInitialized = true;
    console.log("Zyra Hotel Booking System initialized successfully");
  } catch (error) {
    console.error("Error initializing Zyra application:", error);
  }
}

// ===========================================
// CLEANUP FUNCTION
// ===========================================

function destroyApp() {
  // Clean up event listeners
  eventListeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler);
  });
  eventListeners = [];

  // Clean up intervals
  stopAutoSlide();
  stop3DAutoPlay();

  // Clean up modals and dropdowns
  closeModal();
  closeDropdown();

  // Clean up observers
  observers.forEach((observer) => observer.disconnect());
  observers.clear();

  // Reset variables
  isInitialized = false;
  currentUser = null;
  currentModal = null;
  currentDropdown = null;
  isDropdownOpen = false;

  console.log("Zyra Hotel Booking System destroyed");
}

// ===========================================
// GLOBAL INITIALIZATION
// ===========================================

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  await initializeApp();
});

// Export functions for global access
if (typeof window !== "undefined") {
  window.ZyraApp = {
    init: initializeApp,
    destroy: destroyApp,
    login,
    logout,
    getCurrentUser,
    isLoggedIn,
    showLoginModal,
    showSignupModal,
    showSuccessMessage,
    showErrorMessage,
  };
}






// =====================================
// API CONFIGURATION & GLOBAL VARIABLES
// =====================================




// var images;
// var categoryType;
// var features;
// var facilities;
// var maxadult;
// var maxchild;

            // <!-- Room Card 1 -->
            // <article class="slide-in-left bg-white border rounded-2xl border-[#CAC1C1] p-6 overflow-hidden shadow-md w-full max-w-sm mx-auto flex flex-col transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
            //   <div class="mb-4">
            //     <img data-src="/src/assets/carousel2.jpg" alt="Supreme Deluxe Room" class="lazy-image rounded-xl w-full h-auto">
            //   </div>
            //   <div class="flex flex-col flex-grow">
            //     <div class="flex flex-col items-start">
            //       <h3 class="text-lg font-bold text-[#413030] mb-4">Supreme Deluxe Room</h3>
            //       <p class="text-base text-gray-900">$12 per night</p>
            //     </div>
            //     <div class="space-y-2 py-3">
            //       <div class="flex flex-col items-start">
            //         <h4 class="text-sm font-bold text-[#413030] mb-2">Features</h4>
            //         <ul class="flex list-none space-x-2 text-xs text-gray-600">
            //           <li>Bedroom</li>
            //           <li>Balcony</li>
            //           <li>Kitchen</li>
            //         </ul>
            //       </div>
            //       <div class="flex flex-col items-start">
            //         <h4 class="text-sm font-bold text-[#413030] mb-2">Facilities</h4>
            //         <ul class="flex list-none space-x-4 text-xs text-gray-400 items-center">
            //           <li><img data-src="/src/assets/TV.jpeg" alt="TV" class="lazy-image w-6 h-6 object-contain"></li>
            //           <li><img data-src="/src/assets/AC.avif" alt="AC" class="lazy-image w-6 h-6 object-contain"></li>
            //           <li><img data-src="/src/assets/refrigerator.png" alt="Refrigerator" class="lazy-image w-6 h-6 object-contain"></li>
            //         </ul>
            //       </div>
            //       <div class="flex flex-col items-start">
            //         <h4 class="text-sm font-bold text-[#413030] mb-2">Guests</h4>
            //         <ul class="flex list-none space-x-2 text-xs text-gray-600">
            //           <li>4 Adults</li>
            //           <li>5 Children</li>
            //         </ul>
            //       </div>
            //     </div>
            //     <div class="flex justify-between items-center px-6">
            //       <span class="inline-block text-xs font-bold text-[#413030] border-b-2 border-[#413030] pb-1">
            //         more details
            //       </span>
            //       <button class="rounded-full px-4 py-3 text-xs text-white font-semibold bg-[#EFB85A] hover:bg-[#F26538] transition">
            //         Book Now
            //       </button>
            //     </div>
            //   </div>
            // </article>

            // <!-- Room Card 2 -->
            // <article class="slide-in-right bg-white border rounded-2xl border-[#CAC1C1] p-6 overflow-hidden shadow-md w-full max-w-sm mx-auto flex flex-col transform transition-transform duration-300 hover:scale-105 hover:shadow-xl" style="animation-delay: 0.1s;">
            //   <div class="mb-4">
            //     <img data-src="/src/assets/carousel2.jpg" alt="Supreme Deluxe Room" class="lazy-image rounded-xl w-full h-auto">
            //   </div>
            //   <div class="flex flex-col flex-grow">
            //     <div class="flex flex-col items-start">
            //       <h3 class="text-lg font-bold text-[#413030] mb-4">Supreme Deluxe Room</h3>
            //       <p class="text-base text-gray-900">$12 per night</p>
            //     </div>
            //     <div class="space-y-2 py-4">
            //       <div class="flex flex-col items-start">
            //         <h4 class="text-sm font-bold text-[#413030] mb-2">Features</h4>
            //         <ul class="flex list-none space-x-2 text-xs text-gray-600">
            //           <li>Bedroom</li>
            //           <li>Balcony</li>
            //           <li>Kitchen</li>
            //         </ul>
            //       </div>
            //       <div class="flex flex-col items-start">
            //         <h4 class="text-sm font-bold text-[#413030] mb-2">Facilities</h4>
            //         <ul class="flex list-none space-x-4 text-xs text-gray-400 items-center">
            //           <li><img data-src="/src/assets/TV.jpeg" alt="TV" class="lazy-image w-6 h-6 object-contain"></li>
            //           <li><img data-src="/src/assets/AC.avif" alt="AC" class="lazy-image w-6 h-6 object-contain"></li>
            //           <li><img data-src="/src/assets/refrigerator.png" alt="Refrigerator" class="lazy-image w-6 h-6 object-contain"></li>
            //         </ul>
            //       </div>
            //       <div class="flex flex-col items-start">
            //         <h4 class="text-sm font-bold text-[#413030] mb-2">Guests</h4>
            //         <ul class="flex list-none space-x-2 text-xs text-gray-600">
            //           <li>4 Adults</li>
            //           <li>5 Children</li>
            //         </ul>
            //       </div>
            //     </div>
            //     <div class="flex justify-between items-center px-6">
            //       <span class="inline-block text-xs font-bold text-[#413030] border-b-2 border-[#413030] pb-1">
            //         more details
            //       </span>
            //       <button class="rounded-full px-4 py-3 text-xs text-white font-semibold bg-[#EFB85A] hover:bg-[#F26538] transition">
            //         Book Now
            //       </button>
            //     </div>
            //   </div>
            // </article>

            // <!-- Room Card 3 -->
            // <article class="slide-in-left bg-white border rounded-2xl border-[#CAC1C1] p-6 overflow-hidden shadow-md w-full max-w-sm mx-auto flex flex-col transform transition-transform duration-300 hover:scale-105 hover:shadow-xl" style="animation-delay: 0.2s;">
            //   <div class="mb-4">
            //     <img data-src="/src/assets/carousel2.jpg" alt="Supreme Deluxe Room" class="lazy-image rounded-xl w-full h-auto">
            //   </div>
            //   <div class="flex flex-col flex-grow">
            //     <div class="flex flex-col items-start">
            //       <h3 class="text-lg font-bold text-[#413030] mb-4">Supreme Deluxe Room</h3>
            //       <p class="text-base text-gray-900">$12 per night</p>
            //     </div>
            //     <div class="space-y-2 py-4">
            //       <div class="flex flex-col items-start">
            //         <h4 class="text-sm font-bold text-[#413030] mb-2">Features</h4>
            //         <ul class="flex list-none space-x-2 text-xs text-gray-600">
            //           <li>Bedroom</li>
            //           <li>Balcony</li>
            //           <li>Kitchen</li>
            //         </ul>
            //       </div>
            //       <div class="flex flex-col items-start">
            //         <h4 class="text-sm font-bold text-[#413030] mb-2">Facilities</h4>
            //         <ul class="flex list-none space-x-4 text-xs text-gray-400 items-center">
            //           <li><img data-src="/src/assets/TV.jpeg" alt="TV" class="lazy-image w-6 h-6 object-contain"></li>
            //           <li><img data-src="/src/assets/AC.avif" alt="AC" class="lazy-image w-6 h-6 object-contain"></li>
            //           <li><img data-src="/src/assets/refrigerator.png" alt="Refrigerator" class="lazy-image w-6 h-6 object-contain"></li>
            //         </ul>
            //       </div>
            //       <div class="flex flex-col items-start">
            //         <h4 class="text-sm font-bold text-[#413030] mb-2">Guests</h4>
            //         <ul class="flex list-none space-x-2 text-xs text-gray-600">
            //           <li>4 Adults</li>
            //           <li>5 Children</li>
            //         </ul>
            //       </div>
            //     </div>
            //     <div class="flex justify-between items-center px-6">
            //       <span class="inline-block text-xs font-bold text-[#413030] border-b-2 border-[#413030] pb-1">
            //         more details
            //       </span>
            //       <button class="rounded-full px-4 py-3 text-xs text-white font-semibold bg-[#EFB85A] hover:bg-[#F26538] transition">
            //         Book Now
            //       </button>
            //     </div>
            //   </div>
            // </article>

            // <!-- Room Card 4 -->
            // <article class="slide-in-right bg-white border rounded-2xl border-[#CAC1C1] p-6 overflow-hidden shadow-md w-full max-w-sm mx-auto flex flex-col transform transition-transform duration-300 hover:scale-105 hover:shadow-xl" style="animation-delay: 0.3s;">
            //   <div class="mb-4">
            //     <img data-src="/src/assets/carousel2.jpg" alt="Supreme Deluxe Room" class="lazy-image rounded-xl w-full h-auto">
            //   </div>
            //   <div class="flex flex-col flex-grow">
            //     <div class="flex flex-col items-start">
            //       <h3 class="text-lg font-bold text-[#413030] mb-4">Supreme Deluxe Room</h3>
            //       <p class="text-base text-gray-900">$12 per night</p>
            //     </div>
            //     <div class="space-y-2 py-4">
            //       <div class="flex flex-col items-start">
            //         <h4 class="text-sm font-bold text-[#413030] mb-2">Features</h4>
            //         <ul class="flex list-none space-x-2 text-xs text-gray-600">
            //           <li>Bedroom</li>
            //           <li>Balcony</li>
            //           <li>Kitchen</li>
            //         </ul>
            //       </div>
            //       <div class="flex flex-col items-start">
            //         <h4 class="text-sm font-bold text-[#413030] mb-2">Facilities</h4>
            //         <ul class="flex list-none space-x-4 text-xs text-gray-400 items-center">
            //           <li><img data-src="/src/assets/TV.jpeg" alt="TV" class="lazy-image w-6 h-6 object-contain"></li>
            //           <li><img data-src="/src/assets/AC.avif" alt="AC" class="lazy-image w-6 h-6 object-contain"></li>
            //           <li><img data-src="/src/assets/refrigerator.png" alt="Refrigerator" class="lazy-image w-6 h-6 object-contain"></li>
            //         </ul>
            //       </div>
            //       <div class="flex flex-col items-start">
            //         <h4 class="text-sm font-bold text-[#413030] mb-2">Guests</h4>
            //         <ul class="flex list-none space-x-2 text-xs text-gray-600">
            //           <li>4 Adults</li>
            //           <li>5 Children</li>
            //         </ul>
            //       </div>
            //     </div>
            //     <div class="flex justify-between items-center px-6">
            //       <span class="inline-block text-xs font-bold text-[#413030] border-b-2 border-[#413030] pb-1">
            //         more details
            //       </span>
            //       <button class="rounded-full px-4 py-3 text-xs text-white font-semibold bg-[#EFB85A] hover:bg-[#F26538] transition">
            //         Book Now
            //       </button>
            //     </div>
            //   </div>
            // </article>