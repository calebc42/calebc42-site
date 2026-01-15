// handwriting.js
export class HandwritingAnimator {
  constructor(wrapper, options = {}) {
    this.wrapper = wrapper;
    this.options = {
      triggerMode: 'scroll',      // 'scroll' | 'viewport'
      viewportThreshold: 0.5,
      scrollTriggerStart: 0.75,
      scrollTriggerEnd: 0.15,
      strokeStagger: 0.2,         // for auto-play
      allowToggle: true,
      ...options
    };
    
    this.paths = [];
    this.totalLength = 0;
    this.isCompleted = false;
    
    this.init();
  }

  init() {
    const pathElements = this.wrapper.querySelectorAll(
      `${this.options.pathSelector || '.ink-strokes path, .signature-strokes path'}`
    );
    
    this.paths = Array.from(pathElements).map(path => {
      const length = path.getTotalLength();
      const startAt = this.totalLength;
      this.totalLength += length;
      
      path.style.strokeDasharray = `${length} ${length}`;
      path.style.strokeDashoffset = length;
      
      return { path, length, startAt };
    });

    if (this.options.triggerMode === 'viewport') {
      this.setupViewportTrigger();
    } else {
      this.setupScrollTrigger();
    }

    if (this.options.allowToggle) {
      this.setupToggle();
    }
  }

  setupScrollTrigger() {
    const handleScroll = () => {
      if (this.isCompleted) return;
      
      const rect = this.wrapper.getBoundingClientRect();
      const vh = window.innerHeight;
      const isScrollable = document.documentElement.scrollHeight > vh;
      
      let progress;
      if (!isScrollable || rect.bottom < vh * 0.5) {
        progress = 1;
      } else {
        const startPoint = vh * this.options.scrollTriggerStart;
        const endPoint = vh * this.options.scrollTriggerEnd;
        progress = (startPoint - rect.top) / (startPoint - endPoint);
      }
      
      this.setProgress(Math.min(Math.max(progress, 0), 1));
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
    
    this.paths.forEach(({ path, length, startAt }) => {
      if (currentLength < startAt) {
        path.style.strokeDashoffset = length;
      } else if (currentLength > startAt + length) {
        path.style.strokeDashoffset = 0;
      } else {
        path.style.strokeDashoffset = length - (currentLength - startAt);
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
        // Reset and re-trigger scroll handler
        this.paths.forEach(({ path, length }) => {
          path.style.strokeDashoffset = length;
        });
        window.dispatchEvent(new Event('scroll'));
      }
    });
  }
}
