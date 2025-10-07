import { useEffect, useMemo, useState } from 'react'

function readCart(){
  try{ return JSON.parse(localStorage.getItem('rf_cart')||'[]') }catch{ return [] }
}
function writeCart(items){
  try{ localStorage.setItem('rf_cart', JSON.stringify(items)); localStorage.setItem('rf_cart__ts', String(Date.now())) }catch{}
}

export default function Cart(){
  const [items, setItems] = useState(()=> readCart())

  useEffect(()=>{
    const onStorage = (e)=>{ if (e.key === 'rf_cart') setItems(readCart()) }
    window.addEventListener('storage', onStorage)
    return ()=> window.removeEventListener('storage', onStorage)
  }, [])

  const subtotal = useMemo(()=> items.reduce((s,i)=> s + (i.price||0) * (i.qty||1), 0), [items])

  const setQty = (id, qty)=>{
    const next = items.map(it=> it.id===id ? { ...it, qty: Math.max(1, qty) } : it)
    setItems(next)
    writeCart(next)
    // update badge
    const el = document.getElementById('cartCount')
    if (el){
      const total = next.reduce((sum,i)=> sum + (i.qty||1), 0)
      el.textContent = String(total)
      el.style.display = total>0 ? 'inline-block' : 'none'
    }
  }
  const removeItem = (id)=>{
    const next = items.filter(it=> it.id!==id)
    setItems(next)
    writeCart(next)
    const el = document.getElementById('cartCount')
    if (el){
      const total = next.reduce((sum,i)=> sum + (i.qty||1), 0)
      el.textContent = String(total)
      el.style.display = total>0 ? 'inline-block' : 'none'
    }
  }

  return (
    <section className="container" style={{padding:'24px 16px'}}>
      <h2 style={{margin:'0 0 16px'}}>Your Cart</h2>
      {items.length === 0 ? (
        <div style={{color:'var(--muted)'}}>Your cart is empty.</div>
      ) : (
        <div className="cart-grid">
          <div style={{display:'grid',gap:12}}>
            {items.map(it=> (
              <div key={it.id} className="cart-item">
                <img src={it.image || 'https://via.placeholder.com/96'} alt={it.title} className="cart-item-image" />
                <div className="cart-item-info">
                  <div style={{fontWeight:600}}>{it.title}</div>
                  <div style={{color:'var(--muted)'}}>Size: {it.size||'—'}</div>
                  <div style={{marginTop:6}}>₹{it.price}</div>
                </div>
                <div className="cart-item-actions">
                  <button className="btn" onClick={()=> setQty(it.id, (it.qty||1)-1)}>-</button>
                  <input value={it.qty||1} onChange={(e)=> setQty(it.id, parseInt(e.target.value||'1',10)||1)} className="cart-qty-input" />
                  <button className="btn" onClick={()=> setQty(it.id, (it.qty||1)+1)}>+</button>
                  <button className="btn" onClick={()=> removeItem(it.id)} style={{marginLeft:8}}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <aside className="cart-summary">
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span>Subtotal</span><strong>₹{subtotal}</strong>
            </div>
            <button className="btn primary" style={{width:'100%'}}>Checkout</button>
          </aside>
        </div>
      )}
    </section>
  )
}


