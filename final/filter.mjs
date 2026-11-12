export function filterRooms(rooms, attendees, equipment) {
  return rooms.filter(room => room.capacity >= attendees &&
    equipment.every(item => room.equipment.includes(item)));
}
