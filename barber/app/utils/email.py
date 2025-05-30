from flask_mail import Message
from flask import url_for
from app import mail


def send_booking_confirmation(to_email, customer_name, service_name, date_time):
    try:
        msg = Message("🎉 Your Appointment is Confirmed!", recipients=[to_email])
        msg.body = f"""Hello {customer_name},

Thank you for choosing Smart Barber!

We're excited to let you know that your appointment for **{service_name}** has been successfully booked for **{date_time}**.

📍 Please arrive at least 10 minutes before your scheduled time so we can serve you promptly.

If you have any questions or need to make changes, feel free to reach out to us.

Looking forward to providing you with an exceptional grooming experience!

Warm regards,  
✂️ Smart Barber Team
"""
        mail.send(msg)
        return True, "Booking confirmation email sent"
    except Exception as e:
        return False, str(e)



def send_appointment_reminder(to_email, customer_name, service_name, date_time, appointment_id):
    try:
        cancel_url = url_for('cancel_appointment', appointment_id=appointment_id, _external=True)
        msg = Message("⏰ Reminder: Your Upcoming Appointment", recipients=[to_email])
        msg.body = f"""Hello {customer_name},

Just a quick reminder that your appointment for **{service_name}** is scheduled on **{date_time}**.

We’re preparing to welcome you and ensure you get the top-notch grooming you deserve. 🧖‍♂️

🙋 If you're no longer able to attend, please cancel your appointment using the link below:
🔗 Cancel Appointment: {cancel_url}

Your time is important to us, and we appreciate your consideration.

Warm regards,  
✂️ Smart Barber Team
"""
        mail.send(msg)
        return True, "Appointment reminder email sent"
    except Exception as e:
        return False, str(e)

