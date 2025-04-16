// Показ і приховування форм
document.getElementById('reg-btn').addEventListener('click', function() {
  document.querySelector('.login-form').style.display = 'none';
  document.querySelector('.register-form').style.display = 'flex';
});

document.getElementById('login-btn').addEventListener('click', function() {
  document.querySelector('.register-form').style.display = 'none';
  document.querySelector('.login-form').style.display = 'flex';
});

// Функція для реєстрації
async function register() {
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;

  const alertElement = document.getElementById('alert'); // Параграф для виведення повідомлень

  if (password !== confirmPassword) {
      alertElement.textContent = 'Паролі не співпадають!';
      alertElement.style.color = 'red';
      return;
  }

  const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
  });

  const result = await response.json();
  
  if (response.status === 201) {
      alertElement.textContent = 'Користувач успішно зареєстрований!';
      alertElement.style.color = 'green';
      document.querySelector('.register-form').style.display = 'none';
      document.querySelector('.login-form').style.display = 'flex';
  } else {
      alertElement.textContent = result.message;
      alertElement.style.color = 'red';
  }
}

// Функція для входу
async function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const alertElement = document.getElementById('alert');

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    console.log('Login response:', result); // Debug log

    if (response.ok && result.username) { // Changed condition to check for username
      // Store username in localStorage
      localStorage.setItem('username', username); // Store the input username
      console.log('Stored username:', localStorage.getItem('username')); // Debug log
      
      // Встановлюємо зелений колір для успішного входу
      alertElement.style.color = 'green';
      alertElement.textContent = 'Ви успішно увійшли!';
      
      // Затримка перед переходом
      setTimeout(() => {
        window.location.href = 'main.html';
      }, 1000);
    } else {
      alertElement.style.color = 'red';
      alertElement.textContent = result.message || 'Помилка при вході';
    }
  } catch (error) {
    console.error('Login error:', error);
    alertElement.style.color = 'red';
    alertElement.textContent = 'Помилка сервера';
  }
}
