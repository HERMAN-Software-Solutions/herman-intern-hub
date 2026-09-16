import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import type { CertificateData } from '../types'

const COLORS = {
  primary: '#0F172A',
  secondary: '#64748B',
  border: '#E2E8F0',
}

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: COLORS.primary,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    marginBottom: 30,
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
  brandName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  brandSub: {
    fontSize: 9,
    color: COLORS.secondary,
    marginTop: 2,
  },
  dateLine: {
    fontSize: 10,
    color: COLORS.secondary,
    marginBottom: 24,
  },
  subject: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
    textDecoration: 'underline',
  },
  salutation: {
    fontSize: 11,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.7,
    marginBottom: 14,
    textAlign: 'justify',
  },
  signatureBlock: {
    marginTop: 50,
  },
  signatureLine: {
    borderTopWidth: 0.5,
    borderTopColor: COLORS.primary,
    width: 180,
    marginBottom: 6,
  },
  signatureName: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  signatureRole: {
    fontSize: 10,
    color: COLORS.secondary,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    fontSize: 8,
    color: COLORS.secondary,
    textAlign: 'center',
  },
})

export function ExperienceLetterDocument({
  data,
  recipient = 'To Whom It May Concern',
}: {
  data: CertificateData
  recipient?: string
}) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

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
        </View>

        <Text style={styles.dateLine}>{today}</Text>

        <Text style={styles.subject}>RE: EXPERIENCE LETTER</Text>

        <Text style={styles.salutation}>Dear {recipient},</Text>

        <Text style={styles.paragraph}>
          This is to confirm that <Text style={{ fontWeight: 'bold' }}>
            {data.internName}
          </Text>{' '}
          completed a {data.durationWeeks}-week internship with HERMAN
          Software Solutions Limited from {data.startDate} to {data.endDate}.
          During this period, they worked under the mentorship of{' '}
          {data.mentorName} as part of our software engineering team.
        </Text>

        <Text style={styles.paragraph}>
          Throughout the internship, {data.internName.split(' ')[0]} focused
          on {data.track.toLowerCase()}, gaining hands-on experience with
          production-grade software development, collaborative workflows, and
          real client deliverables. They completed{' '}
          {data.tasksCompleted} of {data.tasksAssigned} assigned tasks and
          maintained consistent daily engagement across the program.
        </Text>

        {data.highlights.length > 0 && (
          <Text style={styles.paragraph}>
            Notable contributions included: {data.highlights.join('; ')}.
          </Text>
        )}

        <Text style={styles.paragraph}>
          {data.internName.split(' ')[0]} demonstrated professionalism,
          reliability, and a strong willingness to learn. Their overall
          performance was rated{' '}
          <Text style={{ fontWeight: 'bold' }}>
            {data.band} ({data.score.toFixed(1)} / 5.0)
          </Text>{' '}
          by their mentor.
        </Text>

        <Text style={styles.paragraph}>
          We recommend {data.internName.split(' ')[0]} for any future role in
          software development or a related field. They would be a valuable
          addition to any team.
        </Text>

        <Text style={styles.paragraph}>
          Please feel free to contact us if you require any further
          information.
        </Text>

        <Text style={styles.paragraph}>Sincerely,</Text>

        {/* Signature */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureName}>{data.ceoName}</Text>
          <Text style={styles.signatureRole}>
            Chief Executive Officer{'\n'}
            HERMAN Software Solutions Limited
          </Text>
        </View>

        <Text style={styles.footer}>
          Certificate ID: {data.certificateId} · Verify at {data.verifyUrl}
        </Text>
      </Page>
    </Document>
  )
}