const API = "https://api.itbook.store/1.0";
const FAV_KEY = "bookverse:favorites";
const grid = document.getElementById("bookGrid");
const emptyMessage = document.getElementById("emptyMessage");
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
// get fav and store in local storage
function getFavs() {
  try {
    const raw = JSON.parse(localStorage.getItem(FAV_KEY)) || [];
    return raw.map((v) => (typeof v === "string" ? v : v?.id)).filter(Boolean);
  } catch {
    return [];
  }
}
// save and store
function saveFavs(list) {
  localStorage.setItem(FAV_KEY, JSON.stringify(list));
}
// check fav by id of each card in favorite page
function isFav(id) {
  return getFavs().includes(id);
}
// update fav count
function updateFavCount() {
  const count = getFavs().length;
  document.querySelectorAll("[data-fav-count]").forEach((el) => {
    el.textContent = String(count);
  });
}
if (!grid || !tpl) {
  updateFavCount();
}
function toggleFav(id) {
  const list = getFavs();
  const idx = list.indexOf(id);
  if (idx === -1) {
    list.push(id);
  } else {
    list.splice(idx, 1);
  }
  saveFavs(list);
  updateFavCount();
}
window.addEventListener("storage", (e) => {
  if (e.key === FAV_KEY) {
    updateFavCount();
    if (document.body.matches("[data-favorites-page]")) {
      renderFavorites();
    }
  }
});
document.addEventListener("DOMContentLoaded", updateFavCount);
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
/** @type {Record<string, BookDetail>} */
const bookCache = Object.create(null);
async function fetchBook(id) {
  if (Object.prototype.hasOwnProperty.call(bookCache, id)) {
    return bookCache[id];
  }
  const res = await fetch(`${API}/books/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  bookCache[id] = data;
  return data;
}
/** @param {BookDetail} detail */
function showModal(detail) {
  elCover.src = detail.image || "";
  elTitle.textContent = detail.title || "";
  elSubtitle.textContent = detail.subtitle || "";
  elAuthor.textContent = detail.authors || "";
  elPublisher.textContent = detail.publisher || "";
  elYear.textContent = detail.year || "";
  elPages.textContent = detail.pages || "";
  elDesc.textContent = detail.desc || "";
  if (elBuy) {
    if (elBuy.tagName === "A") {
      elBuy.href = detail.url || "#";
    } else {
      elBuy.onclick = () => detail.url && window.open(detail.url, "_blank");
    }
    elBuy.textContent = `Buy (${detail.price || "$0.00"})`;
  }
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.documentElement.classList.add("overflow-hidden");
}
function hideModal() {
  modal.classList.remove("flex");
  modal.classList.add("hidden");
  document.documentElement.classList.remove("overflow-hidden");
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    hideModal();
  }
});
btnClose?.addEventListener("click", hideModal);
backdrop?.addEventListener("click", hideModal);
async function renderFavorites() {
  const favs = [...new Set(getFavs())];
  updateFavCount();
  if (!grid || !tpl) {
    return;
  }
  grid.innerHTML = "";
  if (!favs.length) {
    if (emptyMessage) {
      emptyMessage.style.display = "block";
    }
    return;
  }
  if (emptyMessage) {
    emptyMessage.style.display = "none";
  }
  const results = await Promise.all(
    favs.map((id) =>
      fetchBook(id)
        .then((d) => [id, d])
        .catch(() => [id, null])
    )
  );
  const frag = document.createDocumentFragment();
  for (const [id, detail] of results) {
    if (!detail) {
      continue;
    }
    /** @type {DocumentFragment} */
    const node = tpl.content.cloneNode(true);
    const card = node.querySelector("article");
    if (card) {
      card.dataset.id = id;
    }
    /** @type {HTMLImageElement | null} */
    const img = node.querySelector("[data-img]");
    if (img) {
      img.src = detail.image || "";
      img.alt = detail.title || "Book Cover";
    }
    const title = node.querySelector("[data-title]");
    if (title) {
      title.textContent = detail.title || "Untitled";
    }
    const subtitle = node.querySelector("[data-subtitle]");
    if (subtitle) {
      subtitle.textContent = detail.subtitle || "";
    }
    const price = node.querySelector("[data-price]");
    if (price) {
      price.textContent = detail.price || "$0.00";
    }
    const favBtn = node.querySelector(".fav-btn");
    const icon = favBtn ? favBtn.querySelector("i") : null;
    if (icon) {
      icon.classList.toggle("text-red-500", isFav(id));
    }
    const btnDetail = node.querySelector("[data-link]");
    if (btnDetail) {
      if (btnDetail.tagName === "A") {
        btnDetail.setAttribute("href", "#");
      }
      btnDetail.textContent = "View Details";
      btnDetail.addEventListener("click", (e) => {
        e.preventDefault();
        showModal(detail);
      });
    }
    frag.appendChild(node);
  }
  grid.appendChild(frag);
}
document.addEventListener("click", (e) => {
  const btn = e.target.closest?.(".fav-btn");
  if (!btn) {
    return;
  }
  const card = btn.closest("article");
  const id = card?.dataset.id;
  if (!id) {
    return;
  }
  toggleFav(id);
  const icon = btn.querySelector("i");
  if (icon) {
    icon.classList.toggle("text-red-500", isFav(id));
  }
  const onFavorites = document.body.matches("[data-favorites-page]");
  if (onFavorites && !isFav(id)) {
    card?.remove();
    const list = getFavs();
    if (list.length === 0) {
      if (emptyMessage) {
        emptyMessage.style.display = "block";
      }
      if (grid) {
        grid.innerHTML = "";
      }
    }
  }
});
updateFavCount();
if (document.body.matches("[data-favorites-page]")) {
  renderFavorites();
}
