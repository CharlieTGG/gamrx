document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const signOutButton = document.getElementById('signOutButton');
    const userListContainer = document.getElementById('userList');
    const userSettingsContainer = document.getElementById('userSettings');
    const themeSelectSettings = document.getElementById('themeSelectSettings');

    // Initialize Users and Themes
    let users = fetchUsers();
    let currentTheme = sessionStorage.getItem('theme') || 'light-theme';
    document.body.className = currentTheme;

    // Handle Sign Up
    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            if (users.some(user => user.username === username)) {
                alert('Username already exists');
                return;
            }

            const hashedPassword = await hashPassword(password);

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
    }

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

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
    }

    // Handle Sign Out
    if (signOutButton) {
        signOutButton.addEventListener('click', function () {
            sessionStorage.removeItem('loggedInUser');
            sessionStorage.removeItem('theme');
            window.location.href = 'index.html';
        });
    }

    // Display User List on Admin Page
    if (userListContainer) {
        displayUsers();
    }

    // Display User Settings on Settings Page
    if (userSettingsContainer) {
        displayUserSettings();
    }

    // Handle Theme Selection
    if (themeSelectSettings) {
        themeSelectSettings.addEventListener('change', function () {
            const selectedTheme = themeSelectSettings.value;
            document.body.className = selectedTheme;
            sessionStorage.setItem('theme', selectedTheme);
        });
    }

    // Redirect if not logged in
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    const path = window.location.pathname;
    if (!loggedInUser && (path.endsWith('home.html') || path.endsWith('admin.html'))) {
        window.location.href = 'index.html';
    }

    // Redirect if logged in
    if (loggedInUser && (path.endsWith('index.html') || path.endsWith('signup.html') || path.endsWith('login.html'))) {
        window.location.href = 'home.html';
    }

    // Fetch Users from Local Storage
    function fetchUsers() {
        const usersJSON = localStorage.getItem('users');
        return usersJSON ? JSON.parse(usersJSON) : [];
    }

    // Save Users to Local Storage
    function saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Display Users in Admin Panel
    function displayUsers() {
        userListContainer.innerHTML = '';
        users.forEach((user, index) => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <span>${index + 1}. ${user.username} (${user.role})</span>
                <div class="user-actions">
                    <button onclick="toggleBanUser('${user.username}')">${user.banned ? 'Unban' : 'Ban'}</button>
                    <button onclick="deleteUser('${user.username}')">Delete</button>
                    <button onclick="makeAdmin('${user.username}')">Make Admin</button>
                </div>
            `;
            userListContainer.appendChild(userItem);
        });
    }

    // Display User Settings
    function displayUserSettings() {
        const loggedInUser = sessionStorage.getItem('loggedInUser');
        if (!loggedInUser) {
            alert('No user logged in.');
            window.location.href = 'index.html';
            return;
        }

        const user = users.find(u => u.username === loggedInUser);
        userSettingsContainer.innerHTML = `
            <h2>Settings for ${user.username}</h2>
            <label>Change Username:</label>
            <input type="text" id="newUsername" value="${user.username}">
            <button onclick="changeUsername('${user.username}')">Change Username</button>
            <label>Change Password:</label>
            <input type="password" id="newPassword" placeholder="New Password">
            <button onclick="changePassword('${user.username}')">Change Password</button>
            <button onclick="deleteAccount('${user.username}')">Delete Account</button>
            <label>Change Theme:</label>
            <select id="themeSelectSettings">
                <option value="light-theme" ${currentTheme === 'light-theme' ? 'selected' : ''}>Light</option>
                <option value="dark-theme" ${currentTheme === 'dark-theme' ? 'selected' : ''}>Dark</option>
                <option value="dyslexic-theme" ${currentTheme === 'dyslexic-theme' ? 'selected' : ''}>Dyslexic</option>
                <option value="colorblind-theme" ${currentTheme === 'colorblind-theme' ? 'selected' : ''}>Colorblind</option>
            </select>
        `;
    }

    // Change Username
    window.changeUsername = function (oldUsername) {
        const newUsername = document.getElementById('newUsername').value.trim();
        if (!newUsername) {
            alert('Username cannot be empty.');
            return;
        }

        if (users.some(user => user.username === newUsername)) {
            alert('Username already taken.');
            return;
        }

        const user = users.find(user => user.username === oldUsername);
        user.username = newUsername;
        saveUsers(users);
        sessionStorage.setItem('loggedInUser', newUsername);
        alert('Username changed successfully.');
    };

    // Change Password
    window.changePassword = async function (username) {
        const newPassword = document.getElementById('newPassword').value;
        if (!newPassword) {
            alert('Password cannot be empty.');
            return;
        }

        const user = users.find(user => user.username === username);
        user.hashedPassword = await hashPassword(newPassword);
        saveUsers(users);
        alert('Password changed successfully.');
    };

    // Delete Account
    window.deleteAccount = function (username) {
        const user = users.find(user => user.username === username);
        if (user.role === 'admin') {
            alert('Admin accounts cannot be deleted.');
            return;
        }

        if (confirm('Are you sure you want to delete this account?')) {
            users = users.filter(user => user.username !== username);
            saveUsers(users);
            sessionStorage.removeItem('loggedInUser');
            alert('Account deleted successfully.');
            window.location.href = 'index.html';
        }
    };

    // Toggle Ban User
    window.toggleBanUser = function (username) {
        const user = users.find(user => user.username === username);
        user.banned = !user.banned;
        saveUsers(users);
        displayUsers();
    };

    // Delete User
    window.deleteUser = function (username) {
        const user = users.find(user => user.username === username);
        if (user.role === 'admin') {
            alert('Admin accounts cannot be deleted.');
            return;
        }

        if (confirm('Are you sure you want to delete this user?')) {
            users = users.filter(user => user.username !== username);
            saveUsers(users);
            displayUsers();
        }
    };

    // Make Admin
    window.makeAdmin = function (username) {
        const user = users.find(user => user.username === username);
        user.role = 'admin';
        saveUsers(users);
        displayUsers();
    };

    // Password Hashing
    async function hashPassword(password) {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedPassword = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        return hashedPassword;
    }

    // Verify Password
    async function verifyPassword(password, hashedPassword) {
        const passwordHash = await hashPassword(password);
        return passwordHash === hashedPassword;
    }

    // Add Home Button to All Pages Except Index, Signup, and Login
    const addHomeButton = () => {
        if (!window.location.pathname.endsWith('index.html') &&
            !window.location.pathname.endsWith('signup.html') &&
            !window.location.pathname.endsWith('login.html')) {
            const homeButton = document.createElement('button');
            homeButton.textContent = 'Home';
            homeButton.className = 'top-right-button';
            homeButton.onclick = () => window.location.href = 'home.html';
            document.body.appendChild(homeButton);
        }
    };

    addHomeButton();

    // Load all users across devices
    function loadAllUsers() {
        const usersJSON = localStorage.getItem('users');
        return usersJSON ? JSON.parse(usersJSON) : [];
    }

    // Save users globally
    function saveAllUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Load users from any device
    function updateUsers() {
        users = loadAllUsers();
    }

    // Call updateUsers to ensure users list is updated
    updateUsers();
});
