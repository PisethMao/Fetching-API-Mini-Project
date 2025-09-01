// Find the element that has this id in HTML
const API = "https://api.itbook.store/1.0";
const grid = document.getElementById("bookGrid");
const btnNew = document.getElementById("btnNew");
const btnPopular = document.getElementById("btnPopular");
const btnTop = document.getElementById("btnTop");
/** @type {HTMLTemplateElement} */
const tpl = document.getElementById("bookCardTemplate");
const modal = document.getElementById("detailModal");
const backdrop = document.getElementById("detailBackdrop");
const btnClose = document.getElementById("detailClose");
/** @type {HTMLImageElement} */
const elCover = document.getElementById("detailCover");
const elTitle = document.getElementById("detailTitle");
const elSubtitle = document.getElementById("detailSubtitle");
const elAuthor = document.getElementById("detailAuthor");
const elPublisher = document.getElementById("detailPublisher");
const elYear = document.getElementById("detailYear");
const elPages = document.getElementById("detailPages");
const elDesc = document.getElementById("detailDesc");
/** @type {HTMLAnchorElement} */
const elBuy = document.getElementById("detailBuy");
// This check grid or tpl have id or not.
if (!grid || !tpl) {
  console.error("Missing #bookGrid or #bookCardTemplate in DOM.");
}
let books = [];
let active = "new";
function showSkeleton() {
  if (!grid) {
    return;
  }
  // Creates an array with 8 empty slots
  grid.innerHTML = Array.from({ length: 8 })
    .map(() => `<section class="skeleton h-80 w-full sm:w-96"></section>`)
    .join("");
}
const nextFrame = () =>
  new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/**
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
// This function is do for button popular books in home page.
// API don't have this end point or I cannot find it.
// So I create this function to do like when user click on button popupular book.
// User can see books random!
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
// This function for books render for each button!
function view(tab) {
  if (tab === "new") {
    return books;
  }
  if (tab === "popular") {
    return shuffle(books.slice());
  }
  if (tab === "top") {
    return [...books].reverse();
  }
  return books;
}
/**
 * @typedef {Object} BookDetail
 * @property {string} error
 * @property {string} title
 * @property {string} subtitle
 * @property {string} authors
 * @property {string} publisher
 * @property {string} language
 * @property {string} isbn10
 * @property {string} isbn13
 * @property {string} pages
 * @property {string} year
 * @property {string} rating
 * @property {string} desc
 * @property {string} price
 * @property {string} image
 * @property {string} url
 * @property {{["Free eBook"]?: string}} [pdf]
 */
/**
 * @param {BookDetail} detail
 */
// This function is use to view detail in each card in home page.
function showModal(detail) {
  if (elCover) {
    elCover.src = detail.image || "";
    elCover.alt = detail.title || "Book Cover";
    elCover.loading = "eager";
    elCover.decoding = "async";
    elCover.referrerPolicy = "no-referrer";
  }
  if (elTitle) {
    elTitle.textContent = detail.title || "";
  }
  if (elSubtitle) {
    elSubtitle.textContent = detail.subtitle || "";
  }
  if (elAuthor) {
    elAuthor.textContent = detail.authors || "";
  }
  if (elPublisher) {
    elPublisher.textContent = detail.publisher || "";
  }
  if (elYear) {
    elYear.textContent = detail.year || "";
  }
  if (elPages) {
    elPages.textContent = detail.pages || "";
  }
  if (elDesc) {
    elDesc.textContent = detail.desc || "";
  }
  if (elBuy) {
    elBuy.href = detail.url || "#";
    elBuy.textContent = `Buy (${detail.price || "$0.00"})`;
    elBuy.target = "_blank";
    elBuy.rel = "noopener";
  }
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.documentElement.style.overflow = "hidden";
  }
}
// This function is use to close modal in home page
function hideModal() {
  if (!modal) {
    return;
  }
  modal.classList.remove("flex");
  modal.classList.add("hidden");
  document.documentElement.style.overflow = "";
}
if (btnClose) {
  btnClose.addEventListener("click", hideModal);
}
if (backdrop) {
  backdrop.addEventListener("click", hideModal);
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hideModal();
  }
});
async function fetchBookDetail(id) {
  try {
    // encodeURIComponent(): Ensures the id is safely encoded for use in a URL.
    // Prevents issues if the id has special characters (/, ?, &, etc.).
    const res = await fetch(`${API}/books/${encodeURIComponent(id)}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    showModal(data);
  } catch (err) {
    alert(
      "Failed to load book details: " +
        (err instanceof Error ? err.message : String(err))
    );
  }
}
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
 * @param {Book[]} list
 * @param {boolean} [animate=true]
 */
function render(list, animate = true) {
  if (!grid || !tpl) {
    return;
  }
  grid.innerHTML = "";
  // It creates empty object to stores in variable frag.
  const frag = document.createDocumentFragment();
  list.slice(0, 20).forEach((b, i) => {
    /** @type {DocumentFragment} */
    const node = tpl.content.cloneNode(true);
    /** @type {HTMLImageElement|null} */
    const img = node.querySelector("[data-img]");
    if (img) {
      img.src = b.image || "/assets/images/book-cover-placeholder-svg.png";
      img.alt = b.title || "Book Cover";
      img.loading = "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
    }
    const title = node.querySelector("[data-title]");
    if (title) {
      title.textContent = b.title || "Untitled";
    }
    const subtitle = node.querySelector("[data-subtitle]");
    if (subtitle) {
      subtitle.textContent = b.subtitle || "";
    }
    const price = node.querySelector("[data-price]");
    if (price) {
      price.textContent = b.price || "$0.00";
    }
    /** @type {HTMLAnchorElement|null} */
    const btnDetail = node.querySelector("[data-link]");
    if (btnDetail) {
      const detailUrl = `categories-detail-page.html?isbn=${encodeURIComponent(
        b.isbn13
      )}`;
      btnDetail.textContent = "View Details";
      btnDetail.href = detailUrl;
      btnDetail.rel = "noopener";
      btnDetail.addEventListener("click", (e) => {
        if (
          e.ctrlKey ||
          e.metaKey ||
          e.shiftKey ||
          e.altKey ||
          e.button === 1
        ) {
          return;
        }
        e.preventDefault();
        fetchBookDetail(b.isbn13);
      });
    }
    const favBtn = node.querySelector(".fav-btn");
    if (favBtn) {
      const icon = favBtn.querySelector("i");
      if (isFav(b.isbn13)) {
        icon?.classList.add("text-red-500");
      }
      favBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFav(b.isbn13, favBtn);
      });
    }
    if (animate) {
      const card = node.querySelector("article");
      if (card) {
        card.classList.add("slide-up");
        card.style.animationDelay = i * 40 + "ms";
      }
    }
    frag.appendChild(node);
  });
  grid.appendChild(frag);
  updateFavCount();
}
async function init() {
  if (!grid) {
    return;
  }
  showSkeleton();
  await nextFrame();
  try {
    const res = await fetch(`${API}/new`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    books = data.books ?? [];
    render(view(active), true);
    updateFavCount();
  } catch (err) {
    grid.innerHTML = `<p class="text-red-400">Failed to load: ${
      err instanceof Error ? err.message : String(err)
    }</p>`;
  }
}
init();
// Use to switch between tabs when the user clicks the buttons.
[btnNew, btnPopular, btnTop].forEach((btn) => {
  if (!btn) {
    return;
  }
  btn.addEventListener("click", async () => {
    [btnNew, btnPopular, btnTop].forEach((b) => b?.classList.remove("active"));
    btn.classList.add("active");
    active = btn === btnNew ? "new" : btn === btnPopular ? "popular" : "top";
    showSkeleton();
    await nextFrame();
    await sleep(300);
    render(view(active), true);
  });
});
const FAV_KEY = "bookverse:favorites";
/** @returns {string[]} */
// get favorite of all card that user fav to store in local storage
function getFavs() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) {
      return [];
    }
    const val = JSON.parse(raw);
    return Array.isArray(val) ? val : [];
  } catch {
    return [];
  }
}
// save to local storage
function saveFavs(favs) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}
/** @param {string} id */
// check favorite card in home page by id
function isFav(id) {
  return getFavs().includes(id);
}
// count favorite
function updateFavCount() {
  const badge = document.querySelector("[data-fav-count]");
  if (badge) {
    badge.textContent = String(getFavs().length);
  }
}
/**
 * @param {string} id
 * @param {HTMLElement} btn
 */
// this fuction used to click add or unadd book card in favorite page
function toggleFav(id, btn) {
  let favs = getFavs();
  const icon = btn.querySelector("i");
  if (favs.includes(id)) {
    favs = favs.filter((f) => f !== id);
    icon?.classList.remove("text-red-500");
  } else {
    favs.push(id);
    icon?.classList.add("text-red-500");
  }
  saveFavs(favs);
  updateFavCount();
  window.dispatchEvent(new StorageEvent("storage", { key: FAV_KEY }));
}
window.addEventListener("storage", (e) => {
  if (e.key === FAV_KEY) {
    updateFavCount();
  }
});
