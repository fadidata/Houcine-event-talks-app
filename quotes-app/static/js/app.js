document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentCategory = 'All';
  let searchQuery = '';
  let currentHeroQuote = null;
  let debounceTimer = null;

  // DOM Elements
  const heroQuoteText = document.getElementById('heroQuoteText');
  const heroAuthor = document.getElementById('heroAuthor');
  const heroCategory = document.getElementById('heroCategory');
  const newQuoteBtn = document.getElementById('newQuoteBtn');
  const copyHeroBtn = document.getElementById('copyHeroBtn');

  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const categoriesWrapper = document.getElementById('categoriesWrapper');

  const galleryTitle = document.getElementById('galleryTitle');
  const galleryCount = document.getElementById('galleryCount');
  const quotesGrid = document.getElementById('quotesGrid');
  const emptyState = document.getElementById('emptyState');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const toast = document.getElementById('toast');

  // --- API Functions ---

  async function fetchRandomQuote(category = 'All') {
    try {
      heroQuoteText.style.opacity = '0.3';
      const url = category && category !== 'All' 
        ? `/api/quote/random?category=${encodeURIComponent(category)}`
        : '/api/quote/random';

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch random quote');
      const quote = await res.json();
      currentHeroQuote = quote;

      setTimeout(() => {
        heroQuoteText.textContent = `“${quote.quote}”`;
        heroAuthor.textContent = `— ${quote.author}`;
        heroCategory.textContent = quote.category;
        heroQuoteText.style.opacity = '1';
      }, 150);
    } catch (err) {
      console.error(err);
      heroQuoteText.style.opacity = '1';
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const categories = await res.json();
      renderCategories(categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }

  async function fetchQuotes() {
    try {
      const params = new URLSearchParams();
      if (currentCategory && currentCategory !== 'All') {
        params.append('category', currentCategory);
      }
      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim());
      }

      const res = await fetch(`/api/quotes?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch quotes');
      const data = await res.json();
      renderQuotesGrid(data.quotes);
    } catch (err) {
      console.error('Error fetching quotes:', err);
    }
  }

  // --- Rendering ---

  function renderCategories(categories) {
    categoriesWrapper.innerHTML = '';
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `cat-pill ${cat.name === currentCategory ? 'active' : ''}`;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', cat.name === currentCategory ? 'true' : 'false');
      btn.innerHTML = `
        <span>${escapeHtml(cat.name)}</span>
        <span class="pill-count">${cat.count}</span>
      `;
      btn.addEventListener('click', () => {
        selectCategory(cat.name);
      });
      categoriesWrapper.appendChild(btn);
    });
  }

  function renderQuotesGrid(quotes) {
    quotesGrid.innerHTML = '';

    const count = quotes.length;
    galleryCount.textContent = count === 1 ? 'Showing 1 quote' : `Showing ${count} quotes`;

    if (currentCategory !== 'All' && searchQuery) {
      galleryTitle.textContent = `Quotes in "${currentCategory}" matching "${searchQuery}"`;
    } else if (currentCategory !== 'All') {
      galleryTitle.textContent = `${currentCategory} Quotes`;
    } else if (searchQuery) {
      galleryTitle.textContent = `Search results for "${searchQuery}"`;
    } else {
      galleryTitle.textContent = 'All Quotes';
    }

    if (count === 0) {
      emptyState.classList.remove('hidden');
      quotesGrid.classList.add('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    quotesGrid.classList.remove('hidden');

    quotes.forEach(quote => {
      const card = document.createElement('div');
      card.className = 'quote-card';
      card.innerHTML = `
        <div>
          <div class="card-top">
            <span class="card-category">${escapeHtml(quote.category)}</span>
            <button class="card-copy-btn" title="Copy quote" aria-label="Copy quote">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
          <blockquote class="card-quote">“${escapeHtml(quote.quote)}”</blockquote>
        </div>
        <cite class="card-author">— ${escapeHtml(quote.author)}</cite>
      `;

      // Copy individual quote
      const copyBtn = card.querySelector('.card-copy-btn');
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(`"${quote.quote}" — ${quote.author}`);
      });

      quotesGrid.appendChild(card);
    });
  }

  function selectCategory(categoryName) {
    currentCategory = categoryName;

    // Update active pill styling
    document.querySelectorAll('.cat-pill').forEach(btn => {
      const isCurrent = btn.textContent.trim().startsWith(categoryName);
      btn.classList.toggle('active', isCurrent);
      btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
    });

    fetchQuotes();
    fetchRandomQuote(currentCategory);
  }

  // --- Utilities ---

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  let toastTimeout = null;
  function showToast(message = 'Copied to clipboard!') {
    toast.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2200);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Quote copied to clipboard!');
      }).catch(err => {
        console.error('Clipboard copy error:', err);
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Quote copied to clipboard!');
    } catch (e) {
      showToast('Could not copy to clipboard');
    }
    document.body.removeChild(textArea);
  }

  // --- Event Listeners ---

  newQuoteBtn.addEventListener('click', () => {
    fetchRandomQuote(currentCategory);
  });

  copyHeroBtn.addEventListener('click', () => {
    if (currentHeroQuote) {
      copyToClipboard(`"${currentHeroQuote.quote}" — ${currentHeroQuote.author}`);
    }
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchQuotes();
    }, 200);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    searchInput.focus();
    fetchQuotes();
  });

  resetFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    selectCategory('All');
  });

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement;
    const isInputActive = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

    if (e.key === 'Escape' && isInputActive) {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.classList.add('hidden');
      searchInput.blur();
      fetchQuotes();
    } else if (!isInputActive && (e.code === 'Space' || e.key.toLowerCase() === 'r')) {
      e.preventDefault();
      fetchRandomQuote(currentCategory);
    }
  });

  // Initial Load
  fetchCategories();
  fetchRandomQuote('All');
  fetchQuotes();
});
