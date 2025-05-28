from flask import Blueprint, request, jsonify
from app.models import Staff  # Make sure this points correctly to your Staff model
from app import db
import logging

logger = logging.getLogger(__name__)

staff_bp = Blueprint('staff', __name__)

# GET all staff
@staff_bp.route('/', methods=['GET'])
def get_staff():
    logger.debug("Fetching all staff")
    staff_list = Staff.query.all()
    return jsonify([
        {
            'id': staff.id,
            'name': staff.name,
            'email': staff.email,
            'role': staff.role,
            'phone': staff.phone
        } for staff in staff_list
    ])

# POST new staff
@staff_bp.route('/', methods=['POST'])
def add_staff():
    data = request.get_json()
    try:
        new_staff = Staff(
            name=data['name'],
            email=data['email'],
            role=data['role'],
            phone=data.get('phone')  # phone is optional
        )
        db.session.add(new_staff)
        db.session.commit()
        return jsonify({'message': 'Staff added successfully'}), 201
    except Exception as e:
        logger.error(f"Error adding staff: {e}")
        return jsonify({'error': str(e)}), 400

# PATCH update staff
@staff_bp.route('/<int:id>', methods=['PATCH'])
def update_staff(id):
    data = request.get_json()
    staff = Staff.query.get_or_404(id)

    if 'name' in data:
        staff.name = data['name']
    if 'email' in data:
        staff.email = data['email']
    if 'role' in data:
        staff.role = data['role']
    if 'phone' in data:
        staff.phone = data['phone']

    try:
        db.session.commit()
        return jsonify({'message': 'Staff updated successfully'})
    except Exception as e:
        logger.error(f"Error updating staff: {e}")
        return jsonify({'error': str(e)}), 400

# DELETE staff
@staff_bp.route('/<int:id>', methods=['DELETE'])
def delete_staff(id):
    staff = Staff.query.get_or_404(id)
    try:
        db.session.delete(staff)
        db.session.commit()
        return jsonify({'message': 'Staff deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting staff: {e}")
        return jsonify({'error': str(e)}), 400

