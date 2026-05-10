from flask import Blueprint, request, jsonify
from models.user_model import create_user, get_user

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    full_name = data.get("full_name")
    username = data.get("username")
    password = data.get("password")

    success = create_user(full_name, username, password)

    if success:
        return jsonify({"message": "Đăng ký thành công"})
    else:
        return jsonify({"message": "Email đã tồn tại"}), 400


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    user = get_user(username, password)

    if user:
        return jsonify({
            "message": "Đăng nhập thành công",
            "user": {
                "id": user[0],
                "full_name": user[1]
            }
        })
    else:
        return jsonify({"message": "Sai tài khoản hoặc mật khẩu"}), 401