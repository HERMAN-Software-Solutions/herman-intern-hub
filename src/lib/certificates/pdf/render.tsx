import 'server-only'
import { renderToBuffer } from '@react-pdf/renderer'
import { CertificateDocument } from '../template/certificate'
import { ExperienceLetterDocument } from '../template/experience-letter'
import type { CertificateData } from '../types'

export async function renderCertificatePdf(
  data: CertificateData
): Promise<Buffer> {
  return await renderToBuffer(<CertificateDocument data={data} />)
}

export async function renderExperienceLetterPdf(
  data: CertificateData
): Promise<Buffer> {
  return await renderToBuffer(<ExperienceLetterDocument data={data} />)
}