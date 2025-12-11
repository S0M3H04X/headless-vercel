import os
import libsql_experimental as libsql

def get_db():
    url = os.environ.get("TURSO_DATABASE_URL", "file:local.db")
    token = os.environ.get("TURSO_AUTH_TOKEN")
    
    # 如果是本地開發且沒有設定 Turso URL，會 fallback 到本地 SQLite 檔案
    conn = libsql.connect(database=url, auth_token=token)
    return conn