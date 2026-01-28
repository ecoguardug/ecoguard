// script-header.js
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  const icon = toggleBtn?.querySelector('i');

  if (!toggleBtn || !menu) return;

  toggleBtn.addEventListener('click', () => {
    const isActive = menu.classList.toggle('active');
    toggleBtn.setAttribute('aria-expanded', isActive);
    if (icon) {
      icon.className = isActive ? 'fas fa-times' : 'fas fa-bars';
    }
  });

  // Close mobile menu when clicking links
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        menu.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        if (icon) icon.className = 'fas fa-bars';
      }
    });
  });

  // Mobile dropdown toggle
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        const parent = toggle.parentElement;
        parent.classList.toggle('active');
      }
    });
  });

  // Scroll effect
  window.addEventListener('scroll', () => {
    document.querySelector('.header')?.classList.toggle('scrolled', window.scrollY > 50);
  });
});