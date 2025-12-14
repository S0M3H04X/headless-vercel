from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from api.db import get_db

app = FastAPI(docs_url="/api/python/docs", openapi_url="/api/python/openapi.json")

class InventoryCheck(BaseModel):
    sku: str

@app.get("/api/python/health")
def health_check():
    return {"status": "ok", "environment": "python-headless-vercel"}

@app.post("/api/python/inventory/check")
def check_inventory(item: InventoryCheck):
    try:
        client = get_db()
        # [修正] 使用 client.execute()，注意要在 try/finally 或 context manager 中關閉 client 是一般最佳實踐，
        # 但在 Serverless 短連接中，讓它自動回收通常是可以接受的，或是顯式 close。
        
        # 這裡僅為演示，暫時不連線真實 DB，避免在此階段卡關
        # rs = client.execute("SELECT * FROM inventory WHERE sku = ?", [item.sku])
        
        # Mock Response (Phase 5 重點是架構打通)
        if item.sku == "out-of-stock-item":
            return {"sku": item.sku, "available": False, "quantity": 0}
        
        return {"sku": item.sku, "available": True, "quantity": 100}
            
    except Exception as e:
        print(f"DB Error: {e}") # 讓錯誤出現在 Vercel Logs
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # 若使用了 client，建議在此 client.close()
        pass