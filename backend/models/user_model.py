from database.db import get_connection


# ================= REGISTER =================
def create_user(full_name, email, password):

    conn = get_connection()

    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO users
            (
                full_name,
                email,
                password,
                avatar,
                login_type
            )
            VALUES (?, ?, ?, ?, ?)
        """,
            (
                full_name,
                email,
                password,
                None,
                "normal"
            ),
        )

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

        cursor.execute(
            """
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
            ),
        )

        return cursor.fetchone()

    except Exception as e:

        print("❌ Lỗi get_user:", e)

        return None

    finally:

        conn.close()


# ================= GOOGLE LOGIN =================
def get_or_create_google_user(full_name, email, avatar):

    conn = get_connection()

    cursor = conn.cursor()

    try:

        # ===== CHECK EXIST =====
        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE email = ?
        """,
            (email,),
        )

        user = cursor.fetchone()

        # ===== CREATE =====
        if not user:

            cursor.execute(
                """
                INSERT INTO users
                (
                    full_name,
                    email,
                    password,
                    avatar,
                    login_type
                )
                VALUES (?, ?, ?, ?, ?)
            """,
                (
                    full_name,
                    email,
                    None,
                    avatar,
                    "google"
                ),
            )

            conn.commit()

            # ===== GET NEW USER =====
            cursor.execute(
                """
                SELECT id
                FROM users
                WHERE email = ?
            """,
                (email,),
            )

            user = cursor.fetchone()

        return user[0]

    except Exception as e:

        print("❌ Lỗi Google Login:", e)

        return None

    finally:

        conn.close()