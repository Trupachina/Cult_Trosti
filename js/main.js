(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  function initFixedHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;

    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const height = Math.ceil(header.getBoundingClientRect().height);
        document.documentElement.style.setProperty('--site-header-space', `${height}px`);
      });
    };

    sync();

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(sync);
      observer.observe(header);
    } else {
      window.addEventListener('resize', sync, { passive: true });
    }

    window.addEventListener('orientationchange', sync, { passive: true });
    document.fonts?.ready?.then(sync).catch(() => {});
  }

  function initMobileNav() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-nav]');
    if (!toggle || !nav) return;

    const close = () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Открыть меню');
      nav.classList.remove('is-open');
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
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

  function initSeamlessMarquees() {
    const marquees = [...document.querySelectorAll('[data-marquee]')];
    if (!marquees.length) return;

    marquees.forEach((marquee) => {
      const track = marquee.querySelector('[data-marquee-track]');
      const sourceGroup = marquee.querySelector('[data-marquee-group]');
      if (!track || !sourceGroup) return;

      const sourceItems = [...sourceGroup.children].map((item) => item.cloneNode(true));
      if (!sourceItems.length) return;

      const speed = Math.max(30, Number(marquee.dataset.marqueeSpeed) || 80);
      let resizeFrame = 0;

      const createGroup = () => {
        const group = document.createElement('div');
        group.className = sourceGroup.className;
        group.setAttribute('data-marquee-group', '');
        sourceItems.forEach((item) => group.appendChild(item.cloneNode(true)));
        return group;
      };

      const rebuild = () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
          track.classList.remove('is-marquee-ready');
          track.replaceChildren();

          const firstGroup = createGroup();
          track.appendChild(firstGroup);

          // One moving half must be wider than the viewport. Otherwise a short
          // phrase can expose empty space before the animation loops.
          const targetWidth = marquee.clientWidth + 160;
          let safety = 0;
          while (firstGroup.getBoundingClientRect().width < targetWidth && safety < 40) {
            sourceItems.forEach((item) => firstGroup.appendChild(item.cloneNode(true)));
            safety += 1;
          }

          const secondGroup = firstGroup.cloneNode(true);
          secondGroup.setAttribute('aria-hidden', 'true');
          track.appendChild(secondGroup);

          const distance = firstGroup.getBoundingClientRect().width;
          const duration = Math.max(12, distance / speed);

          track.style.setProperty('--marquee-offset', `${-distance}px`);
          track.style.setProperty('--marquee-duration', `${duration}s`);

          // Start only after the two halves are measured and identical.
          requestAnimationFrame(() => track.classList.add('is-marquee-ready'));
        });
      };

      rebuild();

      if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(rebuild);
        resizeObserver.observe(marquee);
      } else {
        window.addEventListener('resize', rebuild, { passive: true });
      }

      if (document.fonts?.ready) {
        document.fonts.ready.then(rebuild).catch(() => {});
      }
    });
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

  initFixedHeader();
  initMobileNav();
  initReveal();
  initSeamlessMarquees();
  initTilt();
})();
