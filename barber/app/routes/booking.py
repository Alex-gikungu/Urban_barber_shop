from flask import Blueprint, request, jsonify
from app import db
from app.models import Booking, Service, User
from datetime import datetime
from app.utils.email import send_booking_confirmation

booking_bp = Blueprint('booking_bp', __name__, url_prefix='/bookings')


# GET all bookings
@booking_bp.route('/', methods=['GET'])
def get_bookings():
    bookings = Booking.query.all()
    result = []
    for booking in bookings:
        result.append({
            'id': booking.id,
            'date': booking.date.strftime('%Y-%m-%d'),
            'time': booking.time,
            'phone_number': booking.phone_number,
            'service': booking.service.title if booking.service else None,
            'barber': booking.barber.name if booking.barber else None,
            'created_at': booking.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    return jsonify(result), 200


# POST a new booking
@booking_bp.route('/', methods=['POST'])
def create_booking():
    data = request.get_json()
    print("📥 Received JSON data:", data)

    # Ensure required fields
    required_fields = ['user_id', 'service_id', 'date', 'time', 'phone_number']
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        print("❌ Missing fields:", missing_fields)
        return jsonify({"error": f"Missing required booking fields: {missing_fields}"}), 400

    # Fetch user from DB
    user = User.query.get(data['user_id'])
    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        # Parse date
        booking_date = datetime.strptime(data['date'], '%Y-%m-%d').date()

        # Create booking record
        booking = Booking(
            date=booking_date,
            time=data['time'],
            phone_number=data['phone_number'],
            service_id=data['service_id'],
            barber_id=data.get('barber_id')
        )
        db.session.add(booking)
        db.session.commit()
        print("✅ Booking successfully created! ID:", booking.id)

        # Send booking confirmation email using user's details
        service = Service.query.get(data['service_id'])
        dt_str = f"{data['date']} at {data['time']}"
        success, info = send_booking_confirmation(
            to_email=user.email,
            customer_name=getattr(user, 'full_name', user.name if hasattr(user, 'name') else ''),
            service_name=service.title if service else 'your service',
            date_time=dt_str
        )
        if not success:
            print("⚠️ Email send failed:", info)

        return jsonify({
            "message": "Booking created and confirmation email sent",
            "booking_id": booking.id
        }), 201

    except Exception as e:
        db.session.rollback()
        print("💥 Exception during booking creation:", str(e))
        return jsonify({"error": str(e)}), 500
