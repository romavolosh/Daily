const calendar = document.getElementById('calendar');
const currentDateElement = document.getElementById('current-date');
const prevBtn = document.getElementById('prev-month');
const nextBtn = document.getElementById('next-month');

let today = new Date();
let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth();

const days = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function formatUkrainianDate(date) {
    const months = [
        "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
        "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Додаємо нову функцію для підрахунку невиконаних завдань
async function updateMonthTaskCount(year, month, buttonId) {
    try {
        const tasks = await fetchTasks();
        const username = localStorage.getItem('username');
        
        // Фільтруємо завдання для вказаного місяця
        const monthTasks = tasks.filter(task => {
            const taskDate = new Date(task.deadline);
            return taskDate.getMonth() === month &&
                   taskDate.getFullYear() === year;
        });

        // Рахуємо невиконані завдання
        const uncompletedCount = monthTasks.filter(task => {
            return !task.completedBy?.some(completion => completion.username === username);
        }).length;

        // Оновлюємо або видаляємо індикатор
        const button = document.getElementById(buttonId);
        let countBadge = button.querySelector('.month-task-count');
        
        if (uncompletedCount > 0) {
            if (!countBadge) {
                countBadge = document.createElement('span');
                countBadge.classList.add('month-task-count');
                button.appendChild(countBadge);
            }
            countBadge.textContent = uncompletedCount;
        } else if (countBadge) {
            countBadge.remove();
        }
    } catch (error) {
        console.error('Помилка при оновленні лічильника завдань:', error);
    }
}

async function renderCalendar(year = viewYear, month = viewMonth) {
    calendar.innerHTML = ''; // Clear existing calendar

    // Add weekday headers
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
    weekdays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('weekday');
        dayElement.textContent = day;
        calendar.appendChild(dayElement);
    });

    // Get tasks for the current month
    const tasks = await fetchTasks();
    const username = localStorage.getItem('username');

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Пусті блоки перед першим числом
    for (let i = 0; i < firstDay.getDay(); i++) {
        const empty = document.createElement('div');
        calendar.appendChild(empty);
    }

    const daysArr = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
        daysArr.push(i);
    }

    daysArr.forEach((day, index) => {
        if (day !== '') {
            const dateElement = document.createElement('div');
            dateElement.classList.add('date');
            dateElement.textContent = day;

            // Check tasks for this day
            const dayTasks = tasks.filter(task => {
                const taskDate = new Date(task.deadline);
                return taskDate.getDate() === day &&
                       taskDate.getMonth() === month &&
                       taskDate.getFullYear() === year;
            });

            if (dayTasks.length > 0) {
                // Count uncompleted tasks
                const uncompletedCount = dayTasks.filter(task => {
                    return !task.completedBy?.some(completion => 
                        completion.username === username
                    );
                }).length;

                if (uncompletedCount > 0) {
                    const countBadge = document.createElement('span');
                    countBadge.classList.add('task-count');
                    countBadge.textContent = uncompletedCount;
                    dateElement.appendChild(countBadge);
                }

                // Add proper class based on completion status
                const allTasksCompleted = dayTasks.every(task => 
                    task.completedBy?.some(completion => 
                        completion.username === username
                    )
                );

                dateElement.classList.add(
                    allTasksCompleted ? 'all-tasks-completed' : 'has-uncompleted-tasks'
                );
            }

            // Highlight today
            if (day === today.getDate() &&
                year === today.getFullYear() &&
                month === today.getMonth()) {
                dateElement.classList.add('today');
            }

            // Add click event listener
            dateElement.addEventListener('click', () => {
                const modalOverlay = document.getElementById('modal-overlay');
                const modalDate = document.getElementById('modal-date');
                modalDate.textContent = `${day} ${formatUkrainianDate(new Date(year, month))}`;
                
                // Clear and populate tasks
                const tasksContainer = document.getElementById('tasks-container');
                if (!tasksContainer) {
                    const container = document.createElement('div');
                    container.id = 'tasks-container';
                    modalOverlay.querySelector('.modal-window').insertBefore(
                        container,
                        document.getElementById('add-task-button')
                    );
                }
                
                // Display tasks for this day
                displayTasksForDay(dayTasks);
                
                // Show modal
                modalOverlay.style.display = 'flex';
            });

            calendar.appendChild(dateElement);
        }
    });

    // Update header and navigation
    currentDateElement.textContent = formatUkrainianDate(new Date(year, month));
    viewYear = year;
    viewMonth = month;

    // Оновлюємо індикатори на кнопках навігації
    const prevMonth = month - 1 < 0 ? 11 : month - 1;
    const prevYear = month - 1 < 0 ? year - 1 : year;
    const nextMonth = month + 1 > 11 ? 0 : month + 1;
    const nextYear = month + 1 > 11 ? year + 1 : year;

    await Promise.all([
        updateMonthTaskCount(prevYear, prevMonth, 'prev-month'),
        updateMonthTaskCount(nextYear, nextMonth, 'next-month')
    ]);
}

// Обробники подій
prevBtn.addEventListener('click', async () => {
    viewMonth--;
    if (viewMonth < 0) {
        viewMonth = 11;
        viewYear--;
    }
    await renderCalendar(viewYear, viewMonth);
});

nextBtn.addEventListener('click', async () => {
    viewMonth++;
    if (viewMonth > 11) {
        viewMonth = 0;
        viewYear++;
    }
    await renderCalendar(viewYear, viewMonth);
});

// Перше завантаження
renderCalendar(viewYear, viewMonth);

const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.getElementById('close-modal');

// Додайте функцію для отримання завдань
async function fetchTasks() {
    try {
        document.body.classList.add('loading');
        const response = await fetch('/api/tasks');
        if (!response.ok) {
            throw new Error('Помилка завантаження завдань');
        }
        return await response.json();
    } catch (error) {
        console.error('Помилка:', error);
        alert('Не вдалося завантажити завдання. Спробуйте оновити сторінку.');
        return [];
    } finally {
        document.body.classList.remove('loading');
    }
}

// Відкриття модального вікна
async function openModal(day) {
    const modalDate = document.getElementById('modal-date');
    const tasksContainer = document.getElementById('tasks-container');
    const modalOverlay = document.getElementById('modal-overlay');
    
    try {
        // Встановлюємо дату
        const currentMonth = document.querySelector('#current-date').textContent;
        modalDate.textContent = `${day} ${currentMonth}`;
        
        // Очищуємо контейнер
        tasksContainer.innerHTML = '';
        
        // Отримуємо завдання
        const response = await fetch('/api/tasks');
        const tasks = await response.json();
        
        // Парсимо поточний місяць та рік
        const [monthStr, yearStr] = currentMonth.split(' ');
        const year = parseInt(yearStr);
        const monthIndex = getMonthIndex(monthStr);
        
        // Створюємо дату для порівняння
        const dateToCheck = new Date(year, monthIndex, day);
        dateToCheck.setHours(0, 0, 0, 0);
        
        console.log('Дата перевірки:', dateToCheck);

        const dayTasks = tasks.filter(task => {
            const taskDate = new Date(task.deadline);
            taskDate.setHours(0, 0, 0, 0);
            
            return taskDate.getDate() === dateToCheck.getDate() &&
                   taskDate.getMonth() === dateToCheck.getMonth() &&
                   taskDate.getFullYear() === dateToCheck.getFullYear();
        });
        
        // Відображаємо завдання
        if (dayTasks && dayTasks.length > 0) {
            dayTasks.forEach(task => {
                const username = localStorage.getItem('username');
                const isCompleted = task.completedBy && task.completedBy.some(
                    completion => completion.username === username
                );
                
                const taskElement = document.createElement('div');
                taskElement.classList.add('task-item');
                if (isCompleted) {
                    taskElement.classList.add('completed');
                }
                
                taskElement.innerHTML = `
                    <div class="task-content">
                        <h4>${task.subject}</h4>
                        <p>${task.description}</p>
                        <small>Додав: ${task.username}</small>
                    </div>
                    <div class="task-actions">
                        <label class="checkbox-container">
                            <input type="checkbox" ${isCompleted ? 'checked' : ''} 
                                data-task-id="${task._id}">
                            <span class="checkmark"></span>
                        </label>
                    </div>
                `;

                // Add event listener to checkbox
                const checkbox = taskElement.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', async (e) => {
                    await toggleTaskStatus(task._id, e.target);
                });

                tasksContainer.appendChild(taskElement);
            });
        } else {
            tasksContainer.innerHTML = '<p class="no-tasks">Немає завдань на цю дату</p>';
        }
        
        // Показуємо модальне вікно
        modalOverlay.style.display = 'flex';
        document.body.classList.add('modal-active');
        
    } catch (error) {
        console.error('Помилка:', error);
        tasksContainer.innerHTML = '<p class="error">Помилка при завантаженні завдань</p>';
    }
}

// Допоміжна функція для отримання індексу місяця
function getMonthIndex(monthStr) {
    const months = {
        'Січень': 0, 'Лютий': 1, 'Березень': 2, 'Квітень': 3,
        'Травень': 4, 'Червень': 5, 'Липень': 6, 'Серпень': 7,
        'Вересень': 8, 'Жовтень': 9, 'Листопад': 10, 'Грудень': 11
    };
    return months[monthStr];
}

// Закриття модального вікна
closeModalBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
    document.body.classList.remove('modal-active');
});

// Close modal when clicking outside
modalOverlay.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        e.target.style.display = 'none';
    }
});

// Вибір елементів
const aboutUsBtn = document.getElementById('about-us');
const modalOverlayAboutUs = document.getElementById('modal-overlay-about-us');
const closeModalAboutUsBtn = document.getElementById('close-modal-about-us');

// Відкриття модального вікна "Про нас"
if (aboutUsBtn) {
    aboutUsBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        modalOverlayAboutUs.style.display = 'flex';
        document.body.classList.add('modal-active');
    };
}

// Закриття модального вікна "Про нас"
if (closeModalAboutUsBtn) {
    closeModalAboutUsBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        modalOverlayAboutUs.style.display = 'none';
        document.body.classList.remove('modal-active');
    };
}

// Закриття при кліку поза модальним вікном
if (modalOverlayAboutUs) {
    modalOverlayAboutUs.onclick = (e) => {
        if (e.target === modalOverlayAboutUs) {
            modalOverlayAboutUs.style.display = 'none';
            document.body.classList.remove('modal-active');
        }
    };
}

const addTaskButton = document.getElementById('add-task-button');
const modalOverlayAddTask = document.getElementById('modal-overlay-add-task');
const closeModalAddTaskBtn = document.getElementById('close-modal-add-task');

// Відкриття модального вікна при натисканні на кнопку "Додати"
addTaskButton.addEventListener('click', () => {
    modalOverlayAddTask.style.display = 'flex';
    document.body.classList.add('modal-active');
});

// Закриття модального вікна
closeModalAddTaskBtn.addEventListener('click', () => {
    modalOverlayAddTask.style.display = 'none';
    document.body.classList.remove('modal-active');
});

// Додатково: закриття модального вікна при натисканні на фон
modalOverlayAddTask.addEventListener('click', (e) => {
    if (e.target === modalOverlayAddTask) {
        modalOverlayAddTask.style.display = 'none';
        document.body.classList.remove('modal-active');
    }
});

// Додайте цей код до main.js
document.getElementById('task-form').addEventListener('submit', handleTaskSubmit);

// Додайте цю функцію для обробки зміни статусу
async function toggleTaskStatus(taskId, checkbox) {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            alert('Потрібно увійти в систему');
            checkbox.checked = !checkbox.checked;
            return;
        }

        checkbox.disabled = true;
        
        const response = await fetch(`/api/tasks/${taskId}/toggle`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        if (!response.ok) {
            throw new Error('Помилка при оновленні статусу');
        }

        const result = await response.json();
        
        // Update task element
        const taskElement = checkbox.closest('.task-item');
        taskElement.classList.toggle('completed', checkbox.checked);

        // Update calendar immediately
        await renderCalendar(viewYear, viewMonth);

    } catch (error) {
        console.error('Помилка:', error);
        checkbox.checked = !checkbox.checked;
        alert('Помилка при оновленні статусу завдання');
    } finally {
        checkbox.disabled = false;
    }
}

// Додамо нову функцію для оновлення відображення календаря
async function updateCalendarView() {
    const modalDate = document.getElementById('modal-date');
    const [day] = modalDate.textContent.split(' ');
    const tasks = await fetchTasks();
    const username = localStorage.getItem('username');

    // Оновлюємо дату в календарі
    const dates = document.querySelectorAll('.date');
    const dateElement = Array.from(dates).find(el => 
        el.childNodes[0].textContent.trim() === day
    );

    if (dateElement) {
        // Фільтруємо завдання для цієї дати
        const dayTasks = tasks.filter(task => {
            const taskDate = new Date(task.deadline);
            return taskDate.getDate() === parseInt(day) &&
                   taskDate.getMonth() === viewMonth &&
                   taskDate.getFullYear() === viewYear;
        });

        // Рахуємо невиконані завдання
        const uncompletedCount = dayTasks.filter(task => 
            !task.completedBy?.some(completion => 
                completion.username === username
            )
        ).length;

        // Оновлюємо індикатор кількості завдань
        let countBadge = dateElement.querySelector('.task-count');
        if (countBadge) {
            countBadge.remove();
        }

        if (uncompletedCount > 0) {
            countBadge = document.createElement('span');
            countBadge.classList.add('task-count');
            countBadge.textContent = uncompletedCount;
            dateElement.appendChild(countBadge);
        }

        // Оновлюємо клас дати
        dateElement.classList.remove('has-uncompleted-tasks', 'all-tasks-completed');
        if (dayTasks.length > 0) {
            dateElement.classList.add(
                uncompletedCount > 0 ? 'has-uncompleted-tasks' : 'all-tasks-completed'
            );
        }
    }

    // Оновлюємо індикатори на кнопках навігації
    await Promise.all([
        updateMonthTaskCount(viewYear, viewMonth - 1 < 0 ? viewYear - 1 : viewYear, 
                           viewMonth - 1 < 0 ? 11 : viewMonth - 1, 'prev-month'),
        updateMonthTaskCount(viewYear, viewMonth + 1 > 11 ? viewYear + 1 : viewYear, 
                           viewMonth + 1 > 11 ? 0 : viewMonth + 1, 'next-month')
    ]);
}

// Додайте функцію для обробки форми
async function handleTaskSubmit(event) {
    event.preventDefault();
    
    const subject = document.getElementById('task-subject').value;
    const deadline = document.getElementById('task-deadline').value;
    const description = document.getElementById('task-description').value;
    const username = localStorage.getItem('username');

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject,
                deadline,
                description,
                username
            })
        });

        if (!response.ok) {
            throw new Error('Помилка при додаванні завдання');
        }

        // Отримуємо дату з модального вікна
        const modalDate = document.getElementById('modal-date');
        const currentDay = modalDate.textContent.split(' ')[0];
        
        // Очищуємо форму
        document.getElementById('task-form').reset();
        
        // Закриваємо модальне вікно додавання завдання
        document.getElementById('modal-overlay-add-task').style.display = 'none';
        
        // Отримуємо оновлений список завдань і оновлюємо відображення
        await renderCalendar(viewYear, viewMonth);
        
        // Оновлюємо модальне вікно з завданнями, якщо воно відкрите
        if (modalOverlay.style.display === 'flex') {
            const tasks = await fetchTasks();
            const currentMonth = document.querySelector('#current-date').textContent;
            const [monthStr, yearStr] = currentMonth.split(' ');
            const year = parseInt(yearStr);
            const monthIndex = getMonthIndex(monthStr);
            
            const dateToCheck = new Date(year, monthIndex, parseInt(currentDay));
            dateToCheck.setHours(0, 0, 0, 0);
            
            const dayTasks = tasks.filter(task => {
                const taskDate = new Date(task.deadline);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate.getTime() === dateToCheck.getTime();
            });

            displayTasksForDay(dayTasks);
        }

    } catch (error) {
        console.error('Помилка:', error);
        alert('Помилка при додаванні завдання');
    }
}

// Додаємо обробник для кнопки налаштувань
document.getElementById('settings-btn').addEventListener('click', () => {
    let settingsModal = document.getElementById('settings-modal-overlay');
    if (!settingsModal) {
        settingsModal = document.createElement('div');
        settingsModal.id = 'settings-modal-overlay';
        settingsModal.className = 'modal-overlay';
        
        settingsModal.innerHTML = `
            <div id="settings-modal" class="modal-window">
                <button class="close-button">✖</button>
                <h2>Налаштування</h2>
                
                <div class="settings-section">
                    <h3>Зовнішній вигляд</h3>
                    <div class="settings-option">
                        <label for="dark-mode">Темна тема</label>
                        <label class="switch">
                            <input type="checkbox" id="dark-mode">
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(settingsModal);
        
        // Initialize theme settings
        initializeTheme();
        
        // Add close button handler
        settingsModal.querySelector('.close-button').addEventListener('click', () => {
            settingsModal.style.display = 'none';
            document.body.classList.remove('modal-active');
        });
    }
    
    // Показуємо модальне вікно
    settingsModal.style.display = 'flex';
    document.body.classList.add('modal-active');
});

function displayTasksForDay(tasks) {
    const tasksContainer = document.getElementById('tasks-container');
    tasksContainer.innerHTML = '';
    const username = localStorage.getItem('username');

    if (tasks && tasks.length > 0) {
        tasks.forEach(task => {
            const isCompleted = task.completedBy?.some(
                completion => completion.username === username
            );
            
            const taskElement = document.createElement('div');
            taskElement.classList.add('task-item');
            if (isCompleted) {
                taskElement.classList.add('completed');
            }
            
            taskElement.innerHTML = `
                <div class="task-content">
                    <h4>${task.subject}</h4>
                    <p>${task.description}</p>
                    <small>Додав: ${task.username}</small>
                </div>
                <div class="task-actions">
                    <label class="checkbox-container">
                        <input type="checkbox" ${isCompleted ? 'checked' : ''} 
                            data-task-id="${task._id}">
                        <span class="checkmark"></span>
                    </label>
                </div>
            `;

            const checkbox = taskElement.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', async (e) => {
                e.preventDefault();
                if (!e.target.disabled) {
                    await toggleTaskStatus(task._id, e.target);
                }
            });

            tasksContainer.appendChild(taskElement);
        });
    } else {
        tasksContainer.innerHTML = '<p class="no-tasks">Немає завдань на цю дату</p>';
    }
}

// Add this function at the end of the file
function initializeTheme() {
    const darkModeToggle = document.getElementById('dark-mode');
    
    // Check if theme preference exists
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        darkModeToggle.checked = savedTheme === 'dark';
    }

    // Add event listener for theme toggle
    darkModeToggle.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update calendar display
        renderCalendar(viewYear, viewMonth);
    });
}
