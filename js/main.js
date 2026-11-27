/* ==========================================================================
   Multiverse Vault — Shared Navigation & UI Helper
   Keep this file simple and focused on shared site-wide behavior.
   Product data belongs in js/products.js; cart logic belongs in js/cart.js.
   ========================================================================== */

(function () {
  /**
   * Toggle the mobile navigation menu on small screens.
   */
  function initMobileNav() {
    const toggleBtn = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('is-open');
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  /**
   * Highlight the current page link in the shared navbar.
   */
  function highlightActiveLink() {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-link, .nav-action-link');

    links.forEach(function (link) {
      const href = link.getAttribute('href') || '';
      const linkFile = href.split('/').pop();

      if (linkFile === currentFile) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /**
   * Update the navbar cart count badge from localStorage (key: "mv_cart").
   */
  function updateCartBadge() {
    const badge = document.getElementById('nav-cart-count');
    if (!badge) return;

    let totalItems = 0;
    try {
      const savedCart = JSON.parse(localStorage.getItem('mv_cart') || '[]');
      if (Array.isArray(savedCart)) {
        totalItems = savedCart.reduce(function (sum, item) {
          return sum + (Number(item.quantity) || 1);
        }, 0);
      }
    } catch (error) {
      totalItems = 0;
    }

    badge.textContent = String(totalItems);
  }

  /**
   * Set the current year in the footer copyright notice.
   */
  function setFooterYear() {
    const yearEl = document.getElementById('footer-year');
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    highlightActiveLink();
    updateCartBadge();
    setFooterYear();
  });

  // Expose helper so cart.js can refresh the navbar badge after cart updates
  window.MultiverseVault = {
    updateCartBadge: updateCartBadge
  };
})();
