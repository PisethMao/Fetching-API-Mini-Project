const buttons = document.querySelectorAll("[data-list]");
const title = document.getElementById("listTitle");
const desc = document.getElementById("listDesc");
const btnNewList = document.getElementById("btnNewList");
const newListModal = document.getElementById("newListModal");
const createList = document.getElementById("createList");
const listNameInput = document.getElementById("listName");
const listDescInput = document.getElementById("listDescInput");
const listsContainer = document.getElementById("listsContainer");
const STORAGE_KEY = "customReadingLists";
const lists = {
  currently: { title: "Currently Reading", desc: "Books I'm actively reading" },
  want: { title: "Want to Read", desc: "Books on my wishlist" },
  completed: { title: "Completed", desc: "Books I've finished reading" },
};
const getSaved = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
const saveAll = (arr) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
function setActive(btn) {
  document
    .querySelectorAll(".list-btn")
    .forEach((b) => b.classList.remove("active-btn"));
  btn.classList.add("active-btn");
}
function renderCustomButton(item, makeActive = false) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className =
    "list-btn w-full flex flex-col items-start px-4 py-3 rounded-xl " +
    "hover:bg-white/10 transform transition duration-200 hover:scale-110 cursor-pointer";
  btn.dataset.id = item.id;
  btn.innerHTML = `
    <span class="text-lg font-medium">${item.name}</span>
    <span class="text-xs">0 books</span>
    <button class="del-btn" aria-label="Delete list" title="Delete">
      <i class="fa-regular fa-trash-can"></i>
    </button>
  `;
  btn.addEventListener("click", (e) => {
    if (e.target.closest(".del-btn")) return;
    setActive(btn);
    title.textContent = item.name;
    desc.textContent = item.desc || "No description";
  });
  btn.querySelector(".del-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    const all = getSaved().filter((x) => x.id !== item.id);
    saveAll(all);
    const wasActive = btn.classList.contains("active-btn");
    btn.remove();
    if (wasActive && buttons[0]) {
      setActive(buttons[0]);
      title.textContent = lists.currently.title;
      desc.textContent = lists.currently.desc;
    }
  });
  listsContainer.appendChild(btn);
  if (makeActive) {
    setActive(btn);
    title.textContent = item.name;
    desc.textContent = item.desc || "No description";
  }
}
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.list;
    title.textContent = lists[key].title;
    desc.textContent = lists[key].desc;
    setActive(btn);
  });
});
if (buttons.length) {
  setActive(buttons[0]);
  title.textContent = lists.currently.title;
  desc.textContent = lists.currently.desc;
}
getSaved().forEach((item, idx, arr) => {
  renderCustomButton(item, false);
});
function openNewListModal() {
  newListModal.classList.remove("hidden");
  newListModal.classList.add("bg-white/70", "backdrop-blur-sm");
  newListModal.classList.add("flex");
  document.body.classList.add("overflow-hidden");
}
function hideNewListModal() {
  newListModal.classList.add("hidden");
  newListModal.classList.remove("flex");
  document.body.classList.remove("overflow-hidden");
}
btnNewList.addEventListener("click", openNewListModal);
newListModal.addEventListener("click", (e) => {
  if (e.target === newListModal) {
    hideNewListModal();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hideNewListModal();
  }
});
createList.addEventListener("click", () => {
  const name = listNameInput.value.trim();
  const description = listDescInput.value.trim();
  if (!name) {
    return;
  }
  const item = {
    id: Date.now().toString(),
    name,
    desc: description || "No description",
    createdAt: new Date().toISOString(),
  };
  const all = getSaved();
  all.push(item);
  saveAll(all);
  renderCustomButton(item, true);
  hideNewListModal();
  listNameInput.value = "";
  listDescInput.value = "";
});
