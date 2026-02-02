// js/load-components.js
document.addEventListener('DOMContentLoaded', () => {
  const inject = async (url, placeholderId) => {
    try {
      const response = await fetch(`${url}?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to load ${url}`);
      const html = await response.text();
      const placeholder = document.getElementById(placeholderId);
      if (!placeholder) return;

      placeholder.innerHTML = html;

      // Re-initialize Alpine for dynamically injected component trees.
      if (window.Alpine && typeof window.Alpine.initTree === 'function') {
        window.Alpine.initTree(placeholder);
      }
    } catch (error) {
      console.error(error);
    }
  };

  Promise.allSettled([
    inject('components/header.html', 'header-placeholder'),
    inject('components/footer.html', 'footer-placeholder'),
  ]).then(() => {
    document.dispatchEvent(new CustomEvent('components:loaded'));
  });
});
