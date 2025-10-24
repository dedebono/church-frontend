// dateHelpers.js - Helper functions for date conversion between UTC (backend) and Makassar time (frontend local)

// Makassar timezone: Asia/Makassar (UTC+8)

// Convert UTC ISO string or DD/MM/YYYY string to YYYY-MM-DD for input type="date" in Makassar time
function isoToInputDateMakassar(utcIso) {
  if (!utcIso) return ""
  let date;
  if (utcIso.includes('/')) {
    // Assume DD/MM/YYYY
    const [dd, mm, yyyy] = utcIso.split('/')
    date = new Date(`${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}T00:00:00.000Z`)
  } else {
    date = new Date(utcIso) // UTC date
  }
  // Convert to Makassar time
  const makassarTime = new Date(date.getTime() + (8 * 60 * 60 * 1000)) // Add 8 hours
  const yyyy = makassarTime.getUTCFullYear()
  const mm = String(makassarTime.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(makassarTime.getUTCDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

// Convert YYYY-MM-DD (from input, assumed Makassar time) to UTC ISO string
function inputDateToIsoMakassar(dateStr) {
  if (!dateStr) return null
  // Assume dateStr is in Makassar time, subtract 8 hours to get UTC
  const localDate = new Date(`${dateStr}T00:00:00.000Z`) // Midnight UTC for the date
  const utcDate = new Date(localDate.getTime() - (8 * 60 * 60 * 1000)) // Subtract 8 hours
  return utcDate.toISOString()
}

// Format UTC ISO string to DD/MM/YYYY in Makassar time
function formatDateToMakassar(utcIso) {
  if (!utcIso) return ""
  const date = new Date(utcIso) // UTC date
  // Use Intl.DateTimeFormat for Makassar timezone
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

export { isoToInputDateMakassar, inputDateToIsoMakassar, formatDateToMakassar }
