// Import bcrypt library for password hashing and verification
const bcrypt = require('bcryptjs');

// Function to fetch users from localStorage
function fetchUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

// Function to save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Function to hash a password using bcrypt
async function hashPassword(password) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return { hashedPassword, salt };
}

// Function to verify a password
async function verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

// Function to add a Home button to the top right of the page
function addHomeButton() {
    const homeButtonDiv = document.createElement('div');
    homeButtonDiv.classList.add('top-right-button');
    homeButtonDiv.innerHTML = '<button onclick="goToHomePage()">Home</button>';
    document.body.appendChild(homeButtonDiv);
}

// Function to redirect to home page
function goToHomePage() {
    window.location.href = 'home.html';
}

// Function to check if a user is an admin
function isAdmin(username) {
    const users = fetchUsers();
    const user = users.find(user => user.username === username);
    return user && user.role === 'admin';
}

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', function () {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    const path = window.location.pathname;

    if (loggedInUser) {
        if (path.endsWith('index.html') || path.endsWith('signup.html') || path.endsWith('login.html')) {
            window.location.href = 'home.html';
        } else if (path.endsWith('admin.html') && !isAdmin(loggedInUser)) {
            window.location.href = 'home.html';
        }
    } else {
        if (path.endsWith('home.html') || path.endsWith('admin.html')) {
            window.location.href = 'index.html';
        }
    }

    if (path.endsWith('admin.html')) {
        populateUserList();
        populateUserSettings(loggedInUser);
    }

    if (path.endsWith('home.html')) {
        displayUserData(loggedInUser);
    }

    if (path.endsWith('settings.html')) {
        populateUserSettings(loggedInUser);
    }

    if (!path.endsWith('index.html') && !path.endsWith('signup.html') && !path.endsWith('login.html')) {
        addHomeButton();
    }
});

// Handle Sign Up
document.getElementById('signupForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    let users = fetchUsers();
    if (users.some(user => user.username === username)) {
        alert('Username already exists');
        return;
    }

    const { hashedPassword } = await hashPassword(password);

    const user = {
        username: username,
        hashedPassword: hashedPassword,
        role: 'user',
        banned: false
    };

    users.push(user);
    saveUsers(users);
    sessionStorage.setItem('loggedInUser', username);
    window.location.href = 'home.html';
});

// Handle Login
document.getElementById('loginForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const users = fetchUsers();
    const user = users.find(user => user.username === username);

    if (user) {
        const isValidPassword = await verifyPassword(password, user.hashedPassword);

        if (!isValidPassword) {
            alert('Invalid username or password');
            return;
        }

        if (user.banned) {
            alert('You are banned from this platform.');
            return;
        }

        sessionStorage.setItem('loggedInUser', username);
        window.location.href = 'home.html';
    } else {
        alert('Invalid username or password');
    }
});

// Handle Sign Out
document.getElementById('signOutButton')?.addEventListener('click', function () {
    sessionStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
});

// Populate User List in Admin Page
function populateUserList() {
    const users = fetchUsers();
    const userList = document.getElementById('userList');

    if (userList) {
        userList.innerHTML = users.map(user => `
            <div class="user-item">
                <span>${user.username} (${user.role}) ${user.banned ? '(Banned)' : ''}</span>
                <div class="user-actions">
                    ${user.username !== 'admin' ? `<button onclick="toggleBanUser('${user.username}')">${user.banned ? 'Unban' : 'Ban'}</button>` : ''}
                    ${user.username !== 'admin' && user.role !== 'admin' ? `<button onclick="makeAdmin('${user.username}')">Make Admin</button>` : ''}
                    ${user.role !== 'admin' ? `<button onclick="deleteUser('${user.username}')">Delete</button>` : ''}
                    ${user.username === sessionStorage.getItem('loggedInUser') ? `<button onclick="editUserSettings('${user.username}')">Settings</button>` : ''}
                </div>
            </div>
        `).join('');
    }
}

// Populate User Settings in Admin Panel and Settings Page
function populateUserSettings(username) {
    const users = fetchUsers();
    const user = users.find(user => user.username === username);

    const userSettings = document.getElementById('userSettings');
    if (userSettings) {
        userSettings.innerHTML = `
            <form id="userSettingsForm" class="admin-form">
                <h2>User Settings</h2>
                <label for="username">Username:</label>
                <input type="text" id="username" value="${user.username}" disabled>
                <label for="newPassword">New Password:</label>
                <input type="password" id="newPassword" required>
                <button type="submit">Update Password</button>
                <button id="deleteAccountButton" type="button">Delete Account</button>
            </form>
        `;

        document.getElementById('userSettingsForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const newPassword = document.getElementById('newPassword').value;
            hashPassword(newPassword).then(({ hashedPassword }) => {
                user.hashedPassword = hashedPassword;
                saveUsers(users);
                alert('Password updated successfully.');
            });
        });

        document.getElementById('deleteAccountButton').addEventListener('click', function () {
            if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
                const updatedUsers = users.filter(u => u.username !== username);
                saveUsers(updatedUsers);
                sessionStorage.removeItem('loggedInUser');
                window.location.href = 'index.html';
            }
        });
    }
}

// Display User Data on Home Page
function displayUserData(username) {
    const users = fetchUsers();
    const user = users.find(user => user.username === username);

    const userData = document.getElementById('userData');
    if (userData) {
        userData.innerHTML = `
            <h2>Welcome ${user.username}</h2>
            <p>Role: ${user.role}</p>
            <p>Status: ${user.banned ? 'Banned' : 'Active'}</p>
        `;
    }
}

// Edit User Settings
function editUserSettings(username) {
    populateUserSettings(username);
}

// Ban/Unban User
function toggleBanUser(username) {
    const users = fetchUsers();
    const user = users.find(user => user.username === username);
    user.banned = !user.banned;
    saveUsers(users);
    populateUserList();
}

// Make User Admin
function makeAdmin(username) {
    const users = fetchUsers();
    const user = users.find(user => user.username === username);
    user.role = 'admin';
    saveUsers(users);
    populateUserList();
}

// Delete User
function deleteUser(username) {
    let users = fetchUsers();
    users = users.filter(user => user.username !== username);
    saveUsers(users);
    alert(`User ${username} has been deleted.`);
    if (username === sessionStorage.getItem('loggedInUser')) {
        sessionStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    } else {
        populateUserList();
    }
}