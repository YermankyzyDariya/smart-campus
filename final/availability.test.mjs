import test from 'node:test';
import assert from 'node:assert/strict';
import { availability } from './availability.mjs';

const room = Object.freeze({
  blocked: false,
  bookings: Object.freeze([Object.freeze({ start: '13:00', end: '14:00' })]),
});

const examples = [
  ['AC1 rejects malformed time', room, '09:60', '10:30', 'invalid'],
  ['AC1 rejects past start', room, '08:59', '09:30', 'invalid'],
  ['AC1 rejects reversed interval', room, '11:00', '10:00', 'invalid'],
  ['AC1 rejects zero length', room, '10:00', '10:00', 'invalid'],
  ['AC2 accepts exactly 120 minutes', room, '09:00', '11:00', 'available'],
  ['AC2 rejects 121 minutes', room, '09:00', '11:01', 'duration'],
  ['AC3 rejects blocked room', { ...room, blocked: true }, '09:00', '10:00', 'blocked'],
  ['AC4 permits touching either endpoint (before)', room, '12:00', '13:00', 'available'],
  ['AC4 permits touching either endpoint (after)', room, '14:00', '15:00', 'available'],
  ['AC4 rejects one-minute overlap', room, '12:00', '13:01', 'overlap'],
];
for (const [name, fixture, from, to, expected] of examples) {
  test(name, () => assert.equal(availability(fixture, from, to).code, expected));
}
test('AC5 preserves booking values, identity and order', () => {
  const bookings = Object.freeze([
    Object.freeze({ start: '15:00', end: '15:30' }),
    Object.freeze({ start: '13:00', end: '14:00' }),
  ]);
  const snapshot = structuredClone(bookings);
  const fixture = { ...room, bookings };
  assert.equal(availability(fixture, '13:30', '14:15').code, 'overlap');
  assert.equal(fixture.bookings, bookings);
  assert.deepEqual(fixture.bookings, snapshot);
});
