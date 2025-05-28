from flask import Blueprint, request, jsonify, current_app
from app.models import Appointment, User, Service
from app import db
from datetime import datetime
import jwt
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

appointment_bp = Blueprint('appointment_bp', __name__, url_prefix='/appointments')

# Helper function to serialize appointment data
def serialize_appointment(appointment):
    return {
        'id': appointment.id,
        'customer_id': appointment.customer_id,
        'barber_id': appointment.barber_id,
        'service_id': appointment.service_id,
        'status': appointment.status,
        'date': appointment.date.isoformat(),
        'notes': appointment.notes,
        'created_at': appointment.created_at.isoformat() if appointment.created_at else None,
        'updated_at': appointment.updated_at.isoformat() if appointment.updated_at else None,
    }

# GET all appointments
@appointment_bp.route('/', methods=['GET'])
def get_all_appointments():
    appointments = Appointment.query.all()
    return jsonify([serialize_appointment(a) for a in appointments]), 200

# GET individual appointment by ID
@appointment_bp.route('/<int:appointment_id>', methods=['GET'])
def get_appointment(appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    return jsonify(serialize_appointment(appointment)), 200

# GET appointments for a specific user
@appointment_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_appointments(user_id):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    try:
        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.get(data['user_id'])
        if not user or user.id != user_id:
            return jsonify({'error': 'Unauthorized'}), 401
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

    appointments = Appointment.query.filter_by(customer_id=user_id).all()
    return jsonify([serialize_appointment(a) for a in appointments]), 200

# POST create a new appointment
@appointment_bp.route('/', methods=['POST'])
def create_appointment():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return jsonify({'error': 'No token provided.'}), 401

    try:
        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({'error': 'User not found.'}), 404
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token.'}), 401
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired.'}), 401

    data = request.get_json()
    logger.debug(f"Received appointment data: {data}")

    if not data.get('date'):
        return jsonify({'error': 'Date is missing.'}), 400
    if not data.get('service'):
        return jsonify({'error': 'Service is missing.'}), 400

    # Look up the Service by title
    service_title = data.get('service')
    service = Service.query.filter_by(title=service_title).first()
    if not service:
        return jsonify({'error': f'Service with title "{service_title}" not found.'}), 404

    try:
        appointment_date = datetime.fromisoformat(data.get('date').replace('Z', '+00:00'))
        new_appointment = Appointment(
            customer_id=user.id,
            barber_id=data.get('barber_id'),
            service_id=service.id,  # Use service_id
            date=appointment_date,
            status=data.get('status', 'pending'),
            notes=data.get('notes')
        )
        db.session.add(new_appointment)
        db.session.commit()
        return jsonify({'message': 'Appointment created successfully'}), 201
    except ValueError as e:
        logger.error(f"Date parsing error: {str(e)}, date value: {data.get('date')}")
        return jsonify({'error': 'Invalid date format. Use ISO format (e.g., 2025-05-27T14:30:00Z)'}), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating appointment: {str(e)}")
        return jsonify({'error': str(e)}), 400

# PUT request to update an existing appointment
@appointment_bp.route('/<int:appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    data = request.get_json()

    # Optional fields to update
    customer_id = data.get('customer_id')
    barber_id = data.get('barber_id')
    service_title = data.get('service')
    date_str = data.get('date')
    notes = data.get('notes')
    status = data.get('status')

    if customer_id:
        if not User.query.get(customer_id):
            return jsonify({'error': 'Customer not found.'}), 404
        appointment.customer_id = customer_id

    if barber_id:
        if not User.query.get(barber_id):
            return jsonify({'error': 'Barber not found.'}), 404
        appointment.barber_id = barber_id

    if service_title:
        service = Service.query.filter_by(title=service_title).first()
        if not service:
            return jsonify({'error': f'Service with title "{service_title}" not found.'}), 404
        appointment.service_id = service.id

    if date_str:
        try:
            appointment.date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use ISO format.'}), 400

    if notes is not None:
        appointment.notes = notes

    if status:
        if status not in ['pending', 'confirmed', 'cancelled', 'completed']:
            return jsonify({'error': 'Invalid status value.'}), 400
        appointment.status = status

    db.session.commit()

    return jsonify(serialize_appointment(appointment)), 200

# DELETE an appointment by ID
@appointment_bp.route('/<int:appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return jsonify({'error': 'No token provided.'}), 401

    try:
        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({'error': 'User not found.'}), 404
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired.'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token.'}), 401

    appointment = Appointment.query.get_or_404(appointment_id)
    if appointment.customer_id != user.id:
        return jsonify({'error': 'Unauthorized.'}), 403

    db.session.delete(appointment)
    db.session.commit()
    return jsonify({'message': f'Appointment {appointment_id} deleted'}), 200