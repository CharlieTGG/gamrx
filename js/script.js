// Ensure users are fetched from the common storage
function fetchUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Redirect to home or index based on session
document.addEventListener('DOMContentLoaded', function () {
    const loggedInUser = sessionStorage.getItem('loggedInUser');

    if (loggedInUser) {
        if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('signup.html') || window.location.pathname.endsWith('login.html')) {
            window.location.href = 'home.html';
        } else if (window.location.pathname.endsWith('admin.html') && !isAdmin(loggedInUser)) {
            window.location.href = 'home.html';
        }
    } else {
        if (window.location.pathname.endsWith('home.html')) {
            window.location.href = 'index.html';
        } else if (window.location.pathname.endsWith('admin.html')) {
            window.location.href = 'index.html';
        }
    }

    if (window.location.pathname.endsWith('admin.html')) {
        populateUserList();
        populateUserSettings(loggedInUser);
    }

    if (window.location.pathname.endsWith('home.html')) {
        displayUserData(loggedInUser);
    }

    if (window.location.pathname.endsWith('settings.html')) {
        populateUserSettings(loggedInUser);
    }

    // Add the Home button to all pages except index, signup, and login
    if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('signup.html') && !window.location.pathname.endsWith('login.html')) {
        addHomeButton();
    }
});

// Add a Home button to the top right corner
function addHomeButton() {
    const homeButtonDiv = document.createElement('div');
    homeButtonDiv.classList.add('top-right-button');
    homeButtonDiv.innerHTML = `<button onclick="goToHomePage()">Home</button>`;
    document.body.appendChild(homeButtonDiv);
}

// Function to redirect to home page
function goToHomePage() {
    window.location.href = 'home.html';
}

// Handle Sign Up
document.getElementById('signupForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    let users = fetchUsers();
    if (users.some(user => user.username === username)) {
        alert('Username already exists');
        return;
    }

    const user = {
        username: username,
        password: password,
        role: 'user', // Default role is user
        banned: false
    };

    users.push(user);
    saveUsers(users);
    sessionStorage.setItem('loggedInUser', username); // Mark user as logged in for the session
    window.location.href = 'home.html';
});

// Handle Login
document.getElementById('loginForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const users = fetchUsers();
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
            saveUsers(users);
            alert('Password updated successfully.');
        });

        // Event listener for deleting account
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

// Check if the user is an admin
function isAdmin(username) {
    const users = fetchUsers();
    const user = users.find(user => user.username === username);
    return user && user.role === 'admin';
}