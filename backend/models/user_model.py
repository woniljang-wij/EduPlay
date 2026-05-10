from database.db import get_connection

def create_user(full_name, email, password):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)",
            (full_name, email, password)
        )
        conn.commit()
        return True
    except Exception as e:
        print("❌ Lỗi create_user:", e)
        return False
    finally:
        conn.close()


def get_user(email, password):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT id, full_name FROM users WHERE email=? AND password=?",
            (email, password)
        )
        return cursor.fetchone()
    except Exception as e:
        print("❌ Lỗi get_user:", e)
        return None
    finally:
        conn.close()