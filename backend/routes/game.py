from flask import Blueprint, request, jsonify

import json

from models.game_model import *
from database.db import get_connection

game_bp = Blueprint("game", __name__)

# ================= SAVE GAME =================
@game_bp.route("/api/games", methods=["POST"])
def save_game():

    try:

        data = request.json

        create_game(
            data.get("user_id"),
            data.get("game_type"),
            data.get("title"),
            data.get("subject"),
            data.get("music"),
            data.get("game_data")
        )

        return jsonify({
            "message": "saved"
        })

    except Exception as e:

        print("SAVE GAME ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# ================= LOAD GAMES BY USER =================
@game_bp.route("/api/games/<int:user_id>", methods=["GET"])
def get_games(user_id):

    try:

        rows = get_games_by_user(user_id)

        games = []

        for row in rows:

            games.append({
                "id": row.id,
                "title": row.title,
                "subject": row.subject,
                "music": row.music,
                "game_type": row.game_type,
                "game_data": row.game_data
            })

        return jsonify(games)

    except Exception as e:

        print("GET GAMES ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# ================= UPDATE GAME =================
@game_bp.route("/api/games/<int:id>", methods=["PUT"])
def update_game(id):

    try:

        data = request.json

        conn = get_connection()

        cursor = conn.cursor()

        cursor.execute("""
            UPDATE games
            SET
                title = ?,
                subject = ?,
                music = ?,
                game_data = ?
            WHERE id = ?
        """, (
            data.get("title"),
            data.get("subject"),
            data.get("music"),

            json.dumps(data.get("game_data"))
            if data.get("game_data") is not None
            else None,

            id
        ))

        conn.commit()

        conn.close()

        return jsonify({
            "message": "updated"
        })

    except Exception as e:

        print("UPDATE GAME ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# ================= DELETE GAME =================
@game_bp.route("/api/games/<int:id>", methods=["DELETE"])
def delete_game(id):

    try:

        conn = get_connection()

        cursor = conn.cursor()

        # ===== GIỮ LẠI ROOM + LỊCH SỬ =====
        cursor.execute("""
            UPDATE rooms
            SET game_id = NULL
            WHERE game_id = ?
        """, (id,))

        # ===== DELETE GAME =====
        cursor.execute("""
            DELETE FROM games
            WHERE id = ?
        """, (id,))

        conn.commit()

        conn.close()

        return jsonify({
            "message": "deleted"
        })

    except Exception as e:

        print("DELETE GAME ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# ================= LOAD ALL GAMES =================
@game_bp.route("/api/games", methods=["GET"])
def get_all_games():

    try:

        rows = get_all_games_db()

        games = []

        for row in rows:

            games.append({
                "id": row.id,
                "title": row.title,
                "subject": row.subject,
                "music": row.music,
                "game_type": row.game_type,
                "game_data": row.game_data
            })

        return jsonify(games)

    except Exception as e:

        print("GET ALL GAMES ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# ================= CREATE ROOM =================
@game_bp.route("/api/rooms", methods=["POST"])
def create_room():

    try:

        data = request.json

        conn = get_connection()

        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO rooms (
                game_id,
                teacher_id,
                game_type,
                room_code,
                assign_name,
                expire_day,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (
            data.get("game_id"),
            data.get("teacher_id"),
            data.get("game_type"),
            data.get("room_code"),
            data.get("assign_name"),
            data.get("expire_day")
        ))

        conn.commit()

        conn.close()

        return jsonify({
            "message": "room_created"
        })

    except Exception as e:

        print("CREATE ROOM ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# ================= GET ROOMS =================
@game_bp.route("/api/rooms/<int:teacher_id>", methods=["GET"])
def get_rooms(teacher_id):

    try:

        conn = get_connection()

        cursor = conn.cursor()

        cursor.execute("""
            SELECT *
            FROM rooms
            WHERE teacher_id = ?
            ORDER BY id DESC
        """, (teacher_id,))

        rows = cursor.fetchall()

        conn.close()

        rooms = []

        for row in rows:

            rooms.append({
                "id": row.id,
                "game_id": row.game_id,
                "teacher_id": row.teacher_id,
                "game_type": row.game_type,
                "room_code": row.room_code,
                "assign_name": row.assign_name,
                "expire_day": row.expire_day,
                "created_at": str(row.created_at)
            })

        return jsonify(rooms)

    except Exception as e:

        print("GET ROOMS ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# ================= GET ROOM BY CODE =================
@game_bp.route("/api/room/<room_code>", methods=["GET"])
def get_room_by_code(room_code):

    try:

        conn = get_connection()

        cursor = conn.cursor()

        cursor.execute("""
            SELECT *
            FROM rooms
            WHERE room_code = ?
        """, (room_code,))

        row = cursor.fetchone()

        conn.close()

        if not row:
            return jsonify({
                "message": "not_found"
            }), 404

        return jsonify({
            "id": row.id,
            "game_id": row.game_id,
            "teacher_id": row.teacher_id,
            "game_type": row.game_type,
            "room_code": row.room_code,
            "assign_name": row.assign_name,
            "expire_day": row.expire_day,
            "created_at": str(row.created_at)
        })

    except Exception as e:

        print("GET ROOM ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# ================= DELETE ROOM =================
@game_bp.route("/api/rooms/<room_code>", methods=["DELETE"])
def delete_room(room_code):

    try:

        conn = get_connection()

        cursor = conn.cursor()

        # ===== DELETE RESULTS =====
        cursor.execute("""
            DELETE FROM results
            WHERE room_id IN (
                SELECT id
                FROM rooms
                WHERE room_code = ?
            )
        """, (room_code,))

        # ===== DELETE ROOM =====
        cursor.execute("""
            DELETE FROM rooms
            WHERE room_code = ?
        """, (room_code,))

        conn.commit()

        conn.close()

        return jsonify({
            "message": "room_deleted"
        })

    except Exception as e:

        print("DELETE ROOM ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# ================= SAVE RESULT =================
@game_bp.route("/api/results", methods=["POST"])
def save_result():

    try:

        data = request.json

        conn = get_connection()

        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO results (
                room_id,
                game_type,
                player_name,
                team_name,
                score,
                result_text,
                extra_data,
                match_id,
                submitted_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (
            data.get("room_id"),
            data.get("game_type"),
            data.get("player_name"),
            data.get("team_name"),
            data.get("score"),
            data.get("result_text"),

            json.dumps(data.get("extra_data"))
            if data.get("extra_data") is not None
            else None,

            data.get("match_id")
        ))

        conn.commit()

        conn.close()

        return jsonify({
            "message": "result_saved"
        })

    except Exception as e:

        print("SAVE RESULT ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# ================= GET RESULTS =================
@game_bp.route("/api/results/<int:room_id>", methods=["GET"])
def get_results(room_id):

    try:

        conn = get_connection()

        cursor = conn.cursor()

        cursor.execute("""
            SELECT *
            FROM results
            WHERE room_id = ?
            ORDER BY id DESC
        """, (room_id,))

        rows = cursor.fetchall()

        conn.close()

        results = []

        for row in rows:

            results.append({
                "id": row.id,
                "room_id": row.room_id,
                "game_type": row.game_type,
                "player_name": row.player_name,
                "team_name": row.team_name,
                "score": row.score,
                "result_text": row.result_text,

                "extra_data":
                    json.loads(row.extra_data)
                    if row.extra_data
                    else None,

                "match_id": row.match_id,
                "submitted_at": str(row.submitted_at)
            })

        return jsonify(results)

    except Exception as e:

        print("GET RESULTS ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# ================= GET ALL ROOMS =================
@game_bp.route("/api/all-rooms", methods=["GET"])
def get_all_rooms():

    try:

        conn = get_connection()

        cursor = conn.cursor()

        cursor.execute("""
            SELECT *
            FROM rooms
            ORDER BY id DESC
        """)

        rows = cursor.fetchall()

        conn.close()

        rooms = []

        for row in rows:

            rooms.append({
                "id": row.id,
                "room_code": row.room_code,
                "game_id": row.game_id,
                "teacher_id": row.teacher_id,
                "game_type": row.game_type,
                "assign_name": row.assign_name,
                "expire_day": row.expire_day,
                "created_at": str(row.created_at)
            })

        return jsonify(rooms)

    except Exception as e:

        print("GET ALL ROOMS ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# ================= GET ALL RESULTS =================
@game_bp.route("/api/results", methods=["GET"])
def get_all_results():

    try:

        conn = get_connection()

        cursor = conn.cursor()

        cursor.execute("""
            SELECT *
            FROM results
            ORDER BY submitted_at DESC
        """)

        rows = cursor.fetchall()

        conn.close()

        results = []

        for row in rows:

            results.append({
                "id": row.id,
                "room_id": row.room_id,
                "game_type": row.game_type,
                "player_name": row.player_name,
                "team_name": row.team_name,
                "score": row.score,
                "result_text": row.result_text,

                "extra_data":
                    json.loads(row.extra_data)
                    if row.extra_data
                    else None,

                "submitted_at": str(row.submitted_at),
                "match_id": row.match_id
            })

        return jsonify(results)

    except Exception as e:

        print("GET ALL RESULTS ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500