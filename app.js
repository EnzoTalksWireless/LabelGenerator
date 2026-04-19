// Label Generator Web App
// Equivalent to the Tkinter desktop app

const LABELS_PER_ROW = 3;
const LABEL_ROWS_PER_PAGE = 5;
const LABELS_PER_PAGE = LABELS_PER_ROW * LABEL_ROWS_PER_PAGE;

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const STORAGE_MODE = 'supabase'; // Options: 'localstorage', 'supabase', 'api'

// Supabase is auto-initialized from supabase-client.js

// State
let labelsData = [];
let companies = [];
let products = {}; // { companyName: [productNames] }
let editModeIndex = -1; // -1 = not editing, otherwise = index of label being edited

// DOM Elements
const form = document.getElementById('labelForm');
const companyInput = document.getElementById('companyName');
const productInput = document.getElementById('productName');
const receivedDateInput = document.getElementById('receivedDate');
const cartonsInput = document.getElementById('cartons');
const packSizeInput = document.getElementById('packSize');
const batchInput = document.getElementById('batch');
const expiryInput = document.getElementById('expiry');
const retailPriceInput = document.getElementById('retailPrice');
const lockCompanyCheckbox = document.getElementById('lockCompany');
const lockReceivedDateCheckbox = document.getElementById('lockReceivedDate');
const productHint = document.getElementById('productHint');
const labelList = document.getElementById('labelList');
const labelCount = document.getElementById('labelCount');
const previewGrid = document.getElementById('previewGrid');
const clearAllBtn = document.getElementById('clearAllBtn');
const generatePdfBtn = document.getElementById('generatePdfBtn');
const generateExcelBtn = document.getElementById('generateExcelBtn');
const saveLabelsBtn = document.getElementById('saveLabelsBtn');

// Calculator Elements
const calcTotalQty = document.getElementById('calcTotalQty');
const calcPackSize = document.getElementById('calcPackSize');
const calcTradePrice = document.getElementById('calcTradePrice');
const calcLooseBtn = document.getElementById('calcLooseBtn');
const calcLooseOnlyBtn = document.getElementById('calcLooseOnlyBtn');
const calcRetailBtn = document.getElementById('calcRetailBtn');
const looseCalcResult = document.getElementById('looseCalcResult');
const retailCalcResult = document.getElementById('retailCalcResult');
const calcResultCartons = document.getElementById('calcResultCartons');
const calcResultLoose = document.getElementById('calcResultLoose');

// Manual Loose Quantity Elements
const manualLooseToggle = document.getElementById('manualLooseToggle');
const looseQtyContainer = document.getElementById('looseQtyContainer');
const looseQtyInput = document.getElementById('looseQty');

// Received Date Toggle Elements
const toggleReceivedDate = document.getElementById('toggleReceivedDate');
const receivedDateContainer = document.getElementById('receivedDateContainer');
const receivedDateSection = document.getElementById('receivedDateSection');
const lockReceivedDateLabel = document.getElementById('lockReceivedDateLabel');
const row1Container = document.getElementById('row1Container');

// Settings Elements
const settingsBtn = document.getElementById('settingsBtn');
const settingsDropdown = document.getElementById('settingsDropdown');

// Password Modal Elements
const passwordModal = document.getElementById('passwordModal');
const passwordModalBackdrop = document.getElementById('passwordModalBackdrop');
const closePasswordModal = document.getElementById('closePasswordModal');
const settingsPasswordInput = document.getElementById('settingsPasswordInput');
const verifyPasswordBtn = document.getElementById('verifyPasswordBtn');
const passwordError = document.getElementById('passwordError');

// Default settings password (can be changed and stored in localStorage)
const DEFAULT_SETTINGS_PASSWORD = 'admin123';
let settingsUnlocked = false;

// Popup Elements
const openCalculatorsBtn = document.getElementById('openCalculatorsBtn');
const calculatorsPopup = document.getElementById('calculatorsPopup');
const calcPopupBackdrop = document.getElementById('calcPopupBackdrop');
const closePopupBtn = document.getElementById('closePopupBtn');
const minimizePopupBtn = document.getElementById('minimizePopupBtn');
const maximizePopupBtn = document.getElementById('maximizePopupBtn');
const popupContent = document.getElementById('popupContent');
const minimizedDock = document.getElementById('minimizedDock');
const restorePopupBtn = document.getElementById('restorePopupBtn');

// Popup State
let isPopupMinimized = false;
let isPopupMaximized = false;
let toastTimeout = null;

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    
    // Clear any existing timeout
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    
    // Color based on type
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 z-50 show ${
        type === 'error' ? 'bg-red-600' : type === 'warning' ? 'bg-yellow-600' : 'bg-gray-800'
    } text-white`;
    
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============ POPUP FUNCTIONS ============

function openCalculatorsPopup() {
    // Reset any position/transform classes that might interfere
    calculatorsPopup.classList.remove('translate-y-full', 'scale-75');
    
    // Reset maximize state if it was maximized
    if (isPopupMaximized) {
        calculatorsPopup.classList.remove('w-full', 'h-full', 'max-w-none', 'rounded-none', 'top-0', 'left-0', '-translate-x-0', '-translate-y-0');
        calculatorsPopup.classList.add('max-w-md', 'top-1/2', 'left-1/2', '-translate-x-1/2', '-translate-y-1/2', 'rounded-xl');
        popupContent.classList.remove('max-h-screen');
        popupContent.classList.add('max-h-[70vh]');
        isPopupMaximized = false;
    }
    
    // Show backdrop
    calcPopupBackdrop.classList.remove('opacity-0', 'pointer-events-none');
    calcPopupBackdrop.classList.add('opacity-100');
    
    // Show popup with animation - ensure centered
    calculatorsPopup.style.top = '50%';
    calculatorsPopup.style.left = '50%';
    calculatorsPopup.style.transform = 'translate(-50%, -50%) scale(1)';
    calculatorsPopup.classList.remove('scale-0', 'opacity-0');
    calculatorsPopup.classList.add('scale-100', 'opacity-100');
    
    // Hide minimized dock
    minimizedDock.classList.add('translate-y-20', 'opacity-0');
    minimizedDock.classList.remove('translate-y-0', 'opacity-100');
    
    isPopupMinimized = false;
}

function closeCalculatorsPopup() {
    // Hide backdrop
    calcPopupBackdrop.classList.add('opacity-0', 'pointer-events-none');
    calcPopupBackdrop.classList.remove('opacity-100');
    
    // Hide popup
    calculatorsPopup.classList.add('scale-0', 'opacity-0');
    calculatorsPopup.classList.remove('scale-100', 'opacity-100');
    
    // Reset maximize state
    if (isPopupMaximized) {
        calculatorsPopup.classList.remove('w-full', 'h-full', 'max-w-none', 'rounded-none', 'top-0', 'left-0', '-translate-x-0', '-translate-y-0');
        calculatorsPopup.classList.add('max-w-md', 'top-1/2', 'left-1/2', '-translate-x-1/2', '-translate-y-1/2', 'rounded-xl');
        isPopupMaximized = false;
    }
    
    // Hide dock
    minimizedDock.classList.add('translate-y-20', 'opacity-0');
    minimizedDock.classList.remove('translate-y-0', 'opacity-100');
    
    isPopupMinimized = false;
}

function minimizeCalculatorsPopup() {
    // Animate popup down
    calculatorsPopup.classList.add('translate-y-full', 'scale-75', 'opacity-50');
    calculatorsPopup.classList.remove('scale-100', 'opacity-100');
    
    setTimeout(() => {
        // Hide popup completely
        calculatorsPopup.classList.add('scale-0', 'opacity-0');
        calculatorsPopup.classList.remove('translate-y-full', 'scale-75', 'opacity-50');
        
        // Hide backdrop so main UI is accessible
        calcPopupBackdrop.classList.add('opacity-0', 'pointer-events-none');
        calcPopupBackdrop.classList.remove('opacity-100');
        
        // Show dock button
        minimizedDock.classList.remove('translate-y-20', 'opacity-0');
        minimizedDock.classList.add('translate-y-0', 'opacity-100');
        
        isPopupMinimized = true;
    }, 300);
}

function maximizeCalculatorsPopup() {
    if (isPopupMaximized) {
        // Restore to normal size
        calculatorsPopup.classList.remove('w-full', 'h-full', 'max-w-none', 'rounded-none', 'top-0', 'left-0', '-translate-x-0', '-translate-y-0');
        calculatorsPopup.classList.add('max-w-md', 'top-1/2', 'left-1/2', '-translate-x-1/2', '-translate-y-1/2', 'rounded-xl');
        popupContent.classList.remove('max-h-screen');
        popupContent.classList.add('max-h-[70vh]');
        isPopupMaximized = false;
    } else {
        // Maximize to full screen
        calculatorsPopup.classList.remove('max-w-md', 'top-1/2', 'left-1/2', '-translate-x-1/2', '-translate-y-1/2', 'rounded-xl');
        calculatorsPopup.classList.add('w-full', 'h-full', 'max-w-none', 'rounded-none', 'top-0', 'left-0', '-translate-x-0', '-translate-y-0');
        popupContent.classList.remove('max-h-[70vh]');
        popupContent.classList.add('max-h-screen');
        isPopupMaximized = true;
    }
}

function restoreCalculatorsPopup() {
    // Hide dock
    minimizedDock.classList.add('translate-y-20', 'opacity-0');
    minimizedDock.classList.remove('translate-y-0', 'opacity-100');
    
    // Reset position and show popup
    calculatorsPopup.classList.remove('scale-0', 'opacity-0', 'translate-y-full', 'scale-75');
    calculatorsPopup.classList.add('scale-100', 'opacity-100');
    calculatorsPopup.style.top = '50%';
    calculatorsPopup.style.left = '50%';
    calculatorsPopup.style.transform = 'translate(-50%, -50%) scale(1)';
    
    isPopupMinimized = false;
}

// Credit validation - check if credit text exists
function validateCredit() {
    const header = document.querySelector('header');
    if (!header || !header.textContent.includes('Made By Hamza')) {
        document.body.innerHTML = `
            <div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#1e293b;color:white;font-family:system-ui,sans-serif;">
                <div style="text-align:center;padding:2rem;">
                    <h1 style="font-size:2rem;margin-bottom:1rem;color:#ef4444;">⚠️ Application Error</h1>
                    <p style="font-size:1.2rem;margin-bottom:1rem;">Credit text has been removed or altered.</p>
                    <p style="font-size:1rem;color:#94a3b8;">Please restore the credit "Made By Hamza" in the header to continue.</p>
                    <p style="margin-top:2rem;font-size:0.9rem;color:#64748b;">Contact support for assistance.</p>
                </div>
            </div>
        `;
        return false;
    }
    return true;
}

// Initialize
async function init() {
    // Validate credit before loading app
    if (!validateCredit()) return;
    
    // Initialize received date toggle state BEFORE setting up event listeners
    // This prevents the double-toggle issue
    receivedDateSection.classList.add('hidden');
    lockReceivedDateLabel.classList.add('hidden');
    row1Container.classList.remove('md:grid-cols-3');
    row1Container.classList.add('md:grid-cols-2');
    toggleReceivedDate.checked = false;
    receivedDateInput.value = '';
    
    // Initialize storage based on mode
    if (STORAGE_MODE === 'supabase') {
        // Initialize Supabase client
        if (typeof initSupabase === 'function') {
            initSupabase();
            if (isSupabaseReady()) {
                debugLog('Loading from Supabase...');
                const data = await loadFromSupabase();
                // Assign to app state variables
                companies = data.companies || [];
                products = data.products || {};
                debugLog('Supabase data loaded', { companies: companies.length, products: Object.keys(products).length });
            } else {
                debugLog('Supabase not ready, falling back to localStorage');
                loadFromStorage();
            }
        } else {
            debugLog('Supabase client not loaded, using localStorage');
            loadFromStorage();
        }
    } else if (STORAGE_MODE === 'api') {
        await loadFromAPI();
    } else {
        loadFromStorage();
    }
    
    setupEventListeners();
    
    // Check for auto-saved labels on startup
    checkAutoSaveOnStartup();
    
    updateCompanyList();
    updateUI();
}

// ============ API FUNCTIONS ============

async function apiRequest(endpoint, options = {}) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        showToast('Database connection failed - check server', 'error');
        throw error;
    }
}

async function loadFromAPI() {
    try {
        // Load companies
        companies = await apiRequest('/companies');
        
        // Load all products grouped by company
        products = await apiRequest('/products/all');
        
        console.log('Loaded from SQLite:', { companies, products });
    } catch (error) {
        console.error('Failed to load from API:', error);
        showToast('Failed to load data from database', 'error');
    }
}

async function addCompanyToAPI(companyName) {
    if (!companyName) return false;
    try {
        await apiRequest('/companies', {
            method: 'POST',
            body: JSON.stringify({ company_name: companyName })
        });
        return true;
    } catch (error) {
        return false;
    }
}

async function addProductToAPI(companyName, productName) {
    if (!companyName || !productName) return false;
    try {
        await apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify({ 
                company_name: companyName, 
                product_name: productName 
            })
        });
        return true;
    } catch (error) {
        return false;
    }
}

// Load data from localStorage
function loadFromStorage() {
    const storedCompanies = localStorage.getItem('lg_companies');
    const storedProducts = localStorage.getItem('lg_products');
    
    if (storedCompanies) {
        companies = JSON.parse(storedCompanies);
    }
    if (storedProducts) {
        products = JSON.parse(storedProducts);
    }
}

// Save data to localStorage
function saveToStorage() {
    localStorage.setItem('lg_companies', JSON.stringify(companies));
    localStorage.setItem('lg_products', JSON.stringify(products));
}

// Set default received date
function setDefaultReceivedDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);
    receivedDateInput.value = `${day}-${month}-${year}`;
}

// Update company select options
function updateCompanyList() {
    const currentValue = companyInput.value;
    companyInput.innerHTML = '<option value="">-- Select Company --</option>' +
        companies.map(c =>
            `<option value="${escapeHtml(c)}" ${c === currentValue ? 'selected' : ''}>${escapeHtml(c)}</option>`
        ).join('');
}

// Update product select options based on selected company
function updateProductList(companyName) {
    const currentValue = productInput.value;
    productInput.innerHTML = '<option value="">-- Select Product --</option>';
    productInput.disabled = true;

    if (!companyName) {
        if (productHint) productHint.textContent = 'Select a company first to see products';
        return;
    }

    const companyProducts = products[companyName] || [];

    if (companyProducts.length > 0) {
        productInput.innerHTML += companyProducts.map(p =>
            `<option value="${escapeHtml(p)}" ${p === currentValue ? 'selected' : ''}>${escapeHtml(p)}</option>`
        ).join('');
        productInput.disabled = false;
        if (productHint) productHint.textContent = `${companyProducts.length} products available`;
    } else {
        // If no products exist, still enable the select but show placeholder
        productInput.disabled = false;
        productInput.innerHTML = '<option value="">No products available</option>';
        if (productHint) productHint.textContent = 'No saved products for this company';
    }
}

// Password Modal Functions
function openPasswordModal() {
    passwordModalBackdrop.classList.remove('pointer-events-none', 'opacity-0');
    passwordModalBackdrop.classList.add('opacity-100');
    passwordModal.classList.remove('scale-0', 'opacity-0');
    passwordModal.classList.add('scale-100', 'opacity-100');
    settingsPasswordInput.value = '';
    passwordError.classList.add('hidden');
    setTimeout(() => settingsPasswordInput.focus(), 100);
}

function closePasswordModalFn() {
    passwordModalBackdrop.classList.add('pointer-events-none', 'opacity-0');
    passwordModalBackdrop.classList.remove('opacity-100');
    passwordModal.classList.add('scale-0', 'opacity-0');
    passwordModal.classList.remove('scale-100', 'opacity-100');
}

function verifySettingsPassword() {
    const enteredPassword = settingsPasswordInput.value;
    // Get stored password or use default
    const storedPassword = localStorage.getItem('settingsPassword') || DEFAULT_SETTINGS_PASSWORD;
    
    if (enteredPassword === storedPassword) {
        settingsUnlocked = true;
        closePasswordModalFn();
        // Now show the settings dropdown
        settingsDropdown.classList.remove('hidden');
    } else {
        passwordError.classList.remove('hidden');
        settingsPasswordInput.value = '';
        settingsPasswordInput.focus();
    }
}

// Change Password Modal Functions
function openChangePasswordModal() {
    const changePasswordModal = document.getElementById('changePasswordModal');
    const changePasswordModalBackdrop = document.getElementById('changePasswordModalBackdrop');
    
    changePasswordModalBackdrop.classList.remove('pointer-events-none', 'opacity-0');
    changePasswordModalBackdrop.classList.add('opacity-100');
    changePasswordModal.classList.remove('scale-0', 'opacity-0');
    changePasswordModal.classList.add('scale-100', 'opacity-100');
    
    // Clear inputs
    document.getElementById('currentPasswordInput').value = '';
    document.getElementById('newPasswordInput').value = '';
    document.getElementById('confirmPasswordInput').value = '';
    document.getElementById('changePasswordError').classList.add('hidden');
    document.getElementById('changePasswordSuccess').classList.add('hidden');
    
    setTimeout(() => document.getElementById('currentPasswordInput').focus(), 100);
}

function closeChangePasswordModalFn() {
    const changePasswordModal = document.getElementById('changePasswordModal');
    const changePasswordModalBackdrop = document.getElementById('changePasswordModalBackdrop');
    
    changePasswordModalBackdrop.classList.add('pointer-events-none', 'opacity-0');
    changePasswordModalBackdrop.classList.remove('opacity-100');
    changePasswordModal.classList.add('scale-0', 'opacity-0');
    changePasswordModal.classList.remove('scale-100', 'opacity-100');
}

function saveNewPassword() {
    const currentPassword = document.getElementById('currentPasswordInput').value;
    const newPassword = document.getElementById('newPasswordInput').value;
    const confirmPassword = document.getElementById('confirmPasswordInput').value;
    const errorEl = document.getElementById('changePasswordError');
    const successEl = document.getElementById('changePasswordSuccess');
    
    // Get stored password or use default
    const storedPassword = localStorage.getItem('settingsPassword') || DEFAULT_SETTINGS_PASSWORD;
    
    // Validate
    if (currentPassword !== storedPassword) {
        errorEl.textContent = 'Current password is incorrect';
        errorEl.classList.remove('hidden');
        successEl.classList.add('hidden');
        return;
    }
    
    if (newPassword.length < 4) {
        errorEl.textContent = 'New password must be at least 4 characters';
        errorEl.classList.remove('hidden');
        successEl.classList.add('hidden');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        errorEl.textContent = 'New passwords do not match';
        errorEl.classList.remove('hidden');
        successEl.classList.add('hidden');
        return;
    }
    
    // Save new password
    localStorage.setItem('settingsPassword', newPassword);
    
    errorEl.classList.add('hidden');
    successEl.classList.remove('hidden');
    
    // Close modal after a delay
    setTimeout(() => {
        closeChangePasswordModalFn();
    }, 1500);
}

// Make functions globally accessible for HTML onclick
window.openChangePasswordModal = openChangePasswordModal;
window.toggleSettings = function() {
    const dropdown = document.getElementById('settingsDropdown');
    if (dropdown) {
        dropdown.classList.add('hidden');
    }
};

// Setup event listeners
function setupEventListeners() {
    // Company select changes
    companyInput.addEventListener('change', (e) => {
        updateProductList(e.target.value.trim());
    });
    
    // Received date auto-format
    receivedDateInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/-/g, '').replace(/[^0-9]/g, '');
        if (value.length > 2) {
            value = value.slice(0, 2) + '-' + value.slice(2);
        }
        if (value.length > 5) {
            value = value.slice(0, 5) + '-' + value.slice(5, 7);
        }
        e.target.value = value;
    });
    
    // Expiry auto-format
    expiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[-/]/g, '').replace(/[^0-9]/g, '');
        if (value.length > 2) {
            value = value.slice(0, 2) + '-' + value.slice(2);
        }
        if (value.length > 5) {
            value = value.slice(0, 5) + '-' + value.slice(5, 9);
        }
        e.target.value = value;
    });
    
    // Expiry blur - convert to Month-YYYY
    expiryInput.addEventListener('blur', (e) => {
        e.target.value = formatExpiryToMonthYear(e.target.value);
    });
    
    // Manual Loose Quantity Toggle with slide animation
    manualLooseToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            // Slide in animation
            looseQtyContainer.classList.remove('hidden');
            looseQtyContainer.classList.add('slide-in');
            setTimeout(() => {
                looseQtyInput.focus();
            }, 150);
        } else {
            // Slide out animation
            looseQtyContainer.classList.remove('slide-in');
            looseQtyContainer.classList.add('slide-out');
            setTimeout(() => {
                looseQtyContainer.classList.add('hidden');
                looseQtyContainer.classList.remove('slide-out');
                looseQtyInput.value = '';
            }, 200);
        }
    });
    
    // Received Date Toggle - toggle is always visible, only label+input hide
    toggleReceivedDate.addEventListener('change', (e) => {
        if (e.target.checked) {
            // Show the received date label and input
            receivedDateSection.classList.remove('hidden');
            lockReceivedDateLabel.classList.remove('hidden');
            // Change grid to 3 columns on desktop
            row1Container.classList.remove('md:grid-cols-2');
            row1Container.classList.add('md:grid-cols-3');
            if (!receivedDateInput.value) {
                setDefaultReceivedDate();
            }
            setTimeout(() => {
                receivedDateInput.focus();
            }, 100);
        } else {
            // Hide the received date label and input
            receivedDateSection.classList.add('hidden');
            lockReceivedDateLabel.classList.add('hidden');
            receivedDateInput.value = '';
            lockReceivedDateCheckbox.checked = false;
            // Change grid to 2 columns on desktop
            row1Container.classList.remove('md:grid-cols-3');
            row1Container.classList.add('md:grid-cols-2');
        }
    });
    
    // Form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addLabel();
    });
    
    // Clear all
    clearAllBtn.addEventListener('click', () => {
        if (confirm('Clear all labels?')) {
            labelsData = [];
            updateUI();
            showToast('All labels cleared');
        }
    });
    
    // Settings button - requires password
    if (settingsBtn && settingsDropdown) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // If already unlocked, just toggle dropdown
            if (settingsUnlocked) {
                settingsDropdown.classList.toggle('hidden');
            } else {
                // Show password modal
                openPasswordModal();
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!settingsDropdown.classList.contains('hidden') && 
                !settingsBtn.contains(e.target) && 
                !settingsDropdown.contains(e.target)) {
                settingsDropdown.classList.add('hidden');
            }
        });
    }
    
    // Password modal listeners
    if (closePasswordModal) {
        closePasswordModal.addEventListener('click', closePasswordModalFn);
    }
    if (verifyPasswordBtn) {
        verifyPasswordBtn.addEventListener('click', verifySettingsPassword);
    }
    if (settingsPasswordInput) {
        settingsPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                verifySettingsPassword();
            }
        });
    }
    
    // Change password modal listeners
    const closeChangePwdModal = document.getElementById('closeChangePasswordModal');
    const saveNewPwdBtn = document.getElementById('saveNewPasswordBtn');
    const confirmPwdInput = document.getElementById('confirmPasswordInput');
    const changePwdModalBackdrop = document.getElementById('changePasswordModalBackdrop');
    
    if (closeChangePwdModal) {
        closeChangePwdModal.addEventListener('click', closeChangePasswordModalFn);
    }
    if (saveNewPwdBtn) {
        saveNewPwdBtn.addEventListener('click', saveNewPassword);
    }
    if (confirmPwdInput) {
        confirmPwdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveNewPassword();
            }
        });
    }
    if (changePwdModalBackdrop) {
        changePwdModalBackdrop.addEventListener('click', closeChangePasswordModalFn);
    }
    
    // Generate PDF
    generatePdfBtn.addEventListener('click', generatePDF);
    
    // Generate Excel
    generateExcelBtn.addEventListener('click', generateExcel);
    
    // Import Companies
    document.getElementById('importCompanies').addEventListener('change', importCompanies);
    
    // Import Products
    document.getElementById('importProducts').addEventListener('change', importProducts);
    
    // Calculator - Loose Quantity
    calcLooseBtn.addEventListener('click', applyLooseCalculation);
    calcLooseOnlyBtn.addEventListener('click', applyLooseOnly);
    
    // Calculator - Real-time updates
    [calcTotalQty, calcPackSize].forEach(input => {
        input.addEventListener('input', updateLooseCalcPreview);
    });
    
    // Calculator - Retail Price
    calcRetailBtn.addEventListener('click', applyRetailCalculation);
    calcTradePrice.addEventListener('input', updateRetailCalcPreview);
    
    // Popup Controls
    openCalculatorsBtn.addEventListener('click', openCalculatorsPopup);
    closePopupBtn.addEventListener('click', closeCalculatorsPopup);
    minimizePopupBtn.addEventListener('click', minimizeCalculatorsPopup);
    maximizePopupBtn.addEventListener('click', maximizeCalculatorsPopup);
    restorePopupBtn.addEventListener('click', restoreCalculatorsPopup);
    
    // Close popup on backdrop click
    calcPopupBackdrop.addEventListener('click', closeCalculatorsPopup);
    
    // Close popup on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCalculatorsPopup();
        }
    });
    
    // Save/Load Labels
    const loadLabelsInput = document.getElementById('loadLabelsInput');
    const loadLabelsBtn = document.getElementById('loadLabelsBtn');
    
    if (saveLabelsBtn) {
        saveLabelsBtn.addEventListener('click', saveLabelsToFile);
    }
    if (loadLabelsInput) {
        loadLabelsInput.addEventListener('change', loadLabelsFromFile);
    }
    if (loadLabelsBtn && loadLabelsInput) {
        loadLabelsBtn.addEventListener('click', () => loadLabelsInput.click());
    }
}

// Calculator Functions
function updateLooseCalcPreview() {
    const totalQty = parseInt(calcTotalQty.value) || 0;
    const packSize = parseInt(calcPackSize.value) || 0;
    
    if (packSize > 0 && totalQty > 0) {
        const cartons = Math.floor(totalQty / packSize);
        const loose = totalQty % packSize;
        
        calcResultCartons.textContent = cartons;
        calcResultLoose.textContent = loose;
        
        let text = `Calculated: ${cartons} cartons, ${loose} loose pieces`;
        if (cartons > 0 && loose === 0) {
            text = `Exact: ${cartons} full cartons`;
        } else if (cartons === 0 && loose > 0) {
            text = `Loose only: ${loose} pieces`;
        }
        looseCalcResult.textContent = text;
    } else {
        calcResultCartons.textContent = '0';
        calcResultLoose.textContent = '0';
        looseCalcResult.textContent = 'Enter total quantity and pack size';
    }
}

function applyLooseCalculation() {
    const totalQty = parseInt(calcTotalQty.value) || 0;
    const packSize = parseInt(calcPackSize.value) || 0;
    
    if (packSize <= 0) {
        showToast('Please enter pack size', 'error');
        calcPackSize.focus();
        return;
    }
    if (totalQty <= 0) {
        showToast('Please enter total quantity', 'error');
        calcTotalQty.focus();
        return;
    }
    
    const cartons = Math.floor(totalQty / packSize);
    const loose = totalQty % packSize;
    
    cartonsInput.value = cartons > 0 ? cartons : '0';
    packSizeInput.value = packSize;
    
    // Store loose pieces for display
    cartonsInput.dataset.loosePieces = loose > 0 ? loose : '0';
    
    // If there are loose pieces, enable the toggle and show the input
    if (loose > 0) {
        manualLooseToggle.checked = true;
        looseQtyContainer.classList.remove('hidden');
        looseQtyContainer.classList.add('slide-in');
        looseQtyInput.value = loose;
    }
    
    let msg;
    if (cartons > 0 && loose > 0) {
        msg = `Applied: ${cartons}x${packSize}, ${loose} LOOSE (${totalQty} total)`;
    } else if (loose > 0) {
        msg = `Applied: ${loose} LOOSE only`;
    } else {
        msg = `Applied: ${cartons} full cartons`;
    }
    
    showToast(msg);
}

function applyLooseOnly() {
    const totalQty = parseInt(calcTotalQty.value) || 0;
    const packSize = parseInt(calcPackSize.value) || 1;
    
    if (totalQty <= 0) {
        showToast('Please enter total quantity', 'error');
        calcTotalQty.focus();
        return;
    }
    
    // Calculate loose pieces only (remainder)
    const loose = totalQty % packSize;
    
    // For Loose Only: set cartons to 0, only apply the loose quantity
    cartonsInput.value = '0';
    packSizeInput.value = packSize;
    cartonsInput.dataset.loosePieces = loose;
    
    // Enable manual loose toggle and show the input with calculated loose quantity
    manualLooseToggle.checked = true;
    looseQtyContainer.classList.remove('hidden');
    looseQtyContainer.classList.add('slide-in');
    looseQtyInput.value = loose;
    
    showToast(`Applied: ${loose} LOOSE only (${totalQty} total → remainder)`);
}

function updateRetailCalcPreview() {
    const tradePrice = parseFloat(calcTradePrice.value) || 0;
    if (tradePrice > 0) {
        const retailPrice = (tradePrice * 100 / 85).toFixed(2);
        retailCalcResult.textContent = `Retail Price: ${retailPrice}`;
    } else {
        retailCalcResult.textContent = 'Enter trade price to calculate retail';
    }
}

function applyRetailCalculation() {
    const tradePrice = parseFloat(calcTradePrice.value) || 0;
    
    if (tradePrice <= 0) {
        showToast('Please enter valid trade price', 'error');
        calcTradePrice.focus();
        return;
    }
    
    const retailPrice = (tradePrice * 100 / 85).toFixed(2);
    retailPriceInput.value = retailPrice;
    
    showToast(`Retail Price calculated: ${retailPrice}`);
}

// Format expiry to Month-YYYY
function formatExpiryToMonthYear(raw) {
    const s = raw.trim();
    if (!s) return '';
    
    // Already in Month-YYYY format
    if (s.includes('-') && /[a-zA-Z]/.test(s)) {
        return s;
    }
    
    const formats = ['DD-MM-YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YY'];
    
    // Try parsing as DD-MM-YYYY
    const parts = s.split('-');
    if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        let year = parseInt(parts[2]);
        
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            if (year < 100) year += 2000;
            const date = new Date(year, month - 1, day);
            if (date.getDate() === day && date.getMonth() === month - 1) {
                return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).replace(' ', '-');
            }
        }
    }
    
    return s;
}

// Split product name and strength
function splitProductStrength(productName) {
    const name = (productName || '').trim();
    
    // Match strength patterns at end: 500MG, 250ML, 100MCG, 0.5MG, 500MG/5ML, etc.
    const pattern = /\s+(\d+(?:\.\d+)?\s*(?:MG|ML|MCG|G|IU|%|MG\/ML|MG\/\d+ML|MCG\/ML)(?:\s*\/\s*\d+(?:\.\d+)?\s*(?:MG|ML|MCG|G|IU|%)?)*)\s*$/i;
    
    const match = name.match(pattern);
    if (match) {
        return {
            name: name.substring(0, match.index).trim(),
            strength: match[1].trim().toUpperCase()
        };
    }
    
    return { name, strength: '' };
}

// Debug logging helper
function debugLog(step, data = null) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = `[DEBUG ${timestamp}]`;
    if (data) {
        console.log(`${prefix} ${step}:`, data);
    } else {
        console.log(`${prefix} ${step}`);
    }
}

// Add label
async function addLabel() {
    debugLog('=== ADD LABEL START ===');
    debugLog('Current labels count', labelsData.length);
    
    try {
        const companyName = companyInput.value.trim();
        const productName = productInput.value.trim();
        const receivedDate = receivedDateInput.value;
        const cartons = parseInt(cartonsInput.value) || 0;
        const packSize = parseInt(packSizeInput.value) || 0;
        const batch = batchInput.value.trim();
        const expiry = expiryInput.value.trim();
        const price = parseFloat(retailPriceInput.value) || 0;
        
        debugLog('Form values', { companyName, productName, receivedDate, cartons, packSize, batch, expiry, price });
        
        // Validation
        if (!companyName) {
            debugLog('VALIDATION FAILED: Company name missing');
            showToast('Company Name is required', 'error');
            companyInput.focus();
            return;
        }
        if (!productName) {
            debugLog('VALIDATION FAILED: Product name missing');
            showToast('Product Name is required', 'error');
            productInput.focus();
            return;
        }
    
        // Get loose pieces from data attribute (calculator) or manual input
        let loosePieces = parseInt(cartonsInput.dataset.loosePieces) || 0;
        debugLog('Loose pieces from data attribute', loosePieces);
        
        // If manual loose toggle is enabled, use the manual input value
        if (manualLooseToggle.checked && looseQtyInput.value) {
            loosePieces = parseInt(looseQtyInput.value) || 0;
            debugLog('Loose pieces from manual input', loosePieces);
        }
        
        // Check if this is loose-only entry (manual loose toggle is on and has value)
        const isLooseOnly = manualLooseToggle.checked && loosePieces > 0;
        debugLog('Is loose only entry', isLooseOnly);
        
        // Must have either cartons or loose pieces
        if (cartons <= 0 && loosePieces <= 0) {
            debugLog('VALIDATION FAILED: No cartons or loose pieces');
            showToast('Enter cartons or enable loose quantity toggle', 'error');
            cartonsInput.focus();
            return;
        }
        
        // Pack size is only required if cartons > 0 (not for loose-only entries)
        if (!isLooseOnly && cartons > 0 && packSize <= 0) {
            debugLog('VALIDATION FAILED: Pack size required for cartons');
            showToast('Enter pack size for cartons', 'error');
            packSizeInput.focus();
            return;
        }
        
        const label = {
            company_name: companyName,
            product_name: productName,
            received_date: receivedDate,
            cartons,
            pack_size: packSize,
            loose_pieces: loosePieces,
            batch,
            expiry: formatExpiryToMonthYear(expiry),
            price
        };
        debugLog('Label object created', label);
        
        // Add to database
        debugLog('Adding company to DB...');
        await addCompanyToDB(companyName);
        debugLog('Company added successfully');
        
        debugLog('Adding product to DB...');
        await addProductToDB(companyName, productName);
        debugLog('Product added successfully');
        
        if (editModeIndex >= 0) {
            debugLog('Edit mode: updating existing label at index', editModeIndex);
            labelsData[editModeIndex] = label;
            showToast('Label updated successfully');
            cancelEdit(); // Exit edit mode
        } else {
            debugLog('Adding new label to labelsData array');
            labelsData.push(label);
            debugLog('New labels count', labelsData.length);
            showToast('Label added successfully');
            // Clear form (respecting locks)
            clearForm();
        }
        
        // Auto-save after each addition
        autoSaveLabels();
        
        // Update UI
        debugLog('Updating UI...');
        updateUI();
        debugLog('=== ADD LABEL COMPLETE ===');
    } catch (error) {
        debugLog('ERROR in addLabel', error.message);
        console.error('Full error:', error);
        showToast('Error adding label: ' + error.message, 'error');
    }
}

// Add company to DB
async function addCompanyToDB(companyName) {
    if (!companyName) return;
    
    if (STORAGE_MODE === 'supabase' && isSupabaseReady()) {
        // Add to Supabase
        const success = await addCompanyToSupabase(companyName);
        if (success && !companies.includes(companyName)) {
            companies.push(companyName);
            companies.sort();
            updateCompanyList();
        }
    } else if (STORAGE_MODE === 'api') {
        // Add to SQLite via API
        const success = await addCompanyToAPI(companyName);
        if (success && !companies.includes(companyName)) {
            companies.push(companyName);
            companies.sort();
            updateCompanyList();
        }
    } else {
        // Add to localStorage
        if (!companies.includes(companyName)) {
            companies.push(companyName);
            companies.sort();
            saveToStorage();
            updateCompanyList();
        }
    }
}

// Add product to DB
async function addProductToDB(companyName, productName) {
    if (!companyName || !productName) return;
    
    if (STORAGE_MODE === 'supabase' && isSupabaseReady()) {
        // Add to Supabase
        const success = await addProductToSupabase(companyName, productName);
        if (success) {
            if (!products[companyName]) {
                products[companyName] = [];
            }
            if (!products[companyName].includes(productName)) {
                products[companyName].push(productName);
                products[companyName].sort();
            }
        }
    } else if (STORAGE_MODE === 'api') {
        // Add to SQLite via API
        const success = await addProductToAPI(companyName, productName);
        if (success) {
            if (!products[companyName]) {
                products[companyName] = [];
            }
            if (!products[companyName].includes(productName)) {
                products[companyName].push(productName);
                products[companyName].sort();
            }
        }
    } else {
        // Add to localStorage
        if (!products[companyName]) {
            products[companyName] = [];
        }
        
        if (!products[companyName].includes(productName)) {
            products[companyName].push(productName);
            products[companyName].sort();
            saveToStorage();
        }
    }
}

// Clear form respecting locks
function clearForm() {
    if (!lockCompanyCheckbox.checked) {
        companyInput.value = '';
        updateProductList('');
    }
    
    // Handle received date toggle and value
    if (toggleReceivedDate.checked) {
        if (!lockReceivedDateCheckbox.checked || !receivedDateInput.value) {
            setDefaultReceivedDate();
        }
    } else {
        receivedDateInput.value = '';
    }
    
    productInput.value = '';
    cartonsInput.value = '';
    cartonsInput.dataset.loosePieces = '0';
    packSizeInput.value = '';
    batchInput.value = '';
    expiryInput.value = '';
    retailPriceInput.value = '';
    
    // Reset manual loose quantity with slide-out animation
    manualLooseToggle.checked = false;
    looseQtyContainer.classList.remove('slide-in');
    looseQtyContainer.classList.add('slide-out');
    setTimeout(() => {
        looseQtyContainer.classList.add('hidden');
        looseQtyContainer.classList.remove('slide-out');
        looseQtyInput.value = '';
    }, 200);
    
    // If company is locked, focus on product for next entry
    if (lockCompanyCheckbox.checked) {
        productInput.focus();
    }
}

// Edit label - populate form with existing label data
function editLabel(index) {
    const label = labelsData[index];
    if (!label) return;
    
    // Set edit mode
    editModeIndex = index;
    
    // Populate form
    companyInput.value = label.company_name;
    updateProductList(label.company_name);
    productInput.value = label.product_name;
    productInput.disabled = false;
    
    // Handle received date toggle
    if (label.received_date && label.received_date.trim() !== '') {
        toggleReceivedDate.checked = true;
        receivedDateSection.classList.remove('hidden');
        lockReceivedDateLabel.classList.remove('hidden');
        row1Container.classList.remove('md:grid-cols-2');
        row1Container.classList.add('md:grid-cols-3');
        receivedDateInput.value = label.received_date;
    } else {
        toggleReceivedDate.checked = false;
        receivedDateSection.classList.add('hidden');
        lockReceivedDateLabel.classList.add('hidden');
        row1Container.classList.remove('md:grid-cols-3');
        row1Container.classList.add('md:grid-cols-2');
        receivedDateInput.value = '';
    }
    cartonsInput.value = label.cartons;
    packSizeInput.value = label.pack_size;
    batchInput.value = label.batch;
    expiryInput.value = label.expiry;
    retailPriceInput.value = label.price;
    
    // Handle loose pieces
    if (label.loose_pieces > 0) {
        cartonsInput.dataset.loosePieces = label.loose_pieces.toString();
        // Enable manual loose toggle and set value
        manualLooseToggle.checked = true;
        looseQtyContainer.classList.remove('hidden');
        looseQtyInput.value = label.loose_pieces;
    } else {
        cartonsInput.dataset.loosePieces = '0';
        manualLooseToggle.checked = false;
        looseQtyContainer.classList.add('hidden');
        looseQtyInput.value = '';
    }
    
    // Update submit button text and add cancel button
    updateEditModeUI();
    
    // Scroll to form
    labelForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Focus on product field
    productInput.focus();
    
    showToast('Editing label #' + (index + 1), 'warning');
}

// Cancel edit mode
function cancelEdit() {
    editModeIndex = -1;
    clearForm();
    updateEditModeUI();
}

// Update UI based on edit mode
function updateEditModeUI() {
    const submitBtn = labelForm.querySelector('button[type="submit"]');
    const cancelBtn = document.getElementById('cancelEditBtn');
    
    if (editModeIndex >= 0) {
        // Edit mode
        submitBtn.textContent = 'Update Label';
        submitBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        submitBtn.classList.add('bg-amber-600', 'hover:bg-amber-700');
        
        // Show cancel button if it exists, or create it
        if (!cancelBtn) {
            const newCancelBtn = document.createElement('button');
            newCancelBtn.type = 'button';
            newCancelBtn.id = 'cancelEditBtn';
            newCancelBtn.textContent = 'Cancel';
            newCancelBtn.className = 'flex-1 bg-gray-500 text-white py-1.5 px-3 rounded-md text-sm font-medium hover:bg-gray-600 transition';
            newCancelBtn.onclick = cancelEdit;
            submitBtn.parentNode.insertBefore(newCancelBtn, submitBtn.nextSibling);
        } else {
            cancelBtn.classList.remove('hidden');
        }
    } else {
        // Add mode
        submitBtn.textContent = 'Add';
        submitBtn.classList.remove('bg-amber-600', 'hover:bg-amber-700');
        submitBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        
        // Hide cancel button
        if (cancelBtn) {
            cancelBtn.classList.add('hidden');
        }
    }
}

// Update UI
function updateUI() {
    // Update count
    labelCount.textContent = labelsData.length;
    
    // Show/hide clear all
    clearAllBtn.classList.toggle('hidden', labelsData.length === 0);
    
    // Enable/disable generate buttons
    generatePdfBtn.disabled = labelsData.length === 0;
    generateExcelBtn.disabled = labelsData.length === 0;
    if (saveLabelsBtn) {
        saveLabelsBtn.disabled = labelsData.length === 0;
        debugLog('Save button state', { disabled: saveLabelsBtn.disabled, labelCount: labelsData.length });
    } else {
        debugLog('WARNING: saveLabelsBtn not found in DOM');
    }
    
    // Update label list
    if (labelsData.length === 0) {
        labelList.innerHTML = '<p class="text-gray-400 text-center py-8">No labels added yet</p>';
    } else {
        labelList.innerHTML = labelsData.map((label, index) => {
            const { name, strength } = splitProductStrength(label.product_name);
            const qtyDisplay = formatQuantity(label);
            const isEditing = editModeIndex === index;
            return `
                <div class="label-card bg-gray-50 p-3 rounded border relative hover:bg-gray-100 transition-colors cursor-pointer ${isEditing ? 'editing' : ''}" onclick="if(event.target.tagName !== 'BUTTON') editLabel(${index})">
                    <button onclick="event.stopPropagation(); deleteLabel(${index})" class="delete-btn absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm z-10">
                        ×
                    </button>
                    <button onclick="event.stopPropagation(); editLabel(${index})" class="edit-btn absolute top-2 right-8 text-blue-500 hover:text-blue-700 text-xs z-10" title="Edit">
                        ✎
                    </button>
                    <div class="text-sm font-medium text-gray-800 truncate pr-16">${escapeHtml(label.company_name)}</div>
                    <div class="text-sm text-gray-700 truncate">${escapeHtml(name)} ${strength ? `<span class="text-gray-500">${escapeHtml(strength)}</span>` : ''}</div>
                    <div class="text-xs text-gray-500 mt-1">
                        ${label.received_date ? escapeHtml(label.received_date) + ' • ' : ''}${qtyDisplay} • B=${escapeHtml(label.batch)}
                    </div>
                    <div class="text-xs mt-1">
                        <span class="text-red-600">${escapeHtml(label.expiry)}</span>
                        <span class="text-blue-600 ml-2">R.P=${label.price.toFixed(2)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Update preview grid
    updatePreviewGrid();
}

// Delete label
function deleteLabel(index) {
    labelsData.splice(index, 1);
    updateUI();
    showToast('Label deleted');
}

// Update preview grid - show all labels in scrollable area
function updatePreviewGrid() {
    previewGrid.innerHTML = '';
    
    if (labelsData.length === 0) {
        // Show empty placeholder
        for (let i = 0; i < LABELS_PER_PAGE; i++) {
            const div = document.createElement('div');
            div.className = 'preview-label empty';
            div.textContent = '-';
            previewGrid.appendChild(div);
        }
        return;
    }
    
    // Show all labels (paginated view)
    const totalToShow = Math.max(labelsData.length, LABELS_PER_PAGE);
    for (let i = 0; i < totalToShow; i++) {
        const label = labelsData[i];
        
        if (label) {
            const { name, strength } = splitProductStrength(label.product_name);
            const qtyDisplay = formatQuantity(label);
            const div = document.createElement('div');
            div.className = 'preview-label p-2';
            div.innerHTML = `
                <div class="product-name truncate">${escapeHtml(name)}</div>
                ${strength ? `<div class="strength">${escapeHtml(strength)}</div>` : '<div>&nbsp;</div>'}
                ${label.received_date ? `<div class="date">(${escapeHtml(label.received_date)})</div>` : '<div>&nbsp;</div>'}
                <div>&nbsp;</div>
                <div class="quantity">${qtyDisplay}</div>
                <div class="batch">B=${escapeHtml(label.batch)}</div>
                <div class="expiry">${escapeHtml(label.expiry)}</div>
                <div class="price">R.P=${label.price.toFixed(2)}</div>
            `;
            previewGrid.appendChild(div);
        } else {
            const div = document.createElement('div');
            div.className = 'preview-label empty';
            div.textContent = '';
            previewGrid.appendChild(div);
        }
    }
}

// Generate PDF
function generatePDF() {
    if (labelsData.length === 0) return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = 210;
    const pageHeight = 297;
    
    const boxWidth = 60;
    const boxHeight = 45;
    const marginX = 10;
    const marginY = 15;
    const colGap = 5;
    const rowGap = 5;
    
    labelsData.forEach((label, i) => {
        const pageIndex = i % LABELS_PER_PAGE;
        const row = Math.floor(pageIndex / LABELS_PER_ROW);
        const col = pageIndex % LABELS_PER_ROW;
        
        const x = marginX + col * (boxWidth + colGap);
        const y = marginY + row * (boxHeight + rowGap);
        
        // Draw box
        doc.rect(x, y, boxWidth, boxHeight);
        
        // Draw text
        const { name, strength } = splitProductStrength(label.product_name);
        const textX = x + 2;
        let textY = y + 5;
        
        // Wrap product name
        const wrappedName = wrapText(doc, name, boxWidth - 4, 12);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        wrappedName.forEach(line => {
            doc.text(line, textX, textY);
            textY += 5;
        });
        
        if (strength) {
            doc.text(strength, textX, textY);
            textY += 5;
        } else {
            textY += 5;
        }
        
        if (label.received_date) {
            doc.text(`(${label.received_date})`, textX, textY);
            textY += 5;
        }
        textY += 3; // Empty line
        
        const qtyDisplay = formatQuantity(label);
        doc.text(qtyDisplay, textX, textY);
        textY += 5;
        
        doc.text(`B=${label.batch}`, textX, textY);
        textY += 5;
        
        doc.text(label.expiry, textX, textY);
        textY += 5;
        
        doc.text(`R.P=${label.price.toFixed(2)}`, textX, textY);
        
        // New page if needed
        if (pageIndex === LABELS_PER_PAGE - 1 && i !== labelsData.length - 1) {
            doc.addPage();
        }
    });
    
    doc.save('labels.pdf');
    clearAutoSave();
    showToast('PDF generated successfully');
}

// Wrap text for PDF
function wrapText(doc, text, maxWidth, fontSize) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    doc.setFontSize(fontSize);
    
    for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const width = doc.getTextWidth(testLine);
        
        if (width <= maxWidth) {
            currentLine = testLine;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    }
    
    if (currentLine) lines.push(currentLine);
    
    return lines.length > 0 ? lines : [text];
}

// Format quantity display
function formatQuantity(label) {
    const hasCartons = label.cartons > 0;
    const hasLoose = label.loose_pieces > 0;
    
    if (hasCartons && hasLoose) {
        return `Q=${label.cartons}x${label.pack_size}, ${label.loose_pieces} LOOSE`;
    } else if (hasCartons && !hasLoose) {
        return `Q=${label.cartons}x${label.pack_size}`;
    } else if (!hasCartons && hasLoose) {
        return `Q=${label.loose_pieces} LOOSE`;
    }
    return 'Q=0';
}

// Generate Excel
function generateExcel() {
    if (labelsData.length === 0) return;
    
    const wb = XLSX.utils.book_new();
    
    const labelColSpan = 6;
    const labelRowSpan = 8;
    const colGap = 1;
    const rowGap = 1;
    const totalCols = LABELS_PER_ROW * labelColSpan + (LABELS_PER_ROW - 1) * colGap;
    const totalRowsPerPage = LABEL_ROWS_PER_PAGE * (labelRowSpan + rowGap);
    
    // Group labels by sheet
    const sheets = [];
    let currentSheetLabels = [];
    
    labelsData.forEach((label, i) => {
        currentSheetLabels.push({ label, index: i });
        if (currentSheetLabels.length === LABELS_PER_PAGE || i === labelsData.length - 1) {
            sheets.push([...currentSheetLabels]);
            currentSheetLabels = [];
        }
    });
    
    // Create each sheet
    sheets.forEach((sheetLabels, sheetIdx) => {
        // Create empty 2D array for sheet data
        const sheetData = [];
        for (let r = 0; r < totalRowsPerPage; r++) {
            sheetData[r] = new Array(totalCols).fill('');
        }
        
        // Populate labels
        sheetLabels.forEach(({ label }, idx) => {
            const pageIndex = idx;
            const row = Math.floor(pageIndex / LABELS_PER_ROW);
            const col = pageIndex % LABELS_PER_ROW;
            
            const startRow = row * (labelRowSpan + rowGap);
            const startCol = col * (labelColSpan + colGap);
            
            const { name, strength } = splitProductStrength(label.product_name);
            const qtyDisplay = formatQuantity(label);
            
            const lines = [
                name,
                strength,
                label.received_date ? `(${label.received_date})` : '',
                '',
                qtyDisplay,
                `B=${label.batch}`,
                label.expiry,
                `R.P=${label.price.toFixed(2)}`
            ];
            
            // Write lines to cells
            for (let lineIdx = 0; lineIdx < labelRowSpan; lineIdx++) {
                sheetData[startRow + lineIdx][startCol] = lines[lineIdx] || '';
            }
        });
        
        // Convert to worksheet
        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        
        // Set column widths
        ws['!cols'] = Array(totalCols).fill({ wch: 4.2 });
        
        // Add merges for each label line
        const merges = [];
        sheetLabels.forEach((_, idx) => {
            const pageIndex = idx;
            const row = Math.floor(pageIndex / LABELS_PER_ROW);
            const col = pageIndex % LABELS_PER_ROW;
            const startRow = row * (labelRowSpan + rowGap);
            const startCol = col * (labelColSpan + colGap);
            
            for (let lineIdx = 0; lineIdx < labelRowSpan; lineIdx++) {
                merges.push({
                    s: { r: startRow + lineIdx, c: startCol },
                    e: { r: startRow + lineIdx, c: startCol + labelColSpan - 1 }
                });
            }
        });
        ws['!merges'] = merges;
        
        XLSX.utils.book_append_sheet(wb, ws, `Labels ${sheetIdx + 1}`);
    });
    
    XLSX.writeFile(wb, 'labels.xlsx');
    clearAutoSave();
    showToast('Excel generated successfully');
}

// Import Companies
async function importCompanies(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            
            let companiesList = [];
            
            // Try to find company column
            const headers = jsonData[0] || [];
            let colIndex = 0;
            
            const companyKeywords = ['company', 'company name', 'company_name'];
            for (let i = 0; i < headers.length; i++) {
                const header = String(headers[i]).toLowerCase();
                if (companyKeywords.some(kw => header.includes(kw))) {
                    colIndex = i;
                    break;
                }
            }
            
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                const company = String(row[colIndex] || '').trim();
                if (company) {
                    companiesList.push(company);
                }
            }
            
            if (companiesList.length === 0) {
                showToast('No companies found in file - check column headers', 'warning');
                return;
            }
            
            if (STORAGE_MODE === 'supabase' && isSupabaseReady()) {
                // Batch import to Supabase
                try {
                    console.log('Importing companies to Supabase:', companiesList);
                    const added = await importCompaniesToSupabase(companiesList);
                    await loadFromSupabase();
                    showToast(`${added} companies imported to Supabase (${companiesList.length} total found)`);
                } catch (error) {
                    showToast('Failed to import companies - ' + error.message, 'error');
                }
            } else if (STORAGE_MODE === 'api') {
                // Batch import via API
                try {
                    console.log('Importing companies:', companiesList);
                    const result = await apiRequest('/companies/batch', {
                        method: 'POST',
                        body: JSON.stringify({ companies: companiesList })
                    });
                    console.log('Import result:', result);
                    await loadFromAPI();
                    showToast(`${result.added} companies imported to database (${companiesList.length} total found)`);
                } catch (error) {
                    showToast('Failed to import companies - check server connection', 'error');
                }
            } else {
                // LocalStorage import
                companiesList.forEach(company => {
                    if (!companies.includes(company)) {
                        companies.push(company);
                    }
                });
                companies.sort();
                saveToStorage();
                updateCompanyList();
                showToast(`${companiesList.length} companies imported`);
            }
        } catch (err) {
            showToast('Error importing file: ' + err.message, 'error');
        }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
}

// Import Products
async function importProducts(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            
            let productsList = [];
            
            // Try to find columns
            const headers = jsonData[0] || [];
            let companyCol = 0;
            let productCol = 1;
            
            for (let i = 0; i < headers.length; i++) {
                const header = String(headers[i]).toLowerCase();
                if (header.includes('company')) companyCol = i;
                if (header.includes('product')) productCol = i;
            }
            
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                const company = String(row[companyCol] || '').trim();
                const product = String(row[productCol] || '').trim();
                if (company || product) {
                    productsList.push({ company_name: company, product_name: product });
                }
            }
            
            if (STORAGE_MODE === 'supabase' && isSupabaseReady()) {
                // Batch import to Supabase
                try {
                    const added = await importProductsToSupabase(productsList);
                    await loadFromSupabase();
                    showToast(`${added} products imported to Supabase`);
                } catch (error) {
                    showToast('Failed to import products - ' + error.message, 'error');
                }
            } else if (STORAGE_MODE === 'api') {
                // Batch import via API
                const result = await apiRequest('/products/batch', {
                    method: 'POST',
                    body: JSON.stringify({ products: productsList })
                });
                await loadFromAPI();
                showToast(`${result.added} products imported to database`);
            } else {
                // LocalStorage import
                productsList.forEach(item => {
                    const company = item.company_name;
                    const product = item.product_name;
                    if (!companies.includes(company)) {
                        companies.push(company);
                    }
                    if (!products[company]) {
                        products[company] = [];
                    }
                    if (!products[company].includes(product)) {
                        products[company].push(product);
                    }
                });
                companies.sort();
                saveToStorage();
                updateCompanyList();
                showToast(`${productsList.length} products imported`);
            }
        } catch (err) {
            showToast('Error importing file: ' + err.message, 'error');
        }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
}

// ============ SAVE/LOAD & AUTO-SAVE FUNCTIONS ============

// Auto-save labels to localStorage
function autoSaveLabels() {
    try {
        const data = {
            labels: labelsData,
            timestamp: new Date().toISOString(),
            count: labelsData.length
        };
        localStorage.setItem('lg_labels_autosave', JSON.stringify(data));
        debugLog('Auto-saved labels', { count: labelsData.length });
    } catch (error) {
        debugLog('Auto-save failed', error.message);
        console.error('Auto-save error:', error);
    }
}

// Restore auto-saved labels on startup
function restoreAutoSave() {
    try {
        const saved = localStorage.getItem('lg_labels_autosave');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.labels && data.labels.length > 0) {
                debugLog('Found auto-saved labels', { count: data.labels.length, timestamp: data.timestamp });
                return data.labels;
            }
        }
    } catch (error) {
        debugLog('Restore auto-save failed', error.message);
    }
    return null;
}

// Save labels to JSON file
function saveLabelsToFile() {
    if (labelsData.length === 0) {
        showToast('No labels to save', 'warning');
        return;
    }
    
    try {
        const data = {
            labels: labelsData,
            saved_at: new Date().toISOString(),
            count: labelsData.length,
            version: '1.0'
        };
        
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `labels_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        debugLog('Labels saved to file', { count: labelsData.length });
        showToast(`${labelsData.length} labels saved to file`, 'success');
    } catch (error) {
        debugLog('Save to file failed', error.message);
        showToast('Error saving labels: ' + error.message, 'error');
    }
}

// Load labels from JSON file
function loadLabelsFromFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    debugLog('Loading labels from file', file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            
            if (!data.labels || !Array.isArray(data.labels)) {
                throw new Error('Invalid file format: labels array not found');
            }
            
            // Confirm if there are existing labels
            if (labelsData.length > 0) {
                if (!confirm(`You have ${labelsData.length} labels. Replace with ${data.labels.length} labels from file?\n\nClick OK to replace, Cancel to append.`)) {
                    // Append mode
                    labelsData = [...labelsData, ...data.labels];
                    showToast(`Appended ${data.labels.length} labels. Total: ${labelsData.length}`, 'success');
                } else {
                    // Replace mode
                    labelsData = data.labels;
                    showToast(`Loaded ${data.labels.length} labels from file`, 'success');
                }
            } else {
                labelsData = data.labels;
                showToast(`Loaded ${data.labels.length} labels from file`, 'success');
            }
            
            debugLog('Labels loaded from file', { count: labelsData.length, saved_at: data.saved_at });
            
            // Auto-save the loaded data
            autoSaveLabels();
            
            // Update UI
            updateUI();
        } catch (error) {
            debugLog('Load from file failed', error.message);
            showToast('Error loading labels: ' + error.message, 'error');
        }
    };
    reader.onerror = () => {
        showToast('Error reading file', 'error');
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset for next use
}

// Clear auto-save (call when PDF/Excel is generated successfully)
function clearAutoSave() {
    localStorage.removeItem('lg_labels_autosave');
    debugLog('Auto-save cleared');
}

// Check for auto-save on startup and prompt user
function checkAutoSaveOnStartup() {
    const saved = localStorage.getItem('lg_labels_autosave');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.labels && data.labels.length > 0) {
                const savedTime = new Date(data.timestamp).toLocaleString();
                if (confirm(`Found ${data.labels.length} auto-saved labels from ${savedTime}.\n\nWould you like to restore them?`)) {
                    labelsData = data.labels;
                    updateUI();
                    showToast(`Restored ${data.labels.length} labels`, 'success');
                }
            }
        } catch (error) {
            console.error('Error checking auto-save:', error);
        }
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
