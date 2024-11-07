function openCalculator() {
    // Check if on Android
    if (/Android/i.test(navigator.userAgent)) {
        window.location.href = "calculator://"; // Common Android calculator scheme
    } 
    // Check if on iOS
    else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = "calshow://"; // Known iOS calculator scheme
    } 
    // Fallback for other devices
    else {
        alert("Please open your calculator app manually.");
    }
}