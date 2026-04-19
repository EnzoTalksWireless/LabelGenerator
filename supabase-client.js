// Supabase Client for Label Generator
// Replace with your actual Supabase credentials when ready

const SUPABASE_URL = 'https://lcnmovmnbztwisrncywj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjbm1vdm1uYnp0d2lzcm5jeXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzg5MDMsImV4cCI6MjA5MTc1NDkwM30.F2d1WZ7qEGEcaN86LCbW6ZtbomuJ3DEI5CPp7UswJ6Q';

let supabaseClient = null;

// Initialize Supabase client
function initSupabase() {
    if (typeof supabase === 'undefined') {
        console.error('Supabase library not loaded. Add:<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
        return null;
    }
    
    if (!SUPABASE_URL.includes('your-project')) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Supabase client initialized');
    } else {
        console.warn('Supabase not configured. Update SUPABASE_URL and SUPABASE_KEY in supabase-client.js');
    }
    
    return supabaseClient;
}

// Check if Supabase is available
function isSupabaseReady() {
    return supabaseClient !== null;
}

// Load all data from Supabase (companies and products)
async function loadFromSupabase() {
    if (!isSupabaseReady()) throw new Error('Supabase not initialized');
    
    console.log('Loading data from Supabase...');
    
    // Load companies and products in parallel
    const [companiesData, productsData] = await Promise.all([
        supabaseClient
            .from('companies')
            .select('company_name')
            .order('company_name'),
        supabaseClient
            .from('products')
            .select('company_name, product_name')
            .order('company_name, product_name')
    ]);
    
    if (companiesData.error) throw companiesData.error;
    if (productsData.error) throw productsData.error;
    
    // Convert to app format
    const companies = companiesData.data.map(c => c.company_name);
    
    const products = {};
    productsData.data.forEach(p => {
        if (!products[p.company_name]) {
            products[p.company_name] = [];
        }
        products[p.company_name].push(p.product_name);
    });
    
    console.log(`Loaded ${companies.length} companies and ${productsData.data.length} products from Supabase`);
    
    // Update global app state (these variables exist in app.js)
    if (typeof window.companies !== 'undefined') {
        window.companies = companies;
    }
    if (typeof window.products !== 'undefined') {
        window.products = products;
    }
    
    return { companies, products };
}

// Load companies from Supabase
async function loadCompaniesFromSupabase() {
    if (!isSupabaseReady()) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabaseClient
        .from('companies')
        .select('company_name')
        .order('company_name');
    
    if (error) throw error;
    return data.map(c => c.company_name);
}

// Load products from Supabase
async function loadProductsFromSupabase() {
    if (!isSupabaseReady()) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabaseClient
        .from('products')
        .select('company_name, product_name')
        .order('company_name, product_name');
    
    if (error) throw error;
    
    // Convert to app format: { companyName: [products] }
    const products = {};
    data.forEach(p => {
        if (!products[p.company_name]) {
            products[p.company_name] = [];
        }
        products[p.company_name].push(p.product_name);
    });
    
    return products;
}

// Add company to Supabase (uses upsert to avoid conflicts)
async function addCompanyToSupabase(companyName) {
    if (!isSupabaseReady()) throw new Error('Supabase not initialized');
    if (!companyName) return false;

    const { error } = await supabaseClient
        .from('companies')
        .upsert([{ company_name: companyName }], { onConflict: 'company_name' });

    if (error) {
        console.error('Error adding company:', error);
        return false;
    }

    return true;
}

// Add product to Supabase (uses upsert to avoid conflicts)
async function addProductToSupabase(companyName, productName) {
    if (!isSupabaseReady()) throw new Error('Supabase not initialized');
    if (!companyName || !productName) return false;

    const { error } = await supabaseClient
        .from('products')
        .upsert([{
            company_name: companyName,
            product_name: productName
        }], { onConflict: ['company_name', 'product_name'] });

    if (error) {
        console.error('Error adding product:', error);
        return false;
    }

    return true;
}

// Batch import companies
async function importCompaniesToSupabase(companiesList) {
    if (!isSupabaseReady()) throw new Error('Supabase not initialized');
    if (!companiesList || companiesList.length === 0) return 0;
    
    const data = companiesList
        .filter(name => name && name.trim())
        .map(name => ({ company_name: name.trim() }));
    
    const { error } = await supabaseClient
        .from('companies')
        .upsert(data, { onConflict: 'company_name' });
    
    if (error) {
        console.error('Error importing companies:', error);
        throw error;
    }
    
    return data.length;
}

// Batch import products
async function importProductsToSupabase(productsList) {
    if (!isSupabaseReady()) throw new Error('Supabase not initialized');
    if (!productsList || productsList.length === 0) return 0;
    
    const data = productsList
        .filter(p => p.company_name && p.product_name)
        .map(p => ({
            company_name: p.company_name.trim(),
            product_name: p.product_name.trim()
        }));
    
    const { error } = await supabaseClient
        .from('products')
        .upsert(data, { 
            onConflict: ['company_name', 'product_name']
        });
    
    if (error) {
        console.error('Error importing products:', error);
        throw error;
    }
    
    return data.length;
}

// Migrate from localStorage to Supabase
async function migrateLocalStorageToSupabase() {
    if (!isSupabaseReady()) {
        throw new Error('Supabase not initialized. Cannot migrate.');
    }
    
    console.log('Starting migration from localStorage to Supabase...');
    
    // Get localStorage data
    const storedCompanies = localStorage.getItem('lg_companies');
    const storedProducts = localStorage.getItem('lg_products');
    
    const companies = storedCompanies ? JSON.parse(storedCompanies) : [];
    const products = storedProducts ? JSON.parse(storedProducts) : {};
    
    console.log(`Found ${companies.length} companies and ${Object.keys(products).length} company product lists`);
    
    // Migrate companies
    if (companies.length > 0) {
        console.log('Migrating companies...');
        await importCompaniesToSupabase(companies);
    }
    
    // Migrate products
    const productList = [];
    Object.entries(products).forEach(([company, prods]) => {
        prods.forEach(p => {
            productList.push({ company_name: company, product_name: p });
        });
    });
    
    if (productList.length > 0) {
        console.log(`Migrating ${productList.length} products...`);
        await importProductsToSupabase(productList);
    }
    
    console.log('Migration complete!');
    return {
        companies: companies.length,
        products: productList.length
    };
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.initSupabase = initSupabase;
    window.isSupabaseReady = isSupabaseReady;
    window.loadFromSupabase = loadFromSupabase;
    window.loadCompaniesFromSupabase = loadCompaniesFromSupabase;
    window.loadProductsFromSupabase = loadProductsFromSupabase;
    window.addCompanyToSupabase = addCompanyToSupabase;
    window.addProductToSupabase = addProductToSupabase;
    window.importCompaniesToSupabase = importCompaniesToSupabase;
    window.importProductsToSupabase = importProductsToSupabase;
    window.migrateLocalStorageToSupabase = migrateLocalStorageToSupabase;
}
