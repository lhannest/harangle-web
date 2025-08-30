# Harangle Web

This repository contains prototypes for Harangle's login, group list, settings, and calendar pages. A lightweight mock backend (`mock_server.py`) now supplies data to each page.

## Running

1. Start the mock server: `python mock_server.py` (listens on `http://localhost:8000`).
2. Visit the pages through the server in your browser, for example:
   - `http://localhost:8000/index.html` shows the login with a fallback mock sign-in button.
   - `http://localhost:8000/groups.html` lists groups fetched from the backend and links to `calendar.html` with the selected group.
   - `http://localhost:8000/settings.html` lets you edit your username, choose calendars, and review events from the server.
   - `http://localhost:8000/calendar.html` displays the current month via FullCalendar and loads busy-hour data for the chosen group.
