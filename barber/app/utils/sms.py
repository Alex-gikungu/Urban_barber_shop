from twilio.rest import Client
import os
from dotenv import load_dotenv

load_dotenv()


# Load credentials from .env
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')


def send_sms(to_phone, message):
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

        message = client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=to_phone
        )

        return True, f"SMS sent successfully with SID {message.sid}"
    except Exception as e:
        return False, str(e)
