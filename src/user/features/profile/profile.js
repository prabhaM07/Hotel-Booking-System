// ===========================================
// PROFILE PAGE GLOBAL VARIABLES
// ===========================================
let getid = localStorage.getItem('user_id');
let usersdata = [];
let profileData = [];

// Cloudinary Configuration - Add your actual config here
const CLOUDINARY_CONFIG = {
    cloudName: 'dbbzquvdk',
    uploadPreset: 'Zyra-rooms'
};


// ===========================================
// IMAGE UPLOAD FUNCTIONS
// ===========================================
async function uploadImage(imageFile) {
    try {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
        
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Cloudinary error details:', errorData);
            throw new Error(`Cloudinary upload failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const result = await response.json();
        console.log('✅ Cloudinary upload successful:', result.secure_url);
        
        return result.secure_url;
        
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
}

function createImageUploadHandler() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showErrorMessage('Image size must be less than 5MB');
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showErrorMessage('Please select a valid image file');
            return;
        }
        
        try {
            // Show loading state
            showImageUploadLoading(true);
            
            // Upload to Cloudinary
            const imageUrl = await uploadImage(file);
            
            // Update profile data with image URL
            await updateProfileImage(imageUrl);
            
            // Update UI to show new image
            updateProfileImageDisplay(imageUrl);
            
            showSuccessMessage('Profile image updated successfully!');
            
        } catch (error) {
            console.error('Image upload failed:', error);
            showErrorMessage('Failed to upload image. Please try again.');
        } finally {
            // Hide loading stated
            showImageUploadLoading(false);
        }
    });
    
    return input;
}

function showImageUploadLoading(show) {
    const profileImageElements = document.querySelectorAll('.profile-image-container');
    
    profileImageElements.forEach(container => {
        if (show) {
            container.innerHTML = `
                <div class="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center shadow-lg">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F26538]"></div>
                </div>
                <p class="mt-3 text-sm font-medium text-gray-600">Uploading...</p>
            `;
        }
    });
}

function updateProfileImageDisplay(imageUrl) {
  const profileImageContainers = document.querySelectorAll('.profile-image-container');
  
  profileImageContainers.forEach(container => {
    container.innerHTML = `
      <div class="relative w-32 h-32 mx-auto rounded-full overflow-hidden shadow-lg cursor-pointer hover:opacity-80 transition-opacity duration-200" onclick="triggerImageUpload()">
        <img src="${imageUrl}" alt="Profile Image" class="w-full h-full object-cover" />
        <div class="absolute bottom-2 right-2 bg-black bg-opacity-60 rounded-full p-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2.5 2.5 0 113.536 3.536L12.536 14.536a2.5 2.5 0 01-1.415.732L9 15v-4z" />
          </svg>
        </div>
      </div>
      <p class="mt-3 text-sm font-medium text-[#F26538] cursor-pointer hover:text-[#E11162] transition-colors duration-200 text-center" onclick="triggerImageUpload()">Change Photo</p>`;
  });

  // Update edit form image explicitly:
   const profileImage = document.getElementById('profileImagePreview');
  if (profileImage) {
    profileImage.src = imageUrl;
  }

  // Update edit form image
  const editProfileImage = document.getElementById('editProfileImage');
  if (editProfileImage) {
    editProfileImage.src = imageUrl;
  }
}


function displayDefaultProfileImage() {
    const profileImageElements = document.querySelectorAll('.profile-image-container');
    
    profileImageElements.forEach(container => {
        container.innerHTML = `
            <div class="w-32 h-32 mx-auto bg-gray-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-gray-700 transition-colors duration-200" onclick="triggerImageUpload()">
                <svg class="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
            </div>
            <p class="mt-3 text-sm font-medium text-[#F26538] cursor-pointer hover:text-[#E11162] transition-colors duration-200" onclick="triggerImageUpload()">Upload a Photo</p>
        `;
    });
}

async function updateProfileImage(imageUrl) {
  try {
    if (profileData.length > 0) {
      profileData[0].profileimage = imageUrl;
      profileData[0].avatar = imageUrl;  // Add avatar key here
    }

    const userIndex = usersdata.findIndex(user => user.id.toString() === localStorage.getItem('user_id'));
    if (userIndex !== -1) {
      usersdata[userIndex].profileimage = imageUrl;
      usersdata[userIndex].avatar = imageUrl;
    }

    const userId = localStorage.getItem('user_id');
    if (userId) {
      // Fetch current user data (to avoid overwriting unrelated fields)
      const getUserRes = await fetch(`https://68c8b85aceef5a150f622643.mockapi.io/users/${userId}`);
      if (!getUserRes.ok) throw new Error('Failed to fetch the user for update');

      const currentUserData = await getUserRes.json();

      const updatedUserData = { ...currentUserData, profileimage: imageUrl, avatar: imageUrl };

      // Update user with new avatar
      const response = await fetch(`https://68c8b85aceef5a150f622643.mockapi.io/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUserData)
      });

      if (response.ok) {
        console.log("✅ Profile image & avatar updated on server");
      } else {
        console.warn("⚠️ Profile image updated locally but server update failed");
      }
    }
  } catch (error) {
    console.error('❌ Error updating profile image:', error);
    throw error;
  }
}

function triggerImageUpload() {
    const input = createImageUploadHandler();
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

// ===========================================
// PROFILE DATA FUNCTIONS
// ===========================================
function setupTestUser() {
    const testUserId = localStorage.getItem('user_id');
    if (!testUserId && usersdata.length > 0) {
        const testUser = usersdata[0];
        localStorage.setItem('user_id', testUser.id.toString());
        console.log("🧪 Test user set:", testUser.name, "ID:", testUser.id);
        return testUser.id.toString();
    }
    return testUserId;
}

async function fetchUsersFromAPIProfile() {
    try {
        console.log("🔄 Fetching users from API...");
        const res = await fetch("https://68c8b85aceef5a150f622643.mockapi.io/users");
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("📡 Raw API response:", data);

        usersdata = [];
        if (Array.isArray(data)) {
            usersdata = data.map((userObj) => ({
                id: parseInt(userObj.id, 10) || userObj.id,
                email: userObj.email || "",
                password: userObj.password || "",
                name: userObj.name || "",
                loggedIn: false,
                mobile: userObj.mobile || null,
                avatar: userObj.avatar || null,
                profileimage: userObj.profileimage || null, // Added profile image field
                joinYear: userObj.joinYear || new Date().getFullYear(),
                emailVerified: userObj.emailVerified || false,
                mobileVerified: userObj.mobileVerified || false,
                dob: userObj.dob || "",
                address: userObj.address || "",
                pincode: userObj.pincode || ""
            }));
            console.log(`✅ Successfully loaded ${usersdata.length} users`);
        } else {
            console.warn("⚠️ API response is not an array:", data);
        }

        return usersdata;
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        // Create mock data if API fails
        usersdata = [
            {
                id: 1,
                name: "Test User",
                email: "test@hotel.com",
                mobile: "+1 234 567 8900",
                password: "password123",
                joinYear: 2024,
                emailVerified: true,
                mobileVerified: true,
                dob: "1990-01-15",
                address: "123 Hotel Street, Tourism City",
                pincode: "12345",
                profileimage: null,
                loggedIn: false
            }
        ];
        console.log("🧪 Using mock data for development");
        return usersdata;
    }
}

function updateProfileData() {
    try {
        // Get fresh user_id from localStorage
        let storedUserId = localStorage.getItem('user_id');
        
        // If no user_id and we have users, set up test user
        if (!storedUserId && usersdata.length > 0) {
            storedUserId = setupTestUser();
        }
        
        console.log("🔍 Looking for user with ID:", storedUserId);
        
        // Clear previous profile data
        profileData = [];
        
        if (!storedUserId) {
            console.log("❌ No user_id found in localStorage");
            return profileData;
        }

        // Find matching user
        const matchingUser = usersdata.find(user => {
            const userId = user.id.toString();
            return userId === storedUserId;
        });

        if (matchingUser) {
            // Update profileData with matching user
            profileData = [{ ...matchingUser }];
            console.log("✅ Profile data updated:", profileData[0]);
            console.log("👤 User found:", {
                id: profileData[0].id,
                name: profileData[0].name,
                email: profileData[0].email,
                mobile: profileData[0].mobile,
                profileimage: profileData[0].profileimage
            });
        } else {
            console.log("❌ No user found with ID:", storedUserId);
            console.log("📊 Available user IDs:", usersdata.map(u => u.id.toString()));
        }

        return profileData;
    } catch (error) {
        console.error("❌ Error updating profile data:", error);
        profileData = [];
        return profileData;
    }
}

function getCurrentProfileData() {
    if (profileData.length > 0) {
        return profileData[0];
    }
    return null;
}

function checkAuthenticationStatus() {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        console.log("⚠️ User not authenticated");
        showLoginPrompt();
        return false;
    }
    return true;
}

function showLoginPrompt() {
    const loginPrompt = document.createElement('div');
    loginPrompt.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    loginPrompt.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div class="text-center">
                <h2 class="text-2xl font-bold bg-gradient-to-r from-[#E11162] to-[#F26538] bg-clip-text text-transparent mb-4">
                    Login Required
                </h2>
                <p class="text-gray-600 mb-6">Please log in to access your profile.</p>
                <div class="flex flex-col sm:flex-row gap-3">
                    <button onclick="setupDemoUser()" class="px-6 py-3 bg-gradient-to-r from-[#EFB85A] to-[#F26538] text-white rounded-lg font-semibold hover:scale-105 transition-transform">
                        Use Demo Account
                    </button>
                    <button onclick="goToLogin()" class="px-6 py-3 border-2 border-[#F26538] text-[#F26538] rounded-lg font-semibold hover:scale-105 transition-transform">
                        Go to Login
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(loginPrompt);
}

function setupDemoUser() {
    if (usersdata.length > 0) {
        const demoUser = usersdata[0];
        localStorage.setItem('user_id', demoUser.id.toString());
        updateProfileData();
        
        // Remove login prompt
        const prompt = document.querySelector('.fixed.inset-0');
        if (prompt) prompt.remove();
        
        // Initialize profile manager
        new ProfileManager();
        
        console.log("🎭 Demo user activated:", demoUser.name);
    }
}

function goToLogin() {
    window.location.href = "/index.html"; // Adjust path as needed
}

async function initializeProfileApp() {
    try {
        console.log("🚀 Initializing Hotel Booking Profile Page...");
        
        // Load data from API first
        await fetchUsersFromAPIProfile();
        
        // Update profile data after users are loaded
        updateProfileData();
        
        console.log(`📊 Initialization complete: ${usersdata.length} users loaded`);
        console.log(`👤 Profile data loaded: ${profileData.length > 0 ? 'Yes' : 'No'}`);
        
    } catch (error) {
        console.error("❌ App initialization error:", error);
    }
}

// ===========================================
// PROFILE MANAGER CLASS
// ===========================================
class ProfileManager {
    constructor() {
        if (!checkAuthenticationStatus() && profileData.length === 0) {
            return;
        }

        this.waitForProfileData();

        this.profileView = document.getElementById('profileView');
        this.editProfileView = document.getElementById('editProfileView');
        this.editProfileBtn = document.getElementById('editProfileBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.editProfileForm = document.getElementById('editProfileForm');

        this.editPhone = document.getElementById('editPhone');
        this.editDOB = document.getElementById('editDOB');
        this.editAddress = document.getElementById('editAddress');
        this.editPincode = document.getElementById('editPincode');

        this.initEventListeners();
    }

    async waitForProfileData() {
        let attempts = 0;
        const maxAttempts = 50;

        const checkData = () => {
            if (profileData.length > 0) {
                this.profileData = profileData[0];
                this.loadProfileData();
                console.log("✅ ProfileManager initialized with user data:", this.profileData.name);
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(checkData, 100);
            } else {
                console.log("⚠️ No profile data found, checking authentication...");
                if (!checkAuthenticationStatus()) {
                    return;
                }
                this.profileData = {
                    name: 'Hotel Guest',
                    email: 'user@hotel.com',
                    mobile: '+91',
                    dob: '',
                    address: '',
                    pincode: '',
                    profileimage: null,
                    joinYear: new Date().getFullYear(),
                    emailVerified: false,
                    mobileVerified: false
                };
                this.loadProfileData();
            }
        };

        checkData();
    }

    initEventListeners() {
        if (this.editProfileBtn) {
            this.editProfileBtn.addEventListener('click', () => this.showEditView());
        }

        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => {
                this.showProfileView();
                this.loadEditForm();
                this.clearAllErrors();
            });
        }

        if (this.editProfileForm) {
            this.editPhone.addEventListener('input', () => this.validatePhone());
            this.editDOB.addEventListener('input', () => this.validateDOB());
            this.editAddress.addEventListener('input', () => this.validateAddress());
            this.editPincode.addEventListener('input', () => this.validatePincode());

            this.editProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const isValid = this.validatePhone() & this.validateDOB() & this.validateAddress() & this.validatePincode();
                if (isValid) {
                    this.saveProfile();
                } else {
                    this.showErrorMessage('Please fix validation errors before submitting.');
                }
            });
        }
    }

    showError(input, message) {
        let errorElem = input.nextElementSibling;
        if (!errorElem || !errorElem.classList.contains("error-message")) {
            errorElem = document.createElement("p");
            errorElem.className = "error-message text-red-600 text-xs mt-1";
            input.parentNode.appendChild(errorElem);
        }
        errorElem.textContent = message;
        input.classList.add("border-red-600");
    }

    clearError(input) {
        let errorElem = input.nextElementSibling;
        if (errorElem && errorElem.classList.contains("error-message")) {
            errorElem.textContent = "";
        }
        input.classList.remove("border-red-600");
    }

    clearAllErrors() {
        [this.editPhone, this.editDOB, this.editAddress, this.editPincode].forEach(input => this.clearError(input));
    }

    validatePhone() {
        const val = this.editPhone.value.trim();
        if (val === "") {
            this.clearError(this.editPhone);
            return true;
        } else if (!/^\d{10}$/.test(val)) {
            this.showError(this.editPhone, "Enter a valid 10-digit phone number");
            return false;
        }
        this.clearError(this.editPhone);
        return true;
    }

    validateDOB() {
        const val = this.editDOB.value;
        if (val === "") {
            this.clearError(this.editDOB);
            return true;
        }
        const dobDate = new Date(val);
        if (dobDate >= new Date()) {
            this.showError(this.editDOB, "Date of birth cannot be in the future");
            return false;
        }
        this.clearError(this.editDOB);
        return true;
    }

    validateAddress() {
        if (this.editAddress.value.trim() === "") {
            this.clearError(this.editAddress);
            return true;
        }
        // No specific format check; just clear errors if any
        this.clearError(this.editAddress);
        return true;
    }

    validatePincode() {
        const val = this.editPincode.value.trim();
        if (val === "") {
            this.clearError(this.editPincode);
            return true;
        } else if (!/^\d{6}$/.test(val)) {
            this.showError(this.editPincode, "Pin code must be exactly 6 digits");
            return false;
        }
        this.clearError(this.editPincode);
        return true;
    }

    showEditView() {
        if (this.profileView && this.editProfileView) {
            this.profileView.classList.add('hidden');
            this.editProfileView.classList.remove('hidden');
            this.loadEditForm();
        }
    }

    showProfileView() {
        if (this.editProfileView && this.profileView) {
            this.editProfileView.classList.add('hidden');
            this.profileView.classList.remove('hidden');
        }
    }

    loadProfileData() {
        if (!this.profileData) return;

        try {
            const updates = {
                'profileName': this.profileData.name,
                'editProfileName': this.profileData.name,
                'profileGreeting': `Hello, ${this.profileData.name}`,
                'editProfileGreeting': `Hello, ${this.profileData.name}`,
                'profileEmail': this.profileData.email || 'No email provided',
                'profilePhone': this.profileData.mobile || 'No phone provided',
                'profileDOB': this.profileData.dob ? this.formatDate(this.profileData.dob) : 'No DOB provided',
                'profileAddress': this.profileData.address || 'No address provided',
                'profilePincode': this.profileData.pincode || 'No pincode provided'
            };

            Object.entries(updates).forEach(([elementId, value]) => {
                const element = document.getElementById(elementId);
                if (element) element.textContent = value;
            });

            const joinYearElements = document.querySelectorAll('.join-year');
            joinYearElements.forEach(element => {
                element.textContent = `Joined in ${this.profileData.joinYear || new Date().getFullYear()}`;
            });

            this.updateProfileImages();
            this.updateVerificationStatus();

            console.log("✅ Profile data loaded into HTML");
        } catch (error) {
            console.error("❌ Error loading profile data:", error);
        }
    }

    loadEditForm() {
        if (!this.profileData) return;

        try {
            const fieldUpdates = {
                'editEmail': this.profileData.email || '',
                'editPhone': this.profileData.mobile || '',
                'editDOB': this.profileData.dob || '',
                'editAddress': this.profileData.address || '',
                'editPincode': this.profileData.pincode || ''
            };

            Object.entries(fieldUpdates).forEach(([fieldId, value]) => {
                const field = document.getElementById(fieldId);
                if (field) field.value = value;
            });

            console.log("✅ Edit form populated with user data");
        } catch (error) {
            console.error("❌ Error loading edit form:", error);
        }
    }

    async saveProfile() {
        try {
            const formData = {
                name: this.profileData.name,
                email: document.getElementById('editEmail').value,
                mobile: document.getElementById('editPhone').value,
                dob: document.getElementById('editDOB').value,
                address: document.getElementById('editAddress').value,
                pincode: document.getElementById('editPincode').value,
                profileimage: this.profileData.profileimage || null
            };

            // No required fields check because all optional

            this.profileData = { ...this.profileData, ...formData };

            if (profileData.length > 0) {
                profileData[0] = { ...profileData[0], ...formData };
            }

            const userIndex = usersdata.findIndex(user => user.id.toString() === localStorage.getItem('user_id'));
            if (userIndex !== -1) {
                usersdata[userIndex] = { ...usersdata[userIndex], ...formData };
            }

            this.loadProfileData();
            this.showProfileView();
            this.showSuccessMessage('Profile updated successfully!');

            try {
                const userId = localStorage.getItem('user_id');
                const response = await fetch(`https://68c8b85aceef5a150f622643.mockapi.io/users/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    console.log("✅ Profile updated on server");
                } else {
                    console.warn("⚠️ Profile updated locally but server update failed");
                }
            } catch (apiError) {
                console.error("❌ API update error:", apiError);
            }

        } catch (error) {
            console.error("❌ Error saving profile:", error);
            this.showErrorMessage("An error occurred while saving profile.");
        }
    }

    updateProfileImages() {
        const imageUrl = this.profileData.avatar || this.profileData.profileimage;
        if (imageUrl) {
            updateProfileImageDisplay(imageUrl);
        } else {
            displayDefaultProfileImage();
        }
    }

    updateVerificationStatus() {
        const emailStatusElements = document.querySelectorAll('.email-status');
        emailStatusElements.forEach(element => {
            if (this.profileData.emailVerified) {
                element.innerHTML = `
                    <svg class="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Email Confirmed
                `;
                element.className = 'email-status flex items-center justify-center text-sm text-gray-700 bg-green-50 rounded-full px-4 py-2';
            } else {
                element.innerHTML = `
                    <svg class="w-4 h-4 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    Email Pending
                `;
                element.className = 'email-status flex items-center justify-center text-sm text-gray-700 bg-yellow-50 rounded-full px-4 py-2';
            }
        });

        const mobileStatusElements = document.querySelectorAll('.mobile-status');
        mobileStatusElements.forEach(element => {
            if (this.profileData.mobileVerified) {
                element.innerHTML = `
                    <svg class="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Mobile Confirmed
                `;
                element.className = 'mobile-status flex items-center justify-center text-sm text-gray-700 bg-green-50 rounded-full px-4 py-2';
            } else {
                element.innerHTML = `
                    <svg class="w-4 h-4 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    Mobile Pending
                `;
                element.className = 'mobile-status flex items-center justify-center text-sm text-gray-700 bg-yellow-50 rounded-full px-4 py-2';
            }
        });
    }

    formatDate(dateString) {
        if (!dateString) return 'No date provided';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    }

    showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 transition-all transform translate-x-full border border-green-400';
        notification.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                ${message}
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.remove('translate-x-full'), 100);
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => document.body.contains(notification) && document.body.removeChild(notification), 300);
        }, 4000);
    }

    showErrorMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-gradient-to-r from-[#E11162] to-[#F26538] text-white px-6 py-4 rounded-xl shadow-2xl z-50 transition-all transform translate-x-full border border-red-400';
        notification.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                ${message}
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.remove('translate-x-full'), 100);
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => document.body.contains(notification) && document.body.removeChild(notification), 300);
        }, 4000);
    }
}


// ===========================================
// UTILITY FUNCTIONS
// ===========================================
function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 transition-all transform translate-x-full border border-green-400';
    notification.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => document.body.contains(notification) && document.body.removeChild(notification), 300);
    }, 4000);
}

function showErrorMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-gradient-to-r from-[#E11162] to-[#F26538] text-white px-6 py-4 rounded-xl shadow-2xl z-50 transition-all transform translate-x-full border border-red-400';
    notification.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => document.body.contains(notification) && document.body.removeChild(notification), 300);
    }, 4000);
}

// ===========================================
// INITIALIZATION
// ===========================================
document.addEventListener("DOMContentLoaded", async () => {
    await initializeProfileApp();
    
    // Only initialize ProfileManager if we have profile data or show login prompt
    if (profileData.length > 0 || localStorage.getItem('user_id')) {
        new ProfileManager();
    }
});

// Make functions globally available
window.setupDemoUser = setupDemoUser;
window.goToLogin = goToLogin;
window.triggerImageUpload = triggerImageUpload;
