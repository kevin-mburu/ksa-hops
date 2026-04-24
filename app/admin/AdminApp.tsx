'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase'

const G = {
  green:'#1a4731', greenMd:'#1e5c3a', greenLt:'#e8f5ee',
  gold:'#c9922f', goldLt:'#fef3c7', border:'#e2e0db',
  text:'#111827', muted:'#6b7280', bg:'#f5f3ef',
}

type Registration = {
  id: string
  full_name: string
  farm_name: string
  phone: string
  email: string | null
  date_available: string
  extra_notes: string | null
  created_at: string
}

const inputStyle = {
  width:'100%', padding:'11px 14px', border:`2px solid ${G.border}`, borderRadius:8,
  fontFamily:'inherit', fontSize:14, outline:'none', background:'#fff',
  color:G.text, boxSizing:'border-box' as const,
}

export default function AdminApp() {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), [])

  const [authed,        setAuthed]        = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [email,         setEmail]         = useState('')
  const [pass,          setPass]          = useState('')
  const [authErr,       setAuthErr]       = useState('')
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [search,        setSearch]        = useState('')
  const [filterDate,    setFilterDate]    = useState<string>('all')
  const [refreshing,    setRefreshing]    = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) loadData()
    })

    // Real-time — new registration appears instantly
    const channel = supabase
      .channel('registrations-live')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'registrations' },
        (payload) => {
          setRegistrations(prev => [payload.new as Registration, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function signIn() {
    setLoading(true); setAuthErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) { setAuthErr(error.message); setLoading(false); return }
    await loadData()
    setLoading(false)
  }

  async function loadData() {
    const { data } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false })
    setRegistrations(data || [])
    setAuthed(true)
  }

  function exportCSV() {
    const headers = ['Full Name','Farm','Phone','Email','Date Available','Notes','Registered At']
    const rows = filtered.map(r => [
      r.full_name, r.farm_name, r.phone, r.email || '',
      r.date_available, r.extra_notes || '',
      new Date(r.created_at).toLocaleString(),
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type:'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'KSA_Hops_CS_Visit_Registrations.csv'; a.click()
  }

  const filtered = registrations.filter(r => {
    const matchSearch =
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.farm_name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search)
    const matchDate = filterDate === 'all' || r.date_available === filterDate || r.date_available === 'Both dates'
    return matchSearch && matchDate
  })

  const count28  = registrations.filter(r => r.date_available === '28th April 2026' || r.date_available === 'Both dates').length
  const count1st = registrations.filter(r => r.date_available === '1st May 2026'    || r.date_available === 'Both dates').length
  const countBoth = registrations.filter(r => r.date_available === 'Both dates').length

  const dateBadge = (date: string) => {
    const colors: Record<string, [string,string]> = {
      '28th April 2026': ['#dbeafe','#1e40af'],
      '1st May 2026':    ['#dcfce7','#14532d'],
      'Both dates':      ['#fef3c7','#92400e'],
    }
    const [bg, col] = colors[date] || ['#f3f4f6','#6b7280']
    return (
      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
        background:bg, color:col }}>
        {date}
      </span>
    )
  }

  // ── LOGIN ─────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(160deg,#0d2b1d 0%,#1a4731 55%,#1e6640 100%)', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/coat-of-arms.png" alt="Kenya Coat of Arms"
            style={{ width:72, height:79, objectFit:'contain', display:'block', margin:'0 auto 14px' }}/>
          <h1 style={{ color:'#fff', fontSize:21, fontWeight:800, margin:'0 0 4px' }}>
            KSA Hops Programme
          </h1>
          <p style={{ color:'rgba(255,255,255,.6)', fontSize:13 }}>
            CS Visit Registrations — Admin Access
          </p>
        </div>
        <div style={{ background:'#fff', borderRadius:14, padding:28,
          boxShadow:'0 2px 16px rgba(0,0,0,.1)' }}>
          <p style={{ fontSize:17, fontWeight:700, margin:'0 0 18px' }}>Sign In</p>
          {authErr && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8,
              padding:'10px 14px', fontSize:13, color:'#dc2626', marginBottom:14 }}>
              {authErr}
            </div>
          )}
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase',
              letterSpacing:.6, color:'#374151', marginBottom:5 }}>Email</label>
            <input style={inputStyle} type="email" placeholder="admin@ksa.ac.ke"
              value={email} onChange={e=>setEmail(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&signIn()}/>
          </div>
          <div style={{ marginBottom:22 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase',
              letterSpacing:.6, color:'#374151', marginBottom:5 }}>Password</label>
            <input style={inputStyle} type="password" placeholder="••••••••"
              value={pass} onChange={e=>setPass(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&signIn()}/>
          </div>
          <button style={{ width:'100%', padding:14, border:'none', borderRadius:8,
            fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:'pointer',
            background:G.green, color:'#fff' }}
            onClick={signIn} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </div>
      </div>
    </div>
  )

  // ── DASHBOARD ─────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:G.bg,
      fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(160deg,#0d2b1d 0%,#1a4731 60%,#1e6640 100%)',
        padding:'18px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex',
          justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/coat-of-arms.png" alt="KSA"
              style={{ width:38, height:42, objectFit:'contain' }}/>
            <div>
              <p style={{ color:'#fff', fontWeight:800, fontSize:15, margin:0 }}>
                KSA Hops Programme
              </p>
              <p style={{ color:'rgba(255,255,255,.6)', fontSize:12, margin:0 }}>
                CS Visit — London · Admin Dashboard
              </p>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <button style={{ border:'1px solid rgba(255,255,255,.3)', background:'transparent',
              color:'#fff', borderRadius:8, padding:'8px 14px', fontSize:12,
              cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}
              onClick={async()=>{ setRefreshing(true); await loadData(); setRefreshing(false) }}>
              {refreshing ? 'Refreshing…' : '🔄 Refresh'}
            </button>
            <button style={{ border:'1px solid rgba(255,255,255,.3)', background:'transparent',
              color:'#fff', borderRadius:8, padding:'8px 14px', fontSize:12,
              cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}
              onClick={exportCSV}>
              📥 Export CSV
            </button>
            <button style={{ border:'none', background:'rgba(255,255,255,.15)',
              color:'#fff', borderRadius:8, padding:'8px 14px', fontSize:12,
              cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}
              onClick={async()=>{ await supabase.auth.signOut(); setAuthed(false) }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:24 }}>

        {/* Visit info banner */}
        <div style={{ background:'#fff', borderRadius:12, padding:'16px 20px', marginBottom:20,
          border:`1px solid ${G.border}`, display:'flex', gap:16, alignItems:'center',
          flexWrap:'wrap' as const }}>
          <div style={{ flex:1, minWidth:280 }}>
            <p style={{ fontWeight:700, fontSize:14, color:G.text, margin:'0 0 4px' }}>
              🇬🇧 Cabinet Secretary Visit — London
            </p>
            <p style={{ fontSize:13, color:G.muted, margin:0 }}>
              Hon. Senator Mutahi Kagwe · Agriculture & Livestock Development
            </p>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' as const }}>
            <span style={{ padding:'6px 14px', borderRadius:8, background:'#dbeafe',
              color:'#1e40af', fontSize:12, fontWeight:700 }}>
              📅 28th April 2026
            </span>
            <span style={{ padding:'6px 14px', borderRadius:8, background:'#dcfce7',
              color:'#14532d', fontSize:12, fontWeight:700 }}>
              📅 1st May 2026
            </span>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
          {[
            { label:'Total Registered',    value: registrations.length, icon:'👥', col:G.green  },
            { label:'Available 28th April',value: count28,              icon:'📅', col:'#1e40af' },
            { label:'Available 1st May',   value: count1st,             icon:'📅', col:'#14532d' },
            { label:'Available Both Days', value: countBoth,            icon:'⭐', col:G.gold    },
          ].map(s => (
            <div key={s.label} style={{ background:'#fff', borderRadius:12, padding:'18px 20px',
              boxShadow:'0 1px 6px rgba(0,0,0,.06)' }}>
              <div style={{ fontSize:22, marginBottom:8 }}>{s.icon}</div>
              <p style={{ fontSize:28, fontWeight:800, color:s.col, margin:0 }}>{s.value}</p>
              <p style={{ fontSize:12, color:G.muted, margin:'4px 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:12, marginBottom:16, flexWrap:'wrap' as const }}>
          <input style={{ ...inputStyle, width:280, padding:'9px 14px', fontSize:13 }}
            placeholder="🔍 Search name, farm or phone…"
            value={search} onChange={e=>setSearch(e.target.value)}/>
          <div style={{ display:'flex', gap:8 }}>
            {[
              ['all',            'All Dates'],
              ['28th April 2026','28th April'],
              ['1st May 2026',   '1st May'],
              ['Both dates',     'Both Days'],
            ].map(([val, label]) => (
              <button key={val} onClick={()=>setFilterDate(val)}
                style={{ border:`2px solid ${filterDate===val ? G.green : G.border}`,
                  background: filterDate===val ? G.greenLt : '#fff',
                  color: filterDate===val ? G.green : G.text,
                  borderRadius:8, padding:'8px 14px', fontSize:12, cursor:'pointer',
                  fontFamily:'inherit', fontWeight: filterDate===val ? 700 : 500 }}>
                {label}
              </button>
            ))}
          </div>
          <span style={{ marginLeft:'auto', fontSize:13, color:G.muted, alignSelf:'center' }}>
            Showing {filtered.length} of {registrations.length} registrations
          </span>
        </div>

        {/* Live indicator */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <span style={{ width:8, height:8, background:'#16a34a', borderRadius:'50%',
            display:'inline-block' }}/>
          <span style={{ fontSize:12, color:G.green, fontWeight:600 }}>
            Live · New registrations appear automatically
          </span>
        </div>

        {/* Registrations table */}
        <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 8px rgba(0,0,0,.07)',
          overflow:'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding:48, textAlign:'center' }}>
              <div style={{ fontSize:42, marginBottom:12 }}>📋</div>
              <p style={{ fontSize:15, fontWeight:600, color:G.text, margin:'0 0 6px' }}>
                No registrations yet
              </p>
              <p style={{ fontSize:13, color:G.muted, margin:0 }}>
                Share the registration link with students in the UK
              </p>
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#fafafa' }}>
                  {['#','Full Name','Farm / Location','Contact','Date Available','Notes','Registered'].map(h=>(
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11,
                      fontWeight:700, color:G.muted, textTransform:'uppercase', letterSpacing:.5,
                      borderBottom:`1px solid ${G.border}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} style={{ borderTop:`1px solid #f3f4f6` }}>
                    <td style={{ padding:'12px 16px', fontSize:12, color:G.muted, fontWeight:600 }}>
                      {i + 1}
                    </td>
                    <td style={{ padding:'12px 16px', fontWeight:700, fontSize:13, color:G.text }}>
                      {r.full_name}
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:13, color:'#374151' }}>
                      {r.farm_name}
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:13 }}>
                      <div style={{ color:G.text }}>{r.phone}</div>
                      {r.email && (
                        <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>{r.email}</div>
                      )}
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      {dateBadge(r.date_available)}
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:G.muted, maxWidth:200 }}>
                      {r.extra_notes || '—'}
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:11, color:G.muted, whiteSpace:'nowrap' as const }}>
                      {new Date(r.created_at).toLocaleDateString('en-GB', {
                        day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}
