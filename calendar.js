let calendar;
let selectedCell;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const groupId = params.get('groupId');
  const info = document.getElementById('group-info');
  info.textContent = groupId ? `Group ID: ${groupId}` : 'No group selected.';

  const user = { id: 'u1', name: 'Mock User' };
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  document.getElementById('month-year').textContent = today.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const busy = await fetchBusyData(groupId, year, month);
  const calendarEl = document.getElementById('calendar');

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    customButtons: {
      today: {
        text: 'Today',
        click() {
          calendar.today();
          const dateStr = new Date().toISOString().slice(0, 10);
          const hours = busy[dateStr] || 0;
          showDetails(dateStr, hours, user);
        },
      },
    },
    dateClick(infoClick) {
      const dateStr = infoClick.dateStr;
      const hours = busy[dateStr] || 0;
      showDetails(dateStr, hours, user);
    },
    dayCellDidMount(arg) {
      const dateStr = arg.date.toISOString().slice(0, 10);
      const hours = busy[dateStr] || 0;
      const cls = colorClass(hours);
      if (cls) {
        const dot = document.createElement('span');
        dot.className = `busy-dot ${cls}`;
        arg.el.appendChild(dot);
      }
    },
  });
  calendar.render();
  const todayStr = today.toISOString().slice(0, 10);
  showDetails(todayStr, busy[todayStr] || 0, user);
});

function fetchBusyData(groupId, year, month) {
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  return fetch(`http://localhost:8000/api/groups/${encodeURIComponent(groupId)}/busy?month=${monthStr}`)
    .then(res => res.json())
    .catch(() => ({}));
}

function colorClass(hours) {
  return hours <= 4 ? 'busy-good' : '';
}

function showDetails(dateStr, hours, user) {
  selectDay(dateStr);
  const detail = document.getElementById('day-detail');
  detail.innerHTML = `
    <button class="close-detail" aria-label="Close">&times;</button>
    <h3>${dateStr}</h3>
    <p>${user.name} (ID: ${user.id}) is busy for ${hours} hours.</p>
  `;
  detail.classList.add('active');
  detail.querySelector('.close-detail').addEventListener('click', () => {
    detail.classList.remove('active');
    detail.innerHTML = '';
    if (calendar) {
      calendar.updateSize();
    }
  });
  if (calendar) {
    calendar.updateSize();
  }
}

function selectDay(dateStr) {
  if (selectedCell) {
    selectedCell.classList.remove('selected');
  }
  const cell = document.querySelector(`[data-date="${dateStr}"]`);
  if (cell) {
    cell.classList.add('selected');
    selectedCell = cell;
  }
}

