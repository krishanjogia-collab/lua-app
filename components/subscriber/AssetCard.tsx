'use client'

import { motion } from 'framer-motion'
import { Download, FileText, Image, BookOpen } from 'lucide-react'
import type { Asset, AssetType, Language } from '@/lib/types'
import { cn } from '@/lib/utils'

const ASSET_ICONS: Record<AssetType, typeof FileText> = {
  Printable: FileText,
  Signage:   Image,
  Guide:     BookOpen,
}

const ASSET_COLORS: Record<AssetType, { border: string; bg: string; icon: string; badge: string }> = {
  Printable: { border: 'border-terracotta-200', bg: 'bg-terracotta-50',  icon: 'text-terracotta-500', badge: 'bg-terracotta-100 text-terracotta-700' },
  Signage:   { border: 'border-sage-200',       bg: 'bg-sage-50',        icon: 'text-sage-600',       badge: 'bg-sage-100 text-sage-700'             },
  Guide:     { border: 'border-dusty-rose-200', bg: 'bg-dusty-rose-50',  icon: 'text-dusty-rose-500', badge: 'bg-dusty-rose-100 text-dusty-rose-700' },
}

const ASSET_LABELS_EN: Record<AssetType, string> = {
  Printable: 'Printable Activity',
  Signage:   'Classroom Signage',
  Guide:     'Educator Guide',
}
const ASSET_LABELS_PT: Record<AssetType, string> = {
  Printable: 'Atividade para Imprimir',
  Signage:   'Placa de Sala',
  Guide:     'Guia do Educador',
}

interface AssetCardProps {
  asset: Asset
  lang:  Language
  index: number
}

export function AssetCard({ asset, lang, index }: AssetCardProps) {
  const Icon   = ASSET_ICONS[asset.asset_type]
  const colors = ASSET_COLORS[asset.asset_type]
  const label  = lang === 'en' ? ASSET_LABELS_EN[asset.asset_type] : ASSET_LABELS_PT[asset.asset_type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className={cn(
        'rounded-3xl border p-5 shadow-soft flex flex-col gap-4',
        colors.border, colors.bg
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-soft flex-shrink-0">
          <Icon className={cn('w-6 h-6', colors.icon)} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-xl text-xs font-medium font-inter mb-1.5', colors.badge)}>
            {label}
          </span>
          <h3 className="font-lexend font-semibold text-terracotta-900 text-sm leading-snug truncate">
            {asset.title || (lang === 'en' ? 'Untitled Asset' : 'Arquivo sem Título')}
          </h3>
        </div>
      </div>

      <a
        href={asset.file_url}
        target="_blank"
        rel="noopener noreferrer"
        download
        aria-label={lang === 'en' ? `Download ${asset.title}` : `Baixar ${asset.title}`}
        className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white text-terracotta-700 text-sm font-lexend font-medium border border-white shadow-soft hover:bg-terracotta-50 hover:border-terracotta-200 transition"
      >
        <Download className="w-4 h-4" strokeWidth={1.5} />
        {lang === 'en' ? 'Download' : 'Baixar'}
      </a>
    </motion.div>
  )
}
