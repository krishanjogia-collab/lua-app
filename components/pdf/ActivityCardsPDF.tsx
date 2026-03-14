import React from 'react'
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer'
import type { DailyEntry } from '@/lib/types'
import { getActivityDescription } from '@/lib/types'

// Re-register fonts just in case this is loaded independently
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/inter@0.2.3/Inter_400Regular.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/inter@0.2.3/Inter_500Medium.ttf', fontWeight: 500 },
    { src: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/inter@0.2.3/Inter_600SemiBold.ttf', fontWeight: 600 },
  ]
})

Font.register({
  family: 'Lexend',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/lexend@0.2.3/Lexend_400Regular.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/lexend@0.2.3/Lexend_600SemiBold.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/lexend@0.2.3/Lexend_700Bold.ttf', fontWeight: 700 },
  ]
})

const colors = {
  cream: '#FBF9F6',
  terracotta: '#E2725B',
  terracottaDark: '#9C4A3A',
  sageDark: '#4A5C52',
  textMain: '#333333',
  textMuted: '#666666'
}

const DOMAIN_KEYS = [
  'sensory_layout',
  'cognitive_literacy',
  'physical_outdoor',
  'social_emotional',
  'cultural_global',
] as const

const DOMAIN_INFO: Record<string, { icon: string; en: string; pt: string }> = {
  sensory_layout: { icon: '🎨', en: 'Sensory', pt: 'Sensorial' },
  cognitive_literacy: { icon: '📖', en: 'Cognitive', pt: 'Cognitivo' },
  physical_outdoor: { icon: '🏃', en: 'Physical', pt: 'Físico' },
  social_emotional: { icon: '🤝', en: 'Social', pt: 'Social' },
  cultural_global: { icon: '🌍', en: 'Cultural', pt: 'Cultural' },
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '46%',
    height: '46%',
    margin: '2%',
    padding: 24,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  domainLabel: {
    fontFamily: 'Lexend',
    fontSize: 14,
    fontWeight: 600,
    color: colors.sageDark,
    textTransform: 'uppercase',
  },
  activityTitle: {
    fontFamily: 'Lexend',
    fontSize: 20,
    fontWeight: 700,
    color: colors.terracottaDark,
    marginBottom: 12,
  },
  activityDescription: {
    fontSize: 12,
    lineHeight: 1.5,
    color: colors.textMain,
    marginBottom: 'auto', // Pushes the rest to the bottom
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.sageDark,
    marginTop: 12,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 1.4,
  },
  materialsList: {
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    fontFamily: 'Lexend',
    fontSize: 10,
    fontWeight: 600,
    color: '#dddddd',
  }
})

interface ActivityCardsPDFProps {
  dayEntry: DailyEntry
  lang: 'en' | 'pt'
}

export function ActivityCardsPDF({ dayEntry, lang }: ActivityCardsPDFProps) {
  const domains = dayEntry.domains || {}
  
  // Filter only standard domains that have content
  const activeKeys = DOMAIN_KEYS.filter(key => domains[key])

  // Need to chunk keys into arrays of 4 (since 4 cards fit on one A4 landscape page)
  const chunkedKeys = []
  for (let i = 0; i < activeKeys.length; i += 4) {
    chunkedKeys.push(activeKeys.slice(i, i + 4))
  }

  return (
    <Document>
      {chunkedKeys.map((pageKeys, pageIndex) => (
        <Page key={pageIndex} size="A4" orientation="landscape" style={styles.page}>
          {pageKeys.map((key) => {
            const content = domains[key]
            if (!content) return null
            const info = DOMAIN_INFO[key]
            const title = lang === 'en' ? content.title : (content as any).pt_title || content.title
            let desc = getActivityDescription(content, lang)
            // Truncate desc if it's way too long to fit in a card
            if (desc && desc.length > 250) desc = desc.slice(0, 247) + '...'
            const materials = content.materials || []

            return (
              <View wrap={false} key={key} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.domainLabel}>
                    {lang === 'en' ? info.en : info.pt}
                  </Text>
                </View>
                <Text style={styles.activityTitle}>{title}</Text>
                <Text style={styles.activityDescription}>{desc}</Text>
                
                {materials.length > 0 && (
                  <View>
                    <Text style={styles.metaLabel}>{lang === 'en' ? 'Materials:' : 'Materiais:'}</Text>
                    <View style={styles.materialsList}>
                      {materials.slice(0, 4).map((m: any, i: number) => (
                        <Text key={i} style={styles.metaText}>• {typeof m === 'string' ? m : m.item}</Text>
                      ))}
                      {materials.length > 4 && (
                        <Text style={styles.metaText}>• +{materials.length - 4} {lang === 'en' ? 'more' : 'mais'}</Text>
                      )}
                    </View>
                  </View>
                )}
                <Text style={styles.footer}>🌙 Lua Learn</Text>
              </View>
            )
          })}
        </Page>
      ))}
    </Document>
  )
}
