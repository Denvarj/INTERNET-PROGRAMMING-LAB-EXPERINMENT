const starterBooks = [
  {id:1,title:"Clean Code",author:"Robert C. Martin",category:"Technology",available:true,color:"#285b49",symbol:"⌘",description:"A practical guide to writing readable, maintainable software."},
  {id:2,title:"A Brief History of Time",author:"Stephen Hawking",category:"Science",available:true,color:"#365a75",symbol:"✦",description:"An accessible introduction to the universe, time, and cosmology."},
  {id:3,title:"The Alchemist",author:"Paulo Coelho",category:"Literature",available:true,color:"#b97843",symbol:"☼",description:"A young shepherd follows a journey in search of his personal legend."},
  {id:4,title:"Atomic Habits",author:"James Clear",category:"Business",available:false,color:"#7c6657",symbol:"↗",description:"Small habits and practical systems for making lasting improvements."},
  {id:5,title:"Learning JavaScript",author:"Ethan Brown",category:"Technology",available:true,color:"#b8a14d",symbol:"JS",description:"A hands-on introduction to modern JavaScript programming."},
  {id:6,title:"The Origin of Species",author:"Charles Darwin",category:"Science",available:true,color:"#637f6a",symbol:"❧",description:"A foundational work explaining evolution through natural selection."}
];
let books = JSON.parse(localStorage.getItem("campusLibraryBooks") || "null") || starterBooks;
let currentStudent = JSON.parse(sessionStorage.getItem("campusLibraryStudent") || "null");
const $ = id => document.getElementById(id);
const saveBooks = () => localStorage.setItem("campusLibraryBooks", JSON.stringify(books));
function renderBooks(){
  const query = $("searchInput").value.trim().toLowerCase();
  const category = $("categoryFilter").value;
  const filtered = books.filter(b => (category==="all" || b.category===category) && `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(query));
  $("bookGrid").innerHTML = filtered.map(b => `<article class="book-card"><div class="cover" style="background:${b.color}"><span>${b.symbol}</span></div><div class="book-info"><span class="category">${b.category}</span><h3>${escapeHTML(b.title)}</h3><p>by ${escapeHTML(b.author)}</p><div class="card-bottom"><span class="availability ${b.available?"":"unavailable"}">${b.available?"● Available":"● Borrowed"}</span><button class="small-button" data-details="${b.id}">View details</button></div></div></article>`).join("");
  $("emptyMessage").classList.toggle("hidden", filtered.length>0);
  $("bookCount").textContent=books.length;
  $("availableCount").textContent=books.filter(b=>b.available).length;
  $("borrowCount").textContent=books.filter(b=>!b.available).length;
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderHistory(){
  if(!currentStudent){$("historyList").innerHTML='<p class="muted">Sign in to view your demo borrowing history.</p>';return;}
  const borrowed=books.filter(b=>!b.available);
  $("historyList").innerHTML=`<p class="muted">Welcome, ${escapeHTML(currentStudent.name)} (${escapeHTML(currentStudent.email)})</p>`+(borrowed.length?borrowed.map(b=>`<div class="history-item"><strong>${escapeHTML(b.title)}</strong><small>Demo issue date: 20 Oct 2026 · Expected return: 27 Oct 2026</small></div>`).join(""):'<p class="muted">No books are currently marked as borrowed.</p>');
}
function renderAdmin(){
  $("adminBookList").innerHTML=books.map(b=>`<div class="admin-row"><span><strong>${escapeHTML(b.title)}</strong><br><small>${escapeHTML(b.author)} · ${b.available?"Available":"Borrowed"}</small></span><button data-delete="${b.id}">Delete</button></div>`).join("");
}
$("searchInput").addEventListener("input",renderBooks);
$("categoryFilter").addEventListener("change",renderBooks);
$("bookGrid").addEventListener("click",e=>{
  const btn=e.target.closest("[data-details]"); if(!btn)return;
  const b=books.find(x=>x.id===Number(btn.dataset.details)); if(!b)return;
  $("bookDetails").innerHTML=`<div class="detail-cover" style="background:${b.color}">${b.symbol}</div><span class="category">${b.category}</span><h2>${escapeHTML(b.title)}</h2><p>by ${escapeHTML(b.author)}</p><p>${escapeHTML(b.description)}</p><p class="availability ${b.available?"":"unavailable"}">${b.available?"Available to borrow":"Currently borrowed"}</p><button id="borrowBtn" class="primary-button" ${b.available?"":"disabled"}>${b.available?"Borrow book":"Not available"}</button><p class="muted">Demo action only; this project does not connect to a real library database.</p>`;
  $("bookDialog").showModal();
  $("borrowBtn").addEventListener("click",()=>{if(!currentStudent){alert("Please sign in under My Account before borrowing.");$("bookDialog").close();$("account").scrollIntoView();return;}b.available=false;saveBooks();renderBooks();renderHistory();$("bookDialog").close();});
});
$("closeDialog").addEventListener("click",()=>$("bookDialog").close());
$("loginForm").addEventListener("submit",e=>{e.preventDefault();currentStudent={name:$("studentName").value.trim(),email:$("studentEmail").value.trim()};sessionStorage.setItem("campusLibraryStudent",JSON.stringify(currentStudent));$("loginMessage").textContent="Signed in for this demo session.";renderHistory();});
$("contactForm").addEventListener("submit",e=>{e.preventDefault();$("contactStatus").textContent="Thank you! Your demo message has been received locally.";e.target.reset();});
$("adminBtn").addEventListener("click",()=>{renderAdmin();$("adminDialog").showModal();});
$("closeAdmin").addEventListener("click",()=>$("adminDialog").close());
$("addBookForm").addEventListener("submit",e=>{e.preventDefault();const palette=["#285b49","#365a75","#b97843","#7c6657","#637f6a"];books.push({id:Date.now(),title:$("newTitle").value.trim(),author:$("newAuthor").value.trim(),category:$("newCategory").value,available:true,color:palette[books.length%palette.length],symbol:"✦",description:"A library catalog entry added through the demo admin dashboard."});saveBooks();renderBooks();renderAdmin();e.target.reset();});
$("adminBookList").addEventListener("click",e=>{const btn=e.target.closest("[data-delete]");if(!btn)return;books=books.filter(b=>b.id!==Number(btn.dataset.delete));saveBooks();renderBooks();renderAdmin();});
renderBooks();renderHistory();