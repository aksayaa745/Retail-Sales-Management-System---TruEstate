import csv
from pathlib import Path

def load_data():
    data_file = Path(__file__).parent.parent / "data" / "sales_data.csv"
    rows = []
    if data_file.exists():
        with data_file.open(newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for r in reader:
                if "amount" in r and r["amount"] != "":
                    try: r["amount"] = float(r["amount"])
                    except: pass
                rows.append(r)
    return rows
