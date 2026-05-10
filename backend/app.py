from flask import Flask
from flask_cors import CORS
from routes.auth import auth_bp

app = Flask(
    __name__,
    static_folder="../frontend",
    static_url_path=""
)

CORS(app)

app.register_blueprint(auth_bp, url_prefix="/auth")

@app.route("/")
def home():
    return app.send_static_file("index.html")

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)