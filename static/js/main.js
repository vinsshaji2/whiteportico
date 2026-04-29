// ===== ROOM MANAGEMENT =====
let roomCount = 0;

function addRoom(prefill) {
  roomCount++;
  const id = `room-${roomCount}`;
  const container = document.getElementById('rooms-container');
  if (!container) return;

  const opts = (typeof ROOM_TYPES !== 'undefined' ? ROOM_TYPES : []).map((r, i) =>
    `<option value="${i}">${r.label}</option>`
  ).join('');
  const plans = typeof PLAN_OPTIONS !== 'undefined' ? PLAN_OPTIONS : ['EP', 'CP', 'MAP'];

  const div = document.createElement('div');
  div.className = 'room-card';
  div.id = id;

  const p = prefill || {};
  const savedTypeIdx = p.type_name && Array.isArray(ROOM_TYPES)
    ? ROOM_TYPES.findIndex(r => r.label === p.type_name)
    : -1;
  const typeIdx = savedTypeIdx >= 0 ? savedTypeIdx : (p.type_index !== undefined ? p.type_index : 0);
  const roomQty = parseInt(p.room_count || p.rooms || 1) || 1;
  const selectedPlan = p.plan || plans[0] || 'EP';
  const planOpts = plans.map(plan =>
    `<option value="${plan}" ${plan === selectedPlan ? 'selected' : ''}>${plan}</option>`
  ).join('');

  div.innerHTML = `
    <div class="room-card-title">Room ${roomCount}</div>
    <button class="remove-room" type="button" onclick="removeRoom('${id}')" title="Remove room">✕</button>
    <div class="room-grid-5">
      <div class="form-group">
        <label>Room Type</label>
        <select onchange="onRoomTypeChange('${id}', this.value)" id="${id}-type">
          ${opts.replace(`value="${typeIdx}"`, `value="${typeIdx}" selected`)}
        </select>
      </div>
      <div class="form-group">
        <label>Rooms</label>
        <input type="number" id="${id}-room-count" min="1" value="${roomQty}" oninput="recalcTotals()" />
      </div>
      <div class="form-group">
        <label>Plan</label>
        <select id="${id}-plan" onchange="recalcTotals()">
          ${planOpts}
        </select>
      </div>
      <div class="form-group">
        <label>Adults</label>
        <input type="number" id="${id}-adults" min="1" value="${p.adults || 2}" oninput="recalcTotals()" />
      </div>
      <div class="form-group">
        <label>Children</label>
        <input type="number" id="${id}-children" min="0" value="${p.children || 0}" oninput="recalcTotals()" />
      </div>
    </div>
    <div class="room-grid-4b">
      <div class="form-group">
        <label>Rate (₹/night)</label>
        <input type="number" id="${id}-rate" value="${p.rate !== undefined ? p.rate : 0}" min="0" oninput="recalcTotals()" />
      </div>
      <div class="form-group">
        <label>Discount (₹)</label>
        <input type="number" id="${id}-discount" value="${p.discount || 0}" min="0" oninput="recalcTotals()" />
      </div>
      <div class="form-group">
        <label>Extra Charge (₹)</label>
        <input type="number" id="${id}-extra" value="${p.extra || 0}" min="0" oninput="recalcTotals()" />
      </div>
      <div class="form-group">
        <label>Tax (₹)</label>
        <input type="number" id="${id}-tax" value="${p.tax || 0}" min="0" oninput="recalcTotals()" />
      </div>
    </div>
    <div class="room-total-display" id="${id}-subtotal">Room Total: Rs 0.00</div>
  `;

  container.appendChild(div);
  recalcTotals();
}

function onRoomTypeChange(id, typeIndex) {
  const rt = ROOM_TYPES[typeIndex];
  if (!rt) return;
  recalcTotals();
}

function removeRoom(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
  recalcTotals();
}

function getRoomsLegacyUnused() {
  return Array.from(document.querySelectorAll('.room-card')).map(card => {
    const id = card.id;
    const typeIndex = parseInt(document.getElementById(`${id}-type`).value);
    const nights = parseInt(document.getElementById('nights').value) || 1;
    const roomCountValue = parseInt(document.getElementById(`${id}-room-count`).value) || 1;
    const rate = parseFloat(document.getElementById(`${id}-rate`).value) || 0;
    const discount = parseFloat(document.getElementById(`${id}-discount`).value) || 0;
    const extra = parseFloat(document.getElementById(`${id}-extra`).value) || 0;
    const tax = parseFloat(document.getElementById(`${id}-tax`).value) || 0;
    const nightTotal = (rate - discount + extra + tax) * nights * roomCountValue;
    const sub = document.getElementById(`${id}-subtotal`);
    if (sub) sub.textContent = `Room Total (${nights} night${nights > 1 ? 's' : ''}): Rs ${nightTotal.toFixed(2)}`;
    return {
      id, type_index: typeIndex,
      type_name: ROOM_TYPES[typeIndex]?.label || 'Custom',
      plan: document.getElementById(`${id}-plan`).value,
      adults: parseInt(document.getElementById(`${id}-adults`).value) || 2,
      children: parseInt(document.getElementById(`${id}-children`).value) || 0,
      rate, discount, extra, tax, night_total: nightTotal, nights,
    };
  });
}

function getRooms() {
  return Array.from(document.querySelectorAll('.room-card')).map(card => {
    const id = card.id;
    const typeIndex = parseInt(document.getElementById(`${id}-type`).value);
    const nights = parseInt(document.getElementById('nights').value) || 1;
    const roomCountValue = parseInt(document.getElementById(`${id}-room-count`).value) || 1;
    const rate = parseFloat(document.getElementById(`${id}-rate`).value) || 0;
    const discount = parseFloat(document.getElementById(`${id}-discount`).value) || 0;
    const extra = parseFloat(document.getElementById(`${id}-extra`).value) || 0;
    const tax = parseFloat(document.getElementById(`${id}-tax`).value) || 0;
    const nightTotal = (rate - discount + extra + tax) * nights * roomCountValue;
    const sub = document.getElementById(`${id}-subtotal`);
    if (sub) {
      sub.textContent = `Room Total (${roomCountValue} room${roomCountValue > 1 ? 's' : ''}, ${nights} night${nights > 1 ? 's' : ''}): Rs ${nightTotal.toFixed(2)}`;
    }
    return {
      id,
      type_index: typeIndex,
      type_name: ROOM_TYPES[typeIndex]?.label || 'Custom',
      room_count: roomCountValue,
      plan: document.getElementById(`${id}-plan`).value,
      adults: parseInt(document.getElementById(`${id}-adults`).value) || 2,
      children: parseInt(document.getElementById(`${id}-children`).value) || 0,
      rate,
      discount,
      extra,
      tax,
      night_total: nightTotal,
      nights,
    };
  });
}

// ===== NIGHTS AUTO-CALC =====
function nextDateValue(dateValue) {
  const date = new Date(dateValue + 'T00:00:00');
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function syncCheckoutAvailability() {
  const arrival = document.getElementById('arrivalDate');
  const departure = document.getElementById('departureDate');
  if (!arrival || !departure) return;

  if (!arrival.value) {
    departure.value = '';
    departure.disabled = true;
    departure.removeAttribute('min');
    return;
  }

  departure.disabled = false;
  departure.min = nextDateValue(arrival.value);
  if (departure.value && new Date(departure.value) <= new Date(arrival.value)) {
    departure.value = '';
  }
}

function calcNights() {
  syncCheckoutAvailability();
  const a = document.getElementById('arrivalDate')?.value;
  const d = document.getElementById('departureDate')?.value;
  if (a && d) {
    const diff = Math.round((new Date(d) - new Date(a)) / 86400000);
    document.getElementById('nights').value = diff > 0 ? diff : 1;
  }
  recalcTotals();
}
document.getElementById('arrivalDate')?.addEventListener('change', calcNights);
document.getElementById('departureDate')?.addEventListener('change', calcNights);

// ===== TOTALS =====
function recalcTotals() {
  const rooms = getRooms();
  const grandTotal = rooms.reduce((s, r) => s + r.night_total, 0);
  const advance = parseFloat(document.getElementById('advanceReceived')?.value) || 0;
  const balance = grandTotal - advance;
  setText('displayGrandTotal', `Rs ${grandTotal.toFixed(2)}`);
  setText('displayAdvance', `Rs ${advance.toFixed(2)}`);
  setText('displayBalance', `Rs ${balance.toFixed(2)}`);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ===== FORMAT HELPERS =====
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const d = new Date(dateStr + 'T00:00:00');
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}, ${d.getFullYear()}`;
}
function fmtDateTime(dateStr, timeStr) {
  if (!dateStr) return '—';
  let base = fmtDate(dateStr);
  if (!timeStr) return base;
  let [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${base} ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`;
}
function fmt(n) { return parseFloat(n || 0).toFixed(2); }

// ===== LIVE VOUCHER UPDATE =====
function generateVoucherLegacyUnused() {
  const rooms = getRooms();
  const grandTotal = rooms.reduce((s, r) => s + r.night_total, 0);
  const advance = parseFloat(document.getElementById('advanceReceived')?.value) || 0;
  const balance = grandTotal - advance;
  const nights = parseInt(document.getElementById('nights')?.value) || 1;

  setText('v-res-no', v('reservationNo') || '—');
  setText('v-date', fmtDate(v('bookedDate')));
  setText('v-gname', v('guestName') || '—');
  setText('v-phone', v('phoneNumber') || '—');
  setText('v-email', v('email') || '—');
  setText('v-org', v('organisation') || '—');
  setText('v-gst', v('gstNumber') || '—');
  setText('v-total-rooms', rooms.length);

  const statusEl = document.getElementById('v-status');
  if (statusEl) {
    const s = v('bookingStatus');
    statusEl.textContent = s;
    statusEl.className = `vv status-${(s || '').toLowerCase()}`;
  }
  setText('v-booked-on', fmtDateTime(v('bookedDate'), v('bookedTime')));
  setText('v-arrival',   fmtDateTime(v('arrivalDate'), v('arrivalTime')));
  setText('v-departure', fmtDateTime(v('departureDate'), v('departureTime')));
  setText('v-nights', nights);
  setText('v-btype', v('bookingType') || '—');
  setText('v-agent', v('travelAgent') || '—');

  const rList = document.getElementById('v-rooms-list');
  if (rList) {
    if (!rooms.length) {
      rList.innerHTML = '<div style="color:#aaa;font-style:italic;font-size:12px;">No rooms added yet.</div>';
    } else {
      rList.innerHTML = rooms.map((r, i) => `
        <div class="v-room-block">
          <div class="v-room-name">${i + 1}. Room Type: ${r.type_name} x 1 Room</div>
          <div class="v-room-grid">
            <div>
              <div class="v-row"><span class="vk">Plan:</span><span class="vv">${r.plan || '—'}</span></div>
              <div class="v-row"><span class="vk">Adult:</span><span class="vv">${r.adults}</span></div>
              <div class="v-row"><span class="vk">Child:</span><span class="vv">${r.children}</span></div>
            </div>
            <div>
              <div class="v-row"><span class="vk">Room Rate:</span><span class="vv">${fmt(r.rate)}</span></div>
              <div class="v-row"><span class="vk">Discount:</span><span class="vv">${fmt(r.discount)}</span></div>
              <div class="v-row"><span class="vk">Extra Charge:</span><span class="vv">${fmt(r.extra)}</span></div>
              <div class="v-row"><span class="vk">Tax:</span><span class="vv">${fmt(r.tax)}</span></div>
              <div class="v-row"><span class="vk">Total:</span><span class="vv">${fmt(r.rate - r.discount + r.extra + r.tax)}</span></div>
            </div>
          </div>
          <div class="v-room-subtotal">Total For 1 Room For ${r.nights} Night${r.nights > 1 ? 's' : ''}: ${fmt(r.night_total)}</div>
          ${i < rooms.length - 1 ? '<hr class="v-room-divider">' : ''}
        </div>
      `).join('');
    }
  }

  setText('v-grand', `Rs ${fmt(grandTotal)}`);
  setText('v-adv',   `Rs ${fmt(advance)}`);
  setText('v-bal',   `Rs ${fmt(balance)}`);
}

function isWithGst() {
  return !!document.getElementById('withGst')?.checked;
}

function toggleGstFields(clearWhenHidden = false) {
  const enabled = isWithGst();
  const gstGroup = document.getElementById('gstNumberGroup');
  const gstInput = document.getElementById('gstNumber');
  if (gstGroup) gstGroup.style.display = enabled ? '' : 'none';
  if (!enabled && clearWhenHidden && gstInput) gstInput.value = '';
}

function generateVoucher() {
  toggleGstFields();
  const rooms = getRooms();
  const grandTotal = rooms.reduce((s, r) => s + r.night_total, 0);
  const advance = parseFloat(document.getElementById('advanceReceived')?.value) || 0;
  const balance = grandTotal - advance;
  const nights = parseInt(document.getElementById('nights')?.value) || 1;
  const totalRooms = rooms.reduce((s, r) => s + (parseInt(r.room_count) || 1), 0);
  const withGst = isWithGst();

  setText('v-res-no', v('reservationNo') || '—');
  setText('v-date', fmtDate(v('bookedDate')));
  setText('v-gname', v('guestName') || '—');
  setText('v-phone', v('phoneNumber') || '—');
  setText('v-email', v('email') || '—');
  setText('v-org', v('organisation') || '—');
  setText('v-total-rooms', totalRooms);

  const headerGstLine = document.getElementById('v-hotel-gst-line');
  if (headerGstLine) headerGstLine.style.display = withGst ? '' : 'none';
  setText('v-hotel-gst', withGst ? (typeof HOTEL_GSTIN !== 'undefined' ? HOTEL_GSTIN : '') : '');

  const gstRow = document.getElementById('v-gst-row');
  if (gstRow) gstRow.style.display = withGst ? '' : 'none';
  setText('v-gst', withGst ? (v('gstNumber') || '—') : '');

  const pageHeaderGstLine = document.getElementById('header-gst-line');
  if (pageHeaderGstLine) pageHeaderGstLine.style.display = withGst ? '' : 'none';

  const statusEl = document.getElementById('v-status');
  if (statusEl) {
    const s = v('bookingStatus');
    statusEl.textContent = s;
    statusEl.className = `vv status-${(s || '').toLowerCase()}`;
  }
  setText('v-booked-on', fmtDateTime(v('bookedDate'), v('bookedTime')));
  setText('v-arrival', fmtDateTime(v('arrivalDate'), v('arrivalTime')));
  setText('v-departure', fmtDateTime(v('departureDate'), v('departureTime')));
  setText('v-nights', nights);
  setText('v-btype', v('bookingType') || '—');
  setText('v-agent', v('travelAgent') || '—');

  const rList = document.getElementById('v-rooms-list');
  if (rList) {
    if (!rooms.length) {
      rList.innerHTML = '<div style="color:#aaa;font-style:italic;font-size:12px;">No rooms added yet.</div>';
    } else {
      rList.innerHTML = rooms.map((r, i) => {
        const qty = parseInt(r.room_count) || 1;
        return `
        <div class="v-room-block">
          <div class="v-room-name">${i + 1}. Room Type: ${r.type_name} x ${qty} Room${qty > 1 ? 's' : ''}</div>
          <div class="v-room-grid">
            <div>
              <div class="v-row"><span class="vk">Plan:</span><span class="vv">${r.plan || '—'}</span></div>
              <div class="v-row"><span class="vk">Adult:</span><span class="vv">${r.adults}</span></div>
              <div class="v-row"><span class="vk">Child:</span><span class="vv">${r.children}</span></div>
            </div>
            <div>
              <div class="v-row"><span class="vk">Room Rate:</span><span class="vv">${fmt(r.rate)}</span></div>
              <div class="v-row"><span class="vk">Discount:</span><span class="vv">${fmt(r.discount)}</span></div>
              <div class="v-row"><span class="vk">Extra Charge:</span><span class="vv">${fmt(r.extra)}</span></div>
              <div class="v-row"><span class="vk">Tax:</span><span class="vv">${fmt(r.tax)}</span></div>
              <div class="v-row"><span class="vk">Total/night:</span><span class="vv">${fmt((r.rate - r.discount + r.extra + r.tax) * qty)}</span></div>
            </div>
          </div>
          <div class="v-room-subtotal">Total For ${qty} Room${qty > 1 ? 's' : ''} For ${r.nights} Night${r.nights > 1 ? 's' : ''}: ${fmt(r.night_total)}</div>
          ${i < rooms.length - 1 ? '<hr class="v-room-divider">' : ''}
        </div>`;
      }).join('');
    }
  }

  setText('v-grand', `Rs ${fmt(grandTotal)}`);
  setText('v-adv', `Rs ${fmt(advance)}`);
  setText('v-bal', `Rs ${fmt(balance)}`);
}

function v(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function showSaveMessage(type, text) {
  const msg = document.getElementById('save-msg');
  if (!msg) return;
  msg.className = `save-msg ${type}`;
  msg.textContent = text;
  msg.style.display = 'block';
  if (type === 'success') {
    setTimeout(() => msg.style.display = 'none', 4000);
  }
}

function validateStayDates() {
  const arrival = document.getElementById('arrivalDate');
  const departure = document.getElementById('departureDate');

  if (!arrival?.value) {
    showSaveMessage('error', 'Please select Check IN date before saving.');
    arrival?.focus();
    return false;
  }

  if (departure?.value && new Date(departure.value) <= new Date(arrival.value)) {
    showSaveMessage('error', 'Check Out date must be after Check IN date.');
    departure.focus();
    return false;
  }

  return true;
}

// ===== SAVE & GENERATE =====
function saveAndGenerate() {
  syncCheckoutAvailability();
  if (!validateStayDates()) return;

  generateVoucher();
  const rooms = getRooms();
  const grandTotal = rooms.reduce((s, r) => s + r.night_total, 0);
  const advance = parseFloat(document.getElementById('advanceReceived')?.value) || 0;
  const balance = grandTotal - advance;

  const payload = {
    original_reservation_no: (typeof EDIT_BOOKING !== 'undefined' && EDIT_BOOKING) ? EDIT_BOOKING.reservation_no : v('reservationNo'),
    reservation_no: v('reservationNo'),
    guest_name: v('guestName'),
    phone: v('phoneNumber'),
    email: v('email'),
    organisation: v('organisation'),
    with_gst: isWithGst(),
    gst: isWithGst() ? v('gstNumber') : '',
    booking_status: v('bookingStatus'),
    booked_date: v('bookedDate'),
    booked_time: v('bookedTime'),
    arrival_date: v('arrivalDate'),
    arrival_time: v('arrivalTime'),
    departure_date: v('departureDate'),
    departure_time: v('departureTime'),
    nights: parseInt(v('nights')) || 1,
    booking_type: v('bookingType'),
    travel_agent: v('travelAgent'),
    rooms: rooms,
    advance: advance,
    grand_total: grandTotal,
    balance: balance,
  };

  fetch('/save_booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        showSaveMessage('success', `✔ Booking #${data.reservation_no} saved successfully!`);
      } else {
        showSaveMessage('error', data.message || '✖ Failed to save booking.');
      }
    })
    .catch(() => {
      showSaveMessage('error', '✖ Network error.');
    });
}

// ===== RESET =====
function resetForm() {
  if (!confirm('Reset all fields?')) return;
  ['guestName','phoneNumber','email','organisation','gstNumber',
   'travelAgent','arrivalDate','departureDate','bookedDate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('advanceReceived').value = 0;
  document.getElementById('nights').value = 1;
  const withGst = document.getElementById('withGst');
  if (withGst) withGst.checked = false;
  toggleGstFields(true);
  syncCheckoutAvailability();
  document.getElementById('rooms-container').innerHTML = '';
  roomCount = 0;
  recalcTotals();
  generateVoucher();
  addRoom();
}

// ===== LIVE PREVIEW on input =====
document.addEventListener('input', function (e) {
  if (e.target.closest('#rooms-container') || ['guestName','phoneNumber','email',
    'organisation','withGst','gstNumber','bookingStatus','bookedDate','bookedTime',
    'arrivalDate','arrivalTime','departureDate','departureTime','bookingType',
    'travelAgent','advanceReceived','nights'].includes(e.target.id)) {
    if (e.target.id === 'nights') recalcTotals();
    generateVoucher();
  }
});
document.addEventListener('change', function (e) {
  generateVoucher();
});

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('rooms-container');
  if (!container) return; // Not on index page
  syncCheckoutAvailability();

  if (typeof EDIT_BOOKING !== 'undefined' && EDIT_BOOKING && EDIT_BOOKING.rooms) {
    // Editing: prefill rooms
    EDIT_BOOKING.rooms.forEach(r => addRoom(r));
    document.getElementById('advanceReceived').value = EDIT_BOOKING.advance || 0;
  } else {
    addRoom(); // Default one room
  }

  recalcTotals();
  generateVoucher();
});
