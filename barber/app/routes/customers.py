from flask import Blueprint, request, jsonify
from app.models import User
from app import db

customers_bp = Blueprint('customers', __name__)

# Create a new customer
@customers_bp.route('/', methods=['POST'])
def create_customer():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')

    if not name or not email:
        return jsonify({'error': 'Name and email are required'}), 400

    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400

    customer = User(full_name=name, email=email, phone=phone, role='customer')
    db.session.add(customer)
    db.session.commit()

    return jsonify({'message': 'Customer created successfully', 'customer': {
        'id': customer.id,
        'name': customer.full_name,
        'email': customer.email,
        'phone': customer.phone
    }}), 201

# Get all customers
@customers_bp.route('/', methods=['GET'])
def get_customers():
    customers = User.query.filter_by(role='customer').all()
    return jsonify([{
        'id': c.id,
        'name': c.full_name,
        'email': c.email,
        'phone': c.phone
    } for c in customers])

# Get customer by ID
@customers_bp.route('/<int:id>', methods=['GET'])
def get_customer(id):
    customer = User.query.filter_by(id=id, role='customer').first_or_404()
    return jsonify({
        'id': customer.id,
        'name': customer.full_name,
        'email': customer.email,
        'phone': customer.phone
    })

# Update customer
@customers_bp.route('/<int:id>', methods=['PUT'])
def update_customer(id):
    customer = User.query.filter_by(id=id, role='customer').first_or_404()
    data = request.json
    customer.full_name = data.get('name', customer.full_name)
    customer.email = data.get('email', customer.email)
    customer.phone = data.get('phone', customer.phone)

    db.session.commit()
    return jsonify({'message': 'Customer updated successfully'})

# Delete customer
@customers_bp.route('/<int:id>', methods=['DELETE'])
def delete_customer(id):
    customer = User.query.filter_by(id=id, role='customer').first_or_404()
    db.session.delete(customer)
    db.session.commit()
    return jsonify({'message': 'Customer deleted successfully'})
