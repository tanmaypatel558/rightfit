import { initializeApp, getApps } from 'firebase/app'
import { getDatabase, ref, get, set, onValue, off } from 'firebase/database'

export function isConfigured(){
  return typeof window !== 'undefined' && !!window.firebaseConfig
}

function getDb(){
  if (!isConfigured()) return null
  if (!getApps().length){
    try{ initializeApp(window.firebaseConfig) }catch{}
  }
  return getDatabase()
}

export async function getProducts(){
  const db = getDb(); if (!db) return null
  try{
    const snap = await get(ref(db, 'products'))
    return snap.exists() ? snap.val() : []
  }catch{ return null }
}

export async function setProducts(items){
  const db = getDb(); if (!db) return false
  try{
    await set(ref(db, 'products'), items)
    await set(ref(db, 'products_ts'), Date.now())
    return true
  }catch{ return false }
}

export function subscribeProducts(cb){
  const db = getDb(); if (!db) return () => {}
  const r = ref(db, 'products')
  const handler = (snap)=> cb(snap.exists() ? snap.val() : [])
  onValue(r, handler)
  return ()=> off(r, 'value', handler)
}


