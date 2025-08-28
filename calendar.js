document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const groupId = params.get('groupId');
  const info = document.getElementById('group-info');
  if (groupId) {
    info.textContent = `Group ID: ${groupId}`;
  } else {
    info.textContent = 'No group selected.';
  }
});
