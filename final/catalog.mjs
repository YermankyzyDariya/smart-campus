const rooms = [
  { id: 'cedar', name: 'Cedar Room', capacity: 12, equipment: ['Projector'],
    blocked: false, bookings: [{ start: '10:00', end: '11:00' }] },
  { id: 'maple', name: 'Maple Room', capacity: 20, equipment: ['Projector', 'Whiteboard'],
    blocked: false, bookings: [{ start: '11:00', end: '12:00' }] },
  { id: 'birch', name: 'Birch Studio', capacity: 30, equipment: ['Whiteboard', 'Video conferencing'],
    blocked: true, bookings: [] },
  { id: 'aspen', name: 'Aspen Hall', capacity: 40, equipment: ['Projector', 'Whiteboard', 'Video conferencing'],
    blocked: false, bookings: [{ start: '14:00', end: '15:00' }] },
];

export const catalog = Object.freeze(rooms.map(room => Object.freeze({
  ...room,
  equipment: Object.freeze(room.equipment),
  bookings: Object.freeze(room.bookings.map(Object.freeze)),
})));
export const equipmentOptions = Object.freeze([...new Set(catalog.flatMap(room => room.equipment))]);
