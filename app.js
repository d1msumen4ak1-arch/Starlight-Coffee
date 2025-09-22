// Keys untuk localStorage
const PRODUCTS_KEY = 'coffee_products_v1';
const CART_KEY = 'coffee_cart_v1';

// Sample produk awal
const sampleProducts = [
  {id: id(), name: 'Cappuccino', price: 28000, desc: 'Espresso, susu berbusa, sentuhan cocoa.', img: 'images/cappuccino.jpg'},
  {id: id(), name: 'Tiramisu Latte', price: 32000, desc: 'Perpaduan espresso & rasa tiramisu lembut.', img: 'images/tiramisu_latte.jpg'},
  {id: id(), name: 'Banana Bread', price: 25000, desc: 'Roti pisang panggang, tekstur lembut.', img: 'images/banana_bread.jpg'}
];

// util
function id(){return Date.now().toString(36) + Math.random().toString(36).slice(2,7)}
function save(key,data){localStorage.setItem(key,JSON.stringify(data))}
function load(key, fallback){ const s = localStorage.getItem(key); return s? JSON.parse(s) : fallback }

// data utama
let products = load(PRODUCTS_KEY, sampleProducts);
let cart = load(CART_KEY, []);

// DOM
const productsEl = document.getElementById('products');
const btnOpenAdd = document.getElementById('btn-open-add');
const modalAdd = document.getElementById('modal-add');
const formAdd = document.getElementById('form-add');
const btnCancelAdd = document.getElementById('btn-cancel-add');
const yearEl = document.getElementById('year');
const cartCount = document.getElementById('cart-count');
const btnOpenCart = document.getElementById('btn-open-cart');
const modalCart = document.getElementById('modal-cart');
const btnCloseCart = document.getElementById('btn-close-cart');
const cartList = document.getElementById('cart-list');
const cartTotal = document.getElementById('cart-total');
const btnCheckout = document.getElementById('btn-checkout');

yearEl.textContent = new Date().getFullYear();

// Render produk
function renderProducts(){
  productsEl.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div'); 
    card.className='card';

    const img = document.createElement('img'); 
    img.src = p.img; 
    img.alt = p.name;

    const title = document.createElement('h4'); 
    title.textContent = p.name;

    const price = document.createElement('div'); 
    price.className='price'; 
    price.textContent = formatPrice(p.price);

    const desc = document.createElement('p'); 
    desc.textContent = p.desc;

    const actions = document.createElement('div'); 
    actions.className='actions';

    // tombol tambah ke keranjang
    const addBtn = document.createElement('button'); 
    addBtn.className='add-btn'; 
    addBtn.textContent='Tambah ke Keranjang';
    addBtn.onclick = ()=>{ addToCart(p.id) };

    // tombol hapus produk
    const delBtn = document.createElement('button'); 
    delBtn.className='del-btn'; 
    delBtn.textContent='Hapus Produk';
    delBtn.onclick = ()=>{
      if(confirm(`Yakin ingin menghapus ${p.name}?`)){
        products = products.filter(x => x.id !== p.id);
        save(PRODUCTS_KEY, products);
        renderProducts();
      }
    };

    actions.appendChild(addBtn);
    actions.appendChild(delBtn);

    card.appendChild(img); 
    card.appendChild(title); 
    card.appendChild(price); 
    card.appendChild(desc); 
    card.appendChild(actions);

    productsEl.appendChild(card);
  })
}

// Format harga jadi Rupiah
function formatPrice(n){ 
  return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); 
}

// Tambah ke keranjang
function addToCart(productId){
  const p = products.find(x=>x.id===productId); 
  if(!p) return;
  const existing = cart.find(c=>c.id===productId);
  if(existing) existing.qty += 1; 
  else cart.push({id:productId, name:p.name, price:p.price, img:p.img, qty:1});
  save(CART_KEY, cart); 
  updateCartUI();
  alert(`${p.name} ditambahkan ke keranjang`);
}

// Update UI jumlah item keranjang
function updateCartUI(){ 
  cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0); 
}

// Modal tambah produk
btnOpenAdd.addEventListener('click', ()=> modalAdd.classList.remove('hidden'))
btnCancelAdd.addEventListener('click', ()=> modalAdd.classList.add('hidden'))

formAdd.addEventListener('submit', e=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(formAdd).entries());
  const newP = { id: id(), name: data.name, price: Number(data.price), desc: data.desc, img: data.img };
  products.unshift(newP); 
  save(PRODUCTS_KEY, products); 
  renderProducts(); 
  formAdd.reset(); 
  modalAdd.classList.add('hidden');
})

// Modal keranjang
btnOpenCart.addEventListener('click', ()=>{ renderCart(); modalCart.classList.remove('hidden') })
btnCloseCart.addEventListener('click', ()=> modalCart.classList.add('hidden'))

// Render isi keranjang
function renderCart(){
  cartList.innerHTML = '';
  if(cart.length===0){ 
    cartList.innerHTML = '<p>Keranjang kosong</p>'; 
  }
  cart.forEach(item=>{
    const el = document.createElement('div'); 
    el.className='cart-item';

    const img = document.createElement('img'); 
    img.src=item.img; 
    img.alt = item.name;

    const info = document.createElement('div'); 
    info.style.flex='1';
    info.innerHTML = `<strong>${item.name}</strong><div>${formatPrice(item.price)} x ${item.qty}</div>`;

    const controls = document.createElement('div');
    const plus = document.createElement('button'); 
    plus.textContent='+'; 
    plus.onclick = ()=>{ item.qty++; save(CART_KEY,cart); renderCart(); updateCartUI(); }

    const minus = document.createElement('button'); 
    minus.textContent='-'; 
    minus.onclick = ()=>{ 
      item.qty--; 
      if(item.qty<=0){ cart = cart.filter(c=>c.id!==item.id) } 
      save(CART_KEY,cart); 
      renderCart(); 
      updateCartUI(); 
    }

    const remove = document.createElement('button'); 
    remove.textContent='Hapus'; 
    remove.onclick = ()=>{ 
      cart = cart.filter(c=>c.id!==item.id); 
      save(CART_KEY,cart); 
      renderCart(); 
      updateCartUI(); 
    }

    controls.appendChild(plus); 
    controls.appendChild(minus); 
    controls.appendChild(remove);

    el.appendChild(img); 
    el.appendChild(info); 
    el.appendChild(controls);

    cartList.appendChild(el);
  })
  const total = cart.reduce((s,i)=>s + i.price*i.qty,0);
  cartTotal.textContent = 'Total: ' + formatPrice(total);
}

// Checkout
btnCheckout.addEventListener('click', ()=>{
  if(cart.length===0){ 
    alert('Keranjang kosong'); 
    return 
  }
  const total = cart.reduce((s,i)=>s + i.price*i.qty,0);
  const orders = load('coffee_orders_v1', []);
  const newOrder = { id:id(), items:cart, total, date: new Date().toISOString() };
  orders.push(newOrder); 
  save('coffee_orders_v1', orders);
  cart = []; 
  save(CART_KEY, cart); 
  renderCart(); 
  updateCartUI(); 
  modalCart.classList.add('hidden');
  alert('Pesanan berhasil dibuat. Terima kasih!');
})

// Init
renderProducts(); 
updateCartUI();

// Error handling untuk gambar
window.addEventListener('error', e=>{
  if (e.target && e.target.tagName === 'IMG'){
    e.target.src = 'images/placeholder.png';
  }
}, true);
