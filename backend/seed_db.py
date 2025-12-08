import csv
import os
import random
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, Sale

# Create tables
Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(Sale).first():
        print("Data already exists in the database. Skipping seed.")
        db.close()
        return

    csv_file_path = os.path.join("data", "sales_data.csv")
    
    if not os.path.exists(csv_file_path):
        print(f"CSV file not found at {csv_file_path}")
        return

    print("Seeding data from CSV...")
    
    with open(csv_file_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        sales_to_add = []
        
        possible_tags = ["new", "promo", "popular", "clearance", "seasonal"]
        
        count = 0
        MAX_ROWS = 1000 # Limit for assignment/demo purposes to ensure quick startup

        for row in reader:
            if count >= MAX_ROWS:
                break
            
            # Generate random tags for demonstration since they aren't in CSV
            num_tags = random.randint(0, 2)
            tags_list = random.sample(possible_tags, num_tags)
            tags_str = ",".join(tags_list)

            sale = Sale(
                date=row.get("Date", ""),
                customer_id=row.get("Customer ID", ""),
                customer_name=row.get("Customer Name", ""),
                phone_number=row.get("Phone Number", ""),
                gender=row.get("Gender", ""),
                age=row.get("Age", "0"),
                region=row.get("Customer Region", ""),
                product_category=row.get("Product Category", ""),
                quantity=int(row.get("Quantity", 0) or 0),
                final_amount=float(row.get("Final Amount", 0) or 0),
                payment_method=row.get("Payment Method", ""),
                tags=tags_str
            )
            sales_to_add.append(sale)
            count += 1
        
        db.add_all(sales_to_add)
        db.commit()
        print(f"Successfully seeded {len(sales_to_add)} records from CSV (limited to {MAX_ROWS}).")
    
    db.close()

if __name__ == "__main__":
    seed_data()
