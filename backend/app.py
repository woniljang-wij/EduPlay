from flask import Flask
from flask_cors import CORS

from routes.auth import auth_bp
from routes.game import game_bp
from routes.room import room_bp
from routes.result import result_bp

app = Flask(
    __name__,
    static_folder="../frontend",
    static_url_path=""
)

CORS(app)

# ================= ROUTES =================
app.register_blueprint(auth_bp, url_prefix="/auth")

app.register_blueprint(game_bp)

app.register_blueprint(room_bp)

app.register_blueprint(result_bp)

# ================= HOME =================
@app.route("/")
def home():
    return app.send_static_file("index.html")

# ================= RUN =================
if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)