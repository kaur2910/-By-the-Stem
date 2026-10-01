"use strict";

const PRODUCTS = Object.freeze([
  Object.freeze({ id: "garden-roses", name: "Garden Roses", category: "Soft & romantic", description: "Soft pink roses arranged with fresh seasonal greenery.", price: 35, stock: 12, symbol: "🌹", tone: "tone-rose" }),
  Object.freeze({ id: "sunshine-bunch", name: "Sunshine Bunch", category: "Bright & cheerful", description: "A cheerful mix of sunny blooms to brighten the room.", price: 28, stock: 15, symbol: "🌻", tone: "tone-gold" }),
  Object.freeze({ id: "seasonal-mix", name: "Seasonal Mix", category: "Seasonal", description: "A changing selection of flowers chosen for the season.", price: 42, stock: 10, symbol: "💐", tone: "tone-sage" }),
  Object.freeze({ id: "tulip-delight", name: "Tulip Delight", category: "Bright & cheerful", description: "Fresh tulips in a lively mix of seasonal colours.", price: 32, stock: 14, symbol: "🌷", tone: "tone-rose" }),
  Object.freeze({ id: "lavender-dream", name: "Lavender Dream", category: "Soft & romantic", description: "Gentle lavender and cream tones for a calm, graceful gift.", price: 39, stock: 8, symbol: "🪻", tone: "tone-lilac" }),
  Object.freeze({ id: "daisy-days", name: "Daisy Days", category: "Bright & cheerful", description: "A light-hearted bunch of cheerful daisies.", price: 25, stock: 18, symbol: "🌼", tone: "tone-gold" }),
  Object.freeze({ id: "orchid-elegance", name: "Orchid Elegance", category: "Statement", description: "An elegant arrangement with striking orchid blooms.", price: 54, stock: 6, symbol: "🌸", tone: "tone-lilac" }),
  Object.freeze({ id: "native-garden", name: "Native Garden", category: "Seasonal", description: "A textured arrangement inspired by New Zealand gardens.", price: 48, stock: 9, symbol: "🌿", tone: "tone-sage" }),
  Object.freeze({ id: "peony-pink", name: "Peony Pink", category: "Soft & romantic", description: "Full pink blooms arranged for a special occasion.", price: 58, stock: 5, symbol: "🌺", tone: "tone-rose" }),
  Object.freeze({ id: "florists-choice", name: "Florist's Choice", category: "Statement", description: "A distinctive arrangement selected by the florist.", price: 45, stock: 7, symbol: "💐", tone: "tone-gold" }),
  Object.freeze({ id: "sunflower-stems", name: "Sunflower Stems", category: "Bright & cheerful", description: "Bold golden sunflowers to bring warmth to your space.", price: 30, stock: 11, symbol: "🌻", tone: "tone-gold" }),
  Object.freeze({ id: "rose-and-lily", name: "Rose & Lily", category: "Soft & romantic", description: "A classic mix of roses and lilies with soft greenery.", price: 49, stock: 8, symbol: "🌹", tone: "tone-lilac" })
]);

const CATEGORIES = Object.freeze([
  "all", "Soft & romantic", "Bright & cheerful", "Seasonal", "Statement"
]);
const SORT_OPTIONS = Object.freeze([
  "featured", "price-low-high", "price-high-low", "name-a-z"
]);
const CART_KEY = "petalStemDemoCart";
const ORDER_KEY = "petalStemDemoOrder";
const CURRENCY = new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" });
let temporaryCart = [];

function formatPrice(value) {
  return CURRENCY.format(value);
}

function readStoredCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(savedCart)) return [];

    return savedCart.reduce(function (cleanCart, item) {
      const product = PRODUCTS.find(function (entry) { return entry.id === item.id; });
      const quantity = Number(item.quantity);
      if (product && Number.isInteger(quantity) && quantity > 0) {
        cleanCart.push({ id: product.id, quantity: Math.min(quantity, product.stock) });
      }
      return cleanCart;
    }, []);
  } catch (error) {
    return temporaryCart;
  }
}

function saveCart(cart) {
  temporaryCart = cart;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    // The current page session still works when browser storage is unavailable.
  }
  updateBasketCount();
}

function getCartProducts() {
  return readStoredCart().map(function (cartItem) {
    const product = PRODUCTS.find(function (entry) { return entry.id === cartItem.id; });
    return product ? { product: product, quantity: cartItem.quantity } : null;
  }).filter(Boolean);
}

function updateBasketCount() {
  const countElement = document.querySelector("#basket-count");
  if (!countElement) return;
  const count = readStoredCart().reduce(function (total, item) { return total + item.quantity; }, 0);
  countElement.textContent = String(count);
}

function createProductCard(product) {
  const article = document.createElement("article");
  article.className = "flower-card";

  const art = document.createElement("div");
  art.className = "flower-art " + product.tone;
  art.setAttribute("role", "img");
  art.setAttribute("aria-label", product.name + " flower illustration");
  art.textContent = product.symbol;

  const heading = document.createElement("h3");
  heading.textContent = product.name;

  const category = document.createElement("p");
  category.className = "flower-category";
  category.textContent = product.category;

  const description = document.createElement("p");
  description.className = "flower-description";
  description.textContent = product.description;

  const price = document.createElement("p");
  price.className = "flower-price";
  price.textContent = formatPrice(product.price);

  const detailsLink = document.createElement("a");
  detailsLink.className = "details-link";
  detailsLink.href = "product.html?id=" + encodeURIComponent(product.id);
  detailsLink.target = "_blank";
  detailsLink.rel = "noopener";
  detailsLink.textContent = "View details";
  detailsLink.setAttribute("aria-label", "View details for " + product.name);

  article.append(art, heading, category, description, price, detailsLink);
  return article;
}

function getVisibleProducts(products, category, sortOrder) {
  let visible = products.filter(function (product) {
    return category === "all" || product.category === category;
  });

  if (sortOrder === "price-low-high") {
    visible = visible.slice().sort(function (first, second) { return first.price - second.price; });
  } else if (sortOrder === "price-high-low") {
    visible = visible.slice().sort(function (first, second) { return second.price - first.price; });
  } else if (sortOrder === "name-a-z") {
    visible = visible.slice().sort(function (first, second) { return first.name.localeCompare(second.name); });
  }

  return visible;
}

function renderCatalog() {
  const grid = document.querySelector("#flower-grid");
  if (!grid) return;

  const categorySelect = document.querySelector("#category-filter");
  const sortSelect = document.querySelector("#sort-order");
  let category = categorySelect.value;
  let sortOrder = sortSelect.value;
  const message = document.querySelector("#catalog-message");

  if (!CATEGORIES.includes(category)) {
    category = "all";
    categorySelect.value = category;
  }
  if (!SORT_OPTIONS.includes(sortOrder)) {
    sortOrder = "featured";
    sortSelect.value = sortOrder;
  }

  const visibleProducts = getVisibleProducts(PRODUCTS, category, sortOrder);
  grid.replaceChildren();

  if (visibleProducts.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = "No flowers are available in this category. Please choose another category.";
    grid.append(emptyMessage);
    message.textContent = "No flower options found.";
    return;
  }

  grid.append(...visibleProducts.map(createProductCard));
  message.textContent = visibleProducts.length +
    (visibleProducts.length === 1 ? " flower option shown." : " flower options shown.");
}

function getProductFromPageAddress() {
  const productId = new URLSearchParams(window.location.search).get("id");
  return PRODUCTS.find(function (product) { return product.id === productId; }) || null;
}

function renderProductPage() {
  const detail = document.querySelector("#product-detail");
  if (!detail) return;

  const product = getProductFromPageAddress();
  const message = document.querySelector("#product-message");
  if (!product) {
    message.textContent = "That flower could not be found. Please return to the collection and choose a flower.";
    return;
  }

  detail.hidden = false;
  document.querySelector("#product-art").className = "product-detail-art " + product.tone;
  document.querySelector("#product-art").textContent = product.symbol;
  document.querySelector("#product-category").textContent = product.category;
  document.querySelector("#product-name").textContent = product.name;
  document.querySelector("#product-description").textContent = product.description;
  document.querySelector("#product-price").textContent = formatPrice(product.price);
  document.querySelector("#product-stock").textContent =
    product.stock + " available in this demo shop.";

  const quantityInput = document.querySelector("#product-quantity");
  quantityInput.max = String(product.stock);
  document.querySelector("#add-to-basket").addEventListener("click", function () {
    const quantity = Number(quantityInput.value);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) {
      message.textContent = "Choose a whole-number quantity from 1 to " + product.stock + ".";
      quantityInput.focus();
      return;
    }
    addProductToCart(product, quantity, message);
  });
}

function addProductToCart(product, quantity, messageElement) {
  const cart = readStoredCart();
  const existingItem = cart.find(function (item) { return item.id === product.id; });
  const currentQuantity = existingItem ? existingItem.quantity : 0;

  if (currentQuantity + quantity > product.stock) {
    messageElement.textContent =
      "Only " + product.stock + " of this flower are available in the demo shop.";
    return;
  }

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ id: product.id, quantity: quantity });
  }

  saveCart(cart);
  messageElement.textContent = quantity + " " + product.name + " added to your basket.";
}

function createCartRow(item) {
  const product = item.product;
  const row = document.createElement("article");
  row.className = "cart-row";

  const art = document.createElement("div");
  art.className = "cart-art " + product.tone;
  art.setAttribute("aria-hidden", "true");
  art.textContent = product.symbol;

  const nameBlock = document.createElement("div");
  const heading = document.createElement("h2");
  heading.textContent = product.name;
  const category = document.createElement("p");
  category.textContent = product.category;
  nameBlock.append(heading, category);

  const quantity = document.createElement("input");
  quantity.className = "quantity-input cart-quantity";
  quantity.type = "number";
  quantity.min = "1";
  quantity.max = String(product.stock);
  quantity.step = "1";
  quantity.value = String(item.quantity);
  quantity.setAttribute("aria-label", "Quantity of " + product.name);
  quantity.dataset.productId = product.id;

  const total = document.createElement("strong");
  total.className = "cart-row-total";
  total.textContent = formatPrice(product.price * item.quantity);

  const remove = document.createElement("button");
  remove.className = "remove-button";
  remove.type = "button";
  remove.dataset.removeId = product.id;
  remove.textContent = "Remove";
  remove.setAttribute("aria-label", "Remove " + product.name + " from basket");

  row.append(art, nameBlock, quantity, total, remove);
  return row;
}

function renderCartPage() {
  const cartItemsElement = document.querySelector("#cart-items");
  if (!cartItemsElement) return;

  const cart = getCartProducts();
  const message = document.querySelector("#cart-message");
  const summary = document.querySelector("#cart-summary");
  cartItemsElement.replaceChildren();

  if (cart.length === 0) {
    message.textContent = "Your basket is empty. Browse the flowers to add an option.";
    summary.hidden = true;
    return;
  }

  message.textContent = "Change a quantity or remove an item before continuing.";
  cartItemsElement.append(...cart.map(createCartRow));
  const total = cart.reduce(function (sum, item) {
    return sum + item.product.price * item.quantity;
  }, 0);
  document.querySelector("#cart-total").textContent = formatPrice(total);
  summary.hidden = false;
}

function updateCartItem(productId, quantity) {
  const product = PRODUCTS.find(function (entry) { return entry.id === productId; });
  if (!product) return false;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) return false;

  const cart = readStoredCart();
  const item = cart.find(function (entry) { return entry.id === productId; });
  if (!item) return false;
  item.quantity = quantity;
  saveCart(cart);
  return true;
}

function removeCartItem(productId) {
  const cart = readStoredCart().filter(function (item) { return item.id !== productId; });
  saveCart(cart);
}

function handleCartChange(event) {
  const input = event.target.closest("[data-product-id]");
  if (!input) return;

  const quantity = Number(input.value);
  const valid = updateCartItem(input.dataset.productId, quantity);
  if (!valid) {
    renderCartPage();
    document.querySelector("#cart-message").textContent =
      "Enter a whole-number quantity within the available stock.";
    return;
  }
  renderCartPage();
}

function handleCartClick(event) {
  const button = event.target.closest("[data-remove-id]");
  if (!button) return;
  removeCartItem(button.dataset.removeId);
  renderCartPage();
}

function renderCheckoutPage() {
  const summary = document.querySelector("#checkout-summary");
  if (!summary) return;

  const cart = getCartProducts();
  const form = document.querySelector("#checkout-form");
  if (cart.length === 0) {
    document.querySelector("#checkout-message").textContent =
      "Your basket is empty. Add flowers before checking out.";
    form.hidden = true;
    return;
  }

  const total = cart.reduce(function (sum, item) {
    return sum + item.product.price * item.quantity;
  }, 0);
  const itemCount = cart.reduce(function (sum, item) {
    return sum + item.quantity;
  }, 0);

  summary.textContent = itemCount +
    (itemCount === 1 ? " item · " : " items · ") +
    "Demo total: " + formatPrice(total);
  form.addEventListener("submit", submitDemoOrder);
}

function submitDemoOrder(event) {
  event.preventDefault();

  const nameInput = document.querySelector("#customer-name");
  const confirmationInput = document.querySelector("#demo-confirm");
  const nameError = document.querySelector("#name-error");
  const confirmError = document.querySelector("#confirm-error");
  const customerName = nameInput.value.trim();
  nameError.textContent = "";
  confirmError.textContent = "";
  let valid = true;

  if (customerName.length < 2 || customerName.length > 60) {
    nameError.textContent = "Enter a name between 2 and 60 characters.";
    valid = false;
  }
  if (!confirmationInput.checked) {
    confirmError.textContent = "Confirm that you understand this is a demo checkout.";
    valid = false;
  }
  if (!valid) return;

  const cart = getCartProducts();
  if (cart.length === 0) {
    document.querySelector("#checkout-message").textContent =
      "Your basket is empty. Add flowers before checking out.";
    return;
  }

  const total = cart.reduce(function (sum, item) {
    return sum + item.product.price * item.quantity;
  }, 0);
  const order = {
    number: "DEMO-" + String(Date.now()).slice(-6),
    total: total,
    customerName: customerName
  };

  try {
    sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
  } catch (error) {
    // The confirmation still displays if browser storage is unavailable.
  }

  saveCart([]);
  showConfirmation(order);
}

function showConfirmation(order) {
  document.querySelector("#checkout-form").hidden = true;
  document.querySelector("#confirmation-name").textContent = order.customerName;
  document.querySelector("#confirmation-number").textContent =
    "Demo order reference: " + order.number;
  document.querySelector("#confirmation-total").textContent =
    "Demo order total: " + formatPrice(order.total) + ". No payment was taken.";
  document.querySelector("#order-confirmation").hidden = false;
  document.querySelector("#checkout-message").textContent =
    "Your demo order has been recorded on this device.";
}

function initialisePage() {
  updateBasketCount();

  const page = document.body.dataset.page;
  if (page === "catalog") {
    document.querySelector("#category-filter").addEventListener("change", renderCatalog);
    document.querySelector("#sort-order").addEventListener("change", renderCatalog);
    renderCatalog();
  } else if (page === "product") {
    renderProductPage();
  } else if (page === "cart") {
    document.querySelector("#cart-items").addEventListener("change", handleCartChange);
    document.querySelector("#cart-items").addEventListener("click", handleCartClick);
    renderCartPage();
  } else if (page === "checkout") {
    renderCheckoutPage();
  }
}

initialisePage();
