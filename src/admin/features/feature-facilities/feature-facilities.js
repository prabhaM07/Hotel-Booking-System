// =========================
// API & Cloudinary Config
// =========================

// API Configuration - Updated endpoints
const API_BASE = 'https://68c8b85aceef5a150f622643.mockapi.io';
const FEATURE_ENDPOINT = `${API_BASE}/admin/6`;  // Features endpoint
const FACILITY_ENDPOINT = `${API_BASE}/admin/7`; // Facilities endpoint

// CLOUDINARY CONFIGURATION - Replace with your credentials
const CLOUDINARY_CONFIG = {
  cloudName: 'dbbzquvdk',     // Replace with actual cloud name
  uploadPreset: 'Zyra-rooms'  // Replace with actual preset name
};
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;


// =========================
// Global State
// =========================
let featuresData = [];
let featuresFilteredData = [];
let facilitiesData = [];
let facilitiesFilteredData = [];

let isEditingFeature = false;
let editingFeatureId = null;
let isEditingFacility = false;
let editingFacilityId = null;


// =========================
// Utilities
// =========================
function showLoading() {
  const el = document.getElementById('loadingIndicator');
  if (el) el.classList.remove('hidden');
}
function hideLoading() {
  const el = document.getElementById('loadingIndicator');
  if (el) el.classList.add('hidden');
}
function safeJSON(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return response.json();
}
function toastSuccess(message) {
  console.log('[SUCCESS]', message);
}
function toastError(message) {
  console.error('[ERROR]', message);
}


// =========================
/* Cloudinary Upload */
// =========================
async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

  const resp = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData
  });
  const data = await safeJSON(resp);
  if (!data.secure_url) throw new Error('No secure_url from Cloudinary');
  return data.secure_url;
}


// =========================
/* API Calls */
// =========================
async function fetchFeaturesFacilitiesData() {
  showLoading();
  try {
    const [featResp, facResp] = await Promise.all([
      fetch(FEATURE_ENDPOINT),
      fetch(FACILITY_ENDPOINT)
    ]);
    const [featJson, facJson] = await Promise.all([
      safeJSON(featResp),
      safeJSON(facResp)
    ]);

    // Expect shape: { id: "6", features: [...] } and { id: "7", facilities: [...] }
    featuresData = Array.isArray(featJson.features) ? featJson.features : [];
    featuresFilteredData = [...featuresData];

    facilitiesData = Array.isArray(facJson.facilities) ? facJson.facilities : [];
    facilitiesFilteredData = [...facilitiesData];

    return { features: featuresFilteredData, facilities: facilitiesFilteredData };
  } catch (err) {
    toastError(`Failed to fetch data: ${err.message}`);
    featuresData = [];
    featuresFilteredData = [];
    facilitiesData = [];
    facilitiesFilteredData = [];
    return { features: [], facilities: [] };
  } finally {
    hideLoading();
  }
}

async function updateFeaturesOnAPI(updatedFeaturesArray) {
  const payload = { id: 6, features: updatedFeaturesArray };
  const resp = await fetch(FEATURE_ENDPOINT, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await safeJSON(resp);
  return data;
}

async function updateFacilitiesOnAPI(updatedFacilitiesArray) {
  const payload = { id: 7, facilities: updatedFacilitiesArray };
  const resp = await fetch(FACILITY_ENDPOINT, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await safeJSON(resp);
  return data;
}


// =========================
// Action Buttons (HTML) — aligned with delegated handlers
// =========================
function getFeatureActionButtons(feature) {
  return `
    <div class="flex items-center gap-2">
      <button class="edit-feature text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
              title="Edit Feature" data-id="${feature.id}">
        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button class="delete-feature text-red-600 hover:text-red-900 p-1 rounded transition-colors"
              title="Delete Feature" data-id="${feature.id}">
        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  `;
}

function getFacilityActionButtons(facility) {
  return `
    <div class="flex items-center gap-2">
      <button class="edit-facility text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
              title="Edit Facility" data-id="${facility.id}">
        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button class="delete-facility text-red-600 hover:text-red-900 p-1 rounded transition-colors"
              title="Delete Facility" data-id="${facility.id}">
        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  `;
}


// =========================
// Generic Pagination Factory
// =========================
function createPager(config) {
  const state = {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    allData: [],
    filteredData: []
  };

  const els = {
    startRecord: document.getElementById(config.startRecordId),
    endRecord: document.getElementById(config.endRecordId),
    totalRecords: document.getElementById(config.totalRecordsId),
    currentPageNumber: document.getElementById(config.currentPageNumberId),
    totalPages: document.getElementById(config.totalPagesId),
    prevBtn: document.getElementById(config.prevBtnId),
    nextBtn: document.getElementById(config.nextBtnId),
    itemsPerPage: document.getElementById(config.itemsPerPageId),
    searchInput: document.getElementById(config.searchInputId),
    container: document.getElementById(config.containerId),
    noData: document.getElementById(config.noDataId)
  };

  function updateButtonStyles(button, disabled) {
    if (!button) return;
    button.disabled = disabled;
    if (disabled) {
      button.classList.add('opacity-40','cursor-not-allowed');
      button.classList.remove('hover:border-primary','hover:text-primary');
    } else {
      button.classList.remove('opacity-40','cursor-not-allowed');
      button.classList.add('hover:border-primary','hover:text-primary');
    }
  }

  function updateUI() {
    const totalPages = Math.max(1, Math.ceil(state.totalItems / state.itemsPerPage) || 1);
    state.currentPage = Math.min(Math.max(1, state.currentPage), totalPages);
    const start = state.totalItems > 0 ? (state.currentPage - 1) * state.itemsPerPage + 1 : 0;
    const end = Math.min(state.currentPage * state.itemsPerPage, state.totalItems);

    if (els.startRecord) els.startRecord.textContent = start;
    if (els.endRecord) els.endRecord.textContent = end;
    if (els.totalRecords) els.totalRecords.textContent = state.totalItems;
    if (els.currentPageNumber) els.currentPageNumber.textContent = state.totalItems > 0 ? state.currentPage : 0;
    if (els.totalPages) els.totalPages.textContent = Math.ceil(state.totalItems / state.itemsPerPage) || 0;

    const disablePrev = state.currentPage <= 1 || state.totalItems === 0;
    const disableNext = state.currentPage >= Math.ceil(state.totalItems / state.itemsPerPage) || state.totalItems === 0;
    updateButtonStyles(els.prevBtn, disablePrev);
    updateButtonStyles(els.nextBtn, disableNext);

    if (els.container && els.noData) {
      if (state.totalItems === 0) {
        els.noData.classList.remove('hidden');
        els.container.classList.add('hidden');
      } else {
        els.noData.classList.add('hidden');
        els.container.classList.remove('hidden');
      }
    }
  }

  function render() {
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const pageData = state.filteredData.slice(startIndex, endIndex);
    config.renderPage(pageData);
  }

  function initialize() {
    state.totalItems = state.filteredData.length;
    state.currentPage = 1;
    updateUI();
    render();
  }

  // Event listeners
  els.prevBtn?.addEventListener('click', (e) => {
    if (e.currentTarget.disabled) return;
    state.currentPage -= 1;
    updateUI();
    render();
  });
  els.nextBtn?.addEventListener('click', (e) => {
    if (e.currentTarget.disabled) return;
    state.currentPage += 1;
    updateUI();
    render();
  });
  els.itemsPerPage?.addEventListener('change', (e) => {
    state.itemsPerPage = parseInt(e.target.value) || 10;
    state.currentPage = 1;
    updateUI();
    render();
  });
  if (els.searchInput) {
    const debounce = (fn, wait) => {
      let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
    };
    els.searchInput.addEventListener('input', debounce((e) => {
      const term = e.target.value.toLowerCase().trim();
      state.filteredData = term
        ? state.allData.filter(config.matches(term))
        : [...state.allData];
      initialize();
    }, 300));
  }

  // Public API
  return {
    setData(data) {
      state.allData = data || [];
      state.filteredData = [...state.allData];
      initialize();
    },
    refresh() { updateUI(); render(); },
    get state() { return { ...state }; }
  };
}


// =========================
// Renderers
// =========================
function renderFeaturesPage(pageData) {
  const tbody = document.getElementById('featuresTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  pageData.forEach((feature, index) => {
    const tr = document.createElement('tr');
    tr.classList.add('hover:bg-gray-50');
    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${feature?.id ?? String(index + 1)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${feature?.name || 'N/A'}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${getFeatureActionButtons(feature)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderFacilitiesPage(pageData) {
  const tbody = document.getElementById('facilitiesTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  pageData.forEach((facility, index) => {
    const tr = document.createElement('tr');
    tr.classList.add('hover:bg-gray-50');
    const iconDisplay = facility.icon
      ? `<img src="${facility.icon}" alt="Icon" class="w-8 h-8 object-cover rounded">`
      : '<span class="text-gray-400">N/A</span>';
    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${facility?.id ?? String(index + 1)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${iconDisplay}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${facility?.name || 'N/A'}</td>
      <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title="${facility?.description || 'N/A'}">${facility?.description || 'N/A'}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${getFacilityActionButtons(facility)}</td>
    `;
    tbody.appendChild(tr);
  });
}


// =========================
/* Pagers — map to actual HTML IDs */
// =========================

// FEATURES: uses ids in featurePaginationContainer (itemsPerPage, prevPage, nextPage, currentPageNumber, totalPages)
const featuresPager = createPager({
  startRecordId: undefined,
  endRecordId: undefined,
  totalRecordsId: undefined,
  currentPageNumberId: 'currentPageNumber',
  totalPagesId: 'totalPages',
  prevBtnId: 'prevPage',
  nextBtnId: 'nextPage',
  itemsPerPageId: 'itemsPerPage',
  searchInputId: undefined,
  containerId: 'featuresTableContainer',
  noDataId: 'noFeaturesDataMessage',
  renderPage: renderFeaturesPage,
  matches: (term) => (item) =>
    (item.name || '').toLowerCase().includes(term) ||
    String(item.id || '').includes(term)
});

// FACILITIES: uses facilities* ids present in HTML
const facilitiesPager = createPager({
  startRecordId: undefined,
  endRecordId: undefined,
  totalRecordsId: undefined,
  currentPageNumberId: 'facilitiesCurrentPageNumber',
  totalPagesId: 'facilitiesTotalPages',
  prevBtnId: 'facilitiesPrevPage',
  nextBtnId: 'facilitiesNextPage',
  itemsPerPageId: 'facilitiesItemsPerPage',
  searchInputId: undefined,
  containerId: 'facilitiesTableContainer',
  noDataId: 'noFacilitiesDataMessage',
  renderPage: renderFacilitiesPage,
  matches: (term) => (item) =>
    (item.name || '').toLowerCase().includes(term) ||
    (item.description || '').toLowerCase().includes(term) ||
    String(item.id || '').includes(term)
});


// =========================
// Modal Helpers
// =========================
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}
function resetFeatureModal() {
  const form = document.getElementById('addFeatureForm');
  if (form) form.reset();
  isEditingFeature = false;
  editingFeatureId = null;
}
function resetFacilityModal() {
  const form = document.getElementById('addFacilityForm');
  if (form) form.reset();
  isEditingFacility = false;
  editingFacilityId = null;
}


// =========================
// Feature Handlers
// =========================
function populateFeatureFormForEdit(feature) {
  const nameInput = document.getElementById('featureName');
  if (nameInput) nameInput.value = feature?.name || '';
}

async function handleFeatureSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('featureName');
  const name = (nameInput?.value || '').trim();
  if (!name) {
    toastError('Feature name is required');
    return;
  }

  try {
    if (isEditingFeature && editingFeatureId != null) {
      const idx = featuresFilteredData.findIndex(f => String(f.id) === String(editingFeatureId));
      if (idx !== -1) {
        featuresFilteredData[idx] = { ...featuresFilteredData[idx], name };
      }
      await updateFeaturesOnAPI(featuresFilteredData);
      toastSuccess('Feature updated');
    } else {
      const newId = generateNextId(featuresFilteredData);
      const newItem = { id: String(newId), name };
      featuresFilteredData.unshift(newItem);
      await updateFeaturesOnAPI(featuresFilteredData);
      toastSuccess('Feature added');
    }
    featuresPager.setData([...featuresFilteredData]);
    closeModal('addFeatureModal');
    resetFeatureModal();
  } catch (err) {
    toastError(`Failed to save feature: ${err.message}`);
  }
}

function onFeaturesTableClick(e) {
  const editBtn = e.target.closest('button.edit-feature');
  const deleteBtn = e.target.closest('button.delete-feature');

  if (editBtn) {
    const id = editBtn.getAttribute('data-id');
    const feature = featuresFilteredData.find(f => String(f.id) === String(id));
    if (!feature) return;
    isEditingFeature = true;
    editingFeatureId = id;
    populateFeatureFormForEdit(feature);
    openModal('addFeatureModal');
    return;
  }

  if (deleteBtn) {
    const id = deleteBtn.getAttribute('data-id');
    confirmFeatureDelete(id);
  }
}

async function confirmFeatureDelete(id) {
  const ok = window.confirm('Delete this feature?');
  if (!ok) return;
  try {
    featuresFilteredData = featuresFilteredData.filter(f => String(f.id) !== String(id));
    await updateFeaturesOnAPI(featuresFilteredData);
    toastSuccess('Feature deleted');
    featuresPager.setData([...featuresFilteredData]);
  } catch (err) {
    toastError(`Failed to delete feature: ${err.message}`);
  }
}


// =========================
// Facility Handlers
// =========================
function populateFacilityFormForEdit(facility) {
  const nameInput = document.getElementById('facilityName');
  const descInput = document.getElementById('facilityDescription');
  if (nameInput) nameInput.value = facility?.name || '';
  if (descInput) descInput.value = facility?.description || '';
  // icon preview handled elsewhere if needed
}

async function handleFacilitySubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('facilityName');
  const descInput = document.getElementById('facilityDescription');
  const iconInput = document.getElementById('facilityIconInput'); // match HTML id

  const name = (nameInput?.value || '').trim();
  const description = (descInput?.value || '').trim();
  if (!name) {
    toastError('Facility name is required');
    return;
  }

  try {
    let iconUrl = null;
    const file = iconInput?.files?.[0];
    if (file) {
      iconUrl = await uploadImageToCloudinary(file);
    }

    if (isEditingFacility && editingFacilityId != null) {
      const idx = facilitiesFilteredData.findIndex(f => String(f.id) === String(editingFacilityId));
      if (idx !== -1) {
        facilitiesFilteredData[idx] = {
          ...facilitiesFilteredData[idx],
          name,
          description,
          icon: iconUrl || facilitiesFilteredData[idx].icon || null
        };
      }
      await updateFacilitiesOnAPI(facilitiesFilteredData);
      toastSuccess('Facility updated');
    } else {
      const newId = generateNextId(facilitiesFilteredData);
      const newItem = { id: String(newId), name, description, icon: iconUrl || null };
      facilitiesFilteredData.unshift(newItem);
      await updateFacilitiesOnAPI(facilitiesFilteredData);
      toastSuccess('Facility added');
    }
    facilitiesPager.setData([...facilitiesFilteredData]);
    closeModal('addFacilityModal');
    resetFacilityModal();
  } catch (err) {
    toastError(`Failed to save facility: ${err.message}`);
  }
}

function onFacilitiesTableClick(e) {
  const editBtn = e.target.closest('button.edit-facility');
  const deleteBtn = e.target.closest('button.delete-facility');

  if (editBtn) {
    const id = editBtn.getAttribute('data-id');
    const facility = facilitiesFilteredData.find(f => String(f.id) === String(id));
    if (!facility) return;
    isEditingFacility = true;
    editingFacilityId = id;
    populateFacilityFormForEdit(facility);
    openModal('addFacilityModal');
    return;
  }

  if (deleteBtn) {
    const id = deleteBtn.getAttribute('data-id');
    confirmFacilityDelete(id);
  }
}

async function confirmFacilityDelete(id) {
  const ok = window.confirm('Delete this facility?');
  if (!ok) return;
  try {
    facilitiesFilteredData = facilitiesFilteredData.filter(f => String(f.id) !== String(id));
    await updateFacilitiesOnAPI(facilitiesFilteredData);
    toastSuccess('Facility deleted');
    facilitiesPager.setData([...facilitiesFilteredData]);
  } catch (err) {
    toastError(`Failed to delete facility: ${err.message}`);
  }
}


// =========================
// Helpers
// =========================
function generateNextId(arr) {
  const maxId = arr.reduce((max, item) => {
    const n = parseInt(item.id, 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return maxId + 1;
}


// =========================
/* Init — single source of truth for pagination */
// =========================
document.addEventListener('DOMContentLoaded', async () => {
  // Wire forms & buttons
  document.getElementById('addFeatureBtn')?.addEventListener('click', () => {
    resetFeatureModal();
    openModal('addFeatureModal');
  });
  document.getElementById('cancelAddFeature')?.addEventListener('click', () => {
    closeModal('addFeatureModal');
    resetFeatureModal();
  });
  document.getElementById('addFeatureForm')?.addEventListener('submit', handleFeatureSubmit);

  document.getElementById('addFacilityBtn')?.addEventListener('click', () => {
    resetFacilityModal();
    openModal('addFacilityModal');
  });
  document.getElementById('cancelAddFacility')?.addEventListener('click', () => {
    closeModal('addFacilityModal');
    resetFacilityModal();
  });
  document.getElementById('addFacilityForm')?.addEventListener('submit', handleFacilitySubmit);

  // Delegate table actions (Element.closest ensures clicks on inner SVGs are handled)
  document.getElementById('featuresTableBody')?.addEventListener('click', onFeaturesTableClick);
  document.getElementById('facilitiesTableBody')?.addEventListener('click', onFacilitiesTableClick);

  // Initial load and pager setup
  const { features, facilities } = await fetchFeaturesFacilitiesData();
  featuresPager.setData(features || []);
  facilitiesPager.setData(facilities || []);
});
