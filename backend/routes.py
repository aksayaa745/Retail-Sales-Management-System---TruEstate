from fastapi import APIRouter, Response, Query
from controllers.sales_controller import get_sales
from typing import List, Optional

router = APIRouter()

# ============================
# CORS PRE-FLIGHT (IMPORTANT)
# ============================
@router.options("/api/sales")
async def sales_options():
    return Response(status_code=200)

# ============================
# MAIN GET ENDPOINT
# ============================
@router.get("/api/sales")
async def sales_endpoint(
    page: int = 1,
    pageSize: int = 10,
    sortBy: str = "customerName",
    sortOrder: str = "asc",
    search: str = None,
    # Use Query(None) to allow multiple values for the same key, e.g. ?regions=North&regions=South
    # The frontend usually sends arrays this way or comma separated. 
    # FastAPI handles `?regions=North&regions=South` automatically into a list.
    # If the frontend sends `?regions=North,South`, we need to handle parsing inside controller or use a specific middleware.
    # Standard practice is either repeated keys or comma separation. 
    # Let's assume repetitive keys for cleaner FastAPI support, BUT I will parse commas just in case to be robust.
    regions: Optional[List[str]] = Query(None),
    genders: Optional[List[str]] = Query(None),
    paymentMethods: Optional[List[str]] = Query(None),
    categories: Optional[List[str]] = Query(None),
    tags: Optional[List[str]] = Query(None),
    dateRange: str = None,
):
    # Robustness: Check if list has single string with commas and split it
    # This handles both `?regions=North,South` and `?regions=North&regions=South`
    
    def normalize_list(l):
        if not l: return None
        new_l = []
        for item in l:
            if "," in item:
                new_l.extend(item.split(","))
            else:
                new_l.append(item)
        return new_l

    return await get_sales(
        page=page,
        pageSize=pageSize,
        sortBy=sortBy,
        sortOrder=sortOrder,
        search=search,
        regions=normalize_list(regions),
        genders=normalize_list(genders),
        paymentMethods=normalize_list(paymentMethods),
        categories=normalize_list(categories),
        tags=normalize_list(tags),
        dateRange=dateRange
    )
