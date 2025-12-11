from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from api.db import get_db

app = FastAPI()

class InventoryCheck(BaseModel):
    sku: str

@app.get("/api/health")
def health_check():
    return {"status": "ok", "environment": "python-headless"}

@app.post("/api/inventory/check")
def check_inventory(item: InventoryCheck):
    try:
        conn = get_db()
        # 模擬查詢邏輯，實際應執行 SQL: conn.execute("SELECT ...")
        # 這裡簡單返回 mock 數據
        if item.sku == "out-of-stock-item":
            return {"sku": item.sku, "available": False, "quantity": 0}
        
        return {"sku": item.sku, "available": True, "quantity": 100}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))