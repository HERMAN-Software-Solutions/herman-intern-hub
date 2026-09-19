/**
 * Minimal CSV serializer.
 * - Escapes quotes by doubling them
 * - Wraps any field containing comma, quote, or newline in double quotes
 * - Prepends a UTF-8 BOM so Excel opens it correctly
 */

export type CsvColumn<T> = {
  header: string
  /** Value getter — return string | number | boolean | null | undefined */
  value: (row: T) => unknown
}

function escapeCell(raw: unknown): string {
  if (raw === null || raw === undefined) return ''

  let s = String(raw)

  // Prevent CSV injection: prefix dangerous leading chars with a single quote.
  // Excel/Sheets treat =, +, -, @, \t, \r as formula starts.
  if (/^[=+\-@\t\r]/.test(s)) {
    s = `'${s}`
  }

  const needsQuotes = /[",\n\r]/.test(s)
  if (needsQuotes) {
    s = `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCell(c.header)).join(',')
  const body = rows
    .map((row) => columns.map((c) => escapeCell(c.value(row))).join(','))
    .join('\r\n')

  // BOM so Excel auto-detects UTF-8
  return '\uFEFF' + header + '\r\n' + body + '\r\n'
}

export function csvResponse(
  csv: string,
  filename: string
): Response {
  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}

export function datedFilename(base: string): string {
  const d = new Date()
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return `${base}-${iso}.csv`
}