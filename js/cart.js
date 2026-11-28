/* ==========================================================================
   Multiverse Vault — My Cart Page Script (Page 6)
   Handles default cart seeding, quantity updates, item removal,
   live Order Summary calculation, Checkout modal, and Recommendations.
   ========================================================================== */

(function () {
  const CART_KEY = 'mv_cart';
  const SHIPPING_FEE = 4.99;
  const FREE_SHIPPING_THRESHOLD = 50.00;

  // Pre-populated default cart items (distinct covers not used on Page 4 or Page 5)
  const DEFAULT_CART_ITEMS = [
    {
      id: 'eclipse-ronin-03',
      title: 'Eclipse Ronin: Bloodmoon Blades, Vol. 3',
      author: 'Kenjiro Sato',
      category: 'Manga',
      format: 'Collector Paperback',
      price: 16.99,
      image: '../images/cover-eclipse-ronin-v3.svg',
      quantity: 1
    },
    {
      id: 'clockwork-citadel-01',
      title: 'Clockwork Citadel: Brass & Aether, #1',
      author: 'Clara Moreau',
      category: 'Comics',
      format: 'Deluxe Hardcover',
      price: 24.50,
      image: '../images/cover-clockwork-citadel-01.svg',
      quantity: 1
    },
    {
      id: 'nebula-alchemist-04',
      title: 'The Nebula Alchemist, Vol. 4',
      author: 'Rin Takahashi',
      category: 'Webtoons & Novels',
      format: 'Illustrated Edition',
      price: 18.99,
      image: '../images/cover-nebula-alchemist-v4.svg',
      quantity: 1
    }
  ];

  // 4 "You May Also Like" recommendations (each with its own unique SVG cover)
  const RECOMMENDED_BOOKS = [
    {
      id: 'void-courier-02',
      title: 'Void Courier: Starlane Drift, Vol. 2',
      author: 'Mateo Silva',
      category: 'Comics',
      format: 'Graphic Novel',
      price: 15.99,
      image: '../images/cover-void-courier-v2.svg'
    },
    {
      id: 'jade-kitsune-05',
      title: 'Shrine of the Jade Kitsune, Vol. 5',
      author: 'Yumi Watanabe',
      category: 'Manga',
      format: 'Tankobon Edition',
      price: 14.50,
      image: '../images/cover-jade-kitsune-v5.svg'
    },
    {
      id: 'crimson-atlas-01',
      title: 'The Crimson Atlas: Sunken Kingdoms',
      author: 'Julian Mercer',
      category: 'Illustrated Novel',
      format: 'Gilded Hardcover',
      price: 29.99,
      image: '../images/cover-crimson-atlas-01.svg'
    },
    {
      id: 'whispering-grimoire-08',
      title: 'Whispering Grimoire, Vol. 8',
      author: 'Hana Kim',
      category: 'Webtoon Print',
      format: 'Full-Color Softcover',
      price: 17.50,
      image: '../images/cover-whispering-grimoire-v8.svg'
    }
  ];

  let toastTimer = null;

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatMoney(amount) {
    return '$' + Number(amount || 0).toFixed(2);
  }

  function showToast(message) {
    const toast = document.getElementById('cart-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2800);
  }

  function readCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw === null) {
        const seeded = DEFAULT_CART_ITEMS.map(function (item) {
          return Object.assign({}, item);
        });
        localStorage.setItem(CART_KEY, JSON.stringify(seeded));
        return seeded;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return DEFAULT_CART_ITEMS.map(function (item) {
        return Object.assign({}, item);
      });
    }
  }

  function writeCart(items) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (error) {
      // Ignore storage quota errors in restricted mode
    }
    if (window.MultiverseVault && typeof window.MultiverseVault.updateCartBadge === 'function') {
      window.MultiverseVault.updateCartBadge();
    }
  }

  function renderCart() {
    const listEl = document.getElementById('cart-items-list');
    const emptyEl = document.getElementById('cart-empty-state');
    const heroCountEl = document.getElementById('cart-item-count-label');
    const summaryCountEl = document.getElementById('summary-items-count');
    const subtotalEl = document.getElementById('summary-subtotal');
    const shippingEl = document.getElementById('summary-shipping');
    const shippingNoteEl = document.getElementById('summary-shipping-note');
    const totalEl = document.getElementById('summary-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!listEl || !emptyEl) return;

    const cart = readCart();
    const totalQty = cart.reduce(function (sum, item) {
      return sum + (Number(item.quantity) || 1);
    }, 0);

    const subtotal = cart.reduce(function (sum, item) {
      return sum + (Number(item.price) || 0) * (Number(item.quantity) || 1);
    }, 0);

    const shipping = cart.length === 0 ? 0 : (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE);
    const total = subtotal + shipping;

    if (heroCountEl) {
      heroCountEl.textContent = totalQty + (totalQty === 1 ? ' Item in Cart' : ' Items in Cart');
    }
    if (summaryCountEl) summaryCountEl.textContent = String(totalQty);
    if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : formatMoney(shipping);
    if (shippingNoteEl) {
      if (cart.length === 0) {
        shippingNoteEl.textContent = 'Add items to calculate shipping.';
      } else if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        shippingNoteEl.textContent = 'Unlocked: Free Vault shipping on orders over $50.00.';
      } else {
        shippingNoteEl.textContent = 'Add ' + formatMoney(FREE_SHIPPING_THRESHOLD - subtotal) + ' more for free Vault shipping.';
      }
    }
    if (totalEl) totalEl.textContent = formatMoney(total);
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;

    if (cart.length === 0) {
      listEl.innerHTML = '';
      emptyEl.hidden = false;
      return;
    }

    emptyEl.hidden = true;
    listEl.innerHTML = cart.map(function (item) {
      const qty = Number(item.quantity) || 1;
      const lineTotal = (Number(item.price) || 0) * qty;
      return (
        '<article class="cart-item-card" data-item-id="' + escapeHtml(item.id) + '">' +
          '<div class="cart-item-cover">' +
            '<img src="' + escapeHtml(item.image || '../images/cover-eclipse-ronin-v3.svg') + '" alt="' + escapeHtml(item.title) + ' cover artwork">' +
          '</div>' +
          '<div class="cart-item-info">' +
            '<span class="cart-item-meta">' + escapeHtml(item.category || 'Edition') + ' &bull; ' + escapeHtml(item.format || 'Print') + '</span>' +
            '<h3 class="cart-item-title">' + escapeHtml(item.title) + '</h3>' +
            '<p class="cart-item-author">By ' + escapeHtml(item.author || 'Multiverse Creator') + '</p>' +
            '<span class="cart-item-unit-price">' + formatMoney(item.price) + ' each</span>' +
          '</div>' +
          '<div class="cart-item-controls">' +
            '<span class="cart-item-line-total">' + formatMoney(lineTotal) + '</span>' +
            '<div class="cart-qty-group" aria-label="Quantity controls for ' + escapeHtml(item.title) + '">' +
              '<button type="button" class="cart-qty-btn" data-qty-action="decrease" data-id="' + escapeHtml(item.id) + '" aria-label="Decrease quantity">&minus;</button>' +
              '<span class="cart-qty-value">' + qty + '</span>' +
              '<button type="button" class="cart-qty-btn" data-qty-action="increase" data-id="' + escapeHtml(item.id) + '" aria-label="Increase quantity">+</button>' +
            '</div>' +
            '<button type="button" class="cart-remove-btn" data-remove-id="' + escapeHtml(item.id) + '">Remove</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderRecommendations() {
    const grid = document.getElementById('recommended-grid');
    if (!grid) return;

    grid.innerHTML = RECOMMENDED_BOOKS.map(function (book) {
      return (
        '<article class="mv-card cart-rec-card">' +
          '<div class="cart-rec-media">' +
            '<img src="' + escapeHtml(book.image) + '" alt="' + escapeHtml(book.title) + ' cover artwork">' +
          '</div>' +
          '<div class="mv-card-body">' +
            '<span class="cart-item-meta">' + escapeHtml(book.category) + '</span>' +
            '<h3 class="mv-card-title">' + escapeHtml(book.title) + '</h3>' +
            '<p class="cart-rec-author">By ' + escapeHtml(book.author) + '</p>' +
            '<div class="cart-rec-footer">' +
              '<span class="cart-rec-price">' + formatMoney(book.price) + '</span>' +
              '<button type="button" class="btn btn-gold btn-sm" data-add-rec-id="' + escapeHtml(book.id) + '">Add to Cart</button>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function updateQuantity(bookId, delta) {
    const cart = readCart();
    const index = cart.findIndex(function (item) { return item.id === bookId; });
    if (index === -1) return;

    const nextQty = (Number(cart[index].quantity) || 1) + delta;
    if (nextQty <= 0) {
      const removedTitle = cart[index].title;
      cart.splice(index, 1);
      writeCart(cart);
      renderCart();
      showToast('Removed "' + removedTitle + '" from your Cart.');
      return;
    }

    cart[index].quantity = nextQty;
    writeCart(cart);
    renderCart();
  }

  function removeItem(bookId) {
    const cart = readCart();
    const index = cart.findIndex(function (item) { return item.id === bookId; });
    if (index === -1) return;

    const removedTitle = cart[index].title;
    cart.splice(index, 1);
    writeCart(cart);
    renderCart();
    showToast('Removed "' + removedTitle + '" from your Cart.');
  }

  function addRecommendedBook(bookId) {
    const book = RECOMMENDED_BOOKS.find(function (item) { return item.id === bookId; });
    if (!book) return;

    const cart = readCart();
    const existing = cart.find(function (item) { return item.id === book.id; });
    if (existing) {
      existing.quantity = (Number(existing.quantity) || 1) + 1;
    } else {
      cart.push({
        id: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        format: book.format,
        price: book.price,
        image: book.image,
        quantity: 1
      });
    }

    writeCart(cart);
    renderCart();
    showToast('Added "' + book.title + '" to your Cart.');
  }

  function openCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    const summaryEl = document.getElementById('checkout-modal-summary');
    const cart = readCart();
    if (!modal || cart.length === 0) return;

    const totalQty = cart.reduce(function (sum, item) { return sum + (Number(item.quantity) || 1); }, 0);
    const subtotal = cart.reduce(function (sum, item) { return sum + (Number(item.price) || 0) * (Number(item.quantity) || 1); }, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;

    if (summaryEl) {
      summaryEl.textContent =
        'Your Vault order of ' + totalQty + (totalQty === 1 ? ' edition' : ' editions') +
        ' totaling ' + formatMoney(total) + ' is ready for dispatch.';
    }
    modal.hidden = false;
  }

  function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.hidden = true;
  }

  function initCartEvents() {
    document.addEventListener('click', function (event) {
      const qtyBtn = event.target.closest('[data-qty-action]');
      if (qtyBtn) {
        const action = qtyBtn.getAttribute('data-qty-action');
        const id = qtyBtn.getAttribute('data-id');
        updateQuantity(id, action === 'increase' ? 1 : -1);
        return;
      }

      const removeBtn = event.target.closest('[data-remove-id]');
      if (removeBtn) {
        removeItem(removeBtn.getAttribute('data-remove-id'));
        return;
      }

      const addRecBtn = event.target.closest('[data-add-rec-id]');
      if (addRecBtn) {
        addRecommendedBook(addRecBtn.getAttribute('data-add-rec-id'));
        return;
      }

      if (event.target.closest('[data-close-modal]')) {
        closeCheckoutModal();
      }
    });

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', openCheckoutModal);
    }

    const confirmClearBtn = document.getElementById('confirm-clear-cart-btn');
    if (confirmClearBtn) {
      confirmClearBtn.addEventListener('click', function () {
        writeCart([]);
        renderCart();
        closeCheckoutModal();
        showToast('Order placed! Your cart has been cleared.');
      });
    }

    const restoreBtn = document.getElementById('restore-sample-cart-btn');
    if (restoreBtn) {
      restoreBtn.addEventListener('click', function () {
        const seeded = DEFAULT_CART_ITEMS.map(function (item) {
          return Object.assign({}, item);
        });
        writeCart(seeded);
        renderCart();
        showToast('Sample Vault cart restored.');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderCart();
    renderRecommendations();
    initCartEvents();
    if (window.MultiverseVault && typeof window.MultiverseVault.updateCartBadge === 'function') {
      window.MultiverseVault.updateCartBadge();
    }
  });
})();
