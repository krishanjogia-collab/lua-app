'use client'

import { BookOpen, FolderOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { AssetCard } from '@/components/subscriber/AssetCard'
import { useLanguage } from '@/app/(subscriber)/LanguageContext'
import type { Asset, AssetType } from '@/lib/types'

const ASSET_TYPES: AssetType[] = ['Printable', 'Signage', 'Guide']

const TYPE_LABELS_EN: Record<AssetType, string> = {
  Printable: 'Printable Activities',
  Signage:   'Classroom Signage',
  Guide:     'Educator Guides',
}
const TYPE_LABELS_PT: Record<AssetType, string> = {
  Printable: 'Atividades para Imprimir',
  Signage:   'Placas de Sala',
  Guide:     'Guias do Educador',
}

interface VaultClientProps {
  assets: Asset[]
}

export function VaultClient({ assets }: VaultClientProps) {
  const { lang } = useLanguage()

  const grouped = ASSET_TYPES.reduce<Record<AssetType, Asset[]>>((acc, type) => {
    acc[type] = assets.filter(a => a.asset_type === type)
    return acc
  }, { Printable: [], Signage: [], Guide: [] })

  const isEmpty = assets.length === 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-terracotta-400" strokeWidth={1.5} />
          <span className="text-xs text-sage-500 font-inter uppercase tracking-wide">
            {lang === 'en' ? 'Asset Vault' : 'Banco de Recursos'}
          </span>
        </div>
        <h1 className="font-lexend text-3xl font-semibold text-terracotta-900">
          {lang === 'en' ? 'Resources' : 'Recursos'}
        </h1>
        <p className="text-sage-600 font-inter text-sm mt-1">
          {lang === 'en'
            ? 'Download printables, signage, and guides for this month.'
            : 'Baixe atividades, placas e guias deste mês.'}
        </p>
      </div>

      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-16 h-16 rounded-3xl bg-sage-100 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-sage-400" strokeWidth={1.5} />
          </div>
          <h2 className="font-lexend text-xl font-medium text-terracotta-900 mb-2">
            {lang === 'en' ? 'No resources yet' : 'Nenhum recurso ainda'}
          </h2>
          <p className="text-sm text-sage-500 font-inter">
            {lang === 'en'
              ? "Resources for this month's theme will appear here once uploaded."
              : 'Os recursos do tema deste mês aparecerão aqui após o upload.'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-10">
          {ASSET_TYPES.map(type => {
            const items = grouped[type]
            if (items.length === 0) return null
            const sectionLabel = lang === 'en' ? TYPE_LABELS_EN[type] : TYPE_LABELS_PT[type]

            return (
              <section key={type}>
                <h2 className="font-lexend font-semibold text-terracotta-800 text-lg mb-4">
                  {sectionLabel}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {items.map((asset, i) => (
                    <AssetCard key={asset.id} asset={asset} lang={lang} index={i} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
