// Application State
let state = {
    quails: JSON.parse(localStorage.getItem('quails')) || [],
    eggs: JSON.parse(localStorage.getItem('eggs')) || [],
    tasks: JSON.parse(localStorage.getItem('tasks')) || [],
    currentDate: new Date(),
    calendarMonth: new Date().getMonth(),
    calendarYear: new Date().getFullYear()
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initModals();
    initForms();
    initCalendar();
    updateDashboard();
    renderQuails();
    renderEggs();
    renderTasks();
    renderActivity();
    
    // Set today's date as default in forms
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eggs-date').value = today;
    document.getElementById('quail-date').value = today;
    // Default sex value
    if (document.getElementById('quail-sex')) document.getElementById('quail-sex').value = 'unknown';
    document.getElementById('task-date').value = today;
});

// Navigation
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.getAttribute('data-section');
            
            navButtons.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

// Modals
function initModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');

    // Open modals
    document.getElementById('add-quail-btn').addEventListener('click', () => {
        document.getElementById('quail-form').reset();
        document.getElementById('quail-edit-id').value = '';
        document.getElementById('quail-modal-title').textContent = 'Добавить перепела';
        document.getElementById('quail-date').value = new Date().toISOString().split('T')[0];
        if (document.getElementById('quail-sex')) document.getElementById('quail-sex').value = 'unknown';
        document.getElementById('quail-modal').classList.add('active');
    });

    document.getElementById('add-eggs-btn').addEventListener('click', () => {
        document.getElementById('eggs-modal').classList.add('active');
    });

    document.getElementById('add-task-btn').addEventListener('click', () => {
        document.getElementById('task-modal').classList.add('active');
    });

    document.getElementById('chat-settings-btn').addEventListener('click', () => {
        const apiKey = localStorage.getItem('openai_api_key') || '';
        const useChatGPT = localStorage.getItem('use_chatgpt') !== 'false';
        document.getElementById('openai-api-key').value = apiKey;
        document.getElementById('use-chatgpt').checked = useChatGPT;
        document.getElementById('chat-settings-modal').classList.add('active');
    });

    // Close modals
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modals.forEach(modal => modal.classList.remove('active'));
        });
    });

    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Forms
function initForms() {
    // Quail form
    document.getElementById('quail-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = document.getElementById('quail-edit-id').value;
        
        const quailData = {
            name: document.getElementById('quail-name').value,
            breed: document.getElementById('quail-breed').value,
            date: document.getElementById('quail-date').value,
            sex: document.getElementById('quail-sex') ? document.getElementById('quail-sex').value : 'unknown',
            health: document.getElementById('quail-health').value,
            notes: document.getElementById('quail-notes').value
        };
        
        if (editId) {
            // Edit existing quail
            const index = state.quails.findIndex(q => q.id === parseInt(editId));
            if (index !== -1) {
                state.quails[index] = { ...state.quails[index], ...quailData };
            }
        } else {
            // Add new quail
            const quail = {
                id: Date.now(),
                ...quailData
            };
            state.quails.push(quail);
        }
        
        saveState();
        document.getElementById('quail-form').reset();
        document.getElementById('quail-edit-id').value = '';
        document.getElementById('quail-modal-title').textContent = 'Добавить перепела';
        document.getElementById('quail-modal').classList.remove('active');
        renderQuails();
        updateDashboard();
        renderActivity();
    });

    // Eggs form
    document.getElementById('eggs-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const eggs = {
            id: Date.now(),
            count: parseInt(document.getElementById('eggs-count').value),
            date: document.getElementById('eggs-date').value,
            time: document.getElementById('eggs-time').value,
            notes: document.getElementById('eggs-notes').value,
            timestamp: new Date(document.getElementById('eggs-date').value + 'T' + document.getElementById('eggs-time').value).getTime()
        };
        
        state.eggs.push(eggs);
        saveState();
        document.getElementById('eggs-form').reset();
        document.getElementById('eggs-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('eggs-modal').classList.remove('active');
        renderEggs();
        updateDashboard();
        renderActivity();
    });

    // Chat settings form
    document.getElementById('chat-settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const apiKey = document.getElementById('openai-api-key').value.trim();
        const useChatGPT = document.getElementById('use-chatgpt').checked;
        
        if (apiKey) {
            localStorage.setItem('openai_api_key', apiKey);
        } else {
            localStorage.removeItem('openai_api_key');
        }
        localStorage.setItem('use_chatgpt', useChatGPT);
        
        document.getElementById('chat-settings-modal').classList.remove('active');
        
        // Show notification in chat
        setTimeout(() => {
            addChatMessage('✅ Настройки сохранены! Теперь можно использовать ChatGPT.', 'bot');
        }, 300);
    });

    // Task form
    document.getElementById('task-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const task = {
            id: Date.now(),
            title: document.getElementById('task-title').value,
            date: document.getElementById('task-date').value,
            time: document.getElementById('task-time').value,
            type: document.getElementById('task-type').value,
            notes: document.getElementById('task-notes').value,
            completed: false,
            timestamp: new Date(document.getElementById('task-date').value + (document.getElementById('task-time').value ? 'T' + document.getElementById('task-time').value : '')).getTime()
        };
        
        state.tasks.push(task);
        saveState();
        document.getElementById('task-form').reset();
        document.getElementById('task-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('task-modal').classList.remove('active');
        renderTasks();
        initCalendar();
        updateDashboard();
        renderActivity();
    });
}

// Save State
function saveState() {
    localStorage.setItem('quails', JSON.stringify(state.quails));
    localStorage.setItem('eggs', JSON.stringify(state.eggs));
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
}

// Dashboard
function updateDashboard() {
    document.getElementById('total-quails').textContent = state.quails.length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayEggs = state.eggs.filter(e => e.date === today).reduce((sum, e) => sum + e.count, 0);
    document.getElementById('total-eggs-today').textContent = todayEggs;
    
    const todayTasks = state.tasks.filter(t => t.date === today && !t.completed).length;
    document.getElementById('upcoming-tasks').textContent = todayTasks;
    
    const healthyQuails = state.quails.filter(q => q.health === 'healthy').length;
    document.getElementById('healthy-quails').textContent = healthyQuails;
}

// Render Quails
function renderQuails() {
    const container = document.getElementById('quails-list');
    
    if (state.quails.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🐦</div>
                <h3>Пока нет перепелов</h3>
                <p>Добавьте первого перепела, чтобы начать учет</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = state.quails.map(quail => `
        <div class="quail-card" data-quail-id="${quail.id}">
            <div class="quail-header">
                <div class="quail-name">${quail.name}</div>
                <span class="health-badge ${quail.health}">
                    ${getHealthText(quail.health)}
                </span>
            </div>
            <div class="quail-info">
                ${quail.breed ? `<div class="quail-info-item"><strong>Порода:</strong> ${quail.breed}</div>` : ''}
                ${quail.sex ? `<div class="quail-info-item"><strong>Пол:</strong> ${getSexText(quail.sex)}</div>` : ''}
                <div class="quail-info-item"><strong>Дата:</strong> ${formatDate(quail.date)}</div>
                ${quail.notes ? `<div class="quail-notes">${quail.notes}</div>` : ''}
            </div>
            <div class="quail-actions">
                <button class="btn btn-edit" data-edit-id="${quail.id}">✏️ Редактировать</button>
                <button class="btn btn-delete" data-delete-id="${quail.id}">🗑️ Удалить</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners for edit and delete buttons
    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const quailId = parseInt(e.target.getAttribute('data-edit-id'));
            editQuail(quailId);
        });
    });
    
    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const quailId = parseInt(e.target.getAttribute('data-delete-id'));
            deleteQuail(quailId);
        });
    });
}

// Render Eggs
function renderEggs() {
    renderEggsChart();
    renderEggsHistory();
}

function renderEggsChart() {
    const container = document.getElementById('eggs-chart');
    const last7Days = getLast7Days();
    
    if (state.eggs.length === 0) {
        container.innerHTML = '<p>Нет данных для отображения</p>';
        return;
    }
    
    const dayData = last7Days.map(day => {
        const dayEggs = state.eggs.filter(e => e.date === day);
        return {
            date: day,
            count: dayEggs.reduce((sum, e) => sum + e.count, 0)
        };
    });
    
    const maxCount = Math.max(...dayData.map(d => d.count), 1);
    
    container.innerHTML = dayData.map(day => {
        const height = (day.count / maxCount) * 100;
        return `
            <div class="bar" style="height: ${Math.max(height, 10)}%">
                <span>${day.count}</span>
                <div style="font-size: 10px; margin-top: 5px;">${formatShortDate(day.date)}</div>
            </div>
        `;
    }).join('');
}

function renderEggsHistory() {
    const container = document.getElementById('eggs-history-list');
    const sortedEggs = [...state.eggs].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
    
    if (sortedEggs.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Нет записей</p></div>';
        return;
    }
    
    container.innerHTML = sortedEggs.map(egg => `
        <div class="history-item">
            <div class="history-info">
                <h4>${formatDate(egg.date)}</h4>
                <p>${egg.time || ''} ${egg.notes ? '• ' + egg.notes : ''}</p>
            </div>
            <div class="history-count">${egg.count} 🥚</div>
        </div>
    `).join('');
}

// Render Tasks
function renderTasks() {
    renderTodayTasks();
}

function renderTodayTasks() {
    const container = document.getElementById('today-tasks');
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = state.tasks.filter(t => t.date === today).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    
    if (todayTasks.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Нет задач на сегодня</p></div>';
        return;
    }
    
    container.innerHTML = todayTasks.map(task => `
        <div class="task-item">
            <div class="task-info">
                <h4>${task.title}</h4>
                <p>${task.time || 'Весь день'} • ${getTaskTypeText(task.type)} ${task.notes ? '• ' + task.notes : ''}</p>
            </div>
            <span class="task-type-badge">${getTaskTypeText(task.type)}</span>
        </div>
    `).join('');
}

// Calendar
function initCalendar() {
    document.getElementById('prev-month').addEventListener('click', () => {
        state.calendarMonth--;
        if (state.calendarMonth < 0) {
            state.calendarMonth = 11;
            state.calendarYear--;
        }
        renderCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        state.calendarMonth++;
        if (state.calendarMonth > 11) {
            state.calendarMonth = 0;
            state.calendarYear++;
        }
        renderCalendar();
    });

    renderCalendar();
}

function renderCalendar() {
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                       'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    
    document.getElementById('current-month').textContent = 
        `${monthNames[state.calendarMonth]} ${state.calendarYear}`;
    
    const firstDay = new Date(state.calendarYear, state.calendarMonth, 1);
    const lastDay = new Date(state.calendarYear, state.calendarMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const calendarGrid = document.getElementById('calendar-grid');
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    
    let html = dayNames.map(day => `<div class="calendar-day-header">${day}</div>`).join('');
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        html += '<div class="calendar-day other-month"></div>';
    }
    
    // Days of the month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${state.calendarYear}-${String(state.calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = today.getDate() === day && 
                       today.getMonth() === state.calendarMonth && 
                       today.getFullYear() === state.calendarYear;
        const dayTasks = state.tasks.filter(t => t.date === dateStr);
        const hasTasks = dayTasks.length > 0;
        
        html += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${hasTasks ? 'has-tasks' : ''}">
                <div class="calendar-day-number">${day}</div>
                ${hasTasks ? `<div class="calendar-day-tasks">${dayTasks.length}</div>` : ''}
            </div>
        `;
    }
    
    calendarGrid.innerHTML = html;
}

// Activity
function renderActivity() {
    const container = document.getElementById('activity-list');
    const activities = [];
    
    // Recent quails
    const recentQuails = [...state.quails].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    recentQuails.forEach(q => {
        activities.push({
            icon: '🐦',
            title: `Добавлен перепел: ${q.name}`,
            time: formatDate(q.date),
            timestamp: new Date(q.date).getTime()
        });
    });
    
    // Recent eggs
    const recentEggs = [...state.eggs].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
    recentEggs.forEach(e => {
        activities.push({
            icon: '🥚',
            title: `Собрано ${e.count} яиц`,
            time: formatDate(e.date),
            timestamp: e.timestamp
        });
    });
    
    // Recent tasks
    const recentTasks = [...state.tasks].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
    recentTasks.forEach(t => {
        activities.push({
            icon: '📅',
            title: `Задача: ${t.title}`,
            time: formatDate(t.date),
            timestamp: t.timestamp
        });
    });
    
    activities.sort((a, b) => b.timestamp - a.timestamp);
    
    if (activities.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Нет активности</p></div>';
        return;
    }
    
    container.innerHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.time}</p>
            </div>
        </div>
    `).join('');
}

// Helper Functions
function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
}

function formatShortDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
}

function getHealthText(health) {
    const map = {
        'healthy': 'Здоров',
        'sick': 'Болен',
        'recovering': 'Выздоравливает'
    };
    return map[health] || health;
}

function getTaskTypeText(type) {
    const map = {
        'feeding': 'Кормление',
        'cleaning': 'Уборка',
        'health': 'Проверка здоровья',
        'eggs': 'Сбор яиц',
        'other': 'Другое'
    };
    return map[type] || type;
}

// Edit Quail
function editQuail(quailId) {
    const quail = state.quails.find(q => q.id === quailId);
    if (!quail) return;
    
    document.getElementById('quail-edit-id').value = quail.id;
    document.getElementById('quail-name').value = quail.name;
    document.getElementById('quail-breed').value = quail.breed || '';
    document.getElementById('quail-date').value = quail.date;
    document.getElementById('quail-health').value = quail.health;
    document.getElementById('quail-notes').value = quail.notes || '';
    if (document.getElementById('quail-sex')) document.getElementById('quail-sex').value = quail.sex || 'unknown';
    document.getElementById('quail-modal-title').textContent = 'Редактировать перепела';
    
    document.getElementById('quail-modal').classList.add('active');
}

function getSexText(sex) {
    const map = {
        'male': 'Самец',
        'female': 'Самка',
        'unknown': 'Не указано'
    };
    return map[sex] || sex;
}

// Delete Quail
function deleteQuail(quailId) {
    if (confirm('Вы уверены, что хотите удалить этого перепела?')) {
        state.quails = state.quails.filter(q => q.id !== quailId);
        saveState();
        renderQuails();
        updateDashboard();
        renderActivity();
    }
}