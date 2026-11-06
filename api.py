"""
Label Generator API - Flask backend with SQLite
Equivalent to the original desktop app's database
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'label_master.db')

def init_database():
    """Initialize SQLite database with companies and products tables"""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS companies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_name TEXT UNIQUE NOT NULL
        )
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_name TEXT NOT NULL,
            product_name TEXT NOT NULL,
            UNIQUE(company_name, product_name)
        )
    """)
    
    conn.commit()
    conn.close()

# Initialize on startup
init_database()

# ============ COMPANIES API ============

@app.route('/api/companies', methods=['GET'])
def get_companies():
    """Get all companies"""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT company_name FROM companies ORDER BY company_name")
    companies = [row[0] for row in cur.fetchall()]
    conn.close()
    return jsonify(companies)

@app.route('/api/companies', methods=['POST'])
def add_company():
    """Add a new company"""
    data = request.get_json()
    company_name = data.get('company_name', '').strip()
    
    if not company_name:
        return jsonify({'error': 'Company name required'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    try:
        cur.execute("INSERT OR IGNORE INTO companies (company_name) VALUES (?)", (company_name,))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Company added'})
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/companies/batch', methods=['POST'])
def add_companies_batch():
    """Add multiple companies from Excel import"""
    data = request.get_json()
    companies = data.get('companies', [])
    
    if not companies:
        return jsonify({'error': 'No companies provided'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    added = 0
    
    for company_name in companies:
        name = company_name.strip()
        if name:
            cur.execute("INSERT OR IGNORE INTO companies (company_name) VALUES (?)", (name,))
            if cur.rowcount > 0:
                added += 1
    
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'added': added})

# ============ PRODUCTS API ============

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products or filter by company"""
    company = request.args.get('company', '').strip()
    
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    if company:
        cur.execute(
            "SELECT product_name FROM products WHERE company_name = ? ORDER BY product_name",
            (company,)
        )
    else:
        cur.execute("SELECT DISTINCT product_name FROM products ORDER BY product_name")
    
    products = [row[0] for row in cur.fetchall()]
    conn.close()
    return jsonify(products)

@app.route('/api/products', methods=['POST'])
def add_product():
    """Add a new product"""
    data = request.get_json()
    company_name = data.get('company_name', '').strip()
    product_name = data.get('product_name', '').strip()
    
    if not company_name or not product_name:
        return jsonify({'error': 'Company and product name required'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    try:
        # Ensure company exists
        cur.execute("INSERT OR IGNORE INTO companies (company_name) VALUES (?)", (company_name,))
        # Add product
        cur.execute(
            "INSERT OR IGNORE INTO products (company_name, product_name) VALUES (?, ?)",
            (company_name, product_name)
        )
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Product added'})
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/batch', methods=['POST'])
def add_products_batch():
    """Add multiple products from Excel import"""
    data = request.get_json()
    products_list = data.get('products', [])  # List of {company_name, product_name}
    
    if not products_list:
        return jsonify({'error': 'No products provided'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    added = 0
    
    for item in products_list:
        company = item.get('company_name', '').strip()
        product = item.get('product_name', '').strip()
        
        if company and product:
            # Ensure company exists
            cur.execute("INSERT OR IGNORE INTO companies (company_name) VALUES (?)", (company,))
            # Add product
            cur.execute(
                "INSERT OR IGNORE INTO products (company_name, product_name) VALUES (?, ?)",
                (company, product)
            )
            if cur.rowcount > 0:
                added += 1
    
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'added': added})

# Get all products grouped by company (for frontend dropdown population)
@app.route('/api/products/all', methods=['GET'])
def get_all_products_by_company():
    """Get all products grouped by company"""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT company_name, product_name FROM products ORDER BY company_name, product_name")
    
    products = {}
    for row in cur.fetchall():
        company, product = row
        if company not in products:
            products[company] = []
        products[company].append(product)
    
    conn.close()
    return jsonify(products)

# ============ HEALTH CHECK ============

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'database': DB_PATH})

if __name__ == '__main__':
    print(f"Database location: {DB_PATH}")
    print("Starting Label Generator API server...")
    app.run(host='0.0.0.0', port=5000, debug=True)
