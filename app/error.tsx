'use client'
import { useEffect } from 'react'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(160deg,#0d2b1d,#1a4731)', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:14, padding:28, maxWidth:380, textAlign:'center' }}>
        <div style={{ fontSize:44, marginBottom:14 }}>⚠️</div>
        <h2 style={{ fontSize:18, fontWeight:700, margin:'0 0 10px' }}>Something went wrong</h2>
        <p style={{ fontSize:13, color:'#6b7280', margin:'0 0 18px' }}>{error.message}</p>
        <button onClick={reset} style={{ border:'none', padding:'10px 22px', borderRadius:8,
          fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:'pointer',
          background:'#1a4731', color:'#fff' }}>Try Again</button>
      </div>
    </div>
  )
}
