/**
 * User Queries Management System
 * Thigalzhi® Concert Management System
 */

// API Configuration
const API_BASE = 'https://68c8b85aceef5a150f622643.mockapi.io';
const QUERIES_ENDPOINT = `${API_BASE}/admin/9`;

// Global variables
let userQueriesData = [];
let filteredData = [];
let currentQueryId = null;

// DOM elements
let loadingIndicator, tableContainer, tableBody, noDataMessage, markAllReadBtn, deleteAllBtn;
let queryModal, closeQueryModal, closeQueryModalBtn, deleteQueryFromModal;
let totalQueriesCount, unreadQueriesCount, readQueriesCount;

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing User Queries Management System...');
    
    // Initialize DOM elements
    initializeDOMElements();
    
    // Check if all critical elements are found
    if (!validateDOMElements()) {
        console.error('❌ Critical DOM elements missing. Application cannot start.');
        return;
    }

    // Start loading queries
    loadUserQueries();

    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ User Queries Management System initialized successfully');
});

/**
 * Initialize all DOM element references
 */
function initializeDOMElements() {
    // Table elements
    loadingIndicator = document.getElementById('loadingIndicator');
    tableContainer = document.getElementById('tableContainer');
    tableBody = document.getElementById('tableBody');
    noDataMessage = document.getElementById('noDataMessage');
    
    // Button elements
    markAllReadBtn = document.getElementById('markAllReadBtn');
    deleteAllBtn = document.getElementById('deleteAllBtn');

    // Modal elements
    queryModal = document.getElementById('queryModal');
    closeQueryModal = document.getElementById('closeQueryModal');
    closeQueryModalBtn = document.getElementById('closeQueryModalBtn');
    deleteQueryFromModal = document.getElementById('deleteQueryFromModal');
    
    // Statistics elements
    totalQueriesCount = document.getElementById('totalQueriesCount');
    unreadQueriesCount = document.getElementById('unreadQueriesCount');
    readQueriesCount = document.getElementById('readQueriesCount');
}

/**
 * Validate that all critical DOM elements exist
 */
function validateDOMElements() {
    const criticalElements = [
        loadingIndicator, tableContainer, tableBody, noDataMessage,
        markAllReadBtn, deleteAllBtn, queryModal
    ];
    
    return criticalElements.every(element => element !== null);
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Button event listeners
    if (markAllReadBtn) markAllReadBtn.addEventListener('click', markAllAsRead);
    if (deleteAllBtn) deleteAllBtn.addEventListener('click', deleteAllQueries);

    // Modal event listeners
    if (closeQueryModal) closeQueryModal.addEventListener('click', closeModal);
    if (closeQueryModalBtn) closeQueryModalBtn.addEventListener('click', closeModal);
    if (deleteQueryFromModal) deleteQueryFromModal.addEventListener('click', deleteCurrentQuery);

    // Mark as read from modal
    const markReadFromModal = document.getElementById('markReadFromModal');
    if (markReadFromModal) {
        markReadFromModal.addEventListener('click', async () => {
            console.log('📝 Mark as read button clicked, currentQueryId:', currentQueryId);
            if (currentQueryId) {
                const success = await markQueriesAsReadInApi([currentQueryId]);
                if (success) {
                    console.log('✅ Successfully marked as read, updating table');
                    updateUI();
                    closeModal();
                }
            }
        });
    }

    // Close modal when clicking outside
    if (queryModal) {
        queryModal.addEventListener('click', (e) => {
            if (e.target === queryModal) {
                closeModal();
            }
        });
    }

    // Event delegation for table buttons
    if (tableBody) {
        tableBody.addEventListener('click', async (event) => {
            const target = event.target.closest('button');
            if (!target) return;

            const id = target.dataset.id;
            
            if (target.classList.contains('view-btn')) {
                openQueryModal(id);
            } else if (target.classList.contains('mark-read-btn')) {
                await markSingleAsRead(parseInt(id));
            } else if (target.classList.contains('delete-btn')) {
                if (confirm('Are you sure you want to delete this query? This action cannot be undone.')) {
                    await deleteQueryFromApi(parseInt(id));
                    updateUI();
                }
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Press Escape to close modal
        if (e.key === 'Escape' && queryModal && !queryModal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

/**
 * Fetch User Queries from the API
 */
async function fetchUserQueries() {
    try {
        console.log('📡 Fetching user queries from API...');
        showLoading(true);

        const response = await fetch(QUERIES_ENDPOINT);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 Raw API data received:', data);

        const normalizedData = normalizeUserQueriesData(data);
        console.log('✅ Normalized queries data:', normalizedData);
        
        return normalizedData;
    } catch (error) {
        console.error('❌ Error fetching user queries:', error);
        showError('Failed to load user queries. Please check your internet connection and try again.');
        return [];
    } finally {
        showLoading(false);
    }
}

/**
 * Normalize API response to handle different data structures
 */
function normalizeUserQueriesData(data) {
    // Handle different possible API response structures
    if (data && Array.isArray(data.UserQueries)) {
        return data.UserQueries;
    } else if (data && Array.isArray(data.userQueries)) {
        return data.userQueries;
    } else if (Array.isArray(data)) {
        return data;
    } else if (data && typeof data === 'object') {
        // Look for array properties
        const arrayProps = Object.values(data).find(value => Array.isArray(value));
        return arrayProps || [];
    }
    
    console.warn('⚠️ Unexpected data structure, returning empty array');
    return [];
}

/**
 * Filter queries based on read status
 */
function getUnreadQueries(allQueries) {
    return allQueries.filter(query => !query.read);
}

function getReadQueries(allQueries) {
    return allQueries.filter(query => query.read);
}

/**
 * Main function to load and display queries
 */
async function loadUserQueries() {
    console.log('🔄 Loading user queries...');
    
    userQueriesData = await fetchUserQueries();
    console.log('📊 Total queries loaded:', userQueriesData.length);

    // Show all queries by default
    filteredData = userQueriesData;
    
    console.log('🔍 Filtered data for display:', filteredData.length, 'queries');
    
    updateUI();
}

/**
 * Update the entire UI including table and statistics
 */
function updateUI() {
    updateStatistics();
    renderTable();
}

/**
 * Update statistics cards
 */
function updateStatistics() {
    if (!userQueriesData.length) return;
    
    const total = userQueriesData.length;
    const unread = getUnreadQueries(userQueriesData).length;
    const read = getReadQueries(userQueriesData).length;
    
    if (totalQueriesCount) totalQueriesCount.textContent = total;
    if (unreadQueriesCount) unreadQueriesCount.textContent = unread;
    if (readQueriesCount) readQueriesCount.textContent = read;
}

/**
 * Update API data
 */
async function updateApiData(updatedData) {
    try {
        console.log('💾 Updating API with data:', updatedData.length, 'queries');
        
        const response = await fetch(QUERIES_ENDPOINT, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: 9,
                UserQueries: updatedData
            })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to update data: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ API update successful');
        return result;
        
    } catch (error) {
        console.error('❌ Error updating API data:', error);
        throw error;
    }
}

/**
 * Delete query from API
 */
async function deleteQueryFromApi(queryId) {
    try {
        console.log('🗑️ Deleting query with ID:', queryId);
        
        const updatedQueries = userQueriesData.filter(query => parseInt(query.id) !== parseInt(queryId));
        
        await updateApiData(updatedQueries);
        
        userQueriesData = updatedQueries;
        filteredData = userQueriesData;
        
        console.log('✅ Query deleted successfully');
        showSuccess('Query deleted successfully');
        return true;
    } catch (error) {
        console.error('❌ Error deleting query:', error);
        showError('Failed to delete query. Please try again.');
        return false;
    }
}

/**
 * Mark queries as read in API
 */
async function markQueriesAsReadInApi(queryIds = []) {
    try {
        console.log('📝 Marking queries as read:', queryIds);
        
        const updatedQueries = userQueriesData.map(query => {
            const queryId = parseInt(query.id);
            if (queryIds.length === 0 || queryIds.includes(queryId)) {
                return { ...query, read: true };
            }
            return query;
        });
        
        try {
            await updateApiData(updatedQueries);
            console.log('✅ API updated successfully');
        } catch (apiError) {
            console.warn('⚠️ API update failed, but continuing with local update:', apiError);
        }
        
        userQueriesData = updatedQueries;
        filteredData = userQueriesData;
        
        console.log('✅ Local data updated successfully');
        showSuccess(queryIds.length === 1 ? 'Query marked as read' : `${queryIds.length} queries marked as read`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error in markQueriesAsReadInApi:', error);
        showError('Failed to mark queries as read. Please try again.');
        return false;
    }
}

/**
 * Render the table with queries
 */
function renderTable() {
    console.log('🎨 Rendering table with', filteredData.length, 'queries');
    
    if (!tableBody) {
        console.error('❌ Table body element not found');
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        console.log('📭 No data to display, showing no data message');
        if (noDataMessage) noDataMessage.classList.remove('hidden');
        if (tableContainer) tableContainer.querySelector('table').style.display = 'none';
        return;
    }
    
    if (noDataMessage) noDataMessage.classList.add('hidden');
    if (tableContainer) tableContainer.querySelector('table').style.display = 'table';
    
    filteredData.forEach((query) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';
        
        const userName = query.userName || query.name || 'Unknown User';
        const email = query.email || query.Email || 'No email provided';
        const date = formatDate(query.date || query.createdAt || new Date().toISOString());
        const subject = query.subject || query.Subject || 'No subject';
        const description = query.description || query.message || 'No description';
        const status = query.read ? 'Read' : 'Unread';
        const statusClass = query.read ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${query.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${escapeHtml(userName)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${escapeHtml(email)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${date}</td>
            <td class="px-6 py-4 text-sm text-gray-600 max-w-xs">
                <p class="line-clamp-2" title="${escapeHtml(subject)}">${escapeHtml(subject)}</p>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 max-w-xs">
                <p class="line-clamp-2" title="${escapeHtml(description)}">${escapeHtml(description)}</p>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">
                    ${status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2">
                    <button class="text-blue-600 hover:text-blue-900 p-2 rounded transition-colors view-btn" title="View Details" data-id="${query.id}">
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                    ${!query.read ? `
                    <button class="text-green-600 hover:text-green-900 p-2 rounded transition-colors mark-read-btn" title="Mark as Read" data-id="${query.id}">
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                    ` : ''}
                    <button class="text-red-600 hover:text-red-900 p-2 rounded transition-colors delete-btn" title="Delete Query" data-id="${query.id}">
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    console.log('✅ Table rendered successfully');
}

/**
 * Open modal with query details
 */
function openQueryModal(queryId) {
    const numericId = parseInt(queryId);
    const query = userQueriesData.find(q => parseInt(q.id) === numericId);
    
    if (!query) {
        console.error('❌ Query not found for ID:', queryId);
        showError('Query not found');
        return;
    }

    currentQueryId = numericId;

    // Populate modal fields
    const modalElements = {
        modalUserName: query.userName || query.name || 'Unknown User',
        modalEmail: query.email || query.Email || 'No email provided',
        modalDate: formatDate(query.date || query.createdAt || new Date().toISOString()),
        modalSubject: query.subject || query.Subject || 'No subject',
        modalDescription: query.description || query.message || 'No description provided'
    };

    Object.entries(modalElements).forEach(([elementId, value]) => {
        const element = document.getElementById(elementId);
        if (element) element.textContent = value;
    });

    // Update status
    const modalStatus = document.getElementById('modalStatus');
    if (modalStatus) {
        const isRead = query.read;
        modalStatus.textContent = isRead ? 'Read' : 'Unread';
        modalStatus.className = isRead 
            ? 'inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800'
            : 'inline-flex px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800';
    }

    // Show modal
    if (queryModal) {
        queryModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close modal
 */
function closeModal() {
    if (queryModal) {
        queryModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    currentQueryId = null;
}

/**
 * Delete current query from modal
 */
async function deleteCurrentQuery() {
    if (currentQueryId && confirm('Are you sure you want to delete this query? This action cannot be undone.')) {
        const success = await deleteQueryFromApi(currentQueryId);
        if (success) {
            updateUI();
            closeModal();
        }
    }
}

/**
 * Mark all visible queries as read
 */
async function markAllAsRead() {
    const unreadQueries = getUnreadQueries(filteredData);
    
    if (unreadQueries.length === 0) {
        showInfo('No unread queries to mark as read.');
        return;
    }

    if (confirm(`Are you sure you want to mark all ${unreadQueries.length} unread queries as read?`)) {
        const unreadIds = unreadQueries.map(query => parseInt(query.id));
        
        const success = await markQueriesAsReadInApi(unreadIds);
        if (success) {
            updateUI();
        }
    }
}

/**
 * Mark single query as read
 */
async function markSingleAsRead(queryId) {
    const success = await markQueriesAsReadInApi([parseInt(queryId)]);
    if (success) {
        updateUI();
    }
}

/**
 * Delete all visible queries
 */
async function deleteAllQueries() {
    if (filteredData.length === 0) {
        showInfo('No queries to delete.');
        return;
    }

    const confirmMessage = `Are you sure you want to delete all ${filteredData.length} visible queries? This action cannot be undone.`;
    if (confirm(confirmMessage)) {
        try {
            showLoading(true);
            
            const updatedQueries = userQueriesData.filter(
                query => !filteredData.some(fq => parseInt(fq.id) === parseInt(query.id))
            );
            
            await updateApiData(updatedQueries);
            userQueriesData = updatedQueries;
            filteredData = [];
            
            updateUI();
            showSuccess('All queries deleted successfully');
        } catch (error) {
            console.error('❌ Error deleting all queries:', error);
            showError('Failed to delete all queries. Please try again.');
        } finally {
            showLoading(false);
        }
    }
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    if (!loadingIndicator || !tableContainer) return;
    
    if (show) {
        loadingIndicator.classList.remove('hidden');
        const table = tableContainer.querySelector('table');
        if (table) table.style.display = 'none';
        if (noDataMessage) noDataMessage.classList.add('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
        const table = tableContainer.querySelector('table');
        if (table) table.style.display = 'table';
    }
}

/**
 * Utility functions
 */
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Invalid Date';
    }
}

function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showSuccess(message) {
    console.log('✅', message);
}

function showError(message) {
    console.error('❌', message);
    alert(`Error: ${message}`);
}

function showInfo(message) {
    console.log('ℹ️', message);
    alert(message);
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    const arrow = document.getElementById('dropdownArrow');
    
    if (dropdown && arrow) {
        dropdown.classList.toggle('hidden');
        arrow.classList.toggle('rotate-180');
    }
}
