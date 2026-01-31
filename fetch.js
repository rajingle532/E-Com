/* ================= GLOBAL STATE ================= */
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let products = [];

/* PAGINATION */
let page = 1;
const perPage = 8;
let totalPages = 1;

/* ================= CART ================= */
function updateCartCount() {
  const count = document.getElementById("cartCount");
  if (count) count.textContent = cart.length;
}

function addToCart(product) {
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();

  const cartEl = document.querySelector(".cart");
  if (cartEl) {
    cartEl.classList.add("bump");
    setTimeout(() => cartEl.classList.remove("bump"), 300);
  }
}

updateCartCount();

/* ================= DOM ================= */
const productContainer = document.getElementById("product-container");
const skeleton = document.getElementById("skeleton");

const modal = document.getElementById("productModal");
const closeModal = document.getElementById("closeModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalPrice = document.getElementById("modalPrice");
const modalAdd = document.getElementById("modalAdd");
const modalWish = document.getElementById("modalWish");

const inputBox = document.getElementById("inputBox");
const minPriceInput = document.getElementById("minPrice");
const maxPriceInput = document.getElementById("maxPrice");
const sortSelect = document.getElementById("sortSelect");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageNum = document.getElementById("pageNum");
const darkBtn = document.getElementById("darkModeBtn");

/* ================= SKELETON ================= */
if (skeleton) {
  for (let i = 0; i < 8; i++) {
    const s = document.createElement("div");
    s.className = "skeleton";
    skeleton.appendChild(s);
  }
}

/* ================= FETCH PRODUCTS ================= */
fetch("https://dummyjson.com/products")
  .then(r => r.json())
  .then(data => {
    products = data.products;
    if (skeleton) skeleton.style.display = "none";
    render();
  })
  .catch(err => console.log(err));

/* ================= RENDER ================= */
function render() {
  if (!productContainer) return;

  /* FILTER */
  let filtered = products.filter(p =>
    (!inputBox || p.title.toLowerCase().includes(inputBox.value.toLowerCase())) &&
    p.price >= (minPriceInput?.value || 0) &&
    p.price <= (maxPriceInput?.value || Infinity)
  );

  /* SORT */
  if (sortSelect?.value === "low") filtered.sort((a,b)=>a.price-b.price);
  if (sortSelect?.value === "high") filtered.sort((a,b)=>b.price-a.price);

  /* ============ PAGINATION LOGIC ============ */
  totalPages = Math.ceil(filtered.length / perPage);
  if (page > totalPages) page = totalPages || 1;

  const start = (page - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);
  /* ========================================= */

  productContainer.innerHTML = "";

  if (paginated.length === 0) {
    productContainer.innerHTML = "<h2 style='color:white'>No products found</h2>";
    return;
  }

  paginated.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${p.thumbnail}">
      <h3>${p.title}</h3>
      <p>₹${p.price}</p>
      <button class="add-cart">Add</button>
      <button class="view">View</button>
    `;

    div.querySelector(".add-cart").onclick = () => addToCart(p);

    div.querySelector(".view").onclick = () => {
      if (!modal) return;

      modal.style.display = "block";
      modalImg.src = p.thumbnail;
      modalTitle.innerText = p.title;
      modalPrice.innerText = "₹" + p.price;

      modalAdd.onclick = () => addToCart(p);
      modalWish.onclick = () => {
        wishlist.push(p);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        alert("Added to wishlist ❤️");
      };
    };

    productContainer.appendChild(div);
  });

  /* UPDATE PAGINATION UI */
  if (pageNum) pageNum.textContent = `${page} / ${totalPages}`;
  if (prevBtn) prevBtn.disabled = page === 1;
  if (nextBtn) nextBtn.disabled = page === totalPages;
}

/* ================= EVENTS ================= */
[inputBox, minPriceInput, maxPriceInput, sortSelect].forEach(el => {
  if (el) el.addEventListener("input", () => {
    page = 1; // reset page on filter/search
    render();
  });
});

/* PAGINATION BUTTONS */
if (nextBtn) nextBtn.onclick = () => {
  if (page < totalPages) {
    page++;
    render();
  }
};

if (prevBtn) prevBtn.onclick = () => {
  if (page > 1) {
    page--;
    render();
  }
};

/* DARK MODE */
if (darkBtn) darkBtn.onclick = () => document.body.classList.toggle("dark");

/* ================= MODAL CLOSE ================= */
if (closeModal) closeModal.onclick = () => modal.style.display = "none";
window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

/* ================= SMART LIVE CHAT ================= */
const chatToggle = document.getElementById("chatToggle");
const chatBody = document.getElementById("chatBody");
const chatInput = document.getElementById("chatInput");
const sendMsg = document.getElementById("sendMsg");

const botReplies = {
  hello: "Hello 👋 How can I help you today?",
  hi: "Hi there 😊",
  delivery: "🚚 Delivery takes 3–5 working days.",
  cod: "💰 Yes, Cash on Delivery is available.",
  return: "🔄 You can return items within 7 days.",
  refund: "💸 Refunds are processed in 2–3 days.",
  contact: "📞 Call us at +91 98765 43210",
  wishlist: "❤️ Use wishlist button to save items",
  cart: "🛒 Cart is saved even after refresh!",
  thanks: "You're welcome 😊"
};

if (sendMsg) {
  sendMsg.onclick = () => {
    const msg = chatInput.value.trim();
    if (!msg) return;

    chatBody.innerHTML += `<div class="msg user">${msg}</div>`;

    let reply = "🤖 I didn't understand that. Try delivery, return, or COD.";
    Object.keys(botReplies).forEach(key => {
      if (msg.toLowerCase().includes(key)) reply = botReplies[key];
    });

    setTimeout(() => {
      chatBody.innerHTML += `<div class="msg bot">${reply}</div>`;
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 500);

    chatInput.value = "";
  };
}

if (chatToggle) {
  chatToggle.onclick = () => {
    const open = chatBody.style.display === "block";
    chatBody.style.display = open ? "none" : "block";
    chatInput.parentElement.style.display = open ? "none" : "flex";
  };
}

/* ================= FAQ ================= */
document.querySelectorAll(".faq").forEach(faq => {
  faq.onclick = () => {
    const p = faq.querySelector("p");
    p.style.display = p.style.display === "block" ? "none" : "block";
  };
});

/* ================= CONTACT FORM ================= */
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.onsubmit = e => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    const formMsg = document.getElementById("formMsg");

    if (!name || !email || !message) {
      formMsg.textContent = "Please fill all fields";
      formMsg.style.color = "red";
    } else {
      formMsg.textContent = "Message sent successfully!";
      formMsg.style.color = "green";
      e.target.reset();
    }
  };
}
