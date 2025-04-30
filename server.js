require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/database');
const { corsOptions, securityHeaders, requestLogger } = require('./middleware/security');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));
app.use(securityHeaders);
app.use(requestLogger);

const checkAuth = (req, res, next) => {
  res.redirect('/register');
};

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Щось пішло не так!' });
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});