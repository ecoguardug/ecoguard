// script-header.js
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  const icon = toggleBtn?.querySelector('i');

  if (!toggleBtn || !menu) return;

  // Main mobile menu toggle
  toggleBtn.addEventListener('click', () => {
    const isActive = menu.classList.toggle('active');
    toggleBtn.setAttribute('aria-expanded', isActive);
    if (icon) {
      icon.className = isActive ? 'fas fa-times' : 'fas fa-bars';
    }

    // If closing main menu, also close all dropdowns
    if (!isActive) {
      document.querySelectorAll('.dropdown.active').forEach(el => el.classList.remove('active'));
    }
  });

  // Close mobile menu when clicking any link
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        menu.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        if (icon) icon.className = 'fas fa-bars';

        // Also close dropdowns
        document.querySelectorAll('.dropdown.active').forEach(el => el.classList.remove('active'));
      }
    });
  });

  // Mobile-only dropdown toggle
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault(); // prevent page jump if href is #
        const parent = toggle.closest('.dropdown');
        if (parent) {
          parent.classList.toggle('active');
        }
      }
      // On desktop → do nothing (hover handles it)
    });
  });

  // IMPORTANT: Ensure no .active classes on dropdowns when in desktop mode
  const enforceDesktopState = () => {
    if (window.innerWidth > 900) {
      document.querySelectorAll('.dropdown.active').forEach(el => {
        el.classList.remove('active');
      });
      // Also close main menu if somehow open
      if (menu.classList.contains('active')) {
        menu.classList.remove('active');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        if (icon) icon.className = 'fas fa-bars';
      }
    }
  };

  // Run once on load
  enforceDesktopState();

  // Run on resize (with small debounce to avoid rapid firing)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(enforceDesktopState, 100);
  });

  // Scroll effect (unchanged)
  window.addEventListener('scroll', () => {
    document.querySelector('.header')?.classList.toggle('scrolled', window.scrollY > 50);
  });
});