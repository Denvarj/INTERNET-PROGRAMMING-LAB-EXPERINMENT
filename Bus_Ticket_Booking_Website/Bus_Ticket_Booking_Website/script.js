const $=id=>document.getElementById(id);
const initialBuses=[
{id:1,name:"GreenLine Express",from:"Chennai",to:"Coimbatore",depart:"21:30",arrive:"05:45",type:"AC Sleeper",price:850,seats:18,duration:"8h 15m",rating:"4.8"},
{id:2,name:"Southern Comfort",from:"Chennai",to:"Coimbatore",depart:"22:15",arrive:"06:30",type:"AC Seater",price:620,seats:24,duration:"8h 15m",rating:"4.6"},
{id:3,name:"CityLink Travels",from:"Chennai",to:"Coimbatore",depart:"20:45",arrive:"06:00",type:"Non-AC",price:430,seats:31,duration:"9h 15m",rating:"4.4"},
{id:4,name:"Highway Star",from:"Chennai",to:"Coimbatore",depart:"23:00",arrive:"07:00",type:"AC Sleeper",price:990,seats:12,duration:"8h",rating:"4.9"},
{id:5,name:"Kongu Roadways",from:"Coimbatore",to:"Chennai",depart:"21:00",arrive:"05:30",type:"AC Sleeper",price:880,seats:16,duration:"8h 30m",rating:"4.7"},
{id:6,name:"Madurai Fast",from:"Chennai",to:"Madurai",depart:"22:00",arrive:"05:30",type:"AC Seater",price:570,seats:20,duration:"7h 30m",rating:"4.5"}
];
let buses=JSON.parse(localStorage.getItem("routego_buses")||"null")||initialBuses;
let tickets=JSON.parse(localStorage.getItem("routego_tickets")||"[]");
let activeType="All", selectedBus=null;
const today=new Date();$("travelDate").min=fmt(today);$("travelDate").value=fmt(new Date(today.getTime()+86400000));
function fmt(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function money(n){return "₹"+Number(n).toLocaleString("en-IN")}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$("toast").classList.remove("show"),2500)}
function saveBuses(){localStorage.setItem("routego_buses",JSON.stringify(buses))}
function saveTickets(){localStorage.setItem("routego_tickets",JSON.stringify(tickets))}
function renderBuses(){
 const from=$("from").value,to=$("to").value,date=$("travelDate").value;
 const list=buses.filter(b=>b.from.toLowerCase()===from.toLowerCase()&&b.to.toLowerCase()===to.toLowerCase()&&(activeType==="All"||b.type===activeType));
 $("resultCount").textContent=`${list.length} bus${list.length===1?"":"es"} found`;
 $("noResults").classList.toggle("hidden",list.length>0);
 $("busList").innerHTML=list.map(b=>`<article class="bus-card">
 <div class="operator"><div class="operator-icon">🚌</div><div><h3>${esc(b.name)}</h3><p>★ ${b.rating||"New"} · ${esc(b.type)}</p></div></div>
 <div class="route-time"><strong>${esc(b.depart)}</strong><span>${esc(b.from)}</span></div>
 <div><div class="route-line">${esc(b.duration)}</div><div class="route-time" style="margin-top:7px"><strong>${esc(b.arrive)}</strong><span>${esc(b.to)}</span></div></div>
 <div class="bus-meta"><b>${esc(b.type)}</b><small>${b.seats} seats available</small><small>Journey: ${esc(date||"Select date")}</small></div>
 <div class="fare"><strong>${money(b.price)}</strong><small>per seat</small><div class="seat-note">${b.seats} seats left</div><button class="book-btn" data-book="${b.id}">Select seats →</button></div>
 </article>`).join("");
}
function renderTickets(){
 if(!tickets.length){$("ticketList").innerHTML='<div class="empty">Your confirmed demo tickets will appear here.</div>';return}
 $("ticketList").innerHTML=tickets.map(t=>`<article class="ticket-card"><div><h3>🚌 ${esc(t.busName)}</h3><p>${esc(t.from)} → ${esc(t.to)} · ${esc(t.date)}<br>Passenger: ${esc(t.name)} · Seat: ${esc(t.seat)} · Ref: ${esc(t.ref)}<br>${esc(t.email)}</p></div><div class="ticket-fare"><strong>${money(t.price)}</strong><button class="cancel-btn" data-cancel="${t.id}">Cancel demo ticket</button></div></article>`).join("");
}
function openBooking(bus){
 selectedBus=bus;$("busId").value=bus.id;$("bookingTitle").textContent=bus.name;$("bookingMeta").textContent=`${bus.from} → ${bus.to} · ${bus.depart} · ${bus.type} · ${$("travelDate").value}`;
 $("seatSelect").innerHTML=Array.from({length:Math.min(bus.seats,20)},(_,i)=>`<option value="${i+1}A">Seat ${i+1}A</option>`).join("");
 $("totalFare").textContent=money(bus.price*Number($("passengers").value));$("bookingDialog").showModal();
}
$("swapBtn").addEventListener("click",()=>{const v=$("from").value;$("from").value=$("to").value;$("to").value=v;renderBuses()});
$("searchForm").addEventListener("submit",e=>{e.preventDefault();if($("from").value===$("to").value){toast("Choose different departure and destination cities.");return}renderBuses();$("results").scrollIntoView({behavior:"smooth"})});
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");activeType=b.dataset.type;renderBuses()}));
$("busList").addEventListener("click",e=>{const b=e.target.closest("[data-book]");if(b){const bus=buses.find(x=>x.id===Number(b.dataset.book));if(bus)openBooking(bus)}});
$("passengers").addEventListener("change",()=>{if(selectedBus)$("totalFare").textContent=money(selectedBus.price*Number($("passengers").value))});
$("closeDialog").addEventListener("click",()=>$("bookingDialog").close());
$("bookingForm").addEventListener("submit",e=>{e.preventDefault();if(!selectedBus)return;const t={id:Date.now(),busName:selectedBus.name,from:selectedBus.from,to:selectedBus.to,date:$("travelDate").value,name:$("passengerName").value.trim(),email:$("passengerEmail").value.trim(),seat:$("seatSelect").value,price:selectedBus.price*Number($("passengers").value),ref:"RG"+Math.random().toString(36).slice(2,8).toUpperCase()};tickets.unshift(t);saveTickets();renderTickets();$("bookingDialog").close();toast("Demo ticket confirmed. No payment was taken.");$("myTickets").scrollIntoView({behavior:"smooth"})});
$("ticketList").addEventListener("click",e=>{const b=e.target.closest("[data-cancel]");if(b){tickets=tickets.filter(t=>t.id!==Number(b.dataset.cancel));saveTickets();renderTickets();toast("Demo ticket cancelled.")}});
$("busForm").addEventListener("submit",e=>{e.preventDefault();const bus={id:Date.now(),name:$("busName").value.trim(),from:$("busFrom").value.trim(),to:$("busTo").value.trim(),depart:$("busTime").value,arrive:"Next day",type:$("busType").value,price:Number($("busPrice").value),seats:30,duration:"Set by operator",rating:"New"};if(bus.from.toLowerCase()===bus.to.toLowerCase()){toast("Departure and destination must differ.");return}buses.push(bus);saveBuses();e.target.reset();activeType="All";document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x.dataset.type==="All"));renderBuses();toast("Bus route added to demo listings.")});
$("accountBtn").addEventListener("click",()=>toast("Account demo: connect a backend to enable secure registration and login."));
renderBuses();renderTickets();
