from flask import Flask, render_template, request, jsonify, redirect, url_for
import os, json
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'whiteportico-secret-2024'

UPLOAD_FOLDER = os.path.join('static', 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BUNDLED_BOOKINGS_FILE = os.path.join(BASE_DIR, 'bookings.json')


def get_bookings_file():
    configured_path = os.environ.get('BOOKINGS_FILE')
    if configured_path:
        return configured_path
    if os.environ.get('VERCEL'):
        return os.path.join('/tmp', 'bookings.json')
    return BUNDLED_BOOKINGS_FILE

# ── Replace with your actual GSTIN ──
HOTEL_GSTIN = '32BEZPJ7800KIZ2'

# ── White Portico room types ──
ROOM_TYPES = [
    {'label': 'Dulex Room'},
    {'label': 'Superior Room (with Balcony)'},
    {'label': 'Premium AC Room'},
    {'label': 'Portico Imperial AC'},
    {'label': 'Premium MIXED Dorm'}
]

PLAN_OPTIONS = ['EP', 'CP', 'MAP']


def load_bookings():
    bookings_file = get_bookings_file()
    if os.path.exists(bookings_file):
        with open(bookings_file, 'r') as f:
            return json.load(f)
    if bookings_file != BUNDLED_BOOKINGS_FILE and os.path.exists(BUNDLED_BOOKINGS_FILE):
        with open(BUNDLED_BOOKINGS_FILE, 'r') as f:
            return json.load(f)
    return []


def save_bookings(bookings):
    bookings_file = get_bookings_file()
    bookings_dir = os.path.dirname(bookings_file)
    if bookings_dir:
        os.makedirs(bookings_dir, exist_ok=True)
    with open(bookings_file, 'w') as f:
        json.dump(bookings, f, indent=2)


def next_reservation_no():
    bookings = load_bookings()
    nums = []
    for b in bookings:
        try:
            nums.append(int(b.get('reservation_no', '0')))
        except ValueError:
            pass
    return str(max(nums) + 1).zfill(6) if nums else '000001'


def get_logo_url():
    path = os.path.join(app.config['UPLOAD_FOLDER'], 'logo.png')
    if os.path.exists(path):
        return '/static/uploads/logo.png'
    return None


@app.route('/')
def index():
    return render_template('index.html',
        room_types=ROOM_TYPES,
        plan_options=PLAN_OPTIONS,
        hotel_gstin=HOTEL_GSTIN,
        logo_url=get_logo_url(),
        today=datetime.now().strftime('%Y-%m-%d'),
        now_time=datetime.now().strftime('%H:%M'),
        res_no=next_reservation_no(),
        edit_booking=None
    )


@app.route('/bookings')
def bookings_list():
    return render_template('bookings.html',
        bookings=load_bookings(),
        logo_url=get_logo_url()
    )


@app.route('/voucher/<reservation_no>')
def view_voucher(reservation_no):
    bookings = load_bookings()
    booking = next((b for b in bookings if b['reservation_no'] == reservation_no), None)
    if not booking:
        return 'Booking not found', 404
    return render_template('voucher.html',
        booking=booking,
        logo_url=get_logo_url(),
        hotel_gstin=HOTEL_GSTIN
    )


@app.route('/save_booking', methods=['POST'])
def save_booking():
    data = request.get_json() or {}
    arrival_date = data.get('arrival_date')
    departure_date = data.get('departure_date')

    if not arrival_date:
        return jsonify({
            'success': False,
            'message': 'Check IN date is required.'
        }), 400

    if departure_date:
        try:
            arrival_dt = datetime.strptime(arrival_date, '%Y-%m-%d')
            departure_dt = datetime.strptime(departure_date, '%Y-%m-%d')
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Invalid Check IN or Check Out date.'
            }), 400

        if departure_dt <= arrival_dt:
            return jsonify({
                'success': False,
                'message': 'Check Out date must be after Check IN date.'
            }), 400

    bookings = load_bookings()
    lookup_reservation_no = data.get('original_reservation_no') or data.get('reservation_no')
    existing_idx = next(
        (i for i, b in enumerate(bookings) if b['reservation_no'] == lookup_reservation_no),
        None
    )
    data.pop('original_reservation_no', None)
    data['saved_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    if existing_idx is not None:
        bookings[existing_idx] = data
    else:
        bookings.append(data)
    save_bookings(bookings)
    return jsonify({'success': True, 'reservation_no': data['reservation_no']})


@app.route('/delete_booking/<reservation_no>', methods=['POST'])
def delete_booking(reservation_no):
    bookings = load_bookings()
    bookings = [b for b in bookings if b['reservation_no'] != reservation_no]
    save_bookings(bookings)
    return redirect(url_for('bookings_list'))


@app.route('/edit_booking/<reservation_no>')
def edit_booking(reservation_no):
    bookings = load_bookings()
    booking = next((b for b in bookings if b['reservation_no'] == reservation_no), None)
    if not booking:
        return 'Booking not found', 404
    return render_template('index.html',
        room_types=ROOM_TYPES,
        plan_options=PLAN_OPTIONS,
        hotel_gstin=HOTEL_GSTIN,
        logo_url=get_logo_url(),
        today=datetime.now().strftime('%Y-%m-%d'),
        now_time=datetime.now().strftime('%H:%M'),
        res_no=reservation_no,
        edit_booking=booking
    )


if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True, port=5000)
