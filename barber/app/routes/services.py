from flask import Blueprint, request, jsonify, current_app
from app.models import Service, User
from app import db
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

service_bp = Blueprint('service_bp', __name__, url_prefix='/services')

# Helper function to serialize service data
def serialize_service(service):
    return {
        'id': service.id,
        'title': service.title,
        'price': service.price,
        'discount_price': service.discount_price,
        'barber_id': service.barber_id,
        'description': service.description,
        'barber_name': service.barber.name if service.barber else None
    }

# GET all services
@service_bp.route('/', methods=['GET'])
def get_all_services():
    services = Service.query.all()
    return jsonify([serialize_service(service) for service in services]), 200

# GET a specific service by ID
@service_bp.route('/<int:service_id>', methods=['GET'])
def get_service(service_id):
    service = Service.query.get_or_404(service_id)
    return jsonify(serialize_service(service)), 200

# POST create a new service (no auth)
@service_bp.route('/', methods=['POST'])
def create_service():
    data = request.get_json()
    logger.debug(f"Received service data: {data}")

    if not data.get('title') or not data.get('price') or not data.get('barber_id'):
        return jsonify({'error': 'Title, price, and barber_id are required.'}), 400

    barber = User.query.get(data['barber_id'])
    if not barber:
        return jsonify({'error': 'Barber not found.'}), 404
    if barber.role != 'barber':
        return jsonify({'error': 'User is not a barber.'}), 400

    if Service.query.filter_by(title=data['title']).first():
        return jsonify({'error': f"Service with title '{data['title']}' already exists."}), 400

    try:
        new_service = Service(
            title=data['title'],
            price=float(data['price']),
            discount_price=float(data['discount_price']) if data.get('discount_price') else None,
            barber_id=data['barber_id'],
            description=data.get('description')
        )
        db.session.add(new_service)
        db.session.commit()
        return jsonify({'message': 'Service created successfully', 'service': serialize_service(new_service)}), 201
    except ValueError:
        return jsonify({'error': 'Invalid price or discount_price format.'}), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating service: {str(e)}")
        return jsonify({'error': str(e)}), 400

# PUT update an existing service (no auth)
@service_bp.route('/<int:service_id>', methods=['PUT'])
def update_service(service_id):
    service = Service.query.get_or_404(service_id)
    data = request.get_json()
    logger.debug(f"Received update data for service {service_id}: {data}")

    if 'title' in data:
        if Service.query.filter(Service.title == data['title'], Service.id != service_id).first():
            return jsonify({'error': f"Service with title '{data['title']}' already exists."}), 400
        service.title = data['title']

    if 'price' in data:
        try:
            service.price = float(data['price'])
        except ValueError:
            return jsonify({'error': 'Invalid price format.'}), 400

    if 'discount_price' in data:
        try:
            service.discount_price = float(data['discount_price']) if data['discount_price'] else None
        except ValueError:
            return jsonify({'error': 'Invalid discount_price format.'}), 400

    if 'barber_id' in data:
        barber = User.query.get(data['barber_id'])
        if not barber:
            return jsonify({'error': 'Barber not found.'}), 404
        if barber.role != 'barber':
            return jsonify({'error': 'User is not a barber.'}), 400
        service.barber_id = data['barber_id']

    if 'description' in data:
        service.description = data['description']

    try:
        db.session.commit()
        return jsonify({'message': 'Service updated successfully', 'service': serialize_service(service)}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating service: {str(e)}")
        return jsonify({'error': str(e)}), 400

# DELETE a service (no auth)
@service_bp.route('/<int:service_id>', methods=['DELETE'])
def delete_service(service_id):
    service = Service.query.get_or_404(service_id)
    try:
        db.session.delete(service)
        db.session.commit()
        return jsonify({'message': f'Service {service_id} deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting service: {str(e)}")
        return jsonify({'error': str(e)}), 400
