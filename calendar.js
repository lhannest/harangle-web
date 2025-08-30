let calendar;

document.addEventListener('DOMContentLoaded', () => {
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

  const busy = generateBusyData(year, month);
  const calendarEl = document.getElementById('calendar');

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    dateClick(infoClick) {
      const dateStr = infoClick.dateStr;
      const hours = busy[dateStr] || 0;
      showDetails(dateStr, hours, user);
    },
    dayCellDidMount(arg) {
      const dateStr = arg.date.toISOString().slice(0, 10);
      const hours = busy[dateStr];
      if (hours !== undefined) {
        arg.el.classList.add(colorClass(hours));
      }
    },
  });
  calendar.render();
});

function generateBusyData(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const data = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    data[dateStr] = Math.floor(Math.random() * 13);
  }
  return data;
}

function colorClass(hours) {
  if (hours >= 9) return 'bright';
  if (hours >= 5) return 'medium';
  if (hours >= 1) return 'dull';
  return 'tan';
}

function showDetails(dateStr, hours, user) {
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

