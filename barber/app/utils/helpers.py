import random
import string
from datetime import datetime


def generate_random_code(length=8):
    """Generates a random alphanumeric code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


def format_datetime(dt: datetime):
    """Formats a datetime object into a human-readable string."""
    return dt.strftime('%Y-%m-%d %H:%M:%S')


def response(success=True, message='', data=None):
    """Standardized API response format."""
    return {
        'success': success,
        'message': message,
        'data': data or {}
    }
