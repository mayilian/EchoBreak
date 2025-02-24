document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("toggle");
    const status = document.querySelector(".status");
    const browser = typeof chrome !== 'undefined' ? chrome : browser;

    // Add sparkle effect
    function createSparkle(e) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';

        // Random position around the button
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;

        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;

        button.appendChild(sparkle);

        // Remove sparkle after animation
        setTimeout(() => sparkle.remove(), 1500);
    }

    // Add multiple sparkles
    function addSparkles(e) {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => createSparkle(e), i * 100);
        }
    }

    browser.storage.local.get("sessionActive", (data) => {
        updateButtonState(data.sessionActive);
    });

    button.addEventListener("click", (e) => {
        addSparkles(e);

        browser.storage.local.get("sessionActive", (data) => {
            const sessionActive = !data.sessionActive;
            browser.storage.local.set({ sessionActive });

            updateButtonState(sessionActive);
            browser.runtime.sendMessage({
                action: sessionActive ? "startWatching" : "stopWatching"
            });
        });
    });

    function updateButtonState(isActive) {
        const icon = button.querySelector('.button-icon');
        const text = button.querySelector('.button-text');

        if (isActive) {
            button.classList.add('active-button');
            icon.classList.remove('fa-brain');
            icon.classList.add('fa-brain-circuit');
            text.textContent = "Stop";
            status.classList.add('active');
        } else {
            button.classList.remove('active-button');
            icon.classList.remove('fa-brain-circuit');
            icon.classList.add('fa-brain');
            text.textContent = "Start";
            status.classList.remove('active');
        }
    }
});



