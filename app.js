document.addEventListener('DOMContentLoaded', () => {
    const daysContainer = document.getElementById('days-container');
    const currentMonthEl = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    const timeSelector = document.getElementById('time-selector');
    const slotsContainer = document.getElementById('slots-container');
    const formArea = document.getElementById('form-area');
    const summaryText = document.getElementById('summary-text');
    const bookingForm = document.getElementById('booking-form');
    const toast = document.getElementById('toast');

    let currentDate = new Date(); // Tracks the month we are viewing
    let selectedDate = null;
    let selectedTime = null;
    let bookedSlots = [];

    // Configuration
    const START_HOUR = 9;
    const END_HOUR = 21;
    const INTERVAL_MINUTES = 30;

    // Fetch initial data
    fetchSlots();

    function fetchSlots() {
        fetch('/api/slots')
            .then(res => res.json())
            .then(data => {
                bookedSlots = data;
                renderCalendar();
            })
            .catch(err => console.error('Error fetching slots:', err));
    }

    function renderCalendar() {
        daysContainer.innerHTML = '';

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Update Header
        const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        currentMonthEl.textContent = capitalize(monthName);

        // Day Headers (Lun, Mar, ...)
        const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        weekDays.forEach(day => {
            const el = document.createElement('div');
            el.className = 'day-header';
            el.textContent = day;
            daysContainer.appendChild(el);
        });

        // First day of month
        const firstDay = new Date(year, month, 1);
        const startingDay = firstDay.getDay(); // 0 = Sunday

        // Days in month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Empty slots for previous month
        for (let i = 0; i < startingDay; i++) {
            const empty = document.createElement('div');
            daysContainer.appendChild(empty);
        }

        // Days
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isPast = date < today;

            const card = document.createElement('div');
            card.className = 'day-card';
            card.innerHTML = `<span class="day-number">${i}</span>`;

            if (date.toDateString() === today.toDateString()) {
                card.classList.add('today');
            }

            if (isWeekend || isPast) {
                card.classList.add('disabled');
            } else {
                card.addEventListener('click', () => {
                    document.querySelectorAll('.day-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');

                    selectedDate = date;
                    selectedTime = null;
                    updateSummary();

                    timeSelector.classList.remove('hidden');
                    formArea.classList.add('hidden');
                    generateSlots(date);
                });
            }

            daysContainer.appendChild(card);
        }
    }

    function generateSlots(date) {
        slotsContainer.innerHTML = '';

        const isToday = date.toDateString() === new Date().toDateString();
        const currentHour = new Date().getHours();
        const currentMinutes = new Date().getMinutes();

        let hour = START_HOUR;
        let minutes = 0;

        const dateStr = date.toDateString(); // For comparison with booked slots (simplified)
        // Note: In a real app, we should match exact ISO dates or consistent formats.
        // Here we'll use the ISO string part YYYY-MM-DD from the backend.
        // But wait, backend saves ISO string.
        // Let's format local date to ISO YYYY-MM-DD for comparison if needed, 
        // OR just compare ISO strings.
        // The backend saves `date` as `date.toDateString()` (from previous app.js logic).
        // Let's stick to `toDateString()` for consistency with the backend logic I wrote?
        // Wait, in the previous app.js I sent `date: selectedDate.toDateString()`.
        // So I should compare with that.

        while (hour < END_HOUR || (hour === END_HOUR && minutes === 0)) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

            // Check if booked
            const isBooked = bookedSlots.some(slot =>
                slot.date === date.toDateString() && slot.time === timeString
            );

            // Check if past (if today)
            let isPastTime = false;
            if (isToday) {
                if (hour < currentHour || (hour === currentHour && minutes <= currentMinutes)) {
                    isPastTime = true;
                }
            }

            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = timeString;

            if (isBooked) {
                slot.classList.add('booked');
                slot.title = 'Reservado';
            } else if (isPastTime) {
                slot.classList.add('booked'); // Visually disabled
                slot.style.opacity = '0.5';
                slot.title = 'Horario pasado';
            } else {
                slot.addEventListener('click', () => {
                    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                    slot.classList.add('selected');

                    selectedTime = timeString;
                    updateSummary();
                    formArea.classList.remove('hidden');
                    formArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            }

            slotsContainer.appendChild(slot);

            minutes += INTERVAL_MINUTES;
            if (minutes >= 60) {
                hour++;
                minutes = 0;
            }
        }
    }

    function updateSummary() {
        if (selectedDate && selectedTime) {
            const dateStr = selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
            summaryText.innerHTML = `<strong>${capitalize(dateStr)}</strong> a las <strong>${selectedTime} hs</strong>`;
        } else if (selectedDate) {
            const dateStr = selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
            summaryText.textContent = `${capitalize(dateStr)} - Selecciona un horario`;
        } else {
            summaryText.textContent = 'Selecciona fecha y hora...';
        }
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Navigation
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Form Submission
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(bookingForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            date: selectedDate.toDateString(),
            time: selectedTime
        };

        try {
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showToast('¡Turno reservado con éxito!', 'success');

                // Refresh slots
                fetchSlots();

                // Reset UI
                setTimeout(() => {
                    bookingForm.reset();
                    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
                    timeSelector.classList.add('hidden');
                    formArea.classList.add('hidden');
                    selectedDate = null;
                    selectedTime = null;
                    updateSummary();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 2000);
            } else {
                showToast(result.error || 'Error al reservar', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Error de conexión', 'error');
        }
    });

    function showToast(message, type = 'success') {
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
});
