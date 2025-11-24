Appointment Scheduler Walkthrough (v2)
The application has been upgraded with a Node.js backend, JSON storage, and a full calendar view.

Features
1. Calendar View
Month Navigation: Use the < and > buttons to switch months.
Availability: Days are generated dynamically. Weekends and past days are disabled.
Visuals: Selected day is highlighted. Today is marked with a subtle background.
2. Backend Integration
Storage: Appointments are saved in 

data/appointments.json
.
API:
GET /api/slots: Fetches current bookings to prevent double-booking.
POST /api/book: Saves new bookings and validates data.
Validation:
Prevents booking past slots.
Prevents double-booking the same slot.
Unique Email: Prevents the same email from booking multiple times (as requested).
3. Booking Flow
Select a valid day.
Select an available time slot (booked slots appear crossed out).
Fill in the form.
Submit. A success message ("Toast") appears, and the slot is immediately marked as booked.
How to Run
Since this now requires a backend, you must run the server:

Open a terminal in the project folder: c:\Users\Alejandro\OneDrive\Escritorio\Expermemtos
Install dependencies (if you haven't):
npm install
Start the server:
node server.js
Open your browser at: http://localhost:3000
Technical Details
Backend: Node.js + Express.
Database: JSON file (

data/appointments.json
).
Frontend: Vanilla JS + CSS (No build step required).
