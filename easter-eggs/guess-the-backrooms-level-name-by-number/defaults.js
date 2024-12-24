// Prevent all default actions that might interfere with desired behavior
document.addEventListener("DOMContentLoaded", () => {
    // Disable Space and Enter for all buttons
    document.addEventListener("keydown", (event) => {
      if ((event.target.tagName === "BUTTON" || event.target.tagName === "A") &&
          (event.key === " " || event.key === "Enter")) {
        event.preventDefault();
      }
  
      // Disable F12 (DevTools), Ctrl+Shift+I, Ctrl+Shift+J, and Ctrl+U
      if (
        (event.ctrlKey && event.shiftKey && (event.key === "I" || event.key === "J")) || // DevTools shortcuts
        event.key === "F12" || // F12 Key
        (event.ctrlKey && event.key === "u") // View Source
      ) {
        event.preventDefault();
      }
    });
  
    // Disable pasting globally
    document.addEventListener("paste", (event) => {
      event.preventDefault();
    });
  
    // Disable right-click context menu globally
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
  
    // Disable focus outlines for all buttons and links
    const style = document.createElement("style");
    style.textContent = `
      button:focus, a:focus {
        outline: none;
      }
    `;
    document.head.appendChild(style);
  
    // Prevent mouse clicks from giving focus to buttons
    document.addEventListener("mousedown", (event) => {
      if (event.target.tagName === "BUTTON" || event.target.tagName === "A") {
        event.preventDefault();
      }
    });
  });