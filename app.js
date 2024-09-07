const addBtn = document.getElementById('add-btn');
const habitInput = document.getElementById('habit-name');
const habitList = document.getElementById('habits');
const resetBtn = document.getElementById('reset-btn');
let habits = JSON.parse(localStorage.getItem('habits')) || [];

// Function to render habits
function renderHabits() {
    habitList.innerHTML = '';
    habits.forEach((habit, index) => {
        const streakPercentage = Math.min(habit.streak * 10, 100);  // Assuming 10-day goal
        const habitItem = document.createElement('li');
        habitItem.innerHTML = `
            <div>
                <span>${habit.name} - Streak: ${habit.streak} days</span>
                <div class="progress-bar">
                    <div class="progress" style="width: ${streakPercentage}%;"></div>
                </div>
            </div>
            <button onclick="markComplete(${index})">Mark Complete</button>
            <button onclick="deleteHabit(${index})">Delete</button>
        `;
        habitList.appendChild(habitItem);
    });
    renderChart();  // Update chart when habits change
}

// Function to add new habit
function addHabit() {
    const habitName = habitInput.value;
    if (habitName === '') return;
    habits.push({
        name: habitName,
        streak: 0,
        lastCompleted: null
    });
    localStorage.setItem('habits', JSON.stringify(habits));
    habitInput.value = '';
    renderHabits();
    requestNotificationPermission();
}

// Function to mark a habit as complete
function markComplete(index) {
    const today = new Date().toLocaleDateString();
    const habit = habits[index];
    if (habit.lastCompleted === today) {
        alert('Habit already marked for today');
        return;
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString();

    if (habit.lastCompleted === yesterdayStr) {
        habit.streak++;
    } else {
        habit.streak = 1;
    }
    habit.lastCompleted = today;
    localStorage.setItem('habits', JSON.stringify(habits));
    renderHabits();
}

// Function to delete a habit
function deleteHabit(index) {
    habits.splice(index, 1);
    localStorage.setItem('habits', JSON.stringify(habits));
    renderHabits();
}

// Function to render chart using Chart.js
function renderChart() {
    const ctx = document.getElementById('habitChart').getContext('2d');
    const habitNames = habits.map(habit => habit.name);
    const streaks = habits.map(habit => habit.streak);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: habitNames,
            datasets: [{
                label: 'Habit Streaks',
                data: streaks,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to reset all habit streaks
resetBtn.addEventListener('click', () => {
    habits.forEach(habit => habit.streak = 0);
    localStorage.setItem('habits', JSON.stringify(habits));
    renderHabits();
});

// Request permission for notifications
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                scheduleDailyReminder();
            }
        });
    }
}

// Schedule daily reminders
function scheduleDailyReminder() {
    const now = new Date();
    const nextReminder = new Date();
    nextReminder.setHours(8, 0, 0, 0); // Set for 8:00 AM

    if (nextReminder.getTime() < now.getTime()) {
        nextReminder.setDate(nextReminder.getDate() + 1);
    }

    const timeUntilNextReminder = nextReminder.getTime() - now.getTime();

    setTimeout(() => {
        new Notification("Don't forget to check your daily habits!");
        scheduleDailyReminder();  // Reschedule for next day
    }, timeUntilNextReminder);
}

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker Registered'))
            .catch(err => console.log('Service Worker Error', err));
    });
}

addBtn.addEventListener('click', addHabit);
renderHabits();