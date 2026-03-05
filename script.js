/* ═══════════════════════════════════════════════════════════
   Iraq 2003 Briefing — Interactive Logic
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── DOM REFERENCES ─────────────────────────────────── */
  const rail = document.getElementById('briefing-rail');
  const railToggle = document.getElementById('rail-toggle');
  const railLinks = document.querySelectorAll('.rail-link');
  const sections = document.querySelectorAll('.briefing-section');

  /* ─── 1. BRIEFING RAIL: Scroll-based active state ──── */
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          railLinks.forEach((link) => {
            const isMatch = link.getAttribute('data-section') === id;
            link.classList.toggle('active', isMatch);
          });

          markVisited(entry.target.dataset.sectionIndex);
        }
      });
    },
    {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    }
  );

  sections.forEach((s) => sectionObserver.observe(s));

  const visitedSet = new Set();

  function markVisited(index) {
    visitedSet.add(Number(index));
    railLinks.forEach((link) => {
      const sectionId = link.getAttribute('data-section');
      const section = document.getElementById(sectionId);
      if (!section) return;
      const idx = Number(section.dataset.sectionIndex);
      if (visitedSet.has(idx) && !link.classList.contains('active')) {
        link.classList.add('visited');
      } else {
        link.classList.remove('visited');
      }
    });
  }

  /* Smooth-scroll on rail click */
  railLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (rail.classList.contains('open')) {
          rail.classList.remove('open');
          railToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  /* ─── 2. MOBILE NAV TOGGLE ───────────────────────────── */
  if (railToggle) {
    railToggle.addEventListener('click', () => {
      const isOpen = rail.classList.toggle('open');
      railToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
      if (
        rail.classList.contains('open') &&
        !rail.contains(e.target) &&
        !railToggle.contains(e.target)
      ) {
        rail.classList.remove('open');
        railToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ─── 3. EVIDENCE PANELS (expand/collapse + tabs) ──── */
  document.querySelectorAll('.evidence-panel').forEach((panel) => {
    const trigger = panel.querySelector('.evidence-trigger');
    const body = panel.querySelector('.evidence-body');
    const tabs = panel.querySelectorAll('[role="tab"]');
    const tabContents = panel.querySelectorAll('.evidence-tab-content');

    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      if (expanded) {
        body.hidden = true;
      } else {
        body.hidden = false;
      }
    });

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');

        tabs.forEach((t) => t.setAttribute('aria-selected', 'false'));
        tab.setAttribute('aria-selected', 'true');

        tabContents.forEach((tc) => {
          const isActive = tc.getAttribute('data-tab-content') === tabName;
          tc.classList.toggle('active', isActive);
          tc.hidden = !isActive;
        });
      });

      tab.addEventListener('keydown', (e) => {
        const tabsArr = Array.from(tabs);
        const idx = tabsArr.indexOf(tab);
        let nextIdx = idx;

        if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabsArr.length;
        else if (e.key === 'ArrowLeft')
          nextIdx = (idx - 1 + tabsArr.length) % tabsArr.length;
        else return;

        e.preventDefault();
        tabsArr[nextIdx].focus();
        tabsArr[nextIdx].click();
      });
    });
  });

  /* ─── 4. REDACTION REVEAL ────────────────────────────── */
  document.querySelectorAll('.redacted').forEach((el) => {
    function reveal() {
      if (!el.classList.contains('revealed')) {
        el.classList.add('revealed');
        el.textContent = el.getAttribute('data-reveal');
        el.removeAttribute('role');
        el.removeAttribute('tabindex');
        el.style.cursor = 'default';
      }
    }

    el.addEventListener('click', reveal);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        reveal();
      }
    });
  });

  /* ─── 5. INTERPRETATION LENS TOGGLE ──────────────────── */
  const lensToggle = document.getElementById('lens-toggle');
  const interpCivilizing = document.getElementById('interp-civilizing');
  const interpSecurity = document.getElementById('interp-security');
  const labelCivilizing = document.getElementById('lens-civilizing-label');
  const labelSecurity = document.getElementById('lens-security-label');

  if (lensToggle) {
    lensToggle.addEventListener('click', () => {
      const isChecked = lensToggle.getAttribute('aria-checked') === 'true';
      const newState = !isChecked;
      lensToggle.setAttribute('aria-checked', String(newState));

      if (newState) {
        interpCivilizing.classList.remove('active');
        interpCivilizing.hidden = true;
        interpSecurity.classList.add('active');
        interpSecurity.hidden = false;
        labelCivilizing.classList.remove('toggle-label--active');
        labelSecurity.classList.add('toggle-label--active');
      } else {
        interpSecurity.classList.remove('active');
        interpSecurity.hidden = true;
        interpCivilizing.classList.add('active');
        interpCivilizing.hidden = false;
        labelSecurity.classList.remove('toggle-label--active');
        labelCivilizing.classList.add('toggle-label--active');
      }
    });

    lensToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        lensToggle.click();
      }
    });
  }

  /* ─── 6. SECTION ENTRANCE (subtle clip-path reveal) ── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
    }
  );

  document
    .querySelectorAll(
      '.evidence-panel, .comparison-panel, .schematic-map, ' +
      '.parallels-panel, .redaction-block, .interpretation-toggle-panel, ' +
      '.hod-quotes, .counterarg-list, .evaluation-grid, .criteria-grid, ' +
      '.placeholder-image, .conclusion-final'
    )
    .forEach((el) => {
      el.classList.add('reveal-target');
      revealObserver.observe(el);
    });

  const revealStyle = document.createElement('style');
  revealStyle.textContent = `
    .reveal-target {
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.4s ease, transform 0.4s ease;
    }
    .reveal-target.revealed {
      opacity: 1;
      transform: translateY(0);
    }
    @media (prefers-reduced-motion: reduce) {
      .reveal-target {
        opacity: 1;
        transform: none;
      }
    }
  `;
  document.head.appendChild(revealStyle);

  /* ─── 7. KEYBOARD: Escape closes mobile nav ──────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && rail.classList.contains('open')) {
      rail.classList.remove('open');
      railToggle.setAttribute('aria-expanded', 'false');
      railToggle.focus();
    }
  });
})();
