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
                icon.innerText = 'close';
                tocBtn.style.borderColor = 'var(--color-accent)'; 
                tocBtn.style.color = 'var(--color-accent)';
            } else {
                icon.innerText = 'toc';
                tocBtn.style.borderColor = '';
                tocBtn.style.color = '';
            }
        });

        // Close on outside click
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
    // 6. HANDWRITING ANIMATOR CLASS
    // =================================================================
    class HandwritingAnimator {
        constructor(wrapper, options = {}) {
            this.wrapper = wrapper;
            
            // Check if user prefers reduced motion
            this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            this.options = {
                triggerMode: 'scroll',      // 'scroll' | 'viewport'
                viewportThreshold: 0.5,
                scrollTriggerStart: 0.75,
                scrollTriggerEnd: 0.15,
                strokeStagger: 0.2,
                allowToggle: true,
                pathSelector: '.ink-strokes path, .signature-strokes path',
                penPressure: true,          // Simulate pressure variation
                penLiftDelay: 150,          // ms pause between discontinuous strokes
                strokeSpeedVariation: true, // Vary speed based on path length
                ...options
            };
            
            this.paths = [];
            this.totalLength = 0;
            this.isCompleted = false;
            this.hasPlayed = false;
            this.lastAngle = 0;
            
            this.init();
        }

        init() {
            const pathElements = this.wrapper.querySelectorAll(this.options.pathSelector);
            
            this.paths = Array.from(pathElements).map((path, index) => {
                const length = path.getTotalLength();
                const startAt = this.totalLength;
                this.totalLength += length;
                
                // Detect if this stroke is disconnected from previous (pen lift)
                const prevPath = index > 0 ? pathElements[index - 1] : null;
                const isPenLift = prevPath ? this.detectPenLift(prevPath, path) : false;
                
                // Calculate stroke complexity for speed variation
                const complexity = this.calculateComplexity(path);
                
                path.style.strokeDasharray = `${length} ${length}`;
                
                // If reduced motion is preferred, show everything immediately
                if (this.prefersReducedMotion) {
                    path.style.strokeDashoffset = 0;
                } else {
                    path.style.strokeDashoffset = length;
                }
                
                // Apply pen pressure effect (thicker at endpoints)
                if (this.options.penPressure) {
                    this.applyPenPressure(path);
                }
                
                return { path, length, startAt, isPenLift, complexity };
            });

            // Skip animation setup if reduced motion preferred
            if (this.prefersReducedMotion) {
                this.isCompleted = true;
                this.wrapper.classList.add('is-completed');
                // Hide the toggle button since animation is disabled
                const btn = this.wrapper.querySelector('.handwriting-toggle');
                if (btn) btn.style.display = 'none';
                return;
            }

            if (this.options.triggerMode === 'viewport') {
                this.setupViewportTrigger();
            } else {
                this.setupScrollTrigger();
            }

            if (this.options.allowToggle) {
                this.setupToggle();
            }
        }

        detectPenLift(prevPath, currentPath) {
            // Get end point of previous path and start point of current
            const prevEnd = prevPath.getPointAtLength(prevPath.getTotalLength());
            const currentStart = currentPath.getPointAtLength(0);
            
            // If distance > 10px, it's a pen lift
            const distance = Math.sqrt(
                Math.pow(currentStart.x - prevEnd.x, 2) + 
                Math.pow(currentStart.y - prevEnd.y, 2)
            );
            
            return distance > 10;
        }
        
        calculateComplexity(path) {
            // Sample points to estimate curvature
            const samples = 10;
            const length = path.getTotalLength();
            let totalAngleChange = 0;
            let lastAngle = 0;
            
            for (let i = 1; i < samples; i++) {
                const p1 = path.getPointAtLength((i - 1) * length / samples);
                const p2 = path.getPointAtLength(i * length / samples);
                const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                if (i > 1) {
                    totalAngleChange += Math.abs(angle - lastAngle);
                }
                lastAngle = angle;
            }
            
            // Normalize: 0 = straight line, 1 = very curvy
            return Math.min(totalAngleChange / Math.PI, 1);
        }
        
        applyPenPressure(path) {
            // Add subtle styling for pressure effect
            path.style.strokeLinecap = 'round';
            path.style.strokeLinejoin = 'round';
        }

        setupScrollTrigger() {
            const handleScroll = () => {
                if (this.isCompleted) return;
                
                // Simple approach: map document scroll percentage to animation progress
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const docHeight = document.documentElement.scrollHeight;
                const windowHeight = window.innerHeight;
                const maxScroll = docHeight - windowHeight;
                
                // Get wrapper's position in the document
                const wrapperRect = this.wrapper.getBoundingClientRect();
                const wrapperOffsetTop = scrollTop + wrapperRect.top;
                const wrapperHeight = wrapperRect.height;
                
                let progress;
                
                // Start animating when wrapper enters viewport
                const animationStartScroll = wrapperOffsetTop - windowHeight;
                // Finish animating when we've scrolled through the entire wrapper
                const animationEndScroll = wrapperOffsetTop + wrapperHeight;
                const animationScrollRange = animationEndScroll - animationStartScroll;
                
                if (scrollTop < animationStartScroll) {
                    progress = 0;
                } else if (scrollTop > animationEndScroll) {
                    progress = 1;
                } else {
                    progress = (scrollTop - animationStartScroll) / animationScrollRange;
                }
                
                progress = Math.min(Math.max(progress, 0), 1);
                
                console.log({
                    scrollTop,
                    maxScroll,
                    animationStartScroll,
                    animationEndScroll,
                    progress
                });
                
                this.setProgress(progress);
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
            window.addEventListener('resize', handleScroll);
            handleScroll();
        }

        setupViewportTrigger() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasPlayed) {
                        this.playAnimation();
                        this.hasPlayed = true;
                    }
                });
            }, { threshold: this.options.viewportThreshold });

            observer.observe(this.wrapper);
        }

        playAnimation() {
            this.paths.forEach(({ path }, index) => {
                const delay = index * this.options.strokeStagger;
                path.style.transition = `stroke-dashoffset 0.8s ease-in-out ${delay}s`;
                path.style.strokeDashoffset = '0';
            });
        }

        setProgress(progress) {
            const currentLength = this.totalLength * progress;
            let accumulatedDelay = 0;
            
            this.paths.forEach(({ path, length, startAt, isPenLift, complexity }, index) => {
                // Add pen lift delay
                if (isPenLift && index > 0) {
                    accumulatedDelay += this.options.penLiftDelay;
                }
                
                // Adjust effective start based on accumulated delays
                const delayOffset = (accumulatedDelay / 1000) * this.totalLength * 0.1;
                const adjustedStart = startAt + delayOffset;
                
                if (currentLength < adjustedStart) {
                    path.style.strokeDashoffset = length;
                } else if (currentLength > (adjustedStart + length)) {
                    path.style.strokeDashoffset = 0;
                } else {
                    // Speed variation based on complexity
                    let speedMultiplier = 1;
                    if (this.options.strokeSpeedVariation) {
                        // Simpler strokes draw faster, complex strokes slower
                        speedMultiplier = 0.7 + (complexity * 0.6);
                    }
                    
                    const effectiveLength = length * speedMultiplier;
                    const drawProgress = (currentLength - adjustedStart) / effectiveLength;
                    path.style.strokeDashoffset = length - (length * Math.min(drawProgress, 1));
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
                icon.innerText = this.isCompleted ? 'restart_alt' : 'fast_forward';
                
                if (!this.isCompleted) {
                    this.paths.forEach(({ path, length }) => {
                        path.style.strokeDashoffset = length;
                    });
                    window.dispatchEvent(new Event('scroll'));
                }
            });
        }
    }

    // =================================================================
    // 7. INITIALIZE HANDWRITING ANIMATIONS
    // =================================================================
    
    // Single-page handwritten content (scroll-based)
    document.querySelectorAll('.handwritten-wrapper').forEach(wrapper => {
        new HandwritingAnimator(wrapper, {
            triggerMode: 'scroll',
            allowToggle: true,
            pathSelector: '.ink-strokes path'
        });
    });

    // Multi-page handwriting (coordinates animation across pages)
    document.querySelectorAll('.handwritten-multipage').forEach(container => {
        const pages = Array.from(container.querySelectorAll('.handwritten-page'));
        const animators = [];
        
        // Initialize each page
        pages.forEach(page => {
            const animator = new HandwritingAnimator(page, {
                triggerMode: 'scroll',
                allowToggle: false, // Individual pages don't get toggles
                pathSelector: '.ink-strokes path'
            });
            animators.push(animator);
        });
        
        // Add single toggle for entire document
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'handwriting-toggle';
        toggleBtn.title = 'Show All Pages';
        toggleBtn.innerHTML = '<span class="material-symbols-outlined">fast_forward</span>';
        container.insertBefore(toggleBtn, container.firstChild);
        
        let allCompleted = false;
        toggleBtn.addEventListener('click', () => {
            allCompleted = !allCompleted;
            const icon = toggleBtn.querySelector('.material-symbols-outlined');
            icon.innerText = allCompleted ? 'restart_alt' : 'fast_forward';
            
            animators.forEach(animator => {
                animator.isCompleted = allCompleted;
                animator.wrapper.classList.toggle('is-completed', allCompleted);
                
                if (!allCompleted) {
                    animator.paths.forEach(({ path, length }) => {
                        path.style.strokeDashoffset = length;
                    });
                }
            });
            
            if (!allCompleted) {
                window.dispatchEvent(new Event('scroll'));
            }
        });
    });

    // Signatures (auto-play on viewport)
    document.querySelectorAll('.signature-wrapper').forEach(wrapper => {
        new HandwritingAnimator(wrapper, {
            triggerMode: 'viewport',
            viewportThreshold: 0.5,
            allowToggle: false,
            pathSelector: '.signature-strokes path'
        });
    });
});
