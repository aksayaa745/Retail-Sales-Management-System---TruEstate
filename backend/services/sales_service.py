from utils.data_loader import load_data
from math import ceil

SALES_DATA = load_data()

def sort_data(data, key, order):
    try:
        return sorted(data, key=lambda x: x.get(key) or "", reverse=(order == "desc"))
    except Exception:
        return data

def fetch_sales(page=1, pageSize=10, sortBy="customerName", sortOrder="asc"):
    data = SALES_DATA.copy()
    data = sort_data(data, sortBy, sortOrder)
    total = len(data)
    start = (page - 1) * pageSize
    end = start + pageSize
    page_items = data[start:end]
    return {
        "data": page_items,
        "page": page,
        "pageSize": pageSize,
        "total": total,
        "totalPages": ceil(total / pageSize)
    }
