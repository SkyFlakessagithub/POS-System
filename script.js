const defaultProducts = [
  { id: 1, name: "Kinilaw", category: "Main", price: 100.00, stock: 40 },
  { id: 2, name: "Humba", category: "Main", price: 100.00, stock: 40 },
  { id: 3, name: "Sinigang", category: "Main", price: 100.00, stock: 40 },
  { id: 4, name: "Kaldereta", category: "Main", price: 100.00, stock: 40 },
  { id: 5, name: "Paklay", category: "Main", price: 100.0, stock: 40 },
  { id: 6, name: "Rice", category: "Main", price: 20.00, stock: 100 },
  { id: 7, name: "Water", category: "Drinks", price: 25.00, stock: 48 },
  { id: 8, name: "Mountain Dew", category: "Drinks", price: 25.00, stock: 48 }
];
const defaultSalesOrders = [];
let products = JSON.parse(localStorage.getItem("products")) || [...defaultProducts];
let salesOrders = JSON.parse(localStorage.getItem("salesOrders")) || [...defaultSalesOrders];

function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products));
}

function saveSalesOrders() {
  localStorage.setItem("salesOrders", JSON.stringify(salesOrders));
}

function saveAllData() {
  saveProducts();
  saveSalesOrders();
}
let cart = [];
let selectedCategory = "All";

const productList = document.getElementById("productList");
const cartItems = document.getElementById("cartItems");
const emptyCart = document.getElementById("emptyCart");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const completeOrderBtn = document.getElementById("completeOrderBtn");
const categoryButtons = document.querySelectorAll(".category-btn");
const dateDisplay = document.getElementById("dateDisplay");

const openBtn = document.getElementById("openAddProductModal");
const modal = document.getElementById("addProductModal");
const closeBtn = document.getElementById("closeAddProductModal");
const form = document.getElementById("addProductForm");

function formatPeso(amount) {
  return `₱${Number(amount).toFixed(2)}`;
}

function displayDate() {
  if (dateDisplay) {
    const now = new Date();
    dateDisplay.textContent = now.toLocaleDateString();
  }
}

function renderProducts() {
  if (!productList) return;

  productList.innerHTML = "";

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(product => product.category === selectedCategory);

  filteredProducts.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
      <div class="product-image">
        <i class="fa-solid fa-cart-shopping"></i>
      </div>
      <div class="product-name">${product.name}</div>
      <div class="product-category">${product.category}</div>
      <div class="product-footer">
        <span class="product-price">${formatPeso(product.price)}</span>
        <span class="product-stock">Stock: ${product.stock}</span>
      </div>
    `;

    card.addEventListener("click", () => addToCart(product.id));
    productList.appendChild(card);
  });
}

function addToCart(productId) {
  const foundProduct = products.find(product => product.id === productId);
  const existingItem = cart.find(item => item.id === productId);

  if (!foundProduct) return;

  if (foundProduct.stock === 0) {
    alert("This product is out of stock.");
    return;
  }

  if (existingItem) {
    if (existingItem.quantity < foundProduct.stock) {
      existingItem.quantity++;
    } else {
      alert("Not enough stock available.");
    }
  } else {
    cart.push({
      id: foundProduct.id,
      name: foundProduct.name,
      category: foundProduct.category,
      price: foundProduct.price,
      quantity: 1
    });
  }

  renderCart();
}

function renderCart() {
  if (!cartItems || !emptyCart || !completeOrderBtn) return;

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.appendChild(emptyCart);
    completeOrderBtn.disabled = true;
    completeOrderBtn.classList.remove("enabled");
  } else {
    completeOrderBtn.disabled = false;
    completeOrderBtn.classList.add("enabled");

    cart.forEach(item => {
      const cartItem = document.createElement("div");
      cartItem.classList.add("cart-item");

      cartItem.innerHTML = `
        <div class="cart-top">
          <span class="cart-name">${item.name}</span>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <div class="cart-bottom">
          <div class="qty-controls">
            <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
          </div>
          <span class="item-total">${formatPeso(item.price * item.quantity)}</span>
        </div>
      `;

      cartItems.appendChild(cartItem);
    });
  }

  updateSummary();
}

function changeQty(productId, change) {
  const item = cart.find(cartItem => cartItem.id === productId);
  const originalProduct = products.find(product => product.id === productId);

  if (!item || !originalProduct) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(cartItem => cartItem.id !== productId);
  } else if (item.quantity > originalProduct.stock) {
    item.quantity = originalProduct.stock;
  }

  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  renderCart();
}

function updateSummary() {
  if (!subtotalEl || !totalEl) return;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  subtotalEl.textContent = formatPeso(subtotal);
  totalEl.textContent = formatPeso(total);
}

categoryButtons.forEach(button => {
  button.addEventListener("click", () => {
    categoryButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    selectedCategory = button.dataset.category;
    renderProducts();
  });
});

if (completeOrderBtn) {
  completeOrderBtn.addEventListener("click", () => {
    if (cart.length === 0) return;

    cart.forEach(cartItem => {
      const product = products.find(p => p.id === cartItem.id);
      if (product) {
        product.stock -= cartItem.quantity;
        if (product.stock < 0) product.stock = 0;
      }
    });

    const newOrder = {
      id: `ORD-${Date.now()}`,
      date: new Date().toLocaleString(),
      status: "completed",
      items: cart.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    };

    salesOrders.unshift(newOrder);
    saveAllData();

    alert("Order completed successfully!");

    cart = [];

    renderCart();
    renderProducts();
    renderInventory();
    renderSalesPage();
    renderDashboard();
  });
}

function renderInventory() {
  const table = document.getElementById("inventoryTable");
  const totalProductsEl = document.getElementById("totalProducts");
  const totalCategoriesEl = document.getElementById("totalCategories");
  const lowStockEl = document.getElementById("lowStock");
  const totalValueEl = document.getElementById("totalValue");

  if (!table || !totalProductsEl || !totalCategoriesEl || !lowStockEl || !totalValueEl) {
    return;
  }

  table.innerHTML = "";

  let totalValue = 0;
  let lowStock = 0;
  const categories = new Set();

  products.forEach((item, index) => {
    const value = item.price * item.stock;
    totalValue += value;

    if (item.stock < 20) {
      lowStock++;
    }

    categories.add(item.category);

    table.innerHTML += `
      <tr>
        <td>
          <div class="product-name-cell">
            <div class="product-icon-box">
              <i class="fa-solid fa-cube"></i>
            </div>
            <span>${item.name}</span>
          </div>
        </td>
        <td><span class="category-badge">${item.category}</span></td>
        <td>${formatPeso(item.price)}</td>
        <td>${item.stock}</td>
        <td class="value-text">${formatPeso(value)}</td>
        <td>
          <div class="actions-cell">
            <button class="action-btn edit-btn" title="Edit" onclick="editProduct(${index})">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button class="action-btn delete-btn" title="Delete" onclick="deleteProduct(${index})">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  totalProductsEl.textContent = products.length;
  totalCategoriesEl.textContent = categories.size;
  lowStockEl.textContent = lowStock;
  totalValueEl.textContent = formatPeso(totalValue);
}

function deleteProduct(index) {
  const item = products[index];
  if (!item) return;

  const confirmDelete = confirm(`Are you sure you want to delete "${item.name}"?`);
  if (confirmDelete) {
    products.splice(index, 1);
    saveProducts();
    renderProducts();
    renderInventory();
    renderDashboard();
  }
}

function editProduct(index) {
  const item = products[index];
  if (!item) return;

  const newName = prompt("Edit product name:", item.name);
  const newCategory = prompt("Edit category (Main / Sides / Drinks):", item.category);
  const newPrice = prompt("Edit price:", item.price);
  const newStock = prompt("Edit stock:", item.stock);

  if (!newName || !newCategory || !newPrice || !newStock) return;

  item.name = newName;
  item.category = newCategory;
  item.price = parseFloat(newPrice);
  item.stock = parseInt(newStock);

  saveProducts();
  renderProducts();
  renderInventory();
  renderDashboard();
}

function addProduct() {
  const name = prompt("Enter product name:");
  const category = prompt("Enter category (Main / Sides / Drinks):");
  const price = prompt("Enter price:");
  const stock = prompt("Enter stock:");

  if (!name || !category || !price || !stock) {
    alert("Please complete all fields!");
    return;
  }

  products.push({
    id: Date.now(),
    name: name,
    category: category,
    price: parseFloat(price),
    stock: parseInt(stock)
  });

  saveProducts();
  renderProducts();
  renderInventory();
  renderDashboard();
}

if (openBtn && modal) {
  openBtn.addEventListener("click", () => {
    modal.classList.add("show");
  });
}

if (closeBtn && modal) {
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("show");
  });
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("productName").value;
    const category = document.getElementById("productCategory").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const stock = parseInt(document.getElementById("productStock").value);

    products.push({
      id: Date.now(),
      name,
      category,
      price,
      stock
    });

    saveProducts();
    renderProducts();
    renderInventory();
    renderDashboard();

    form.reset();
    if (modal) modal.classList.remove("show");
  });
}

function computeOrderSubtotal(order) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function renderSalesSummary() {
  const totalOrdersEl = document.getElementById("salesTotalOrders");
  const totalRevenueEl = document.getElementById("salesTotalRevenue");
  const todayOrdersEl = document.getElementById("salesTodayOrders");
  const todayRevenueEl = document.getElementById("salesTodayRevenue");

  if (!totalOrdersEl || !totalRevenueEl || !todayOrdersEl || !todayRevenueEl) {
    return;
  }

  const totalOrders = salesOrders.length;
  const totalRevenue = salesOrders.reduce((sum, order) => sum + computeOrderSubtotal(order), 0);

  const todayString = new Date().toLocaleDateString();
  const todaysOrders = salesOrders.filter(order => order.date.includes(todayString));
  const todayRevenue = todaysOrders.reduce((sum, order) => sum + computeOrderSubtotal(order), 0);

  totalOrdersEl.textContent = totalOrders;
  totalRevenueEl.textContent = formatPeso(totalRevenue);
  todayOrdersEl.textContent = todaysOrders.length;
  todayRevenueEl.textContent = formatPeso(todayRevenue);
}

function renderRecentOrders() {
  const recentOrdersList = document.getElementById("recentOrdersList");
  if (!recentOrdersList) return;

  recentOrdersList.innerHTML = "";

  salesOrders.forEach((order, index) => {
    const total = computeOrderSubtotal(order);
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    const orderRow = document.createElement("div");
    orderRow.className = "order-row";
    if (index === 0) orderRow.classList.add("active");

    orderRow.innerHTML = `
      <div class="order-row-top">
        <span class="order-id">${order.id}</span>
        <span class="order-amount">${formatPeso(total)}</span>
      </div>
      <div class="order-row-bottom">
        <span>${totalItems} items</span>
        <span>${order.date}</span>
      </div>
    `;

    orderRow.addEventListener("click", () => {
      document.querySelectorAll(".order-row").forEach(row => row.classList.remove("active"));
      orderRow.classList.add("active");
      renderOrderDetails(order);
    });

    recentOrdersList.appendChild(orderRow);
  });

  if (salesOrders.length > 0) {
    renderOrderDetails(salesOrders[0]);
  }
}

function renderOrderDetails(order) {
  const orderDetailsBox = document.getElementById("orderDetailsBox");
  if (!orderDetailsBox) return;

  const subtotal = computeOrderSubtotal(order);
  const total = subtotal;

  let itemsHtml = "";
  order.items.forEach(item => {
    const lineTotal = item.price * item.quantity;
    itemsHtml += `
      <div class="order-item-line">
        <div>
          <div class="order-item-name">${item.name}</div>
          <div class="order-item-meta">${formatPeso(item.price)} × ${item.quantity}</div>
        </div>
        <div class="order-item-price">${formatPeso(lineTotal)}</div>
      </div>
    `;
  });

  orderDetailsBox.innerHTML = `
    <div class="details-order-id">${order.id}</div>
    <div class="details-date">${order.date}</div>
    <div class="status-badge">${order.status}</div>

    <div class="order-items-block">
      ${itemsHtml}
    </div>

    <div class="order-summary-block">
      <div class="summary-line">
        <span>Subtotal:</span>
        <span>${formatPeso(subtotal)}</span>
      </div>
      <div class="summary-total">
        <span>Total:</span>
        <span>${formatPeso(total)}</span>
      </div>
    </div>
  `;
}

function renderSalesPage() {
  renderSalesSummary();
  renderRecentOrders();
}

function renderDashboard() {
  const dashboardRevenue = document.getElementById("dashboardRevenue");
  const dashboardOrders = document.getElementById("dashboardOrders");
  const dashboardProducts = document.getElementById("dashboardProducts");
  const dashboardInventoryValue = document.getElementById("dashboardInventoryValue");
  const topSellingList = document.getElementById("topSellingList");
  const salesByCategoryList = document.getElementById("salesByCategoryList");

  if (
    !dashboardRevenue ||
    !dashboardOrders ||
    !dashboardProducts ||
    !dashboardInventoryValue ||
    !topSellingList ||
    !salesByCategoryList
  ) {
    return;
  }

  const totalRevenue = salesOrders.reduce((sum, order) => sum + computeOrderSubtotal(order), 0);
  dashboardRevenue.textContent = formatPeso(totalRevenue);
  dashboardOrders.textContent = salesOrders.length;
  dashboardProducts.textContent = products.length;

  const totalInventoryValue = products.reduce((sum, item) => {
    return sum + item.price * item.stock;
  }, 0);
  dashboardInventoryValue.textContent = formatPeso(totalInventoryValue);

  const productSales = {};
  const categorySales = {};

  salesOrders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.name]) {
        productSales[item.name] = { quantity: 0, revenue: 0 };
      }

      productSales[item.name].quantity += item.quantity;
      productSales[item.name].revenue += item.price * item.quantity;

      const matchedProduct = products.find(
        product => product.name.toLowerCase() === item.name.toLowerCase()
      );

      const category = matchedProduct ? matchedProduct.category : "Other";

      if (!categorySales[category]) {
        categorySales[category] = 0;
      }

      categorySales[category] += item.price * item.quantity;
    });
  });

  const sortedProducts = Object.entries(productSales).sort((a, b) => b[1].quantity - a[1].quantity);
  const sortedCategories = Object.entries(categorySales).sort((a, b) => b[1] - a[1]);

  topSellingList.innerHTML = "";
  salesByCategoryList.innerHTML = "";

  if (sortedProducts.length === 0) {
    topSellingList.innerHTML = `<p class="empty-sales-text">No sales data yet.</p>`;
  } else {
    sortedProducts.forEach(([name, data]) => {
      topSellingList.innerHTML += `
        <div class="dashboard-item">
          <div>
            <div class="dashboard-item-name">${name}</div>
            <div class="dashboard-item-sub">${data.quantity} sold</div>
          </div>
          <div class="dashboard-item-value">${formatPeso(data.revenue)}</div>
        </div>
      `;
    });
  }

  if (sortedCategories.length === 0) {
    salesByCategoryList.innerHTML = `<p class="empty-sales-text">No category sales yet.</p>`;
  } else {
    sortedCategories.forEach(([category, amount]) => {
      salesByCategoryList.innerHTML += `
        <div class="dashboard-item">
          <div>
            <div class="dashboard-item-name">${category}</div>
            <div class="dashboard-item-sub">Category sales</div>
          </div>
          <div class="dashboard-item-value">${formatPeso(amount)}</div>
        </div>
      `;
    });
  }
}

function resetSystemData() {
  localStorage.removeItem("products");
  localStorage.removeItem("salesOrders");
  location.reload();
}

displayDate();
renderProducts();
renderCart();
renderInventory();
renderSalesPage();
renderDashboard();

function resetSystemData() {
  const confirmReset = confirm("Are you sure you want to reset all data?");

  if (confirmReset) {
    localStorage.clear();
    location.reload();
  }
}