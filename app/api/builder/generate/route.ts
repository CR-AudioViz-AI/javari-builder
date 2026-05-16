// app/api/builder/generate/route.ts
// Javari App Builder — AI generation engine
// 3 modes: discuss (free), build (architecture + code), deploy (production guide)
// Uses COST LAW: free models first
// Created: May 15, 2026
import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 90

const JAVARI_AI_URL    = process.env.JAVARI_AI_URL    ?? 'https://javariai.com'
const JAVARI_CALLER_KEY = process.env.JAVARI_CALLER_KEY ?? ''
const GROQ_API_KEY     = process.env.GROQ_API_KEY     ?? ''
const OPENROUTER_KEY   = process.env.OPENROUTER_API_KEY ?? ''

async function callFreeModel(systemPrompt: string, userPrompt: string): Promise<string> {
  // Try OpenRouter free first (DeepSeek V4 — best free model for code)
  if (OPENROUTER_KEY) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'HTTP-Referer': 'https://craudiovizai.com',
          'X-Title': 'Javari App Builder',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-v4-flash:free',
          max_tokens: 4096,
          temperature: 0.7,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: userPrompt },
          ],
        }),
      })
      if (res.ok) {
        const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
        const text = d.choices?.[0]?.message?.content ?? ''
        if (text.length > 50) return text
      }
    } catch { /* fall through */ }
  }

  // Fallback: Groq Llama (free, fast)
  if (GROQ_API_KEY) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 4096,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
      }),
    })
    if (res.ok) {
      const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
      return d.choices?.[0]?.message?.content ?? ''
    }
  }

  throw new Error('No AI provider available')
}

const DISCUSS_SYSTEM = `You are Javari, the world's most capable AI app builder assistant for CR AudioViz AI.

Your role in DISCUSS mode: Help users clarify, refine, and plan their app idea.
- Ask clarifying questions
- Identify the core value proposition
- Suggest the best tech stack
- Outline the key features
- Identify potential monetization strategies
- Flag technical risks or challenges

Be enthusiastic but honest. Give concrete, specific advice. Think like a Y Combinator mentor.

Format your response clearly with sections. Be thorough but concise.`

const BUILD_SYSTEM = `You are Javari, the world's most capable AI app builder for CR AudioViz AI.

Your role in BUILD mode: Generate complete, production-ready app architecture and code.

For every app, provide:
1. **Tech Stack** — Next.js 14, TypeScript, Supabase, Stripe, Tailwind
2. **Database Schema** — All tables with relationships
3. **File Structure** — Complete folder structure
4. **Key API Routes** — The most important routes with code
5. **Auth Flow** — How users sign in and manage accounts
6. **Monetization** — Stripe integration for payments
7. **AI Integration** — How Javari AI enhances the app

Generate REAL code. No placeholders. No "TODO". Henderson Standard — Fortune 50 quality.
Code should be copy-pasteable and work immediately.`

const MONETIZE_SYSTEM = `You are Javari, the monetization expert for CR AudioViz AI.

For any app idea, provide the MOST COMPLETE monetization strategy:
1. **Revenue Model** — Freemium, subscription, usage-based, one-time
2. **Pricing Tiers** — Free, Starter ($9), Pro ($29), Business ($99)
3. **Stripe Integration** — Exact implementation code
4. **Credit System** — How credits work for AI features
5. **Affiliate Revenue** — Partnership opportunities
6. **Grant Potential** — If applicable (veterans, nonprofits, education)
7. **Year 1 Projections** — Realistic revenue targets

Be specific. Give exact prices. Give real Stripe code snippets.`

const DEPLOY_SYSTEM = `You are Javari, the deployment expert for CR AudioViz AI.

Provide a COMPLETE production deployment guide:
1. **Vercel Setup** — vercel.json, environment variables
2. **Supabase Setup** — Database migrations, RLS policies, storage
3. **Environment Variables** — Every variable needed, with descriptions
4. **Domain Setup** — DNS configuration
5. **Monitoring** — PostHog, UptimeRobot, error tracking
6. **SEO** — Metadata, sitemap, robots.txt
7. **Security** — CORS, rate limiting, input validation
8. **Performance** — Caching, CDN, optimization

Give specific commands. Give exact configs. Be production-ready.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      input:    string
      mode:     'discuss' | 'build' | 'deploy'
      template: string
    }

    if (!body.input?.trim()) {
      return NextResponse.json({ error: 'input is required' }, { status: 400 })
    }

    const { input, mode } = body
    const result: {
      plan?: string
      code?: string
      monetization?: string
      deployment?: string
      model_used: string
      cost: string
      stage: string
    } = { model_used: 'javari-free', cost: '$0.00', stage: mode }

    if (mode === 'discuss') {
      const response = await callFreeModel(DISCUSS_SYSTEM,
        `App idea: ${input}\n\nProvide a comprehensive discussion covering feasibility, tech stack recommendations, key features, and initial monetization thoughts.`)
      result.plan = response
      result.model_used = 'DeepSeek V4 Flash (FREE)'
    }

    else if (mode === 'build') {
      // Parallel generation for speed
      const [architecture, monetization] = await Promise.all([
        callFreeModel(BUILD_SYSTEM,
          `Build this app: ${input}\n\nGenerate complete architecture, database schema, file structure, and key code for the 3 most important routes.`),
        callFreeModel(MONETIZE_SYSTEM,
          `Create monetization strategy for: ${input}\n\nBe specific with pricing, Stripe integration, and year 1 revenue projections.`),
      ])
      result.plan = architecture
      result.monetization = monetization
      result.model_used = 'DeepSeek V4 Flash (FREE) + Groq Llama (FREE)'
    }

    else if (mode === 'deploy') {
      const [deployment, code] = await Promise.all([
        callFreeModel(DEPLOY_SYSTEM,
          `Create production deployment guide for: ${input}\n\nInclude all environment variables, Vercel config, Supabase setup, and go-live checklist.`),
        callFreeModel(BUILD_SYSTEM,
          `For this app: ${input}\n\nGenerate the exact package.json, vercel.json, and next.config.js needed for production deployment.`),
      ])
      result.deployment = deployment
      result.code = code
      result.model_used = 'DeepSeek V4 Flash (FREE) + Groq Llama (FREE)'
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[builder] error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    app:       'Javari App Builder',
    version:   '1.0.0',
    modes:     ['discuss', 'build', 'deploy'],
    templates: ['saas', 'marketplace', 'tool', 'ecommerce', 'social', 'custom'],
    models:    'DeepSeek V4 Flash (free) + Groq Llama (free)',
    cost:      '$0.00',
  })
}
