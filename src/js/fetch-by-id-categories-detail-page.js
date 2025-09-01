const API = "https://api.itbook.store/1.0";
function qs(id) {
  return document.getElementById(id);
}
async function main() {
  const params = new URLSearchParams(location.search);
  const isbn = params.get("isbn");
  if (!isbn) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<p class="text-red-300 px-6 py-4">Missing ISBN. Go back and choose a book.</p>`
    );
    return;
  }
  try {
    const res = await fetch(`${API}/books/${encodeURIComponent(isbn)}`);
    if (!res.ok) {
      throw new Error("Failed to fetch details");
    }
    /**
     * @typedef {Object} BookDetail
     * @property {string} title
     * @property {string} subtitle
     * @property {string} authors
     * @property {string} publisher
     * @property {string} year
     * @property {string} pages
     * @property {string} rating
     * @property {string} desc
     * @property {string} price
     * @property {string} image
     * @property {string} url
     * @property {string} isbn13
     */

    /** @type {BookDetail} */
    const d = await res.json();
    /** @type {HTMLImageElement} */
    const cover = qs("d-cover");
    if (cover) {
      cover.src = d.image || "";
      cover.alt = d.title || "Book Cover";
    }
    const title = qs("d-title");
    if (title) {
      title.textContent = d.title || "";
    }
    const subtitle = qs("d-subtitle");
    if (subtitle) {
      subtitle.textContent = d.subtitle || "";
    }
    const authors = qs("d-authors");
    if (authors) {
      authors.textContent = d.authors || "";
    }
    const publisher = qs("d-publisher");
    if (publisher) {
      publisher.textContent = d.publisher || "";
    }
    const year = qs("d-year");
    if (year) {
      year.textContent = d.year || "";
    }
    const pages = qs("d-pages");
    if (pages) {
      pages.textContent = d.pages || "";
    }
    const rating = qs("d-rating");
    if (rating) {
      rating.textContent = d.rating || "";
    }
    const isbn13 = qs("d-isbn13");
    if (isbn13) {
      isbn13.textContent = d.isbn13 || isbn;
    }
    const desc = qs("d-desc");
    if (desc) {
      desc.textContent = d.desc || "";
    }
    const buy = qs("d-buy");
    if (buy) {
      buy.textContent = d.price
        ? `Buy / More Info (${d.price})`
        : "Buy / More Info";
      buy.addEventListener("click", () => {
        if (d.url) {
          window.open(d.url, "_blank");
        }
      });
    }
  } catch (e) {
    console.error(e);
    document.body.insertAdjacentHTML(
      "beforeend",
      `<p class="text-red-300 px-6 py-4">Could not load book details. Please try again.</p>`
    );
  }
}
document.addEventListener("DOMContentLoaded", main);
