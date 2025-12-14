from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from api.db import get_db

app = FastAPI(docs_url="/api/python/docs", openapi_url="/api/python/openapi.json")

# 定義傳入的資料結構
class AnalyticsEvent(BaseModel):
    event_type: str                  # 例如: "window_open", "window_close"
    payload: Dict[str, Any]          # 例如: { "window_id": "...", "title": "..." }
    timestamp: int                   # Unix Timestamp
    session_id: Optional[str] = None # 用戶 Session ID

class InventoryCheck(BaseModel):
    sku: str

@app.get("/api/python/health")
def health_check():
    return {"status": "ok", "environment": "python-headless-vercel"}


@app.post("/api/python/analytics/collect")
async def collect_analytics(event: AnalyticsEvent):
    try:
        # [模擬運算] 這裡可以連接 DB 進行寫入
        # 現階段我們先將數據打印到 Vercel Function Logs 以供驗證
        print(f"📊 [Analytics] {event.event_type} at {event.timestamp}")
        print(f"   Payload: {event.payload}")
        
        # 模擬一個簡單的聚合運算：計算停留時間 (如果是關閉視窗事件)
        if event.event_type == "window_close":
            duration = event.payload.get("duration_seconds", 0)
            if duration > 60:
                print(f"   🔥 High engagement detected! Duration: {duration}s")

        return {"status": "recorded", "id": event.timestamp}
    except Exception as e:
        print(f"❌ Analytics Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))



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