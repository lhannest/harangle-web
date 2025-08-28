document.addEventListener('DOMContentLoaded', () => {
  const groupsList = document.getElementById('groups-list');
  const createButton = document.getElementById('create-group-button');

  let groups = [];

  function fetchGroups() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 'group-1', name: 'Family' },
          { id: 'group-2', name: 'Friends' }
        ]);
      }, 800);
    });
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
      groups.push({ id, name });
      renderGroups();
    }
  });

  fetchGroups().then(data => {
    groups = data;
    renderGroups();
  });
});
