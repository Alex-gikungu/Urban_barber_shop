




from app import db, create_app
from app.models import Service

# Update with a valid barber ID from your database
TEST_BARBER_ID = 1

SERVICES = [
    {"title": "Classic Haircut", "price": 30.0, "description": "A traditional haircut tailored to your style."},
    {"title": "Beard Trim", "price": 15.0, "description": "Precision trimming for a neat and tidy beard."},
    {"title": "Hot Towel Shave", "price": 20.0, "description": "A relaxing shave with a hot towel treatment."},
    {"title": "Hair Coloring", "price": 50.0, "description": "Professional hair coloring with premium products."},
    {"title": "Hair Wash", "price": 10.0, "description": "A refreshing hair wash with quality shampoo."},
    {"title": "Hair Styling", "price": 25.0, "description": "Custom styling to enhance your look."},
    {"title": "Scalp Massage", "price": 15.0, "description": "A soothing massage to relax your scalp."},
    {"title": "Kids Haircut", "price": 20.0, "description": "A fun and quick haircut for kids."},
    {"title": "Fade Haircut", "price": 25.0, "description": "A stylish fade haircut with precise blending."},
    {"title": "Facial Treatment", "price": 30.0, "description": "A rejuvenating facial for clean and healthy skin."},
    {"title": "Line-Up and Dreadlock Styling", "price": 60.0, "description": "Sharp line-up and expert dreadlock maintenance."},
]

app = create_app()

with app.app_context():
    for service_data in SERVICES:
        existing = Service.query.filter_by(title=service_data["title"], barber_id=TEST_BARBER_ID).first()
        if not existing:
            service = Service(
                title=service_data["title"],
                price=service_data["price"],
                description=service_data["description"],
                barber_id=TEST_BARBER_ID
            )
            db.session.add(service)
            print(f"Added: {service.title}")
    db.session.commit()
    print("All services added.")
