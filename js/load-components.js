// js/load-components.js
document.addEventListener('DOMContentLoaded', () => {
  // Load Header
  fetch('components/header.html')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load header');
      return response.text();
    })
    .then(html => {
      const headerPlaceholder = document.getElementById('header-placeholder');
      if (headerPlaceholder) headerPlaceholder.innerHTML = html;
    })
    .catch(error => console.error(error));

  // Load Footer
  fetch('components/footer.html')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load footer');
      return response.text();
    })
    .then(html => {
      const footerPlaceholder = document.getElementById('footer-placeholder');
      if (footerPlaceholder) footerPlaceholder.innerHTML = html;
    })
    .catch(error => console.error(error));
});