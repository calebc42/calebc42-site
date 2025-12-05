document.addEventListener('DOMContentLoaded', () => {
    
    // =================================================================
    // 1. THEME TOGGLE
    // =================================================================
    const themeBtn = document.querySelector('.theme-toggle');
    const html = document.documentElement;
    
    // Check storage or system preference on load
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    } else if (systemDark) {
        html.setAttribute('data-theme', 'dark');
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // =================================================================
    // 2. COPY BUTTONS (Robust Version)
    // =================================================================
    // Target Hugo's .highlight blocks
    document.querySelectorAll('.highlight').forEach(container => {
        // Find the internal code block
        const codeBlock = container.querySelector('code');
        if (!codeBlock) return;

        // Create the button
        const button = document.createElement('button');
        button.className = 'copy-button material-symbols-outlined';
        button.type = 'button';
        button.innerText = 'content_copy'; // Icon name
        button.ariaLabel = 'Copy code';

        button.addEventListener('click', async () => {
            const textToCopy = codeBlock.innerText;
            
            try {
                // Modern API
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(textToCopy);
                } else {
                    // Fallback (from your old site-nav.js)
                    const textArea = document.createElement('textarea');
                    textArea.value = textToCopy;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-9999px';
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                }

                // Success State
                button.innerText = 'check';
                button.classList.add('copied');
                
                setTimeout(() => {
                    button.innerText = 'content_copy';
                    button.classList.remove('copied');
                }, 2000);

            } catch (err) {
                console.error('Failed to copy:', err);
                button.innerText = 'error';
            }
        });

        container.appendChild(button);
    });

    // =================================================================
    // 3. PROGRESS BAR
    // =================================================================
    const progressBar = document.querySelector('.progress-bar-fill');

    if (progressBar) {
        window.addEventListener('scroll', () => {
            // Get the scroll position from multiple possible sources
            const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;

            // precise height calculation
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

            // Prevent division by zero if page doesn't scroll
            const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

            progressBar.style.width = scrolled + "%";
        }, { passive: true });
    }
});
