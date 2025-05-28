import jwt
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from google.oauth2 import id_token
from google.auth.transport import requests
from app.models import User, CustomerProfile
from app import db
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

def generate_token(user_id):
    return jwt.encode(
        {'user_id': user_id, 'exp': datetime.utcnow() + timedelta(days=7)},
        current_app.config['SECRET_KEY'],
        algorithm='HS256'
    )

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    full_name = data.get('fullname')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'customer')

    if not full_name or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    new_user = User(full_name=full_name, email=email, role=role)
    new_user.set_password(password)

    if role == 'customer':
        profile = CustomerProfile(
            user=new_user,
            profile_image='https://via.placeholder.com/150',
            referral_code=f"REF{new_user.id}_{email.split('@')[0]}",
            preferences='',
            loyalty_points=0,
            visit_count=0
        )
        db.session.add(profile)

    db.session.add(new_user)
    db.session.commit()

    token = generate_token(new_user.id)
    logger.debug(f"User registered: {email}, ID: {new_user.id}")
    return jsonify({"message": "User registered successfully", "token": token}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        logger.warning(f"Login failed for email: {email}")
        return jsonify({"error": "Invalid credentials"}), 401

    token = generate_token(user.id)
    profile = user.profile if user.role == 'customer' else None
    logger.debug(f"Login: Generated token for user_id: {user.id}")
    return jsonify({
        "message": "Logged in successfully",
        "token": token,
        "user": {
            "id": user.id,
            "fullName": user.full_name,
            "email": user.email,
            "profileImage": profile.profile_image if profile else user.profile_pic or 'https://via.placeholder.com/150',
            "referralCode": profile.referral_code if profile else '',
            "preferences": profile.preferences if profile else '',
            "loyaltyPoints": profile.loyalty_points if profile else 0,
            "visitCount": profile.visit_count if profile else 0
        }
    }), 200

@auth_bp.route('/google/token', methods=['POST'])
def google_login():
    data = request.json
    credential = data.get('credential')
    if not credential:
        return jsonify({"error": "No credential provided"}), 400

    try:
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            current_app.config['GOOGLE_CLIENT_ID']
        )
        email = idinfo['email']
        full_name = idinfo.get('name', email.split('@')[0])

        # Find or create user
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(
                full_name=full_name,
                email=email,
                role='customer'
            )
            user.set_password('google-auth')  # Dummy password
            profile = CustomerProfile(
                user=user,
                profile_image=idinfo.get('picture', 'https://via.placeholder.com/150'),
                referral_code=f"REF{user.id}_{email.split('@')[0]}",
                preferences='',
                loyalty_points=0,
                visit_count=0
            )
            db.session.add(user)
            db.session.add(profile)
            db.session.commit()

        token = generate_token(user.id)
        profile = user.profile if user.role == 'customer' else None
        logger.debug(f"Google login: Generated token for user_id: {user.id}")
        return jsonify({
            "message": "Google login successful",
            "token": token,
            "user": {
                "id": user.id,
                "fullName": user.full_name,
                "email": user.email,
                "profileImage": profile.profile_image if profile else user.profile_pic or 'https://via.placeholder.com/150',
                "referralCode": profile.referral_code if profile else '',
                "preferences": profile.preferences if profile else '',
                "loyaltyPoints": profile.loyalty_points if profile else 0,
                "visitCount": profile.visit_count if profile else 0
            }
        }), 200
    except ValueError as e:
        logger.warning(f"Google token verification failed: {str(e)}")
        return jsonify({"error": "Invalid Google token"}), 401

@auth_bp.route('/me', methods=['GET'])
def me():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        logger.warning("No token provided for /me")
        return jsonify({'error': 'Unauthorized'}), 401
    try:
        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.get(data['user_id'])
        if not user:
            logger.warning("User not found for /me")
            return jsonify({'error': 'Unauthorized'}), 401
        profile = user.profile if user.role == 'customer' else None
        return jsonify({
            "id": user.id,
            "fullName": user.full_name,
            "email": user.email,
            "profileImage": profile.profile_image if profile else user.profile_pic or 'https://via.placeholder.com/150',
            "referralCode": profile.referral_code if profile else '',
            "preferences": profile.preferences if profile else '',
            "loyaltyPoints": profile.loyalty_points if profile else 0,
            "visitCount": profile.visit_count if profile else 0
        })
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired for /me")
        return jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        logger.warning("Invalid token for /me")
        return jsonify({'error': 'Invalid token'}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    logger.debug("Logout requested")
    return jsonify({"message": "Logged out successfully"}), 200