document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. THEME TOGGLE
    // =================================================================
    try {
        const themeBtn = document.querySelector('.theme-toggle');
        const html = document.documentElement;
        const savedTheme = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            html.setAttribute('data-theme', savedTheme);
        } else if (systemDark) {
            html.setAttribute('data-theme', 'dark');
        }

        if (themeBtn) {
            themeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const currentTheme = html.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                html.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
            });
        }
    } catch (err) { console.error("Theme toggle error:", err); }

    // =================================================================
    // 2. COPY BUTTONS
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

    // =================================================================
    // 3. FLOATING TOC TOGGLE
    // =================================================================
    const tocBtn = document.getElementById('toc-toggle-btn');
    const tocPopup = document.getElementById('toc-popup');

    if (tocBtn && tocPopup) {
        tocBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            tocPopup.classList.toggle('visible');
            const icon = tocBtn.querySelector('.material-symbols-outlined');
            if (tocPopup.classList.contains('visible')) {
                icon.innerText = 'close';
                tocBtn.style.borderColor = 'var(--color-accent)'; 
                tocBtn.style.color = 'var(--color-accent)';
            } else {
                icon.innerText = 'toc';
                tocBtn.style.borderColor = '';
                tocBtn.style.color = '';
            }
        });

        document.addEventListener('click', (e) => {
            if (tocPopup.classList.contains('visible') && !tocPopup.contains(e.target) && !tocBtn.contains(e.target)) {
                tocPopup.classList.remove('visible');
                const icon = tocBtn.querySelector('.material-symbols-outlined');
                icon.innerText = 'toc';
                tocBtn.style.borderColor = '';
                tocBtn.style.color = '';
            }
        });
    }

    // =================================================================
    // 4. SITE PROGRESS BAR
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
    // 5. HANDWRITING ANIMATOR CLASS (Elegant Logic Version)
    // =================================================================
    class HandwritingAnimator {
        constructor(wrapper, options = {}) {
            this.wrapper = wrapper;
            this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            this.options = { 
                triggerMode: 'scroll', 
                pathSelector: '.ink-strokes path, .signature-strokes path',
                ...options 
            };
            
            this.paths = [];
            this.totalLength = 0;
            this.isCompleted = false;
            this.ticking = false;
            this.init();
        }

        init() {
            const pathElements = this.wrapper.querySelectorAll(this.options.pathSelector);
            this.paths = Array.from(pathElements).map(path => {
                const length = path.getTotalLength();
                const startAt = this.totalLength;
                this.totalLength += length;
                
                path.style.strokeDasharray = `${length} ${length}`;
                path.style.strokeDashoffset = this.prefersReducedMotion ? 0 : length;
                path.style.vectorEffect = 'non-scaling-stroke'; 
                
                return { path, length, startAt };
            });

            if (!this.prefersReducedMotion) {
                this.setupScrollTrigger();
                this.setupToggle();
                this.setupLightbox();
            }
        }

        setupScrollTrigger() {
            const onScroll = () => {
                if (!this.ticking && !this.isCompleted) {
                    window.requestAnimationFrame(() => {
                        this.updateProgress();
                        this.ticking = false;
                    });
                    this.ticking = true;
                }
            };
            window.addEventListener('scroll', onScroll, { passive: true });
            this.updateProgress(); 
        }

        updateProgress() {
            const rect = this.wrapper.getBoundingClientRect();
            const winH = window.innerHeight;
            
            // 1. Determine when to start
            // We start when the top of the element is 85% down the screen
            const triggerPoint = winH * 0.85;
            
            // 2. Calculate Distance Scrolled
            // How many pixels have we moved the 'top' past the trigger point?
            const distanceScrolled = triggerPoint - rect.top;
            
            // 3. Define Drawing Range
            // The animation should take roughly the height of the element to complete
            // We add a little 'padding' to the range so it doesn't feel rushed.
            const drawingRange = rect.height * 1.2;

            let progress = distanceScrolled / drawingRange;

            // 4. Force 0 if we haven't reached the trigger yet
            if (rect.top > triggerPoint) {
                progress = 0;
            }

            // 5. Hard Snap at the very bottom
            // If the bottom of the SVG is 100px above the bottom of the screen, finish it.
            if (rect.bottom < winH - 100) {
                progress = 1;
            }

            progress = Math.max(0, Math.min(1, progress));
            this.setProgress(progress);
        }

        setProgress(progress) {
            const currentTarget = this.totalLength * progress;
            this.paths.forEach(({ path, length, startAt }) => {
                if (currentTarget < startAt) {
                    path.style.strokeDashoffset = length;
                } else if (currentTarget > (startAt + length)) {
                    path.style.strokeDashoffset = 0;
                } else {
                    path.style.strokeDashoffset = length - (currentTarget - startAt);
                }
            });
        }

        setupToggle() {
            const btn = this.wrapper.querySelector('.handwriting-toggle');
            if (!btn) return;
            btn.addEventListener('click', () => {
                this.isCompleted = !this.isCompleted;
                this.wrapper.classList.toggle('is-completed', this.isCompleted);
                const icon = btn.querySelector('.material-symbols-outlined');
                if(icon) icon.innerText = this.isCompleted ? 'restart_alt' : 'fast_forward';
                if (!this.isCompleted) this.updateProgress();
            });
        }

        setupLightbox() {
            const modal = document.getElementById('handwritten-modal');
            if (!modal) return;
            
            const modalContent = modal.querySelector('.lightbox-content');
            const closeBtn = modal.querySelector('.lightbox-close');

            let scale = 1;
            let pointX = 0;
            let pointY = 0;
            let start = { x: 0, y: 0 };
            let isPanning = false;
            let lastTap = 0;

            const setTransform = () => {
                const svg = modalContent.querySelector('svg');
                if (svg) {
                    svg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
                }
            };

            const resetView = () => {
                scale = 1;
                pointX = 0;
                pointY = 0;
                setTransform();
            };

            this.wrapper.addEventListener('click', (e) => {
                if (e.target.closest('.handwriting-toggle')) return;

                const svgClone = this.wrapper.querySelector('svg').cloneNode(true);
                modalContent.className = 'lightbox-content ' + this.wrapper.className;
                modalContent.innerHTML = '';
                modalContent.appendChild(svgClone);
                
                resetView();
                modalContent.querySelectorAll('path').forEach(p => p.style.strokeDashoffset = '0');
                modal.classList.add('is-active');
                document.body.style.overflow = 'hidden';
            });

            // Double Tap to Reset
            modal.addEventListener('touchstart', (e) => {
                const now = Date.now();
                if (now - lastTap < 300) {
                    e.preventDefault();
                    resetView();
                }
                lastTap = now;
            });

            // Close button with z-index priority
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                modal.classList.remove('is-active');
                document.body.style.overflow = '';
            }, true);

            // Improved Pointer Logic
            modal.onpointerdown = (e) => {
                if (e.target.closest('.lightbox-close')) return;
                isPanning = true;
                start = { x: e.clientX - pointX, y: e.clientY - pointY };
                modal.setPointerCapture(e.pointerId);
            };

            modal.onpointermove = (e) => {
                if (!isPanning) return;
                pointX = e.clientX - start.x;
                pointY = e.clientY - start.y;
                setTransform();
            };

            modal.onpointerup = (e) => {
                isPanning = false;
                modal.releasePointerCapture(e.pointerId);
            };

            modal.onwheel = (e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? 0.9 : 1.1;
                scale *= delta;
                scale = Math.min(Math.max(0.3, scale), 8); // Wider zoom range
                setTransform();
            };
        }
    }

    // =================================================================
    // 6. INITIALIZATION
    // =================================================================
    document.querySelectorAll('.handwritten-wrapper, .handwritten-page').forEach(el => {
        new HandwritingAnimator(el);
    });

});
