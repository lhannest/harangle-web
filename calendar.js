let calendar;
let selectedCell;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const groupId = params.get('groupId');
  const groupName = params.get('groupName') || 'Calendar';
  document.getElementById('group-name').textContent = groupName;
  document.title = `Harangle - ${groupName}`;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

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
          const dayBusy = busy[dateStr] || {};
          showDetails(dateStr, dayBusy);
        },
      },
    },
    dateClick(infoClick) {
      const dateStr = infoClick.dateStr;
      const dayBusy = busy[dateStr] || {};
      showDetails(dateStr, dayBusy);
    },
    dayCellDidMount(arg) {
      const dateStr = arg.date.toISOString().slice(0, 10);
      const dayBusy = busy[dateStr];
      const total = dayBusy ? Object.values(dayBusy).reduce((a, b) => a + b, 0) : 0;
      const cls = colorClass(total);
      if (cls) {
        arg.el.classList.add(cls);
      }
    },
  });
  calendar.render();
  const todayStr = today.toISOString().slice(0, 10);
  showDetails(todayStr, busy[todayStr] || {});
});

function fetchBusyData(groupId, year, month) {
  const base = 'http://localhost:8000/days/busy';
  const url = groupId ? `${base}?groupId=${encodeURIComponent(groupId)}` : base;
  return fetch(url)
    .then(res => res.json())
    .then((rows) => {
      const byDay = {};
      rows.forEach(({ name, busy }) => {
        Object.entries(busy).forEach(([date, hrs]) => {
          const d = new Date(date);
          if (d.getFullYear() === year && d.getMonth() === month) {
            if (!byDay[date]) byDay[date] = {};
            byDay[date][name] = hrs;
          }
        });
      });
      return byDay;
    })
    .catch(() => ({}));
}

function colorClass(hours) {
  return hours <= 4 ? 'good-day' : '';
}

function showDetails(dateStr, dayBusy) {
  selectDay(dateStr);
  const detail = document.getElementById('day-detail');
  const formatted = formatDisplayDate(dateStr);
  const items = Object.entries(dayBusy).map(([name, hrs]) => `<li>${name} is busy for ${hrs} hours.</li>`).join('');
  detail.innerHTML = `
    <button class="close-detail" aria-label="Close">&times;</button>
    <h3>${formatted}</h3>
    <ul>${items}</ul>
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

function formatDisplayDate(dateStr) {
  const date = new Date(dateStr);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const day = date.getDate();
  return `${weekday}, ${month} ${day}${ordinal(day)}`;
}

function ordinal(n) {
  if (n >= 11 && n <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
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

