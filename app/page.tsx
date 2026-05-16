// app/page.tsx — Javari App Builder
// The most capable AI app builder — helps anyone build monetizable apps
// Powered by Javari AI with 300+ models
// Created: May 15, 2026
'use client'

import { useState, useRef, useCallback } from 'react'
import { Zap, Code, Rocket, DollarSign, Shield, Globe, ChevronRight, Play, Download, Share2 } from 'lucide-react'

type BuildMode = 'discuss' | 'build' | 'deploy'
type AppTemplate = 'saas' | 'marketplace' | 'tool' | 'ecommerce' | 'social' | 'custom'

interface BuildResult {
  plan?: string
  code?: string
  monetization?: string
  deployment?: string
  model_used?: string
  cost?: string
  stage?: BuildMode
}

export default function JavariBuilder() {
  const [mode, setMode] = useState<BuildMode>('discuss')
  const [template, setTemplate] = useState<AppTemplate>('custom')
  const [userInput, setUserInput] = useState('')
  const [result, setResult] = useState<BuildResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<Array<{ input: string; result: BuildResult }>>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const TEMPLATES: Record<AppTemplate, { label: string; prompt: string; icon: string }> = {
    saas:        { label: 'SaaS Product',    prompt: 'Build a subscription SaaS app with auth, billing, and dashboard', icon: '☁️' },
    marketplace: { label: 'Marketplace',     prompt: 'Build a two-sided marketplace with listings, payments, and reviews', icon: '🛒' },
    tool:        { label: 'Productivity Tool', prompt: 'Build a productivity tool with AI features and team collaboration', icon: '⚡' },
    ecommerce:   { label: 'E-Commerce',      prompt: 'Build an e-commerce store with products, cart, and payments', icon: '🛍️' },
    social:      { label: 'Social Platform', prompt: 'Build a social platform with profiles, posts, and notifications', icon: '💬' },
    custom:      { label: 'Custom App',      prompt: '', icon: '✨' },
  }

  const handleBuild = useCallback(async () => {
    const input = template !== 'custom' ? TEMPLATES[template].prompt + '\n\n' + userInput : userInput
    if (!input.trim()) { setError('Tell me what you want to build'); return }
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/builder/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, mode, template }),
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }
      
      const data: BuildResult = await res.json()
      setResult(data)
      setHistory(prev => [{ input, result: data }, ...prev.slice(0, 4)])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [userInput, mode, template])

  const T = {
    bg:      '#0a0a0f',
    card:    '#111118',
    border:  'rgba(99,102,241,0.2)',
    accent:  '#6366f1',
    accent2: '#8b5cf6',
    green:   '#10b981',
    text:    '#e2e8f0',
    muted:   '#64748b',
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${T.border}`, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={20} color="white" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.text }}>Javari App Builder</h1>
          <p style={{ margin: 0, fontSize: 12, color: T.muted }}>Build monetizable apps with AI • 300+ models • $0 to start</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {(['discuss', 'build', 'deploy'] as BuildMode[]).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
              background: mode === m ? T.accent : 'rgba(99,102,241,0.1)',
              color: mode === m ? 'white' : T.muted,
              transition: 'all 0.2s',
            }}>{m}</button>
          ))}
        </div>
      </header>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        
        {/* Left: Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Templates */}
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quick Templates</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {(Object.entries(TEMPLATES) as [AppTemplate, typeof TEMPLATES['saas']][]).map(([key, tmpl]) => (
                <button key={key} onClick={() => setTemplate(key)} style={{
                  padding: '10px 8px', borderRadius: 8, border: `1px solid ${template === key ? T.accent : T.border}`,
                  background: template === key ? `rgba(99,102,241,0.15)` : T.card,
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{tmpl.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: template === key ? T.accent : T.text }}>{tmpl.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Code size={14} color={T.accent} />
              <span style={{ fontSize: 13, fontWeight: 600, color: T.muted }}>
                {mode === 'discuss' ? 'Describe your app idea' : mode === 'build' ? 'Build specifications' : 'Deployment requirements'}
              </span>
            </div>
            <textarea ref={inputRef} value={userInput} onChange={e => setUserInput(e.target.value)}
              placeholder={mode === 'discuss' 
                ? "Describe your app idea...\n\nExample: I want to build a SaaS tool that helps freelancers track their time and automatically generate invoices. It should have a Stripe integration for payments and work on mobile."
                : mode === 'build'
                ? "Specify what to build...\n\nInclude: tech stack, features, integrations, user flows"
                : "Deployment requirements...\n\nTarget platform, scaling needs, security requirements"}
              style={{
                width: '100%', minHeight: 200, padding: '16px', border: 'none', outline: 'none',
                background: 'transparent', color: T.text, fontSize: 14, lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box',
              }}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleBuild() }}
            />
            <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: T.muted }}>⌘/Ctrl+Enter to generate • FREE via Javari AI</span>
              <button onClick={handleBuild} disabled={loading} style={{
                padding: '8px 20px', borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? '#374151' : `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                color: 'white', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {loading ? (
                  <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Generating...</>
                ) : (
                  <><Play size={14} /> Generate with AI</>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#f87171', fontSize: 13 }}>
              ✗ {error}
            </div>
          )}

          {/* Mode descriptions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[
              { mode: 'discuss', icon: '💬', title: 'Discuss', desc: 'Free brainstorming, no credits' },
              { mode: 'build',   icon: '🔨', title: 'Build',   desc: 'Generate architecture & code' },
              { mode: 'deploy',  icon: '🚀', title: 'Deploy',  desc: 'Production-ready deployment' },
            ].map(item => (
              <div key={item.mode} style={{
                padding: '12px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
                opacity: mode === item.mode ? 1 : 0.6,
              }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {result ? (
            <>
              {/* Result header */}
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Rocket size={14} color={T.green} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.green }}>Generation Complete</span>
                    {result.model_used && (
                      <span style={{ fontSize: 11, padding: '2px 8px', background: 'rgba(16,185,129,0.15)', color: T.green, borderRadius: 20 }}>
                        {result.model_used.includes(':free') ? '✦ FREE' : result.model_used}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${T.border}`, background: 'transparent', color: T.muted, fontSize: 11, cursor: 'pointer' }}
                      onClick={() => navigator.clipboard?.writeText(Object.values(result).filter(Boolean).join('\n\n'))}>
                      <Share2 size={12} style={{ display: 'inline', marginRight: 4 }} />Copy
                    </button>
                    <button style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${T.border}`, background: 'transparent', color: T.muted, fontSize: 11, cursor: 'pointer' }}>
                      <Download size={12} style={{ display: 'inline', marginRight: 4 }} />Export
                    </button>
                  </div>
                </div>

                <div style={{ padding: '16px', maxHeight: 500, overflowY: 'auto' }}>
                  {result.plan && (
                    <div style={{ marginBottom: 20 }}>
                      <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: T.accent, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Code size={14} /> Architecture Plan
                      </h3>
                      <pre style={{ margin: 0, fontSize: 13, color: T.text, whiteSpace: 'pre-wrap', lineHeight: 1.6, fontFamily: 'inherit' }}>
                        {result.plan}
                      </pre>
                    </div>
                  )}
                  {result.monetization && (
                    <div style={{ marginBottom: 20, padding: '12px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8 }}>
                      <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: T.green, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <DollarSign size={14} /> Monetization Strategy
                      </h3>
                      <pre style={{ margin: 0, fontSize: 13, color: T.text, whiteSpace: 'pre-wrap', lineHeight: 1.6, fontFamily: 'inherit' }}>
                        {result.monetization}
                      </pre>
                    </div>
                  )}
                  {result.code && (
                    <div style={{ marginBottom: 20 }}>
                      <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: T.accent2, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Code size={14} /> Implementation
                      </h3>
                      <pre style={{ margin: 0, fontSize: 12, color: '#94a3b8', whiteSpace: 'pre-wrap', lineHeight: 1.6, background: '#0d0d15', padding: 16, borderRadius: 8, overflowX: 'auto' }}>
                        {result.code}
                      </pre>
                    </div>
                  )}
                  {result.deployment && (
                    <div style={{ padding: '12px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8 }}>
                      <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: T.accent, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Globe size={14} /> Deployment Guide
                      </h3>
                      <pre style={{ margin: 0, fontSize: 13, color: T.text, whiteSpace: 'pre-wrap', lineHeight: 1.6, fontFamily: 'inherit' }}>
                        {result.deployment}
                      </pre>
                    </div>
                  )}
                  <div style={{ marginTop: 12, fontSize: 11, color: T.muted, textAlign: 'right' }}>
                    Cost: {result.cost ?? '$0.00'} • Powered by Javari AI
                  </div>
                </div>
              </div>

              {/* Actions */}
              {mode === 'discuss' && (
                <button onClick={() => setMode('build')} style={{
                  padding: '12px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                  color: 'white', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                }}>
                  <ChevronRight size={18} /> Move to Build Phase
                </button>
              )}
              {mode === 'build' && (
                <button onClick={() => setMode('deploy')} style={{
                  padding: '12px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${T.green}, #059669)`,
                  color: 'white', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                }}>
                  <Rocket size={18} /> Deploy to Production
                </button>
              )}
            </>
          ) : (
            /* Placeholder */
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏗️</div>
              <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>Build Your Next App</h2>
              <p style={{ margin: '0 0 24px', color: T.muted, lineHeight: 1.6 }}>
                Describe what you want to build. Javari AI will create the architecture, code structure, monetization strategy, and deployment guide.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, textAlign: 'left' }}>
                {[
                  { icon: '💡', text: 'Architecture & Tech Stack' },
                  { icon: '💰', text: 'Monetization Strategy' },
                  { icon: '🔐', text: 'Auth & Security Pattern' },
                  { icon: '🚀', text: 'Deployment Checklist' },
                  { icon: '📊', text: 'Analytics & Metrics' },
                  { icon: '🤖', text: 'AI Integration Points' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: 'rgba(99,102,241,0.05)', border: `1px solid ${T.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{item.icon}</span>
                    <span style={{ fontSize: 12, color: T.muted }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, padding: '10px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, fontSize: 12, color: T.green }}>
                ✦ FREE to use — powered by Groq Llama & OpenRouter free models
              </div>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[
              { icon: <Zap size={16} color="#6366f1" />, label: '300+ Models', sub: 'Including 28 free' },
              { icon: <Shield size={16} color="#10b981" />, label: 'Fortune 50 Quality', sub: 'Henderson Standard' },
              { icon: <DollarSign size={16} color="#f59e0b" />, label: '$0.00/generation', sub: 'Free models first' },
            ].map((stat, i) => (
              <div key={i} style={{ padding: '12px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{stat.label}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
