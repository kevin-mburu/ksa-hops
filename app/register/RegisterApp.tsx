'use client'
import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'

const G = {
  green:'#1a4731', greenMd:'#1e5c3a', greenLt:'#e8f5ee',
  gold:'#c9922f', goldLt:'#fef3c7', border:'#e2e0db',
  text:'#111827', muted:'#6b7280', bg:'#f5f3ef',
}

const inputStyle = {
  width:'100%', padding:'12px 14px', border:`2px solid ${G.border}`, borderRadius:8,
  fontFamily:'inherit', fontSize:14, outline:'none', background:'#fff',
  color:G.text, boxSizing:'border-box' as const, transition:'border-color .2s',
}

type Screen = 'form' | 'success'

export default function RegisterApp() {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), [])

  const [screen,      setScreen]      = useState<Screen>('form')
  const [submitting,  setSubmitting]  = useState(false)
  const [submitErr,   setSubmitErr]   = useState('')
  const [focusedField,setFocusedField]= useState<string|null>(null)

  const [form, setForm] = useState({
    full_name:   '',
    farm_name:   '',
    phone:       '',
    email:       '',
    date_available: '' as '' | '28th April 2026' | '1st May 2026' | 'Both dates',
    extra_notes: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setSubmitErr('')
  }

  function validate(): string | null {
    if (!form.full_name.trim())      return 'Please enter your full name'
    if (!form.farm_name.trim())      return 'Please enter the farm you are currently working in'
    if (!form.phone.trim())          return 'Please enter your contact number'
    if (!form.date_available)        return 'Please select which date(s) you are available'
    return null
  }

  async function submit() {
    const err = validate()
    if (err) { setSubmitErr(err); return }
    setSubmitting(true); setSubmitErr('')

    const { error } = await supabase.from('registrations').insert({
      full_name:      form.full_name.trim(),
      farm_name:      form.farm_name.trim(),
      phone:          form.phone.trim(),
      email:          form.email.trim() || null,
      date_available: form.date_available,
      extra_notes:    form.extra_notes.trim() || null,
    })

    if (error) {
      if (error.code === '23505') {
        setSubmitErr('You have already registered with this name and phone number.')
      } else {
        setSubmitErr('Submission failed: ' + error.message)
      }
      setSubmitting(false); return
    }

    setScreen('success')
    setSubmitting(false)
  }

  const iStyle = (field: string) => ({
    ...inputStyle,
    borderColor: focusedField === field ? G.green : G.border,
  })

  // ── SUCCESS ──────────────────────────────────────────────
  if (screen === 'success') return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(160deg,#0d2b1d 0%,#1a4731 55%,#1e6640 100%)', padding:20 }}>
      <div style={{ textAlign:'center', maxWidth:440, width:'100%' }}>
        <div style={{ width:90, height:90, background:G.gold, borderRadius:'50%',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 24px', fontSize:42 }}>✅</div>
        <h1 style={{ color:'#fff', fontSize:28, fontWeight:800, margin:'0 0 12px' }}>
          Registration Successful!
        </h1>
        <p style={{ color:'rgba(255,255,255,.8)', fontSize:15, lineHeight:1.7, margin:'0 0 24px' }}>
          Thank you, <strong>{form.full_name.split(' ')[0]}</strong>!
          Your registration has been received. The KSA team will be in touch with further details
          about the Cabinet Secretary&apos;s visit.
        </p>
        <div style={{ background:'rgba(255,255,255,.12)', borderRadius:14,
          padding:'18px 22px', marginBottom:22, textAlign:'left' }}>
          <p style={{ color:'rgba(255,255,255,.5)', fontSize:11, textTransform:'uppercase',
            letterSpacing:.5, margin:'0 0 12px' }}>Your Registration Details</p>
          {[
            ['👤 Name',         form.full_name],
            ['🌱 Farm',         form.farm_name],
            ['📞 Contact',      form.phone],
            ['📅 Date',         form.date_available],
          ].map(([label, value]) => (
            <div key={label} style={{ display:'flex', justifyContent:'space-between',
              marginBottom:8, gap:16 }}>
              <span style={{ color:'rgba(255,255,255,.6)', fontSize:13 }}>{label}</span>
              <span style={{ color:'#fff', fontSize:13, fontWeight:600, textAlign:'right' }}>{value}</span>
            </div>
          ))}
        </div>
        <p style={{ color:'rgba(255,255,255,.4)', fontSize:12 }}>
          Karibu London! 🇬🇧
        </p>
      </div>
    </div>
  )

  // ── FORM ─────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:G.bg }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(160deg,#0d2b1d 0%,#1a4731 55%,#1e6640 100%)',
        padding:'28px 20px 80px' }}>
        <div style={{ maxWidth:600, margin:'0 auto', textAlign:'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/coat-of-arms.png" alt="Kenya Coat of Arms"
            style={{ width:72, height:79, objectFit:'contain', marginBottom:14, display:'block', margin:'0 auto 14px' }}/>
          <h1 style={{ color:'#fff', fontSize:22, fontWeight:800, margin:'0 0 6px',
            lineHeight:1.3 }}>
            Kenya School of Agriculture
          </h1>
          <p style={{ color:'rgba(255,255,255,.7)', fontSize:13, margin:'0 0 16px' }}>
            Hops Programme — UK Students Registration
          </p>
          <div style={{ background:'rgba(255,255,255,.12)', borderRadius:12,
            padding:'14px 18px', backdropFilter:'blur(8px)' }}>
            <p style={{ color:'#fff', fontSize:14, fontWeight:700, margin:'0 0 6px' }}>
              🇬🇧 Cabinet Secretary Visit — London
            </p>
            <p style={{ color:'rgba(255,255,255,.8)', fontSize:13, margin:0, lineHeight:1.6 }}>
              Hon. Senator Mutahi Kagwe, Cabinet Secretary for Agriculture and Livestock Development,
              will be visiting London. He would be glad to meet KSA Hops Programme students
              currently in the UK.
            </p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{ maxWidth:600, margin:'-48px auto 40px', padding:'0 16px' }}>
        <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 4px 24px rgba(0,0,0,.1)',
          overflow:'hidden' }}>
          {/* Dates banner */}
          <div style={{ background:G.goldLt, borderBottom:`1px solid #fde68a`,
            padding:'12px 24px', display:'flex', gap:16, flexWrap:'wrap' as const }}>
            {['📅 28th April 2026', '📅 1st May 2026'].map(d => (
              <div key={d} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:13, fontWeight:700, color:'#92400e' }}>{d}</span>
              </div>
            ))}
            <span style={{ fontSize:12, color:'#b45309', marginLeft:'auto' }}>
              Select your available date below
            </span>
          </div>

          <div style={{ padding:28 }}>
            <h2 style={{ fontSize:18, fontWeight:700, color:G.text, margin:'0 0 4px' }}>
              Register Your Interest
            </h2>
            <p style={{ fontSize:13, color:G.muted, margin:'0 0 24px' }}>
              Please fill in all required fields marked with *
            </p>

            {submitErr && (
              <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8,
                padding:'10px 14px', fontSize:13, color:'#dc2626', marginBottom:18 }}>
                {submitErr}
              </div>
            )}

            {/* Full Name */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151',
                textTransform:'uppercase', letterSpacing:.6, marginBottom:6 }}>
                Full Name *
              </label>
              <input style={iStyle('full_name')} type="text"
                placeholder="e.g. Alice Muthoni Kamau"
                value={form.full_name}
                onChange={e => set('full_name', e.target.value)}
                onFocus={() => setFocusedField('full_name')}
                onBlur={() => setFocusedField(null)}/>
            </div>

            {/* Farm Name */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151',
                textTransform:'uppercase', letterSpacing:.6, marginBottom:6 }}>
                Farm You Are Currently Working In *
              </label>
              <input style={iStyle('farm_name')} type="text"
                placeholder="e.g. Hops Farm, Kent"
                value={form.farm_name}
                onChange={e => set('farm_name', e.target.value)}
                onFocus={() => setFocusedField('farm_name')}
                onBlur={() => setFocusedField(null)}/>
              <p style={{ fontSize:11, color:G.muted, marginTop:5 }}>
                Include the farm name and location/county if possible
              </p>
            </div>

            {/* Phone */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151',
                textTransform:'uppercase', letterSpacing:.6, marginBottom:6 }}>
                Contact Number *
              </label>
              <input style={iStyle('phone')} type="tel"
                placeholder="e.g. +254712345678 or +44 7911 123456"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}/>
              <p style={{ fontSize:11, color:G.muted, marginTop:5 }}>
                Include your country code — Kenya (+254) or UK (+44)
              </p>
            </div>

            {/* Email */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151',
                textTransform:'uppercase', letterSpacing:.6, marginBottom:6 }}>
                Email Address <span style={{ fontWeight:400, textTransform:'none' }}>(optional)</span>
              </label>
              <input style={iStyle('email')} type="email"
                placeholder="e.g. alice@email.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}/>
            </div>

            {/* Date Available */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151',
                textTransform:'uppercase', letterSpacing:.6, marginBottom:10 }}>
                Date(s) Available *
              </label>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  ['28th April 2026', '📅 Monday, 28th April 2026'],
                  ['1st May 2026',    '📅 Friday, 1st May 2026'],
                  ['Both dates',      '📅 Both dates (28th April & 1st May)'],
                ].map(([value, label]) => {
                  const selected = form.date_available === value
                  return (
                    <div key={value}
                      onClick={() => set('date_available', value)}
                      style={{ padding:'14px 16px', border:`2px solid ${selected ? G.green : G.border}`,
                        borderRadius:10, cursor:'pointer',
                        background: selected ? G.greenLt : '#fff',
                        display:'flex', alignItems:'center', gap:12, transition:'all .15s' }}>
                      <div style={{ width:20, height:20, borderRadius:'50%', flexShrink:0,
                        border:`2px solid ${selected ? G.green : '#d1d5db'}`,
                        background: selected ? G.green : '#fff',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {selected && <span style={{ color:'#fff', fontSize:11, fontWeight:800 }}>✓</span>}
                      </div>
                      <span style={{ fontSize:14, fontWeight: selected ? 700 : 400,
                        color: selected ? G.green : G.text }}>
                        {label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Extra notes */}
            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151',
                textTransform:'uppercase', letterSpacing:.6, marginBottom:6 }}>
                Any Additional Information <span style={{ fontWeight:400, textTransform:'none' }}>(optional)</span>
              </label>
              <textarea
                style={{ ...iStyle('extra_notes'), height:90, resize:'vertical' as const,
                  borderColor: focusedField === 'extra_notes' ? G.green : G.border }}
                placeholder="Anything else you'd like the team to know…"
                value={form.extra_notes}
                onChange={e => set('extra_notes', e.target.value)}
                onFocus={() => setFocusedField('extra_notes')}
                onBlur={() => setFocusedField(null)}/>
            </div>

            {/* Submit */}
            <button
              style={{ width:'100%', padding:'15px', border:'none', borderRadius:10,
                fontFamily:'inherit', fontWeight:700, fontSize:15, cursor: submitting ? 'not-allowed' : 'pointer',
                background: submitting ? '#6b7280' : G.green, color:'#fff',
                transition:'all .2s', opacity: submitting ? .7 : 1 }}
              onClick={submit} disabled={submitting}>
              {submitting ? 'Submitting…' : '✅ Submit Registration'}
            </button>

            <p style={{ textAlign:'center', fontSize:12, color:G.muted, marginTop:14 }}>
              Your information will only be used for the purpose of this visit.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
