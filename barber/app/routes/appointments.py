from flask import Blueprint, request, jsonify, current_app
from app.models import Appointment, User, Service
from app import db
from datetime import datetime
import jwt
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

appointment_bp = Blueprint('appointment_bp', __name__, url_prefix='/appointments')

# Serialize appointment helper
def serialize_appointment(appointment):
    logger.debug(f"Serializing appointment {appointment.id}: customer={appointment.customer}, barber={appointment.barber}, service={appointment.service}")
    return {
        'id': appointment.id,
        'customer_id': appointment.customer_id,
        'customer_name': appointment.customer.full_name if appointment.customer else 'N/A',
        'barber_id': appointment.barber_id,
        'barber_name': appointment.barber.full_name if appointment.barber else 'N/A',
        'service_id': appointment.service_id,
        'service_name': appointment.service.title if appointment.service else 'N/A',
        'status': appointment.status,
        'date': appointment.date.isoformat(),
        'notes': appointment.notes,
        'created_at': appointment.created_at.isoformat() if appointment.created_at else None,
        'updated_at': appointment.updated_at.isoformat() if appointment.updated_at else None,
    }

# Send email notification
def send_email(to_email, subject, body):
    try:
        msg = MIMEMultipart()
        msg['From'] = os.getenv("EMAIL_USER")
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(os.getenv("EMAIL_USER"), os.getenv("EMAIL_PASS"))
            server.send_message(msg)
        logger.info(f"Email sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")

# GET all appointments
@appointment_bp.route('/', methods=['GET'])
def get_all_appointments():
    appointments = Appointment.query.all()
    return jsonify([serialize_appointment(a) for a in appointments]), 200

# GET appointment by ID
@appointment_bp.route('/<int:appointment_id>', methods=['GET'])
def get_appointment(appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    return jsonify(serialize_appointment(appointment)), 200

# GET appointments for a user
@appointment_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_appointments(user_id):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    try:
        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        if data['user_id'] != user_id:
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
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired.'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token.'}), 401

    data = request.get_json()
    logger.debug(f"Received appointment data: {data}")

    if not data.get('date') or not data.get('service'):
        return jsonify({'error': 'Missing required fields.'}), 400

    service = Service.query.filter_by(title=data['service']).first()
    if not service:
        return jsonify({'error': f'Service {data["service"]} not found.'}), 404

    try:
        appointment_date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
        new_appointment = Appointment(
            customer_id=user.id,
            barber_id=data.get('barber_id'),
            service_id=service.id,
            date=appointment_date,
            status=data.get('status', 'pending'),
            notes=data.get('notes')
        )
        db.session.add(new_appointment)
        db.session.commit()

        # Send email confirmation to customer
        subject = "Appointment Confirmation"
        message = f"""
        Hi {user.full_name},

        Your appointment for {service.title} has been scheduled on {appointment_date.strftime('%Y-%m-%d %H:%M:%S')}.

        Status: {new_appointment.status}
        Notes: {data.get('notes', 'None')}

        Thank you for choosing us!
        """
        send_email(user.email, subject, message)

        return jsonify({'message': 'Appointment created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating appointment: {str(e)}")
        return jsonify({'error': 'Failed to create appointment.'}), 500

# PUT update appointment
@appointment_bp.route('/<int:appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
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
    if user.role not in ['barber', 'admin'] and user.id != appointment.customer_id:
        return jsonify({'error': 'Unauthorized to update this appointment.'}), 403

    data = request.get_json()
    if 'customer_id' in data and User.query.get(data['customer_id']):
        appointment.customer_id = data['customer_id']

    if 'barber_id' in data and User.query.get(data['barber_id']):
        appointment.barber_id = data['barber_id']

    if 'service' in data:
        service = Service.query.filter_by(title=data['service']).first()
        if not service:
            return jsonify({'error': 'Service not found.'}), 404
        appointment.service_id = service.id

    if 'date' in data:
        try:
            appointment.date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid date format.'}), 400

    if 'notes' in data:
        appointment.notes = data['notes']

    if 'status' in data:
        if data['status'] not in ['pending', 'confirmed', 'cancelled', 'completed']:
            return jsonify({'error': 'Invalid status value.'}), 400
        appointment.status = data['status']

    try:
        db.session.commit()
        return jsonify(serialize_appointment(appointment)), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating appointment: {str(e)}")
        return jsonify({'error': 'Failed to update appointment.'}), 500

# DELETE appointment
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
        return jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

    appointment = Appointment.query.get_or_404(appointment_id)
    if user.id != appointment.customer_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized.'}), 403

    db.session.delete(appointment)
    db.session.commit()
    return jsonify({'message': f'Appointment {appointment_id} deleted'}), 200
