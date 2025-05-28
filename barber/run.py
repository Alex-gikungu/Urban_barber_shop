from app import db, create_app  # make sure create_app is defined to return your Flask app
from app.models import Staff

def seed_staff():
    staff_members = [
        Staff(name='John Mwangi', email='john.mwangi@example.com', role='barber', phone='0712345678'),
        Staff(name='Michael Otieno', email='michael.otieno@example.com', role='barber', phone='0722334455'),
        Staff(name='David Njoroge', email='david.njoroge@example.com', role='barber', phone='0733456789'),
        Staff(name='Grace Wanjiku', email='grace.wanjiku@example.com', role='barber', phone='0745566778'),
        Staff(name='Linda Achieng', email='linda.achieng@example.com', role='barber', phone='0756677889'),
    ]

    try:
        db.session.bulk_save_objects(staff_members)
        db.session.commit()
        print("✅ Successfully added test staff members.")
    except Exception as e:
        db.session.rollback()
        print("❌ Failed to add staff:", e)

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        seed_staff()