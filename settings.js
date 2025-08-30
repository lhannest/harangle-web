document.addEventListener('DOMContentLoaded', () => {
  const usernameInput = document.getElementById('username-input');
  const usernameSkeleton = document.getElementById('username-skeleton');
  const calendarsList = document.getElementById('calendars-list');
  const eventsList = document.getElementById('events-list');
  const saveButton = document.getElementById('save-button');
  const cancelButton = document.getElementById('cancel-button');

  let selectedCalendars = new Set();

  function fetchUser() {
    return fetch('http://localhost:8000/api/user')
      .then(res => res.json())
      .catch(() => ({ username: '', calendars: [] }));
  }

  function fetchCalendars() {
    return fetch('http://localhost:8000/api/calendars')
      .then(res => res.json())
      .catch(() => []);
  }

  function fetchEvents(ids) {
    const query = ids.length ? `?ids=${ids.join(',')}` : '';
    return fetch(`http://localhost:8000/api/events${query}`)
      .then(res => res.json())
      .catch(() => []);
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
          label.classList.remove('selected');
        } else {
          this.dataset.waschecked = 'true';
          selectedCalendars.add(cal.id);
          label.classList.add('selected');
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
        label.classList.add('selected');
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
    fetch('http://localhost:8000/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(() => {
      console.log('Saved settings', payload);
      saveButton.disabled = true;
    });
  });

  cancelButton.addEventListener('click', () => {
    location.reload();
  });

  Promise.all([fetchUser(), fetchCalendars()]).then(([user, calendars]) => {
    usernameInput.value = user.username;
    usernameSkeleton.classList.add('hidden');
    usernameInput.classList.remove('hidden');

    renderCalendars(calendars, user.calendars);
    updateEvents();
  });
});
