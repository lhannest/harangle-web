document.addEventListener('DOMContentLoaded', () => {
  const groupsList = document.getElementById('groups-list');
  const createButton = document.getElementById('create-group-button');

  let groups = [];

  function fetchGroups() {
    return fetch('http://localhost:8000/api/groups')
      .then(res => res.json())
      .catch(() => []);
  }

  function renderGroups() {
    groupsList.innerHTML = '';
    groups.forEach(group => {
      const div = document.createElement('div');
      div.className = 'group-item';
      div.textContent = group.name;
      div.addEventListener('click', () => {
        window.location.href = `calendar.html?groupId=${encodeURIComponent(group.id)}`;
      });
      groupsList.appendChild(div);
    });
  }

  createButton.addEventListener('click', () => {
    const name = prompt('Enter group name:');
    if (name) {
      const id = 'group-' + Date.now();
      fetch('http://localhost:8000/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name })
      }).then(() => {
        fetchGroups().then(data => {
          groups = data;
          renderGroups();
        });
      });
    }
  });

  fetchGroups().then(data => {
    groups = data;
    renderGroups();
  });
});
