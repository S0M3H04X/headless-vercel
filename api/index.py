from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from api.db import get_db

# 設定 root_path 以正確處理 Vercel 的 Proxy
app = FastAPI(docs_url="/api/python/docs", openapi_url="/api/python/openapi.json")

class InventoryCheck(BaseModel):
    sku: str

# [修正] 路由必須包含 /api/python 前綴
@app.get("/api/python/health")
def health_check():
    return {"status": "ok", "environment": "python-headless-vercel"}

@app.post("/api/python/inventory/check")
def check_inventory(item: InventoryCheck):
    try:
        # 這裡未來會連接真實 DB
        if item.sku == "out-of-stock-item":
            return {"sku": item.sku, "available": False, "quantity": 0}
        
        return {"sku": item.sku, "available": True, "quantity": 100}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))