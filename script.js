// Seat Data Simulation
const totalRows = 10;
const farePerSeat = 850; // ₹850
let selectedSeats = [];

// DOM Elements
const seatMap = document.getElementById('seatMap');
const selectedSeatsList = document.getElementById('selectedSeatsList');
const totalFareEl = document.getElementById('totalFare');
const confirmBookingBtn = document.getElementById('confirmBookingBtn');
const lockSeatsBtn = document.getElementById('lockSeatsBtn');
const passengerDetailsSection = document.getElementById('passengerDetailsSection');
const passengerFormsContainer = document.getElementById('passengerFormsContainer');
const bookingMessage = document.getElementById('bookingMessage');
const complaintForm = document.getElementById('complaintForm');
const complaintMessage = document.getElementById('complaintMessage');

// Generate Seat Map Structure
function initializeSeatMap() {
    seatMap.innerHTML = '';
    
    // Simulate initial seat data (In a real app, this comes from C++ backend)
    // 25% chance of being booked
    for (let row = 1; row <= totalRows; row++) {
        const rowEl = document.createElement('div');
        rowEl.className = 'seat-row';
        
        // Left side (2 seats)
        const leftBlock = document.createElement('div');
        leftBlock.className = 'seat-block';
        leftBlock.appendChild(createSeat(`S1-${row}A`));
        leftBlock.appendChild(createSeat(`S1-${row}B`));
        
        // Aisle
        const aisle = document.createElement('div');
        aisle.className = 'aisle';
        aisle.textContent = row;
        
        // Right side (2 seats window side, 1 middle) - lets just do 3 seats
        const rightBlock = document.createElement('div');
        rightBlock.className = 'seat-block';
        rightBlock.appendChild(createSeat(`S1-${row}C`));
        rightBlock.appendChild(createSeat(`S1-${row}D`));
        rightBlock.appendChild(createSeat(`S1-${row}E`));
        
        rowEl.appendChild(leftBlock);
        rowEl.appendChild(aisle);
        rowEl.appendChild(rightBlock);
        
        seatMap.appendChild(rowEl);
    }
}

function createSeat(id) {
    const seatInfo = getSimulatedSeatStatus();
    const seat = document.createElement('div');
    seat.className = `seat ${seatInfo.status}`;
    seat.id = id;
    seat.textContent = id.split('-')[1]; // Just show 1A, 1B etc
    
    // Add tooltip-like title
    seat.title = `Seat ${id} - ${seatInfo.status.toUpperCase()}`;

    if (seatInfo.status === 'available') {
        seat.addEventListener('click', () => toggleSeatSelection(seat, id));
    }
    
    return seat;
}

function getSimulatedSeatStatus() {
    return {
        status: Math.random() < 0.25 ? 'booked' : 'available'
    };
}

// Handle Seat Selection
function toggleSeatSelection(seatEl, seatId) {
    if (seatEl.classList.contains('locked') || seatEl.classList.contains('booked')) return;
    
    if (seatEl.classList.contains('selected')) {
        seatEl.classList.remove('selected');
        selectedSeats = selectedSeats.filter(id => id !== seatId);
    } else {
        if (selectedSeats.length >= 6) {
            alert("You can only book up to 6 seats at a time.");
            return;
        }
        seatEl.classList.add('selected');
        selectedSeats.push(seatId);
    }
    
    updateBookingSummary();
}

function updateBookingSummary() {
    if (selectedSeats.length > 0) {
        selectedSeatsList.textContent = selectedSeats.join(', ');
        totalFareEl.textContent = `₹${selectedSeats.length * farePerSeat}`;
        lockSeatsBtn.classList.remove('disabled');
    } else {
        selectedSeatsList.textContent = 'None';
        totalFareEl.textContent = '₹0';
        lockSeatsBtn.classList.add('disabled');
    }
}

// 1. Lock Seats
lockSeatsBtn.addEventListener('click', () => {
    if (lockSeatsBtn.classList.contains('disabled')) return;
    
    // Mark seats as "locked" temporarily visually
    selectedSeats.forEach(id => {
        const seat = document.getElementById(id);
        seat.classList.add('locked');
        seat.style.border = "2px solid #f59e0b";
    });
    
    lockSeatsBtn.style.display = 'none';
    passengerDetailsSection.style.display = 'block';
    generatePassengerForms();
});

// 2. Generate Forms per seat one by one
function generatePassengerForms() {
    passengerFormsContainer.innerHTML = '';
    
    selectedSeats.forEach((id, index) => {
        const formDiv = document.createElement('div');
        formDiv.style.marginBottom = "1rem";
        formDiv.style.padding = "10px";
        formDiv.style.background = "rgba(0,0,0,0.2)";
        formDiv.style.borderRadius = "8px";
        
        formDiv.innerHTML = `
            <p style="margin-bottom: 0.5rem; color: var(--text-main); font-weight: bold;">Ticket ${index + 1} - Seat ${id}</p>
            <input type="text" class="input-field pass-name" placeholder="Passenger Name" style="margin-bottom: 0.5rem;" required>
            <input type="number" class="input-field pass-age" placeholder="Age" required>
        `;
        passengerFormsContainer.appendChild(formDiv);
    });
    
    // Add validation listeners
    const inputs = passengerFormsContainer.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', checkBookingFormValidity);
    });
    checkBookingFormValidity(); // Initial check
}

function checkBookingFormValidity() {
    const inputs = document.querySelectorAll('#passengerFormsContainer input');
    let allFilled = true;
    inputs.forEach(input => {
        if (input.value.trim() === '') allFilled = false;
    });
    
    if (allFilled && selectedSeats.length > 0) {
        confirmBookingBtn.classList.remove('disabled');
    } else {
        confirmBookingBtn.classList.add('disabled');
    }
}

// Simulate Real-time Booking Updates (Live Sync)
function simulateLiveUpdates() {
    setInterval(() => {
        // Randomly select an available seat and book it to simulate other users
        const availableSeats = document.querySelectorAll('.seat.available:not(.selected)');
        if (availableSeats.length > 0 && Math.random() > 0.7) {
            const randomSeat = availableSeats[Math.floor(Math.random() * availableSeats.length)];
            randomSeat.classList.remove('available');
            randomSeat.classList.add('booked');
            randomSeat.title = `Seat ${randomSeat.id} - BOOKED (Just now)`;
            
            // Add a brief flash animation
            randomSeat.style.animation = 'pulse 1s';
            setTimeout(() => randomSeat.style.animation = '', 1000);
        }
    }, 5000);
}

// Handle Booking Confirmation
confirmBookingBtn.addEventListener('click', () => {
    if (confirmBookingBtn.classList.contains('disabled')) return;
    
    // Disable button to prevent double submit
    confirmBookingBtn.classList.add('disabled');
    confirmBookingBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    
    // Simulate API Call delay
    setTimeout(() => {
        // Success
        selectedSeats.forEach(id => {
            const seat = document.getElementById(id);
            seat.classList.remove('selected');
            seat.classList.remove('available');
            seat.classList.remove('locked');
            seat.style.border = "";
            seat.classList.add('booked');
            
            // Remove click listener
            const newSeat = seat.cloneNode(true);
            seat.parentNode.replaceChild(newSeat, seat);
        });
        
        // Show success interface with individual tickets
        let ticketsHTML = `<i class="fa-solid fa-circle-check"></i> <b>Booking Confirmed!</b><br>PNR: ${generatePNR()}<br><div style="text-align:left; margin-top:10px; font-size:0.9rem;">`;
        
        const names = document.querySelectorAll('.pass-name');
        const ages = document.querySelectorAll('.pass-age');
        
        selectedSeats.forEach((id, index) => {
             ticketsHTML += `<div style="background: rgba(16,185,129,0.1); padding: 5px 10px; margin-bottom: 5px; border-radius: 4px; border-left: 3px solid #10b981;">
                <b>Seat ${id}</b> - ${names[index].value} (Age: ${ages[index].value})
             </div>`;
        });
        ticketsHTML += `</div>`;
        
        bookingMessage.innerHTML = ticketsHTML;
        bookingMessage.className = 'message success';
        
        // Reset process
        selectedSeats = [];
        updateBookingSummary();
        lockSeatsBtn.style.display = 'block';
        passengerDetailsSection.style.display = 'none';
        
        confirmBookingBtn.innerHTML = 'Book Tickets';
        
        // Hide message after 12 seconds
        setTimeout(() => {
            bookingMessage.className = 'message hidden';
        }, 12000);
        
    }, 1500);
});

function generatePNR() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// Handle Complaint Form Submission
complaintForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = complaintForm.querySelector('button');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting Report...';
    btn.classList.add('disabled');
    
    // Simulate API Call delay
    setTimeout(() => {
        complaintMessage.innerHTML = `<i class="fa-solid fa-shield-check"></i> Alert sent successfully to Railway Authorities.<br>Reference ID: #${Math.floor(10000 + Math.random() * 90000)}`;
        complaintMessage.className = 'message success';
        
        complaintForm.reset();
        
        btn.innerHTML = originalText;
        btn.classList.remove('disabled');
        
        setTimeout(() => {
            complaintMessage.className = 'message hidden';
        }, 8000);
    }, 2000);
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeSeatMap();
    simulateLiveUpdates();
});
