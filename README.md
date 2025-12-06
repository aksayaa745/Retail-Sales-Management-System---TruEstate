# Retail Sales Management System

## 1. Overview 
The Retail Sales Management System is a full-stack application designed for efficient exploration of structured retail sales data.  
It provides advanced search, filtering, sorting, and pagination functionalities processed on the backend for accuracy and performance.  
The frontend mirrors the provided Figma UI layout, ensuring a clean, professional, and consistent user experience.  
This system demonstrates modular architecture, clarity in design, and production-oriented engineering principles.


## 2. Tech Stack
- **Backend:** Node.js, Express, CSV Parser  
- **Frontend:** React (Vite), Vanilla CSS  
- **Data Source:** CSV dataset (`sales_data.csv`)  
- **Tools:** Nodemon, Vite  


## 3. Search Implementation Summary
Search functionality supports case-insensitive matching on customer name and phone number.  
The backend processes the `search` parameter first and filters the dataset before applying sorting or pagination.  
This ensures the result set is always accurate and reflects the intended search context.


## 4. Filter Implementation Summary
The system supports filtering by:  
- Customer Region  
- Gender  
- Age Range  
- Product Category  
- Payment Method  
- Date Range  

Each filter is parsed from query parameters and applied sequentially on the dataset.  
Filters can be used individually or combined for complex multi-criteria queries.


## 5. Sorting Implementation Summary
Sorting is handled on the backend using `sortBy` and `sortOrder` parameters.  
Supported fields include:  
- **Date**  
- **Quantity**  
- **Customer Name**  

Sorting is applied after search and filtering to maintain accurate ordering before pagination is executed.


## 6. Pagination Implementation Summary
Pagination is implemented using `page` and `pageSize` parameters.  
The backend returns a structured `meta` object containing:  
- `totalItems`  
- `totalPages`  
- `currentPage`  
- `pageSize`  

The frontend displays numbered pagination buttons according to the Figma design, enabling smooth navigation across pages.


## 7. Setup Instructions
### Backend Setup
```bash
cd backend
npm install

### Frontend Setup
cd frontend
npm install
npm run dev