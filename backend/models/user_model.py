from database.db import get_connection

# ================= REGISTER =================
def create_user(full_name, email, password):

    conn = get_connection()

    cursor = conn.cursor()

    try:

        cursor.execute("""
            INSERT INTO users
            (
                full_name,
                email,
                password,
                login_type
            )
            VALUES (?, ?, ?, ?)
        """,
        (
            full_name,
            email,
            password,
            "normal"
        ))

        conn.commit()

        return True

    except Exception as e:

        print("❌ Lỗi create_user:", e)

        return False

    finally:

        conn.close()

# ================= LOGIN =================
def get_user(email, password):

    conn = get_connection()

    cursor = conn.cursor()

    try:

        cursor.execute("""
            SELECT
                id,
                full_name,
                email,
                avatar,
                login_type
            FROM users
            WHERE email=? AND password=?
        """,
        (
            email,
            password
        ))

        return cursor.fetchone()

    except Exception as e:

        print("❌ Lỗi get_user:", e)

        return None

    finally:

        conn.close()

# ================= GOOGLE LOGIN =================
def get_or_create_google_user(
    full_name,
    email,
    avatar
):

    conn = get_connection()

    cursor = conn.cursor()

    try:

        # ===== CHECK EXIST =====
        cursor.execute("""
            SELECT id
            FROM users
            WHERE email = ?
        """,
        (email,))

        user = cursor.fetchone()

        # ===== CREATE =====
        if not user:

            cursor.execute("""
                INSERT INTO users
                (
                    full_name,
                    email,
                    avatar,
                    login_type
                )
                OUTPUT INSERTED.id
                VALUES (?, ?, ?, ?)
            """,
            (
                full_name,
                email,
                avatar,
                "google"
            ))

            user_id = cursor.fetchone()[0]

            conn.commit()

        else:

            user_id = user[0]

        return user_id

    except Exception as e:

        print("❌ Lỗi Google Login:", e)

        return None

    finally:

        conn.close()