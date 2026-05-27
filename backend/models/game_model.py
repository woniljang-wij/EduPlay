from database.db import get_connection
import json

# ================= CREATE GAME =================
def create_game(user_id, game_type, title, subject, music, game_data):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO games
        (
            user_id,
            game_type,
            title,
            subject,
            music,
            game_data
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """,
    (
        user_id,
        game_type,
        title,
        subject,
        music,
        json.dumps(game_data)
    ))

    conn.commit()

    conn.close()


# ================= GET GAMES BY USER =================
def get_games_by_user(user_id):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM games
        WHERE user_id = ?
        ORDER BY created_at DESC
    """, (user_id,))

    rows = cursor.fetchall()

    conn.close()

    return rows


# ================= GET ALL GAMES =================
def get_all_games_db():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM games
        ORDER BY created_at DESC
    """)

    rows = cursor.fetchall()

    conn.close()

    return rows

# ================= SAVE RESULT =================
def save_result(
    room_id,
    game_type,
    player_name,
    team_name,
    score,
    result_text,
    extra_data=None,
    match_id=None
):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO results
        (
            room_id,
            game_type,
            player_name,
            team_name,
            score,
            result_text,
            extra_data,
            match_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """,
    (
        room_id,
        game_type,
        player_name,
        team_name,
        score,
        result_text,
        json.dumps(extra_data) if extra_data else None,
        match_id
    ))

    conn.commit()

    conn.close()


# ================= GET RESULTS BY ROOM =================
def get_results_by_room(room_id):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM results
        WHERE room_id = ?
        ORDER BY submitted_at DESC
    """, (room_id,))

    rows = cursor.fetchall()

    conn.close()

    return rows