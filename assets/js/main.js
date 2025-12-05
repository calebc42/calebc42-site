document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. THEME TOGGLE (Core Feature - Prioritized)
    // =================================================================
    try {
        const themeBtn = document.querySelector('.theme-toggle');
        const html = document.documentElement;
        
        // Load saved preference
        const savedTheme = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            html.setAttribute('data-theme', savedTheme);
        } else if (systemDark) {
            html.setAttribute('data-theme', 'dark');
        }

        if (themeBtn) {
            themeBtn.addEventListener('click', (e) => {
                // Prevent any weird default behaviors
                e.preventDefault();
                const currentTheme = html.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                html.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
            });
        }
    } catch (err) {
        console.error("Theme toggle error:", err);
    }

    // =================================================================
    // 2. DYNAMIC BREADCRUMB & SCROLLSPY
    // =================================================================
    try {
        const breadcrumb = document.querySelector('.breadcrumb');
        const header = document.querySelector('.site-header');
        const breadcrumbDynamicContainer = document.querySelector('.breadcrumb-dynamic-container');
        const breadcrumbCurrentSection = document.getElementById('breadcrumb-current-section');
        const sections = document.querySelectorAll('.content h2, .content h3');
        const tocLinks = document.querySelectorAll('#TableOfContents a');

        // A. Toggle Breadcrumb Visibility
        if (breadcrumb && header) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > header.offsetHeight) {
                    breadcrumb.classList.add('visible');
                    document.body.classList.add('has-breadcrumb');
                } else {
                    breadcrumb.classList.remove('visible');
                    document.body.classList.remove('has-breadcrumb');
                }
            }, { passive: true });
        }

        // B. Update Section Text (ScrollSpy)
        if (sections.length > 0) {
            const observerOptions = {
                root: null,
                rootMargin: '0px 0px -80% 0px', 
                threshold: 0
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        if (!id) return;

                        // Update Sidebar ToC (if exists)
                        tocLinks.forEach(link => link.classList.remove('active'));
                        const activeLink = document.querySelector(`#TableOfContents a[href="#${CSS.escape(id)}"]`);
                        if (activeLink) activeLink.classList.add('active');

                        // Update Breadcrumb Text
                        if (breadcrumbCurrentSection && breadcrumbDynamicContainer) {
                            let sectionText = entry.target.innerText.replace('#', '').trim();
                            if (sectionText.length > 25) sectionText = sectionText.substring(0, 25) + '...';
                            
                            breadcrumbCurrentSection.innerText = sectionText;
                            breadcrumbDynamicContainer.style.opacity = '1';
                        }
                    }
                });
            }, observerOptions);

            sections.forEach(section => observer.observe(section));
        }
    } catch (err) {
        console.error("Breadcrumb/Scrollspy error:", err);
    }

    // =================================================================
    // 3. PROGRESS BAR
    // =================================================================
    const progressBar = document.querySelector('.progress-bar-fill');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = scrolled + "%";
        }, { passive: true });
    }

    // =================================================================
    // 4. COPY BUTTONS
    // =================================================================
    document.querySelectorAll('.highlight').forEach(container => {
        const codeBlock = container.querySelector('code');
        if (!codeBlock) return;

        const button = document.createElement('button');
        button.className = 'copy-button material-symbols-outlined';
        button.type = 'button';
        button.innerText = 'content_copy';

        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(codeBlock.innerText);
                button.innerText = 'check';
                setTimeout(() => button.innerText = 'content_copy', 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
        container.appendChild(button);
    });
});

    // =================================================================
    // 5. FLOATING TOC TOGGLE
    // =================================================================
    const tocBtn = document.getElementById('toc-toggle-btn');
    const tocPopup = document.getElementById('toc-popup');

    if (tocBtn && tocPopup) {
        tocBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            tocPopup.classList.toggle('visible');
            
            // Icon Swap Logic
            const icon = tocBtn.querySelector('.material-symbols-outlined');
            if (tocPopup.classList.contains('visible')) {
                icon.innerText = 'close'; // Changes hamburger to X
                // Optional: Make the button "active" colored while open
                tocBtn.style.borderColor = 'var(--color-accent)'; 
                tocBtn.style.color = 'var(--color-accent)';
            } else {
                icon.innerText = 'toc';   // Changes X back to hamburger
                tocBtn.style.borderColor = '';
                tocBtn.style.color = '';
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (tocPopup.classList.contains('visible') && !tocPopup.contains(e.target) && !tocBtn.contains(e.target)) {
                tocPopup.classList.remove('visible');
                
                // Reset Icon
                const icon = tocBtn.querySelector('.material-symbols-outlined');
                icon.innerText = 'toc';
                tocBtn.style.borderColor = '';
                tocBtn.style.color = '';
            }
        });
    }
