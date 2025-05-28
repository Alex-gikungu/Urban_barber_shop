from flask import Blueprint, request, jsonify
from app.models import InventoryItem
from app import db

inventory_bp = Blueprint('inventory', __name__)

# Add inventory item
@inventory_bp.route('/inventory', methods=['POST'])
def add_inventory_item():
    data = request.json
    name = data.get('name')
    quantity = data.get('quantity', 0)
    description = data.get('description', '')

    if not name:
        return jsonify({'error': 'Item name is required'}), 400

    item = InventoryItem(name=name, quantity=quantity, description=description)
    db.session.add(item)
    db.session.commit()

    return jsonify({'message': 'Item added to inventory', 'item': {
        'id': item.id, 'name': item.name, 'quantity': item.quantity, 'description': item.description
    }}), 201

# Get all inventory items
@inventory_bp.route('/inventory', methods=['GET'])
def get_inventory():
    items = InventoryItem.query.all()
    return jsonify([{
        'id': i.id,
        'name': i.name,
        'quantity': i.quantity,
        'description': i.description
    } for i in items])

# Update inventory item
@inventory_bp.route('/inventory/<int:id>', methods=['PUT'])
def update_inventory_item(id):
    item = InventoryItem.query.get_or_404(id)
    data = request.json
    item.name = data.get('name', item.name)
    item.quantity = data.get('quantity', item.quantity)
    item.description = data.get('description', item.description)

    db.session.commit()
    return jsonify({'message': 'Inventory item updated'})

# Delete inventory item
@inventory_bp.route('/inventory/<int:id>', methods=['DELETE'])
def delete_inventory_item(id):
    item = InventoryItem.query.get_or_404(id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Inventory item deleted'})
