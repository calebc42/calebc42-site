document.addEventListener('DOMContentLoaded', function() {
    
    // --- Reading Time Calculation Function ---
    function calculateReadingTime(element) {
        const text = element.textContent || element.innerText || '';
        const wordsPerMinute = 200;
        const wordCount = text.trim().split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }
    
    // --- Code Block Interactivity ---
    const codeContainers = document.querySelectorAll('.org-src-container');
    codeContainers.forEach(container => {
        const pre = container.querySelector('pre.src');
        if (pre) {
            // Add copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button has-icon';
            copyButton.setAttribute('aria-label', 'Copy code');
            
            copyButton.addEventListener('click', async (e) => {
                e.stopPropagation();
                const textToCopy = pre.textContent;
                
                try {
                    if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(textToCopy);
                        copyButton.classList.add('copied');
                    } else {
                        // Fallback for older browsers
                        const textArea = document.createElement('textarea');
                        textArea.value = textToCopy;
                        textArea.style.position = 'fixed';
                        textArea.style.left = '-9999px';
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        copyButton.classList.add('copied');
                    }
                } catch (err) {
                    console.error('Failed to copy text:', err);
                    copyButton.classList.add('error');
                }
                
                setTimeout(() => {
                    copyButton.classList.remove('copied', 'error');
                }, 1500);
            });
            
            container.appendChild(copyButton);
            
            // Add collapsible functionality for long code blocks
            if (pre.scrollHeight > 140) {
                container.classList.add('collapsed');
                const collapseButton = document.createElement('button');
                collapseButton.className = 'collapse-button';
                
                const toggleCollapse = () => {
                    container.classList.toggle('collapsed');
                };

                collapseButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleCollapse();
                });

                // Click anywhere on container to expand
                container.addEventListener('click', (e) => {
                    if (!e.target.matches('button') && container.classList.contains('collapsed')) {
                        toggleCollapse();
                    }
                });
                
                container.appendChild(collapseButton);
            }
        }
    });

    // --- Collapsible Headers ---
    function makeHeadersCollapsible(headerSelectors) {
        headerSelectors.forEach(selector => {
            const headers = Array.from(document.querySelectorAll(selector));
            
            headers.forEach(header => {
                // Skip headers in table of contents
                if (header.closest('#table-of-contents, .table-of-contents')) {
                    return;
                }
                
                header.classList.add('collapsible-section');
                if (selector === 'h2') {
                    header.classList.add('h2-section');
                }
                
                // Create wrapper for content
                const contentWrapper = document.createElement('div');
                contentWrapper.className = 'section-content-wrapper collapsed';
                
                // Find all elements until next header of same or higher level
                const elementsToWrap = [];
                let currentElement = header.nextElementSibling;
                const headerLevel = parseInt(header.tagName.charAt(1));
                
                while (currentElement) {
                    const tagName = currentElement.tagName;
                    
                    if (tagName && tagName.startsWith('H')) {
                        const currentLevel = parseInt(tagName.charAt(1));
                        if (currentLevel <= headerLevel) {
                            break;
                        }
                    }
                    
                    if (currentElement.id === 'postamble' || currentElement.classList.contains('main-footer')) {
                        break;
                    }
                    
                    elementsToWrap.push(currentElement);
                    currentElement = currentElement.nextElementSibling;
                }
                
                // Wrap elements
                elementsToWrap.forEach(element => {
                    contentWrapper.appendChild(element);
                });
                
                if (contentWrapper.hasChildNodes()) {
                    header.parentNode.insertBefore(contentWrapper, header.nextElementSibling);
                    
                    // Start collapsed
                    header.classList.add('collapsed');
                    contentWrapper.style.maxHeight = '0px';
                    
                    // Add click handler
                    header.addEventListener('click', (e) => {
                        if (e.target.tagName === 'A') return;
                        
                        header.classList.toggle('collapsed');
                        contentWrapper.classList.toggle('collapsed');
                        
                        const isCollapsed = header.classList.contains('collapsed');
                        
                        if (isCollapsed) {
                            contentWrapper.style.maxHeight = '0px';
                        } else {
                            contentWrapper.style.maxHeight = contentWrapper.scrollHeight + 'px';
                            
                            setTimeout(() => {
                                if (!header.classList.contains('collapsed')) {
                                    contentWrapper.style.maxHeight = 'none';
                                }
                            }, 400);
                        }
                    });
                    
                    // Update max-height when window resizes
                    window.addEventListener('resize', () => {
                        if (!header.classList.contains('collapsed')) {
                            contentWrapper.style.maxHeight = 'none';
                            setTimeout(() => {
                                if (!header.classList.contains('collapsed')) {
                                    contentWrapper.style.maxHeight = contentWrapper.scrollHeight + 'px';
                                    setTimeout(() => {
                                        contentWrapper.style.maxHeight = 'none';
                                    }, 50);
                                }
                            }, 50);
                        }
                    });
                }
            });
        });
    }
    
    // Make headers collapsible
    makeHeadersCollapsible(['h2', 'h3']);
    
    // --- Reading Progress & Breadcrumb Navigation ---
    const content = document.getElementById('content') || document.querySelector('.content');
    
    if (content) {
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        document.body.appendChild(progressBar);
        
        // Create breadcrumb
        const breadcrumb = document.createElement('div');
        breadcrumb.className = 'breadcrumb';
        document.body.appendChild(breadcrumb);
        
        // Calculate reading time
        const readingTime = calculateReadingTime(content);
        
        // Get all headings
        const headings = document.querySelectorAll('h1, h2, h3');
        
        // Add IDs to headings if they don't have them
        headings.forEach((heading, index) => {
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }
        });
        
        function updateProgress() {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = Math.min(scrollPercent, 100) + '%';
        }
        
        function updateBreadcrumb() {
            const scrollPosition = window.pageYOffset + 150;
            let currentHeadings = [];
            let showBreadcrumb = false;
            
            if (headings.length > 0 && window.pageYOffset > headings[0].offsetTop - 100) {
                showBreadcrumb = true;
                document.body.classList.add('has-breadcrumb');
            } else {
                document.body.classList.remove('has-breadcrumb');
            }
            
            headings.forEach(heading => {
                if (heading.offsetTop <= scrollPosition) {
                    const level = parseInt(heading.tagName.charAt(1));
                    currentHeadings = currentHeadings.filter(h => h.level < level);
                    currentHeadings.push({
                        level: level,
                        text: heading.textContent.replace(/^[\d.]+\s*/, '').trim(),
                        id: heading.id
                    });
                }
            });
            
            // Update breadcrumb content with separators
            let breadcrumbHTML = '';
            
            if (currentHeadings.length > 0) {
                breadcrumbHTML = currentHeadings.map((heading, index) => {
                    const link = `<a href="#${heading.id}" title="${heading.text}">${heading.text}</a>`;
                    if (index === 0) {
                        return link;
                    } else {
                        return `<span class="breadcrumb-separator"></span>${link}`;
                    }
                }).join('');
            }
            
            // Add reading time if available
            const readingTimeHTML = readingTime > 1 ? `<span class="reading-time">${readingTime} min read</span>` : '';
            
            breadcrumb.innerHTML = breadcrumbHTML + readingTimeHTML;
            
            // Show/hide breadcrumb
            if (showBreadcrumb && currentHeadings.length > 0) {
                breadcrumb.classList.add('visible');
            } else {
                breadcrumb.classList.remove('visible');
            }
        }
        
        // Smooth scroll for breadcrumb links
        breadcrumb.addEventListener('click', function(e) {
            if (e.target.tagName === 'A' && e.target.hash) {
                e.preventDefault();
                const targetId = e.target.hash.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Expand the section if it's collapsed
                    const header = targetElement.tagName.startsWith('H') ? targetElement : 
                                  targetElement.closest('.section-content-wrapper')?.previousElementSibling;
                    
                    if (header && header.classList.contains('collapsed')) {
                        header.click(); // Expand the section
                        setTimeout(() => {
                            const yOffset = -80;
                            const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                            window.scrollTo({ top: y, behavior: 'smooth' });
                        }, 200);
                    } else {
                        const yOffset = -80;
                        const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                }
            }
        });
        
        // Throttled scroll handler
        let scrollTimeout;
        function handleScroll() {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                updateProgress();
                updateBreadcrumb();
            }, 10);
        }
        
        window.addEventListener('scroll', handleScroll);
        
        // Initial update
        updateProgress();
        updateBreadcrumb();
    }
});
