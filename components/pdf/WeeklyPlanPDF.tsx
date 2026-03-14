import React from 'react'
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer'
import type { CurriculumPlan, DailyEntry } from '@/lib/types'

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
  creamDark: '#F2EBE1',
  terracotta: '#E2725B',
  terracottaDark: '#9C4A3A',
  sage: '#8DA399',
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
  sensory_layout: { icon: '🎨', en: 'Sensory Experience', pt: 'Experiência Sensorial' },
  cognitive_literacy: { icon: '📖', en: 'Cognitive & Literacy', pt: 'Cognitivo e Alfabetização' },
  physical_outdoor: { icon: '🏃', en: 'Physical & Outdoor', pt: 'Físico e Ar Livre' },
  social_emotional: { icon: '🤝', en: 'Social Emotional', pt: 'Socioemocional' },
  cultural_global: { icon: '🌍', en: 'Cultural & Global', pt: 'Cultural e Global' },
  parent_bridge: { icon: '👨‍👩‍👧', en: 'Parent Bridge', pt: 'Ponte com os Pais' },
}

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Inter', color: colors.textMain },
  coverPage: { padding: 40, backgroundColor: colors.cream, fontFamily: 'Inter', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' },
  header: { borderBottomWidth: 2, borderBottomColor: colors.terracotta, paddingBottom: 20, marginBottom: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logoText: { fontFamily: 'Lexend', fontSize: 24, fontWeight: 700, color: colors.terracottaDark, letterSpacing: -0.5 },
  themeTitle: { fontFamily: 'Lexend', fontSize: 28, fontWeight: 600, color: colors.terracotta, marginBottom: 4 },
  dateSubtitle: { fontSize: 12, color: colors.sageDark, fontWeight: 500 },
  domainCard: { backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.creamDark, borderRadius: 8, padding: 16, marginBottom: 16 },
  domainHeaderLine: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  domainLabel: { fontFamily: 'Lexend', fontSize: 10, fontWeight: 600, color: colors.sageDark, textTransform: 'uppercase' },
  activityTitle: { fontFamily: 'Lexend', fontSize: 14, fontWeight: 600, color: colors.terracottaDark, marginBottom: 8 },
  activityDescription: { fontSize: 11, lineHeight: 1.5, color: colors.textMain, marginBottom: 8 },
  metaLabel: { fontSize: 10, fontWeight: 600, color: colors.sageDark, marginTop: 6 },
  metaText: { fontSize: 10, color: colors.textMuted, lineHeight: 1.4 },
  materialsList: { marginLeft: 8, marginTop: 2 },
  parentCard: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FFE0E0', borderRadius: 8, padding: 16, marginTop: 10 },
  parentTitle: { fontFamily: 'Lexend', fontSize: 12, fontWeight: 600, color: colors.terracotta, marginBottom: 6 },
  parentText: { fontSize: 11, lineHeight: 1.5, fontStyle: 'italic', color: colors.terracottaDark },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: colors.creamDark, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 9, color: colors.sageDark },
  
  // Cover specifics
  coverLogo: { fontFamily: 'Lexend', fontSize: 36, fontWeight: 700, color: colors.terracottaDark, marginBottom: 24 },
  coverTheme: { fontFamily: 'Lexend', fontSize: 40, fontWeight: 800, color: colors.terracotta, marginBottom: 16 },
  coverWeek: { fontSize: 16, color: colors.sageDark, fontWeight: 600, marginBottom: 40 },
  coverList: { width: '80%', textAlign: 'left', backgroundColor: '#ffffff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.creamDark },
  coverRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.creamDark },
  coverRowDate: { width: 100, fontSize: 12, fontWeight: 600, color: colors.sageDark },
  coverRowTitle: { flex: 1, fontSize: 12, fontFamily: 'Lexend', fontWeight: 600, color: colors.terracottaDark }
})

interface WeeklyPlanPDFProps {
  plan: CurriculumPlan
  days: DailyEntry[]
  weekLabel: string
  lang: 'en' | 'pt'
}

export function WeeklyPlanPDF({ plan, days, weekLabel, lang }: WeeklyPlanPDFProps) {
  const theme = plan.daily_data?.theme ?? plan.theme_name

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverLogo}>🌙 Lua</Text>
        <Text style={styles.coverTheme}>{theme}</Text>
        <Text style={styles.coverWeek}>{weekLabel}</Text>
        
        <View style={styles.coverList}>
          {days.map((day, i) => {
            const dateObj = new Date(day.date + 'T12:00:00')
            const dayName = dateObj.toLocaleDateString(lang === 'en' ? 'en-US' : 'pt-BR', { weekday: 'short', month: 'short', day: 'numeric' })
            
            // Try to find a primary activity to show as subtheme
            let mainActivity = 'Free Play'
            const domains = day.domains || {}
            for (const k of DOMAIN_KEYS) {
              if (domains[k]) {
                const title = lang === 'en' ? domains[k].title : (domains[k] as any).pt_title || domains[k].title
                mainActivity = title
                break
              }
            }

            return (
              <View key={i} style={[styles.coverRow, i === days.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                <Text style={styles.coverRowDate}>Day {day.day_number} ({dayName})</Text>
                <Text style={styles.coverRowTitle}>{mainActivity}</Text>
              </View>
            )
          })}
        </View>
      </Page>

      {/* Daily Pages */}
      {days.map((day, pageIndex) => {
        const domains = day.domains || {}
        const dateObj = new Date(day.date + 'T12:00:00')
        const dayName = dateObj.toLocaleDateString(lang === 'en' ? 'en-US' : 'pt-BR', { weekday: 'long', month: 'long', day: 'numeric' })
        
        return (
          <Page key={day.date} size="A4" style={styles.page}>
            <View style={styles.header}>
              <View style={styles.logoRow}>
                <Text style={styles.logoText}>Lua</Text>
              </View>
              <Text style={styles.themeTitle}>{theme}</Text>
              <Text style={styles.dateSubtitle}>
                {lang === 'en' ? `Day ${day.day_number} of 5` : `Dia ${day.day_number} de 5`} — {dayName}
              </Text>
            </View>

            {DOMAIN_KEYS.map((key) => {
              const content = domains[key]
              if (!content) return null
              const info = DOMAIN_INFO[key]
              const title = lang === 'en' ? content.title : (content as any).pt_title || content.title
              const desc = lang === 'en' ? content.en : content.pt
              const materials = content.materials || []

              return (
                <View wrap={false} key={key} style={styles.domainCard}>
                  <View style={styles.domainHeaderLine}>
                    <Text style={styles.domainLabel}>{lang === 'en' ? info.en : info.pt}</Text>
                  </View>
                  <Text style={styles.activityTitle}>{title}</Text>
                  <Text style={styles.activityDescription}>{desc}</Text>
                  {materials.length > 0 && (
                    <View>
                      <Text style={styles.metaLabel}>{lang === 'en' ? 'Materials:' : 'Materiais:'}</Text>
                      <View style={styles.materialsList}>
                        {materials.map((m: any, i: number) => (
                          <Text key={i} style={styles.metaText}>• {lang === 'en' ? m.en : m.pt}</Text>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )
            })}

            {domains.parent_bridge && (
              <View wrap={false} style={styles.parentCard}>
                <Text style={styles.parentTitle}>
                  {lang === 'en' ? DOMAIN_INFO.parent_bridge.en : DOMAIN_INFO.parent_bridge.pt}
                </Text>
                <Text style={styles.parentText}>
                  "{lang === 'en' ? domains.parent_bridge.en : domains.parent_bridge.pt}"
                </Text>
              </View>
            )}

            <View style={styles.footer} fixed>
              <Text style={styles.footerText}>
                {lang === 'en' ? 'Generated by Lua Curriculum Engine' : 'Gerado pelo Lua Curriculum Engine'}
              </Text>
              <Text style={styles.footerText}>luaapp.com</Text>
            </View>
          </Page>
        )
      })}
    </Document>
  )
}
