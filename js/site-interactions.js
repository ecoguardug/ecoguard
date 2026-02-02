// js/site-interactions.js
(() => {
  const chartRegistry = {};
  const THEME_KEY = 'ecoguard-theme';

  const applyTheme = (theme) => {
    const root = document.documentElement;
    const isDark = theme === 'dark';
    root.classList.toggle('theme-dark', isDark);
    root.dataset.theme = isDark ? 'dark' : 'light';

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const icon = button.querySelector('[data-theme-icon]');
      const label = button.querySelector('[data-theme-label]');
      if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
      if (label) label.textContent = isDark ? 'Light' : 'Dark';
    });
  };

  const initThemeToggle = () => {
    const saved = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(saved);

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      if (button.dataset.themeBound === 'true') return;
      button.dataset.themeBound = 'true';

      button.addEventListener('click', () => {
        const next = document.documentElement.classList.contains('theme-dark') ? 'light' : 'dark';
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
      });
    });
  };

  const initFooterYear = () => {
    document.querySelectorAll('#year').forEach((node) => {
      node.textContent = new Date().getFullYear();
    });
  };

  const initRevealAnimations = () => {
    const targets = document.querySelectorAll(
      'main section, main article, main form, main .rounded-xl, main .rounded-2xl'
    );

    targets.forEach((el) => {
      if (el.dataset.revealInit === 'true') return;
      el.dataset.revealInit = 'true';
      el.classList.add('ecg-reveal');
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('ecg-reveal--visible');
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('.ecg-reveal').forEach((el) => observer.observe(el));
  };

  const initCountUp = () => {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const animateCounter = (counter) => {
      if (counter.dataset.countAnimated === 'true') return;
      counter.dataset.countAnimated = 'true';

      const target = Number(counter.dataset.count || 0);
      const duration = 1200;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        counter.textContent = Math.floor(target * progress).toLocaleString();
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
  };

  const initBackToTop = () => {
    if (document.getElementById('back-to-top')) return;

    const button = document.createElement('button');
    button.id = 'back-to-top';
    button.type = 'button';
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.setAttribute('aria-label', 'Back to top');
    button.className =
      'fixed bottom-6 right-6 z-50 hidden h-11 w-11 items-center justify-center rounded-full bg-emerald-700 text-white shadow-lg transition hover:bg-emerald-800';

    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.body.appendChild(button);

    const toggleButton = () => {
      button.classList.toggle('hidden', window.scrollY < 420);
      button.classList.toggle('flex', window.scrollY >= 420);
    };

    toggleButton();
    window.addEventListener('scroll', toggleButton, { passive: true });
  };

  const initSmoothAnchors = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      if (anchor.dataset.smoothBound === 'true') return;
      anchor.dataset.smoothBound = 'true';
      anchor.addEventListener('click', (event) => {
        const id = anchor.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  const initActiveLinks = () => {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('header nav a[href]').forEach((link) => {
      const href = (link.getAttribute('href') || '').split('#')[0];
      if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      const normalized = href === '/' ? 'index.html' : href;
      if (normalized !== currentPath) return;

      link.classList.add('text-emerald-700');
      if (!link.classList.contains('font-semibold')) link.classList.add('font-semibold');
    });
  };

  const initPresetAmountButtons = () => {
    document.querySelectorAll('.preset-amount').forEach((button) => {
      if (button.dataset.presetBound === 'true') return;
      button.dataset.presetBound = 'true';

      button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        const value = button.getAttribute('data-value');
        const input = document.getElementById(targetId);
        if (!input) return;
        input.value = value || '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
  };

  const initProgramsFilter = () => {
    const root = document.getElementById('program-filter');
    if (!root || root.dataset.filterBound === 'true') return;
    root.dataset.filterBound = 'true';

    const searchInput = root.querySelector('[data-program-search]');
    const chips = root.querySelectorAll('[data-filter-chip]');
    const cards = document.querySelectorAll('[data-program-card]');
    const emptyState = document.getElementById('program-empty');
    let activeCategory = 'all';

    const applyFilter = () => {
      const query = (searchInput?.value || '').trim().toLowerCase();
      let visibleCount = 0;

      cards.forEach((card) => {
        const category = card.dataset.category || '';
        const tags = (card.dataset.tags || '').toLowerCase();
        const text = card.textContent.toLowerCase();

        const categoryPass = activeCategory === 'all' || category === activeCategory;
        const queryPass = !query || tags.includes(query) || text.includes(query);
        const visible = categoryPass && queryPass;

        card.classList.toggle('hidden', !visible);
        if (visible) visibleCount += 1;
      });

      if (emptyState) emptyState.classList.toggle('hidden', visibleCount > 0);
    };

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        activeCategory = chip.dataset.filterChip || 'all';
        chips.forEach((item) => {
          item.classList.remove('bg-emerald-700', 'text-white', 'border-emerald-700');
          item.classList.add('bg-white', 'text-gray-700', 'border-gray-200');
        });
        chip.classList.remove('bg-white', 'text-gray-700', 'border-gray-200');
        chip.classList.add('bg-emerald-700', 'text-white', 'border-emerald-700');
        applyFilter();
      });
    });

    if (searchInput) searchInput.addEventListener('input', applyFilter);
    applyFilter();
  };

  const initUgandaEnvCharts = () => {
    if (typeof window.Chart === 'undefined') return;
    const chartDefs = [
      {
        id: 'chart-forest',
        label: 'Forest area',
        value: 11.0,
        color: '#15803d',
        remainderLabel: 'Non-forest land',
      },
      {
        id: 'chart-electricity',
        label: 'Population with electricity access',
        value: 51.5,
        color: '#f59e0b',
        remainderLabel: 'Population without access',
      },
      {
        id: 'chart-water',
        label: 'Internal freshwater withdrawn',
        value: 2.0,
        color: '#0ea5e9',
        remainderLabel: 'Internal freshwater not withdrawn',
      },
    ];

    chartDefs.forEach((cfg) => {
      const canvas = document.getElementById(cfg.id);
      if (!canvas) return;

      if (chartRegistry[cfg.id]) {
        chartRegistry[cfg.id].destroy();
      }

      const remaining = Math.max(0, 100 - cfg.value);
      chartRegistry[cfg.id] = new window.Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: [`${cfg.label} (${cfg.value}%)`, `${cfg.remainderLabel} (${remaining}%)`],
          datasets: [
            {
              data: [cfg.value, remaining],
              backgroundColor: [cfg.color, '#e5e7eb'],
              borderWidth: 0,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: { boxWidth: 12, boxHeight: 12, usePointStyle: true, pointStyle: 'circle' },
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.label}: ${context.raw}%`,
              },
            },
          },
        },
      });
    });
  };

  const initDonatePayPalNotice = () => {
    document.querySelectorAll('form[action*="paypal.com"]').forEach((form) => {
      if (form.dataset.paypalBound === 'true') return;
      form.dataset.paypalBound = 'true';

      form.addEventListener('submit', () => {
        const msg = form.querySelector('.ecg-paypal-msg');
        if (msg) return;
        const note = document.createElement('p');
        note.className = 'ecg-paypal-msg mt-3 text-xs text-gray-500';
        note.textContent = 'Opening PayPal in a new tab...';
        form.appendChild(note);
      });
    });
  };

  const initProgressBars = () => {
    const bars = document.querySelectorAll('[data-progress]');
    if (!bars.length) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const bar = entry.target;
          if (bar.dataset.progressAnimated === 'true') {
            obs.unobserve(bar);
            return;
          }
          bar.dataset.progressAnimated = 'true';
          const value = Math.max(0, Math.min(100, Number(bar.dataset.progress || 0)));
          bar.style.width = `${value}%`;
          obs.unobserve(bar);
        });
      },
      { threshold: 0.35 }
    );

    bars.forEach((bar) => {
      if (bar.dataset.progressInit === 'true') return;
      bar.dataset.progressInit = 'true';
      bar.style.width = '0%';
      observer.observe(bar);
    });
  };

  const injectStyles = () => {
    if (document.getElementById('ecg-interactive-styles')) return;
    const style = document.createElement('style');
    style.id = 'ecg-interactive-styles';
    style.textContent = `
      .ecg-reveal {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity .55s ease, transform .55s ease;
      }
      .ecg-reveal.ecg-reveal--visible {
        opacity: 1;
        transform: translateY(0);
      }
      .theme-dark body {
        background: #020617 !important;
        color: #d1d5db !important;
      }
      .theme-dark .bg-white {
        background-color: #0f172a !important;
      }
      .theme-dark .bg-slate-50,
      .theme-dark .bg-emerald-50,
      .theme-dark .bg-emerald-50\/60,
      .theme-dark .bg-emerald-100,
      .theme-dark .bg-green-50 {
        background-color: #0b1220 !important;
      }
      .theme-dark .text-gray-900,
      .theme-dark .text-gray-800,
      .theme-dark .text-gray-700,
      .theme-dark .text-gray-600,
      .theme-dark .text-gray-500 {
        color: #d1d5db !important;
      }
      .theme-dark .text-emerald-900,
      .theme-dark .text-emerald-950,
      .theme-dark .text-green-900,
      .theme-dark .text-green-800,
      .theme-dark .text-rose-800 {
        color: #a7f3d0 !important;
      }
      .theme-dark .border-gray-200,
      .theme-dark .border-emerald-100,
      .theme-dark .border-green-100,
      .theme-dark .border-rose-100,
      .theme-dark .border-amber-200 {
        border-color: #1f2937 !important;
      }
      .theme-dark input,
      .theme-dark textarea,
      .theme-dark select {
        background-color: #111827 !important;
        color: #e5e7eb !important;
        border-color: #374151 !important;
      }
      .theme-dark .shadow-sm,
      .theme-dark .shadow-lg,
      .theme-dark .shadow-xl,
      .theme-dark .shadow-2xl {
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45) !important;
      }
      .ecg-progress {
        transition: width 1.2s cubic-bezier(.17,.67,.2,1.01);
      }
      .ecg-float {
        animation: ecgFloat 6s ease-in-out infinite;
      }
      @keyframes ecgFloat {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
        100% { transform: translateY(0px); }
      }
      @media (prefers-reduced-motion: reduce) {
        .ecg-reveal {
          opacity: 1;
          transform: none;
          transition: none;
        }
        .ecg-progress { transition: none; }
        .ecg-float { animation: none; }
      }
    `;
    document.head.appendChild(style);
  };

  const initAll = () => {
    initFooterYear();
    injectStyles();
    initThemeToggle();
    initRevealAnimations();
    initCountUp();
    initBackToTop();
    initSmoothAnchors();
    initActiveLinks();
    initPresetAmountButtons();
    initDonatePayPalNotice();
    initProgramsFilter();
    initUgandaEnvCharts();
    initProgressBars();
  };

  document.addEventListener('DOMContentLoaded', initAll);
  document.addEventListener('components:loaded', initAll);
})();
