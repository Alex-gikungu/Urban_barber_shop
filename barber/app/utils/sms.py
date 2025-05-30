from flask import Blueprint, request, jsonify
from twilio.rest import Client
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Twilio credentials
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

sms_bp = Blueprint('sms', __name__, url_prefix='/api/sms')

# POST endpoint to send SMS
@sms_bp.route('/send', methods=['POST'])
def send_sms():
    data = request.get_json()
    logger.debug(f"Received SMS data: {data}")

    required_fields = ['to_phone', 'message']
    missing_fields = [field for field in required_fields if field not in data or not data[field]]
    if missing_fields:
        logger.error(f"Missing fields: {missing_fields}")
        return jsonify({"error": f"Missing required fields: {missing_fields}"}), 400

    to_phone = data['to_phone']
    message = data['message']

    # Validate phone number format
    if not to_phone.startswith('+'):
        logger.error("Invalid phone number format")
        return jsonify({"error": "Invalid phone number format. Must start with country code (e.g., +254)."}), 400

    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        sms = client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=to_phone
        )
        logger.info(f"SMS sent successfully with SID {sms.sid}")
        return jsonify({"message": "SMS sent successfully", "sid": sms.sid}), 200
    except Exception as e:
        logger.error(f"Error sending SMS: {str(e)}")
        return jsonify({"error": f"Failed to send SMS: {str(e)}"}), 500