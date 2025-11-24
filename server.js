const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'appointments.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files

// Helper to read data
function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
}

// Helper to write data
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET /api/slots - Get all booked slots
app.get('/api/slots', (req, res) => {
    const appointments = readData();
    // Return only necessary info for slots (date, time) to avoid leaking user data
    const bookedSlots = appointments.map(app => ({
        date: app.date,
        time: app.time
    }));
    res.json(bookedSlots);
});

// POST /api/book - Book a slot
app.post('/api/book', (req, res) => {
    const { name, email, phone, date, time } = req.body;

    if (!name || !email || !phone || !date || !time) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const appointments = readData();

    // Check if email already exists
    const emailExists = appointments.some(app => app.email === email);
    if (emailExists) {
        return res.status(400).json({ error: 'Este email ya tiene un turno registrado.' });
    }

    // Check if slot is taken
    const slotTaken = appointments.some(app => app.date === date && app.time === time);
    if (slotTaken) {
        return res.status(400).json({ error: 'Este turno ya no está disponible.' });
    }

    const newAppointment = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        date,
        time,
        createdAt: new Date().toISOString()
    };

    appointments.push(newAppointment);
    writeData(appointments);

    res.status(201).json({ message: 'Turno reservado con éxito.', appointment: newAppointment });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
