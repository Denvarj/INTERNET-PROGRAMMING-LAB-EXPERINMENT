const cakes = [
  {id:1,name:"Berry Velvet",category:"Birthday",flavor:"Red velvet · cream cheese",price:699,emoji:"🍓"},
  {id:2,name:"Golden Chocolate",category:"Celebration",flavor:"Rich chocolate · ganache",price:799,emoji:"🍫"},
  {id:3,name:"Lavender Dream",category:"Classic",flavor:"Vanilla · blueberry cream",price:649,emoji:"🫐"},
  {id:4,name:"Rainbow Sprinkle",category:"Birthday",flavor:"Vanilla sponge · sprinkles",price:599,emoji:"🌈"},
  {id:5,name:"Caramel Cloud",category:"Celebration",flavor:"Salted caramel · buttercream",price:749,emoji:"🍮"},
  {id:6,name:"Classic Strawberry",category:"Classic",flavor:"Fresh strawberry · whipped cream",price:679,emoji:"🍰"}
];
const sizeMultiplier = {Small:0.6,Medium:1,Large:1.8};
let cartCount = 0;
let selectedCake = null;
const $ = id => document.getElementById(id);
const rupees = n => "₹" + Math.round(n).toLocaleString("en-IN");

function renderCakes(){
  const query = $("searchInput").value.toLowerCase().trim();
  const category = $("categoryFilter").value;
  const shown = cakes.filter(c => (category === "All" || c.category === category) &&
    (c.name.toLowerCase().includes(query) || c.flavor.toLowerCase().includes(query) || c.category.toLowerCase().includes(query)));
  $("cakeGrid").innerHTML = shown.length ? shown.map(c => `
    <article class="cake-card">
      <div class="cake-art">${c.emoji}</div>
      <div class="cake-info"><span class="tag">${c.category}</span><h3>${c.name}</h3>
      <p>${c.flavor}</p><div class="card-bottom"><span class="price">${rupees(c.price)}</span>
      <button class="add-button" data-cake="${c.id}">Customize +</button></div></div>
    </article>`).join("") : `<p class="empty">No cakes found. Try another search.</p>`;
  document.querySelectorAll("[data-cake]").forEach(btn => btn.addEventListener("click", () => openOrder(Number(btn.dataset.cake))));
}
function openOrder(id){
  selectedCake = cakes.find(c => c.id === id);
  $("selectedCakeId").value = selectedCake.id;
  $("selectedCakeName").value = selectedCake.name;
  $("cakeSize").value = "Medium";
  $("quantity").value = 1;
  $("cakeMessage").value = "";
  $("customerName").value = "";
  $("phone").value = "";
  $("address").value = "";
  $("deliveryDate").value = "";
  $("deliveryDate").min = new Date().toISOString().slice(0,10);
  updateTotal();
  $("orderModal").hidden = false;
  document.body.style.overflow = "hidden";
}
function closeOrder(){
  $("orderModal").hidden = true;
  document.body.style.overflow = "";
}
function updateTotal(){
  if(!selectedCake) return;
  const qty = Math.max(1,Math.min(10,Number($("quantity").value)||1));
  $("estimatedTotal").textContent = rupees(selectedCake.price * sizeMultiplier[$("cakeSize").value] * qty);
}
function showToast(message){
  $("toast").textContent = message;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 2600);
}
function getOrders(){ try{return JSON.parse(localStorage.getItem("sweetcrumbs-orders")||"[]")}catch(e){return []} }
function saveOrders(orders){ localStorage.setItem("sweetcrumbs-orders",JSON.stringify(orders)); }
function renderOrders(){
  const orders = getOrders();
  $("ordersList").innerHTML = orders.length ? orders.slice().reverse().map(o => `
    <article class="order-item"><div><strong>${o.cake} · ${o.size}</strong>
    <p>Order ${o.id} · ${o.date} · ${o.customer}</p><p>Delivery: ${o.deliveryDate} · ${o.payment}</p></div>
    <span class="status">${o.status} · ${rupees(o.total)}</span></article>`).join("") :
    `<p class="empty">Your orders will appear here after you place one.</p>`;
}
$("searchInput").addEventListener("input",renderCakes);
$("categoryFilter").addEventListener("change",renderCakes);
$("cakeSize").addEventListener("change",updateTotal);
$("quantity").addEventListener("input",updateTotal);
$("closeModal").addEventListener("click",closeOrder);
$("orderModal").addEventListener("click",e=>{if(e.target===$("orderModal"))closeOrder()});
$("cartBtn").addEventListener("click",()=>document.querySelector("#cakes").scrollIntoView({behavior:"smooth"}));
$("orderForm").addEventListener("submit",e=>{
  e.preventDefault();
  if(!$("orderForm").reportValidity()) return;
  const qty = Math.max(1,Math.min(10,Number($("quantity").value)||1));
  const order = {
    id:"SC"+Math.floor(100000+Math.random()*900000),
    cake:selectedCake.name,size:$("cakeSize").value,quantity:qty,
    message:$("cakeMessage").value.trim(),customer:$("customerName").value.trim(),
    phone:$("phone").value.trim(),address:$("address").value.trim(),
    date:new Date().toLocaleDateString("en-IN"),deliveryDate:$("deliveryDate").value,
    payment:$("paymentMethod").value,
    total:selectedCake.price*sizeMultiplier[$("cakeSize").value]*qty,status:"Order received (demo)"
  };
  const orders=getOrders();orders.push(order);saveOrders(orders);
  cartCount+=qty;$("cartCount").textContent=cartCount;
  closeOrder();renderOrders();
  showToast("Demo order placed! Reference: "+order.id);
  $("orders").scrollIntoView({behavior:"smooth"});
});
renderCakes();renderOrders();
