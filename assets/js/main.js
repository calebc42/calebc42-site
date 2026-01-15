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

document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.querySelector(".handwritten-wrapper");
    if (!wrapper) return;

    // Target paths explicitly inside the strokes group
    const paths = Array.from(wrapper.querySelectorAll(".ink-strokes path"));
    const toggleBtn = wrapper.querySelector(".handwriting-toggle");
    let totalLength = 0;
    
    const pathData = paths.map(path => {
        const length = path.getTotalLength();
        const startAt = totalLength;
        totalLength += length;
        path.style.strokeDasharray = `${length} ${length}`;
        path.style.strokeDashoffset = length;
        return { path, length, startAt };
    });

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            wrapper.classList.toggle('is-completed');
            const icon = toggleBtn.querySelector('.material-symbols-outlined');
            icon.innerText = wrapper.classList.contains('is-completed') ? 'restart_alt' : 'fast_forward';
            if (!wrapper.classList.contains('is-completed')) handleDrawing();
        });
    }

    const handleDrawing = () => {
        if (wrapper.classList.contains('is-completed')) return;

        const rect = wrapper.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const startPoint = windowHeight * 0.75; // Adjusted for a smoother trigger
        const endPoint = windowHeight * 0.15;

        // Fallback for non-scrollable pages or small windows
        const isScrollable = document.documentElement.scrollHeight > windowHeight;
        
        let progress;
        if (!isScrollable || rect.bottom < windowHeight * 0.5) {
            progress = 1;
        } else {
            progress = (startPoint - rect.top) / (startPoint - endPoint);
        }
        
        progress = Math.min(Math.max(progress, 0), 1);
        const currentTargetLength = totalLength * progress;

        pathData.forEach(({ path, length, startAt }) => {
            if (currentTargetLength < startAt) {
                path.style.strokeDashoffset = length;
            } else if (currentTargetLength > (startAt + length)) {
                path.style.strokeDashoffset = 0;
            } else {
                path.style.strokeDashoffset = length - (currentTargetLength - startAt);
            }
        });
    };

    window.addEventListener("scroll", handleDrawing, { passive: true });
    window.addEventListener("resize", handleDrawing);
    handleDrawing(); 
});

document.addEventListener("DOMContentLoaded", () => {
    const sigWrapper = document.querySelector(".signature-wrapper");
    if (!sigWrapper) return;

    const paths = sigWrapper.querySelectorAll(".signature-strokes path");
    
    // Setup paths for auto-animation
    paths.forEach(path => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
    });

    const signatureObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Trigger the writing animation for each stroke
                paths.forEach((path, index) => {
                    // Stagger the strokes slightly for realism
                    path.style.transition = `stroke-dashoffset 0.8s ease-in-out ${index * 0.2}s`;
                    path.style.strokeDashoffset = "0";
                });
                signatureObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    signatureObserver.observe(sigWrapper);
});
