document.addEventListener('DOMContentLoaded', () => {
  const usernameInput = document.getElementById('username-input');
  const usernameSkeleton = document.getElementById('username-skeleton');
  const calendarsList = document.getElementById('calendars-list');
  const eventsList = document.getElementById('events-list');
  const saveButton = document.getElementById('save-button');

  let selectedCalendars = new Set();

  function fetchUser() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ username: 'HarangleUser', calendars: ['cal-1', 'cal-2'] });
      }, 800);
    });
  }

  function fetchCalendars() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 'cal-1', name: 'Work' },
          { id: 'cal-2', name: 'Personal' },
          { id: 'cal-3', name: 'Holidays' }
        ]);
      }, 1000);
    });
  }

  const eventData = {
    'cal-1': [
      { id: 'e1', name: 'Team Meeting' },
      { id: 'e2', name: 'Project Review' }
    ],
    'cal-2': [
      { id: 'e3', name: 'Dentist Appointment' },
      { id: 'e4', name: 'Gym Session' }
    ],
    'cal-3': [
      { id: 'e5', name: 'Independence Day' }
    ]
  };

  function fetchEvents(ids) {
    return new Promise(resolve => {
      setTimeout(() => {
        let events = [];
        ids.forEach(id => {
          events = events.concat(eventData[id] || []);
        });
        resolve(events);
      }, 700);
    });
  }

  function renderCalendars(calendars, userCalendarIds) {
    calendarsList.innerHTML = '';
    calendars.forEach(cal => {
      const label = document.createElement('label');
      label.className = 'calendar-item';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = cal.id; // unique group per calendar
      input.addEventListener('click', function () {
        if (this.checked && this.dataset.waschecked === 'true') {
          this.checked = false;
          this.dataset.waschecked = 'false';
          selectedCalendars.delete(cal.id);
        } else {
          this.dataset.waschecked = 'true';
          selectedCalendars.add(cal.id);
        }
        updateEvents();
        saveButton.disabled = false;
      });
      const span = document.createElement('span');
      span.textContent = cal.name;
      label.appendChild(input);
      label.appendChild(span);
      calendarsList.appendChild(label);
      if (userCalendarIds.includes(cal.id)) {
        input.checked = true;
        input.dataset.waschecked = 'true';
        selectedCalendars.add(cal.id);
      }
    });
  }

  function updateEvents() {
    eventsList.innerHTML = '<div class="skeleton line"></div><div class="skeleton line"></div>';
    fetchEvents(Array.from(selectedCalendars)).then(events => {
      eventsList.innerHTML = '';
      events.forEach(ev => {
        const div = document.createElement('div');
        div.textContent = ev.name;
        eventsList.appendChild(div);
      });
    });
  }

  usernameInput.addEventListener('input', () => {
    saveButton.disabled = false;
  });

  saveButton.addEventListener('click', () => {
    const payload = {
      username: usernameInput.value,
      calendars: Array.from(selectedCalendars)
    };
    console.log('Saved settings', payload);
    saveButton.disabled = true;
  });

  Promise.all([fetchUser(), fetchCalendars()]).then(([user, calendars]) => {
    usernameInput.value = user.username;
    usernameSkeleton.classList.add('hidden');
    usernameInput.classList.remove('hidden');

    renderCalendars(calendars, user.calendars);
    updateEvents();
  });
});
