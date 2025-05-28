from flask import Blueprint, request, jsonify

contact_bp = Blueprint('contact', __name__)

# Sample in-memory storage (replace with DB logic if needed)
messages = []

@contact_bp.route('/', methods=['POST'])
def submit_message():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')

    if not name or not email or not message:
        return jsonify({'error': 'All fields are required'}), 400

    # Save message (simulate database save)
    messages.append({
        'name': name,
        'email': email,
        'message': message
    })

    return jsonify({'message': 'Message sent successfully'}), 201


@contact_bp.route('/', methods=['GET'])
def get_messages():
    return jsonify(messages), 200
