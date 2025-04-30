const express = require('express');
const Task = require('../models/taskModel');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { subject, deadline, description, username } = req.body;
        const task = new Task({
            subject,
            deadline,
            description,
            username
        });
        
        await task.save();
        res.status(201).json({ message: 'Завдання успішно збережено', task });
    } catch (error) {
        console.error('Помилка при збереженні завдання:', error);
        res.status(500).json({ message: 'Помилка при збереженні завдання' });
    }
});

router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ deadline: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Помилка при отриманні завдань' });
    }
});

router.patch('/:id/toggle', async (req, res) => {
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

module.exports = router;