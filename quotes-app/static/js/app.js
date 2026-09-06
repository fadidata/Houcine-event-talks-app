document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentCategory = 'All';
  let searchQuery = '';
  let currentHeroQuote = null;
  let displayedQuotes = [];
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
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const quotesGrid = document.getElementById('quotesGrid');
  const emptyState = document.getElementById('emptyState');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const toast = document.getElementById('toast');

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeToggleText = document.getElementById('themeToggleText');
  const sunIcon = themeToggleBtn ? themeToggleBtn.querySelector('.sun-icon') : null;
  const moonIcon = themeToggleBtn ? themeToggleBtn.querySelector('.moon-icon') : null;

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
    displayedQuotes = quotes;
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
      if (exportCsvBtn) exportCsvBtn.disabled = true;
      return;
    }

    if (exportCsvBtn) exportCsvBtn.disabled = false;
    emptyState.classList.add('hidden');
    quotesGrid.classList.remove('hidden');

    quotes.forEach(quote => {
      const card = document.createElement('div');
      card.className = 'quote-card';
      card.innerHTML = `
        <div>
          <div class="card-top">
            <span class="card-category">${escapeHtml(quote.category)}</span>
            <button class="card-copy-btn" title="Copy quote to clipboard" aria-label="Copy quote to clipboard">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span class="copy-text">Copy</span>
            </button>
          </div>
          <blockquote class="card-quote">“${escapeHtml(quote.quote)}”</blockquote>
        </div>
        <cite class="card-author">— ${escapeHtml(quote.author)}</cite>
      `;

      // Copy individual quote
      const copyBtn = card.querySelector('.card-copy-btn');
      const copyText = copyBtn.querySelector('.copy-text');
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(`"${quote.quote}" — ${quote.author}`);
        copyBtn.classList.add('copied');
        copyText.textContent = '✓ Copied';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyText.textContent = 'Copy';
        }, 1500);
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

  function exportToCsv() {
    if (!displayedQuotes || displayedQuotes.length === 0) {
      showToast('No quotes to export!');
      return;
    }

    const headers = ['ID', 'Quote', 'Author', 'Category'];
    const rows = displayedQuotes.map(q => [
      q.id,
      `"${(q.quote || '').replace(/"/g, '""')}"`,
      `"${(q.author || '').replace(/"/g, '""')}"`,
      `"${(q.category || '').replace(/"/g, '""')}"`
    ]);

    // Include UTF-8 BOM for Excel compatibility with special characters
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const safeCat = currentCategory && currentCategory !== 'All' 
      ? currentCategory.toLowerCase().replace(/[^a-z0-9]/g, '_') 
      : 'all';
    const filename = `wisdom_quotes_${safeCat}.csv`;

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${displayedQuotes.length} quotes to ${filename}!`);
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', exportToCsv);
  }

  // --- Theme Toggling ---
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wisdom_theme', theme);

    if (theme === 'light') {
      if (themeToggleText) themeToggleText.textContent = 'Dark Mode';
      if (sunIcon) sunIcon.classList.remove('hidden');
      if (moonIcon) moonIcon.classList.add('hidden');
    } else {
      if (themeToggleText) themeToggleText.textContent = 'Light Mode';
      if (sunIcon) sunIcon.classList.add('hidden');
      if (moonIcon) moonIcon.classList.remove('hidden');
    }
  }

  // Initialize theme from localStorage or default to dark
  const savedTheme = localStorage.getItem('wisdom_theme') || 'dark';
  setTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

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
