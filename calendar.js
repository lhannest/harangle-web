document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const groupId = params.get('groupId');
  const info = document.getElementById('group-info');
  if (groupId) {
    info.textContent = `Group ID: ${groupId}`;
  } else {
    info.textContent = 'No group selected.';
  }

  const user = { id: 'u1', name: 'Mock User' };
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  document.getElementById('month-year').textContent = today.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const busy = generateBusyData(year, month);
  const grid = document.getElementById('calendar-grid');

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach((name) => {
    const dn = document.createElement('div');
    dn.textContent = name;
    dn.className = 'day-name';
    grid.appendChild(dn);
  });

  const firstDay = new Date(year, month, 1).getDay();
  for (let i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement('div'));
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hours = busy[dateStr];
    const cell = document.createElement('div');
    cell.textContent = day;
    cell.className = `day ${colorClass(hours)}`;
    cell.addEventListener('click', () => showDetails(dateStr, hours, user));
    grid.appendChild(cell);
  }
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
  detail.innerHTML = `<h3>${dateStr}</h3><p>${user.name} (ID: ${user.id}) is busy for ${hours} hours.</p>`;
  detail.classList.add('active');
}

