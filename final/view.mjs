import { CURRENT_TIME } from './availability.mjs';
import { equipmentOptions } from './catalog.mjs';

function timeField(label, name, value) {
  return `<label>${label} <input type="time" name="${name}" value="${value}"></label>`;
}

export function renderPage(state) {
  const { attendees, equipment, rooms, room, start, end, result, filterError } = state;
  const checkboxes = equipmentOptions.map(item =>
    `<label><input type="checkbox" name="equipment" value="${item}"${equipment.includes(item) ? ' checked' : ''}> ${item}</label>`
  ).join('');
  const options = rooms.map(candidate =>
    `<option value="${candidate.id}"${candidate === room ? ' selected' : ''}>${candidate.name}</option>`
  ).join('');
  const cards = rooms.map(candidate => `<article>
    <h3>${candidate.name}</h3>
    <p>Seats ${candidate.capacity} · ${candidate.equipment.join(', ')}</p>
    <p>${candidate.blocked ? 'Blocked' : 'Open for availability checks'}</p>
  </article>`).join('');
  const status = result ? `<p class="result" role="status" data-code="${result.code}">${room.name}: ${result.message}</p>` : '';
  const bookingList = room?.bookings.map(({ start, end }) => `<li>${start}–${end}</li>`).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Smart Campus</title><link rel="stylesheet" href="/style.css"></head>
<body><main><h1>Smart Campus Room Availability</h1>
<p>Fictional room catalog · Fixed demo time ${CURRENT_TIME}</p>
<form method="get" action="/">
  <h2>Room requirements</h2>
  <label>Attendees <input name="attendees" type="number" min="1" step="1" value="${attendees}"></label>
  <fieldset><legend>Required equipment</legend>${checkboxes}</fieldset>
  <button type="submit">Apply filters</button>
  ${room ? `<h2>Availability</h2>
    <label>Room <select name="room" onchange="this.form.requestSubmit()">${options}</select></label>
    ${timeField('Start', 'start', start)}
    ${timeField('End', 'end', end)}
    <button name="check" value="1">Check availability</button>` : `
    <input type="hidden" name="start" value="${start}">
    <input type="hidden" name="end" value="${end}">`}
</form>
${filterError ? `<p class="result" role="alert">${filterError}</p>` : ''}
${status}
<h2>Matching rooms</h2>
${rooms.length ? `<div class="grid">${cards}</div>` :
    '<p class="result" role="status">No rooms match your requirements.</p>'}
${room ? `<h2>Existing bookings for ${room.name}</h2>${bookingList ? `<ul>${bookingList}</ul>` : '<p>No bookings.</p>'}` : ''}
</main></body></html>`;
}
