// =====================================
// API CONFIGURATION & GLOBAL VARIABLES
// =====================================

const API_BASE = 'https://68c8b85aceef5a150f622643.mockapi.io';
const ADMIN_ENDPOINT = `${API_BASE}/admin`;
const ROOMS_ENDPOINT = `${API_BASE}/admin/5`;
const VEIWROOM_ENDPOINT = `${API_BASE}/admin/10`;

const FEATURE_ENDPOINT = `${API_BASE}/admin/6`;  // Features endpoint
const FACILITY_ENDPOINT = `${API_BASE}/admin/7`; // Facilities endpoint



// CLOUDINARY CONFIGURATION - Replace with your credentials
const CLOUDINARY_CONFIG = {
    cloudName: 'dbbzquvdk',  // Replace with your actual cloud name
    uploadPreset: 'Zyra-rooms'  // Replace with your preset name
};

let featuresFilteredData = [];
let facilitiesFilteredData = [];

// DOM element references - ADD THESE
let noFeaturesDataMessage;
let noFacilitiesDataMessage;
let featuresTableContainer;
let facilitiesTableContainer;


const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

let roomsData = [];
let filteredData = [];
let currentImageRoomId = null;
let currentAddStep = 1;
let currentEditStep = 1;

// Local Storage Keys
const IMAGES_STORAGE_KEY = 'room_images';
const THUMBNAILS_STORAGE_KEY = 'selectedThumbnails';

// DOM Elements
let roomTableBody, addRoomBtn, loadingIndicator, roomsTable, noDataMessage;
let addModal, closeAddModal, cancelAdd, addForm, addImageInput, addFileName;
let addStep1, addStep2, addStep3, addNextBtn, addPrevBtn, addSubmitBtn;
let editModal, closeEditModal, cancelEdit, editForm;
let editStep1, editStep2, editStep3, editNextBtn, editPrevBtn, editSubmitBtn;
let imageModal, imageModalTitle, cancelImage, submitImage, roomImageInput, roomImageFileName, addImageBtn;
let addStepIndicators, editStepIndicators;

// =====================================
// CLOUDINARY FUNCTIONS
// =====================================

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    
    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        return {
            url: data.secure_url,
            publicId: data.public_id,
            thumbnailUrl: data.secure_url.replace('/upload/', '/upload/w_300,h_200,c_fill/')
        };
    } catch (error) {
        console.error('Cloudinary upload failed:', error);
        throw error;
    }
}

// =====================================
// IMAGE STORAGE FUNCTIONS
// =====================================

function getRoomDisplayThumbnail(room) {
    // Check if thumbnailUrl is directly stored
    if (room.thumbnailUrl) {
        return room.thumbnailUrl;
    }
    
    // Fallback to first image
    if (room.images && room.images.length > 0) {
        const firstImage = room.images[0];
        if (typeof firstImage === 'object') {
            return firstImage.thumbnailUrl || firstImage.url;
        } else if (typeof firstImage === 'string') {
            return firstImage;
        }
    }
    
    return null; // No thumbnail available
}


async function getRoomImagesFromAPI(roomId) {
    try {
        console.log('Fetching images for room ID:', roomId, 'from:', ROOMS_ENDPOINT);
        
        const response = await fetch(ROOMS_ENDPOINT);
        if (!response.ok) {
            throw new Error(`Failed to fetch room data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const rooms = data.rooms || [];
        const room = rooms.find(r => r.id == roomId);
        
        if (!room || !room.images) {
            console.log(`No images found for room ${roomId}`);
            return [];
        }
        
        // Handle mixed image formats
        const normalizedImages = room.images.map((image, index) => {
            // If it's already a proper object
            if (typeof image === 'object' && image.url) {
                return image;
            }
            // If it's a string URL, convert to object
            else if (typeof image === 'string') {
                return {
                    id: Date.now() + index,
                    name: `Image ${index + 1}`,
                    url: image,
                    thumbnailUrl: image,
                    publicId: `legacy_image_${index}`,
                    uploadedAt: new Date().toISOString()
                };
            }
            // Fallback for unexpected formats
            else {
                console.warn('Unexpected image format:', image);
                return null;
            }
        }).filter(img => img !== null);
        
        console.log(`Found ${normalizedImages.length} images for room ${roomId}`);
        return normalizedImages;
    } catch (error) {
        console.error('Error fetching room images from API:', error);
        return [];
    }
}

// Thumbnail selection functions
function saveThumbnailSelection(roomId, imageIndex) {
    try {
        let selectedThumbnails = JSON.parse(localStorage.getItem(THUMBNAILS_STORAGE_KEY) || '{}');
        selectedThumbnails[roomId] = imageIndex;
        localStorage.setItem(THUMBNAILS_STORAGE_KEY, JSON.stringify(selectedThumbnails));
        console.log(`📌 Thumbnail selection saved: Room ${roomId} - Image ${imageIndex}`);
    } catch (error) {
    }
}

function getThumbnailSelection(roomId) {
    try {
        const selectedThumbnails = JSON.parse(localStorage.getItem(THUMBNAILS_STORAGE_KEY) || '{}');
        return selectedThumbnails[roomId] || 0;
    } catch (error) {
        return 0;
    }
}


function createNoDataMessage(type) {
    const message = document.createElement('div');
    message.id = `no${type.charAt(0).toUpperCase() + type.slice(1)}DataMessage`;
    message.className = 'text-center text-gray-500 py-8';
    message.style.display = 'none';
    message.textContent = `No ${type} data available`;
    return message;
}



// =====================================
// INITIALIZATION
// =====================================

function initializeDOMElements() {
    roomTableBody = document.getElementById('roomTableBody');
    addRoomBtn = document.getElementById('addRoomBtn');
    loadingIndicator = document.getElementById('loadingIndicator');
    roomsTable = document.getElementById('roomsTable');
    noDataMessage = document.getElementById('noDataMessage');

    // Add Modal
    addModal = document.getElementById("addModal");
    closeAddModal = document.getElementById("closeAddModal");
    cancelAdd = document.getElementById("cancelAdd");
    addForm = document.getElementById("addRoomForm");
    addImageInput = document.getElementById("addImageInput");
    addFileName = document.getElementById("addFileName");
    addStep1 = document.getElementById("addStep1");
    addStep2 = document.getElementById("addStep2");
    addStep3 = document.getElementById("addStep3");
    addNextBtn = document.getElementById("addNextBtn");
    addPrevBtn = document.getElementById("addPrevBtn");
    addSubmitBtn = document.getElementById("addSubmitBtn");
    addStepIndicators = [
        document.getElementById("addStep1Indicator"),
        document.getElementById("addStep2Indicator"),
        document.getElementById("addStep3Indicator")
    ];
    
    // Edit Modal
    editModal = document.getElementById("editModal");
    closeEditModal = document.getElementById("closeEditModal");
    cancelEdit = document.getElementById("cancelEdit");
    editForm = document.getElementById("editRoomForm");
    editStep1 = document.getElementById("editStep1");
    editStep2 = document.getElementById("editStep2");
    editStep3 = document.getElementById("editStep3");
    editNextBtn = document.getElementById("editNextBtn");
    editPrevBtn = document.getElementById("editPrevBtn");
    editSubmitBtn = document.getElementById("editSubmitBtn");
    editStepIndicators = [
        document.getElementById("step1Indicator"),
        document.getElementById("step2Indicator"),
        document.getElementById("step3Indicator")
    ];
    
    // Image Modal
    imageModal = document.getElementById("imageModal");
    imageModalTitle = document.getElementById("imageModalTitle");
    cancelImage = document.getElementById("cancelImage");
    submitImage = document.getElementById("submitImage");
    roomImageInput = document.getElementById("roomImageInput");
    roomImageFileName = document.getElementById("roomImageFileName");
    addImageBtn = document.getElementById("addImageBtn");
    

    noFeaturesDataMessage = document.getElementById('noFeaturesDataMessage') || createNoDataMessage('features');
    noFacilitiesDataMessage = document.getElementById('noFacilitiesDataMessage') || createNoDataMessage('facilities');
    featuresTableContainer = document.getElementById('featuresTableContainer');
    facilitiesTableContainer = document.getElementById('facilitiesTableContainer');
    
    // Modal elements
    addModal = document.getElementById('addModal');
    editModal = document.getElementById('editModal');
    addForm = document.getElementById('addRoomForm');
    editForm = document.getElementById('editRoomForm');
    addFileName = document.getElementById('addFileName');
    
    console.log('✅ DOM Elements initialized successfully');
}

// =====================================
// UTILITY FUNCTIONS
// =====================================

function formatPrice(price) {
    if (!price) return '$0';
    if (price.toString()) return price;
    return `₹${price.toString().replace(/[^\d.-]/g, '')}`;
}

function getStatusBadge(status) {
    const config = {
        inactive: { class: 'bg-red-100 text-red-800', label: 'Inactive' },
        active: { class: 'bg-green-100 text-green-800', label: 'Active' }
    };

    let key = 'inactive';
    if (typeof status === 'string') key = status.toLowerCase();
    else if (status && typeof status === 'object' && !Array.isArray(status)) {
        const trueStatus = Object.entries(status).find(([_, val]) => val === true);
        key = trueStatus ? trueStatus[0].toLowerCase() : 'inactive';
    }

    const { class: cls, label } = config[key] || config['inactive'];
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}">• ${label}</span>`;
}

function validateImageFile(file) {
    const errors = [];
    if (!file) return errors;
    
    const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 
        'image/gif', 'image/webp', 'image/avif',
        'image/bmp', 'image/tiff', 'image/svg+xml'
    ];
    
    if (!allowedTypes.includes(file.type)) {
        errors.push('Please select a valid image file (JPEG, PNG, GIF, WebP, AVIF, BMP, TIFF, or SVG)');
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB for Cloudinary
    if (file.size > maxSize) {
        errors.push('Image file size must be less than 10MB');
    }
    
    return errors;
}

// =====================================
// UI STATE FUNCTIONS
// =====================================

function showLoading() {
    loadingIndicator?.classList.remove('hidden');
    roomsTable?.classList.add('hidden');
    noDataMessage?.classList.add('hidden');
}

function showNoData() {
    loadingIndicator?.classList.add('hidden');
    roomsTable?.classList.add('hidden');
    noDataMessage?.classList.remove('hidden');
}

function showTable() {
    loadingIndicator?.classList.add('hidden');
    roomsTable?.classList.remove('hidden');
    noDataMessage?.classList.add('hidden');
}

// =====================================
// MODAL STEP NAVIGATION
// =====================================

function updateAddProgress(step) {
    addStepIndicators.forEach((indicator, index) => {
        if (!indicator) return;
        const circle = indicator.querySelector('div');
        if (!circle) return;
        
        if (index < step) {
            // Completed/Active
            circle.className = 'w-8 h-8 bg-[#1D1354] text-white rounded-full flex items-center justify-center text-sm font-medium';
            const span = indicator.querySelector('span');
            if (span) span.className = 'ml-2 text-sm font-medium text-gray-900';
        } else {
            // Inactive
            circle.className = 'w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium';
            const span = indicator.querySelector('span');
            if (span) span.className = 'ml-2 text-sm font-medium text-gray-500';
        }
    });
}

function showAddStep(step) {
    currentAddStep = step;
    addStep1.classList.toggle('hidden', step !== 1);
    addStep2.classList.toggle('hidden', step !== 2);
    addStep3.classList.toggle('hidden', step !== 3);
    
    addPrevBtn.classList.toggle('hidden', step === 1);
    addNextBtn.classList.toggle('hidden', step === 3);
    addSubmitBtn.classList.toggle('hidden', step !== 3);
    
    updateAddProgress(step);
}

function nextAddStep() {
    const formData = collectFormData('add');
    const errors = [];

    if (currentAddStep === 1) {
        // Validate Step 1 fields
        if (!formData.name || formData.name.trim().length === 0) {
            errors.push('Room name is required.');
        }
        if (!formData.area || formData.area.trim().length === 0) {
            errors.push('Area is required.');
        }
        if (!formData.price || formData.price.trim().length === 0) {
            errors.push('Price is required.');
        } else if (isNaN(parseFloat(formData.price.replace(/[^0-9.-]+/g, '')))) {
            errors.push('Price must be a valid number.');
        }
    } else if (currentAddStep === 2) {
        // Validate Step 2 fields
        if (!formData.adult || formData.adult.trim().length === 0) {
            errors.push('Adult capacity is required.');
        } else if (isNaN(parseInt(formData.adult)) || parseInt(formData.adult) < 0) {
            errors.push('Adult capacity must be a valid non-negative number.');
        }
        if (!formData.children || formData.children.trim().length === 0) {
            errors.push('Children capacity is required.');
        } else if (isNaN(parseInt(formData.children)) || parseInt(formData.children) < 0) {
            errors.push('Children capacity must be a valid non-negative number.');
        }
    }

    if (errors.length > 0) {
        showErrorMessage(`Please fix the following errors:\n${errors.join('\n')}`);
        return; // Prevent moving to the next step
    }

    if (currentAddStep < 3) {
        showAddStep(currentAddStep + 1);
    }
}

function prevAddStep() {
    if (currentAddStep > 1) {
        showAddStep(currentAddStep - 1);
    }
}

function updateEditProgress(step) {
    editStepIndicators.forEach((indicator, index) => {
        if (!indicator) return;
        const circle = indicator.querySelector('div');
        if (!circle) return;
        
        if (index < step) {
            // Completed/Active
            circle.className = 'w-8 h-8 bg-[#1D1354] text-white rounded-full flex items-center justify-center text-sm font-medium';
            const span = indicator.querySelector('span');
            if (span) span.className = 'ml-2 text-sm font-medium text-gray-900';
        } else {
            // Inactive
            circle.className = 'w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium';
            const span = indicator.querySelector('span');
            if (span) span.className = 'ml-2 text-sm font-medium text-gray-500';
        }
    });
}

function showEditStep(step) {
    currentEditStep = step;
    editStep1.classList.toggle('hidden', step !== 1);
    editStep2.classList.toggle('hidden', step !== 2);
    editStep3.classList.toggle('hidden', step !== 3);
    
    editPrevBtn.classList.toggle('hidden', step === 1);
    editNextBtn.classList.toggle('hidden', step === 3);
    editSubmitBtn.classList.toggle('hidden', step !== 3);
    
    updateEditProgress(step);
}

function nextEditStep() {
    if (currentEditStep < 3) {
        showEditStep(currentEditStep + 1);
    }
}

function prevEditStep() {
    if (currentEditStep > 1) {
        showEditStep(currentEditStep - 1);
    }
}

// =====================================
// API FUNCTIONS
// =====================================

async function fetchRoomsData() {
    showLoading();

    try {
        const response = await fetch(ROOMS_ENDPOINT);
        let data = response.ok ? await response.json() : await (await fetch(ADMIN_ENDPOINT)).json();

        roomsData = Array.isArray(data)
            ? (data.find(admin => admin.rooms?.length) || {}).rooms || []
            : data.rooms || [];

        filteredData = [...roomsData];
        roomsData.length ? renderTable() : showNoData();
        localStorage.setItem('rooms_backup', JSON.stringify(roomsData));
    } catch (err) {
        console.error('Fetch error:', err);

        try {
            const backup = JSON.parse(localStorage.getItem('rooms_backup') || '[]');
            if (backup.length) {
                roomsData = [...backup];
                filteredData = [...roomsData];
                renderTable();
                showErrorMessage('Using offline data. Changes may not save.');
                return;
            }
        } catch {}

        showErrorMessage('Failed to load rooms. Please try again.');
        showNoData();
    }
}

async function addNewRoom(formData, imageUrls = []) {
    try {
        const newRoom = {
            categoryType: formData.name,
            area: formData.area,
            adultMax: parseInt(formData.adult) || 0,
            childrenMax: parseInt(formData.children) || 0,
            price: formData.price.startsWith('$') ? formData.price : `$${formData.price}`,
            quantity: 1,
            status: 'active',
            features: formData.features,
            facilities: formData.facilities,
            description: formData.description,
            images: imageUrls
        };

        const currentResponse = await fetch(ROOMS_ENDPOINT);
        if (currentResponse.ok) {
            const currentData = await currentResponse.json();
            const currentRooms = currentData.rooms || [];
            const newId = currentRooms.length > 0 ? Math.max(...currentRooms.map(r => r.id || 0)) + 1 : 1;
            newRoom.id = newId;
            
            const updatedRooms = [...currentRooms, newRoom];
            
            const putResponse = await fetch(ROOMS_ENDPOINT, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    id: '5',
                    rooms: updatedRooms
                })
            });

            if (putResponse.ok) {
                console.log('✅ Successfully added room with images to MockAPI');
                await fetchRoomsData();
                return newRoom;
            }
        }
        
        // Fallback: local only
        newRoom.id = Date.now(); // Temporary ID
        roomsData.push(newRoom);
        filteredData = [...roomsData];
        localStorage.setItem('rooms_backup', JSON.stringify(roomsData));
        renderTable();
        showErrorMessage('Room added locally. Server sync failed.');
        return newRoom;
        
    } catch (error) {
        console.error('❌ Error adding room:', error);
        throw error;
    }
}

async function updateRoom(roomId, formData) {
    try {
        console.log('Attempting to update room:', roomId, formData);
        
        const currentResponse = await fetch(ROOMS_ENDPOINT);
        if (!currentResponse.ok) {
            throw new Error(`Failed to fetch current data: ${currentResponse.status}`);
        }
        
        const currentData = await currentResponse.json();
        const currentRooms = currentData.rooms || [];
        const existingRoom = currentRooms.find(r => r.id == roomId);
        
        if (!existingRoom) {
            throw new Error(`Room with ID ${roomId} not found`);
        }

        // FIXED: Get selected features and facilities with error handling
        let selectedFeatures, selectedFacilities;
        

        const updatedRoom = {
            id: parseInt(roomId),
            categoryType: formData.name,
            area: formData.area,
            adultMax: parseInt(formData.adult) || 0,
            childrenMax: parseInt(formData.children) || 0,
            roomno : formData.roomno,
            price: formData.price.startsWith('$') ? formData.price : `$${formData.price}`,
            status: formData.status,
            selectedFeatures: formData.selectedFeatures,  
            selectedFacilities: formData.selectedFacilities,  
            description: formData.description,
            images: existingRoom.images || [], // Preserve existing images
            // Keep legacy format for compatibility
            features: (selectedFeatures || []).reduce((acc, feature) => {
                if (feature && feature.name) {
                    acc[feature.name.toLowerCase().replace(/\s+/g, '')] = true;
                }
                return acc;
            }, {}),
            facilities: (selectedFacilities || []).reduce((acc, facility) => {
                if (facility && facility.name) {
                    acc[facility.name.toLowerCase().replace(/\s+/g, '')] = true;
                }
                return acc;
            }, {})
        };

        console.log('Updated room object:', updatedRoom);

        const updatedRooms = currentRooms.map(room => room.id == roomId ? updatedRoom : room);
        
        const putResponse = await fetch(ROOMS_ENDPOINT, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                id: '5',
                rooms: updatedRooms
            })
        });

        if (!putResponse.ok) {
            const errorText = await putResponse.text();
            throw new Error(`PUT failed: ${putResponse.status} - ${errorText}`);
        }

        console.log('✅ Room updated in API successfully');

        // Update local data
        const roomIndex = roomsData.findIndex(r => r.id == roomId);
        if (roomIndex !== -1) {
            roomsData[roomIndex] = updatedRoom;
            filteredData = [...roomsData];
        }
        
        localStorage.setItem('rooms_backup', JSON.stringify(roomsData));
        await fetchRoomsData();
        showSuccessMessage(`${updatedRoom.categoryType} updated successfully!`);
        
        return updatedRoom;
        
    } catch (error) {
        console.error('Error updating room:', error);
        
        try {
            console.log('Attempting local fallback update...');
            
            // FIXED: Use fallback for selections as well
            let selectedFeatures, selectedFacilities;
            
            try {
                selectedFeatures = getSelectedEditFeatures() || [];
                selectedFacilities = getSelectedEditFacilities() || [];
            } catch (selectionError) {
                console.error('Error getting selections for fallback, using formData:', selectionError);
                selectedFeatures = formData.selectedFeatures || [];
                selectedFacilities = formData.selectedFacilities || [];
            }
            
            const fallbackRoom = {
                id: parseInt(roomId),
                categoryType: formData.name,
                area: formData.area,
                adultMax: parseInt(formData.adult) || 0,
                childrenMax: parseInt(formData.children) || 0,
                price: formData.price.startsWith('$') ? formData.price : `$${formData.price}`,
                status: formData.status,
                selectedFeatures: selectedFeatures,
                selectedFacilities: selectedFacilities,
                description: formData.description,
                images: roomsData.find(r => r.id == roomId)?.images || [],
                features: (selectedFeatures || []).reduce((acc, feature) => {
                    if (feature && feature.name) {
                        acc[feature.name.toLowerCase().replace(/\s+/g, '')] = true;
                    }
                    return acc;
                }, {}),
                facilities: (selectedFacilities || []).reduce((acc, facility) => {
                    if (facility && facility.name) {
                        acc[facility.name.toLowerCase().replace(/\s+/g, '')] = true;
                    }
                    return acc;
                }, {})
            };

            const roomIndex = roomsData.findIndex(r => r.id == roomId);
            if (roomIndex !== -1) {
                roomsData[roomIndex] = fallbackRoom;
                filteredData = [...roomsData];
            }
            
            localStorage.setItem('rooms_backup', JSON.stringify(roomsData));
            
            // Re-render table if function exists
            if (typeof renderTable === 'function') {
                renderTable();
            }
            
            showSuccessMessage(`${fallbackRoom.categoryType} updated locally! Server sync failed.`);
            
            return fallbackRoom;
        } catch (fallbackError) {
            console.error('Even local storage fallback failed:', fallbackError);
            showErrorMessage('Failed to update room. Please try again.');
            throw error;
        }
    }
}


let roomToDelete = null; // Store the room ID to delete

function deleteRoom(roomId) {
    roomToDelete = roomId; // Store the room ID for deletion
    const confirmModal = document.getElementById('confirmDeleteModal');
    if (confirmModal) {
        confirmModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeConfirmDeleteModal() {
    const confirmModal = document.getElementById('confirmDeleteModal');
    if (confirmModal) {
        confirmModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    roomToDelete = null; // Reset the room ID
}

// Handle the actual deletion when the user confirms
async function confirmDeleteRoom() {
    if (!roomToDelete) return;

    try {
        await deleteRoomFromAPI(roomToDelete); // Call the existing delete logic
        showSuccessMessage('Room deleted successfully!');
    } catch (error) {
        showErrorMessage('Failed to delete the room. Please try again.');
    } finally {
        closeConfirmDeleteModal();
    }
}

// Helper function to delete the room from the API
async function deleteRoomFromAPI(roomId) {
    const room = roomsData.find(r => r.id == roomId);
    if (!room) {
        console.error(`Room with ID ${roomId} not found.`);
        return;
    }

    try {
        // Fetch the current data from the Mock API
        const currentResponse = await fetch(ROOMS_ENDPOINT);
        if (!currentResponse.ok) {
            throw new Error(`Failed to fetch current data: ${currentResponse.status}`);
        }

        const currentData = await currentResponse.json();
        const currentRooms = currentData.rooms || [];

        // Filter out the room to delete
        const updatedRooms = currentRooms.filter(r => r.id != roomId);

        // Send the updated data back to the Mock API
        const putResponse = await fetch(ROOMS_ENDPOINT, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                id: '5', // Ensure this matches your Mock API structure
                rooms: updatedRooms,
            }),
        });

        if (!putResponse.ok) {
            throw new Error(`Failed to update Mock API: ${putResponse.status}`);
        }

        // Update local data
        roomsData = roomsData.filter(r => r.id != roomId);
        filteredData = [...roomsData];
        localStorage.setItem('rooms_backup', JSON.stringify(roomsData));
        renderTable();

        console.log(`✅ Room with ID ${roomId} deleted successfully.`);
    } catch (error) {
        console.error('Error deleting room from Mock API:', error);
        throw error;
    }
}




// Debug version of populateEditFeatures
function populateEditFeatures(featuresData) {
    const editFeaturesContainer = document.getElementById('editFeatures');
    
    console.log('editFeaturesContainer:', editFeaturesContainer);
    console.log('featuresData:', featuresData);
    
    if (!editFeaturesContainer) {
        console.error('editFeatures container not found!');
        return;
    }
    
    if (!featuresData || featuresData.length === 0) {
        console.warn('No features data provided');
        return;
    }
    
    editFeaturesContainer.innerHTML = '';
    
    featuresData.forEach(feature => {
        const checkboxId = `editFeature${feature.id}`;
        const featureHTML = `
            <label class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" id="${checkboxId}" class="rounded border-gray-300 text-[#1D1354] focus:ring-[#1D1354]" data-feature-id="${feature.id}" />
                <span class="ml-3 text-sm font-medium text-gray-700">${feature.name}</span>
            </label>
        `;
        editFeaturesContainer.insertAdjacentHTML('beforeend', featureHTML);
    });
    
    console.log('Features populated. Container innerHTML:', editFeaturesContainer.innerHTML);
}


// Function to populate facilities checkboxes
function populateEditFacilities(facilitiesData) {
    const editFacilitiesContainer = document.getElementById('editFacilities');
    editFacilitiesContainer.innerHTML = '';
    
    facilitiesData.forEach(facility => {
        const checkboxId = `addFacility${facility.id}`;
        const facilityHTML = `
            <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" id="${checkboxId}" class="rounded border-gray-300 text-[#1D1354] focus:ring-[#1D1354]" data-facility-id="${facility.id}" />
                <span class="ml-3 text-sm font-medium text-gray-700">${facility.name}</span>
            </label>
        `;
        editFacilitiesContainer.insertAdjacentHTML('beforeend', facilityHTML);
    });
}

// Updated fetch function without undefined function calls
async function fetchFeaturesFacilitiesData() {
    try {
        if (loadingIndicator) {
            loadingIndicator.style.display = "flex";
        }
        
        let featuresData, facilitiesData;
        
        // Check if endpoints are defined
        if (typeof FEATURE_ENDPOINT === 'undefined' || typeof FACILITY_ENDPOINT === 'undefined') {
            console.warn('API endpoints not defined, using mock data');
            // Use mock data for testing
            featuresData = mockFeaturesData;
            facilitiesData = mockFacilitiesData;
        } else {
            try {
                // Fetch from actual endpoints
                const [featuresResponse, facilitiesResponse] = await Promise.all([
                    fetch(FEATURE_ENDPOINT),
                    fetch(FACILITY_ENDPOINT)
                ]);
                
                featuresData = await featuresResponse.json();
                facilitiesData = await facilitiesResponse.json();
            } catch (apiError) {
                console.warn('API fetch failed, using mock data:', apiError);
                featuresData = mockFeaturesData;
                facilitiesData = mockFacilitiesData;
            }
        }
        
        // Extract the arrays from the response
        featuresFilteredData = featuresData.features || [];
        facilitiesFilteredData = facilitiesData.facilities || [];
        
        console.log("Fetched features data:", featuresFilteredData);
        console.log("Fetched facilities data:", facilitiesFilteredData);

        // Populate BOTH add and edit form checkboxes
        populateAddFeatures(featuresFilteredData);
        populateAddFacilities(facilitiesFilteredData);
        populateEditFeatures(featuresFilteredData);
        populateEditFacilities(facilitiesFilteredData);

        // Handle features display - REMOVED undefined function calls
        if (featuresFilteredData.length === 0) {
            if (noFeaturesDataMessage) {
                noFeaturesDataMessage.style.display = "block";
            }
            if (featuresTableContainer) {
                featuresTableContainer.style.display = "none";
            }
        } else {
            if (noFeaturesDataMessage) {
                noFeaturesDataMessage.style.display = "none";
            }
           
        }

        // Handle facilities display - REMOVED undefined function calls
        if (facilitiesFilteredData.length === 0) {
            if (noFacilitiesDataMessage) {
                noFacilitiesDataMessage.style.display = "block";
            }
            if (facilitiesTableContainer) {
                facilitiesTableContainer.style.display = "none";
            }
        } else {
            if (noFacilitiesDataMessage) {
                noFacilitiesDataMessage.style.display = "none";
            }
          
        }
        
        console.log('✅ Features and facilities data loaded successfully');
        console.log(`Features loaded: ${featuresFilteredData.length}`);
        console.log(`Facilities loaded: ${facilitiesFilteredData.length}`);
        
    } catch (error) {
        console.error("Error fetching features or facilities data:", error);
        
        // Use mock data as fallback
        console.log('Using mock data as fallback...');
        featuresFilteredData = mockFeaturesData.features;
        facilitiesFilteredData = mockFacilitiesData.facilities;
        
        populateAddFeatures(featuresFilteredData);
        populateAddFacilities(facilitiesFilteredData);
        populateEditFeatures(featuresFilteredData);
        populateEditFacilities(facilitiesFilteredData);
        
        console.log('✅ Mock data loaded successfully');
        
    } finally {
        if (loadingIndicator) {
            loadingIndicator.style.display = "none";
        }
    }
}

// FIXED: Helper functions to get selected features and facilities for ADD modal
function getSelectedAddFeatures() {
    const selectedFeatures = [];
    const featureCheckboxes = document.querySelectorAll('#addFeatures input[type="checkbox"]:checked');
    
    console.log('Found checked feature checkboxes:', featureCheckboxes.length);
    
    featureCheckboxes.forEach(checkbox => {
        const featureId = parseInt(checkbox.dataset.featureId);
        const feature = featuresFilteredData.find(f => f.id === featureId);
        if (feature) {
            selectedFeatures.push(feature);
            console.log('Added feature:', feature);
        }
    });
    
    console.log('getSelectedAddFeatures returning:', selectedFeatures);
    return selectedFeatures;
}

function getSelectedAddFacilities() {
    const selectedFacilities = [];
    const facilityCheckboxes = document.querySelectorAll('#addFacilities input[type="checkbox"]:checked');
    
    console.log('Found checked facility checkboxes:', facilityCheckboxes.length);
    
    facilityCheckboxes.forEach(checkbox => {
        const facilityId = parseInt(checkbox.dataset.facilityId);
        const facility = facilitiesFilteredData.find(f => f.id === facilityId);
        if (facility) {
            selectedFacilities.push(facility);
            console.log('Added facility:', facility);
        }
    });
    
    console.log('getSelectedAddFacilities returning:', selectedFacilities);
    return selectedFacilities;
}

// Helper functions to get selected features and facilities
function getSelectedFeatures() {
    const selectedFeatures = [];
    const featureCheckboxes = document.querySelectorAll('#editFeatures input[type="checkbox"]:checked');
    
    featureCheckboxes.forEach(checkbox => {
        const featureId = parseInt(checkbox.dataset.featureId);
        const feature = featuresFilteredData.find(f => f.id === featureId);
        if (feature) {
            selectedFeatures.push(feature);
        }
    });
    
    return selectedFeatures;
}

function getSelectedFacilities() {
    const selectedFacilities = [];
    const facilityCheckboxes = document.querySelectorAll('#editFacilities input[type="checkbox"]:checked');
    
    facilityCheckboxes.forEach(checkbox => {
        const facilityId = parseInt(checkbox.dataset.facilityId);
        const facility = facilitiesFilteredData.find(f => f.id === facilityId);
        if (facility) {
            selectedFacilities.push(facility);
        }
    });
    
    return selectedFacilities;
}

// Function to set selected features and facilities when editing
function setSelectedFeatures(selectedFeatureIds) {
    if (!Array.isArray(selectedFeatureIds)) {
        selectedFeatureIds = [selectedFeatureIds];
    }
    
    selectedFeatureIds.forEach(featureId => {
        const checkbox = document.querySelector(`#editFeatures input[data-feature-id="${featureId}"]`);
        if (checkbox) {
            checkbox.checked = true;
            console.log(`✅ Feature ${featureId} selected`);
        } else {
            console.warn(`❌ Feature checkbox not found for ID: ${featureId}`);
        }
    });
}

function setSelectedFacilities(selectedFacilityIds) {
    if (!Array.isArray(selectedFacilityIds)) {
        selectedFacilityIds = [selectedFacilityIds];
    }
    
    selectedFacilityIds.forEach(facilityId => {
        const checkbox = document.querySelector(`#editFacilities input[data-facility-id="${facilityId}"]`);
        if (checkbox) {
            checkbox.checked = true;
            console.log(`✅ Facility ${facilityId} selected`);
        } else {
            console.warn(`❌ Facility checkbox not found for ID: ${facilityId}`);
        }
    });
}

// Function to clear all selections
function clearFeaturesFacilitiesSelection() {
    const allCheckboxes = document.querySelectorAll('#editFeatures input[type="checkbox"], #editFacilities input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}



// =====================================
// IMAGE FUNCTIONS WITH CLOUDINARY
// =====================================

async function addRoomImage(roomId, file) {
    try {
        const submitBtn = document.querySelector('#addImageBtn');
        if (submitBtn) {
            submitBtn.textContent = 'Uploading...';
            submitBtn.disabled = true;
        }
        
        // Upload to Cloudinary first
        console.log('🌤️ Uploading to Cloudinary...');
        const uploadResult = await uploadToCloudinary(file);
        
        const imageData = {
            
            id: Date.now(),
            name: file.name,
            url: uploadResult.url,
            thumbnailUrl: uploadResult.thumbnailUrl || uploadResult.url,
            publicId: uploadResult.publicId,
            uploadedAt: new Date().toISOString()
        };
        
        // Upload ONLY to MockAPI
        await updateRoomImages(roomId, imageData);
        console.log('✅ Image successfully added to MockAPI');
        
        // Update UI with fresh data from API
        if (currentImageRoomId === roomId) {
            const updatedImages = await getRoomImagesFromAPI(roomId);
            renderImagesTable(updatedImages);
        }
        
        // Refresh main table
        await renderTable();
        
        // Close modal and show success - use correct function name
        closeImageModalFn(); // Changed from closeImageModal to closeImageModalFn
        showSuccessMessage(`Image "${file.name}" uploaded successfully!`);
        
        return imageData;
        
    } catch (error) {
        console.error('❌ Error uploading image:', error);
        showErrorMessage(`Failed to upload image: ${error.message}`);
        throw error;
    } finally {
        const submitBtn = document.querySelector('#addImageBtn');
        if (submitBtn) {
            submitBtn.textContent = 'ADD';
            submitBtn.disabled = false;
        }
    }
}



async function updateRoomImages(roomId, newImageData) {
    try {
        console.log(`🔄 Updating room ${roomId} with image in MockAPI...`);
        
        const currentResponse = await fetch(ROOMS_ENDPOINT);
        if (!currentResponse.ok) {
            throw new Error(`Failed to fetch current room data: ${currentResponse.status}`);
        }
        
        const currentData = await currentResponse.json();
        const currentRooms = currentData.rooms || [];
        
        // Find room and add image
        let roomFound = false;
        const updatedRooms = currentRooms.map(room => {
            if (room.id == roomId) {
                roomFound = true;
                if (!room.images) room.images = [];
                room.images.push(newImageData);
                console.log(`📷 Added image to room ${roomId}. Total: ${room.images.length}`);
            }
            return room;
        });
        
        if (!roomFound) {
            throw new Error(`Room with ID ${roomId} not found`);
        }
        
        // Update MockAPI
        const putResponse = await fetch(ROOMS_ENDPOINT, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                id: 5, // Remove quotes for number
                rooms: updatedRooms
            })
        });
        
        if (!putResponse.ok) {
            const errorText = await putResponse.text();
            throw new Error(`MockAPI update failed: ${putResponse.status} - ${errorText}`);
        }
        
        console.log('✅ MockAPI updated successfully');
        
        // Update local cache ONLY (no localStorage)
        await fetchRoomsData();
        
    } catch (error) {
        console.error('❌ MockAPI update failed:', error);
        throw error;
    }
}


// FIXED: Add the missing uploadImage function
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


async function addRoomWithImage(formData, imageFile) {
    try {
        console.log('🔄 Attempting to add room with data:', formData);
        
        const currentResponse = await fetch(ROOMS_ENDPOINT);
        if (!currentResponse.ok) {
            throw new Error(`Failed to fetch current data: ${currentResponse.status}`);
        }
        
        const currentData = await currentResponse.json();
        const currentRooms = currentData.rooms || [];
        
        // Generate new room ID
        const newId = currentRooms.length > 0 ? Math.max(...currentRooms.map(r => r.id)) + 1 : 1;
        
        // Get selected features and facilities with fallback
        let selectedFeatures, selectedFacilities;
        
        try {
            selectedFeatures = getSelectedAddFeatures() || [];
            selectedFacilities = getSelectedAddFacilities() || [];
        } catch (error) {
            console.error('Error getting selections, using formData fallback:', error);
            selectedFeatures = formData.selectedFeatures || [];
            selectedFacilities = formData.selectedFacilities || [];
        }
        
        console.log('Selected features:', selectedFeatures);
        console.log('Selected facilities:', selectedFacilities);
        
        const newRoom = {
            id: newId,
            categoryType: formData.name,
            roomno: formData.roomno,
            area: formData.area,
            adultMax: parseInt(formData.adult) || 0,
            childrenMax: parseInt(formData.children) || 0,
            price: formData.price.startsWith('₹') || formData.price.startsWith('$') ? formData.price : `₹${formData.price}`,
            status: formData.status || 'active',
            selectedFeatures: selectedFeatures,
            selectedFacilities: selectedFacilities,
            description: formData.description,
            images: [],
            // Keep legacy format for compatibility
            features: selectedFeatures.reduce((acc, feature) => {
                acc[feature.name.toLowerCase().replace(/\s+/g, '')] = true;
                return acc;
            }, {}),
            facilities: selectedFacilities.reduce((acc, facility) => {
                acc[facility.name.toLowerCase().replace(/\s+/g, '')] = true;
                return acc;
            }, {})
        };
        
        // Handle image upload if provided
        if (imageFile) {
            try {
                console.log('🌤️ Uploading image to Cloudinary...');
                const uploadResult = await uploadToCloudinary(imageFile);
                
                const imageData = {
                    id: Date.now(),
                    name: imageFile.name,
                    url: uploadResult.url,
                    thumbnailUrl: uploadResult.thumbnailUrl || uploadResult.url,
                    publicId: uploadResult.publicId,
                    uploadedAt: new Date().toISOString()
                };
                
                // Add image to room
                newRoom.images = [imageData];
                
                // Set as thumbnail URL (first and only image, so index 0)
                newRoom.thumbnailUrl = imageData.thumbnailUrl;
                newRoom.thumbnailIndex = 0;
                
                console.log('✅ Image uploaded and set as thumbnail:', imageData.thumbnailUrl);
            } catch (imageError) {
                console.error('❌ Image upload failed:', imageError);
                // Continue without image but show warning
                showErrorMessage('Room will be created but image upload failed: ' + imageError.message);
            }
        }
        
        console.log('📋 New room object:', newRoom);
        
        // Add room to MockAPI
        const updatedRooms = [...currentRooms, newRoom];
        
        const putResponse = await fetch(ROOMS_ENDPOINT, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                id: 5, // Remove quotes - should be number
                rooms: updatedRooms
            })
        });
        
        if (!putResponse.ok) {
            const errorText = await putResponse.text();
            throw new Error(`MockAPI PUT failed: ${putResponse.status} - ${errorText}`);
        }
        
        console.log('✅ Room added to MockAPI successfully');
        
        // Update local cache
        await fetchRoomsData();
        
        // Remove localStorage backup - use only MockAPI
        // localStorage.removeItem('rooms_backup');
        
        showSuccessMessage(`${newRoom.categoryType} added successfully!`);
        
        return newRoom;
        
    } catch (error) {
        console.error('❌ Error adding room:', error);
        showErrorMessage(`Failed to add room: ${error.message}`);
        throw error;
    }
}




async function deleteRoomImage(imageIndex) {
    if (!currentImageRoomId) return;
    
    try {
        // Get current images from API
        const images = await getRoomImagesFromAPI(currentImageRoomId);
        if (!images[imageIndex]) return;
        
        const imageName = images[imageIndex].name;
        if (!confirm(`Delete image "${imageName}"?`)) return;
        
        // Remove from MockAPI only
        await removeImageFromAPI(currentImageRoomId, imageIndex);
        
        // Refresh UI
        const updatedImages = await getRoomImagesFromAPI(currentImageRoomId);
        renderImagesTable(updatedImages);
        await renderTable();
        
        showSuccessMessage(`Image "${imageName}" deleted successfully!`);
    } catch (error) {
        console.error('❌ Error deleting image:', error);
        showErrorMessage('Failed to delete image');
    }
}

async function removeImageFromAPI(roomId, imageIndex) {
    try {
        console.log(`🗑️ Removing image ${imageIndex} from room ${roomId}...`);
        
        const currentResponse = await fetch(ROOMS_ENDPOINT);
        if (!currentResponse.ok) throw new Error('Failed to fetch current data');
        
        const currentData = await currentResponse.json();
        const currentRooms = currentData.rooms || [];
        
        const updatedRooms = currentRooms.map(room => {
            if (room.id == roomId && room.images) {
                room.images.splice(imageIndex, 1);
                console.log(`📷 Removed image. Remaining: ${room.images.length}`);
            }
            return room;
        });
        
        const putResponse = await fetch(ROOMS_ENDPOINT, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: 5,
                rooms: updatedRooms
            })
        });
        
        if (!putResponse.ok) throw new Error(`Failed to remove image: ${putResponse.status}`);
        
        console.log('✅ Image removed from MockAPI');
        
        // Update local cache
        await fetchRoomsData();
        return true;
    } catch (error) {
        console.error('❌ Failed to remove image from API:', error);
        throw error;
    }
}


async function removeAllImagesFromMockAPI(roomId) {
    try {
        const currentResponse = await fetch(ROOMS_ENDPOINT);
        if (!currentResponse.ok) {
            throw new Error('Failed to fetch current room data');
        }
        
        const currentData = await currentResponse.json();
        const currentRooms = currentData.rooms || [];
        
        // Find the room and clear images
        const updatedRooms = currentRooms.map(room => {
            if (room.id == roomId) {
                room.images = [];
                console.log(`🗑️ Cleared all images from room ${roomId}`);
            }
            return room;
        });
        
        // Update MockAPI
        const putResponse = await fetch(ROOMS_ENDPOINT, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                id: '5',
                rooms: updatedRooms
            })
        });
        
        if (!putResponse.ok) {
            throw new Error('Failed to clear images from MockAPI');
        }
        
        console.log('✅ All images removed from MockAPI successfully');
        
        // Update local roomsData
        const roomIndex = roomsData.findIndex(r => r.id == roomId);
        if (roomIndex !== -1) {
            roomsData[roomIndex].images = [];
            filteredData = [...roomsData];
        }
        
    } catch (error) {
        console.error('❌ Failed to clear images from MockAPI:', error);
        throw error;
    }
}

// =====================================
// UI RENDERING FUNCTIONS
// =====================================
async function renderTable() {
    if (!roomTableBody) return;
    
    showTable();
    
    if (filteredData.length === 0) {
        roomTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="px-6 py-8 text-center text-gray-500">
                    No rooms found.
                </td>
            </tr>
        `;
        return;
    }
    
    // Use cached roomsData for image counts to avoid multiple API calls
    roomTableBody.innerHTML = filteredData.map((room, index) => {
        // Get image count from cached roomsData instead of API call
        const roomData = roomsData.find(r => r.id === room.id);
        const imageCount = (roomData?.images || []).length;
        
        return `
            <tr class="hover:bg-gray-50" data-room-id="${room.id}">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${index + 1}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${room.roomno || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${room.categoryType || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${room.area || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${room.adultMax || 0}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${room.childrenMax || 0}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatPrice(room.price)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${getStatusBadge(room.status)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${getActionButtons(room, imageCount)}
                </td>
            </tr>
        `;
    }).join('');
    
    // Call attachButtonListeners after rendering
    attachButtonListeners();
}


function getActionButtons(room, imageCount) {
    return `
        <div class="flex items-center gap-2">
            <button class="edit-btn text-blue-600 hover:text-blue-900 p-1 rounded transition-colors" 
                    title="Edit Room" data-room-id="${room.id}">
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            </button>
            <button class="image-btn text-green-600 hover:text-green-900 p-1 rounded transition-colors relative" 
                    title="View Images (${imageCount} images)" data-room-id="${room.id}">
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                ${imageCount > 0 ? `<span class="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">${imageCount}</span>` : ''}
            </button>
            <button class="delete-btn text-red-600 hover:text-red-900 p-1 rounded transition-colors" 
                    title="Delete Room" data-room-id="${room.id}">
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    `;
}

function renderImagesTable(images) {
    const imagesTableBody = document.getElementById('imagesTableBody');
    if (!imagesTableBody) return;
    
    // Ensure images is an array
    if (!Array.isArray(images)) {
        console.error('renderImagesTable: images parameter is not an array:', images);
        images = [];
    }
    
    if (images.length === 0) {
        imagesTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="px-6 py-8 text-center text-gray-500">
                    No images uploaded for this room.
                    <br><span class="text-xs text-gray-400">Images are stored in Cloudinary CDN</span>
                </td>
            </tr>
        `;
        return;
    }
    
    // Get current thumbnail selection from API
    const selectedThumbnailIndex = getThumbnailSelection(currentImageRoomId);
    
    imagesTableBody.innerHTML = images.map((imageData, index) => {
        // Handle both object and string formats
        const imageUrl = imageData.url || imageData;
        const thumbnailUrl = imageData.thumbnailUrl || imageData.url || imageData;
        const imageName = imageData.name || `Image ${index + 1}`;
        
        return `
            <tr data-image-index="${index}">
                <td class="px-6 py-4">
                    <div class="w-32 h-20 bg-gray-200 rounded border flex items-center justify-center overflow-hidden ${index === selectedThumbnailIndex ? 'ring-2 ring-blue-500' : ''}">
                        <img src="${thumbnailUrl}" 
                             alt="${imageName}" 
                             class="w-full h-full object-cover"
                             loading="lazy"
                             onerror="this.style.display='none'; this.parentNode.innerHTML='<span class=\'text-xs text-red-500\'>Image not found</span>';">
                        ${index === selectedThumbnailIndex ? '<div class="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded">THUMB</div>' : ''}
                    </div>
                </td>
                <td class="px-6 py-4 text-center">
                    <input type="checkbox" 
                           class="w-5 h-5 text-[#1D1354] bg-gray-100 border-gray-300 rounded focus:ring-[#1D1354] thumbnail-checkbox" 
                           data-image-index="${index}" 
                           ${index === selectedThumbnailIndex ? 'checked' : ''} />
                    <br><span class="text-xs text-gray-500">Thumbnail</span>
                </td>
                <td class="px-6 py-4 text-center">
                    <button class="delete-image-btn text-red-600 hover:text-red-900 p-1 rounded transition-colors" 
                            title="Delete Image: ${imageName}" data-image-index="${index}">
                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    attachImageDeleteListeners();
    attachThumbnailListeners();
}

// =====================================
// FORM FUNCTIONS
// =====================================

// FIXED: Enhanced collectFormData with better error handling
function collectFormData(type = 'add') {
    const prefix = type === 'add' ? 'add' : 'edit';
    
    console.log(`Collecting ${type} form data...`);
    
    const formData = {
        name: document.getElementById(`${prefix}Name`)?.value?.trim() || '',
        area: document.getElementById(`${prefix}Area`)?.value?.trim() || '',
        price: document.getElementById(`${prefix}Price`)?.value?.trim() || '',
        adult: document.getElementById(`${prefix}Adult`)?.value?.trim() || '2',
        roomno : document.getElementById(`${prefix}RoomNo`)?.value?.trim() || '',
        children: document.getElementById(`${prefix}Children`)?.value?.trim() || '1',
        description: document.getElementById(`${prefix}Description`)?.value?.trim() || '',
    };
    

    // FIXED: Get selected features and facilities with error handling
    try {
        if (type === 'add') {
            formData.selectedFeatures = getSelectedAddFeatures() || [];
            formData.selectedFacilities = getSelectedAddFacilities() || [];
            formData.status = 'active'; // Default status for new rooms
        } else {
            formData.selectedFeatures = getSelectedEditFeatures() || [];
            formData.selectedFacilities = getSelectedEditFacilities() || [];
            formData.status = document.querySelector(`input[name="${prefix}Status"]:checked`)?.value || 'inactive';
        }
    } catch (error) {
        console.error(`Error getting selected ${type} features/facilities:`, error);
        formData.selectedFeatures = [];
        formData.selectedFacilities = [];
    }
    
    console.log(`Collected ${type} form data:`, formData);
    console.log(`${type} - Selected features:`, formData.selectedFeatures);
    console.log(`${type} - Selected facilities:`, formData.selectedFacilities);
    
    return formData;
}


// =====================================
// MODAL FUNCTIONS
// =====================================

// Function to populate ADD features checkboxes
function populateAddFeatures(featuresData) {
    const addFeaturesContainer = document.getElementById('addFeatures');
    addFeaturesContainer.innerHTML = '';
    
    featuresData.forEach(feature => {
        const checkboxId = `addFeature${feature.id}`;
        const featureHTML = `
            <label class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" id="${checkboxId}" class="rounded border-gray-300 text-[#1D1354] focus:ring-[#1D1354]" data-feature-id="${feature.id}" />
                <span class="ml-3 text-sm font-medium text-gray-700">${feature.name}</span>
            </label>
        `;
        addFeaturesContainer.insertAdjacentHTML('beforeend', featureHTML);
    });
}

// Function to populate ADD facilities checkboxes
function populateAddFacilities(facilitiesData) {
    const addFacilitiesContainer = document.getElementById('addFacilities');
    addFacilitiesContainer.innerHTML = '';
    
    facilitiesData.forEach(facility => {
        const checkboxId = `addFacility${facility.id}`;
        const facilityHTML = `
            <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" id="${checkboxId}" class="rounded border-gray-300 text-[#1D1354] focus:ring-[#1D1354]" data-facility-id="${facility.id}" />
                <span class="ml-3 text-sm font-medium text-gray-700">${facility.name}</span>
            </label>
        `;
        addFacilitiesContainer.insertAdjacentHTML('beforeend', facilityHTML);
    });
}

// Function to populate EDIT features checkboxes (CORRECTED ID PREFIX)
function populateEditFeatures(featuresData) {
    const editFeaturesContainer = document.getElementById('editFeatures');
    editFeaturesContainer.innerHTML = '';
    
    featuresData.forEach(feature => {
        const checkboxId = `editFeature${feature.id}`;  // FIXED: Changed from addFeature to editFeature
        const featureHTML = `
            <label class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" id="${checkboxId}" class="rounded border-gray-300 text-[#1D1354] focus:ring-[#1D1354]" data-feature-id="${feature.id}" />
                <span class="ml-3 text-sm font-medium text-gray-700">${feature.name}</span>
            </label>
        `;
        editFeaturesContainer.insertAdjacentHTML('beforeend', featureHTML);
    });
}

// Function to populate EDIT facilities checkboxes (CORRECTED ID PREFIX)
function populateEditFacilities(facilitiesData) {
    const editFacilitiesContainer = document.getElementById('editFacilities');
    editFacilitiesContainer.innerHTML = '';
    
    facilitiesData.forEach(facility => {
        const checkboxId = `editFacility${facility.id}`;  // FIXED: Changed from addFacility to editFacility
        const facilityHTML = `
            <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" id="${checkboxId}" class="rounded border-gray-300 text-[#1D1354] focus:ring-[#1D1354]" data-facility-id="${facility.id}" />
                <span class="ml-3 text-sm font-medium text-gray-700">${facility.name}</span>
            </label>
        `;
        editFacilitiesContainer.insertAdjacentHTML('beforeend', facilityHTML);
    });
}

// Updated fetch function to populate both add and edit forms
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

        // Populate BOTH add and edit form checkboxes
        populateAddFeatures(featuresFilteredData);
        populateAddFacilities(facilitiesFilteredData);
        populateEditFeatures(featuresFilteredData);
        populateEditFacilities(facilitiesFilteredData);

        // Handle features display
        if (featuresFilteredData.length === 0) {
            noFeaturesDataMessage.style.display = "block";
            featuresTableContainer.style.display = "none";
        } else {
            noFeaturesDataMessage.style.display = "none";
        }

        // Handle facilities display
        if (facilitiesFilteredData.length === 0) {
            noFacilitiesDataMessage.style.display = "block";
            facilitiesTableContainer.style.display = "none";
        } else {
            noFacilitiesDataMessage.style.display = "none";
        }
    } catch (error) {
        console.error("Error fetching features or facilities data:", error);
        noFeaturesDataMessage.style.display = "block";
        noFacilitiesDataMessage.style.display = "block";
    } finally {
        loadingIndicator.style.display = "none";
    }
}

// Helper functions to get selected features and facilities for ADD modal
function getSelectedAddFeatures() {
    const selectedFeatures = [];
    const featureCheckboxes = document.querySelectorAll('#addFeatures input[type="checkbox"]:checked');
    
    featureCheckboxes.forEach(checkbox => {
        const featureId = parseInt(checkbox.dataset.featureId);
        const feature = featuresFilteredData.find(f => f.id === featureId);
        if (feature) {
            selectedFeatures.push(feature);
        }
    });
    
    return selectedFeatures;
}

function getSelectedAddFacilities() {
    const selectedFacilities = [];
    const facilityCheckboxes = document.querySelectorAll('#addFacilities input[type="checkbox"]:checked');
    
    facilityCheckboxes.forEach(checkbox => {
        const facilityId = parseInt(checkbox.dataset.facilityId);
        const facility = facilitiesFilteredData.find(f => f.id === facilityId);
        if (facility) {
            selectedFacilities.push(facility);
        }
    });
    
    return selectedFacilities;
}

// Helper functions to get selected features and facilities for EDIT modal
function getSelectedEditFeatures() {
    const selectedFeatures = [];
    const featureCheckboxes = document.querySelectorAll('#editFeatures input[type="checkbox"]:checked');
    
    console.log('Found checked edit feature checkboxes:', featureCheckboxes.length);
    
    featureCheckboxes.forEach(checkbox => {
        const featureId = parseInt(checkbox.dataset.featureId);
        const feature = featuresFilteredData.find(f => f.id === featureId);
        if (feature) {
            selectedFeatures.push(feature);
            console.log('Added edit feature:', feature);
        }
    });
    
    console.log('getSelectedEditFeatures returning:', selectedFeatures);
    return selectedFeatures;
}

function getSelectedEditFacilities() {
    const selectedFacilities = [];
    const facilityCheckboxes = document.querySelectorAll('#editFacilities input[type="checkbox"]:checked');
    
    console.log('Found checked edit facility checkboxes:', facilityCheckboxes.length);
    
    facilityCheckboxes.forEach(checkbox => {
        const facilityId = parseInt(checkbox.dataset.facilityId);
        const facility = facilitiesFilteredData.find(f => f.id === facilityId);
        if (facility) {
            selectedFacilities.push(facility);
            console.log('Added edit facility:', facility);
        }
    });
    
    console.log('getSelectedEditFacilities returning:', selectedFacilities);
    return selectedFacilities;
}


// Function to set selected features and facilities when editing
function setSelectedFeatures(selectedFeatureIds) {
    selectedFeatureIds.forEach(featureId => {
        const checkbox = document.querySelector(`#editFeatures input[data-feature-id="${featureId}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}

function setSelectedFacilities(selectedFacilityIds) {
    selectedFacilityIds.forEach(facilityId => {
        const checkbox = document.querySelector(`#editFacilities input[data-facility-id="${facilityId}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}

// Function to clear selections for specific modal
function clearAddFeaturesFacilitiesSelection() {
    const allCheckboxes = document.querySelectorAll('#addFeatures input[type="checkbox"], #addFacilities input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

function clearEditFeaturesFacilitiesSelection() {
    const allCheckboxes = document.querySelectorAll('#editFeatures input[type="checkbox"], #editFacilities input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}




// Modal management functions
function openAddModal() {
    if (addModal) {
        // Check if features and facilities data is loaded
        if (!featuresFilteredData || featuresFilteredData.length === 0 || 
            !facilitiesFilteredData || facilitiesFilteredData.length === 0) {
            console.log("Features/Facilities data not loaded for add modal, fetching...");
            fetchFeaturesFacilitiesData().then(() => {
                setTimeout(() => openAddModal(), 100);
            });
            return;
        }
        
        addModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        currentAddStep = 1;
        showAddStep(1);
        
        if (addForm) addForm.reset();
        if (addFileName) addFileName.textContent = "Click to choose room image";
        
        // FIXED: Ensure checkboxes are populated for add modal
        populateAddFeatures(featuresFilteredData);
        populateAddFacilities(facilitiesFilteredData);
        
        // Clear selections and reset word counter
        clearAddFeaturesFacilitiesSelection();
        const addDescription = document.getElementById('addDescription');
        if (addDescription) {
            addDescription.value = '';
            updateWordCounter(addDescription);
        }
        
        console.log('✅ Add modal opened and populated');
    }
}


function closeAddModalFn() {
    if (addModal) {
        addModal.classList.add("hidden");
        document.body.style.overflow = "";
    }
    if (addForm) addForm.reset();
    if (addFileName) addFileName.textContent = "Click to choose room image";
    currentAddStep = 1;
    showAddStep(1);
    clearAddFeaturesFacilitiesSelection();
}

// Modified openEditModal function
function openEditModal(roomId) {
    const room = roomsData.find(r => r.id == roomId);
    if (!room || !editModal) {
        console.error('Room not found or edit modal not available');
        return;
    }

    // Check if features and facilities data is loaded
    if (!featuresFilteredData || featuresFilteredData.length === 0 || 
        !facilitiesFilteredData || facilitiesFilteredData.length === 0) {
        console.log("Features/Facilities data not loaded, fetching...");
        fetchFeaturesFacilitiesData().then(() => {
            setTimeout(() => openEditModal(roomId), 100);
        });
        return;
    }

    // Fill form fields
    const elements = {
        editName: room.categoryType || '',
        editArea: room.area || '',
        editRoomNo : room.roomno || '',
        editPrice: room.price ? room.price.replace('$', '') : '',
        editAdult: room.adultMax || '',
        editChildren: room.childrenMax || '',
        editDescription: room.description || ''
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.value = value;
    });

    // Re-populate checkboxes when opening modal
    populateEditFeatures(featuresFilteredData);
    populateEditFacilities(facilitiesFilteredData);

    // Clear previous selections first
    clearEditFeaturesFacilitiesSelection();
    
    // FIXED: Set features and facilities with proper timing
    setTimeout(() => {
        // Check for selectedFeatures array first (new format)
        if (room.selectedFeatures && Array.isArray(room.selectedFeatures)) {
            console.log('Setting selected features from array:', room.selectedFeatures);
            setSelectedFeatures(room.selectedFeatures.map(f => f.id));
        } else if (room.features && typeof room.features === 'object') {
            // Fallback to old format
            console.log('Converting old features format:', room.features);
            Object.entries(room.features).forEach(([featureName, isSelected]) => {
                if (isSelected) {
                    const feature = featuresFilteredData.find(f => 
                        f.name.toLowerCase().replace(/\s+/g, '') === featureName.toLowerCase()
                    );
                    if (feature) {
                        setSelectedFeatures([feature.id]);
                    }
                }
            });
        }
        
        // Check for selectedFacilities array first (new format)
        if (room.selectedFacilities && Array.isArray(room.selectedFacilities)) {
            console.log('Setting selected facilities from array:', room.selectedFacilities);
            setSelectedFacilities(room.selectedFacilities.map(f => f.id));
        } else if (room.facilities && typeof room.facilities === 'object') {
            // Fallback to old format
            console.log('Converting old facilities format:', room.facilities);
            Object.entries(room.facilities).forEach(([facilityName, isSelected]) => {
                if (isSelected) {
                    const facility = facilitiesFilteredData.find(f => 
                        f.name.toLowerCase().replace(/\s+/g, '') === facilityName.toLowerCase()
                    );
                    if (facility) {
                        setSelectedFacilities([facility.id]);
                    }
                }
            });
        }
    }, 100); // Small delay to ensure checkboxes are rendered

    // Handle status radio buttons
    const statusRadios = document.querySelectorAll('input[name="editStatus"]');
    statusRadios.forEach(radio => {
        let roomStatus = 'inactive';
        if (typeof room.status === 'string') {
            roomStatus = room.status.toLowerCase();
        } else if (typeof room.status === 'object' && room.status !== null) {
            const trueStatus = Object.entries(room.status).find(([key, value]) => value === true);
            roomStatus = trueStatus ? trueStatus[0].toLowerCase() : 'inactive';
        }
        radio.checked = (radio.value === roomStatus);
    });

    editForm.setAttribute('data-room-id', roomId);
    editModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    currentEditStep = 1;
    showEditStep(1);
    
    // Update word counter for edit description
    const editDescription = document.getElementById('editDescription');
    if (editDescription) {
        updateWordCounter(editDescription);
    }
    
    console.log('✅ Edit modal opened for room:', roomId, room);
}



function closeEditModalFn() {
    if (editModal) {
        editModal.classList.add("hidden");
        document.body.style.overflow = "";
    }
    if (editForm) {
        editForm.reset();
        editForm.removeAttribute('data-room-id');
    }
    currentEditStep = 1;
    showEditStep(1);
    clearEditFeaturesFacilitiesSelection();
}


async function openImageModal(roomId) {
    const room = roomsData.find(r => r.id == roomId);
    if (!room || !imageModal) return;

    currentImageRoomId = roomId;
    if (imageModalTitle) {
        const imageCount = (await getRoomImagesFromAPI(roomId)).length;
        imageModalTitle.textContent = `${room.categoryType} (${imageCount} images)`;
    }

    const existingImages = await getRoomImagesFromAPI(roomId);
    renderImagesTable(existingImages);
    
    imageModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeImageModalFn() {
    if (imageModal) {
        imageModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    if (roomImageFileName) {
        roomImageFileName.textContent = 'No file chosen';
    }
    if (roomImageInput) {
        roomImageInput.value = '';
    }
    currentImageRoomId = null;
}

// Add this temporarily to check available functions
console.log('Available modal functions:');
console.log('closeImageModalFn:', typeof closeImageModalFn);



// =====================================
// MESSAGE FUNCTIONS
// =====================================

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-[60] max-w-md';
    successDiv.innerHTML = `
        <div class="flex items-start">
            <svg class="w-5 h-5 mr-3 mt-0.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-sm font-medium">${message}</span>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    setTimeout(() => {
        if (document.body.contains(successDiv)) {
            document.body.removeChild(successDiv);
        }
    }, 4000);
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-[60] max-w-md';
    errorDiv.innerHTML = `
        <div class="flex items-start">
            <svg class="w-5 h-5 mr-3 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-sm font-medium whitespace-pre-line">${message}</span>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    setTimeout(() => {
        if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
        }
    }, 5000);
}

// =====================================
// EVENT HANDLERS FOR THUMBNAILS AND BUTTONS
// =====================================


function closeImageModalFn() {
    if (imageModal) {
        imageModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    if (roomImageFileName) {
        roomImageFileName.textContent = 'No file chosen';
    }
    if (roomImageInput) {
        roomImageInput.value = '';
    }
    currentImageRoomId = null;
}


function attachButtonListeners() {
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const roomId = e.currentTarget.getAttribute('data-room-id');
            openViewRoomsModal(roomId);
        });
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const roomId = e.currentTarget.getAttribute('data-room-id');
            openEditModal(roomId);
        });
    });

    document.querySelectorAll('.image-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const roomId = e.currentTarget.getAttribute('data-room-id');
            openImageModal(roomId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const roomId = e.currentTarget.getAttribute('data-room-id');
            deleteRoom(roomId);
        });
    });
}

function attachImageDeleteListeners() {
    document.querySelectorAll('.delete-image-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const imageIndex = parseInt(e.currentTarget.getAttribute('data-image-index'));
            deleteRoomImage(imageIndex);
        });
    });
}


function attachThumbnailListeners() {
    const thumbnailCheckboxes = document.querySelectorAll('.thumbnail-checkbox');
    
    thumbnailCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', async (e) => {
            if (e.target.checked) {
                // Uncheck other checkboxes (visual only)
                thumbnailCheckboxes.forEach(otherCheckbox => {
                    if (otherCheckbox !== e.target) {
                        otherCheckbox.checked = false;
                    }
                });
                
                const selectedImageIndex = parseInt(e.target.getAttribute('data-image-index'));
                console.log(`📝 Setting thumbnail ${selectedImageIndex} for room ${currentImageRoomId}`);
                
                // Save thumbnail selection to API
                await setRoomThumbnailInAPI(currentImageRoomId, selectedImageIndex);
            }
        });
    });
}

async function setRoomThumbnailInAPI(roomId, thumbnailIndex) {
    try {
        console.log(`🖼️ Setting thumbnail for room ${roomId}...`);
        
        const currentResponse = await fetch(ROOMS_ENDPOINT);
        if (!currentResponse.ok) throw new Error('Failed to fetch current data');
        
        const currentData = await currentResponse.json();
        const currentRooms = currentData.rooms || [];
        
        const updatedRooms = currentRooms.map(room => {
            if (room.id == roomId && room.images && room.images[thumbnailIndex]) {
                const selectedImage = room.images[thumbnailIndex];
                
                // Store the actual thumbnail URL instead of index
                if (typeof selectedImage === 'object' && selectedImage.thumbnailUrl) {
                    room.thumbnailUrl = selectedImage.thumbnailUrl;
                } else if (typeof selectedImage === 'object' && selectedImage.url) {
                    room.thumbnailUrl = selectedImage.url;
                } else if (typeof selectedImage === 'string') {
                    room.thumbnailUrl = selectedImage;
                }
                
                // Also store the index for reference (optional)
                room.thumbnailIndex = thumbnailIndex;
                
                console.log(`✅ Set thumbnail URL: ${room.thumbnailUrl}`);
            }
            return room;
        });
        
        const putResponse = await fetch(ROOMS_ENDPOINT, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: 5,
                rooms: updatedRooms
            })
        });
        
        if (!putResponse.ok) throw new Error(`Failed to set thumbnail: ${putResponse.status}`);
        
        // Update local cache
        await fetchRoomsData();
        showSuccessMessage(`Thumbnail ${thumbnailIndex + 1} set successfully!`);
        
    } catch (error) {
        console.error('❌ Failed to set thumbnail in API:', error);
        showErrorMessage('Failed to set thumbnail');
    }
}


function getRoomThumbnailUrl(roomId) {
    const room = roomsData.find(r => r.id == roomId);
    if (!room) return null;
    
    // First, check if thumbnailUrl is directly stored
    if (room.thumbnailUrl) {
        return room.thumbnailUrl;
    }
    
    // Fallback: use thumbnailIndex if available
    if (room.images && room.images.length > 0) {
        const thumbnailIndex = room.thumbnailIndex || 0;
        const selectedImage = room.images[thumbnailIndex];
        
        if (selectedImage) {
            if (typeof selectedImage === 'object') {
                return selectedImage.thumbnailUrl || selectedImage.url;
            } else if (typeof selectedImage === 'string') {
                return selectedImage;
            }
        }
        
        // Ultimate fallback: first image
        const firstImage = room.images[0];
        if (typeof firstImage === 'object') {
            return firstImage.thumbnailUrl || firstImage.url;
        } else if (typeof firstImage === 'string') {
            return firstImage;
        }
    }
    
    return null;
}


function getRoomThumbnailUrl(roomId) {
    const room = roomsData.find(r => r.id == roomId);
    if (!room) return null;
    
    // First, check if thumbnailUrl is directly stored
    if (room.thumbnailUrl) {
        return room.thumbnailUrl;
    }
    
    // Fallback: use thumbnailIndex if available
    if (room.images && room.images.length > 0) {
        const thumbnailIndex = room.thumbnailIndex || 0;
        const selectedImage = room.images[thumbnailIndex];
        
        if (selectedImage) {
            if (typeof selectedImage === 'object') {
                return selectedImage.thumbnailUrl || selectedImage.url;
            } else if (typeof selectedImage === 'string') {
                return selectedImage;
            }
        }
        
        // Ultimate fallback: first image
        const firstImage = room.images[0];
        if (typeof firstImage === 'object') {
            return firstImage.thumbnailUrl || firstImage.url;
        } else if (typeof firstImage === 'string') {
            return firstImage;
        }
    }
    
    return null;
}


// =====================================
// EVENT LISTENERS & INITIALIZATION
// =====================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing rooms management system...');
    
    initializeDOMElements();
    fetchFeaturesFacilitiesData();

    setTimeout(() => {
        try {
            fetchRoomsData();
            console.log('✅ fetchRoomsData called successfully');
        } catch (error) {
            console.error('❌ Error in fetchRoomsData:', error);
        }
    }, 100);

    // Modal event listeners
    if (addRoomBtn) addRoomBtn.addEventListener("click", openAddModal);
    if (closeAddModal) closeAddModal.addEventListener("click", closeAddModalFn);
    if (cancelAdd) cancelAdd.addEventListener("click", closeAddModalFn);
    if (closeEditModal) closeEditModal.addEventListener("click", closeEditModalFn);
    if (cancelEdit) cancelEdit.addEventListener("click", closeEditModalFn);
    if (cancelImage) cancelImage.addEventListener("click", closeImageModalFn);
    
    // Add Modal Step Navigation
    if (addNextBtn) addNextBtn.addEventListener("click", nextAddStep);
    if (addPrevBtn) addPrevBtn.addEventListener("click", prevAddStep);
    
    // Edit Modal Step Navigation
    if (editNextBtn) editNextBtn.addEventListener("click", nextEditStep);
    if (editPrevBtn) editPrevBtn.addEventListener("click", prevEditStep);
    
    // Add Room form submission with image support
    if (addSubmitBtn) {
    addSubmitBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        addSubmitBtn.textContent = 'Adding Room...';
        addSubmitBtn.disabled = true; // Prevent double submission

        // Initialize errors array
        const errors = [];

        const formData = collectFormData('add');
        const imageFile = addImageInput?.files[0];

        console.log('Add form data collected:', formData);
        console.log('Selected features:', formData.selectedFeatures);
        console.log('Selected facilities:', formData.selectedFacilities);

        // Validate form fields
        if (!formData.name || formData.name.trim() === '') {
            errors.push('Room name is required.');
        }
        if (!formData.area || formData.area.trim() === '') {
            errors.push('Area is required.');
        }
        if (!formData.price || formData.price.trim() === '') {
            errors.push('Price is required.');
        } else if (isNaN(parseFloat(formData.price))) {
            errors.push('Price must be a valid number.');
        }

        // FIXED: Validate features and facilities (SAME AS EDIT FORM)
        if (!formData.selectedFeatures || formData.selectedFeatures.length === 0) {
            errors.push('Please select at least one feature.');
        }
        if (!formData.selectedFacilities || formData.selectedFacilities.length === 0) {
            errors.push('Please select at least one facility.');
        }

        // Validate image file (optional)
        const imageErrors = validateImageFile(imageFile);
        const allErrors = [...errors, ...imageErrors];

        // If there are errors, show them and stop submission
        if (allErrors.length > 0) {
            showErrorMessage(`Please fix the following errors:\n${allErrors.join('\n')}`);
            addSubmitBtn.textContent = 'Submit';
            addSubmitBtn.disabled = false;
            return;
        }

        try {
            await addRoomWithImage(formData, imageFile);

            const successMsg = imageFile
                ? `✅ Room "${formData.name}" and image "${imageFile.name}" added successfully!`
                : `✅ Room "${formData.name}" added successfully!`;

            showSuccessMessage(successMsg);
            closeAddModalFn();
            
            console.log('✅ Room added successfully');
            
        } catch (error) {
            console.error('Failed to add room:', error);
            showErrorMessage('Failed to add room. Please try again.');
        } finally {
            addSubmitBtn.textContent = 'Submit';
            addSubmitBtn.disabled = false;
        }
    });
}


    // EDIT ROOM FORM SUBMISSION
    if (editSubmitBtn) {
        editSubmitBtn.addEventListener("click", async (e) => {
            editSubmitBtn.textContent = "Updating....";
            e.preventDefault();
            
            const roomId = editForm.getAttribute('data-room-id');
            if (!roomId) {
                showErrorMessage('No room selected for editing');
                return;
            }
            
            // Collect form data
            const formData = collectFormData('edit')
            
            // Validate required fields
            if (!formData.name || !formData.area || !formData.price) {
                showErrorMessage('Please fill in all required fields');
                return;
            }
            
            try {
                await updateRoom(roomId, formData);
                closeEditModalFn();
            } catch (error) {
                console.error('Failed to update room:', error);
                showErrorMessage('Failed to update room. Please try again.');
            }

            editSubmitBtn.textContent = "Submit";
        });
    }

    // File input handlers
    if (addImageInput && addFileName) {
        addImageInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                console.log('Selected file:', file);
                addFileName.textContent = file.name;
                const imageErrors = validateImageFile(file);
                if (imageErrors.length > 0) {
                    addFileName.textContent = `❌ ${file.name} - ${imageErrors[0]}`;
                    showErrorMessage(imageErrors[0]);
                }
            } else {
                addFileName.textContent = "Click to choose room image";
            }
        });
    }

    if (roomImageInput && roomImageFileName) {
        roomImageInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            roomImageFileName.textContent = file ? file.name : "No file chosen";
        });
    }
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeConfirmDeleteModal);
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDeleteRoom);
    }

    // Add image button handler for existing rooms
    if (addImageBtn) {
        addImageBtn.addEventListener("click", async () => {
            if (!currentImageRoomId) {
                showErrorMessage('No room selected for image upload');
                return;
            }
            
            const file = roomImageInput?.files[0];
            if (!file) {
                showErrorMessage('Please select an image file first!');
                return;
            }
            
            const imageErrors = validateImageFile(file);
            if (imageErrors.length > 0) {
                showErrorMessage(imageErrors.join('\n'));
                return;
            }
            
            try {
                await addRoomImage(currentImageRoomId, file);
                roomImageInput.value = "";
                roomImageFileName.textContent = "No file chosen";
                showSuccessMessage(`✅ Image "${file.name}" uploaded to Cloudinary successfully!`);
            } catch (error) {
                showErrorMessage('Failed to upload image. Please try again.');
            }
        });
    }

    if (submitImage) {
    submitImage.addEventListener("click", () => {
        const selectedThumbnail = document.querySelector('.thumbnail-checkbox:checked');
        
        if (selectedThumbnail) {
            const newImageIndex = parseInt(selectedThumbnail.getAttribute('data-image-index'));
            
            if (currentImageRoomId) {
                const currentThumbnailIndex = getThumbnailSelection(currentImageRoomId);

                // Only save and show a message if the thumbnail has changed
                if (newImageIndex !== currentThumbnailIndex) {
                    saveThumbnailSelection(currentImageRoomId, newImageIndex);
                    showSuccessMessage(`Thumbnail ${newImageIndex + 1} set as room thumbnail!`);
                    console.log(`✅ Thumbnail ${newImageIndex} saved for room ${currentImageRoomId}`);
                } else {
                    console.log(`ℹ️ Thumbnail ${newImageIndex} is already the current thumbnail for room ${currentImageRoomId}`);
                }
            }
            
            closeImageModalFn();
        } else {
            showErrorMessage('Please select a thumbnail first.');
        }
    });
}

    // Close modals on overlay click
    [addModal, editModal, imageModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (modal.id === 'addModal') closeAddModalFn();
                    else if (modal.id === 'editModal') closeEditModalFn();
                    else if (modal.id === 'imageModal') closeImageModalFn();
                }
            });
        }
    });

    const closeModalButton = document.getElementById('closeViewRoomsModal');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeViewRoomsModal);
    }

    console.log('✅ Rooms management system initialized successfully');
});




   
function closeModal(modal) {
    if (modal) {
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.style.display = 'none';
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

function showLoadingModal() {
    const modal = document.getElementById('viewRoomsModal');
    const content = document.getElementById('viewRoomsContent');
    
    if (modal && content) {
        modal.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4';
        modal.style.display = 'flex';
        
        content.className = 'bg-white rounded-lg shadow-xl w-64 h-32 flex items-center justify-center';
        content.innerHTML = `
            <div class="flex flex-col items-center space-y-3">
                <div class="w-8 h-8 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
                <p class="text-gray-600 font-medium">Loading rooms...</p>
            </div>
        `;
    }
}

function showErrorModal(message) {
    const modal = document.getElementById('viewRoomsModal');
    const content = document.getElementById('viewRoomsContent');
    
    if (modal && content) {
        modal.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4';
        modal.style.display = 'flex';
        
        content.className = 'bg-white rounded-lg shadow-xl w-full max-w-md p-6';
        content.innerHTML = `
            <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Error Loading Rooms</h3>
                <p class="text-gray-600 mb-4">${message}</p>
                <button onclick="closeModal(this.closest('.fixed'))" 
                        class="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors duration-200">
                    Close
                </button>
            </div>
        `;
    }
}


// NEW FUNCTION: Add Room Modal
async function openAddRoomModal(roomId, room) {
    // Create modal elements
    const modal = document.createElement('div');
    modal.id = 'addRoomModal';
    modal.className = 'fixed inset-0 flex items-center justify-center z-[60] bg-black bg-opacity-50 p-4 opacity-0 transition-opacity duration-300';

    const content = document.createElement('div');
    content.className = 'bg-white rounded-lg shadow-xl w-full max-w-md transform scale-95 transition-transform duration-300';

    content.innerHTML = `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">Add New Room</h3>
                <button id="closeAddRoomModal" class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <form id="addViewRoomForm" class="space-y-4">
                <div>
                    <label for="roomNumber" class="block text-sm font-medium text-gray-700 mb-2">Room Number *</label>
                    <input 
                        type="number" 
                        id="roomNumber" 
                        name="roomNumber" 
                        required 
                        min="1"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D1354] focus:border-transparent transition-colors"
                        placeholder="Enter room number"
                    >
                    <div id="roomNumberError" class="text-red-600 text-xs mt-1 hidden">Please enter a valid room number</div>
                </div>
                
                <div class="flex space-x-3 pt-4">
                    <button 
                        type="button" 
                        id="cancelAddRoom" 
                        class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        id="submitviewRoom" 
                        class="flex-1 px-4 py-2 bg-[#1D1354] text-white rounded-lg hover:bg-[#2E1B8C] transition-colors font-medium"
                    >
                        Add Room
                    </button>
                </div>
            </form>
        </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Show modal with animation
    setTimeout(() => {
        modal.style.display = 'flex';
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);

    // Event listeners
    const closeBtn = document.getElementById('closeAddRoomModal');
    const cancelBtn = document.getElementById('cancelAddRoom');
    const form = document.getElementById('addViewRoomForm');

    const closeModal = () => {
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        content.classList.remove('scale-100');
        content.classList.add('scale-95');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    };

    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;

    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // ESC key to close
    const handleKeyPress = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleKeyPress);
        }
    };
    document.addEventListener('keydown', handleKeyPress);

    // Form submission
    form.onsubmit = async (e) => {
        e.preventDefault();

        const roomNumber = document.getElementById('roomNumber').value.trim();

        // Clear previous errors
        document.getElementById('roomNumberError').classList.add('hidden');

        let isValid = true;

        // Validation
        if (!roomNumber || roomNumber < 1) {
            document.getElementById('roomNumberError').classList.remove('hidden');
            isValid = false;
        }

        if (!isValid) return;

        try {
            // Disable submit button
            const submitviewBtn = document.getElementById('submitviewRoom');
            submitviewBtn.disabled = true;
            submitviewBtn.textContent = 'Adding...';

            // Fetch existing data from the mock API
                const response = await fetch('https://68c8b85aceef5a150f622643.mockapi.io/admin/10');

                if (!response.ok) {
                    throw new Error('Failed to fetch existing data from the API');
                }

                const existingData = await response.json();

                // Ensure resultData is an array
                const resultData = Array.isArray(existingData.room) ? existingData.room : [];


                const roomData = {
                    room_no: parseInt(roomNumber),
                    category_type: room.categoryType,
                    type_id: roomId,
                    Status: 'active',
                    Occupied : 'No'
                };

                // Append the new roomData to resultData
                resultData.push(roomData);

                // Update the mock API with the new data
                await fetch('https://68c8b85aceef5a150f622643.mockapi.io/admin/10', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        id: '10',
                        room: resultData
                    })
                });

                console.log('Room data successfully updated:', roomData);

           

            console.log('Room data successfully updated:', roomData);
            alert('Room added successfully!');
            closeModal();
        } catch (error) {
            console.error('Error adding room:', error);
            showErrorModal('Failed to add room. Please try again.');
        } finally {
            // Re-enable submit button
            const submitviewBtn = document.getElementById('submitviewRoom');
            if (submitviewBtn) {
                submitviewBtn.disabled = false;
                submitviewBtn.textContent = 'Add Room';
            }
        }
    };
}




// CORRECTED: Word counter function that handles both modals
function updateWordCounter(textarea) {
    const words = textarea.value.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const maxWords = 50;
    
    // Determine which modal we're in based on textarea ID
    const isAddModal = textarea.id === 'addDescription';
    const counterId = isAddModal ? 'addWordCounter' : 'editWordCounter';
    const warningId = isAddModal ? 'addWordLimitWarning' : 'editWordLimitWarning';
    
    const wordCounter = document.getElementById(counterId);
    const wordLimitWarning = document.getElementById(warningId);
    
    if (wordCounter) {
        wordCounter.textContent = `${wordCount}/${maxWords} words`;
        
        if (wordCount > maxWords) {
            wordCounter.classList.add('text-red-600');
            wordCounter.classList.remove('text-gray-500');
            if (wordLimitWarning) {
                wordLimitWarning.classList.remove('hidden');
            }
        } else {
            wordCounter.classList.add('text-gray-500');
            wordCounter.classList.remove('text-red-600');
            if (wordLimitWarning) {
                wordLimitWarning.classList.add('hidden');
            }
        }
    }
}



window.addEventListener('load', function() {
    console.log('Page loaded, fetching features and facilities...');
    fetchFeaturesFacilitiesData();
});

