export const CURRENT_TIME = '09:00';

export function minutes(value) {
  if (typeof value !== 'string' || value.length !== 5 || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return NaN;
  const [hours, mins] = value.split(':').map(Number);
  return hours * 60 + mins;
}

export function availability(room, start, end) {
  const from = minutes(start);
  const to = minutes(end);
  if (!Number.isFinite(from) || !Number.isFinite(to) ||
      from < minutes(CURRENT_TIME) || to <= from) {
    return { code: 'invalid', message: 'Enter a start at or after 09:00 and a later end.' };
  }
  if (to - from > 120) return { code: 'duration', message: 'Maximum duration is 120 minutes.' };
  if (room.blocked) return { code: 'blocked', message: 'This room is blocked.' };
  if (room.bookings.some(booking => from < minutes(booking.end) && to > minutes(booking.start))) {
    return { code: 'overlap', message: 'This time overlaps an existing booking.' };
  }
  return { code: 'available', message: 'The room is available.' };
}
