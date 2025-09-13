document.addEventListener('DOMContentLoaded', function() {
    const themeToggleButton = document.getElementById('theme-toggle');
    const preferDark = window.matchMedia("(prefers-color-scheme: dark)");
    let currentTheme = localStorage.getItem('theme');

    // Set initial theme based on localStorage or system preference
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
    } else if (preferDark.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Only add event listener if the button exists AND is not null
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }
});
