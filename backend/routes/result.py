from flask import Blueprint, request, jsonify
from database.db import get_connection
from datetime import datetime
import json
import traceback

result_bp = Blueprint("result", __name__)


# =========================================================
# SAVE RESULT
# =========================================================
@result_bp.route("/api/results", methods=["POST"])
def save_result():

    try:

        data = request.json

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
                submitted_at,
                match_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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

            datetime.now(),

            data.get("match_id")
        ))

        conn.commit()

        conn.close()

        return jsonify({
            "success": True,
            "message": "saved"
        })

    except Exception as e:

        print("\n========== SAVE RESULT ERROR ==========")
        traceback.print_exc()
        print("=======================================\n")

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# =========================================================
# GET RESULTS BY ROOM
# =========================================================
@result_bp.route("/api/results/<int:room_id>", methods=["GET"])
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

                "submitted_at": str(row.submitted_at),

                "extra_data":
                    json.loads(row.extra_data)
                    if row.extra_data
                    else None,

                "match_id": row.match_id
            })

        return jsonify(results)

    except Exception as e:

        print("\n========== GET RESULT ERROR ==========")
        traceback.print_exc()
        print("======================================\n")

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500