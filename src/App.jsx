import { useEffect } from 'react'
import { Outlet, Link, NavLink } from 'react-router-dom'
import './index.css'

export default function App(){
  useEffect(()=>{
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
    updateCartCount()
    const onStorage = (e)=>{ if (e.key === 'rf_cart') updateCartCount() }
    window.addEventListener('storage', onStorage)
    return ()=> window.removeEventListener('storage', onStorage)
  }, [])
  return (
    <div>
      <header className="site-header">
        <div className="container header-inner">
          <div className="logo"><Link to="/" aria-label="RightFit home"><img src="/logoR.png" alt="RightFit" /></Link></div>
          <nav className="primary-nav">
            <NavLink to="/" end className={({isActive})=> isActive ? 'active' : undefined}>Men</NavLink>
            <a href="#">Home</a>
          </nav>
          <div className="header-actions">
            <input className="search" type="search" placeholder="Search" />
            <button className="icon-btn" aria-label="Wishlist">❤</button>
            <Link className="icon-btn" aria-label="Cart" to="/cart" style={{position:'relative'}}>🛒<span id="cartCount" className="badge" style={{position:'absolute',top:'-6px',right:'-6px',background:'#e11d48',color:'#fff',borderRadius:999,padding:'0 6px',fontSize:12,lineHeight:'18px',minWidth:18,textAlign:'center',display:'none'}}>0</span></Link>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>© 2025 RightFit</div>
          <div className="links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
