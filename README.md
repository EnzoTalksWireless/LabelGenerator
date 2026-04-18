# Label Generator Web App

A web-based warehouse stock label generator with SQLite database backend.

## Features

- **Company & Product Management** - SQLite database for persistent storage
- **Smart Autocomplete** - Company and product dropdowns with filtering
- **Loose Quantity Calculator** - Enter total quantity, auto-calculate cartons + loose
- **Retail Price Calculator** - Calculate retail from trade price (× 100/85)
- **Label Generation** - PDF and Excel output in A4 3x5 grid format
- **Excel Import** - Import companies and products from Excel files

## File Structure

```
web-app/
├── index.html      # Main web interface
├── app.js          # Frontend JavaScript
├── styles.css      # Styling
├── api.py          # Flask backend API
└── README.md       # This file
```

## Quick Start

### 1. Install Python Dependencies

```bash
cd web-app
pip install flask flask-cors openpyxl
```

### 2. Start the Backend Server

```bash
python api.py
```

Server will start on `http://localhost:5000`

The SQLite database (`label_master.db`) will be created automatically.

### 3. Serve the Frontend

In a new terminal window:

```bash
cd web-app
python -m http.server 8080
```

### 4. Open in Browser

Navigate to `http://localhost:8080`

## Configuration

### Switch Between API and LocalStorage

In `app.js`, change this line:

```javascript
const USE_API = true;   // Use SQLite database via API
const USE_API = false;  // Use browser localStorage instead
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/companies` | GET | List all companies |
| `/api/companies` | POST | Add single company |
| `/api/companies/batch` | POST | Add multiple companies |
| `/api/products` | GET | List products (optional ?company= filter) |
| `/api/products` | POST | Add single product |
| `/api/products/batch` | POST | Add multiple products |
| `/api/products/all` | GET | Get all products grouped by company |
| `/api/health` | GET | Health check |

## Import Guide

### How to Import Companies from Excel

**Excel File Format:**

The Excel file should have a column with one of these headers:
- `Company Name`
- `Company`
- `company_name`

**Example Excel Structure:**

| Company Name |
|--------------|
| ABC Pharma   |
| XYZ Medical  |
| Healthcare Co|

**Steps:**
1. Make sure Flask server is running (`python api.py`)
2. Click **"Import Companies"** button
3. Select your Excel file (.xlsx or .xls)
4. Check browser console (F12 → Console) for debug info

**If import shows "0 companies":**
- Check that your Excel has a header row
- Verify column name contains "Company" or "company"
- Check browser console for errors
- Ensure backend server is running on port 5000

### How to Import Products from Excel

**Excel File Format:**

| Company Name | Product Name      |
|--------------|-------------------|
| ABC Pharma   | Product A 500MG   |
| ABC Pharma   | Product B 250MG   |
| XYZ Medical  | Product C 100ML   |

Headers can be:
- Company columns: `Company`, `Company Name`, `company`
- Product columns: `Product`, `Product Name`, `product`

## Database Schema

**companies table:**
```sql
id INTEGER PRIMARY KEY
company_name TEXT UNIQUE
```

**products table:**
```sql
id INTEGER PRIMARY KEY
company_name TEXT
product_name TEXT
UNIQUE(company_name, product_name)
```

## Using the Calculators

### Loose Quantity Calculator

**Example:** Received 15,021 pieces, pack size is 60

1. Enter **Total Quantity:** `15021`
2. Enter **Pack Size:** `60`
3. Calculator shows: **250 cartons, 21 loose**
4. Click **"Apply to Form"** → Label shows: `Q=250x60, 21 LOOSE`

**For loose only:** Enter total quantity and click **"Loose Only"**

### Retail Price Calculator

**Example:** Trade price is 212.50

1. Enter **Trade Price:** `212.50`
2. Calculator shows: **Retail Price: 250.00**
3. Click **"Calculate & Apply"** → Retail Price field populated

## Quantity Display Formats

| Type | Input | Label Display |
|------|-------|---------------|
| Full cartons | 250 cartons, 0 loose | `Q=250x60` |
| Mixed | 250 cartons, 21 loose | `Q=250x60, 21 LOOSE` |
| Loose only | 0 cartons, 50 loose | `Q=50 LOOSE` |

## Troubleshooting

### "Database connection failed" error
- Make sure Flask server is running (`python api.py`)
- Check that port 5000 is not in use
- Verify `USE_API = true` in app.js

### CORS errors
- Flask-CORS is included in api.py
- Make sure you're accessing via `localhost`, not `file://`

### Port already in use
```bash
# Find and kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use different port in api.py:
app.run(host='0.0.0.0', port=5001, debug=True)
```
