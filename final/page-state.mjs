import { catalog, equipmentOptions } from './catalog.mjs';
import { filterRooms } from './filter.mjs';
import { availability, minutes } from './availability.mjs';

export function pageState(params) {
  const rawAttendees = params.get('attendees') ?? '';
  const validAttendees = rawAttendees === '' ||
    (/^\d+$/.test(rawAttendees) && Number.isSafeInteger(Number(rawAttendees)) && Number(rawAttendees) > 0);
  const attendees = validAttendees ? rawAttendees : '';
  const equipment = equipmentOptions.filter(item => params.getAll('equipment').includes(item));
  const rooms = validAttendees ? filterRooms(catalog, Number(attendees), equipment) : [];
  const room = rooms.find(candidate => candidate.id === params.get('room')) ?? rooms[0];
  const start = params.get('start') ?? '';
  const end = params.get('end') ?? '';
  const result = room && (params.has('check') || (start && end))
    ? availability(room, start, end)
    : null;
  return {
    attendees, equipment, rooms, room, result,
    start: Number.isFinite(minutes(start)) ? start : '',
    end: Number.isFinite(minutes(end)) ? end : '',
    filterError: validAttendees ? '' : 'Enter a positive whole number for attendees.',
  };
}
