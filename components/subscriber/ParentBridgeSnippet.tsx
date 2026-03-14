'use client'

import { useState } from 'react'
import { Copy, Check, Users } from 'lucide-react'
import { ShareButton } from '@/components/ui/ShareButton'
import type { DomainActivity, Language } from '@/lib/types'

interface ParentBridgeSnippetProps {
  domain: DomainActivity | undefined
  lang:   Language
  date:   string
  hideShare?: boolean
}

export function ParentBridgeSnippet({ domain, lang, date, hideShare }: ParentBridgeSnippetProps) {
  const [copied, setCopied] = useState(false)

  if (!domain) return null

  const text = lang === 'en' ? domain.en : domain.pt

  const fullSnippet = lang === 'en'
    ? `📚 Today's Learning — ${new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}\n\n${text}\n\nWith love, the Lua team 🌿`
    : `📚 Aprendizado de Hoje — ${new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', month: 'long', day: 'numeric' })}\n\n${text}\n\nCom carinho, a equipe Lua 🌿`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullSnippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Clipboard write failed:', err)
    }
  }

  return (
    <div className="rounded-3xl border border-terracotta-200 bg-terracotta-50 p-5 shadow-soft">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-soft">
          <Users className="w-4 h-4 text-terracotta-500" strokeWidth={1.5} />
        </div>
        <span className="font-lexend font-semibold text-terracotta-900 text-sm">
          {lang === 'en' ? 'Parent Bridge — Copy to Share' : 'Ponte com os Pais — Copiar para Compartilhar'}
        </span>
      </div>

      <textarea
        readOnly
        value={fullSnippet}
        rows={5}
        className="w-full rounded-2xl bg-white border border-terracotta-100 text-sm text-terracotta-800 font-inter p-4 resize-none focus:outline-none focus:ring-2 focus:ring-terracotta-200 leading-relaxed"
      />

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-terracotta-400 text-white text-sm font-lexend font-medium hover:bg-terracotta-500 transition shadow-soft"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" strokeWidth={2} />
              {lang === 'en' ? 'Copied!' : 'Copiado!'}
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" strokeWidth={1.5} />
              {lang === 'en' ? 'Copy text' : 'Copiar texto'}
            </>
          )}
        </button>

        {!hideShare && (
          <div className="flex-1">
            <ShareButton
              title={lang === 'en' ? "Today's Pre-K Parent Bridge" : "Ponte com os Pais de Hoje"}
              text={text}
              url={typeof window !== 'undefined' ? `${window.location.origin}/preview/day/PLACEHOLDER/${date}` : ''}
              lang={lang}
              variant="secondary"
              className="w-full [&>button]:w-full [&>button]:h-full [&>button]:py-2.5 [&>button]:rounded-2xl"
            />
          </div>
        )}
      </div>
    </div>
  )
}
