from flask import Blueprint, request, jsonify

from models.user_model import create_user, get_user, get_or_create_google_user

auth_bp = Blueprint("auth", __name__)


# ================= REGISTER =================
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


# ================= LOGIN =================
@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username")

    password = data.get("password")

    user = get_user(username, password)

    if user:

        return jsonify(
            {
                "message": "Đăng nhập thành công",
                "user": {
                    "id": user[0],
                    "full_name": user[1],
                    "email": user[2],
                    "avatar": None,
                    "loginType": "normal",
                },
            }
        )

    else:

        return jsonify({"message": "Sai tài khoản hoặc mật khẩu"}), 401


# ================= GOOGLE LOGIN =================
@auth_bp.route("/google-login", methods=["POST"])
def google_login():

    data = request.get_json()

    full_name = data.get("full_name")

    email = data.get("email")

    avatar = data.get("avatar")

    user_id = get_or_create_google_user(full_name, email, avatar)

    if not user_id:

        return jsonify({"message": "Google login failed"}), 500

    return jsonify(
        {
            "message": "Google login success",
            "user": {
                "id": user_id,
                "full_name": full_name,
                "email": email,
                "avatar": avatar,
                "loginType": "google",
            },
        }
    )
