import os
import psycopg2

def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5434"),
        database=os.getenv("DB_NAME", "sxmxdx2"),
        user=os.getenv("DB_USER", "sxmxdx"),
        password=os.getenv("DB_PASSWORD", "diary")
    )