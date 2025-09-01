// Find the element that has this id in HTML
const btn = document.getElementById("menuBtn");
const menu = document.getElementById("mobileMenu");
// ?. is called Chaining Operator checks if btn exists (not null).
// If it doesn’t exist, the code won’t run and won’t throw an error.
btn?.addEventListener("click", () => {
  // if menu has the class hidden, remove it; if not, add it.
  menu.classList.toggle("hidden");
  menu.classList.toggle("flex");
});
document.addEventListener("DOMContentLoaded", () => {
  // This is the Spread Operator.
  const buttons = [...document.querySelectorAll("#filterButtons .filter-btn")];
  let activeIndex = 0;
  // I use this because some function in js can not suggest to use it.
  /** @type {HTMLButtonElement & {dataset: {from: string, to: string}}} */
  const first = buttons[0];
  first.style.setProperty("--from", first.dataset.from);
  first.style.setProperty("--to", first.dataset.to);
  first.classList.add("active");
  buttons.forEach(
    (
      /** @type {HTMLButtonElement & {dataset: {from: string, to: string}}} */ btn,
      idx
    ) => {
      btn.addEventListener("click", () => {
        if (idx === activeIndex) {
          return;
        }
        buttons.forEach((/** @type {HTMLButtonElement} */ b) => {
          b.classList.remove("active");
          b.style.animation = "none";
          b.style.backgroundSize = "0% 100%";
          void b.offsetWidth;
        });
        btn.style.setProperty("--from", btn.dataset.from);
        btn.style.setProperty("--to", btn.dataset.to);
        btn.classList.add("active");
        const goingRight = idx > activeIndex;
        btn.style.backgroundPosition = goingRight ? "left" : "right";
        btn.style.animation = `${
          goingRight ? "fillFromLeft" : "fillFromRight"
        } 600ms ease forwards`;
        activeIndex = idx;
      });
    }
  );
});
window.addEventListener("load", () => {
  window.scrollTo({
    top: 50,
    behavior: "smooth",
  });
});
