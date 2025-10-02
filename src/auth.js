// ===========================================
// GLOBAL VARIABLES
// ===========================================
let mobileIcons, currentDropdown, currentModal, isDropdownOpen = false;
let currentUser = null, users = [], admin = null;
const API_BASE = "https://68c8b85aceef5a150f622643.mockapi.io";

// ===========================================
// DROPDOWN FUNCTIONS
// ===========================================
function generateGuestDropdown() {
  return `
    <div id="filtersDropdown" class="flex flex-col absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden w-80 z-50 animate-fadeIn">
      <div class="py-2">
        <div onclick = "renderAboutus()" id="aboutUs" class="px-6 py-3 cursor-pointer transition-all duration-200 flex items-center group hover:bg-gradient-to-r hover:from-pink-50 hover:to-orange-50">
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
        <div onclick = "renderProfile()" id="userProfile" class="px-6 py-3 cursor-pointer transition-all duration-200 flex items-center group hover:bg-gradient-to-r hover:from-pink-50 hover:to-orange-50">
          <svg class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" style="color: #E11162;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <div class="flex flex-col flex-1">
            <span class="text-gray-700 font-medium group-hover:font-semibold transition-all duration-200">Profile</span>
            <span class="text-gray-500 text-xs">Edit personal information</span>
          </div>
          <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-1 h-8 rounded-full" style="background: linear-gradient(to bottom, #E11162, #F26538);"></div>
        </div>
        <div onclick = "renderbookingpage()" class="px-6 py-3 cursor-pointer transition-all duration-200 flex items-center group hover:bg-gradient-to-r hover:from-pink-50 hover:to-orange-50 relative">
          <svg class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" style="color: #F26538;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
          </svg>
          <div  class="flex flex-col flex-1">
            <span class="text-gray-700 font-medium group-hover:font-semibold transition-all duration-200">Bookings</span>
            <span class="text-gray-500 text-xs">View past booking history</span>
          </div>
          <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-1 h-8 rounded-full" style="background: linear-gradient(to bottom, #F26538, #EFB85A);"></div>
        </div>
        <hr class="border-gray-200 mx-4">
        <div onclick = "renderAboutus()" id="aboutUs" class="px-6 py-3 cursor-pointer transition-all duration-200 flex items-center group hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50">
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


function renderAboutus(){
  window.location.href = "/src/user/features/aboutUs/about-us.html";
}


function renderProfile(){
  window.location.href = "/src/user/features/profile/profile.html";
}


function renderbookingpage(){
  window.location.href = "/src/user/features/myBookings/myBookings.html";
}

function setupDropdown() {
  mobileIcons = document.getElementById("mobileIcons");
  if (mobileIcons) {
    mobileIcons.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDropdown();
    });
  }

  document.addEventListener("click", (e) => {
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
  isDropdownOpen ? closeDropdown() : showDropdown();
}

function showDropdown() {
  closeDropdown();
  const user = getCurrentUser();
  const loggedIn = user && user.loggedIn === true;
  console.log("🔽 Showing dropdown - User logged in:", loggedIn);
  const html = loggedIn ? generateLoggedInDropdown() : generateGuestDropdown();
  mobileIcons.insertAdjacentHTML("beforeend", html);
  currentDropdown = document.getElementById("filtersDropdown");
  if (currentDropdown) {
    isDropdownOpen = true;
    bindDropdownEvents(currentDropdown, loggedIn);
  }
}

function closeDropdown() {
  if (currentDropdown) {
    currentDropdown.remove();
    currentDropdown = null;
    isDropdownOpen = false;
  }
}

function bindDropdownEvents(dropdown, loggedIn) {
  const aboutUsBtn = dropdown.querySelector("#aboutUs");
  if (aboutUsBtn) {
    aboutUsBtn.addEventListener("click", (e) => {
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
      loginSignupBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        showLoginModal();
        closeDropdown();
      });
    }
  } else {
    const profileBtn = dropdown.querySelector("#userProfile");
    if (profileBtn) {
      profileBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeDropdown();
        setTimeout(() => {
          window.location.href = "/src/user/features/profile/profile.html";
        }, 100);
      });
    }

    const logoutBtn = dropdown.querySelector(".logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleLogout();
        closeDropdown();
      });
    }
  }
}

// ===========================================
// SESSION MANAGEMENT FUNCTIONS
// ===========================================
function autoLoginFromStorage() {
  try {
    const storedUserId = localStorage.getItem('user_id');
    console.log("🔍 Checking stored user_id:", storedUserId);
    
    if (!storedUserId) {
      console.log("👤 No stored user_id found");
      return false;
    }

    // Check if it's admin
    if (admin && admin.id && admin.id.toString() === storedUserId) {
      admin.loggedIn = true;
      currentUser = admin;
      console.log("✅ Auto-login admin:", admin.email);
      return true;
    }

    // Find user by ID
    const user = users.find(u => u.id && u.id.toString() === storedUserId);
    if (user) {
      user.loggedIn = true;
      currentUser = user;
      console.log("✅ Auto-login user:", user.email);
      return true;
    }

    console.log("❌ User with stored ID not found, clearing storage");
    localStorage.removeItem('user_id');
    return false;
    
  } catch (error) {
    console.error("❌ Auto-login error:", error);
    localStorage.removeItem('user_id');
    return false;
  }
}

function saveUserSession(user) {
  try {
    if (user && user.id) {
      localStorage.setItem('user_id', user);
      console.log("💾 User session saved:", user.id);
    }
  } catch (error) {
    console.error("❌ Error saving session:", error);
  }
}

function clearUserSession() {
  try {
    localStorage.removeItem('user_id');
    
    localStorage.removeItem('UserId'); // Legacy cleanup
    localStorage.removeItem('adminUser'); // Legacy cleanup
    console.log("🗑️ User session cleared");
  } catch (error) {
    console.error("❌ Error clearing session:", error);
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
  closeModal();
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
  const closeBtn = modal.querySelector(".close-modal");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeModal());
  }

  const signupBtn = modal.querySelector(".show-signup");
  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      closeModal();
      setTimeout(() => showSignupModal(), 150);
    });
  }

  const passwordInput = modal.querySelector("#password");
  const toggleBtn = modal.querySelector("#togglePassword");
  const eyeIcon = modal.querySelector("#eyeIcon");
  if (passwordInput && toggleBtn && eyeIcon) {
    toggleBtn.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      eyeIcon.classList.toggle("fa-eye");
      eyeIcon.classList.toggle("fa-eye-slash");
    });
  }

  const form = modal.querySelector("#loginForm");
  if (form) {
    form.addEventListener("submit", (e) => handleLoginSubmit(e, form));
  }
}

function bindSignupModalEvents(modal) {
  const closeBtn = modal.querySelector(".close-modal");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeModal());
  }

  const loginBtn = modal.querySelector(".show-login");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      closeModal();
      setTimeout(() => showLoginModal(), 150);
    });
  }

  const form = modal.querySelector("#signupForm");
  if (form) {
    form.addEventListener("submit", (e) => handleSignupSubmit(e, form));
  }
}

// ===========================================
// AUTHENTICATION FUNCTIONS
// ===========================================
function getFieldValue(form, id) {
  try {
    const field = form.querySelector(`#${id}`);
    if (!field) {
      console.warn(`⚠️ Field with id '${id}' not found`);
      return "";
    }
    return field.value ? field.value.trim() : "";
  } catch (error) {
    console.error(`❌ Error getting field value for '${id}':`, error);
    return "";
  }
}

function handleLoginSubmit(e, form) {
  e.preventDefault();
  
  try {
    const emailOrMobile = getFieldValue(form, "emailOrMobile");
    const password = getFieldValue(form, "password");
    
    console.log("🔍 Login attempt:", { emailOrMobile, passwordLength: password.length });
    
    if (!emailOrMobile || !password) {
      showErrorMessage("Please enter both email/mobile and password");
      return;
    }
    
    const loadingElement = form.querySelector("#loading");
    const continueElement = form.querySelector("#continue_btn");

    if (loadingElement) loadingElement.classList.remove("hidden");
    if (continueElement) continueElement.classList.add("hidden");

    setTimeout(() => {
      const result = login(emailOrMobile, password);
      
      if (loadingElement) loadingElement.classList.add("hidden");
      if (continueElement) continueElement.classList.remove("hidden");

      if (result.success) {
        currentUser = result.user;
        
        // Save user session to localStorage
        saveUserSession(result.user);
        
        showSuccessMessage("Login successful! Welcome back.");
        closeModal();
        closeDropdown();
        setTimeout(() => showDropdown(), 100);

        if (result.isAdmin) {
          setTimeout(() => {
            window.location.href = "/src/admin/features/dashboard/dashboard.html";
          }, 1000);
        }
      } else {
        showErrorMessage(result.error);
      }
    }, 2000);
    
  } catch (error) {
    console.error("❌ Login submit error:", error);
    showErrorMessage("An error occurred during login");
  }
}


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

    console.log("📝 Signup attempt:", { ...userData, password: "***", confirmPassword: "***" });

    if (!userData.name || !userData.email || !userData.mobile || !userData.password || !userData.confirmPassword) {
      showErrorMessage("Please fill in all fields");
      return;
    }

    if (userExists(userData.email, userData.mobile)) {
      showErrorMessage("User already exists with this email or mobile number");
      return;
    }

    const result = await register(userData);
    if (result && result.success) {
      try {
        const res = await fetch(`${API_BASE}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });

        if (res.ok) {
          const newUserFromAPI = await res.json();
          if (!Array.isArray(users)) users = [];
          users.push(newUserFromAPI);
          console.log("✅ New user added:", newUserFromAPI);
        }
        
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
      showErrorMessage(result ? result.error : "Registration failed");
    }
  } catch (error) {
    console.error("❌ Signup error:", error);
    showErrorMessage("An unexpected error occurred during signup");
  }
}

function handleLogout() {
  try {
    const result = logout();
    if (result && result.success) {
      showSuccessMessage("Logged out successfully!");
      closeDropdown();
      setTimeout(() => showDropdown(), 100); // Show guest dropdown
    } else {
      showErrorMessage("Logout failed");
    }
  } catch (error) {
    console.error("❌ Logout error:", error);
    showErrorMessage("An error occurred during logout");
  }
}

function findUserByCredentials(emailOrMobile, password) {
  try {
    if (!emailOrMobile || !password) return null;
    
    const input = emailOrMobile.trim().toLowerCase();
    return users.find((user) => {
      if (!user || !user.email || !user.password) return false;
      
      const emailMatch = user.email.toLowerCase() === input;
      const mobileMatch = user.mobile && user.mobile === input;
      const passwordMatch = user.password === password;
      return (emailMatch || mobileMatch) && passwordMatch;
    });
  } catch (error) {
    console.error("❌ Error finding user:", error);
    return null;
  }
}

function userExists(email, mobile) {
  try {
    if (!Array.isArray(users) || !email || !mobile) return false;
    return users.find(user => user && (user.email === email || user.mobile === mobile));
  } catch (error) {
    console.error("❌ Error checking user existence:", error);
    return false;
  }
}

function login(emailOrMobile, password) {
  try {
    if (!emailOrMobile || !password) {
      console.log("❌ Login failed: Missing credentials");
      return { success: false, error: "Please enter both email/mobile and password" };
    }

    const input = emailOrMobile.trim().toLowerCase();
    console.log("🔍 Login attempt for:", input);

    // Check admin login
    if (admin && admin.email && admin.password && 
        admin.email.toLowerCase() === input && admin.password === password) {
      admin.loggedIn = true;
      currentUser = admin;
      console.log("✅ Admin logged in:", admin.email);
      return { success: true, user: admin, isAdmin: true };
    }

    // Check user login
    const user = findUserByCredentials(emailOrMobile, password);
    if (user) {
      user.loggedIn = true;
      currentUser = user;
      console.log("✅ User logged in:", user.email);
      return { success: true, user, isAdmin: false };
    }

    console.log("❌ Login failed for:", input);
    return { success: false, error: "Invalid credentials" };
    
  } catch (error) {
    console.error("❌ Login error:", error);
    return { success: false, error: "An error occurred during login" };
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

    if (!Array.isArray(users)) users = [];
    users.push(newUser);
    console.log("✅ User registered locally:", newUser.email);
    return { success: true, user: newUser };
    
  } catch (error) {
    console.error("❌ Registration error:", error);
    return { success: false, error: "Registration failed" };
  }
}

function logout() {
  try {
    if (currentUser) currentUser.loggedIn = false;
    currentUser = null;
    
    // Clear session storage
    clearUserSession();
    
    console.log("✅ User logged out successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Logout error:", error);
    return { success: false, error: "Logout failed" };
  }
}

function getCurrentUser() {
  return currentUser ? { ...currentUser } : null;
}

// ===========================================
// API FUNCTIONS
// ===========================================
async function fetchUsersFromAPI() {
  try {
    console.log("🔄 Fetching users from API...");
    const res = await fetch(`${API_BASE}/users`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log("📡 Raw API response:", data);

    users = [];
    if (Array.isArray(data)) {
      users = data.map((userObj) => ({
        id: parseInt(userObj.id, 10) || userObj.id,
        email: userObj.email || "",
        password: userObj.password || "",
        name: userObj.name || "",
        loggedIn: false, // Always start as logged out
        mobile: userObj.mobile || null,
        avatar: userObj.avatar || null,
        joinYear: userObj.joinYear || new Date().getFullYear(),
        emailVerified: userObj.emailVerified || false,
        mobileVerified: userObj.mobileVerified || false,
        dob: userObj.dob || "",
        address: userObj.address || "",
        pincode: userObj.pincode || ""
      }));
      console.log(`✅ Successfully loaded ${users.length} users`);
    } else {
      console.warn("⚠️ API response is not an array:", data);
    }

    return users;
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    if (!Array.isArray(users)) {
      users = [];
    }
    return users;
  }
}

async function fetchAdminFromAPI() {
  try {
    console.log("🔄 Fetching admin from API...");
    const res = await fetch(`${API_BASE}/admin`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log("📡 Admin API response:", data);

    if (Array.isArray(data) && data.length > 0) {
      admin = { ...data[0], loggedIn: false }; // Always start as logged out
      console.log("✅ Admin loaded:", admin.email || "No email");
    } else if (data && !Array.isArray(data)) {
      admin = { ...data, loggedIn: false }; // Always start as logged out
      console.log("✅ Admin loaded:", admin.email || "No email");
    } else {
      console.warn("⚠️ No admin data found");
    }

    return admin;
  } catch (error) {
    console.error("❌ Error fetching admin:", error);
    return null;
  }
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================
function showSuccessMessage(message) {
  if (typeof showMessage === 'function') {
    showMessage(message, "success");
  } else {
    console.log("✅ Success:", message);
    alert("Success: " + message);
  }
}

function showErrorMessage(message) {
  if (typeof showMessage === 'function') {
    showMessage(message, "error");
  } else {
    console.error("❌ Error:", message);
    alert("Error: " + message);
  }
}

// ===========================================
// INITIALIZATION
// ===========================================
async function initializeApp() {
  try {
    
    // Load data from API first
    await Promise.all([
      fetchUsersFromAPI(),
      fetchAdminFromAPI()
    ]);
    
    console.log(`📊 Data loaded: ${users.length} users, Admin: ${!!admin}`);
    
    // Try auto-login from localStorage
    const autoLoggedIn = autoLoginFromStorage();
    console.log("🔐 Auto-login result:", autoLoggedIn);
    
    // Setup dropdown
    setupDropdown();
    
    // Setup event listeners
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("auth-modal-overlay")) {
        closeModal();
      }
      if (e.target.closest('#homeBookNow-btn')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = "/src/user/features/rooms/allRooms.html";
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && currentModal) {
        closeModal();
      }
    });
    
    console.log("✅ Thigalzhi Concert Management initialized successfully");
    
  } catch (error) {
    console.error("❌ App initialization error:", error);
    setupDropdown();
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);
