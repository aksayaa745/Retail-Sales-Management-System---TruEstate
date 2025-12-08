import requests
import time

BASE_URL = "http://localhost:4000/api/sales"

def test_api():
    print("Testing API connectivity...")
    try:
        resp = requests.get("http://localhost:4000/ping")
        if resp.status_code == 200:
            print("Backend is UP!")
        else:
            print(f"Backend returned {resp.status_code}")
            return
    except Exception as e:
        print(f"Backend seems down: {e}")
        return

    print("\n1. Test Basic List...")
    resp = requests.get(BASE_URL)
    data = resp.json()
    print(f"Total records: {data.get('total')}")
    assert data.get('total') > 0, "No data found!"

    print("\n2. Test Multi-select Regions (North OR South)...")
    # Requesting North and South. Should have records from both.
    resp = requests.get(BASE_URL, params=[('regions', 'North'), ('regions', 'South')])
    data = resp.json()['data']
    regions = {item['Customer Region'] for item in data}
    print(f"Returned Regions: {regions}")
    assert 'North' in regions or 'South' in regions
    # Verify no East or West if data allows, but paging might hide them. 
    # Logic verification:
    for item in data:
        assert item['Customer Region'] in ['North', 'South'], f"Found unexpected region: {item['Customer Region']}"
    print("Region Filter Passed.")

    print("\n3. Test Multi-select Filters Intersection (North AND Male)...")
    resp = requests.get(BASE_URL, params=[('regions', 'North'), ('genders', 'Male')])
    data = resp.json()['data']
    for item in data:
        assert item['Customer Region'] == 'North'
        assert item['Gender'] == 'Male'
    print("Intersection Filter Passed.")

    print("\nAll backend tests passed!")

if __name__ == "__main__":
    # Give server a moment to init if just started
    time.sleep(2)
    test_api()
