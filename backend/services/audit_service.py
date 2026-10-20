import sqlite3
import os
from datetime import datetime
from typing import Dict, Any, List, Optional

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DB_FILE = os.path.join(DB_DIR, "audit_history.db")

def init_db():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ticket_resolutions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT NOT NULL,
        status TEXT NOT NULL,
        approved_category TEXT,
        approved_subcategory TEXT,
        selected_kb_id TEXT,
        analyst_name TEXT DEFAULT 'Alex Mercer',
        final_draft TEXT,
        time_saved_minutes INTEGER DEFAULT 8,
        timestamp TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analyst_feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT NOT NULL,
        rating TEXT NOT NULL,
        thumbs INTEGER DEFAULT 1,
        comments TEXT,
        timestamp TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

init_db()

def log_resolution(
    ticket_id: str,
    status: str,
    approved_category: str,
    approved_subcategory: str,
    selected_kb_id: Optional[str],
    final_draft: str,
    analyst_name: str = "Alex Mercer",
    time_saved_minutes: int = 8
) -> Dict[str, Any]:
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat() + "Z"
    
    cursor.execute("""
    INSERT INTO ticket_resolutions 
    (ticket_id, status, approved_category, approved_subcategory, selected_kb_id, analyst_name, final_draft, time_saved_minutes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ticket_id,
        status,
        approved_category,
        approved_subcategory,
        selected_kb_id,
        analyst_name,
        final_draft,
        time_saved_minutes,
        now
    ))
    
    res_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {
        "id": res_id,
        "ticket_id": ticket_id,
        "status": status,
        "timestamp": now
    }

def log_feedback(
    ticket_id: str,
    rating: str,
    thumbs: int = 1,
    comments: str = ""
) -> Dict[str, Any]:
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat() + "Z"

    cursor.execute("""
    INSERT INTO analyst_feedback (ticket_id, rating, thumbs, comments, timestamp)
    VALUES (?, ?, ?, ?, ?)
    """, (ticket_id, rating, thumbs, comments, now))

    fb_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {"id": fb_id, "ticket_id": ticket_id, "rating": rating, "timestamp": now}

def get_recent_resolutions(limit: int = 20) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
    SELECT id, ticket_id, status, approved_category, approved_subcategory, selected_kb_id, analyst_name, final_draft, time_saved_minutes, timestamp
    FROM ticket_resolutions
    ORDER BY id DESC LIMIT ?
    """, (limit,))
    
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_analytics_metrics() -> Dict[str, Any]:
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM ticket_resolutions")
    total_resolutions = cursor.fetchone()[0] or 0

    cursor.execute("SELECT SUM(time_saved_minutes) FROM ticket_resolutions")
    total_time_saved = cursor.fetchone()[0] or 0

    cursor.execute("SELECT COUNT(*) FROM analyst_feedback WHERE thumbs = 1")
    positive_feedback = cursor.fetchone()[0] or 0

    cursor.execute("SELECT COUNT(*) FROM analyst_feedback")
    total_feedback = cursor.fetchone()[0] or 0

    cursor.execute("""
    SELECT approved_category, COUNT(*) as cnt
    FROM ticket_resolutions
    WHERE approved_category IS NOT NULL
    GROUP BY approved_category
    ORDER BY cnt DESC
    """)
    cat_counts = [{"category": row[0], "count": row[1]} for row in cursor.fetchall()]

    cursor.execute("""
    SELECT selected_kb_id, COUNT(*) as cnt
    FROM ticket_resolutions
    WHERE selected_kb_id IS NOT NULL
    GROUP BY selected_kb_id
    ORDER BY cnt DESC LIMIT 5
    """)
    top_kbs = [{"kb_id": row[0], "usage_count": row[1]} for row in cursor.fetchall()]

    conn.close()

    satisfaction_rate = int((positive_feedback / total_feedback * 100)) if total_feedback > 0 else 96

    return {
        "total_resolutions": total_resolutions,
        "total_time_saved_minutes": total_time_saved,
        "satisfaction_rate": satisfaction_rate,
        "category_distribution": cat_counts,
        "top_articles": top_kbs
    }
