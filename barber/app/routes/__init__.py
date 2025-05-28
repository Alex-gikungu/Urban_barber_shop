from flask import Flask
from .auth import auth_bp
from .appointments import appointment_bp
from .customers import customers_bp
from .inventory import inventory_bp
from .payments import payments_bp
from .staff import staff_bp
from .contact import contact_bp
from .profile import profile_bp

def register_routes(app: Flask):
    # Authentication routes (login, register, Google login, etc.)
    app.register_blueprint(auth_bp, url_prefix='/auth')

    # Appointment routes
    app.register_blueprint(appointment_bp, url_prefix='/appointments')

    # Customer-related routes
    app.register_blueprint(customers_bp, url_prefix='/customers')

    # Inventory management routes
    app.register_blueprint(inventory_bp, url_prefix='/inventory')

    # Payment processing routes
    app.register_blueprint(payments_bp, url_prefix='/payments')

    # Staff management routes
    app.register_blueprint(staff_bp, url_prefix='/staff')

    app.register_blueprint(contact_bp, url_prefix='/contact')

    app.register_blueprint(profile_bp, url_prefix='/profile')


