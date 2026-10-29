const initialHotels = [
  {id:1,name:"The Fern House",city:"Chennai",category:"Luxury",price:6200,rating:"4.9",reviews:128,emoji:"🏨",tone:"#d7e5d8",description:"Quiet luxury with leafy courtyards and a relaxing pool."},
  {id:2,name:"Harbor & Hearth",city:"Pondicherry",category:"Business",price:4100,rating:"4.7",reviews:96,emoji:"🏢",tone:"#dce5ed",description:"A smart, comfortable base close to the city centre."},
  {id:3,name:"Mango Tree Stay",city:"Coimbatore",category:"Budget",price:1900,rating:"4.6",reviews:74,emoji:"🌴",tone:"#f2e4c9",description:"A warm, affordable stay with everything you need."},
  {id:4,name:"The Hillview Retreat",city:"Ooty",category:"Luxury",price:7800,rating:"4.9",reviews:203,emoji:"🏡",tone:"#dce9e0",description:"A scenic retreat with mountain views and cosy rooms."}
];
const $ = id => document.getElementById(id);
let hotels = JSON.parse(localStorage.getItem("stayease_hotels") || "null") || initialHotels;
let bookings = JSON.parse(localStorage.getItem("stayease_bookings") || "[]");
let activeCategory = "All";
let currentHotel = null;
function saveHotels(){localStorage.setItem("stayease_hotels",JSON.stringify(hotels))}
function saveBookings(){localStorage.setItem("stayease_bookings",JSON.stringify(bookings))}
function money(value){return "₹"+Number(value).toLocaleString("en-IN")}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function showToast(message){const t=$("toast");t.textContent=message;t.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),2600)}
function filteredHotels(){
 const term=$("destination").value.trim().toLowerCase();
 return hotels.filter(h=>(activeCategory==="All"||h.category===activeCategory)&&(!term||(h.name+" "+h.city+" "+h.category).toLowerCase().includes(term)));
}
function renderHotels(){
 const list=filteredHotels();
 $("resultCount").textContent=`${list.length} stay${list.length===1?"":"s"} available`;
 $("emptyState").classList.toggle("hidden",list.length>0);
 $("hotelGrid").innerHTML=list.map(h=>`<article class="hotel-card">
   <div class="hotel-art" style="background:${h.tone||"#e2ebe3"}"><span class="room-tag">${escapeHtml(h.category)}</span><span class="emoji">${h.emoji||"🏨"}</span></div>
   <div class="hotel-body"><p class="hotel-location">⌖ ${escapeHtml(h.city)}</p><h3>${escapeHtml(h.name)}</h3><p class="hotel-location">${escapeHtml(h.description||"A comfortable stay for your next trip.")}</p>
   <div class="rating">★ ${h.rating||"4.7"} <span>(${h.reviews||"New"} reviews)</span></div>
   <div class="hotel-bottom"><div class="price"><strong>${money(h.price)}</strong><small> / night</small></div><button class="book-btn" data-book="${h.id}">View & book ↗</button></div></div>
 </article>`).join("");
}
function renderBookings(){
 if(!bookings.length){$("bookingList").innerHTML='<div class="empty-bookings">Your confirmed demo bookings will appear here.</div>';return}
 $("bookingList").innerHTML=bookings.map(b=>`<article class="booking-card"><div><h3>${escapeHtml(b.hotel)}</h3><p>${escapeHtml(b.city)} · ${escapeHtml(b.checkin)} to ${escapeHtml(b.checkout)}<br>${escapeHtml(b.name)} · ${escapeHtml(b.guests)} guest(s) · Reference: ${escapeHtml(b.reference)}</p></div><div class="booking-price"><strong>${money(b.total)}</strong><button class="cancel-btn" data-cancel="${b.id}">Cancel demo booking</button></div></article>`).join("");
}
function nightsBetween(a,b){return Math.round((new Date(b+"T00:00:00")-new Date(a+"T00:00:00"))/86400000)}
function openBooking(hotel){
 currentHotel=hotel;
 $("selectedHotelId").value=hotel.id;
 $("dialogHotelName").textContent=hotel.name;
 $("dialogHotelMeta").textContent=`${hotel.city} · ${hotel.category} · ${money(hotel.price)} per night`;
 const today=new Date(); const tomorrow=new Date(today);tomorrow.setDate(today.getDate()+1);const after=new Date(today);after.setDate(today.getDate()+2);
 const fmt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
 $("bookCheckin").min=fmt(today);$("bookCheckout").min=fmt(tomorrow);
 $("bookCheckin").value=fmt(tomorrow);$("bookCheckout").value=fmt(after);
 $("guestName").value="";$("guestEmail").value="";
 updateTotal();$("bookingDialog").showModal();
}
function updateTotal(){
 if(!currentHotel)return;
 const nights=nightsBetween($("bookCheckin").value,$("bookCheckout").value);
 $("estimatedTotal").textContent=nights>0?money(nights*currentHotel.price):"Choose valid dates";
}
$("hotelGrid").addEventListener("click",e=>{const btn=e.target.closest("[data-book]");if(btn){const hotel=hotels.find(h=>h.id===Number(btn.dataset.book));if(hotel)openBooking(hotel)}});
document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));btn.classList.add("active");activeCategory=btn.dataset.category;renderHotels()}));
$("searchBtn").addEventListener("click",()=>{renderHotels();$("hotels").scrollIntoView({behavior:"smooth"});if($("checkin").value&&$("checkout").value&&nightsBetween($("checkin").value,$("checkout").value)<=0)showToast("Check-out must be after check-in.")});
$("destination").addEventListener("input",renderHotels);
$("closeDialog").addEventListener("click",()=>$("bookingDialog").close());
$("bookCheckin").addEventListener("change",()=>{const inDate=$("bookCheckin").value;if(inDate){const d=new Date(inDate+"T00:00:00");d.setDate(d.getDate()+1);const min=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;$("bookCheckout").min=min;if($("bookCheckout").value<=inDate)$("bookCheckout").value=min}updateTotal()});
$("bookCheckout").addEventListener("change",updateTotal);
$("bookingForm").addEventListener("submit",e=>{
 e.preventDefault();const checkin=$("bookCheckin").value,checkout=$("bookCheckout").value,nights=nightsBetween(checkin,checkout);
 if(nights<=0){showToast("Please choose valid check-in and check-out dates.");return}
 const b={id:Date.now(),hotel:currentHotel.name,city:currentHotel.city,name:$("guestName").value.trim(),email:$("guestEmail").value.trim(),checkin,checkout,guests:$("bookGuests").value,total:nights*currentHotel.price,reference:"SE"+Math.random().toString(36).slice(2,8).toUpperCase()};
 bookings.unshift(b);saveBookings();renderBookings();$("bookingDialog").close();showToast("Demo booking confirmed. No payment was taken.");$("bookings").scrollIntoView({behavior:"smooth"});
});
$("hotelForm").addEventListener("submit",e=>{
 e.preventDefault();const name=$("hotelName").value.trim(),city=$("hotelCity").value.trim(),price=Number($("hotelPrice").value),category=$("hotelCategory").value;
 if(!name||!city||price<500){showToast("Enter valid hotel details.");return}
 hotels.push({id:Date.now(),name,city,price,category,rating:"New",reviews:0,emoji:category==="Luxury"?"🏨":category==="Business"?"🏢":"🛏️",tone:category==="Luxury"?"#d7e5d8":category==="Business"?"#dce5ed":"#f2e4c9",description:"A newly added hotel listing."});
 saveHotels();e.target.reset();activeCategory="All";document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b.dataset.category==="All"));renderHotels();showToast("Hotel listing added.");
});
$("admin").addEventListener("click",e=>{const btn=e.target.closest("[data-remove]");if(btn){hotels=hotels.filter(h=>h.id!==Number(btn.dataset.remove));saveHotels();renderHotels();showToast("Hotel listing removed.")}});
$("bookingList").addEventListener("click",e=>{const btn=e.target.closest("[data-cancel]");if(btn){bookings=bookings.filter(b=>b.id!==Number(btn.dataset.cancel));saveBookings();renderBookings();showToast("Demo booking cancelled.")}});
$("profileBtn").addEventListener("click",()=>showToast("Guest profile demo: create a real account after backend integration."));
$("checkin").addEventListener("change",()=>{if($("checkin").value){const d=new Date($("checkin").value+"T00:00:00");d.setDate(d.getDate()+1);const min=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;$("checkout").min=min;if($("checkout").value<min)$("checkout").value=min}});
renderHotels();renderBookings();
