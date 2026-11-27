/* ==========================================================================
   Multiverse Vault — New Releases Page Script (Page 4)
   Handles catalog filtering, search, sorting, cart/wishlist persistence,
   and release alert signup validation.
   ========================================================================== */

(function () {
  const CART_KEY = 'mv_cart';
  const WISHLIST_KEY = 'mv_wishlist';
  const ALERTS_KEY = 'mv_release_alerts';

  // Demo catalog data for New Releases (local demo dataset)
  const RELEASES = [
    {
      id: 'astral-sovereign-1',
      title: 'Astral Sovereign: Crown of the Ninth Veil, Vol. 1',
      author: 'Elena Vance & Kaelen Cho',
      category: 'comics',
      categoryLabel: 'Comics',
      window: 'this-week',
      windowLabel: 'This Week',
      badge: '1st Print',
      badgeType: 'firstprint',
      format: 'Deluxe Hardcover + Digital',
      releaseDate: '2026-11-24',
      displayDate: 'Nov 24, 2026',
      price: 28.99,
      image: '../images/category-comics.jpg',
      imageAlt: 'Fantasy comic book artwork featuring a cloaked hero silhouette and glowing gold energy arcs',
      description: 'An exiled star-knight returns to a fractured citadel to reclaim a stolen celestial mantle before the eclipse ends.',
      featured: true
    },
    {
      id: 'torii-eclipse-07',
      title: 'Lanterns Beneath the Crescent Torii, Vol. 7',
      author: 'Haruto Takahashi',
      category: 'manga',
      categoryLabel: 'Manga',
      window: 'this-week',
      windowLabel: 'This Week',
      badge: 'New',
      badgeType: 'new',
      format: 'Collector Tankobon',
      releaseDate: '2026-11-25',
      displayDate: 'Nov 25, 2026',
      price: 14.99,
      image: '../images/category-manga.jpg',
      imageAlt: 'Fantasy manga artwork with a misty torii gate, pagoda, and golden crescent moon',
      description: 'A wandering spirit-scribe climbs the mist-shrouded shrine steps where forgotten vows awaken under the moon.',
      featured: false
    },
    {
      id: 'celestial-herbarium-2',
      title: 'The Celestial Herbarium: Illuminated Omnibus',
      author: 'Soraia Lindqvist',
      category: 'webtoons',
      categoryLabel: 'Webtoons & Novels',
      window: 'this-week',
      windowLabel: 'This Week',
      badge: '1st Print',
      badgeType: 'firstprint',
      format: 'Gilded Illustrated Novel',
      releaseDate: '2026-11-26',
      displayDate: 'Nov 26, 2026',
      price: 34.50,
      image: '../images/category-webtoons.jpg',
      imageAlt: 'Fantasy illustrated storybook and glowing crystalline scroll surrounded by golden stardust',
      description: 'Botanical arcana meets full-color painted lore in a collector hardcover gathering Seasons 1 and 2.',
      featured: false
    },
    {
      id: 'archivist-grimoire-01',
      title: 'Chronicles of the Obsidian Vault, Issue #1',
      author: 'Marcus Sterling',
      category: 'comics',
      categoryLabel: 'Comics',
      window: 'this-month',
      windowLabel: 'This Month',
      badge: 'New',
      badgeType: 'new',
      format: 'Foil Variant Comic',
      releaseDate: '2026-11-18',
      displayDate: 'Nov 18, 2026',
      price: 9.99,
      image: '../images/hero-vault.jpg',
      imageAlt: 'Ornate midnight-purple and antique-gold arcane vault library lined with comics, manga, and illustrated tomes',
      description: 'When an apprentice archivist opens a sealed folio, five parallel worlds bleed into the midnight stacks.',
      featured: false
    },
    {
      id: 'ember-blade-12',
      title: 'Blade of the Ashen Pagoda, Vol. 12',
      author: 'Kenji Morimoto',
      category: 'manga',
      categoryLabel: 'Manga',
      window: 'this-month',
      windowLabel: 'This Month',
      badge: 'New',
      badgeType: 'new',
      format: 'Paperback + Bookmark',
      releaseDate: '2026-11-12',
      displayDate: 'Nov 12, 2026',
      price: 13.50,
      image: '../images/category-manga.jpg',
      imageAlt: 'Fantasy manga artwork with a misty torii gate, pagoda, and golden crescent moon',
      description: 'The mountain tournament reaches its final duel as old allies confront the curse of the crimson seal.',
      featured: false
    },
    {
      id: 'starlight-scroll-s3',
      title: 'Starlight Scroll of Aethelgard, Season 3 Print',
      author: 'Nadia Al-Mansoor',
      category: 'webtoons',
      categoryLabel: 'Webtoons & Novels',
      window: 'this-month',
      windowLabel: 'This Month',
      badge: '1st Print',
      badgeType: 'firstprint',
      format: 'Full-Color Softcover',
      releaseDate: '2026-11-08',
      displayDate: 'Nov 08, 2026',
      price: 21.00,
      image: '../images/category-webtoons.jpg',
      imageAlt: 'Fantasy illustrated storybook and glowing crystalline scroll surrounded by golden stardust',
      description: 'Adapted from the hit vertical-scroll fantasy series with 18 pages of exclusive concept sketches.',
      featured: false
    },
    {
      id: 'thunder-rift-omnibus',
      title: 'Riftwalker: Golden Tempest Omnibus',
      author: 'Devon Mercer & Lin Wei',
      category: 'comics',
      categoryLabel: 'Comics',
      window: 'pre-order',
      windowLabel: 'Pre-Order',
      badge: 'Pre-Order',
      badgeType: 'preorder',
      format: 'Slipcase Collector Set',
      releaseDate: '2026-12-10',
      displayDate: 'Dec 10, 2026',
      price: 44.00,
      image: '../images/category-comics.jpg',
      imageAlt: 'Fantasy comic book artwork featuring a cloaked hero silhouette and glowing gold energy arcs',
      description: 'Reserve the oversized 400-page slipcase edition collecting the entire Riftwalker multiverse arc.',
      featured: false
    },
    {
      id: 'moonlit-pilgrim-01',
      title: 'Pilgrim of the Silent Ridge, Vol. 1',
      author: 'Aoi Nishimura',
      category: 'manga',
      categoryLabel: 'Manga',
      window: 'pre-order',
      windowLabel: 'Pre-Order',
      badge: 'Pre-Order',
      badgeType: 'preorder',
      format: 'Special Dust-Jacket Edition',
      releaseDate: '2026-12-15',
      displayDate: 'Dec 15, 2026',
      price: 16.50,
      image: '../images/category-manga.jpg',
      imageAlt: 'Fantasy manga artwork with a misty torii gate, pagoda, and golden crescent moon',
      description: 'A quiet, atmospheric seinen debut following a cartographer mapping vanished shrines across misty peaks.',
      featured: false
    },
    {
      id: 'vault-compendium-26',
      title: 'Grand Vault Lorebook & Art Compendium',
      author: 'Multiverse Guild Press',
      category: 'webtoons',
      categoryLabel: 'Webtoons & Novels',
      window: 'pre-order',
      windowLabel: 'Pre-Order',
      badge: 'Pre-Order',
      badgeType: 'preorder',
      format: 'Gold-Foiled Hardcover',
      releaseDate: '2026-12-22',
      displayDate: 'Dec 22, 2026',
      price: 39.99,
      image: '../images/hero-vault.jpg',
      imageAlt: 'Ornate midnight-purple and antique-gold arcane vault library lined with comics, manga, and illustrated tomes',
      description: 'Illustrated maps, worldbuilding essays, and annotated plates from our flagship fantasy creators.',
      featured: false
    }
  ];

  const state = {
    category: 'all',
    windowFilter: 'all',
    search: '',
    sort: 'newest'
  };

  let toastTimer = null;

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function readStorageArray(key) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeStorageArray(key, list) {
    try {
      localStorage.setItem(key, JSON.stringify(list));
      return true;
    } catch (error) {
      return false;
    }
  }

  function showToast(message) {
    const toast = document.getElementById('nr-toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('is-visible');

    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }

    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2800);
  }

  function isInWishlist(bookId) {
    const wishlist = readStorageArray(WISHLIST_KEY);
    return wishlist.some(function (entry) {
      return entry && (entry.id === bookId || entry === bookId);
    });
  }

  function addToCart(bookId) {
    const book = RELEASES.find(function (item) { return item.id === bookId; });
    if (!book) return;

    const cart = readStorageArray(CART_KEY);
    const existing = cart.find(function (item) { return item && item.id === book.id; });

    if (existing) {
      existing.quantity = (Number(existing.quantity) || 1) + 1;
    } else {
      cart.push({
        id: book.id,
        title: book.title,
        author: book.author,
        category: book.categoryLabel,
        format: book.format,
        price: book.price,
        image: book.image,
        quantity: 1
      });
    }

    writeStorageArray(CART_KEY, cart);

    if (window.MultiverseVault && typeof window.MultiverseVault.updateCartBadge === 'function') {
      window.MultiverseVault.updateCartBadge();
    }

    showToast('Added "' + book.title + '" to your Cart.');
  }

  function toggleWishlist(bookId) {
    const book = RELEASES.find(function (item) { return item.id === bookId; });
    if (!book) return;

    const wishlist = readStorageArray(WISHLIST_KEY);
    const idx = wishlist.findIndex(function (entry) {
      return entry && (entry.id === book.id || entry === book.id);
    });

    if (idx !== -1) {
      wishlist.splice(idx, 1);
      writeStorageArray(WISHLIST_KEY, wishlist);
      showToast('Removed "' + book.title + '" from your Wishlist.');
    } else {
      wishlist.push({
        id: book.id,
        title: book.title,
        author: book.author,
        category: book.categoryLabel,
        format: book.format,
        price: book.price,
        image: book.image,
        addedAt: new Date().toISOString()
      });
      writeStorageArray(WISHLIST_KEY, wishlist);
      showToast('Saved "' + book.title + '" to your Wishlist.');
    }

    syncWishlistButtons();
  }

  function syncWishlistButtons() {
    const buttons = document.querySelectorAll('[data-wishlist-id]');
    buttons.forEach(function (btn) {
      const bookId = btn.getAttribute('data-wishlist-id');
      const saved = isInWishlist(bookId);
      btn.classList.toggle('is-saved', saved);
      btn.setAttribute('aria-pressed', String(saved));
      btn.textContent = saved ? 'In Wishlist \u2713' : 'Wishlist';
    });
  }

  function getBadgeClass(badgeType) {
    if (badgeType === 'preorder') return 'mv-badge nr-badge-preorder';
    if (badgeType === 'firstprint') return 'mv-badge nr-badge-firstprint';
    return 'mv-badge nr-badge-solid';
  }

  function getFilteredReleases() {
    const query = state.search.trim().toLowerCase();

    const filtered = RELEASES.filter(function (book) {
      const matchesCategory = state.category === 'all' || book.category === state.category;
      const matchesWindow = state.windowFilter === 'all' || book.window === state.windowFilter;
      const matchesSearch = !query || (
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.categoryLabel.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query) ||
        book.format.toLowerCase().includes(query)
      );
      return matchesCategory && matchesWindow && matchesSearch;
    });

    filtered.sort(function (a, b) {
      if (state.sort === 'price-desc') return b.price - a.price;
      if (state.sort === 'price-asc') return a.price - b.price;
      if (state.sort === 'title-asc') return a.title.localeCompare(b.title);
      return b.releaseDate.localeCompare(a.releaseDate);
    });

    return filtered;
  }

  function renderCatalog() {
    const grid = document.getElementById('releases-grid');
    const emptyEl = document.getElementById('releases-empty');
    const countEl = document.getElementById('releases-count');
    if (!grid || !emptyEl || !countEl) return;

    const items = getFilteredReleases();
    countEl.innerHTML = 'Showing <strong>' + items.length + '</strong> of <strong>' + RELEASES.length + '</strong> releases';

    if (items.length === 0) {
      grid.innerHTML = '';
      emptyEl.hidden = false;
      return;
    }

    emptyEl.hidden = true;

    grid.innerHTML = items.map(function (book) {
      const saved = isInWishlist(book.id);
      return (
        '<article class="mv-card nr-card">' +
          '<figure class="nr-card-figure">' +
            '<div class="nr-card-media">' +
              '<img src="' + escapeHtml(book.image) + '" alt="' + escapeHtml(book.imageAlt) + '">' +
              '<div class="nr-card-badge-wrap">' +
                '<span class="' + getBadgeClass(book.badgeType) + '">' + escapeHtml(book.badge) + '</span>' +
              '</div>' +
            '</div>' +
            '<figcaption class="ai-credit ai-credit--card">This image has been generated by Google Gemini.</figcaption>' +
          '</figure>' +
          '<div class="mv-card-body">' +
            '<div class="nr-card-kicker">' +
              '<span>' + escapeHtml(book.categoryLabel) + '</span>' +
              '<span>' + escapeHtml(book.displayDate) + '</span>' +
            '</div>' +
            '<h3 class="mv-card-title">' + escapeHtml(book.title) + '</h3>' +
            '<p class="nr-card-author">By ' + escapeHtml(book.author) + '</p>' +
            '<p class="nr-card-desc">' + escapeHtml(book.description) + '</p>' +
            '<div class="nr-card-footer">' +
              '<div class="nr-card-price-row">' +
                '<span class="nr-card-price">$' + book.price.toFixed(2) + '</span>' +
                '<span class="nr-card-format">' + escapeHtml(book.format) + '</span>' +
              '</div>' +
              '<div class="nr-card-buttons">' +
                '<button type="button" class="btn btn-gold btn-sm" data-cart-id="' + escapeHtml(book.id) + '">Add to Cart</button>' +
                '<button type="button" class="btn btn-outline btn-sm btn-wishlist' + (saved ? ' is-saved' : '') + '" data-wishlist-id="' + escapeHtml(book.id) + '" aria-pressed="' + String(saved) + '">' + (saved ? 'In Wishlist \u2713' : 'Wishlist') + '</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function resetAllFilters() {
    state.category = 'all';
    state.windowFilter = 'all';
    state.search = '';
    state.sort = 'newest';

    const searchInput = document.getElementById('release-search');
    const windowSelect = document.getElementById('release-window-filter');
    const sortSelect = document.getElementById('release-sort');

    if (searchInput) searchInput.value = '';
    if (windowSelect) windowSelect.value = 'all';
    if (sortSelect) sortSelect.value = 'newest';

    document.querySelectorAll('[data-category-filter]').forEach(function (btn) {
      const isAll = btn.getAttribute('data-category-filter') === 'all';
      btn.classList.toggle('is-active', isAll);
      btn.setAttribute('aria-pressed', String(isAll));
    });

    renderCatalog();
  }

  function initFiltersAndCatalog() {
    const categoryButtons = document.querySelectorAll('[data-category-filter]');
    const windowSelect = document.getElementById('release-window-filter');
    const sortSelect = document.getElementById('release-sort');
    const searchInput = document.getElementById('release-search');
    const resetBtn = document.getElementById('reset-release-filters');

    categoryButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.category = btn.getAttribute('data-category-filter') || 'all';
        categoryButtons.forEach(function (item) {
          const active = item === btn;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        renderCatalog();
      });
    });

    if (windowSelect) {
      windowSelect.addEventListener('change', function () {
        state.windowFilter = windowSelect.value;
        renderCatalog();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        state.sort = sortSelect.value;
        renderCatalog();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.search = searchInput.value;
        renderCatalog();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', resetAllFilters);
    }

    // Event delegation for Add to Cart & Wishlist buttons (featured + catalog)
    document.addEventListener('click', function (event) {
      const cartBtn = event.target.closest('[data-cart-id]');
      if (cartBtn) {
        addToCart(cartBtn.getAttribute('data-cart-id'));
        return;
      }

      const wishlistBtn = event.target.closest('[data-wishlist-id]');
      if (wishlistBtn) {
        toggleWishlist(wishlistBtn.getAttribute('data-wishlist-id'));
        return;
      }

      const notifyBtn = event.target.closest('[data-notify-category]');
      if (notifyBtn) {
        const categoryValue = notifyBtn.getAttribute('data-notify-category');
        const bookTitle = notifyBtn.getAttribute('data-notify-title') || '';
        const alertCategory = document.getElementById('alert-category');
        const alertSection = document.getElementById('release-alerts');
        const alertName = document.getElementById('alert-name');

        if (alertCategory && categoryValue) {
          alertCategory.value = categoryValue;
        }
        if (alertSection) {
          alertSection.scrollIntoView({ behavior: 'smooth' });
        }
        if (alertName) {
          alertName.focus({ preventScroll: true });
        }
        if (bookTitle) {
          showToast('Selected alerts for "' + bookTitle + '".');
        }
      }
    });

    renderCatalog();
    syncWishlistButtons();
  }

  function initAlertForm() {
    const form = document.getElementById('release-alert-form');
    if (!form) return;

    const nameInput = document.getElementById('alert-name');
    const emailInput = document.getElementById('alert-email');
    const categorySelect = document.getElementById('alert-category');
    const consentCheck = document.getElementById('alert-consent');

    const nameError = document.getElementById('alert-name-error');
    const emailError = document.getElementById('alert-email-error');
    const consentError = document.getElementById('alert-consent-error');
    const statusBanner = document.getElementById('alert-form-status');

    function setFieldError(inputEl, errorEl, message) {
      if (errorEl) errorEl.textContent = message;
      if (inputEl) inputEl.classList.toggle('is-invalid', Boolean(message));
    }

    function clearStatus() {
      if (!statusBanner) return;
      statusBanner.textContent = '';
      statusBanner.className = 'nr-status-banner';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearStatus();

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const categoryVal = categorySelect ? categorySelect.value : 'all';
      const consentVal = consentCheck ? consentCheck.checked : false;

      let valid = true;

      if (nameVal.length < 2) {
        setFieldError(nameInput, nameError, 'Please enter your name (at least 2 characters).');
        valid = false;
      } else {
        setFieldError(nameInput, nameError, '');
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailVal)) {
        setFieldError(emailInput, emailError, 'Please enter a valid email address.');
        valid = false;
      } else {
        setFieldError(emailInput, emailError, '');
      }

      if (!consentVal) {
        setFieldError(null, consentError, 'Please confirm you would like to receive release alerts.');
        valid = false;
      } else {
        setFieldError(null, consentError, '');
      }

      if (!valid) {
        if (statusBanner) {
          statusBanner.textContent = 'Please fix the highlighted fields before subscribing.';
          statusBanner.className = 'nr-status-banner is-visible is-error';
        }
        return;
      }

      const savedAlerts = readStorageArray(ALERTS_KEY);
      savedAlerts.push({
        name: nameVal,
        email: emailVal,
        category: categoryVal,
        subscribedAt: new Date().toISOString()
      });
      writeStorageArray(ALERTS_KEY, savedAlerts);

      const selectedLabel = categorySelect && categorySelect.options[categorySelect.selectedIndex]
        ? categorySelect.options[categorySelect.selectedIndex].text
        : 'All Formats';

      if (statusBanner) {
        statusBanner.textContent = 'Vault alert confirmed for ' + nameVal + ' (' + emailVal + ') — tracking ' + selectedLabel + ' drops (saved locally in browser demo storage).';
        statusBanner.className = 'nr-status-banner is-visible is-success';
      }

      form.reset();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFiltersAndCatalog();
    initAlertForm();
  });
})();
