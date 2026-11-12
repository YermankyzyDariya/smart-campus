import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { catalog } from './catalog.mjs';
import { filterRooms } from './filter.mjs';
import { createApp } from './server.mjs';

test('F1 includes exact capacity and excludes a room one seat short', () => {
  assert.deepEqual(filterRooms(catalog, 12, []).map(room => room.id), ['cedar', 'maple', 'birch', 'aspen']);
  assert.deepEqual(filterRooms(catalog, 13, []).map(room => room.id), ['maple', 'birch', 'aspen']);
});

test('F2 requires every requested item', () => {
  assert.deepEqual(filterRooms(catalog, 0, ['Projector', 'Whiteboard']).map(room => room.id), ['maple', 'aspen']);
});

const server = createApp();
let base;
before(async () => {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  base = 'http://127.0.0.1:' + server.address().port;
});
after(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

async function page(query = '') {
  const response = await fetch(base + '/?' + query);
  assert.equal(response.status, 200);
  return response.text();
}

test('AC6 serves clear status markup and a responsive stylesheet', async () => {
  const html = await page('check=1&start=09:00&end=09:30');
  assert.match(html, /name="viewport"/);
  assert.match(html, /role="status" data-code="available"/);
  assert.match(html, /Cedar Room: The room is available/);
  const response = await fetch(base + '/style.css');
  assert.equal(response.status, 200);
  assert.match(await response.text(), /repeat\(auto-fit,/);
});

test('F2 integration renders only qualifying room cards and choices', async () => {
  const html = await page('attendees=20&equipment=Projector&equipment=Whiteboard');
  assert.match(html, /<h3>Maple Room<\/h3>/);
  assert.match(html, /<h3>Aspen Hall<\/h3>/);
  assert.doesNotMatch(html, /Cedar Room|Birch Studio/);
});

test('F3 blocked room remains unavailable through the actual form handler', async () => {
  const html = await page('room=birch&start=09:00&end=09:30&check=1');
  assert.match(html, /data-code="blocked">Birch Studio: This room is blocked/);
  assert.doesNotMatch(html, /data-code="available"/);
});

test('F4 renders an empty state with no stale room or result', async () => {
  const html = await page('attendees=41&room=cedar&start=09:00&end=09:30&check=1');
  assert.match(html, /No rooms match your requirements/);
  assert.doesNotMatch(html, /data-code=|<select name="room"|<article>/);
});

test('F5 switching room refreshes both the outcome and displayed bookings', async () => {
  const cedar = await page('room=cedar&start=10:00&end=10:30&check=1');
  const maple = await page('room=maple&start=10:00&end=10:30');
  assert.match(cedar, /data-code="overlap">Cedar Room:/);
  assert.match(cedar, /<li>10:00–11:00<\/li>/);
  assert.match(maple, /value="maple" selected/);
  assert.match(maple, /data-code="available">Maple Room:/);
  assert.match(maple, /<li>11:00–12:00<\/li>/);
  assert.doesNotMatch(maple, /<li>10:00–11:00<\/li>/);
});

test('F5 changing filters replaces a selection that no longer matches', async () => {
  const html = await page('attendees=20&room=cedar&start=10:00&end=10:30');
  assert.match(html, /value="maple" selected/);
  assert.match(html, /data-code="available">Maple Room:/);
  assert.doesNotMatch(html, /value="cedar"/);
});

test('invalid attendee input produces feedback without echoing unsanitized data', async () => {
  const html = await page('attendees=%22%3E%3Cscript%3Ebad');
  assert.match(html, /Enter a positive whole number/);
  assert.doesNotMatch(html, /<script>bad/);
});
