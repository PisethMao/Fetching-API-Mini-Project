/**
 * @typedef {Object} Book
 * @property {string} title
 * @property {string} subtitle
 * @property {string} isbn13
 * @property {string} price
 * @property {string} image
 * @property {string} url
 */
/**
 * @typedef {Object} BookSearchResponse
 * @property {string} error
 * @property {string} total
 * @property {string} page
 * @property {Book[]} books
 */
const API = "https://api.itbook.store/1.0";
const DETAIL_PAGE = "/pages/categories/categories-detail-page.html";
const grid = document.getElementById("bookGrid");
/** @type {HTMLTemplateElement|null} */
const tpl = document.getElementById("bookCardTemplate");
const PLACEHOLDER_IMG = "../assets/images/book-cover-placeholder-svg.png";
const searchInput = /** @type {HTMLInputElement|null} */ (
  document.getElementById("searchInput")
);
const spinner = document.getElementById("searchSpinner");
let defaultBooks = /** @type {Book[]} */ ([]);
/** @type {Map<string, BookSearchResponse>} */
// use for key-value like map in java
const searchCache = new Map();
/** @type {AbortController | null} */
let currentSearchCtrl = null;
function showSpinner(show) {
  if (!spinner) {
    return;
  }
  spinner.classList.toggle("hidden", !show);
}
// when search empty display this ui
function showEmpty(tip = "Try searching with different keywords.") {
  if (!grid) {
    return;
  }
  grid.innerHTML = `
    <section class="col-span-full">
      <section class="mx-auto max-w-md text-center rounded-2xl p-10">
        <span class="flex justify-center text-6xl mb-4">📚</span>
        <h3 class="text-2xl font-semibold text-white">No books found</h3>
        <p class="mt-3 text-md text-white/70 font-semibold">${tip}</p>
      </section>
    </section>`;
}
function debounce(fn, wait = 400) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
function filterLocalBooks(q) {
  const qq = (q || "").toLowerCase();
  return defaultBooks.filter(
    (b) =>
      (b.title || "").toLowerCase().includes(qq) ||
      (b.subtitle || "").toLowerCase().includes(qq)
  );
}
/** @param {Book[]} books */
function renderBooks(books) {
  if (!grid || !tpl) {
    return;
  }
  grid.innerHTML = "";
  if (!books || books.length === 0) {
    showEmpty();
    return;
  }
  const frag = document.createDocumentFragment();
  for (const b of books) {
    /** @type {DocumentFragment} */
    const node = tpl.content.cloneNode(true);
    /** @type {HTMLImageElement|null} */
    const imgEl = node.querySelector("[data-img]");
    /** @type {HTMLElement|null} */
    const titleEl = node.querySelector("[data-title]");
    /** @type {HTMLElement|null} */
    const subEl = node.querySelector("[data-subtitle]");
    /** @type {HTMLElement|null} */
    const priceEl = node.querySelector("[data-price]");
    /** @type {HTMLAnchorElement|null} */
    const linkEl = node.querySelector("[data-link]");
    if (imgEl) {
      imgEl.src =
        b.image && b.image.startsWith("http") ? b.image : PLACEHOLDER_IMG;
      imgEl.alt = b.title || "Book Cover";
      imgEl.addEventListener(
        "error",
        () => {
          imgEl.src = PLACEHOLDER_IMG;
        },
        { once: true }
      );
    }
    if (titleEl) {
      titleEl.textContent = b.title || "Untitled";
    }
    if (subEl) {
      subEl.textContent = b.subtitle || "";
    }
    if (priceEl) {
      priceEl.textContent = b.price && b.price.trim() ? b.price : "Free";
    }
    if (linkEl) {
      const href = b.isbn13
        ? `${DETAIL_PAGE}?isbn=${encodeURIComponent(b.isbn13)}`
        : b.url || "#";
      linkEl.href = href;
    }
    const favBtn = node.querySelector(".fav-btn");
    const favIcon = favBtn?.querySelector("i, [data-fav-icon]");
    if (favIcon) {
      favIcon.classList.toggle("text-red-500", isFav(b.isbn13));
    }
    if (favBtn) {
      favBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFav(b.isbn13);
        if (favIcon) {
          favIcon.classList.toggle("text-red-500", isFav(b.isbn13));
        }
        updateFavCount();
      });
    }
    frag.appendChild(node);
  }
  grid.appendChild(frag);
  updateFavCount();
}
/**
 * @param {string} query
 * @param {AbortSignal} signal
 * @returns {Promise<BookSearchResponse>}
 */
async function searchRemoteByTitle(query, signal) {
  const key = query.trim().toLowerCase();
  if (searchCache.has(key)) {
    return searchCache.get(key);
  }
  const res = await fetch(`${API}/search/${encodeURIComponent(query)}`, {
    signal,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = /** @type {BookSearchResponse} */ (await res.json());
  searchCache.set(key, data);
  return data;
}
async function loadDefault() {
  if (!grid) {
    return;
  }
  grid.innerHTML = `<p class="text-purple-200/80">Loading...</p>`;
  try {
    const res = await fetch(`${API}/new`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const { books = [] } = await res.json();
    defaultBooks = books || [];
    renderBooks(defaultBooks);
  } catch {
    grid.innerHTML = `<p class='text-red-400'>Failed to load defaults.</p>`;
  }
}
function attachTitleSearch() {
  if (!searchInput) {
    return;
  }
  const handleSearch = async () => {
    const q = searchInput.value.trim();
    if (!q) {
      showSpinner(false);
      renderBooks(defaultBooks);
      return;
    }
    if (q.length < 3) {
      showSpinner(false);
      renderBooks(filterLocalBooks(q));
      return;
    }
    if (currentSearchCtrl) {
      currentSearchCtrl.abort();
    }
    currentSearchCtrl = new AbortController();
    const { signal } = currentSearchCtrl;
    showSpinner(true);
    try {
      const { books = [] } = await searchRemoteByTitle(q, signal);
      const results = books && books.length ? books : filterLocalBooks(q);
      renderBooks(results);
    } catch (err) {
      if (err && err.name === "AbortError") {
        return;
      }
      console.error(err);
      showEmpty("Check your connection or try again.");
    } finally {
      showSpinner(false);
    }
  };
  searchInput.addEventListener("input", debounce(handleSearch, 400));
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchInput.value = "";
      renderBooks(defaultBooks);
      showSpinner(false);
    }
  });
}
attachTitleSearch();
loadDefault();
