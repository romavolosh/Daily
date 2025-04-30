# 🗓️ Daily – Student Homework Calendar

**Daily** is a simple and collaborative web application that helps students keep track of homework assignments. Any user can view tasks by date, and authorized users can add new assignments. It’s designed for small groups or study circles to organize and stay on top of their studies.

## 🚀 Features

- 📆 Interactive calendar view  
- ✅ View tasks for a specific date  
- ✍️ Add homework with subject, deadline, and author's name  
- 🔐 Authentication for adding and managing tasks  
- 🔄 Task completion tracking  
- 📌 "About Us" section with project information  
- 🌐 Hosted for group access (up to ~30 users)

## 🛠️ Tech Stack

**Frontend:**
- HTML / CSS / JavaScript  
- Modal windows for task management

**Backend:**
- Node.js  
- Express.js

**Database:**
- MongoDB (used for storing assignments with subject, deadline, and author)

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/romavolosh/Daily.git
   cd Daily
   npm install

2. **Set up environment variables:**
   -Create a .env file in the root folder and configure:
   ```bash
   MONGODB_URI=<your_mongodb_connection>
   PORT=3000
3. **Run the server:**
   ```bash
   node server.js
4. **Open the app in your browser:**
   ```bash
   http://localhost:3000

Built with ❤️ by romavolosh
   
