from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20) ,nullable=True)
    invitation_code = db.Column(db.String(50), nullable=True)  # New field
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20), default='customer')  # customer, barber, admin
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    profile_pic = db.Column(db.String(255), nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    barber_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # added barber
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)  # added service
    
    status = db.Column(db.String(20), default="pending")
    date = db.Column(db.DateTime, nullable=False)
    notes = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    # Relationships
    customer = db.relationship("User", foreign_keys=[customer_id], backref="customer_appointments")
    barber = db.relationship("User", foreign_keys=[barber_id], backref="barber_appointments")
    service = db.relationship("Service", backref="appointments")

    
class InventoryItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, default=0)
    unit_price = db.Column(db.Float, nullable=True)
    threshold = db.Column(db.Integer, default=5)
    supplier = db.Column(db.String(100), nullable=True)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)


class EmployeeSchedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    barber_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    day = db.Column(db.String(20))  # e.g., Monday
    shift_start = db.Column(db.Time)
    shift_end = db.Column(db.Time)
    status = db.Column(db.String(20), default='active')  # active, off, leave

    barber = db.relationship("User", backref="schedules")


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    amount = db.Column(db.Float, nullable=False)
    method = db.Column(db.String(20))  # cash, mpesa
    reference = db.Column(db.String(100))  # e.g., Mpesa code
    status = db.Column(db.String(20), default='completed')  # pending, failed, completed
    date = db.Column(db.DateTime, default=datetime.utcnow)

    customer = db.relationship("User", backref="transactions")


class CustomerProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    
    profile_image = db.Column(db.String(255), nullable=True)
    referral_code = db.Column(db.String(50), unique=True, nullable=True)
    
    preferences = db.Column(db.Text)
    loyalty_points = db.Column(db.Integer, default=0)
    visit_count = db.Column(db.Integer, default=0)
    stars = db.Column(db.Integer, default=0)

    # Scheduling
    next_appointment = db.Column(db.DateTime, nullable=True)
    frequency = db.Column(db.String(50), default='monthly')  # e.g., weekly, monthly

    user = db.relationship("User", backref=db.backref("profile", uselist=False))



class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    barber_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1 to 5
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    customer = db.relationship("User", foreign_keys=[customer_id], backref="reviews_given")
    barber = db.relationship("User", foreign_keys=[barber_id], backref="reviews_received")


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    message = db.Column(db.String(255), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="notifications")


class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)  # e.g., cash, mpesa
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='payments')
    booking = db.relationship('Booking', backref='payments')  # ✅ fixed here


class Staff(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20))


    
class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    discount_price = db.Column(db.Float)
    barber_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    description = db.Column(db.Text)
    barber = db.relationship("User", backref="services")


class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.String(50), nullable=False)  # ISO format string
    frequency = db.Column(db.String(20), nullable=False)  # e.g., 'weekly'


class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(20), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Foreign Keys
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    barber_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    # Relationships
    service = db.relationship("Service", backref="bookings")
    barber = db.relationship("User", backref="bookings")