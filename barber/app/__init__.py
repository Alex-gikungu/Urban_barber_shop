from flask import Flask, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
import os
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

print("GOOGLE_CLIENT_ID:", os.getenv("GOOGLE_CLIENT_ID"))
print("GOOGLE_CLIENT_SECRET:", os.getenv("GOOGLE_CLIENT_SECRET"))

db = SQLAlchemy()
migrate = Migrate()
oauth = OAuth()

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL", "sqlite:///barber.db")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "supersecretkey")
    app.config['UPLOAD_FOLDER'] = os.path.join('static', 'Uploads')
    app.config['GOOGLE_CLIENT_ID'] = os.getenv("GOOGLE_CLIENT_ID")
    app.config['GOOGLE_CLIENT_SECRET'] = os.getenv("GOOGLE_CLIENT_SECRET")

    db.init_app(app)
    migrate.init_app(app, db)

    oauth.init_app(app)
    oauth.register(
        name='google',
        client_id=app.config['GOOGLE_CLIENT_ID'],
        client_secret=app.config['GOOGLE_CLIENT_SECRET'],
        access_token_url='https://accounts.google.com/o/oauth2/token',
        authorize_url='https://accounts.google.com/o/oauth2/auth',
        api_base_url='https://www.googleapis.com/oauth2/v1/',
        userinfo_endpoint='https://www.googleapis.com/oauth2/v1/userinfo',
        client_kwargs={'scope': 'openid email profile'}
    )

    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://localhost:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        },
        r"/contact/*": {
            "origins": ["http://localhost:3000", "http://localhost:5173"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type"],
            "supports_credentials": True
        },
        r"/callback": {
            "origins": ["*"],
            "methods": ["POST", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })

    @app.route('/static/<path:filename>')
    def serve_static(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.appointments import appointment_bp
    from app.routes.inventory import inventory_bp
    from app.routes.staff import staff_bp
    from app.routes.payments import payments_bp
    from app.routes.customers import customers_bp
    from app.routes.contact import contact_bp
    from app.routes.profile import profile_bp
    from app.routes.services import service_bp
    from app.routes.booking import booking_bp  # ✅ Import booking blueprint

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(appointment_bp, url_prefix="/api/appointments")
    app.register_blueprint(inventory_bp, url_prefix="/api/inventory")
    app.register_blueprint(staff_bp, url_prefix="/api/staff")
    app.register_blueprint(payments_bp, url_prefix="/api/payments")
    app.register_blueprint(customers_bp, url_prefix="/api/customers")
    app.register_blueprint(contact_bp, url_prefix="/contact")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")
    app.register_blueprint(service_bp, url_prefix="/api/services")
    app.register_blueprint(booking_bp, url_prefix="/api/bookings")  # ✅ Register booking blueprint

    @app.before_request
    def log_request():
        logger.debug(f"Request: {request.path}, Headers: {request.headers}")

    @app.after_request
    def log_response(response):
        logger.debug(f"Response: {response.status}, Headers: {response.headers}")
        return response

    return app
