const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const User = require('./models/userModel');
const Task = require('./models/taskModel');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB підключення
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'Dayli'
}).then(() => {
    console.log('✅ Connected to MongoDB Atlas');
}).catch((error) => {
    console.error('❌ MongoDB connection error:', error);
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Регистрация
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Проверка, что все поля заполнены
  if (!username || !password) {
    return res.status(400).json({ message: 'Всі поля повинні бути заповнені!' });
  }

  // Проверяем, существует ли уже пользователь
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: 'Цей логін вже зайнятий!' });
  }

  // Хешируем пароль перед сохранением
  const hashedPassword = await bcrypt.hash(password, 10);

  // Создаем нового пользователя
  const user = new User({ username, password: hashedPassword });

  try {
    await user.save();
    res.status(201).json({ message: 'Користувача успішно зареєстровано!' });
  } catch (err) {
    res.status(500).json({ message: 'Помилка при реєстрації!' });
  }
});

// Вход
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Невірний логін або пароль!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Невірний логін або пароль!' });
    }

    // Send both message and username
    res.status(200).json({ 
      message: 'Ви успішно увійшли!',
      username: username // Use the input username
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Маршрути для завдань
app.post('/api/tasks', async (req, res) => {
  try {
    const { subject, deadline, description, username } = req.body; // Додаємо username
    const task = new Task({
      subject,
      deadline,
      description,
      username // Додаємо username до завдання
    });
    
    await task.save();
    res.status(201).json({ message: 'Завдання успішно збережено', task });
  } catch (error) {
    console.error('Помилка при збереженні завдання:', error);
    res.status(500).json({ message: 'Помилка при збереженні завдання' });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ deadline: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Помилка при отриманні завдань' });
  }
});

// Маршрут для оновлення статусу завдання
app.patch('/api/tasks/:id/toggle', async (req, res) => {
    try {
        const { username } = req.body;
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ 
                success: false, 
                message: 'Завдання не знайдено' 
            });
        }

        const userCompletionIndex = task.completedBy.findIndex(
            completion => completion.username === username
        );

        if (userCompletionIndex === -1) {
            task.completedBy.push({ username, completedAt: new Date() });
        } else {
            task.completedBy.splice(userCompletionIndex, 1);
        }

        await task.save();
        
        res.json({ 
            success: true,
            message: 'Статус завдання оновлено',
            task: task
        });
    } catch (error) {
        console.error('Помилка при оновленні завдання:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Помилка при оновленні завдання' 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Запуск сервера
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});