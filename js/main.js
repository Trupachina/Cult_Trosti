(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initMobileNav() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-nav]');
    if (!toggle || !nav) return;

    const close = () => {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('is-open', !isOpen);
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) close();
    });

    document.addEventListener('click', (event) => {
      if (!nav.classList.contains('is-open')) return;
      if (event.target.closest('[data-nav], [data-nav-toggle]')) return;
      close();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 980) close();
    });
  }

  function initReveal() {
    const elements = [...document.querySelectorAll('.reveal')];
    if (!elements.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -4% 0px',
    });

    elements.forEach((element) => observer.observe(element));
  }

  function initTilt() {
    if (prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

    document.querySelectorAll('[data-tilt-card]').forEach((card) => {
      const strength = 1.5;

      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        card.style.transform = [
          'perspective(1000px)',
          `rotateX(${(-y * strength).toFixed(2)}deg)`,
          `rotateY(${(x * strength).toFixed(2)}deg)`,
        ].join(' ');
      });

      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  initMobileNav();
  initReveal();
  initTilt();
})();
