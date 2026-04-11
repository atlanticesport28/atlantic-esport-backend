const privateToggle = document.querySelector('#isPrivate');
const privateSection = document.querySelector('#privateConfig');
const inviteCodeEl = document.querySelector('#inviteCode');
const inviteLinkEl = document.querySelector('#inviteLink');
const generateBtn = document.querySelector('#generateInvite');

function updatePrivateUI() {
  if (!privateToggle || !privateSection) return;
  privateSection.style.display = privateToggle.checked ? 'block' : 'none';
}

function randomCode(length = 8) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let output = '';
  for (let i = 0; i < length; i++) {
    output += chars[Math.floor(Math.random() * chars.length)];
  }
  return output;
}

privateToggle?.addEventListener('change', updatePrivateUI);
generateBtn?.addEventListener('click', () => {
  const code = randomCode();
  if (inviteCodeEl) inviteCodeEl.value = code;
  if (inviteLinkEl) inviteLinkEl.value = `https://atlantic-esport.gg/invite/${code}`;
});

updatePrivateUI();
