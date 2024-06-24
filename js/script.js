// Redirect to home or index based on session
document.addEventListener('DOMContentLoaded', function () {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    const adminActions = document.getElementById('adminActions');

    if (loggedInUser) {
        if (window.location.pathname === '/index.html' || window.location.pathname === '/signup.html' || window.location.pathname === '/login.html') {
            window.location.href = 'home.html';
        } else if (window.location.pathname === '/admin.html' && !isAdmin(loggedInUser)) {
            window.location.href = 'home.html';
        }

        // Show "Clear All Users" button for admin on index page
        if (window.location.pathname === '/index.html' && isAdmin(loggedInUser)) {
            adminActions.style.display = 'block';
        }
    } else {
        if (window.location.pathname === '/home.html') {
            window.location.href = 'index.html';
        } else if (window.location.pathname === '/admin.html') {
            window.location.href = 'index.html';
        }
    }

    if (window.location.pathname === '/admin.html') {
        populateUserList();
        populateUserSettings(loggedInUser);
    }

    if (window.location.pathname === '/home.html') {
        displayUserData(loggedInUser);
    }

    if (window.location.pathname === '/settings.html') {
        populateUserSettings(loggedInUser);
    }
});

// Handle Sign Up
document.getElementById('signupForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(user => user.username === username)) {
        alert('Username already exists');
        return;
    }

    const user = {
        username: username,
        password: password,
        role: users.length === 0 ? 'admin' : 'user',  // First user is admin by default
        banned: false
    };

    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    sessionStorage.setItem('loggedInUser', username); // Mark user as logged in for the session
    window.location.href = 'home.html';
});

// Handle Login
document.getElementById('loginForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        if (user.banned) {
            alert('You are banned from this platform.');
            return;
        }

        sessionStorage.setItem('loggedInUser', username); // Mark user as logged in for the session
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'home.html';
        }
    } else {
        alert('Invalid username or password');
    }
});

// Handle Sign Out
document.getElementById('signOutButton')?.addEventListener('click', function () {
    sessionStorage.removeItem('loggedInUser'); // Remove logged-in user session
    window.location.href = 'index.html';
});

// Populate User List in Admin Page
function populateUserList() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userList = document.getElementById('userList');

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

// Populate User Settings in Admin Panel and Settings Page
function populateUserSettings(username) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === username);

    const userSettings = document.getElementById('userSettings');
    if (userSettings) { // Only populate if element exists (admin.html or settings.html)
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

        // Event listener for updating password
        document.getElementById('userSettingsForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const newPassword = document.getElementById('newPassword').value;
            user.password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
            alert('Password updated successfully.');
        });

        // Event listener for deleting account
        document.getElementById('deleteAccountButton').addEventListener('click', function () {
            if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
                const updatedUsers = users.filter(u => u.username !== username);
                localStorage.setItem('users', JSON.stringify(updatedUsers));
                sessionStorage.removeItem('loggedInUser');
                window.location.href = 'index.html';
            }
        });
    }
}

// Display User Data on Home Page
function displayUserData(username) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === username);

    const userData = document.getElementById('userData');
    if (userData) { // Only populate if element exists (home.html)
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
    let users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(user => user.username === username);
    user.banned = !user.banned;
    localStorage.setItem('users', JSON.stringify(users));
    populateUserList();
}

// Make User Admin
function makeAdmin(username) {
    let users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(user => user.username === username);
    user.role = 'admin';
    localStorage.setItem('users', JSON.stringify(users));
    populateUserList();
}

// Delete User
function deleteUser(username) {
    let users = JSON.parse(localStorage.getItem('users'));
    users = users.filter(user => user.username !== username);
    localStorage.setItem('users', JSON.stringify(users));
    alert(`User ${username} has been deleted.`);
    if (username === sessionStorage.getItem('loggedInUser')) {
        sessionStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    } else {
        populateUserList();
    }
}

// Check if the user is an admin
function isAdmin(username) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === username);
    return user && user.role === 'admin';
}

// Clear All Users
document.getElementById('clearAllUsersButton')?.addEventListener('click', function () {
    if (confirm('Are you sure you want to clear all users? This action cannot be undone.')) {
        localStorage.removeItem('users');
        alert('All users have been cleared.');
        sessionStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    }
});

// Add New Admin
document.getElementById('addAdminForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const newAdminUsername = document.getElementById('newAdminUsername').value.trim();
    let users = JSON.parse(localStorage.getItem('users')) || [];

    const user = users.find(user => user.username === newAdminUsername);

    if (user) {
        if (user.role === 'admin') {
            alert('User is already an admin.');
        } else {
            user.role = 'admin';
            localStorage.setItem('users', JSON.stringify(users));
            alert(`User ${newAdminUsername} has been promoted to admin.`);
            populateUserList();
        }
    } else {
        alert('User not found.');
    }
});

// Function to redirect to home page
function goToHomePage() {
    window.location.href = 'home.html';
}

document.onkeydown = e => {
    // Prevent F12 key
    if(e.key == "F12") {
        alert("Checking access...")
    alert("Access Denied.")
        return false
    }
    // Prevent Ctrl + U shortcut
    if(e.ctrlKey && e.key == "u") {
        alert("Checking access...")
    alert("Access Denied.")
        return false
    }
}