from app import db, create_app
from app.models import User  # Replace with Admin if you have a separate model
from werkzeug.security import generate_password_hash

def seed_admin():
    admin_user = User(
        full_name='Admin User',
        email='admin@gmail.com',
        phone='0700000000',
        role='admin',
        password_hash=generate_password_hash('admin123')  # Replace with your desired default password
    )

    try:
        db.session.add(admin_user)
        db.session.commit()
        print("✅ Successfully added admin user.")
    except Exception as e:
        db.session.rollback()
        print("❌ Failed to add admin:", e)

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        seed_admin()
