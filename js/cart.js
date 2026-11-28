/* ==========================================================================
   Multiverse Vault — Shopping Cart & Checkout Logic
   Handles cart persistence (localStorage: "mv_cart"), quantity updates,
   discount codes, delivery & payment selection, and checkout validation.
   Works alongside js/main.js (window.MultiverseVault.updateCartBadge).
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEYS = {
    CART: 'mv_cart',
    DISCOUNT: 'mv_discount_code',
    DELIVERY: 'mv_delivery_method',
    LAST_ORDER: 'mv_last_order',
    ORDERS: 'mv_orders'
  };

  var SHIPPING_RATES = {
    standard: 4.99,
    express: 12.99
  };

  var FREE_SHIPPING_THRESHOLD = 50.0;

  var PROMO_CODES = {
    VAULT10: {
      code: 'VAULT10',
      type: 'percent',
      value: 0.10,
      label: '10% off your Vault order'
    },
    ARCHIVE20: {
      code: 'ARCHIVE20',
      type: 'percent',
      value: 0.20,
      label: '20% off collector discount'
    },
    FREESHIP: {
      code: 'FREESHIP',
      type: 'shipping',
      value: 0,
      label: 'Free standard shipping'
    }
  };

  /**
   * Build a clean inline SVG book cover data URI so demo items never have
   * broken images even before external cover files are added.
   */
  function createCoverDataUri(title, subtitle, accentHex) {
    var safeTitle = String(title || 'Multiverse Vault')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    var safeSub = String(subtitle || 'Collector Edition')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    var accent = accentHex || '#d4af37';

    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 250">' +
      '<defs>' +
      '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#25183c"/>' +
      '<stop offset="100%" stop-color="#120b1e"/>' +
      '</linearGradient>' +
      '</defs>' +
      '<rect width="180" height="250" rx="10" fill="url(#bg)"/>' +
      '<rect x="10" y="10" width="160" height="230" rx="6" fill="none" stroke="' + accent + '" stroke-opacity="0.6" stroke-width="1.5"/>' +
      '<circle cx="90" cy="84" r="34" fill="none" stroke="' + accent + '" stroke-opacity="0.7" stroke-width="1.5"/>' +
      '<polygon points="90,56 97,77 119,77 101,90 108,111 90,98 72,111 79,90 61,77 83,77" fill="' + accent + '" fill-opacity="0.25" stroke="' + accent + '" stroke-width="1.2"/>' +
      '<text x="90" y="156" text-anchor="middle" fill="#f5efe0" font-family="Georgia, serif" font-size="13" font-weight="700">' + safeTitle.slice(0, 20) + '</text>' +
      '<text x="90" y="178" text-anchor="middle" fill="#ebd074" font-family="Arial, sans-serif" font-size="10">' + safeSub.slice(0, 24) + '</text>' +
      '<text x="90" y="220" text-anchor="middle" fill="#c4b7d4" font-family="Arial, sans-serif" font-size="9" letter-spacing="2">MULTIVERSE VAULT</text>' +
      '</svg>';

    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  var SAMPLE_CART_ITEMS = [
    {
      id: 'aetheria-vol4',
      title: 'Chronicles of Aetheria, Vol. 4',
      author: 'Sora Takahashi',
      category: 'Manga',
      format: 'Paperback + Digital',
      price: 14.99,
      quantity: 1,
      fallbackImage: createCoverDataUri('Aetheria Vol. 4', 'Manga · Celestial Arc', '#d4af37')
    },
    {
      id: 'astral-sovereign-1',
      title: 'Astral Sovereign: Crown of the Ninth Veil',
      author: 'Elena Vance & Kaelen Cho',
      category: 'Comics',
      format: 'Deluxe Hardcover',
      price: 28.99,
      quantity: 1,
      fallbackImage: createCoverDataUri('Astral Sovereign', 'Deluxe Hardcover', '#ebd074')
    },
    {
      id: 'starlight-archivist',
      title: 'Starlight Archivist: Astral Tome',
      author: 'Elena Vance',
      category: 'Illustrated Novel',
      format: 'Foil Collector Edition',
      price: 22.50,
      quantity: 1,
      fallbackImage: createCoverDataUri('Starlight Archivist', 'Collector Tome', '#c4b7d4')
    }
  ];

  function escapeHtml(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatPrice(amount) {
    var num = Number(amount);
    if (!isFinite(num) || num < 0) num = 0;
    return '$' + num.toFixed(2);
  }

  /**
   * Normalize a cart item so items added from any team page
   * (using `quantity` or `qty`, `image` or `cover`) work uniformly.
   */
  function normalizeItem(raw) {
    if (!raw || typeof raw !== 'object') return null;

    var qty = parseInt(raw.quantity != null ? raw.quantity : raw.qty, 10);
    if (!isFinite(qty) || qty < 1) qty = 1;

    var price = Number(raw.price);
    if (!isFinite(price) || price < 0) price = 0;

    var title = String(raw.title || 'Untitled Volume');
    var format = String(raw.format || raw.edition || raw.category || 'Standard Edition');
    var fallback = raw.fallbackImage || createCoverDataUri(title, format, '#d4af37');
    var imgSrc = raw.image || raw.cover || fallback;

    return {
      id: String(raw.id || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
      title: title,
      author: String(raw.author || 'Multiverse Vault Press'),
      category: String(raw.category || 'Book'),
      format: format,
      price: price,
      quantity: qty,
      image: imgSrc,
      fallbackImage: fallback
    };
  }

  function getCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEYS.CART);
      if (raw === null) {
        // First-time visit: seed sample vault items so Cart & Checkout are immediately testable
        var seeded = SAMPLE_CART_ITEMS.map(normalizeItem);
        saveCart(seeded);
        return seeded;
      }
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeItem).filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  function saveCart(items) {
    var normalized = (Array.isArray(items) ? items : []).map(normalizeItem).filter(Boolean);
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(normalized));
    } catch (error) {
      // Ignore storage quota errors
    }
    syncHeaderCartBadge();
  }

  function syncHeaderCartBadge() {
    if (window.MultiverseVault && typeof window.MultiverseVault.updateCartBadge === 'function') {
      window.MultiverseVault.updateCartBadge();
    }
  }

  function getSavedDiscountCode() {
    try {
      var code = (localStorage.getItem(STORAGE_KEYS.DISCOUNT) || '').trim().toUpperCase();
      return PROMO_CODES[code] ? code : '';
    } catch (error) {
      return '';
    }
  }

  function saveDiscountCode(code) {
    try {
      if (code && PROMO_CODES[code]) {
        localStorage.setItem(STORAGE_KEYS.DISCOUNT, code);
      } else {
        localStorage.removeItem(STORAGE_KEYS.DISCOUNT);
      }
    } catch (error) {
      // Ignore storage errors
    }
  }

  function getDeliveryMethod() {
    try {
      var method = localStorage.getItem(STORAGE_KEYS.DELIVERY);
      return method === 'express' ? 'express' : 'standard';
    } catch (error) {
      return 'standard';
    }
  }

  function saveDeliveryMethod(method) {
    try {
      localStorage.setItem(STORAGE_KEYS.DELIVERY, method === 'express' ? 'express' : 'standard');
    } catch (error) {
      // Ignore storage errors
    }
  }

  function calculateTotals(items, promoCode, deliveryMethod) {
    var subtotal = items.reduce(function (sum, item) {
      return sum + item.price * item.quantity;
    }, 0);

    var promo = promoCode && PROMO_CODES[promoCode] ? PROMO_CODES[promoCode] : null;
    var discountAmount = 0;

    if (promo && promo.type === 'percent') {
      discountAmount = subtotal * promo.value;
    }

    var afterDiscount = Math.max(0, subtotal - discountAmount);
    var method = deliveryMethod === 'express' ? 'express' : 'standard';

    var shippingCost = 0;
    if (items.length > 0) {
      if (method === 'express') {
        shippingCost = SHIPPING_RATES.express;
      } else if ((promo && promo.type === 'shipping') || afterDiscount >= FREE_SHIPPING_THRESHOLD) {
        shippingCost = 0;
      } else {
        shippingCost = SHIPPING_RATES.standard;
      }
    }

    var total = afterDiscount + shippingCost;
    var totalCount = items.reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);

    return {
      itemCount: totalCount,
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      shippingCost: Number(shippingCost.toFixed(2)),
      total: Number(total.toFixed(2)),
      promo: promo,
      deliveryMethod: method
    };
  }

  function applyPromoCodeInput(rawCode) {
    var normalized = String(rawCode || '').trim().toUpperCase();
    if (!normalized) {
      return { ok: false, message: 'Enter a promo code such as VAULT10, ARCHIVE20, or FREESHIP.' };
    }
    var promo = PROMO_CODES[normalized];
    if (!promo) {
      return { ok: false, message: 'Code "' + normalized + '" is not valid. Try VAULT10, ARCHIVE20, or FREESHIP.' };
    }
    saveDiscountCode(promo.code);
    return { ok: true, code: promo.code, message: 'Applied ' + promo.code + ' — ' + promo.label + '.' };
  }

  /* ========================================================================
     CART PAGE (pages/cart.html)
     ======================================================================== */
  function initCartPage() {
    var pageRoot = document.getElementById('cart-page');
    if (!pageRoot) return;

    var itemsListEl = document.getElementById('cart-items-list');
    var itemsWrapperEl = document.getElementById('cart-items-wrapper');
    var emptyStateEl = document.getElementById('cart-empty-state');
    var summaryCardEl = document.getElementById('cart-summary-card');
    var itemCountTextEl = document.getElementById('cart-item-count-text');

    var subtotalEl = document.getElementById('summary-subtotal');
    var discountRowEl = document.getElementById('summary-discount-row');
    var discountCodeLabelEl = document.getElementById('summary-discount-code');
    var discountAmountEl = document.getElementById('summary-discount');
    var shippingEl = document.getElementById('summary-shipping');
    var shippingNoteEl = document.getElementById('shipping-threshold-note');
    var totalEl = document.getElementById('summary-total');

    var promoForm = document.getElementById('discount-form');
    var promoInput = document.getElementById('discount-code-input');
    var promoFeedbackEl = document.getElementById('discount-feedback');
    var activePromoBannerEl = document.getElementById('active-promo-banner');
    var activePromoNameEl = document.getElementById('active-promo-name');
    var removePromoBtn = document.getElementById('remove-promo-btn');

    var clearCartBtn = document.getElementById('clear-cart-btn');
    var loadSampleBtn = document.getElementById('load-sample-cart-btn');
    var checkoutBtn = document.getElementById('proceed-checkout-btn');

    function setPromoFeedback(message, isError) {
      if (!promoFeedbackEl) return;
      if (!message) {
        promoFeedbackEl.hidden = true;
        promoFeedbackEl.textContent = '';
        promoFeedbackEl.className = 'mv-feedback';
        return;
      }
      promoFeedbackEl.hidden = false;
      promoFeedbackEl.textContent = message;
      promoFeedbackEl.className = 'mv-feedback ' + (isError ? 'is-error' : 'is-success');
    }

    function renderCart() {
      var items = getCart();
      var activeCode = getSavedDiscountCode();
      var totals = calculateTotals(items, activeCode, getDeliveryMethod());

      if (itemCountTextEl) {
        itemCountTextEl.textContent =
          totals.itemCount === 1 ? '1 item in your satchel' : totals.itemCount + ' items in your satchel';
      }

      var hasItems = items.length > 0;
      if (itemsWrapperEl) itemsWrapperEl.hidden = !hasItems;
      if (summaryCardEl) summaryCardEl.hidden = !hasItems;
      if (emptyStateEl) emptyStateEl.hidden = hasItems;

      if (!hasItems) {
        if (itemsListEl) itemsListEl.innerHTML = '';
        syncHeaderCartBadge();
        return;
      }

      if (itemsListEl) {
        itemsListEl.innerHTML = items
          .map(function (item) {
            var lineTotal = item.price * item.quantity;
            return (
              '<article class="mv-card cart-item-card" data-item-id="' + escapeHtml(item.id) + '">' +
                '<div class="cart-item-row">' +
                  '<div class="cart-item-cover">' +
                    '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + ' cover" data-fallback="' + escapeHtml(item.fallbackImage) + '">' +
                  '</div>' +
                  '<div class="cart-item-details">' +
                    '<div class="cart-item-top">' +
                      '<div>' +
                        '<span class="mv-badge mv-badge-gold">' + escapeHtml(item.category) + '</span>' +
                        '<h2 class="mv-card-title cart-item-title">' + escapeHtml(item.title) + '</h2>' +
                        '<p class="mv-card-meta">By ' + escapeHtml(item.author) + ' &middot; ' + escapeHtml(item.format) + '</p>' +
                      '</div>' +
                      '<div class="cart-item-pricing">' +
                        '<span class="cart-line-total">' + formatPrice(lineTotal) + '</span>' +
                        '<span class="cart-unit-price">' + formatPrice(item.price) + ' each</span>' +
                      '</div>' +
                    '</div>' +
                    '<div class="cart-item-controls">' +
                      '<div class="qty-control" role="group" aria-label="Quantity for ' + escapeHtml(item.title) + '">' +
                        '<button type="button" class="qty-btn" data-action="decrease" data-id="' + escapeHtml(item.id) + '" aria-label="Decrease quantity of ' + escapeHtml(item.title) + '">&minus;</button>' +
                        '<span class="qty-value" aria-live="polite">' + item.quantity + '</span>' +
                        '<button type="button" class="qty-btn" data-action="increase" data-id="' + escapeHtml(item.id) + '" aria-label="Increase quantity of ' + escapeHtml(item.title) + '">+</button>' +
                      '</div>' +
                      '<button type="button" class="btn btn-ghost btn-sm cart-remove-btn" data-action="remove" data-id="' + escapeHtml(item.id) + '">' +
                        'Remove' +
                      '</button>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</article>'
            );
          })
          .join('');

        // Attach safe fallback if an external cover path is missing
        itemsListEl.querySelectorAll('img[data-fallback]').forEach(function (img) {
          img.addEventListener('error', function () {
            var fb = img.getAttribute('data-fallback');
            if (fb && img.src !== fb) {
              img.src = fb;
            }
          });
        });
      }

      if (subtotalEl) subtotalEl.textContent = formatPrice(totals.subtotal);

      if (discountRowEl) {
        if (totals.discountAmount > 0 && totals.promo) {
          discountRowEl.hidden = false;
          if (discountCodeLabelEl) discountCodeLabelEl.textContent = totals.promo.code;
          if (discountAmountEl) discountAmountEl.textContent = '−' + formatPrice(totals.discountAmount);
        } else {
          discountRowEl.hidden = true;
        }
      }

      if (shippingEl) {
        shippingEl.textContent = totals.shippingCost === 0 ? 'Free' : formatPrice(totals.shippingCost);
      }

      if (shippingNoteEl) {
        var remaining = FREE_SHIPPING_THRESHOLD - Math.max(0, totals.subtotal - totals.discountAmount);
        if (totals.promo && totals.promo.type === 'shipping') {
          shippingNoteEl.textContent = 'Free standard shipping unlocked with code FREESHIP.';
        } else if (remaining <= 0) {
          shippingNoteEl.textContent = 'Your order qualifies for free Standard Vault Courier shipping.';
        } else {
          shippingNoteEl.textContent = 'Add ' + formatPrice(remaining) + ' more to unlock free standard shipping.';
        }
      }

      if (totalEl) totalEl.textContent = formatPrice(totals.total);

      if (activePromoBannerEl && activePromoNameEl) {
        if (totals.promo) {
          activePromoBannerEl.hidden = false;
          activePromoNameEl.textContent = totals.promo.code + ' (' + totals.promo.label + ')';
        } else {
          activePromoBannerEl.hidden = true;
        }
      }

      if (checkoutBtn) {
        checkoutBtn.classList.toggle('is-disabled', !hasItems);
      }

      syncHeaderCartBadge();
    }

    if (itemsListEl) {
      itemsListEl.addEventListener('click', function (event) {
        var btn = event.target.closest('button[data-action][data-id]');
        if (!btn) return;

        var action = btn.getAttribute('data-action');
        var id = btn.getAttribute('data-id');
        var items = getCart();
        var index = items.findIndex(function (entry) { return entry.id === id; });
        if (index === -1) return;

        if (action === 'increase') {
          items[index].quantity = Math.min(99, items[index].quantity + 1);
        } else if (action === 'decrease') {
          if (items[index].quantity > 1) {
            items[index].quantity -= 1;
          } else {
            items.splice(index, 1);
          }
        } else if (action === 'remove') {
          items.splice(index, 1);
        }

        saveCart(items);
        renderCart();
      });
    }

    if (promoForm) {
      promoForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var result = applyPromoCodeInput(promoInput ? promoInput.value : '');
        setPromoFeedback(result.message, !result.ok);
        if (result.ok && promoInput) {
          promoInput.value = '';
        }
        renderCart();
      });
    }

    // Quick-fill promo chip buttons
    pageRoot.querySelectorAll('[data-promo-chip]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var code = chip.getAttribute('data-promo-chip');
        if (promoInput) promoInput.value = code;
        var result = applyPromoCodeInput(code);
        setPromoFeedback(result.message, !result.ok);
        renderCart();
      });
    });

    if (removePromoBtn) {
      removePromoBtn.addEventListener('click', function () {
        saveDiscountCode('');
        setPromoFeedback('Discount code removed.', false);
        renderCart();
      });
    }

    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', function () {
        saveCart([]);
        saveDiscountCode('');
        setPromoFeedback('', false);
        renderCart();
      });
    }

    if (loadSampleBtn) {
      loadSampleBtn.addEventListener('click', function () {
        saveCart(SAMPLE_CART_ITEMS);
        setPromoFeedback('', false);
        renderCart();
      });
    }

    renderCart();
  }

  /* ========================================================================
     CHECKOUT PAGE (pages/checkout.html)
     ======================================================================== */
  function initCheckoutPage() {
    var pageRoot = document.getElementById('checkout-page');
    if (!pageRoot) return;

    var emptyStateEl = document.getElementById('checkout-empty-state');
    var gridEl = document.getElementById('checkout-grid');
    var successPanelEl = document.getElementById('checkout-submitted-panel');
    var formEl = document.getElementById('checkout-form');

    var summaryItemsEl = document.getElementById('checkout-summary-items');
    var subtotalEl = document.getElementById('checkout-subtotal');
    var discountRowEl = document.getElementById('checkout-discount-row');
    var discountCodeEl = document.getElementById('checkout-discount-code');
    var discountAmountEl = document.getElementById('checkout-discount');
    var shippingEl = document.getElementById('checkout-shipping');
    var totalEl = document.getElementById('checkout-total');

    var promoInput = document.getElementById('checkout-promo-input');
    var promoApplyBtn = document.getElementById('checkout-promo-apply');
    var promoFeedbackEl = document.getElementById('checkout-promo-feedback');

    var cardFieldsPanel = document.getElementById('payment-card-fields');
    var walletFieldsPanel = document.getElementById('payment-wallet-fields');
    var codNotePanel = document.getElementById('payment-cod-note');
    var formAlertEl = document.getElementById('checkout-form-alert');

    var loadSampleBtn = document.getElementById('checkout-load-sample-btn');
    var cardNumberInput = document.getElementById('card-number');
    var cardExpiryInput = document.getElementById('card-expiry');

    function getSelectedPaymentMethod() {
      var checked = formEl ? formEl.querySelector('input[name="paymentMethod"]:checked') : null;
      return checked ? checked.value : 'card';
    }

    function getSelectedDeliveryMethod() {
      var checked = formEl ? formEl.querySelector('input[name="deliveryMethod"]:checked') : null;
      return checked ? checked.value : getDeliveryMethod();
    }

    function updatePaymentPanels() {
      var method = getSelectedPaymentMethod();
      if (cardFieldsPanel) cardFieldsPanel.hidden = method !== 'card';
      if (walletFieldsPanel) walletFieldsPanel.hidden = method !== 'wallet';
      if (codNotePanel) codNotePanel.hidden = method !== 'cod';

      // Sync active border class on choice cards
      if (formEl) {
        formEl.querySelectorAll('.choice-card').forEach(function (card) {
          var input = card.querySelector('input[type="radio"]');
          card.classList.toggle('is-selected', Boolean(input && input.checked));
        });
      }
    }

    function renderCheckoutSummary() {
      var items = getCart();
      var activeCode = getSavedDiscountCode();
      var deliveryMethod = getSelectedDeliveryMethod();
      var totals = calculateTotals(items, activeCode, deliveryMethod);

      var hasItems = items.length > 0;
      if (emptyStateEl) emptyStateEl.hidden = hasItems;
      if (gridEl) gridEl.hidden = !hasItems;

      if (!hasItems) {
        syncHeaderCartBadge();
        return;
      }

      if (summaryItemsEl) {
        summaryItemsEl.innerHTML = items
          .map(function (item) {
            return (
              '<li class="checkout-summary-item">' +
                '<div class="checkout-item-thumb">' +
                  '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + ' cover" data-fallback="' + escapeHtml(item.fallbackImage) + '">' +
                '</div>' +
                '<div class="checkout-item-info">' +
                  '<p class="checkout-item-title">' + escapeHtml(item.title) + '</p>' +
                  '<p class="mv-card-meta">Qty ' + item.quantity + ' &middot; ' + escapeHtml(item.format) + '</p>' +
                '</div>' +
                '<span class="checkout-item-price">' + formatPrice(item.price * item.quantity) + '</span>' +
              '</li>'
            );
          })
          .join('');

        summaryItemsEl.querySelectorAll('img[data-fallback]').forEach(function (img) {
          img.addEventListener('error', function () {
            var fb = img.getAttribute('data-fallback');
            if (fb && img.src !== fb) {
              img.src = fb;
            }
          });
        });
      }

      var standardCostLabel = document.getElementById('standard-shipping-price');
      if (standardCostLabel) {
        var afterDiscount = Math.max(0, totals.subtotal - totals.discountAmount);
        var stdFree = (totals.promo && totals.promo.type === 'shipping') || afterDiscount >= FREE_SHIPPING_THRESHOLD;
        standardCostLabel.textContent = stdFree ? 'Free' : formatPrice(SHIPPING_RATES.standard);
      }

      if (subtotalEl) subtotalEl.textContent = formatPrice(totals.subtotal);

      if (discountRowEl) {
        if (totals.discountAmount > 0 && totals.promo) {
          discountRowEl.hidden = false;
          if (discountCodeEl) discountCodeEl.textContent = totals.promo.code;
          if (discountAmountEl) discountAmountEl.textContent = '−' + formatPrice(totals.discountAmount);
        } else {
          discountRowEl.hidden = true;
        }
      }

      if (shippingEl) {
        shippingEl.textContent = totals.shippingCost === 0 ? 'Free' : formatPrice(totals.shippingCost);
      }
      if (totalEl) totalEl.textContent = formatPrice(totals.total);

      syncHeaderCartBadge();
    }

    function setFieldError(inputId, message) {
      var input = document.getElementById(inputId);
      var errorEl = document.getElementById(inputId + '-error');
      if (input) {
        if (message) {
          input.setAttribute('aria-invalid', 'true');
          input.classList.add('is-invalid');
        } else {
          input.removeAttribute('aria-invalid');
          input.classList.remove('is-invalid');
        }
      }
      if (errorEl) {
        errorEl.textContent = message || '';
        errorEl.hidden = !message;
      }
    }

    function clearAllErrors() {
      if (!formEl) return;
      formEl.querySelectorAll('.is-invalid').forEach(function (el) {
        el.classList.remove('is-invalid');
        el.removeAttribute('aria-invalid');
      });
      formEl.querySelectorAll('.field-error').forEach(function (el) {
        el.textContent = '';
        el.hidden = true;
      });
      if (formAlertEl) {
        formAlertEl.hidden = true;
        formAlertEl.textContent = '';
      }
    }

    function validateCheckoutForm() {
      clearAllErrors();
      var firstInvalid = null;
      var errors = 0;

      function requireField(id, label, validator) {
        var el = document.getElementById(id);
        var value = el ? el.value.trim() : '';
        var err = '';
        if (!value) {
          err = label + ' is required.';
        } else if (validator) {
          err = validator(value);
        }
        if (err) {
          setFieldError(id, err);
          if (!firstInvalid && el) firstInvalid = el;
          errors += 1;
        }
        return value;
      }

      var fullName = requireField('full-name', 'Full name');
      var email = requireField('email', 'Email address', function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address.';
      });
      var phone = requireField('phone', 'Phone number', function (v) {
        var digits = v.replace(/\D/g, '');
        return digits.length >= 7 ? '' : 'Enter a valid phone number (at least 7 digits).';
      });
      var street = requireField('street-address', 'Street address');
      var apartment = (document.getElementById('apartment') || {}).value || '';
      var city = requireField('city', 'City');
      var postalCode = requireField('postal-code', 'Postal code', function (v) {
        return v.length >= 3 ? '' : 'Enter a valid postal code.';
      });
      var country = requireField('country', 'Country');
      var notes = (document.getElementById('delivery-notes') || {}).value || '';

      var paymentMethod = getSelectedPaymentMethod();
      var paymentSummary = '';

      if (paymentMethod === 'card') {
        var cardName = requireField('card-name', 'Cardholder name');
        var cardNumber = requireField('card-number', 'Card number', function (v) {
          var digits = v.replace(/\D/g, '');
          return digits.length >= 13 && digits.length <= 19 ? '' : 'Enter a 13–19 digit card number.';
        });
        requireField('card-expiry', 'Expiry date', function (v) {
          return /^(0[1-9]|1[0-2])\/\d{2}$/.test(v) ? '' : 'Use MM/YY format (e.g. 09/28).';
        });
        requireField('card-cvv', 'Security code (CVV)', function (v) {
          return /^\d{3,4}$/.test(v) ? '' : 'Enter a 3 or 4 digit CVV.';
        });
        var last4 = cardNumber.replace(/\D/g, '').slice(-4);
        paymentSummary = 'Credit / Debit Card ending in •••• ' + last4 + ' (' + cardName + ')';
      } else if (paymentMethod === 'wallet') {
        var walletHandle = requireField('wallet-handle', 'Digital wallet ID or mobile number');
        paymentSummary = 'Vault Digital Pay (' + walletHandle + ')';
      } else {
        paymentSummary = 'Cash on Delivery';
      }

      if (errors > 0) {
        if (formAlertEl) {
          formAlertEl.hidden = false;
          formAlertEl.textContent = 'Please fix the ' + errors + ' highlighted field' + (errors > 1 ? 's' : '') + ' below before placing your order.';
        }
        if (firstInvalid) firstInvalid.focus();
        return null;
      }

      return {
        customer: {
          fullName: fullName,
          email: email,
          phone: phone
        },
        address: {
          street: street,
          apartment: apartment.trim(),
          city: city,
          postalCode: postalCode,
          country: country,
          notes: notes.trim()
        },
        deliveryMethod: getSelectedDeliveryMethod(),
        paymentMethod: paymentMethod,
        paymentSummary: paymentSummary
      };
    }

    // Format card number with spaces
    if (cardNumberInput) {
      cardNumberInput.addEventListener('input', function () {
        var digits = cardNumberInput.value.replace(/\D/g, '').slice(0, 16);
        cardNumberInput.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
      });
    }

    // Format expiry as MM/YY
    if (cardExpiryInput) {
      cardExpiryInput.addEventListener('input', function () {
        var digits = cardExpiryInput.value.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 3) {
          cardExpiryInput.value = digits.slice(0, 2) + '/' + digits.slice(2);
        } else {
          cardExpiryInput.value = digits;
        }
      });
    }

    if (formEl) {
      // Sync saved delivery method radio
      var savedDelivery = getDeliveryMethod();
      var savedDeliveryInput = formEl.querySelector('input[name="deliveryMethod"][value="' + savedDelivery + '"]');
      if (savedDeliveryInput) savedDeliveryInput.checked = true;

      formEl.addEventListener('change', function (event) {
        if (event.target.name === 'paymentMethod' || event.target.name === 'deliveryMethod') {
          if (event.target.name === 'deliveryMethod') {
            saveDeliveryMethod(event.target.value);
          }
          updatePaymentPanels();
          renderCheckoutSummary();
        }
      });

      formEl.addEventListener('submit', function (event) {
        event.preventDefault();
        var items = getCart();
        if (items.length === 0) {
          renderCheckoutSummary();
          return;
        }

        var validated = validateCheckoutForm();
        if (!validated) return;

        var activeCode = getSavedDiscountCode();
        var totals = calculateTotals(items, activeCode, validated.deliveryMethod);
        var orderNumber = 'MV-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);

        var orderRecord = {
          orderNumber: orderNumber,
          placedAt: new Date().toISOString(),
          customer: validated.customer,
          address: validated.address,
          deliveryMethod: validated.deliveryMethod === 'express' ? 'Express Arcane Post' : 'Standard Vault Courier',
          paymentMethod: validated.paymentMethod,
          paymentSummary: validated.paymentSummary,
          promoCode: totals.promo ? totals.promo.code : '',
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          shippingCost: totals.shippingCost,
          total: totals.total,
          items: items
        };

        try {
          localStorage.setItem(STORAGE_KEYS.LAST_ORDER, JSON.stringify(orderRecord));
          var existingOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
          if (!Array.isArray(existingOrders)) existingOrders = [];
          existingOrders.unshift(orderRecord);
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(existingOrders));
        } catch (error) {
          // Ignore storage errors
        }

        // Clear active cart & promo code after order submission
        saveCart([]);
        saveDiscountCode('');

        if (gridEl) gridEl.hidden = true;
        if (emptyStateEl) emptyStateEl.hidden = true;
        var checkoutPill = document.getElementById('step-checkout-pill');
        var confirmedPill = document.getElementById('step-confirmed-pill');
        if (checkoutPill) {
          checkoutPill.classList.remove('is-active');
          checkoutPill.classList.add('is-done');
          checkoutPill.removeAttribute('aria-current');
        }
        if (confirmedPill) {
          confirmedPill.classList.add('is-active');
          confirmedPill.setAttribute('aria-current', 'step');
        }
        if (successPanelEl) {
          successPanelEl.hidden = false;
          var numEl = document.getElementById('submitted-order-number');
          var emailEl = document.getElementById('submitted-order-email');
          var addressEl = document.getElementById('submitted-order-address');
          var paymentEl = document.getElementById('submitted-order-payment');
          var totalOutEl = document.getElementById('submitted-order-total');

          if (numEl) numEl.textContent = orderRecord.orderNumber;
          if (emailEl) emailEl.textContent = orderRecord.customer.email;
          if (addressEl) {
            addressEl.textContent =
              orderRecord.address.street + ', ' +
              orderRecord.address.city + ' ' +
              orderRecord.address.postalCode + ', ' +
              orderRecord.address.country;
          }
          if (paymentEl) paymentEl.textContent = orderRecord.paymentSummary;
          if (totalOutEl) totalOutEl.textContent = formatPrice(orderRecord.total);
          successPanelEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    if (promoApplyBtn && promoInput) {
      promoApplyBtn.addEventListener('click', function () {
        var result = applyPromoCodeInput(promoInput.value);
        if (promoFeedbackEl) {
          promoFeedbackEl.hidden = false;
          promoFeedbackEl.textContent = result.message;
          promoFeedbackEl.className = 'mv-feedback ' + (result.ok ? 'is-success' : 'is-error');
        }
        if (result.ok) {
          promoInput.value = '';
          renderCheckoutSummary();
        }
      });
    }

    if (loadSampleBtn) {
      loadSampleBtn.addEventListener('click', function () {
        saveCart(SAMPLE_CART_ITEMS);
        renderCheckoutSummary();
      });
    }

    updatePaymentPanels();
    renderCheckoutSummary();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCartPage();
    initCheckoutPage();
  });
})();
