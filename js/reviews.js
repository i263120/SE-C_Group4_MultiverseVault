/* ==========================================================================
   Multiverse Vault — Reader Reviews Page Script (Page 5)
   Handles rating summary & distribution, category/rating/search/sort filters,
   helpful voting persistence, and review submission with localStorage.
   ========================================================================== */

(function () {
  const USER_REVIEWS_KEY = 'mv_user_reviews';
  const VOTED_REVIEWS_KEY = 'mv_review_votes';
  const VOTE_COUNTS_KEY = 'mv_review_vote_counts';

  // Demo community reviews (local sample content)
  const SEED_REVIEWS = [
    {
      id: 'rev-astral-sovereign',
      reviewer: 'Amina Farooq',
      bookTitle: 'Astral Sovereign: Crown of the Ninth Veil, Vol. 1',
      category: 'comics',
      categoryLabel: 'Comics',
      rating: 5,
      date: '2026-11-25',
      displayDate: 'Nov 25, 2026',
      headline: 'Every splash page looks like an arcane tapestry',
      text: 'The metallic gold palette and crisp panel pacing make Vol. 1 impossible to put down. The hardcover binding opens flat so none of the double-page spreads lose detail.',
      helpful: 24,
      featured: true,
      isUserSubmitted: false
    },
    {
      id: 'rev-torii-eclipse',
      reviewer: 'Tariq Mahmood',
      bookTitle: 'Lanterns Beneath the Crescent Torii, Vol. 7',
      category: 'manga',
      categoryLabel: 'Manga',
      rating: 5,
      date: '2026-11-24',
      displayDate: 'Nov 24, 2026',
      headline: 'Quiet, atmospheric, and deeply moving',
      text: 'Haruto Takahashi builds incredible tension using mist and negative ink space alone. Volume 7 pays off mysteries planted all the way back in Volume 2.',
      helpful: 19,
      featured: true,
      isUserSubmitted: false
    },
    {
      id: 'rev-celestial-herbarium',
      reviewer: 'Zainab Raza',
      bookTitle: 'The Celestial Herbarium: Illuminated Omnibus',
      category: 'webtoons',
      categoryLabel: 'Webtoons & Novels',
      rating: 5,
      date: '2026-11-22',
      displayDate: 'Nov 22, 2026',
      headline: 'A gorgeous print adaptation for webtoon fans',
      text: 'Translating vertical-scroll pacing into printed spreads can feel awkward, but this omnibus reformats every chapter seamlessly and adds botanical lore notes.',
      helpful: 15,
      featured: false,
      isUserSubmitted: false
    },
    {
      id: 'rev-obsidian-vault',
      reviewer: 'Hamza Siddiqui',
      bookTitle: 'Chronicles of the Obsidian Vault, Issue #1',
      category: 'comics',
      categoryLabel: 'Comics',
      rating: 4,
      date: '2026-11-19',
      displayDate: 'Nov 19, 2026',
      headline: 'Strong mystery hook with clever worldbuilding',
      text: 'A brisk opening issue that introduces the archive rules quickly without drowning the reader in exposition. Excited to see where Issue #2 takes the apprentice.',
      helpful: 11,
      featured: false,
      isUserSubmitted: false
    },
    {
      id: 'rev-ashen-pagoda',
      reviewer: 'Bilal Qureshi',
      bookTitle: 'Blade of the Ashen Pagoda, Vol. 12',
      category: 'manga',
      categoryLabel: 'Manga',
      rating: 4,
      date: '2026-11-15',
      displayDate: 'Nov 15, 2026',
      headline: 'Sharp duel choreography from start to finish',
      text: 'The tournament climax delivers kinetic action lines and emotional stakes. One minor cliffhanger feels sudden, but the artwork carries every chapter.',
      helpful: 8,
      featured: false,
      isUserSubmitted: false
    },
    {
      id: 'rev-starlight-scroll',
      reviewer: 'Maya Lin',
      bookTitle: 'Starlight Scroll of Aethelgard, Season 3 Print',
      category: 'webtoons',
      categoryLabel: 'Webtoons & Novels',
      rating: 3,
      date: '2026-11-10',
      displayDate: 'Nov 10, 2026',
      headline: 'Beautiful concept sketches, slower middle chapters',
      text: 'The 18-page art gallery at the back is worth the cover price for collectors, though the political arc in the middle chapters moves at a slower pace.',
      helpful: 6,
      featured: false,
      isUserSubmitted: false
    }
  ];

  const CATEGORY_LABELS = {
    comics: 'Comics',
    manga: 'Manga',
    webtoons: 'Webtoons & Novels'
  };

  const RATING_WORDS = {
    1: '1 / 5 — Poor',
    2: '2 / 5 — Fair',
    3: '3 / 5 — Good',
    4: '4 / 5 — Great',
    5: '5 / 5 — Masterpiece'
  };

  const state = {
    category: 'all',
    minRating: 0,
    search: '',
    sort: 'newest',
    selectedRating: 5
  };

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function readStorageJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed !== null && typeof parsed === 'object' ? parsed : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeStorageJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function getUserReviews() {
    const saved = readStorageJson(USER_REVIEWS_KEY, []);
    return Array.isArray(saved) ? saved : [];
  }

  function getVotedMap() {
    const map = readStorageJson(VOTED_REVIEWS_KEY, {});
    return Array.isArray(map) ? {} : map;
  }

  function getVoteCountsMap() {
    const map = readStorageJson(VOTE_COUNTS_KEY, {});
    return Array.isArray(map) ? {} : map;
  }

  function getAllReviews() {
    const voteCounts = getVoteCountsMap();
    const userReviews = getUserReviews();
    const combined = userReviews.concat(SEED_REVIEWS);

    return combined.map(function (rev) {
      const storedCount = Object.prototype.hasOwnProperty.call(voteCounts, rev.id)
        ? Number(voteCounts[rev.id])
        : Number(rev.helpful) || 0;

      return Object.assign({}, rev, {
        helpful: storedCount
      });
    });
  }

  function renderStarsText(rating) {
    const clamped = Math.max(1, Math.min(5, Math.round(Number(rating) || 0)));
    return '\u2605'.repeat(clamped) + '\u2606'.repeat(5 - clamped);
  }

  function updateRatingSummary() {
    const reviews = getAllReviews();
    const total = reviews.length;

    const avgEl = document.getElementById('rv-average-score');
    const starsEl = document.getElementById('rv-average-stars');
    const totalEl = document.getElementById('rv-total-reviews');
    const distEl = document.getElementById('rv-distribution');

    if (!avgEl || !starsEl || !totalEl || !distEl) return;

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach(function (rev) {
      const r = Math.max(1, Math.min(5, Math.round(Number(rev.rating) || 0)));
      counts[r] += 1;
      sum += r;
    });

    const avg = total > 0 ? sum / total : 0;
    avgEl.textContent = avg.toFixed(1);
    starsEl.textContent = renderStarsText(avg);
    totalEl.textContent = 'Based on ' + total + ' ' + (total === 1 ? 'review' : 'reviews');

    distEl.innerHTML = [5, 4, 3, 2, 1].map(function (star) {
      const count = counts[star];
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return (
        '<div class="rv-dist-row">' +
          '<span class="rv-dist-label">' + star + ' Star' + (star === 1 ? '' : 's') + '</span>' +
          '<div class="rv-dist-track" aria-hidden="true">' +
            '<div class="rv-dist-fill" style="width: ' + pct + '%;"></div>' +
          '</div>' +
          '<span class="rv-dist-count">' + count + '</span>' +
        '</div>'
      );
    }).join('');
  }

  function renderFeaturedReviews() {
    const container = document.getElementById('rv-featured-grid');
    if (!container) return;

    const featured = getAllReviews().filter(function (rev) {
      return Boolean(rev.featured);
    }).slice(0, 2);

    container.innerHTML = featured.map(function (rev) {
      return (
        '<article class="rv-featured-card">' +
          '<div class="rv-featured-top">' +
            '<span class="mv-badge mv-badge-gold">Featured Demo Review</span>' +
            '<span class="rv-card-stars" aria-label="Rated ' + rev.rating + ' out of 5 stars">' +
              renderStarsText(rev.rating) +
            '</span>' +
          '</div>' +
          '<h3 class="rv-card-headline">' + escapeHtml(rev.headline) + '</h3>' +
          '<blockquote class="rv-quote">&ldquo;' + escapeHtml(rev.text) + '&rdquo;</blockquote>' +
          '<div class="rv-featured-footer">' +
            '<span><strong class="text-cream">' + escapeHtml(rev.reviewer) + '</strong> on <span class="text-gold">' + escapeHtml(rev.bookTitle) + '</span></span>' +
            '<span class="rv-review-date">' + escapeHtml(rev.displayDate) + '</span>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function getFilteredReviews() {
    const query = state.search.trim().toLowerCase();
    const all = getAllReviews();

    const filtered = all.filter(function (rev) {
      const matchesCat = state.category === 'all' || rev.category === state.category;
      const matchesRating = Number(rev.rating) >= state.minRating;
      const matchesQuery = !query || (
        rev.bookTitle.toLowerCase().includes(query) ||
        rev.reviewer.toLowerCase().includes(query) ||
        rev.headline.toLowerCase().includes(query) ||
        rev.text.toLowerCase().includes(query) ||
        rev.categoryLabel.toLowerCase().includes(query)
      );
      return matchesCat && matchesRating && matchesQuery;
    });

    filtered.sort(function (a, b) {
      if (state.sort === 'helpful') return b.helpful - a.helpful || b.date.localeCompare(a.date);
      if (state.sort === 'highest') return b.rating - a.rating || b.helpful - a.helpful;
      if (state.sort === 'lowest') return a.rating - b.rating || b.date.localeCompare(a.date);
      return b.date.localeCompare(a.date);
    });

    return filtered;
  }

  function renderReviewsFeed() {
    const grid = document.getElementById('reviews-grid');
    const emptyEl = document.getElementById('reviews-empty');
    const countEl = document.getElementById('reviews-count');
    if (!grid || !emptyEl || !countEl) return;

    const allCount = getAllReviews().length;
    const items = getFilteredReviews();
    const votedMap = getVotedMap();

    countEl.innerHTML = 'Showing <strong>' + items.length + '</strong> of <strong>' + allCount + '</strong> reviews';

    if (items.length === 0) {
      grid.innerHTML = '';
      emptyEl.hidden = false;
      return;
    }

    emptyEl.hidden = true;

    grid.innerHTML = items.map(function (rev) {
      const isVoted = Boolean(votedMap[rev.id]);
      const originLabel = rev.isUserSubmitted ? 'Submitted locally (this browser)' : 'Sample demo review';

      return (
        '<article class="mv-card rv-card">' +
          '<div class="mv-card-body">' +
            '<div class="rv-card-header">' +
              '<div>' +
                '<div class="rv-reviewer-name">' + escapeHtml(rev.reviewer) + '</div>' +
                '<div class="rv-review-date">' + escapeHtml(rev.displayDate) + '</div>' +
              '</div>' +
              '<div class="rv-card-stars" aria-label="Rated ' + rev.rating + ' out of 5 stars">' +
                renderStarsText(rev.rating) +
              '</div>' +
            '</div>' +
            '<div class="rv-book-ref">' +
              '<span class="rv-book-title">' + escapeHtml(rev.bookTitle) + '</span>' +
              '<span class="mv-badge mv-badge-gold">' + escapeHtml(rev.categoryLabel) + '</span>' +
            '</div>' +
            '<h3 class="rv-card-headline">' + escapeHtml(rev.headline) + '</h3>' +
            '<p class="rv-card-text">' + escapeHtml(rev.text) + '</p>' +
            '<div class="rv-card-footer">' +
              '<span class="rv-origin-tag">' + originLabel + '</span>' +
              '<button type="button" class="btn btn-outline btn-sm btn-helpful' + (isVoted ? ' is-voted' : '') + '" data-helpful-id="' + escapeHtml(rev.id) + '" aria-pressed="' + String(isVoted) + '">' +
                'Helpful (' + rev.helpful + ')' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function toggleHelpfulVote(reviewId) {
    const all = getAllReviews();
    const target = all.find(function (rev) { return rev.id === reviewId; });
    if (!target) return;

    const votedMap = getVotedMap();
    const voteCounts = getVoteCountsMap();
    const currentlyVoted = Boolean(votedMap[reviewId]);

    const currentCount = Number(target.helpful) || 0;
    const nextCount = currentlyVoted ? Math.max(0, currentCount - 1) : currentCount + 1;

    if (currentlyVoted) {
      delete votedMap[reviewId];
    } else {
      votedMap[reviewId] = true;
    }
    voteCounts[reviewId] = nextCount;

    writeStorageJson(VOTED_REVIEWS_KEY, votedMap);
    writeStorageJson(VOTE_COUNTS_KEY, voteCounts);

    renderReviewsFeed();
  }

  function resetReviewFilters() {
    state.category = 'all';
    state.minRating = 0;
    state.search = '';
    state.sort = 'newest';

    const searchInput = document.getElementById('review-search');
    const ratingSelect = document.getElementById('review-rating-filter');
    const sortSelect = document.getElementById('review-sort');

    if (searchInput) searchInput.value = '';
    if (ratingSelect) ratingSelect.value = '0';
    if (sortSelect) sortSelect.value = 'newest';

    document.querySelectorAll('[data-review-category]').forEach(function (btn) {
      const isAll = btn.getAttribute('data-review-category') === 'all';
      btn.classList.toggle('is-active', isAll);
      btn.setAttribute('aria-pressed', String(isAll));
    });

    renderReviewsFeed();
  }

  function initFiltersAndFeed() {
    const categoryButtons = document.querySelectorAll('[data-review-category]');
    const ratingSelect = document.getElementById('review-rating-filter');
    const sortSelect = document.getElementById('review-sort');
    const searchInput = document.getElementById('review-search');
    const resetBtn = document.getElementById('reset-review-filters');

    categoryButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.category = btn.getAttribute('data-review-category') || 'all';
        categoryButtons.forEach(function (item) {
          const active = item === btn;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        renderReviewsFeed();
      });
    });

    if (ratingSelect) {
      ratingSelect.addEventListener('change', function () {
        state.minRating = Number(ratingSelect.value) || 0;
        renderReviewsFeed();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        state.sort = sortSelect.value;
        renderReviewsFeed();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.search = searchInput.value;
        renderReviewsFeed();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', resetReviewFilters);
    }

    document.addEventListener('click', function (event) {
      const helpfulBtn = event.target.closest('[data-helpful-id]');
      if (helpfulBtn) {
        toggleHelpfulVote(helpfulBtn.getAttribute('data-helpful-id'));
      }
    });

    updateRatingSummary();
    renderFeaturedReviews();
    renderReviewsFeed();
  }

  function initStarPicker() {
    const starButtons = document.querySelectorAll('[data-star-value]');
    const ratingInput = document.getElementById('review-rating-value');
    const ratingText = document.getElementById('review-rating-text');

    function applyStarSelection(value) {
      state.selectedRating = value;
      if (ratingInput) ratingInput.value = String(value);
      if (ratingText) ratingText.textContent = RATING_WORDS[value] || (value + ' / 5');

      starButtons.forEach(function (btn) {
        const starVal = Number(btn.getAttribute('data-star-value'));
        const isLit = starVal <= value;
        btn.classList.toggle('is-active', isLit);
        btn.textContent = isLit ? '\u2605' : '\u2606';
        btn.setAttribute('aria-checked', String(starVal === value));
      });
    }

    starButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const val = Number(btn.getAttribute('data-star-value')) || 5;
        applyStarSelection(val);
      });
    });

    applyStarSelection(5);
    return applyStarSelection;
  }

  function formatDisplayDate(dateObj) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const m = months[dateObj.getMonth()];
    const d = String(dateObj.getDate()).padStart(2, '0');
    const y = dateObj.getFullYear();
    return m + ' ' + d + ', ' + y;
  }

  function initReviewForm(applyStarSelection) {
    const form = document.getElementById('review-submit-form');
    if (!form) return;

    const nameInput = document.getElementById('review-author');
    const bookInput = document.getElementById('review-book');
    const categorySelect = document.getElementById('review-category');
    const headlineInput = document.getElementById('review-headline');
    const bodyInput = document.getElementById('review-body');
    const ratingInput = document.getElementById('review-rating-value');

    const nameError = document.getElementById('review-author-error');
    const bookError = document.getElementById('review-book-error');
    const categoryError = document.getElementById('review-category-error');
    const headlineError = document.getElementById('review-headline-error');
    const bodyError = document.getElementById('review-body-error');
    const statusBanner = document.getElementById('review-form-status');

    function setFieldError(inputEl, errorEl, message) {
      if (errorEl) errorEl.textContent = message;
      if (inputEl) inputEl.classList.toggle('is-invalid', Boolean(message));
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (statusBanner) {
        statusBanner.textContent = '';
        statusBanner.className = 'rv-status-banner';
      }

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const bookVal = bookInput ? bookInput.value.trim() : '';
      const categoryVal = categorySelect ? categorySelect.value : '';
      const headlineVal = headlineInput ? headlineInput.value.trim() : '';
      const bodyVal = bodyInput ? bodyInput.value.trim() : '';
      const ratingVal = Number(ratingInput ? ratingInput.value : state.selectedRating);

      let valid = true;

      if (nameVal.length < 2) {
        setFieldError(nameInput, nameError, 'Please enter your name (at least 2 characters).');
        valid = false;
      } else {
        setFieldError(nameInput, nameError, '');
      }

      if (bookVal.length < 2) {
        setFieldError(bookInput, bookError, 'Please enter the book or comic title.');
        valid = false;
      } else {
        setFieldError(bookInput, bookError, '');
      }

      if (!CATEGORY_LABELS[categoryVal]) {
        setFieldError(categorySelect, categoryError, 'Please select a category.');
        valid = false;
      } else {
        setFieldError(categorySelect, categoryError, '');
      }

      if (headlineVal.length < 3) {
        setFieldError(headlineInput, headlineError, 'Please add a short review headline (at least 3 characters).');
        valid = false;
      } else {
        setFieldError(headlineInput, headlineError, '');
      }

      if (bodyVal.length < 15) {
        setFieldError(bodyInput, bodyError, 'Please write at least 15 characters sharing your thoughts.');
        valid = false;
      } else {
        setFieldError(bodyInput, bodyError, '');
      }

      if (!valid || ratingVal < 1 || ratingVal > 5) {
        if (statusBanner) {
          statusBanner.textContent = 'Please complete all required fields before publishing your review.';
          statusBanner.className = 'rv-status-banner is-visible is-error';
        }
        return;
      }

      const now = new Date();
      const newReview = {
        id: 'user-rev-' + now.getTime(),
        reviewer: nameVal,
        bookTitle: bookVal,
        category: categoryVal,
        categoryLabel: CATEGORY_LABELS[categoryVal],
        rating: ratingVal,
        date: now.toISOString(),
        displayDate: formatDisplayDate(now),
        headline: headlineVal,
        text: bodyVal,
        helpful: 0,
        featured: false,
        isUserSubmitted: true
      };

      const saved = getUserReviews();
      saved.unshift(newReview);
      writeStorageJson(USER_REVIEWS_KEY, saved);

      updateRatingSummary();
      renderReviewsFeed();

      form.reset();
      if (typeof applyStarSelection === 'function') {
        applyStarSelection(5);
      }

      if (statusBanner) {
        statusBanner.textContent = 'Thank you, ' + nameVal + '! Your ' + ratingVal + '-star review for "' + bookVal + '" has been saved locally and added to the feed.';
        statusBanner.className = 'rv-status-banner is-visible is-success';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFiltersAndFeed();
    const applyStars = initStarPicker();
    initReviewForm(applyStars);
  });
})();
