/* ==========================================================================
   Multiverse Vault — Interactive Storefront Logic (My Library & Wishlist)
   Uses localStorage so Cart, Wishlist, and Reading Progress persist across pages.
   ========================================================================== */

(function () {
  "use strict";

  var STORAGE_KEYS = {
    CART: "mv_cart",
    WISHLIST: "mv_wishlist",
    LIBRARY: "mv_library",
    FAVORITES: "mv_library_favorites"
  };

  var CATALOG = [
    {
      id: "aetheria-vol4",
      title: "Chronicles of Aetheria, Vol. 4",
      author: "Sora Takahashi",
      category: "Manga",
      format: "Digital & Print",
      edition: "Volume 4 · Celestial Arc",
      price: 14.99,
      oldPrice: 18.99,
      rating: 4.9,
      stock: "In Stock",
      dealBadge: "21% Off",
      totalChapters: 24,
      cover: "../images/covers/aetheria-vol4.svg",
      excerpt: [
        "Above the floating spires of Aetheria, the brass astrolabe hummed with a resonance Lyra had not heard since the Fall of the Seventh Moon.",
        "\"If the star-gates reopen tonight,\" Master Veylin murmured, resting a gloved hand on the gilt railing, \"no archive in the multiverse will remain hidden.\"",
        "Lyra turned the illuminated vellum page. Beneath the ink, golden constellations shifted in real time—charting a doorway straight into the sunken library."
      ]
    },
    {
      id: "obsidian-blade",
      title: "The Obsidian Blade: Sovereign Arc",
      author: "Kenjiro Mori",
      category: "Manga",
      format: "Digital Edition",
      edition: "Deluxe Omnibus",
      price: 16.50,
      oldPrice: null,
      rating: 4.8,
      stock: "In Stock",
      dealBadge: null,
      totalChapters: 30,
      cover: "../images/covers/obsidian-blade.svg",
      excerpt: [
        "Rain hissed against the temple flagstones as Ren unsheathed the blackened steel. Its edge drank the lantern light until only a hairline of gold remained.",
        "\"Three vows forged this blade,\" his rival called across the courtyard. \"Which one are you willing to break tonight?\""
      ]
    },
    {
      id: "starlight-archivist",
      title: "Starlight Archivist: Astral Tome",
      author: "Elena Vance",
      category: "Collector Editions",
      format: "Hardcover + Digital",
      edition: "Foil Collector's Edition",
      price: 34.99,
      oldPrice: 42.00,
      rating: 5.0,
      stock: "Low Stock",
      dealBadge: "Collector Deal",
      totalChapters: 18,
      cover: "../images/covers/starlight-archivist.svg",
      excerpt: [
        "Every book in the Astral Vault remembered the voice of whoever first read it aloud. When Elena opened Tome IX, the margin notes whispered back in silver script.",
        "\"Do not catalog the final chapter,\" the margin warned. \"Once named, the realm inside becomes permanent.\""
      ]
    },
    {
      id: "neon-valkyrie",
      title: "Neon Valkyrie #14: Eclipse Protocol",
      author: "Marcus Chen",
      category: "Comics",
      format: "Single Issue · Digital",
      edition: "Issue #14 · Variant Cover",
      price: 6.99,
      oldPrice: null,
      rating: 4.7,
      stock: "In Stock",
      dealBadge: null,
      totalChapters: 12,
      cover: "../images/covers/neon-valkyrie.svg",
      excerpt: [
        "Sixty stories above Sector Nine, Kira's hard-light wings flared gold against the violet storm front.",
        "\"Command, the orbital relay isn't malfunctioning,\" she transmitted over encrypted channels. \"Someone is rewriting the city's skyline from orbit.\""
      ]
    },
    {
      id: "crimson-covenant",
      title: "Crimson Covenant: Blood & Parchment",
      author: "Ha-eun Park",
      category: "Webtoons",
      format: "Vertical Scroll Series",
      edition: "Season 1 Complete",
      price: 11.99,
      oldPrice: 14.99,
      rating: 4.8,
      stock: "In Stock",
      dealBadge: "20% Off",
      totalChapters: 40,
      cover: "../images/covers/crimson-covenant.svg",
      excerpt: [
        "The wax seal bore two intertwined crescents—the signature of a covenant no noble house dared acknowledge in daylight.",
        "\"Sign before midnight,\" Lady Seorin said softly, sliding the obsidian quill across the velvet table, \"or let the winter court claim your name.\""
      ]
    },
    {
      id: "eldritch-sanctum",
      title: "Eldritch Sanctum: Gilded Grimoire",
      author: "Arjun Mehta",
      category: "Collector Editions",
      format: "Illustrated Hardcover",
      edition: "First Printing · Slipcase",
      price: 39.50,
      oldPrice: null,
      rating: 4.9,
      stock: "Pre-Order",
      dealBadge: "Limited Print",
      totalChapters: 20,
      cover: "../images/covers/eldritch-sanctum.svg",
      excerpt: [
        "Beyond the brass doors of the Sanctum, staircases folded into impossible geometries while gilded lanterns drifted like patient fireflies.",
        "\"Rules of the third floor,\" the caretaker recited without looking up from his ledger: \"Never read a footnote twice, and never leave a bookmark behind.\""
      ]
    },
    {
      id: "echoes-of-hollow",
      title: "Echoes of the Hollow Realm",
      author: "Min-jun Kang",
      category: "Webtoons",
      format: "Vertical Scroll Series",
      edition: "Season 2 · Weekly",
      price: 9.99,
      oldPrice: null,
      rating: 4.6,
      stock: "In Stock",
      dealBadge: null,
      totalChapters: 32,
      cover: "../images/covers/echoes-of-hollow.svg",
      excerpt: [
        "Cyan ripples spread across the cavern lake the moment Ji-ho's lantern touched the water's surface.",
        "Below the reflection of the stalactites, an entire sunken cathedral blinked awake."
      ]
    },
    {
      id: "shadow-cartographer",
      title: "Shadow Cartographer #01",
      author: "Lyra Solis",
      category: "Comics",
      format: "Digital & Print",
      edition: "Premiere Issue",
      price: 8.49,
      oldPrice: 10.99,
      rating: 4.8,
      stock: "In Stock",
      dealBadge: "23% Off",
      totalChapters: 10,
      cover: "../images/covers/shadow-cartographer.svg",
      excerpt: [
        "On ordinary maps, the Meridian Sea ended in polite blank parchment. On Nadia's compass, the needle spun downward toward a kingdom beneath the tide.",
        "\"Pack extra ink,\" her navigator grinned. \"We're charting territory that hasn't existed for four centuries.\""
      ]
    }
  ];

  var DEFAULT_LIBRARY_PROGRESS = [
    { id: "aetheria-vol4", currentChapter: 18, status: "Reading", lastRead: "2 hours ago" },
    { id: "obsidian-blade", currentChapter: 30, status: "Completed", lastRead: "Yesterday" },
    { id: "starlight-archivist", currentChapter: 9, status: "Reading", lastRead: "3 days ago" },
    { id: "neon-valkyrie", currentChapter: 12, status: "Completed", lastRead: "Last week" },
    { id: "crimson-covenant", currentChapter: 14, status: "Reading", lastRead: "4 days ago" },
    { id: "shadow-cartographer", currentChapter: 0, status: "Unread", lastRead: "Added today" }
  ];

  var DEFAULT_WISHLIST_IDS = [
    "eldritch-sanctum",
    "starlight-archivist",
    "crimson-covenant",
    "echoes-of-hollow"
  ];

  function readStorage(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // Ignore storage quota errors in restricted browsing modes.
    }
  }

  function findBook(id) {
    return CATALOG.find(function (item) {
      return item.id === id;
    });
  }

  function getCart() {
    var cart = readStorage(STORAGE_KEYS.CART, []);
    return Array.isArray(cart) ? cart : [];
  }

  function saveCart(cart) {
    writeStorage(STORAGE_KEYS.CART, cart);
    updateHeaderBadges();
  }

  function getWishlistIds() {
    var stored = readStorage(STORAGE_KEYS.WISHLIST, null);
    if (!Array.isArray(stored)) {
      writeStorage(STORAGE_KEYS.WISHLIST, DEFAULT_WISHLIST_IDS.slice());
      return DEFAULT_WISHLIST_IDS.slice();
    }
    return stored;
  }

  function saveWishlistIds(ids) {
    writeStorage(STORAGE_KEYS.WISHLIST, ids);
    updateHeaderBadges();
  }

  function getLibraryState() {
    var stored = readStorage(STORAGE_KEYS.LIBRARY, null);
    if (!Array.isArray(stored) || stored.length === 0) {
      writeStorage(STORAGE_KEYS.LIBRARY, DEFAULT_LIBRARY_PROGRESS.slice());
      return DEFAULT_LIBRARY_PROGRESS.slice();
    }
    return stored;
  }

  function saveLibraryState(items) {
    writeStorage(STORAGE_KEYS.LIBRARY, items);
  }

  function getFavorites() {
    var stored = readStorage(STORAGE_KEYS.FAVORITES, ["aetheria-vol4", "starlight-archivist"]);
    return Array.isArray(stored) ? stored : [];
  }

  function toggleFavorite(id) {
    var favs = getFavorites();
    var idx = favs.indexOf(id);
    if (idx >= 0) {
      favs.splice(idx, 1);
      showToast("Removed from favorites.");
    } else {
      favs.push(id);
      showToast("Pinned to your favorites.");
    }
    writeStorage(STORAGE_KEYS.FAVORITES, favs);
    return favs;
  }

  function addToCart(bookId) {
    var book = findBook(bookId);
    if (!book) return;
    var cart = getCart();
    var existing = cart.find(function (entry) {
      return entry.id === book.id;
    });
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: book.id,
        title: book.title,
        author: book.author,
        format: book.format,
        price: book.price,
        cover: book.cover,
        qty: 1
      });
    }
    saveCart(cart);
  }

  function updateHeaderBadges() {
    var cartCount = getCart().reduce(function (sum, item) {
      return sum + (item.qty || 1);
    }, 0);
    var wishlistCount = getWishlistIds().length;

    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = String(cartCount);
    });
    document.querySelectorAll("[data-wishlist-count]").forEach(function (el) {
      el.textContent = String(wishlistCount);
    });
  }

  /* Toast Notification */
  var toastTimer = null;
  function showToast(message, actionLabel, actionHandler) {
    var toast = document.getElementById("mvToast");
    if (!toast) return;

    toast.innerHTML = "";
    var msgSpan = document.createElement("span");
    msgSpan.textContent = message;
    toast.appendChild(msgSpan);

    if (actionLabel && typeof actionHandler === "function") {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mv-toast-action";
      btn.textContent = actionLabel;
      btn.addEventListener("click", function () {
        actionHandler();
        toast.classList.remove("is-visible");
      });
      toast.appendChild(btn);
    }

    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3600);
  }

  /* Shared Header Mobile Drawer & Newsletter */
  function initSharedShell() {
    updateHeaderBadges();

    var menuBtn = document.getElementById("mvMenuToggle");
    var drawer = document.getElementById("mvMobileDrawer");
    if (menuBtn && drawer) {
      menuBtn.addEventListener("click", function () {
        var isOpen = drawer.classList.toggle("is-open");
        menuBtn.setAttribute("aria-expanded", String(isOpen));
      });
    }

    var newsletterForm = document.getElementById("mvNewsletterForm");
    var newsletterInput = document.getElementById("mvNewsletterEmail");
    var newsletterMsg = document.getElementById("mvNewsletterMsg");
    if (newsletterForm && newsletterInput && newsletterMsg) {
      newsletterForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var email = newsletterInput.value.trim();
        if (!email || email.indexOf("@") === -1 || email.indexOf(".") === -1) {
          newsletterMsg.style.color = "#f06d7d";
          newsletterMsg.textContent = "Please enter a valid email address.";
          return;
        }
        newsletterMsg.style.color = "#5cd69a";
        newsletterMsg.textContent = "Welcome to the Vault! Dispatches will arrive at " + email + ".";
        newsletterForm.reset();
      });
    }
  }

  /* ========================================================================
     MY LIBRARY PAGE CONTROLLER
     ======================================================================== */
  function initLibraryPage() {
    var grid = document.getElementById("libraryGrid");
    if (!grid) return;

    var state = {
      category: "All",
      status: "All",
      search: "",
      sort: "recent",
      activeBookId: null
    };

    var spotlightContainer = document.getElementById("librarySpotlight");
    var countLabel = document.getElementById("libraryResultCount");
    var searchInput = document.getElementById("librarySearch");
    var statusSelect = document.getElementById("libraryStatusFilter");
    var sortSelect = document.getElementById("librarySort");
    var filterTabs = document.querySelectorAll("[data-lib-category]");

    var modal = document.getElementById("readerModal");
    var modalTitle = document.getElementById("readerModalTitle");
    var modalMeta = document.getElementById("readerModalMeta");
    var modalExcerpt = document.getElementById("readerModalExcerpt");
    var modalNextBtn = document.getElementById("readerAdvanceBtn");
    var modalFullLink = document.getElementById("readerFullPageLink");
    var modalCloseBtns = document.querySelectorAll("[data-close-reader]");

    function getEnrichedLibrary() {
      var progressList = getLibraryState();
      var favorites = getFavorites();
      return progressList
        .map(function (entry, index) {
          var book = findBook(entry.id);
          if (!book) return null;
          var pct = Math.round((entry.currentChapter / book.totalChapters) * 100);
          return Object.assign({}, book, {
            currentChapter: entry.currentChapter,
            status: entry.status,
            lastRead: entry.lastRead,
            progressPct: pct,
            isFavorite: favorites.indexOf(book.id) >= 0,
            orderIndex: index
          });
        })
        .filter(Boolean);
    }

    function updateLibraryStats(items) {
      var total = items.length;
      var reading = items.filter(function (b) { return b.status === "Reading"; }).length;
      var completed = items.filter(function (b) { return b.status === "Completed"; }).length;
      var chaptersRead = items.reduce(function (sum, b) { return sum + b.currentChapter; }, 0);

      var elTotal = document.getElementById("statTotalTitles");
      var elReading = document.getElementById("statReadingCount");
      var elCompleted = document.getElementById("statCompletedCount");
      if (elTotal) elTotal.textContent = String(total);
      if (elReading) elReading.textContent = String(reading);
      if (elCompleted) elCompleted.textContent = String(completed + " · " + chaptersRead + " Ch");
    }

    function renderSpotlight(items) {
      if (!spotlightContainer || items.length === 0) return;
      var featured = items.find(function (b) { return b.status === "Reading"; }) || items[0];
      spotlightContainer.innerHTML =
        '<div class="mv-spotlight-layout">' +
        '  <img class="mv-spotlight-cover" src="' + featured.cover + '" alt="' + featured.title + ' cover">' +
        '  <div>' +
        '    <span class="mv-eyebrow">Continue Reading · ' + featured.lastRead + '</span>' +
        '    <h2 class="mv-spotlight-title">' + featured.title + '</h2>' +
        '    <p class="mv-spotlight-meta">' + featured.author + ' · ' + featured.edition + '</p>' +
        '    <div class="mv-progress-wrap">' +
        '      <div class="mv-progress-meta">' +
        '        <span>Chapter ' + featured.currentChapter + ' of ' + featured.totalChapters + '</span>' +
        '        <span>' + featured.progressPct + '%</span>' +
        '      </div>' +
        '      <div class="mv-progress-track">' +
        '        <div class="mv-progress-fill" style="width:' + featured.progressPct + '%"></div>' +
        '      </div>' +
        '    </div>' +
        '    <div class="mv-spotlight-actions">' +
        '      <button type="button" class="mv-btn mv-btn-primary mv-btn-sm" data-open-reader="' + featured.id + '">Continue Reading →</button>' +
        '      <a class="mv-btn mv-btn-secondary mv-btn-sm" href="reader.html?book=' + encodeURIComponent(featured.id) + '">Full Reader</a>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    }

    function openReaderModal(bookId) {
      var items = getEnrichedLibrary();
      var item = items.find(function (b) { return b.id === bookId; });
      if (!item || !modal) return;

      state.activeBookId = item.id;
      var nextChapter = Math.min(item.totalChapters, Math.max(1, item.currentChapter + (item.currentChapter === 0 ? 1 : 0)));
      modalTitle.textContent = item.title;
      modalMeta.textContent = item.author + " · Chapter " + nextChapter + " of " + item.totalChapters + " (" + item.progressPct + "% complete)";
      modalExcerpt.innerHTML = item.excerpt.map(function (p) { return "<p>" + p + "</p>"; }).join("");
      if (modalFullLink) {
        modalFullLink.href = "reader.html?book=" + encodeURIComponent(item.id);
      }
      if (modalNextBtn) {
        modalNextBtn.textContent = item.currentChapter >= item.totalChapters ? "Mark Unread (Restart)" : "Complete Next Chapter (+1)";
      }
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
    }

    function closeReaderModal() {
      if (!modal) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    }

    function advanceChapter(bookId) {
      var progressList = getLibraryState();
      var book = findBook(bookId);
      if (!book) return;

      var entry = progressList.find(function (e) { return e.id === bookId; });
      if (!entry) return;

      if (entry.currentChapter >= book.totalChapters) {
        entry.currentChapter = 0;
        entry.status = "Unread";
        entry.lastRead = "Reset just now";
        showToast("Reset reading progress for " + book.title + ".");
      } else {
        entry.currentChapter += 1;
        entry.status = entry.currentChapter >= book.totalChapters ? "Completed" : "Reading";
        entry.lastRead = "Just now";
        showToast("Updated " + book.title + " to Chapter " + entry.currentChapter + "/" + book.totalChapters + ".");
      }

      saveLibraryState(progressList);
      renderLibrary();
      if (modal && modal.classList.contains("is-open") && state.activeBookId === bookId) {
        openReaderModal(bookId);
      }
    }

    function renderLibrary() {
      var allItems = getEnrichedLibrary();
      updateLibraryStats(allItems);
      renderSpotlight(allItems);

      var filtered = allItems.filter(function (item) {
        var matchCat = state.category === "All" || item.category === state.category;
        var matchStatus = state.status === "All" || item.status === state.status;
        var q = state.search.trim().toLowerCase();
        var matchSearch = !q || item.title.toLowerCase().indexOf(q) >= 0 || item.author.toLowerCase().indexOf(q) >= 0;
        return matchCat && matchStatus && matchSearch;
      });

      if (state.sort === "title") {
        filtered.sort(function (a, b) { return a.title.localeCompare(b.title); });
      } else if (state.sort === "progress") {
        filtered.sort(function (a, b) { return b.progressPct - a.progressPct; });
      } else {
        filtered.sort(function (a, b) { return a.orderIndex - b.orderIndex; });
      }

      if (countLabel) {
        countLabel.textContent = "Showing " + filtered.length + " of " + allItems.length + " titles";
      }

      if (filtered.length === 0) {
        grid.innerHTML =
          '<div class="mv-empty-state" style="grid-column: 1 / -1;">' +
          '  <div class="mv-empty-icon" aria-hidden="true">✦</div>' +
          '  <h3 class="mv-empty-title">No matching volumes in your shelf</h3>' +
          '  <p class="mv-empty-text">Try clearing your search or switching category and status filters to view all unlocked titles.</p>' +
          '  <div class="mv-empty-actions">' +
          '    <button type="button" class="mv-btn mv-btn-primary" id="resetLibraryFiltersBtn">Reset Filters</button>' +
          '  </div>' +
          '</div>';
        var resetBtn = document.getElementById("resetLibraryFiltersBtn");
        if (resetBtn) {
          resetBtn.addEventListener("click", function () {
            state.category = "All";
            state.status = "All";
            state.search = "";
            if (searchInput) searchInput.value = "";
            if (statusSelect) statusSelect.value = "All";
            filterTabs.forEach(function (t) {
              t.classList.toggle("is-active", t.getAttribute("data-lib-category") === "All");
            });
            renderLibrary();
          });
        }
        return;
      }

      grid.innerHTML = filtered.map(function (item) {
        var ctaLabel = item.status === "Completed" ? "Re-read" : item.currentChapter > 0 ? "Continue" : "Start Reading";
        var statusClass = item.status === "Completed" ? "mv-tag mv-tag--success" : "mv-tag";
        var favClass = item.isFavorite ? "mv-icon-btn is-favorited" : "mv-icon-btn";
        var favChar = item.isFavorite ? "★" : "☆";

        return (
          '<article class="mv-card">' +
          '  <div class="mv-card-media">' +
          '    <img class="mv-card-cover" src="' + item.cover + '" alt="' + item.title + ' cover art" loading="lazy">' +
          '    <div class="mv-card-top-badges">' +
          '      <button type="button" class="' + favClass + '" data-toggle-fav="' + item.id + '" aria-label="Pin ' + item.title + ' as favorite">' + favChar + '</button>' +
          '    </div>' +
          '  </div>' +
          '  <div class="mv-card-body">' +
          '    <div class="mv-card-meta-row">' +
          '      <span class="mv-card-author">' + item.category + '</span>' +
          '      <span class="' + statusClass + '">' + item.status + '</span>' +
          '    </div>' +
          '    <h3 class="mv-card-title">' + item.title + '</h3>' +
          '    <p class="mv-card-edition">' + item.author + ' · ' + item.edition + '</p>' +
          '    <div class="mv-progress-wrap">' +
          '      <div class="mv-progress-meta">' +
          '        <span>Ch. ' + item.currentChapter + ' / ' + item.totalChapters + '</span>' +
          '        <span>' + item.progressPct + '%</span>' +
          '      </div>' +
          '      <div class="mv-progress-track">' +
          '        <div class="mv-progress-fill" style="width:' + item.progressPct + '%"></div>' +
          '      </div>' +
          '    </div>' +
          '    <div class="mv-card-actions">' +
          '      <button type="button" class="mv-btn mv-btn-primary mv-btn-sm" data-open-reader="' + item.id + '">' + ctaLabel + '</button>' +
          '      <a class="mv-btn mv-btn-secondary mv-btn-sm" href="book-details.html?id=' + encodeURIComponent(item.id) + '">Details</a>' +
          '    </div>' +
          '  </div>' +
          '</article>'
        );
      }).join("");
    }

    filterTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        state.category = tab.getAttribute("data-lib-category") || "All";
        filterTabs.forEach(function (t) { t.classList.remove("is-active"); });
        tab.classList.add("is-active");
        renderLibrary();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        state.search = searchInput.value;
        renderLibrary();
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener("change", function () {
        state.status = statusSelect.value;
        renderLibrary();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        state.sort = sortSelect.value;
        renderLibrary();
      });
    }

    document.addEventListener("click", function (event) {
      var readBtn = event.target.closest("[data-open-reader]");
      if (readBtn) {
        openReaderModal(readBtn.getAttribute("data-open-reader"));
        return;
      }

      var favBtn = event.target.closest("[data-toggle-fav]");
      if (favBtn) {
        toggleFavorite(favBtn.getAttribute("data-toggle-fav"));
        renderLibrary();
      }
    });

    if (modalNextBtn) {
      modalNextBtn.addEventListener("click", function () {
        if (state.activeBookId) {
          advanceChapter(state.activeBookId);
        }
      });
    }

    modalCloseBtns.forEach(function (btn) {
      btn.addEventListener("click", closeReaderModal);
    });

    if (modal) {
      modal.addEventListener("click", function (event) {
        if (event.target === modal) closeReaderModal();
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeReaderModal();
    });

    renderLibrary();
  }

  /* ========================================================================
     WISHLIST PAGE CONTROLLER
     ======================================================================== */
  function initWishlistPage() {
    var grid = document.getElementById("wishlistGrid");
    if (!grid) return;

    var recGrid = document.getElementById("recommendedGrid");
    var summaryContainer = document.getElementById("wishlistSummary");
    var countLabel = document.getElementById("wishlistResultCount");
    var searchInput = document.getElementById("wishlistSearch");
    var sortSelect = document.getElementById("wishlistSort");
    var filterTabs = document.querySelectorAll("[data-wish-category]");

    var state = {
      category: "All",
      search: "",
      sort: "added"
    };

    function formatPrice(val) {
      return "$" + val.toFixed(2);
    }

    function getWishlistBooks() {
      return getWishlistIds().map(findBook).filter(Boolean);
    }

    function renderSummary(items) {
      var totalValue = items.reduce(function (sum, b) { return sum + b.price; }, 0);
      var savings = items.reduce(function (sum, b) {
        return sum + (b.oldPrice ? b.oldPrice - b.price : 0);
      }, 0);
      var dealCount = items.filter(function (b) { return Boolean(b.dealBadge); }).length;

      var statSaved = document.getElementById("wishStatCount");
      var statTotal = document.getElementById("wishStatTotal");
      var statDeals = document.getElementById("wishStatDeals");
      if (statSaved) statSaved.textContent = String(items.length);
      if (statTotal) statTotal.textContent = formatPrice(totalValue);
      if (statDeals) statDeals.textContent = String(dealCount);

      if (!summaryContainer) return;
      summaryContainer.innerHTML =
        '<span class="mv-eyebrow">Wishlist Summary</span>' +
        '<h2 class="mv-spotlight-title">Ready for Your Vault</h2>' +
        '<div class="mv-summary-list">' +
        '  <div class="mv-summary-row"><span>Saved Titles</span><strong>' + items.length + ' items</strong></div>' +
        '  <div class="mv-summary-row"><span>Active Price Drops</span><strong>' + dealCount + ' deals (' + formatPrice(savings) + ' saved)</strong></div>' +
        '  <div class="mv-summary-row mv-summary-row--total"><span>Estimated Total</span><strong>' + formatPrice(totalValue) + '</strong></div>' +
        '</div>' +
        '<div class="mv-spotlight-actions">' +
        '  <button type="button" class="mv-btn mv-btn-primary" id="moveAllToCartBtn" style="flex:1;"' + (items.length === 0 ? " disabled" : "") + '>Move All to Cart →</button>' +
        '  <a class="mv-btn mv-btn-secondary" href="cart.html">View Cart</a>' +
        '</div>';

      var moveAllBtn = document.getElementById("moveAllToCartBtn");
      if (moveAllBtn) {
        moveAllBtn.addEventListener("click", function () {
          var current = getWishlistIds();
          if (current.length === 0) return;
          current.forEach(addToCart);
          saveWishlistIds([]);
          renderWishlist();
          showToast("Moved " + current.length + " titles to your Cart!", "Restore", function () {
            saveWishlistIds(current);
            renderWishlist();
          });
        });
      }
    }

    function renderRecommendations(wishlistIds) {
      if (!recGrid) return;
      var recs = CATALOG.filter(function (b) {
        return wishlistIds.indexOf(b.id) === -1;
      }).slice(0, 4);

      recGrid.innerHTML = recs.map(function (item) {
        return (
          '<article class="mv-card">' +
          '  <div class="mv-card-media">' +
          '    <img class="mv-card-cover" src="' + item.cover + '" alt="' + item.title + ' cover art" loading="lazy">' +
          '  </div>' +
          '  <div class="mv-card-body">' +
          '    <div class="mv-card-meta-row">' +
          '      <span class="mv-card-author">' + item.author + '</span>' +
          '      <span class="mv-tag">' + item.category + '</span>' +
          '    </div>' +
          '    <h3 class="mv-card-title">' + item.title + '</h3>' +
          '    <p class="mv-card-edition">' + item.edition + '</p>' +
          '    <div class="mv-price-row">' +
          '      <div class="mv-price-group">' +
          '        <span class="mv-price-current">' + formatPrice(item.price) + '</span>' +
          (item.oldPrice ? '<span class="mv-price-old">' + formatPrice(item.oldPrice) + '</span>' : "") +
          '      </div>' +
          '      <span class="mv-rating"><span>★</span> ' + item.rating.toFixed(1) + '</span>' +
          '    </div>' +
          '    <div class="mv-card-actions">' +
          '      <button type="button" class="mv-btn mv-btn-secondary mv-btn-sm" data-add-wish="' + item.id + '">♡ Save to Wishlist</button>' +
          '      <a class="mv-btn mv-btn-secondary mv-btn-sm" href="book-details.html?id=' + encodeURIComponent(item.id) + '">Details</a>' +
          '    </div>' +
          '  </div>' +
          '</article>'
        );
      }).join("");
    }

    function removeFromWishlist(bookId, toastText) {
      var ids = getWishlistIds();
      var prev = ids.slice();
      var next = ids.filter(function (id) { return id !== bookId; });
      saveWishlistIds(next);
      renderWishlist();
      var book = findBook(bookId);
      showToast(toastText || ("Removed " + (book ? book.title : "item") + " from Wishlist."), "Undo", function () {
        saveWishlistIds(prev);
        renderWishlist();
      });
    }

    function renderWishlist() {
      var allItems = getWishlistBooks();
      var wishlistIds = allItems.map(function (b) { return b.id; });
      renderSummary(allItems);
      renderRecommendations(wishlistIds);

      var filtered = allItems.filter(function (item) {
        var matchCat = state.category === "All" || item.category === state.category;
        var q = state.search.trim().toLowerCase();
        var matchSearch = !q || item.title.toLowerCase().indexOf(q) >= 0 || item.author.toLowerCase().indexOf(q) >= 0;
        return matchCat && matchSearch;
      });

      if (state.sort === "price-asc") {
        filtered.sort(function (a, b) { return a.price - b.price; });
      } else if (state.sort === "price-desc") {
        filtered.sort(function (a, b) { return b.price - a.price; });
      } else if (state.sort === "title") {
        filtered.sort(function (a, b) { return a.title.localeCompare(b.title); });
      }

      if (countLabel) {
        countLabel.textContent = "Showing " + filtered.length + " of " + allItems.length + " saved items";
      }

      if (allItems.length === 0) {
        grid.innerHTML =
          '<div class="mv-empty-state" style="grid-column: 1 / -1;">' +
          '  <div class="mv-empty-icon" aria-hidden="true">♡</div>' +
          '  <h3 class="mv-empty-title">Your Vault Wishlist is Empty</h3>' +
          '  <p class="mv-empty-text">Explore new comic issues, manga volumes, and gilded collector editions below, or restore the sample list.</p>' +
          '  <div class="mv-empty-actions">' +
          '    <a class="mv-btn mv-btn-primary" href="explore.html">Explore the Vault →</a>' +
          '    <button type="button" class="mv-btn mv-btn-secondary" id="restoreWishlistBtn">Restore Sample Wishlist</button>' +
          '  </div>' +
          '</div>';
        var restoreBtn = document.getElementById("restoreWishlistBtn");
        if (restoreBtn) {
          restoreBtn.addEventListener("click", function () {
            saveWishlistIds(DEFAULT_WISHLIST_IDS.slice());
            renderWishlist();
            showToast("Sample wishlist restored.");
          });
        }
        return;
      }

      if (filtered.length === 0) {
        grid.innerHTML =
          '<div class="mv-empty-state" style="grid-column: 1 / -1;">' +
          '  <div class="mv-empty-icon" aria-hidden="true">✦</div>' +
          '  <h3 class="mv-empty-title">No wishlist items match your filter</h3>' +
          '  <p class="mv-empty-text">Clear your search query or select "All" to view all saved volumes.</p>' +
          '  <div class="mv-empty-actions">' +
          '    <button type="button" class="mv-btn mv-btn-primary" id="resetWishlistFiltersBtn">Show All Saved</button>' +
          '  </div>' +
          '</div>';
        var resetBtn = document.getElementById("resetWishlistFiltersBtn");
        if (resetBtn) {
          resetBtn.addEventListener("click", function () {
            state.category = "All";
            state.search = "";
            if (searchInput) searchInput.value = "";
            filterTabs.forEach(function (t) {
              t.classList.toggle("is-active", t.getAttribute("data-wish-category") === "All");
            });
            renderWishlist();
          });
        }
        return;
      }

      grid.innerHTML = filtered.map(function (item) {
        var badgeClass = item.dealBadge ? "mv-tag mv-tag--deal" : "mv-tag";
        var badgeText = item.dealBadge || item.stock;

        return (
          '<article class="mv-card">' +
          '  <div class="mv-card-media">' +
          '    <img class="mv-card-cover" src="' + item.cover + '" alt="' + item.title + ' cover art" loading="lazy">' +
          '    <div class="mv-card-top-badges">' +
          '      <button type="button" class="mv-icon-btn" data-remove-wish="' + item.id + '" aria-label="Remove ' + item.title + ' from wishlist" title="Remove from wishlist">✕</button>' +
          '    </div>' +
          '  </div>' +
          '  <div class="mv-card-body">' +
          '    <div class="mv-card-meta-row">' +
          '      <span class="mv-card-author">' + item.category + '</span>' +
          '      <span class="' + badgeClass + '">' + badgeText + '</span>' +
          '    </div>' +
          '    <h3 class="mv-card-title">' + item.title + '</h3>' +
          '    <p class="mv-card-edition">' + item.author + ' · ' + item.edition + '</p>' +
          '    <div class="mv-price-row">' +
          '      <div class="mv-price-group">' +
          '        <span class="mv-price-current">' + formatPrice(item.price) + '</span>' +
          (item.oldPrice ? '<span class="mv-price-old">' + formatPrice(item.oldPrice) + '</span>' : "") +
          '      </div>' +
          '      <span class="mv-rating"><span>★</span> ' + item.rating.toFixed(1) + '</span>' +
          '    </div>' +
          '    <div class="mv-card-actions">' +
          '      <button type="button" class="mv-btn mv-btn-primary mv-btn-sm" data-move-cart="' + item.id + '">Move to Cart</button>' +
          '      <a class="mv-btn mv-btn-secondary mv-btn-sm" href="book-details.html?id=' + encodeURIComponent(item.id) + '">Details</a>' +
          '    </div>' +
          '  </div>' +
          '</article>'
        );
      }).join("");
    }

    filterTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        state.category = tab.getAttribute("data-wish-category") || "All";
        filterTabs.forEach(function (t) { t.classList.remove("is-active"); });
        tab.classList.add("is-active");
        renderWishlist();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        state.search = searchInput.value;
        renderWishlist();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        state.sort = sortSelect.value;
        renderWishlist();
      });
    }

    document.addEventListener("click", function (event) {
      var moveBtn = event.target.closest("[data-move-cart]");
      if (moveBtn) {
        var id = moveBtn.getAttribute("data-move-cart");
        var book = findBook(id);
        addToCart(id);
        removeFromWishlist(id, (book ? book.title : "Item") + " moved to Cart.");
        return;
      }

      var removeBtn = event.target.closest("[data-remove-wish]");
      if (removeBtn) {
        removeFromWishlist(removeBtn.getAttribute("data-remove-wish"));
        return;
      }

      var addBtn = event.target.closest("[data-add-wish]");
      if (addBtn) {
        var addId = addBtn.getAttribute("data-add-wish");
        var ids = getWishlistIds();
        if (ids.indexOf(addId) === -1) {
          ids.unshift(addId);
          saveWishlistIds(ids);
          renderWishlist();
          var addedBook = findBook(addId);
          showToast("Saved " + (addedBook ? addedBook.title : "title") + " to Wishlist.");
        }
      }
    });

    renderWishlist();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initSharedShell();
    initLibraryPage();
    initWishlistPage();
  });
})();
