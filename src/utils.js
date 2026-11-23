import { format, parseISO, differenceInCalendarDays, isWithinInterval, areIntervalsOverlapping, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format currency into Indonesian Rupiah (IDR)
 * e.g. 3500000 -> "Rp 3.500.000"
 */
export function formatIDR(amount) {
  const numeric = Number(amount) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(numeric).replace('IDR', 'Rp');
}

/**
 * Format date string (YYYY-MM-DD) into Indonesian human-readable string
 * e.g. "2026-10-23" -> "23 Oktober 2026"
 */
export function formatDateIndo(dateStr, formatPattern = 'd MMMM yyyy') {
  if (!dateStr) return '-';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(date, formatPattern, { locale: id });
  } catch (err) {
    return dateStr;
  }
}

/**
 * Format date range into Indonesian format
 * e.g. "23 - 25 Oktober 2026 (3 Hari)"
 */
export function formatDateRangeIndo(startDateStr, endDateStr) {
  if (!startDateStr) return '-';
  if (!endDateStr || startDateStr === endDateStr) {
    return `${formatDateIndo(startDateStr)} (1 Hari)`;
  }
  
  const start = parseISO(startDateStr);
  const end = parseISO(endDateStr);
  const days = differenceInCalendarDays(end, start) + 1;
  
  const startFormatted = format(start, 'd MMMM', { locale: id });
  const endFormatted = format(end, 'd MMMM yyyy', { locale: id });
  
  return `${startFormatted} – ${endFormatted} (${days} Hari)`;
}

/**
 * Calculate duration in days between two ISO dates (inclusive)
 */
export function calculateDurationDays(startDateStr, endDateStr) {
  if (!startDateStr) return 1;
  if (!endDateStr) return 1;
  try {
    const start = parseISO(startDateStr);
    const end = parseISO(endDateStr);
    const diff = differenceInCalendarDays(end, start);
    return Math.max(1, diff + 1);
  } catch (e) {
    return 1;
  }
}

/**
 * Check if a date string is within any existing bookings for a specific bus
 */
export function isDateBookedForBus(dateStr, busId, bookings = [], excludeBookingId = null) {
  if (!dateStr || !busId) return null;
  const targetDate = parseISO(dateStr);

  for (const b of bookings) {
    if (excludeBookingId && b.id === excludeBookingId) continue;
    if (b.busId !== busId && b.busName !== busId) continue;
    if (b.status === 'Dibatalkan') continue;

    const start = parseISO(b.startDate);
    const end = parseISO(b.endDate || b.startDate);

    if (
      isSameDay(targetDate, start) ||
      isSameDay(targetDate, end) ||
      isWithinInterval(targetDate, { start, end })
    ) {
      return b; // returns conflicting booking
    }
  }
  return null;
}

/**
 * Check if an entire date range has collisions for a bus
 */
export function checkRangeCollision(startDateStr, endDateStr, busId, bookings = [], excludeBookingId = null) {
  if (!startDateStr || !endDateStr || !busId) return { hasCollision: false, conflict: null };
  const start = parseISO(startDateStr);
  const end = parseISO(endDateStr);

  for (const b of bookings) {
    if (excludeBookingId && b.id === excludeBookingId) continue;
    if (b.busId !== busId && b.busName !== busId) continue;
    if (b.status === 'Dibatalkan') continue;

    const bStart = parseISO(b.startDate);
    const bEnd = parseISO(b.endDate || b.startDate);

    const overlaps = areIntervalsOverlapping(
      { start, end },
      { start: bStart, end: bEnd },
      { inclusive: true }
    );

    if (overlaps) {
      return { hasCollision: true, conflict: b };
    }
  }

  return { hasCollision: false, conflict: null };
}

/**
 * Generates an SVG pseudo Code128 Barcode based on an input string
 */
export function generateBarcodeBars(code = 'TRV-202610-001') {
  const bars = [];
  let seed = 0;
  for (let i = 0; i < code.length; i++) {
    seed += code.charCodeAt(i);
  }

  // Consistent bar pattern pseudo-randomized by input code
  const totalBars = 48;
  for (let i = 0; i < totalBars; i++) {
    const width = ((seed * (i + 1) * 7) % 3) + 1; // 1, 2, or 3
    const isBlack = (i % 2 === 0) || ((seed + i) % 5 > 1);
    bars.push({
      width: width * 1.5,
      isBlack,
    });
  }
  return bars;
}

/**
 * Generate a random booking identifier
 */
export function generateBookingId() {
  const dateStr = format(new Date(), 'yyMMdd');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `TRV-${dateStr}-${randomSuffix}`;
}

/**
 * Cetak satu elemen saja (mis. Surat Jalan di drawer admin) tanpa UI di sekitarnya.
 */
export function printElement(element) {
  if (!element) {
    window.print();
    return;
  }

  const printTarget = document.createElement('div');
  printTarget.className = 'print-focus-target';
  printTarget.appendChild(element.cloneNode(true));
  document.body.appendChild(printTarget);
  document.body.classList.add('print-focus');
  const cleanup = () => {
    printTarget.remove();
    document.body.classList.remove('print-focus');
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  window.print();
  setTimeout(cleanup, 30000);
}
