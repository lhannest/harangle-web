import json
from http.server import SimpleHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
from calendar import monthrange
import random, datetime

USER = {"username": "HarangleUser", "calendars": ["cal-1", "cal-2"]}
CALENDARS = [
    {"id": "cal-1", "name": "Work"},
    {"id": "cal-2", "name": "Personal"},
    {"id": "cal-3", "name": "Holidays"}
]
EVENTS = {
    "cal-1": [
        {"id": "e1", "name": "Team Meeting"},
        {"id": "e2", "name": "Project Review"}
    ],
    "cal-2": [
        {"id": "e3", "name": "Dentist Appointment"},
        {"id": "e4", "name": "Gym Session"}
    ],
    "cal-3": [
    {"id": "e5", "name": "Independence Day"}
    ]
}
GROUPS = [
    {"id": "group-1", "name": "Family"},
    {"id": "group-2", "name": "Friends"}
]

USERS = ["Jack", "Catherine", "Rob", "Elisa", "Marcus", "Sophie"]

class Handler(SimpleHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/user':
            self._set_headers()
            self.wfile.write(json.dumps(USER).encode())
        elif parsed.path == '/api/calendars':
            self._set_headers()
            self.wfile.write(json.dumps(CALENDARS).encode())
        elif parsed.path == '/api/events':
            qs = parse_qs(parsed.query)
            ids = qs.get('ids', [''])[0].split(',') if 'ids' in qs else []
            events = []
            for cid in ids:
                events.extend(EVENTS.get(cid, []))
            self._set_headers()
            self.wfile.write(json.dumps(events).encode())
        elif parsed.path == '/api/groups':
            self._set_headers()
            self.wfile.write(json.dumps(GROUPS).encode())
        elif parsed.path.startswith('/api/groups/') and parsed.path.endswith('/busy'):
            parts = parsed.path.split('/')
            if len(parts) >= 5:
                group_id = parts[3]
            else:
                self.send_error(404)
                return
            qs = parse_qs(parsed.query)
            month_str = qs.get('month', [''])[0]
            if month_str:
                year, month = map(int, month_str.split('-'))
            else:
                today = datetime.date.today()
                year, month = today.year, today.month
            days = monthrange(year, month)[1]
            data = {}
            for d in range(1, days + 1):
                date_str = f"{year:04d}-{month:02d}-{d:02d}"
                data[date_str] = {name: random.randint(0, 12) for name in USERS}
            self._set_headers()
            self.wfile.write(json.dumps(data).encode())
        elif parsed.path == '/days/busy':
            today = datetime.date.today()
            days = monthrange(today.year, today.month)[1]
            result = []
            for name in USERS:
                busy = {}
                for d in range(1, days + 1):
                    date_str = f"{today.year:04d}-{today.month:02d}-{d:02d}"
                    busy[date_str] = random.randint(0, 12)
                result.append({"name": name, "busy": busy})
            self._set_headers()
            self.wfile.write(json.dumps(result).encode())
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode()
        if parsed.path == '/api/user':
            data = json.loads(body or '{}')
            USER['username'] = data.get('username', USER['username'])
            USER['calendars'] = data.get('calendars', USER['calendars'])
            self._set_headers()
            self.wfile.write(json.dumps({'status': 'ok'}).encode())
        elif parsed.path == '/api/groups':
            data = json.loads(body or '{}')
            GROUPS.append(data)
            self._set_headers()
            self.wfile.write(json.dumps(data).encode())
        else:
            self.send_error(404)


def run(port=8000):
    server = HTTPServer(('', port), Handler)
    print(f"Mock server running on port {port}")
    server.serve_forever()

if __name__ == '__main__':
    run()
