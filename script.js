// Prevent right click
document.oncontextmenu = () => {
    alert("Checking access...")
    alert("Access Denied.")
    return false
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
    // Prevent Ctrl + C shortcut
    if(e.ctrlKey && e.key == "c") {
        alert("Checking access...")
    alert("Access Denied.")
        return false
    }
    // Prevent Ctrl + V shortcut
    if(e.ctrlKey && e.key == "v") {
        alert("Checking access...")
    alert("Access Denied.")
        return false
    }
}