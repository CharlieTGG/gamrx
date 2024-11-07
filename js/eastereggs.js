// Array of URLs
const pages = [
    'easter-eggs/',
    'easter-eggs/gamrx',
    'easter-eggs/ththt',
    'easter-eggs/yourmum.html',
    'easter-eggs/yourmom.html',
    'easter-eggs/yourdad.html',
    'easter-eggs/random-sound-generator',
  ];
  
  // Function to select a random URL and redirect the user
  function goToRandomPage() {
    const randomIndex = Math.floor(Math.random() * pages.length);
    const randomPage = pages[randomIndex];
    window.location.href = randomPage;
  }
  
  // Attach the function to the anchor's click event
  document.getElementById('random-link').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default action
    goToRandomPage();
  });
  