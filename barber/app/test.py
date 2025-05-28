from app import db
from app.models import Staff

def seed_staff():
    staff_members = [
        Staff(name='John Mwangi', email='john.mwangi@example.com', role='barber', phone='0712345678'),
        Staff(name='Michael Otieno', email='michael.otieno@example.com', role='receptionist', phone='0722334455'),
        Staff(name='David Njoroge', email='david.njoroge@example.com', role='cleaner', phone='0733456789'),
        Staff(name='Grace Wanjiku', email='grace.wanjiku@example.com', role='manager', phone='0745566778'),
        Staff(name='Linda Achieng', email='linda.achieng@example.com', role='stylist', phone='0756677889'),
    ]

    try:
        db.session.bulk_save_objects(staff_members)
        db.session.commit()
        print("✅ Successfully added test staff members.")
    except Exception as e:
        db.session.rollback()
        print("❌ Failed to add staff:", e)

if __name__ == '__main__':
    seed_staff()
