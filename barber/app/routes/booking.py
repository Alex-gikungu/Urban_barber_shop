from flask import Blueprint, request, jsonify
from app import db
from app.models import Booking, Service, User
from datetime import datetime

booking_bp = Blueprint('booking', __name__, url_prefix='/bookings')


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

    required_fields = ['date', 'time', 'phone_number', 'service_id']
    missing_fields = [field for field in required_fields if field not in data or not data[field]]

    if missing_fields:
        print("❌ Missing fields:", missing_fields)
        return jsonify({"error": f"Missing required booking fields: {missing_fields}"}), 400

    try:
        booking = Booking(
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            time=data['time'],
            phone_number=data['phone_number'],
            service_id=data['service_id'],
            barber_id=data.get('barber_id')  # Allow None if not provided
        )
        db.session.add(booking)
        db.session.commit()
        print("✅ Booking successfully created!")
        return jsonify({"message": "Booking created successfully", "booking_id": booking.id}), 201
    except Exception as e:
        db.session.rollback()
        print("💥 Exception during booking creation:", str(e))
        return jsonify({"error": str(e)}), 500
