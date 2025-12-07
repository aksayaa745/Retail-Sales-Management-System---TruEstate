from services.sales_service import fetch_sales

async def get_sales(page: int, pageSize: int, sortBy: str, sortOrder: str):
    return fetch_sales(page=page, pageSize=pageSize, sortBy=sortBy, sortOrder=sortOrder)
