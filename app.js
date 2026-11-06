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

// Validate critical elements exist
if (!companyInput) console.error('ERROR: Element #companyName not found in HTML');
if (!productInput) console.error('ERROR: Element #productName not found in HTML');

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
