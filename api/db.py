import os
import libsql_client

def get_db():
    url = os.environ.get("TURSO_DATABASE_URL")
    token = os.environ.get("TURSO_AUTH_TOKEN")
    
    # [防禦] 在 Vercel 環境中，若無 URL 則不應嘗試連線本地檔案
    if not url:
        # 如果是在 Vercel (有環境變數區分) 或是生產環境，直接報錯
        if os.environ.get("VERCEL"):
            raise Exception("Missing TURSO_DATABASE_URL in Vercel Environment Variables")
        
        # 本地開發 fallback
        print("Warning: Using local URL for dev")
        url = "http://127.0.0.1:8080" # 或是其他本地模擬的 URL
        
    # 建立同步 HTTP Client
    return libsql_client.create_client_sync(url=url, auth_token=token)