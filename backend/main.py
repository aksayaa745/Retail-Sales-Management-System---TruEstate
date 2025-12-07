from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import register_routes

app = FastAPI(title="TruEstate API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://retail-sales-management-system-tru-eight.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_routes(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
