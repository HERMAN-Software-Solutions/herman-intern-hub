import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { CertificateData } from '../types'

// Register fonts (using built-in Helvetica as fallback)
// In production, you'd register Inter/Georgia from /public/fonts
Font.registerHyphenationCallback((word) => [word])

const COLORS = {
  primary: '#0F172A',
  secondary: '#64748B',
  border: '#E2E8F0',
  accent: '#2563EB',
  seal: '#B45309',
  green: '#16A34A',
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.primary,
  },
  outerBorder: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 20,
    height: '100%',
  },
  innerBorder: {
    borderWidth: 0.5,
    borderColor: COLORS.border,
    padding: 24,
    height: '100%',
    flexDirection: 'column',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: 'contain',
  },
  brandBlock: {},
  brandName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 8,
    color: COLORS.secondary,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerMetaLabel: {
    fontSize: 7,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerMetaValue: {
    fontSize: 10,
    color: COLORS.primary,
    marginTop: 2,
  },

  // Title
  titleBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 3,
    textAlign: 'center',
  },
  titleRule: {
    width: 100,
    height: 2,
    backgroundColor: COLORS.primary,
    marginTop: 8,
  },

  // Body
  bodyBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  certifyText: {
    fontSize: 11,
    color: COLORS.secondary,
    marginBottom: 8,
  },
  internName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginVertical: 8,
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 10,
    color: COLORS.primary,
    lineHeight: 1.5,
    textAlign: 'center',
    maxWidth: 420,
    marginTop: 4,
  },

  // Performance section
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  performanceBlock: {
    backgroundColor: '#F8FAFC',
    borderWidth: 0.5,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 12,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  performanceLabel: {
    fontSize: 9,
    color: COLORS.secondary,
  },
  performanceValue: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  // Contributions
  contributionsBlock: {
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.accent,
  },
  contribution: {
    fontSize: 9,
    color: COLORS.primary,
    marginBottom: 4,
    lineHeight: 1.4,
  },

  // Signatures
  signaturesBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 20,
  },
  signature: {
    width: 150,
    alignItems: 'center',
  },
  signatureLine: {
    borderTopWidth: 0.5,
    borderTopColor: COLORS.primary,
    width: '100%',
    marginBottom: 6,
  },
  signatureName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  signatureRole: {
    fontSize: 8,
    color: COLORS.secondary,
    marginTop: 2,
  },
  sealBlock: {
    width: 60,
    height: 60,
    borderWidth: 1.5,
    borderColor: COLORS.seal,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
  },
  sealText: {
    fontSize: 6,
    color: COLORS.seal,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1.3,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    marginTop: 12,
  },
  footerText: {
    fontSize: 7,
    color: COLORS.secondary,
    lineHeight: 1.4,
  },
  footerBold: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  qrCode: {
    width: 40,
    height: 40,
  },
})

export function CertificateDocument({ data }: { data: CertificateData }) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Image src="/brand/logo-pdf.jpg" style={styles.logo} />
                <View style={styles.brandBlock}>
                  <Text style={styles.brandName}>
                    HERMAN SOFTWARE SOLUTIONS LIMITED
                  </Text>
                  <Text style={styles.brandSub}>
                    Jinja, Gabula Rd, Uganda · infohermansoftware@gmail.com
                  </Text>
                </View>
              </View>
              <View style={styles.headerRight}>
                <Text style={styles.headerMetaLabel}>Issue date</Text>
                <Text style={styles.headerMetaValue}>{data.issueDate}</Text>
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleBlock}>
              <Text style={styles.title}>CERTIFICATE OF INTERNSHIP</Text>
              <View style={styles.titleRule} />
            </View>

            {/* Body */}
            <View style={styles.bodyBlock}>
              <Text style={styles.certifyText}>This is to certify that</Text>
              <Text style={styles.internName}>
                {data.internName.toUpperCase()}
              </Text>
              <Text style={styles.bodyText}>
                has successfully completed a {data.durationWeeks}-week
                internship in {data.track} at HERMAN Software Solutions
                Limited, from {data.startDate} to {data.endDate}.
              </Text>
            </View>

            {/* Performance Summary */}
            <Text style={styles.sectionTitle}>Performance Summary</Text>
            <View style={styles.performanceBlock}>
              <View style={styles.performanceRow}>
                <Text style={styles.performanceLabel}>Overall Rating</Text>
                <Text style={styles.performanceValue}>
                  {data.score.toFixed(1)} / 5.0 · {data.band}
                </Text>
              </View>
              <View style={styles.performanceRow}>
                <Text style={styles.performanceLabel}>Task Completion</Text>
                <Text style={styles.performanceValue}>
                  {data.tasksCompleted} of {data.tasksAssigned} tasks
                </Text>
              </View>
              <View style={styles.performanceRow}>
                <Text style={styles.performanceLabel}>Consistency</Text>
                <Text style={styles.performanceValue}>
                  {data.daysLogged} of {data.workingDays} days logged
                </Text>
              </View>
            </View>

            {/* Key Contributions */}
            {data.highlights.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Key Contributions</Text>
                <View style={styles.contributionsBlock}>
                  {data.highlights.map((h, i) => (
                    <Text key={i} style={styles.contribution}>
                      · {h}
                    </Text>
                  ))}
                </View>
              </>
            )}

            {/* Signatures */}
            <View style={styles.signaturesBlock}>
              <View style={styles.signature}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureName}>{data.ceoName}</Text>
                <Text style={styles.signatureRole}>Chief Executive Officer</Text>
              </View>

              <View style={styles.sealBlock}>
                <Text style={styles.sealText}>
                  HERMAN{'\n'}OFFICIAL{'\n'}SEAL
                </Text>
              </View>

              <View style={styles.signature}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureName}>{data.mentorName}</Text>
                <Text style={styles.signatureRole}>Internship Mentor</Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View>
                <Text style={styles.footerText}>
                  Certificate ID: <Text style={styles.footerBold}>{data.certificateId}</Text>
                </Text>
                <Text style={styles.footerText}>
                  Verify authenticity at:{' '}
                  <Text style={styles.footerBold}>{data.verifyUrl}</Text>
                </Text>
              </View>
              {data.qrCodeDataUrl && (
                <Image src={data.qrCodeDataUrl} style={styles.qrCode} />
              )}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}