from flask import Blueprint, request, jsonify
from app.models import Payment, User, Appointment
from app import db
from datetime import datetime
import requests
import base64

payments_bp = Blueprint('payments', __name__)

# M-Pesa Daraja API credentials (sandbox mode)
CONSUMER_KEY = 'uKlxRbEnvwmvOBtfaRmQcAboUHcWoBT6sGpWAEeyQLUXojDj'
CONSUMER_SECRET = '8O5AW1KguKKbEJAAkI7a60rvnzgMeHPEtzFranW0MMe879c8U4gmrcrWRGoGJEit'
BUSINESS_SHORTCODE = '174379'
PASSKEY = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
CALLBACK_URL = 'https://example.com/callback'

# 1. Get M-Pesa Access Token
def get_mpesa_token():
    url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    response = requests.get(url, auth=(CONSUMER_KEY, CONSUMER_SECRET))
    return response.json().get('access_token')

# 2. Initiate STK Push
def initiate_stk_push(phone_number, amount):
    access_token = get_mpesa_token()
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password = base64.b64encode((BUSINESS_SHORTCODE + PASSKEY + timestamp).encode()).decode()

    # Normalize phone number for M-Pesa API
    # Remove + if present, ensure starts with '254' country code
    if phone_number.startswith('+'):
        phone_number = phone_number[1:]
    elif phone_number.startswith('0'):
        phone_number = '254' + phone_number[1:]
    # else assume it's already in the correct format

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "BusinessShortCode": BUSINESS_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone_number,
        "PartyB": BUSINESS_SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": CALLBACK_URL,
        "AccountReference": "Appointment",
        "TransactionDesc": "Payment for Appointment"
    }

    response = requests.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        json=payload,
        headers=headers
    )
    return response.json()



# 3. Create a new payment
@payments_bp.route('/', methods=['POST'])
def create_payment():
    data = request.json
    print("DEBUG: Incoming JSON data:", data)  # Log incoming data

    user_id = data.get('user_id')
    booking_id = data.get('booking_id')
    amount = data.get('amount')
    payment_method = data.get('payment_method')
    phone_number = data.get('phone_number')  # Required for M-Pesa

    missing_fields = []
    for field_name, value in [('user_id', user_id), ('booking_id', booking_id), ('amount', amount), ('payment_method', payment_method)]:
        if not value:
            missing_fields.append(field_name)

    if missing_fields:
        error_msg = f"Missing required fields: {', '.join(missing_fields)}"
        print("DEBUG:", error_msg)
        return jsonify({'error': error_msg}), 400

    if payment_method.lower() == 'mpesa':
        if not phone_number:
            error_msg = "Phone number is required for M-Pesa payments"
            print("DEBUG:", error_msg)
            return jsonify({'error': error_msg}), 400
        
        print(f"DEBUG: Initiating STK Push for phone {phone_number} amount {amount}")
        response = initiate_stk_push(phone_number, amount)
        print("DEBUG: STK Push response:", response)

        if response.get("ResponseCode") == "0":
            payment = Payment(
                user_id=user_id,
                booking_id=booking_id,
                amount=amount,
                payment_method=payment_method,
                payment_date=datetime.utcnow()
            )
            db.session.add(payment)
            db.session.commit()

            return jsonify({
                'message': 'STK Push sent. Complete payment on your phone.',
                'payment_id': payment.id,
                'checkout_request_id': response.get('CheckoutRequestID')
            }), 200
        else:
            error_msg = f"Failed to initiate STK Push: {response}"
            print("DEBUG:", error_msg)
            return jsonify({'error': error_msg}), 400

    # If payment method is not mpesa, record the payment directly
    payment = Payment(
        user_id=user_id,
        booking_id=booking_id,
        amount=amount,
        payment_method=payment_method,
        payment_date=datetime.utcnow()
    )
    db.session.add(payment)
    db.session.commit()

    return jsonify({'message': 'Payment successful', 'payment_id': payment.id}), 201



# 4. Get all payments
@payments_bp.route('/', methods=['GET'])
def get_all_payments():
    payments = Payment.query.all()
    return jsonify([{
        'id': p.id,
        'user_id': p.user_id,
        'booking_id': p.booking_id,
        'amount': p.amount,
        'payment_method': p.payment_method,
        'payment_date': p.payment_date
    } for p in payments])


# 5. Get payments by user ID
@payments_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_payments(user_id):
    payments = Payment.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': p.id,
        'booking_id': p.booking_id,
        'amount': p.amount,
        'payment_method': p.payment_method,
        'payment_date': p.payment_date
    } for p in payments])


# 6. Get payments by appointment ID
@payments_bp.route('/appointment/<int:booking_id>', methods=['GET'])
def get_appointment_payments(booking_id):
    payments = Payment.query.filter_by(booking_id=booking_id).all()
    return jsonify([{
        'id': p.id,
        'user_id': p.user_id,
        'amount': p.amount,
        'payment_method': p.payment_method,
        'payment_date': p.payment_date
    } for p in payments])


# 7. Delete payment by ID
@payments_bp.route('/<int:id>', methods=['DELETE'])
def delete_payment(id):
    payment = Payment.query.get_or_404(id)
    db.session.delete(payment)
    db.session.commit()
    return jsonify({'message': 'Payment deleted'})
