# Retail Sales Management System – Architecture

This document describes the architecture of the Retail Sales Management System, covering backend design, frontend design, data flow, folder structure, and module-level responsibilities.

---

## 1. High-Level Overview

The system is a **full-stack web application** for viewing and exploring retail sales transactions with:

- Search
- Multi-criteria filtering
- Sorting
- Server-side pagination

**Tech stack**

- **Backend:** Node.js, Express, CSV parsing
- **Frontend:** React (Vite), vanilla CSS
- **Data source:** Sales dataset loaded from a CSV file into memory at server startup

---

## 2. Backend Architecture

### 2.1 Overview

The backend exposes a REST API that:

- Loads the sales dataset from `backend/data/sales_data.csv`
- Normalizes and stores it in memory (for this assignment)
- Applies **search, filtering, sorting, and pagination** on the server
- Returns a consistent, typed JSON response

Main responsibilities:

- Parse CSV once at startup
- Validate and transform query parameters
- Apply business logic in a separate service layer
- Keep controllers/routes thin and focused on HTTP concerns

### 2.2 Layers

1. **Entry Point (`src/index.js`)**
   - Creates and configures the Express app
   - Loads the dataset using a utility loader
   - Registers routes
   - Starts the HTTP server (default `http://localhost:4000`)

2. **Routes (`src/routes/`)**
   - Define URL endpoints and map them to controllers
   - Example:
     - `GET /api/health` – health check
     - `GET /api/sales` – main endpoint for transactions

3. **Controllers (`src/controllers/`)**
   - Extract query parameters from the request
   - Call the appropriate service functions
   - Shape the response into `{ data, meta }`
   - Handle errors and send proper HTTP status codes

4. **Services (`src/services/`)**
   - Contain the business logic:
     - Search by name / phone
     - Filtering by region, gender, age, category, payment method, date range
     - Sorting by date, quantity, customer name
     - Pagination (page + pageSize)
   - Operate on the in-memory dataset and return filtered arrays and metadata

5. **Utils (`src/utils/`)**
   - Helper functions such as:
     - CSV loading and parsing
     - Parsing and validating numeric and date query params
     - Normalizing field names if required

### 2.3 Main Endpoint Contract

`GET /api/sales`

**Query parameters supported:**

- `search`
- `regions`
- `genders`
- `ageMin`, `ageMax`
- `categories`
- `paymentMethods`
- `dateFrom`, `dateTo`
- `sortBy` (`date`, `quantity`, `customerName`)
- `sortOrder` (`asc`, `desc`)
- `page`, `pageSize`

**Response structure:**

```json
{
  "data": [ /* array of sales rows */ ],
  "meta": {
    "totalItems": number,
    "totalPages": number,
    "currentPage": number,
    "pageSize": number
  }
}
