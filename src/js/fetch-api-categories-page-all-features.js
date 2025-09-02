const API = "https://api.itbook.store/1.0";
const grid = document.getElementById("categoryList");
/** @type {HTMLTemplateElement|null} */
const tpl = document.getElementById("categoryGrid");
const chip = document.querySelector("[data-cat-chip]");
const catIcon = document.querySelector("[data-cat-icon]");
const catTitle = document.querySelector("[data-cat-title]");
const catSubtitle = document.querySelector("[data-cat-subtitle]");
const FAV_KEY = "bookverse:favorites";
const getFavs = () => {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  } catch {
    return [];
  }
};
const saveFavs = (list) => localStorage.setItem(FAV_KEY, JSON.stringify(list));
const isFav = (id) => getFavs().some((b) => b.id === id);
function toggleFav(id) {
  const list = getFavs();
  const i = list.findIndex((b) => b.id === id);
  if (i >= 0) {
    list.splice(i, 1);
  } else {
    list.push({ id });
  }
  saveFavs(list);
  updateFavCount();
}
function updateFavCount() {
  const n = getFavs().length;
  document
    .querySelectorAll("[data-fav-count]")
    .forEach((el) => (el.textContent = String(n)));
}
window.addEventListener("storage", (e) => {
  if (e.key === FAV_KEY) {
    updateFavCount();
  }
});
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
 * @typedef {Object} SearchResponse
 * @property {string} error
 * @property {string} total
 * @property {string} page
 * @property {Book[]} books
 */
const CATEGORY_UI = {
  programming: {
    icon: "fa-code",
    title: "Programming",
    subtitle: "Discover amazing programming books",
    query: "javascript",
    btnClasses: [
      "bg-gradient-to-r",
      "from-blue-400",
      "to-blue-600",
      "text-white",
      "shadow-sm",
    ],
    chipClass: ["bg-gradient-to-r", "from-blue-400", "to-blue-600"],
    priceBadge: ["bg-gradient-to-r", "from-blue-400", "to-blue-600"],
  },
  design: {
    icon: "fa-palette",
    title: "Design",
    subtitle: "Discover amazing design books",
    query: "design",
    btnClasses: [
      "bg-gradient-to-r",
      "from-rose-400",
      "to-rose-600",
      "text-white",
      "shadow-sm",
    ],
    chipClass: ["bg-gradient-to-r", "from-rose-400", "to-rose-600"],
    priceBadge: ["bg-gradient-to-r", "from-rose-400", "to-rose-600"],
  },
  business: {
    icon: "fa-briefcase",
    title: "Business",
    subtitle: "Discover amazing design books",
    query: "business",
    btnClasses: [
      "bg-gradient-to-r",
      "from-green-400",
      "to-green-600",
      "text-white",
      "shadow-sm",
    ],
    chipClass: ["bg-gradient-to-r", "from-green-400", "to-green-600"],
    priceBadge: ["bg-gradient-to-r", "from-green-400", "to-green-600"],
  },
  science: {
    icon: "fa-brain",
    title: "Science",
    subtitle: "Discover amazing design books",
    query: "science",
    btnClasses: [
      "bg-gradient-to-r",
      "from-purple-400",
      "to-purple-600",
      "text-white",
      "shadow-sm",
    ],
    chipClass: ["bg-gradient-to-r", "from-purple-400", "to-purple-600"],
    priceBadge: ["bg-gradient-to-r", "from-purple-400", "to-purple-600"],
  },
  gaming: {
    icon: "fa-gamepad",
    title: "Gaming",
    subtitle: "Discover amazing design books",
    query: "gaming",
    btnClasses: [
      "bg-gradient-to-r",
      "from-orange-500",
      "to-red-500",
      "text-white",
      "shadow-sm",
    ],
    chipClass: ["bg-gradient-to-r", "from-orange-500", "to-red-500"],
    priceBadge: ["bg-gradient-to-r", "from-orange-500", "to-red-500"],
  },
  music: {
    icon: "fa-music",
    title: "Music",
    subtitle: "Discover amazing design books",
    query: "music",
    btnClasses: [
      "bg-gradient-to-r",
      "from-blue-500",
      "to-purple-500",
      "text-white",
      "shadow-sm",
    ],
    chipClass: ["bg-gradient-to-r", "from-blue-500", "to-purple-500"],
    priceBadge: ["bg-gradient-to-r", "from-blue-500", "to-purple-500"],
  },
  photography: {
    icon: "fa-camera",
    title: "Photography",
    subtitle: "Discover amazing design books",
    query: "photography",
    btnClasses: [
      "bg-gradient-to-r",
      "from-teal-500",
      "to-cyan-500",
      "text-white",
      "shadow-sm",
    ],
    chipClass: ["bg-gradient-to-r", "from-teal-500", "to-cyan-500"],
    priceBadge: ["bg-gradient-to-r", "from-teal-500", "to-cyan-500"],
  },
  general: {
    icon: "fa-book",
    title: "General",
    subtitle: "Discover amazing design books",
    query: "general",
    btnClasses: [
      "bg-gradient-to-r",
      "from-gray-400",
      "to-gray-600",
      "text-white",
      "shadow-sm",
    ],
    chipClass: ["bg-gradient-to-r", "from-gray-400", "to-gray-600"],
    priceBadge: ["bg-gradient-to-r", "from-gray-400", "to-gray-600"],
  },
};
/** @returns {Promise<Book[]>} */
async function fetchBooksByQuery(query, page = 1) {
  const res = await fetch(`${API}/search/${encodeURIComponent(query)}/${page}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch books for ${query} (HTTP ${res.status})`);
  }
  /** @type {SearchResponse} */
  const data = await res.json();
  return Array.isArray(data.books) ? data.books.slice(0, 12) : [];
}
/** @param {Book[]} books */
function renderBooks(books = []) {
  if (!grid || !tpl) {
    return;
  }
  grid.innerHTML = "";
  if (!books.length) {
    grid.innerHTML = `<p class="text-purple-200/80">No results found.</p>`;
    return;
  }
  const ALL_PRICE_CLASSES = new Set();
  Object.values(CATEGORY_UI).forEach((m) =>
    m.priceBadge.forEach((c) => ALL_PRICE_CLASSES.add(c))
  );
  const frag = document.createDocumentFragment();
  for (const b of books) {
    /** @type {DocumentFragment} */
    const node = /** @type {DocumentFragment} */ (tpl.content.cloneNode(true));
    const img = node.querySelector("[data-img]");
    if (img) {
      img.src = b.image || "";
      img.alt = b.title || "Book Cover";
    }
    const titleEl = node.querySelector("[data-title]");
    if (titleEl) {
      titleEl.textContent = b.title || "Untitled";
    }
    const subEl = node.querySelector("[data-subtitle]");
    if (subEl) {
      subEl.textContent = b.subtitle || "";
    }
    const priceEl = node.querySelector("[data-price]");
    if (priceEl) {
      ALL_PRICE_CLASSES.forEach((c) => priceEl.classList.remove(c));
      CATEGORY_UI[currentCat].priceBadge.forEach((c) =>
        priceEl.classList.add(c)
      );
      const p = (b.price || "").trim();
      priceEl.textContent = p && p !== "$0.00" ? p : "Free";
    }
    const btnDetails = node.querySelector("[data-link]");
    if (btnDetails) {
      const href = `../pages/categories/categories-detail-page.html?isbn=${encodeURIComponent(
        b.isbn13
      )}`;
      if (btnDetails.tagName === "A") {
        btnDetails.setAttribute("href", href);
      } else {
        btnDetails.addEventListener("click", () => {
          location.href = href;
        });
      }
    }
    /** @type {HTMLElement|null} */
    const article = node.querySelector("article");
    if (article) {
      article.dataset.id = b.isbn13;
    }
    const favBtn = node.querySelector(".fav-btn");
    /** @type {HTMLElement|null} */
    const heart = favBtn?.querySelector("i");
    const id = b.isbn13;
    function syncHeart() {
      if (!heart) {
        return;
      }
      heart.classList.add("fa-solid", "fa-heart");
      heart.classList.toggle("text-red-500", isFav(id));
    }
    syncHeart();
    favBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFav(id);
      syncHeart();
    });
    frag.appendChild(node);
  }
  grid.appendChild(frag);
}
function setActiveCategoryButton(cat, activeBtn) {
  document.querySelectorAll("[data-category]").forEach((b) => {
    Object.values(CATEGORY_UI).forEach((meta) => {
      meta.btnClasses.forEach((c) => b.classList.remove(c));
    });
    b.classList.add("hover:bg-white/10");
  });
  activeBtn.classList.remove("hover:bg-white/10");
  CATEGORY_UI[cat]?.btnClasses.forEach((c) => activeBtn.classList.add(c));
}
function applyHeaderTheme(cat) {
  const meta = CATEGORY_UI[cat];
  if (!meta) {
    return;
  }
  if (chip) {
    [...chip.classList].forEach((c) => {
      if (c.startsWith("bg-") || c.startsWith("from-") || c.startsWith("to-")) {
        chip.classList.remove(c);
      }
    });
    chip.classList.add(...meta.chipClass);
  }
  if (catIcon) {
    catIcon.classList.forEach((c) => {
      if (c.startsWith("fa-") && c !== "fa-solid") {
        catIcon.classList.remove(c);
      }
    });
    catIcon.classList.add("fa-solid", meta.icon, "text-lg");
  }
  if (catTitle) {
    catTitle.textContent = meta.title;
  }
  if (catSubtitle) {
    catSubtitle.textContent = meta.subtitle;
  }
}
let currentCat = "programming";
async function loadCategory(catKey) {
  const meta = CATEGORY_UI[catKey];
  if (!meta || !grid) {
    return;
  }
  currentCat = catKey;
  applyHeaderTheme(catKey);
  grid.innerHTML = `<p class="text-purple-200/80">Loading…</p>`;
  try {
    const books = await fetchBooksByQuery(meta.query, 1);
    renderBooks(books);
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p class="text-red-300">Failed to load ${meta.title}.</p>`;
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  updateFavCount();
  document.querySelectorAll("[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("data-category");
      if (!cat || !CATEGORY_UI[cat]) {
        return;
      }
      setActiveCategoryButton(cat, btn);
      loadCategory(cat);
      const url = new URL(location.href);
      url.searchParams.set("cat", cat);
      history.replaceState({}, "", url);
    });
  });
  const urlCat = new URL(location.href).searchParams.get("cat");
  const initialCat = CATEGORY_UI[urlCat] ? urlCat : "programming";
  const initBtn = document.querySelector(`[data-category="${initialCat}"]`);
  if (initBtn) {
    setActiveCategoryButton(initialCat, /** @type {HTMLElement} */ (initBtn));
  }
  await loadCategory(initialCat);
});
window.addEventListener("popstate", () => {
  const urlCat = new URL(location.href).searchParams.get("cat");
  const cat = CATEGORY_UI[urlCat] ? urlCat : "programming";
  const btn = document.querySelector(`[data-category="${cat}"]`);
  if (btn) {
    setActiveCategoryButton(cat, /** @type {HTMLElement} */ (btn));
  }
  loadCategory(cat);
});
