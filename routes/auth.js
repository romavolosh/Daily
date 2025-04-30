const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose'); // Added mongoose for database connection check
const User = require('../models/userModel');
const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Всі поля повинні бути заповнені!' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: 'Цей логін вже зайнятий!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });

    try {
        await user.save();
        res.status(201).json({ message: 'Користувача успішно зареєстровано!' });
    } catch (err) {
        res.status(500).json({ message: 'Помилка при реєстрації!' });
    }
});

// Вход
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Будь ласка, введіть логін та пароль' 
            });
        }

        // Check database connection
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: 'Помилка підключення до бази даних. Спробуйте пізніше.'
            });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Невірний логін або пароль' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Невірний логін або пароль' 
            });
        }

        // Success
        res.status(200).json({
            success: true,
            message: 'Успішний вхід',
            user: {
                username: user.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Помилка сервера при вході';
        
        // More specific error messages based on error type
        if (error.name === 'MongooseError') {
            errorMessage = 'Помилка бази даних. Спробуйте пізніше.';
        } else if (error.name === 'ValidationError') {
            errorMessage = 'Невірні дані для входу';
        }

        res.status(500).json({ 
            success: false,
            message: errorMessage
        });
    }
});

module.exports = router;