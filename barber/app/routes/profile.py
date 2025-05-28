import jwt
import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from functools import wraps
from werkzeug.utils import secure_filename
from app.models import User, CustomerProfile, Notification, Schedule, Review
from app import db
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

profile_bp = Blueprint('profile', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            logger.warning("No token provided")
            return jsonify({'error': 'Unauthorized'}), 401
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                logger.warning("User not found")
                return jsonify({'error': 'Unauthorized'}), 401
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            logger.warning("Invalid token")
            return jsonify({'error': 'Invalid token'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@profile_bp.route('/profile/<int:user_id>', methods=['GET'])
@token_required
def get_profile(current_user, user_id):
    if current_user.id != user_id:
        logger.warning(f"Unauthorized access attempt by user_id: {current_user.id} for user_id: {user_id}")
        return jsonify({'error': 'Unauthorized'}), 403
    user = User.query.get(user_id)
    profile = CustomerProfile.query.filter_by(user_id=user_id).first()
    if not user:
        logger.warning(f"User not found for user_id: {user_id}")
        return jsonify({'error': 'User not found'}), 404
    if not profile:
        # Create a default profile if none exists
        profile = CustomerProfile(
            user_id=user_id,
            profile_image='https://via.placeholder.com/150',
            referral_code=f"REF{user_id}_{user.full_name.replace(' ', '_')}",
            preferences='',
            loyalty_points=0,
            visit_count=0,
            stars=0
        )
        db.session.add(profile)
        db.session.commit()
        logger.debug(f"Created default profile for user_id: {user_id}")
    return jsonify({
        'id': user.id,
        'fullName': user.full_name,
        'email': user.email,
        'phone': user.phone,
        'profileImage': profile.profile_image,
        'referralCode': profile.referral_code,
        'preferences': profile.preferences,
        'loyaltyPoints': profile.loyalty_points,
        'visitCount': profile.visit_count,
        'stars': profile.stars,
        'nextAppointment': profile.next_appointment.isoformat() if profile.next_appointment else None,
        'frequency': profile.frequency
    })

@profile_bp.route('/profile-image/<int:user_id>', methods=['POST'])
@token_required
def upload_profile_image(current_user, user_id):
    if current_user.id != user_id:
        logger.warning(f"Unauthorized image upload attempt by user_id: {current_user.id}")
        return jsonify({'error': 'Unauthorized'}), 403
    if 'image' not in request.files:
        logger.warning("No image file provided")
        return jsonify({'error': 'No image file provided'}), 400
    file = request.files['image']
    if file.filename == '':
        logger.warning("No selected file")
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{user_id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename}")
        upload_folder = os.path.join(current_app.root_path, 'static/uploads')
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        image_url = f"{request.url_root}static/uploads/{filename}"
        profile = CustomerProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            profile = CustomerProfile(
                user_id=user_id,
                profile_image=image_url,
                referral_code=f"REF{user_id}_{current_user.full_name.replace(' ', '_')}"
            )
            db.session.add(profile)
        else:
            profile.profile_image = image_url
        db.session.commit()
        logger.debug(f"Image uploaded for user_id: {user_id}, URL: {image_url}")
        return jsonify({'imageUrl': image_url})
    logger.warning("Invalid file type")
    return jsonify({'error': 'Invalid file type'}), 400

@profile_bp.route('/static/uploads/<filename>')
def serve_uploaded_file(filename):
    return send_from_directory(os.path.join(current_app.root_path, 'static/uploads'), filename)

@profile_bp.route('/notifications/<int:user_id>', methods=['GET'])
@token_required
def get_notifications(current_user, user_id):
    if current_user.id != user_id:
        logger.warning(f"Unauthorized notifications access by user_id: {current_user.id}")
        return jsonify({'error': 'Unauthorized'}), 403
    notifications = Notification.query.filter_by(user_id=user_id).all()
    return jsonify([
        {
            'id': notif.id,
            'message': notif.message,
            'is_read': notif.is_read,
            'created_at': notif.created_at.isoformat()
        } for notif in notifications
    ])

@profile_bp.route('/notifications/<int:notification_id>/read', methods=['PATCH'])
@token_required
def mark_notification_read(current_user, notification_id):
    notification = Notification.query.get(notification_id)
    if not notification or notification.user_id != current_user.id:
        logger.warning(f"Notification not found or unauthorized: {notification_id}")
        return jsonify({'error': 'Notification not found or unauthorized'}), 404
    notification.is_read = True
    db.session.commit()
    logger.debug(f"Notification marked as read: {notification_id}")
    return jsonify({'message': 'Notification marked as read'})

@profile_bp.route('/schedule', methods=['POST'])
@token_required
def add_schedule(current_user):
    data = request.json
    user_id = data.get('user_id')
    date = data.get('date')
    frequency = data.get('frequency')
    if current_user.id != user_id:
        logger.warning(f"Unauthorized schedule attempt by user_id: {current_user.id}")
        return jsonify({'error': 'Unauthorized'}), 403
    if not date or not frequency:
        logger.warning("Missing schedule data")
        return jsonify({'error': 'Missing required fields'}), 400
    profile = CustomerProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        profile = CustomerProfile(
            user_id=user_id,
            referral_code=f"REF{user_id}_{current_user.full_name.replace(' ', '_')}"
        )
        db.session.add(profile)
    try:
        profile.next_appointment = datetime.fromisoformat(date.replace('Z', '+00:00'))
        profile.frequency = frequency
        schedule = Schedule(user_id=user_id, date=date, frequency=frequency)
        db.session.add(schedule)
        db.session.commit()
        logger.debug(f"Schedule added for user_id: {user_id}")
        return jsonify({'message': 'Schedule added successfully'})
    except ValueError:
        logger.warning("Invalid date format")
        return jsonify({'error': 'Invalid date format'}), 400

@profile_bp.route('/reviews', methods=['POST'])
@token_required
def add_review(current_user):
    data = request.json
    barber_id = data.get('barber_id')
    rating = data.get('rating')
    comment = data.get('comment')
    if not barber_id or not rating:
        logger.warning("Missing review data")
        return jsonify({'error': 'Missing required fields'}), 400
    review = Review(
        customer_id=current_user.id,
        barber_id=barber_id,
        rating=rating,
        comment=comment
    )
    db.session.add(review)
    db.session.commit()
    logger.debug(f"Review added for barber_id: {barber_id}")
    return jsonify({'message': 'Review submitted successfully'})

@profile_bp.route('/preferences/<int:user_id>', methods=['PATCH'])
@token_required
def update_preferences(current_user, user_id):
    if current_user.id != user_id:
        logger.warning(f"Unauthorized preferences update by user_id: {current_user.id}")
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.json
    preferences = data.get('preferences')
    if preferences is None:
        logger.warning("Missing preferences data")
        return jsonify({'error': 'Missing preferences'}), 400
    profile = CustomerProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        profile = CustomerProfile(
            user_id=user_id,
            referral_code=f"REF{user_id}_{current_user.full_name.replace(' ', '_')}",
            preferences=preferences
        )
        db.session.add(profile)
    else:
        profile.preferences = preferences
    db.session.commit()
    logger.debug(f"Preferences updated for user_id: {user_id}")
    return jsonify({'message': 'Preferences updated successfully'})

@profile_bp.route('/loyalty/<int:user_id>', methods=['PATCH'])
@token_required
def update_loyalty(current_user, user_id):
    if current_user.id != user_id:
        logger.warning(f"Unauthorized loyalty update by user_id: {current_user.id}")
        return jsonify({'error': 'Unauthorized'}), 403
    profile = CustomerProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        profile = CustomerProfile(
            user_id=user_id,
            referral_code=f"REF{user_id}_{current_user.full_name.replace(' ', '_')}"
        )
        db.session.add(profile)
    profile.loyalty_points += 10
    profile.visit_count += 1
    profile.stars = min(profile.loyalty_points // 10, 5)  # Update stars based on loyalty points
    db.session.commit()
    logger.debug(f"Loyalty updated for user_id: {user_id}, Points: {profile.loyalty_points}, Visits: {profile.visit_count}, Stars: {profile.stars}")
    return jsonify({
        'message': 'Loyalty updated successfully',
        'loyaltyPoints': profile.loyalty_points,
        'visitCount': profile.visit_count,
        'stars': profile.stars
    })

@profile_bp.route('/referrals', methods=['POST'])
@token_required
def add_referral(current_user):
    data = request.json
    referred_user_id = data.get('referredUserId')
    if not referred_user_id:
        logger.warning("Missing referred user ID")
        return jsonify({'error': 'Missing referred user ID'}), 400
    referred_user = User.query.get(referred_user_id)
    if not referred_user:
        logger.warning(f"Referred user not found: {referred_user_id}")
        return jsonify({'error': 'Referred user not found'}), 404
    profile = CustomerProfile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        profile = CustomerProfile(
            user_id=current_user.id,
            referral_code=f"REF{current_user.id}_{current_user.full_name.replace(' ', '_')}"
        )
        db.session.add(profile)
    profile.loyalty_points += 20
    profile.stars = min(profile.loyalty_points // 10, 5)
    db.session.commit()
    logger.debug(f"Referral added for user_id: {current_user.id}, Referred: {referred_user_id}")
    return jsonify({'message': 'Referral bonus applied successfully'})