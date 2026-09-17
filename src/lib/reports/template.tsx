import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import type { WeeklyReportData } from './types'

const COLORS = {
  primary: '#0F172A',
  secondary: '#64748B',
  border: '#E2E8F0',
  accent: '#2563EB',
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 44,
    height: 44,
    objectFit: 'contain',
  },
  brandName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  brandSub: {
    fontSize: 8,
    color: COLORS.secondary,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  reportLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.secondary,
  },
  reportPeriod: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 3,
  },
  internInfo: {
    marginBottom: 20,
  },
  internName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  internSub: {
    fontSize: 10,
    color: COLORS.secondary,
    marginTop: 2,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 0.5,
    borderColor: COLORS.border,
    padding: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 8,
    color: COLORS.secondary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  entry: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  entryDate: {
    width: 80,
    fontSize: 9,
    color: COLORS.secondary,
  },
  entryHours: {
    width: 50,
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  entryText: {
    flex: 1,
    fontSize: 9,
    color: COLORS.primary,
    lineHeight: 1.4,
  },
  highlight: {
    fontSize: 10,
    color: COLORS.primary,
    marginBottom: 4,
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    fontSize: 8,
    color: COLORS.secondary,
    textAlign: 'center',
  },
})

export function WeeklyReportDocument({
  data,
}: {
  data: WeeklyReportData
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src="/brand/logo.png" style={styles.logo} />
            <View>
              <Text style={styles.brandName}>
                HERMAN SOFTWARE SOLUTIONS LIMITED
              </Text>
              <Text style={styles.brandSub}>
                Jinja, Gabula Rd, Uganda · infohermansoftware@gmail.com
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reportLabel}>Weekly Report</Text>
            <Text style={styles.reportPeriod}>
              {data.weekStart} – {data.weekEnd}
            </Text>
          </View>
        </View>

        {/* Intern info */}
        <View style={styles.internInfo}>
          <Text style={styles.internName}>{data.internName}</Text>
          <Text style={styles.internSub}>
            {data.mentorName
              ? `Mentored by ${data.mentorName}`
              : 'No mentor assigned'}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This week at a glance</Text>
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{data.totalHours}h</Text>
              <Text style={styles.statLabel}>Hours logged</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {data.daysLogged}/{data.daysInWeek}
              </Text>
              <Text style={styles.statLabel}>Days logged</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{data.tasksCompletedThisWeek}</Text>
              <Text style={styles.statLabel}>Tasks completed</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{data.submissionsThisWeek}</Text>
              <Text style={styles.statLabel}>Submissions</Text>
            </View>
          </View>
        </View>

        {/* Highlights */}
        {data.highlights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Highlights</Text>
            {data.highlights.map((h, i) => (
              <Text key={i} style={styles.highlight}>
                · {h}
              </Text>
            ))}
          </View>
        )}

        {/* Daily entries */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily log</Text>
          {data.dailyEntries.length === 0 ? (
            <Text style={styles.entryText}>
              No entries logged this week.
            </Text>
          ) : (
            data.dailyEntries.map((entry, i) => (
              <View key={i} style={styles.entry}>
                <Text style={styles.entryDate}>{entry.date}</Text>
                <Text style={styles.entryHours}>{entry.hours}h</Text>
                <Text style={styles.entryText}>{entry.description}</Text>
              </View>
            ))
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Auto-generated by HERMAN Intern Hub · {data.weekStart} to {data.weekEnd}
        </Text>
      </Page>
    </Document>
  )
}