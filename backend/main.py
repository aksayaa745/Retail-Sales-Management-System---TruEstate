from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
from database import engine, Base
import models # Import models so they are registered with Base

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Retail Sales Management System API")

# ========================================
# CORS CONFIGURATION
# ========================================

# IMPORTANT:
# Never include trailing slashes in origins
# Browser compares EXACT ORIGIN string.
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*", # Temporarily allow all for debugging failed fetch
    # Production URL (no trailing slash)
    "https://retail-sales-management-system-tru-estate-7oaaksdkb.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,     # only allow known origins
    allow_credentials=True,
    allow_methods=["*"],               # GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],               # allow all request headers
    expose_headers=["*"],              # allow frontend to read headers
)

# ========================================
# ROUTES
# ========================================
app.include_router(router)

# ========================================
# TEST ROUTE
# ========================================
@app.get("/ping")
async def ping():
    return {"message": "pong"}

if __name__ == "__main__":
    import uvicorn
    # Run seeding on startup just in case (safe due to check in seed_db)
    from seed_db import seed_data
    try:
        seed_data()
    except Exception as e:
        print(f"Seeding warning: {e}")
        
    uvicorn.run(app, host="0.0.0.0", port=4000)
