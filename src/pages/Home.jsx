import { useEffect } from 'react'

function getCart(){
  try{ return JSON.parse(localStorage.getItem('rf_cart')||'[]') }catch{ return [] }
}

function updateCartCount(){
  const el = document.getElementById('cartCount')
  if (!el) return
  const total = getCart().reduce((sum,i)=> sum + (i.qty||1), 0)
  if (total > 0){
    el.textContent = String(total)
    el.style.display = 'inline-block'
  } else {
    el.style.display = 'none'
  }
}

function openSizeModalFromEl(card){
  const modal = document.getElementById('sizeModal')
  const modalImage = document.getElementById('modalImage')
  const modalPrice = document.getElementById('modalPrice')
  if (!modal) return
  modal.dataset.productImage = card.querySelector('img')?.getAttribute('src') || ''
  modal.dataset.productPrice = card.querySelector('.p-price')?.textContent || ''
  modal.dataset.productTitle = card.querySelector('h3')?.textContent || 'T-Shirt'
  if (modalImage){
    modalImage.src = modal.dataset.productImage || ''
    modalImage.style.display = modalImage.src ? 'block' : 'none'
  }
  if (modalPrice){
    modalPrice.textContent = modal.dataset.productPrice || ''
  }
  const sizeOptions = document.getElementById('sizeOptions')
  if (sizeOptions){
    sizeOptions.innerHTML = ''
    ;(card?.dataset?.sizes || 'S,M,L,XL').split(',').map(s=>s.trim()).filter(Boolean).forEach(sz=>{
      const b = document.createElement('button')
      b.className = 'size-option'
      b.setAttribute('data-size', sz)
      b.setAttribute('aria-pressed','false')
      b.textContent = sz
      sizeOptions.appendChild(b)
    })
  }
  modal.setAttribute('aria-hidden','false')
}

export default function Home(){
  useEffect(()=>{
    function renderFeaturedFromStorage(){
      const grid = document.querySelector('#featured .product-grid')
      if (!grid) return
      try{
        const items = JSON.parse(localStorage.getItem('rf_products') || '[]')
        grid.querySelectorAll('[data-dynamic="1"]').forEach(n=> n.remove())
        items.forEach((p)=>{
          const art = document.createElement('article')
          art.className = 'p-card'
          art.setAttribute('data-dynamic','1')
          art.dataset.sizes = (p.sizes || []).join(',')
          art.innerHTML = `
            <img src="${p.image || 'https://via.placeholder.com/800x960?text=Image'}" alt="${p.title}" />
            <h3>${p.title}</h3>
            <div class="p-price">₹${p.price} <span class="p-mrp">₹${p.mrp}</span> <span class="p-off"></span></div>
          `
          grid.appendChild(art)
          art.style.cursor = 'pointer'
          art.addEventListener('click', ()=> openSizeModalFromEl(art))
        })
      }catch{}
    }

    updateCartCount()
    renderFeaturedFromStorage()

    const onStorage = (e)=>{
      if (e.key === 'rf_cart') updateCartCount()
      if (e.key === 'rf_products' || e.key === 'rf_products__ts') renderFeaturedFromStorage()
    }
    window.addEventListener('storage', onStorage)
    return ()=> window.removeEventListener('storage', onStorage)
  },[])

  useEffect(()=>{
    const handler = (e)=>{
      const btn = e.target.closest('.size-option')
      if (!btn) return
      btn.parentElement?.querySelectorAll('.size-option').forEach(b=> b.setAttribute('aria-pressed','false'))
      btn.setAttribute('aria-pressed','true')
    }
    const el = document.getElementById('sizeOptions')
    el?.addEventListener('click', handler)
    return ()=> el?.removeEventListener('click', handler)
  }, [])

  const closeModal = ()=>{
    const modal = document.getElementById('sizeModal')
    modal?.setAttribute('aria-hidden','true')
  }

  const confirmAdd = ()=>{
    const modal = document.getElementById('sizeModal')
    if (!modal) return
    const selected = document.querySelector('#sizeOptions .size-option[aria-pressed="true"]')
    if (!selected){
      const toast = document.getElementById('toast')
      if (toast){
        toast.textContent = 'Please select a size'
        toast.classList.add('show')
        setTimeout(()=> toast.classList.remove('show'), 1400)
      }
      return
    }
    const title = modal.dataset.productTitle || 'T-Shirt'
    const image = modal.dataset.productImage || ''
    const priceText = modal.dataset.productPrice || ''
    const match = priceText.match(/₹\s*(\d+)/)
    const price = match ? parseInt(match[1],10) : 0
    const item = { id: Date.now(), title, size: selected.getAttribute('data-size') || 'M', image, price, qty: 1 }
    try{
      const cart = JSON.parse(localStorage.getItem('rf_cart') || '[]')
      cart.push(item)
      localStorage.setItem('rf_cart', JSON.stringify(cart))
    }catch{}
    updateCartCount()
    const toast = document.getElementById('toast')
    if (toast){
      toast.textContent = `${title} (${selected.getAttribute('data-size')}) added to cart`
      toast.classList.add('show')
      setTimeout(()=> toast.classList.remove('show'), 1400)
    }
    closeModal()
  }

  return (
    <>
      <section className="hero-men">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1>Men's New Season</h1>
            <p>Relaxed fits, bold graphics, everyday essentials. Fresh drops weekly.</p>
            <div className="hero-actions">
              <a className="btn primary" href="#featured">Shop T-Shirts</a>
              <a className="btn secondary" href="#categories">Explore Categories</a>
            </div>
          </div>
          <div className="hero-media" aria-hidden="true" style={{position:'relative',minHeight:340,borderRadius:16,overflow:'hidden'}}>
            <video autoPlay muted loop playsInline preload="metadata" poster="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}>
              <source src="/7764692-uhd_4096_2160_25fps.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <section id="categories" className="container categories">
        <h2>Shop by Category</h2>
        <div className="cat-grid">
          <a className="cat-card" href="#featured">
            <img src="/pexels-05thaylan-26447865.jpg" alt="T-Shirts" onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://via.placeholder.com/800x800?text=T-Shirts'}} />
            <span>T-Shirts</span>
          </a>
        </div>
      </section>

      <section id="featured" className="container featured">
        <h2>Featured for Men</h2>
        <div className="product-grid"></div>
      </section>

      <div id="sizeModal" className="modal" aria-hidden="true" role="dialog" aria-labelledby="sizeModalTitle">
        <div className="modal-backdrop" data-close="modal" onClick={closeModal}></div>
        <div className="modal-dialog" role="document">
          <button className="modal-close" aria-label="Close" data-close="modal" onClick={closeModal}>×</button>
          <h3 id="sizeModalTitle">Select size</h3>
          <img id="modalImage" src="" alt="Selected product" style={{width:'100%',height:'auto',borderRadius:12,margin:'8px 0 12px 0',display:'block'}} />
          <div id="modalPrice" className="modal-price" style={{marginBottom:12}}></div>
          <div className="size-grid" id="sizeOptions"></div>
          <button className="btn primary" id="confirmAdd" onClick={confirmAdd}>Add to cart</button>
        </div>
      </div>

      <div id="toast" className="toast" role="status" aria-live="polite"></div>
    </>
  )
}


