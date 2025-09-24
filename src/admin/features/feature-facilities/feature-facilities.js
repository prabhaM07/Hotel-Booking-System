// API Configuration - Updated endpoints
const API_BASE = 'https://68c8b85aceef5a150f622643.mockapi.io';
const FEATURE_ENDPOINT = `${API_BASE}/admin/6`;  // Features endpoint
const FACILITY_ENDPOINT = `${API_BASE}/admin/7`; // Facilities endpoint

// Global variables
let featuresData = [];
let featuresFilteredData = [];
let facilitiesData = [];
let facilitiesFilteredData = [];
let isEditMode = false;
let editingId = null;

// CLOUDINARY CONFIGURATION - Replace with your credentials
const CLOUDINARY_CONFIG = {
    cloudName: 'dbbzquvdk',  // Replace with your actual cloud name
    uploadPreset: 'Zyra-rooms'  // Replace with your preset name
};

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

// DOM Elements
let loadingIndicator, featuresTableContainer, noFeaturesDataMessage, facilitiesTableContainer, noFacilitiesDataMessage, facilitiesTableBody, featuresTableBody, mainContainer;

// Cloudinary Upload Function
async function uploadImageToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    
    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }
        
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
}

// Initialize DOM elements after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize DOM elements
  facilitiesTableBody = document.getElementById("facilitiesTableBody");
  featuresTableBody = document.getElementById("featuresTableBody");
  loadingIndicator = document.getElementById("loadingIndicator");
  featuresTableContainer = document.getElementById("featuresTableContainer");
  noFeaturesDataMessage = document.getElementById("noFeaturesDataMessage");
  facilitiesTableContainer = document.getElementById("facilitiesTableContainer");
  noFacilitiesDataMessage = document.getElementById("noFacilitiesDataMessage");
  mainContainer = document.getElementById("mainContentArea")
  

  // Initialize modal event listeners
  initializeModalListeners();
  
  // Fetch data
  fetchFeaturesFacilitiesData();
});

// Function to get action buttons with icons
function getFeatureActionButtons(feature) {
  return `
    <div class="flex items-center gap-2">
      <button class="edit-btn text-blue-600 hover:text-blue-900 p-1 rounded transition-colors" 
              title="Edit Feature" data-feature-id="${feature.id}">
        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button class="delete-btn text-red-600 hover:text-red-900 p-1 rounded transition-colors" 
              title="Delete Feature" data-feature-id="${feature.id}">
        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  `;
}

function getFacilityActionButtons(facility) {
  return `
    <div class="flex items-center gap-2">
      <button class="edit-btn text-blue-600 hover:text-blue-900 p-1 rounded transition-colors" 
              title="Edit Facility" data-facility-id="${facility.id}">
        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button class="delete-btn text-red-600 hover:text-red-900 p-1 rounded transition-colors" 
              title="Delete Facility" data-facility-id="${facility.id}">
        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  `;
}

// API Helper Functions
async function updateFeatureOnAPI(updatedData) {
  try {
    const response = await fetch(FEATURE_ENDPOINT, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating features on API:', error);
    throw error;
  }
}

async function updateFacilityOnAPI(updatedData) {
  try {
    const response = await fetch(FACILITY_ENDPOINT, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating facilities on API:', error);
    throw error;
  }
}

// Initialize modal event listeners
function initializeModalListeners() {
  // Feature modal listeners
  document.getElementById('addFeatureBtn').addEventListener('click', () => {
    resetFeatureModal();
    document.getElementById('addFeatureModal').classList.remove('hidden');
  });

  document.getElementById('cancelAddFeature').addEventListener('click', () => {
    document.getElementById('addFeatureModal').classList.add('hidden');
    resetFeatureModal();
  });

  // Facility modal listeners
  document.getElementById('addFacilityBtn').addEventListener('click', () => {
    resetFacilityModal();
    document.getElementById('addFacilityModal').classList.remove('hidden');
  });

  document.getElementById('cancelAddFacility').addEventListener('click', () => {
    document.getElementById('addFacilityModal').classList.add('hidden');
    resetFacilityModal();
  });

  // File input listener
  document.getElementById('facilityIconInput').addEventListener('change', function() {
    const fileName = this.files[0] ? this.files[0].name : 'No file chosen';
    document.getElementById('facilityFileName').textContent = fileName;
  });

  // Form submit listeners
  document.getElementById('addFeatureForm').addEventListener('submit', handleFeatureSubmit);
  document.getElementById('addFacilityForm').addEventListener('submit', handleFacilitySubmit);
  let deleteType = null; // 'feature' or 'facility'
let deleteId = null;


document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
    document.getElementById('confirmDeleteModal').classList.add('hidden');
    deleteType = null;
    deleteId = null;
  });

  document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    document.getElementById('confirmDeleteModal').classList.add('hidden');
    
    if (deleteType === 'feature' && deleteId !== null) {
      await executeFeatureDelete(deleteId);
    } else if (deleteType === 'facility' && deleteId !== null) {
      await executeFacilityDelete(deleteId);
    }
    
    deleteType = null;
    deleteId = null;
  });

  // Event delegation for delete buttons
document.addEventListener('click', function(e) {
    if (e.target.closest('.delete-btn[data-feature-id]')) {
        const featureId = parseInt(e.target.closest('.delete-btn').dataset.featureId);
        deleteType = 'feature';
        deleteId = featureId;
        document.getElementById('confirmDeleteModal').classList.remove('hidden');
        document.querySelector('#confirmDeleteModal h2').textContent = 'Confirm Deletion of Feature';
    }

    if (e.target.closest('.delete-btn[data-facility-id]')) {
        const facilityId = parseInt(e.target.closest('.delete-btn').dataset.facilityId);
        deleteType = 'facility';
        deleteId = facilityId;
        document.getElementById('confirmDeleteModal').classList.remove('hidden');
        document.querySelector('#confirmDeleteModal h2').textContent = 'Confirm Deletion of Facility';
    }
});

  // Event delegation for edit and delete buttons
  document.addEventListener('click', function(e) {
    if (e.target.closest('.edit-btn[data-feature-id]')) {
      const featureId = parseInt(e.target.closest('.edit-btn').dataset.featureId);
      editFeature(featureId);
    }
    
    
    
    if (e.target.closest('.edit-btn[data-facility-id]')) {
      const facilityId = parseInt(e.target.closest('.edit-btn').dataset.facilityId);
      editFacility(facilityId);
    }
     const profileDropdown = document.getElementById('profileDropdown');
  const profileSection = e.target.closest('.p-4.border-t');
  
  if (!profileSection && !profileDropdown.classList.contains('hidden')) {
    profileDropdown.classList.add('hidden');
    document.getElementById('dropdownArrow').style.transform = 'rotate(0deg)';
  }
    
  });
}

// Reset modals
function resetFeatureModal() {
  isEditMode = false;
  editingId = null;
  document.getElementById('featureModalTitle').textContent = 'Add Feature';
  document.getElementById('submitFeatureBtn').textContent = 'Submit';
  document.getElementById('addFeatureForm').reset();
  document.getElementById('featureId').value = '';
}

function resetFacilityModal() {
  isEditMode = false;
  editingId = null;
  document.getElementById('facilityModalTitle').textContent = 'Add Facility';
  document.getElementById('submitFacilityBtn').textContent = 'Submit';
  document.getElementById('addFacilityForm').reset();
  document.getElementById('facilityId').value = '';
  document.getElementById('facilityFileName').textContent = 'No file chosen';
  document.getElementById('currentIcon').classList.add('hidden');
}

// Handle feature form submission with API calls
async function handleFeatureSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('featureName').value.trim();
  const featureId = document.getElementById('featureId').value;
  
  if (!name) {
    alert('Please enter a feature name');
    return;
  }

  try {
    document.getElementById('submitFeatureBtn').disabled = true;
    document.getElementById('submitFeatureBtn').textContent = 'Processing...';

    if (isEditMode && featureId) {
      // Update existing feature
      const featureIndex = featuresFilteredData.findIndex(f => f.id == featureId);
      if (featureIndex !== -1) {
        featuresFilteredData[featureIndex].name = name;
        
        // Update the complete features data structure
        const updatedFeaturesData = {
          id: "6",
          features: featuresFilteredData
        };
        
        // Send PUT request to API
        await updateFeatureOnAPI(updatedFeaturesData);
        console.log('Feature updated on API:', featuresFilteredData[featureIndex]);
      }
    } else {
      // Add new feature
      const newFeature = {
        id: featuresFilteredData.length > 0 ? Math.max(...featuresFilteredData.map(f => f.id)) + 1 : 1,
        name: name
      };
      
      featuresFilteredData.push(newFeature);
      
      // Update the complete features data structure
      const updatedFeaturesData = {
        id: "6",
        features: featuresFilteredData
      };
      
      // Send PUT request to API
      await updateFeatureOnAPI(updatedFeaturesData);
      console.log('Feature added to API:', newFeature);
    }

    renderFeaturesTable();
    document.getElementById('addFeatureModal').classList.add('hidden');
    resetFeatureModal();
    
  } catch (error) {
    console.error('Error saving feature:', error);
    alert('Error saving feature. Please try again.');
  } finally {
    document.getElementById('submitFeatureBtn').disabled = false;
    document.getElementById('submitFeatureBtn').textContent = isEditMode ? 'Update' : 'Submit';
  }
}

// Updated Handle Facility Form Submission with Cloudinary
async function handleFacilitySubmit(e) {
    e.preventDefault();
    const name = document.getElementById('facilityName').value.trim();
    const description = document.getElementById('facilityDescription').value.trim();
    const iconFile = document.getElementById('facilityIconInput').files[0];
    const facilityId = document.getElementById('facilityId').value;
    
    if (!name) {
        alert('Please enter a facility name');
        return;
    }

    try {
        document.getElementById('submitFacilityBtn').disabled = true;
        document.getElementById('submitFacilityBtn').textContent = 'Processing...';

        let iconUrl = null;
        
        // Upload image to Cloudinary if file is selected
        if (iconFile) {
            iconUrl = await uploadImageToCloudinary(iconFile);
        }

        if (isEditMode && facilityId) {
            // Update existing facility
            const facilityIndex = facilitiesFilteredData.findIndex(f => f.id == facilityId);
            if (facilityIndex !== -1) {
                facilitiesFilteredData[facilityIndex].name = name;
                facilitiesFilteredData[facilityIndex].description = description || 'No description provided';
                
                // Update icon URL if new file uploaded
                if (iconUrl) {
                    facilitiesFilteredData[facilityIndex].icon = iconUrl;
                }
                
                const updatedFacilitiesData = {
                    id: "7",
                    facilities: facilitiesFilteredData
                };
                
                await updateFacilityOnAPI(updatedFacilitiesData);
                console.log('Facility updated on API:', facilitiesFilteredData[facilityIndex]);
            }
        } else {
            // Add new facility
            const newFacilityId = facilitiesFilteredData.length > 0 ? Math.max(...facilitiesFilteredData.map(f => f.id)) + 1 : 1;
            const newFacility = {
                id: newFacilityId,
                name: name,
                description: description || 'No description provided'
            };
            
            // Add icon URL if uploaded
            if (iconUrl) {
                newFacility.icon = iconUrl;
            }
            
            facilitiesFilteredData.push(newFacility);
            
            const updatedFacilitiesData = {
                id: "7",
                facilities: facilitiesFilteredData
            };
            
            await updateFacilityOnAPI(updatedFacilitiesData);
            console.log('Facility added to API:', newFacility);
        }

        renderFacilitiesTable();
        document.getElementById('addFacilityModal').classList.add('hidden');
        resetFacilityModal();
        
    } catch (error) {
        console.error('Error saving facility:', error);
        alert('Error saving facility. Please try again.');
    } finally {
        document.getElementById('submitFacilityBtn').disabled = false;
        document.getElementById('submitFacilityBtn').textContent = isEditMode ? 'Update' : 'Submit';
    }
}

// Fetch features and facilities data from separate API endpoints
async function fetchFeaturesFacilitiesData() {
  try {
    loadingIndicator.style.display = "flex";
    
    // Fetch both features and facilities
    const [featuresResponse, facilitiesResponse] = await Promise.all([
      fetch(FEATURE_ENDPOINT),
      fetch(FACILITY_ENDPOINT)
    ]);
    
    const featuresData = await featuresResponse.json();
    const facilitiesData = await facilitiesResponse.json();
    
    // Extract the arrays from the response
    featuresFilteredData = featuresData.features || [];
    facilitiesFilteredData = facilitiesData.facilities || [];
    
    console.log("Fetched features data:", featuresData);
    console.log("Fetched facilities data:", facilitiesData);

    // Handle features display
    if (featuresFilteredData.length === 0) {
      noFeaturesDataMessage.style.display = "block";
      featuresTableContainer.style.display = "none";
    } else {
      noFeaturesDataMessage.style.display = "none";
      renderFeaturesTable();
    }

    // Handle facilities display
    if (facilitiesFilteredData.length === 0) {
      noFacilitiesDataMessage.style.display = "block";
      facilitiesTableContainer.style.display = "none";
    } else {
      noFacilitiesDataMessage.style.display = "none";
      renderFacilitiesTable();
    }
  } catch (error) {
    console.error("Error fetching features or facilities data:", error);
    noFeaturesDataMessage.style.display = "block";
    noFacilitiesDataMessage.style.display = "block";
  } finally {
    loadingIndicator.style.display = "none";
  }
}

// Render features table with icon buttons
function renderFeaturesTable() {
  mainContainer.classList.remove('hidden');
  featuresTableContainer.style.display = "block";
  featuresTableBody.innerHTML = "";

  featuresFilteredData.forEach((feature, index) => {
    const tr = document.createElement("tr");
    tr.classList.add("hover:bg-gray-50");
    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${feature.id || index + 1}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${feature.name || 'N/A'}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ${getFeatureActionButtons(feature)}
      </td>
    `;
    featuresTableBody.appendChild(tr);
  });
}

// Updated Render Facilities Table with Cloudinary URLs
function renderFacilitiesTable() {
    facilitiesTableContainer.style.display = "block";
    facilitiesTableBody.innerHTML = "";

    facilitiesFilteredData.forEach((facility, index) => {
        const tr = document.createElement("tr");
        tr.classList.add("hover:bg-gray-50");
        
        let iconDisplay;
        
        if (facility.icon) {
            iconDisplay = `<img src="${facility.icon}" alt="Icon" class="w-8 h-8 object-cover rounded">`;
        } else {
            iconDisplay = '<span class="text-gray-400">N/A</span>';
        }
        
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${facility.id || index + 1}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${iconDisplay}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${facility.name || 'N/A'}</td>
            <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title="${facility.description || 'N/A'}">${facility.description || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${getFacilityActionButtons(facility)}
            </td>
        `;
        facilitiesTableBody.appendChild(tr);
    });
}

// Edit and delete functions with API calls
function editFeature(id) {
  const feature = featuresFilteredData.find(f => f.id === id);
  if (feature) {
    isEditMode = true;
    editingId = id;
    document.getElementById('featureModalTitle').textContent = 'Edit Feature';
    document.getElementById('submitFeatureBtn').textContent = 'Update';
    document.getElementById('featureName').value = feature.name;
    document.getElementById('featureId').value = feature.id;
    document.getElementById('addFeatureModal').classList.remove('hidden');
  }
}

// Updated Delete Feature Function
async function deleteFeature(id) {
    deleteType = 'feature';
    deleteId = id;
    
    // Update modal text for feature
    document.querySelector('#confirmDeleteModal h2').textContent = 'Confirm Deletion';
    document.querySelector('#confirmDeleteModal p').textContent = 'Are you sure you want to delete this feature? This action cannot be undone.';
    
    // Show modal
    document.getElementById('confirmDeleteModal').classList.remove('hidden');
}

// Execute feature deletion
async function executeFeatureDelete(id) {
    try {
        // Show loading state
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.textContent = 'Deleting...';

        // Remove from local array
        featuresFilteredData = featuresFilteredData.filter(f => f.id !== id);

        // Update the complete features data structure
        const updatedFeaturesData = {
            id: "6",
            features: featuresFilteredData
        };

        // Send PUT request to API
        await updateFeatureOnAPI(updatedFeaturesData);

        // Re-render the table
        renderFeaturesTable();

        // Show/hide no data message
        if (featuresFilteredData.length === 0) {
            noFeaturesDataMessage.style.display = "block";
            featuresTableContainer.style.display = "none";
        }

        console.log('Feature deleted from API, id:', id);
    } catch (error) {
        console.error('Error deleting feature:', error);
        alert('Error deleting feature. Please try again.');
        fetchFeaturesFacilitiesData();
    } finally {
        // Reset button state
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = 'Delete';
    }
}

// Updated Edit Facility Function
function editFacility(id) {
    const facility = facilitiesFilteredData.find(f => f.id === id);
    if (facility) {
        isEditMode = true;
        editingId = id;
        document.getElementById('facilityModalTitle').textContent = 'Edit Facility';
        document.getElementById('submitFacilityBtn').textContent = 'Update';
        document.getElementById('facilityName').value = facility.name;
        document.getElementById('facilityDescription').value = facility.description || '';
        document.getElementById('facilityId').value = facility.id;
        
        // Show current icon from Cloudinary URL if exists
        if (facility.icon) {
            document.getElementById('currentIconImage').src = facility.icon;
            document.getElementById('currentIcon').classList.remove('hidden');
        }
        
        document.getElementById('addFacilityModal').classList.remove('hidden');
    }
}

// Updated Delete Facility Function
async function deleteFacility(id) {
    deleteType = 'facility';
    deleteId = id;
    
    // Update modal text for facility
    document.querySelector('#confirmDeleteModal h2').textContent = 'Confirm Deletion';
    document.querySelector('#confirmDeleteModal p').textContent = 'Are you sure you want to delete this facility? This action cannot be undone.';
    
    // Show modal
    document.getElementById('confirmDeleteModal').classList.remove('hidden');
}

async function executeFacilityDelete(id) {
    try {
        // Show loading state
        document.getElementById('confirmDeleteBtn').disabled = true;
        document.getElementById('confirmDeleteBtn').textContent = 'Deleting...';
        
        // Remove from local array
        facilitiesFilteredData = facilitiesFilteredData.filter(f => f.id !== id);
        
        const updatedFacilitiesData = {
            id: "7",
            facilities: facilitiesFilteredData
        };
        
        await updateFacilityOnAPI(updatedFacilitiesData);
        
        renderFacilitiesTable();
        
        if (facilitiesFilteredData.length === 0) {
            noFacilitiesDataMessage.style.display = "block";
            facilitiesTableContainer.style.display = "none";
        }
        
        console.log('Facility deleted from API, id:', id);
    } catch (error) {
        console.error('Error deleting facility:', error);
        alert('Error deleting facility. Please try again.');
        fetchFeaturesFacilitiesData();
    } finally {
        // Reset button state
        document.getElementById('confirmDeleteBtn').disabled = false;
        document.getElementById('confirmDeleteBtn').textContent = 'Delete';
    }
}


// Profile dropdown functionality
function toggleProfileDropdown() {
  const dropdown = document.getElementById('profileDropdown');
  const arrow = document.getElementById('dropdownArrow');
  
  if (dropdown.classList.contains('hidden')) {
    dropdown.classList.remove('hidden');
    arrow.style.transform = 'rotate(180deg)';
  } else {
    dropdown.classList.add('hidden');
    arrow.style.transform = 'rotate(0deg)';
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const confirmModal = document.getElementById('confirmDeleteModal');
    const modalContent = e.target.closest('.bg-white.rounded-lg');
    
    if (e.target === confirmModal && !modalContent) {
        confirmModal.classList.add('hidden');
        deleteType = null;
        deleteId = null;
    }
 
});
