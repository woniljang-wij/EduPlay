from flask import Blueprint, request, jsonify
from database.db import get_connection
from datetime import datetime
import traceback

room_bp = Blueprint("room", __name__)


# =========================================================
# CREATE ROOM
# =========================================================
@room_bp.route("/api/rooms", methods=["POST"])
def create_room():

    try:

        data = request.json

        # ===== VALIDATE =====
        required_fields = [
            "game_id",
            "teacher_id",
            "game_type",
            "room_code",
            "expire_day",
            "assign_name"
        ]

        for field in required_fields:

            if field not in data:

                return jsonify({
                    "success": False,
                    "error": f"Thiếu field: {field}"
                }), 400

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO rooms
            (
                game_id,
                teacher_id,
                game_type,
                assign_name,
                room_code,
                expire_day,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            int(data["game_id"]),
            int(data["teacher_id"]),
            str(data["game_type"]),
            str(data["assign_name"]),
            str(data["room_code"]),
            int(data["expire_day"]),
            datetime.now()
        ))

        conn.commit()

        # ===== GET INSERTED ID =====
        cursor.execute("SELECT @@IDENTITY")

        room_id = cursor.fetchone()[0]

        conn.close()

        return jsonify({
            "success": True,
            "roomId": room_id
        })

    except Exception as e:

        print("\n========== CREATE ROOM ERROR ==========")
        traceback.print_exc()
        print("=======================================\n")

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# =========================================================
# GET ALL ROOMS
# =========================================================
@room_bp.route("/api/rooms", methods=["GET"])
def get_all_rooms():

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT *
            FROM rooms
            ORDER BY created_at DESC
        """)

        rows = cursor.fetchall()

        rooms = []

        for row in rows:

            rooms.append({
                "id": row.id,

                "gameId": row.game_id,

                "teacherId": row.teacher_id,

                "gameType": row.game_type,

                "assignName": row.assign_name,

                "roomCode": row.room_code,

                "expireDay": row.expire_day,

                "createdAt": str(row.created_at)
            })

        conn.close()

        return jsonify(rooms)

    except Exception as e:

        print("\n========== GET ALL ROOMS ERROR ==========")
        traceback.print_exc()
        print("=========================================\n")

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# =========================================================
# GET ROOMS BY TEACHER
# =========================================================
@room_bp.route("/api/rooms/<int:teacher_id>", methods=["GET"])
def get_rooms(teacher_id):

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT *
            FROM rooms
            WHERE teacher_id = ?
            ORDER BY created_at DESC
        """, (teacher_id,))

        rows = cursor.fetchall()

        rooms = []

        for row in rows:

            rooms.append({
                "id": row.id,

                "gameId": row.game_id,

                "teacherId": row.teacher_id,

                "gameType": row.game_type,

                "assignName": row.assign_name,

                "roomCode": row.room_code,

                "expireDay": row.expire_day,

                "createdAt": str(row.created_at)
            })

        conn.close()

        return jsonify(rooms)

    except Exception as e:

        print("\n========== GET ROOMS ERROR ==========")
        traceback.print_exc()
        print("=====================================\n")

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# =========================================================
# DELETE ROOM
# =========================================================
@room_bp.route("/api/rooms/<room_code>", methods=["DELETE"])
def delete_room(room_code):

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            DELETE FROM rooms
            WHERE room_code = ?
        """, (room_code,))

        conn.commit()

        conn.close()

        return jsonify({
            "success": True
        })

    except Exception as e:

        print("\n========== DELETE ROOM ERROR ==========")
        traceback.print_exc()
        print("=======================================\n")

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500