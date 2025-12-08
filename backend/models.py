from sqlalchemy import Column, Integer, String, Float, Date
from database import Base

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)  # Keeping as string for simplicity to match CSV, or convert to Date if needed
    customer_id = Column(String, index=True)
    customer_name = Column(String, index=True)
    phone_number = Column(String)
    gender = Column(String)
    age = Column(String) # CSV has it as string likely, or int
    region = Column(String, index=True)
    product_category = Column(String, index=True)
    quantity = Column(Integer)
    final_amount = Column(Float)
    payment_method = Column(String)
    tags = Column(String) # Store as comma-separated string if simple, or related table. Simplified as string for now.
