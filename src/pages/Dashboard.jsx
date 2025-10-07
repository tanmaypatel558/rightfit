import { useEffect, useRef, useState } from 'react'
import { isConfigured, setProducts, getProducts, uploadImageToStorage } from '../services/cloud'

export default function Dashboard(){
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [mrp, setMrp] = useState('')
  const [image, setImage] = useState('')
  const [sizes, setSizes] = useState([])
  const [items, setItems] = useState([])
  const dropRef = useRef(null)
  const fileInputRef = useRef(null)

  async function uploadFile(file){
    if (!file) return
    if (isConfigured()){
      const url = await uploadImageToStorage(file)
      if (url) setImage(url)
    } else {
      const form = new FormData()
      form.append('file', file)
      try{
        const res = await fetch('/upload', { method: 'POST', body: form })
        const data = await res.json()
        if (data?.url) setImage(data.url)
      }catch{}
    }
  }

  useEffect(()=>{
    if (isConfigured()){
      getProducts().then(data=> setItems(Array.isArray(data)? data : []))
    } else {
      try{ setItems(JSON.parse(localStorage.getItem('rf_products')||'[]')) }catch{}
    }
  }, [])

  useEffect(()=>{
    const drop = dropRef.current
    if (!drop) return
    const onDrag = (e)=>{ e.preventDefault() }
    const onDrop = async (e)=>{
      e.preventDefault()
      const file = e.dataTransfer?.files?.[0]
      if (!file) return
      await uploadFile(file)
    }
    drop.addEventListener('dragover', onDrag)
    drop.addEventListener('drop', onDrop)
    return ()=>{
      drop.removeEventListener('dragover', onDrag)
      drop.removeEventListener('drop', onDrop)
    }
  }, [])

  const save = ()=>{
    if (!title || !price || !mrp){ return }
    const newItem = { id: Date.now(), title, price: Number(price), mrp: Number(mrp), image, sizes }
    const next = [...items, newItem]
    setItems(next)
    if (isConfigured()){
      setProducts(next)
    } else {
      try{
        localStorage.setItem('rf_products', JSON.stringify(next))
        localStorage.setItem('rf_products__ts', String(Date.now()))
      }catch{}
    }
    setTitle(''); setPrice(''); setMrp(''); setImage(''); setSizes([])
  }

  const toggleSize = (sz)=>{
    setSizes(prev => prev.includes(sz) ? prev.filter(s=> s!==sz) : [...prev, sz])
  }

  const clear = ()=>{ setTitle(''); setPrice(''); setMrp(''); setImage(''); setSizes([]) }

  return (
    <main className="dash-wrap" style={{maxWidth:840,margin:'24px auto',padding:'0 16px'}}>
      <h1>Dashboard (local only)</h1>
      <div className="dash-card" style={{border:'1px solid var(--border)',borderRadius:12,padding:16}}>
        <div className="field">
          <label htmlFor="title">Product title</label>
          <input id="title" type="text" placeholder="e.g., Relaxed Graphic Tee" value={title} onChange={e=>setTitle(e.target.value)} />
        </div>
        <div className="row" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div className="field">
            <label htmlFor="price">Price (₹)</label>
            <input id="price" type="number" min="0" step="1" placeholder="699" value={price} onChange={e=>setPrice(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="mrp">MRP (₹)</label>
            <input id="mrp" type="number" min="0" step="1" placeholder="1699" value={mrp} onChange={e=>setMrp(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="image">Image URL</label>
          <input id="image" type="url" placeholder="https://..." value={image} onChange={e=>setImage(e.target.value)} />
          <div style={{display:'flex',gap:8,alignItems:'center',marginTop:8}}>
            <div id="dropper" ref={dropRef} style={{flex:1,padding:12,border:'1px dashed var(--border)',borderRadius:8,background:'var(--bg)',textAlign:'center',color:'var(--muted)',cursor:'copy'}}>
              Drag & drop an image here
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={async (e)=>{ const f = e.target.files?.[0]; if (f) { await uploadFile(f); e.target.value = '' } }} />
            <button className="btn" onClick={()=> fileInputRef.current?.click()}>Select file</button>
          </div>
          <div style={{marginTop:8,display:'flex',alignItems:'center',gap:10}}>
            <img id="imgPreview" src={image || 'https://via.placeholder.com/120?text=Preview'} alt="Preview" style={{width:120,height:120,objectFit:'cover',border:'1px solid var(--border)',borderRadius:8}} />
            <small style={{color:'var(--muted)'}}>Paste a URL, drag & drop, or select a file</small>
          </div>
        </div>
        <div className="field">
          <label>Sizes</label>
          <div className="sizes" style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {['S','M','L','XL','XXL'].map(sz=> (
              <label key={sz} className="size-chip" style={{border:'1px solid var(--border)',borderRadius:999,padding:'6px 10px',display:'inline-flex',alignItems:'center',gap:6}}>
                <input type="checkbox" value={sz} checked={sizes.includes(sz)} onChange={()=>toggleSize(sz)} /> {sz}
              </label>
            ))}
          </div>
        </div>
        <div className="actions" style={{display:'flex',gap:12,justifyContent:'flex-end',marginTop:8}}>
          <button className="btn" onClick={clear}>Clear</button>
          <button className="btn primary" onClick={save}>Save product</button>
        </div>
      </div>

      <div className="list" id="list" style={{marginTop:16}}>
        {items.map(it=> (
          <div key={it.id} className="list-item" style={{border:'1px solid var(--border)',borderRadius:10,padding:10,display:'flex',gap:10,alignItems:'center',marginBottom:8}}>
            <img src={it.image || 'https://via.placeholder.com/120?text=Image'} alt={it.title} style={{width:72,height:72,objectFit:'cover',borderRadius:8,border:'1px solid var(--border)'}} />
            <div>
              <div style={{fontWeight:600}}>{it.title}</div>
              <div>₹{it.price} <span className="p-mrp">₹{it.mrp}</span></div>
              <div style={{color:'var(--muted)'}}>Sizes: {(it.sizes||[]).join(', ') || '—'}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}


