document.addEventListener('DOMContentLoaded', () => {
    const dateElement = document.querySelector('.date');
    const timeElement = document.querySelector('.time');

    function updateDateTime() {
        const now = new Date();
        dateElement.textContent = now.toLocaleDateString();
        timeElement.textContent = now.toLocaleTimeString();
    }

    setInterval(updateDateTime, 1000);
    updateDateTime();
});