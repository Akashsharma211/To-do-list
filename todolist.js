const tasklist = [];
const listElement = document.getElementById('taskList');
const statusText = document.getElementById('status');
const input = document.getElementById('taskInput');
const toggleBtn = document.getElementById('toggleMode');
let nightMode = false;

// Day/Night mode toggle
toggleBtn.addEventListener('click', () => {
    nightMode = !nightMode;
    document.body.classList.toggle('night', nightMode);
    toggleBtn.innerText = nightMode ? '🌙 Night/Day' : '🌞 Day/Night';
});

// Speech Recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.continuous = false;

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    statusText.innerText = `Heard: "${transcript}"`;

    if (transcript.startsWith('add task')) {
        const task = transcript.replace('add task', '').trim();
        if (task) addTask(task);
    } else if (transcript.startsWith('remove task')) {
        const num = parseInt(transcript.split(' ')[2]) - 1;
        if (!isNaN(num)) deleteTask(num);
    } else if (transcript.startsWith('delete task')) {
        const num = parseInt(transcript.split(' ')[2]) - 1;
        if (!isNaN(num)) deleteTask(num);
    } else {
        statusText.innerText = 'Unrecognized command. Try "add task ..." or "remove task ..."';
    }
};

recognition.onstart = () => {
    statusText.innerText = 'Listening...';
};

recognition.onerror = (e) => {
    statusText.innerText = 'Speech recognition error: ' + e.error;
};

function addTask(task) {
    tasklist.push({ text: task, done: false });
    renderTask();
    statusText.innerText = '';
}

function deleteTask(num) {
    if (tasklist[num]) {
        tasklist.splice(num, 1);
        renderTask();
        statusText.innerText = '';
    }
}

function marksTask(num) {
    if (tasklist[num]) {
        tasklist[num].done = true;
        renderTask();
    }
}

function renderTask() {
    listElement.innerHTML = '';
    tasklist.forEach((task, idx) => {
        const li = document.createElement('li');
        li.innerText = `${idx + 1}. ${task.text} ${task.done ? '(done)' : ''} `;

        // Mark button
        const markBtn = document.createElement('button');
        markBtn.innerText = 'Mark';
        markBtn.onclick = () => marksTask(idx);
        li.appendChild(markBtn);

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.innerText = 'Delete';
        delBtn.onclick = () => deleteTask(idx);
        li.appendChild(delBtn);

        listElement.appendChild(li);
    });
}

// Manual add
document.getElementById('addBtn').addEventListener('click', () => {
    const val = input.value.trim();
    if (val) {
        addTask(val);
        input.value = '';
    }
});

// Voice mode
document.getElementById('startBtn').addEventListener('click', () => {
    recognition.start();
});

// Enter key for manual add
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('addBtn').click();
    }
});

function updateAnalogClock() {
    const now = new Date();
    const hour = now.getHours() % 12;
    const minute = now.getMinutes();
    const second = now.getSeconds();

    const hourDeg = (hour + minute / 60) * 30; // 360/12
    const minuteDeg = (minute + second / 60) * 6; // 360/60
    const secondDeg = second * 6; // 360/60

    const hourHand = document.querySelector('.hand.hour');
    const minuteHand = document.querySelector('.hand.minute');
    const secondHand = document.querySelector('.hand.second');

    if (hourHand && minuteHand && secondHand) {
        hourHand.style.transform = `translate(-50%, 0) rotate(${hourDeg}deg)`;
        minuteHand.style.transform = `translate(-50%, 0) rotate(${minuteDeg}deg)`;
        secondHand.style.transform = `translate(-50%, 0) rotate(${secondDeg}deg)`;
    }
}
setInterval(updateAnalogClock, 1000);
updateAnalogClock();

function renderCalendar(month, year) {
    const calendarBody = document.getElementById('calendar-body');
    const calendarMonth = document.getElementById('calendar-month');
    calendarBody.innerHTML = '';

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    calendarMonth.textContent = `${months[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let date = 1;
    for (let i = 0; i < 6; i++) {
        let row = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            let cell = document.createElement('td');
            if (i === 0 && j < firstDay) {
                cell.innerHTML = '';
            } else if (date > daysInMonth) {
                cell.innerHTML = '';
            } else {
                cell.innerHTML = date;
                // Highlight today
                const today = new Date();
                if (
                    date === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear()
                ) {
                    cell.classList.add('today');
                }
                date++;
            }
            row.appendChild(cell);
        }
        calendarBody.appendChild(row);
        if (date > daysInMonth) break;
    }
}

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

document.addEventListener('DOMContentLoaded', function() {
    renderCalendar(currentMonth, currentYear);

    document.getElementById('prevMonth').onclick = function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    };
    document.getElementById('nextMonth').onclick = function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    };
});

function saveTasks() {
    localStorage.setItem('todo-tasks', JSON.stringify(tasklist));
}

function addTask(task) {
    tasklist.push({ text: task, done: false });
    renderTask();
    saveTasks();
    statusText.innerText = '';
}

function deleteTask(num) {
    if (tasklist[num]) {
        tasklist.splice(num, 1);
        renderTask();
        saveTasks();
        statusText.innerText = '';
    }
}

function marksTask(num) {
    if (tasklist[num]) {
        tasklist[num].done = true;
        renderTask();
        saveTasks();
    }
}

const saved = localStorage.getItem('todo-tasks');
if (saved) {
    try {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) {
            arr.forEach(task => tasklist.push(task));
        }
    } catch (e) {
        // Ignore parse errors
    }
}renderTask();
