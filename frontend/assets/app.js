const privateToggle = document.querySelector('#isPrivate');
const privateSection = document.querySelector('#privateConfig');
const inviteCodeEl = document.querySelector('#inviteCode');
const inviteLinkEl = document.querySelector('#inviteLink');
const generateBtn = document.querySelector('#generateInvite');
const copyBtn = document.querySelector('#copyInvite');
const uploadZone = document.querySelector('#uploadZone');
const uploadInput = document.querySelector('#proofFile');

function randomCode(length = 8) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function refreshPrivateUI() {
  if (!privateToggle || !privateSection) return;
  privateSection.style.display = privateToggle.checked ? 'block' : 'none';
}

privateToggle?.addEventListener('change', refreshPrivateUI);
generateBtn?.addEventListener('click', () => {
  const code = randomCode();
  if (inviteCodeEl) inviteCodeEl.value = code;
  if (inviteLinkEl) inviteLinkEl.value = `https://atlantic-esport.gg/invite/${code}`;
});

copyBtn?.addEventListener('click', async () => {
  const text = inviteLinkEl?.value || inviteCodeEl?.value;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1200);
  } catch {
    copyBtn.textContent = 'Copy failed';
  }
});

uploadZone?.addEventListener('dragover', (event) => {
  event.preventDefault();
  uploadZone.classList.add('dragover');
});
uploadZone?.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
uploadZone?.addEventListener('drop', (event) => {
  event.preventDefault();
  uploadZone.classList.remove('dragover');
  const files = event.dataTransfer?.files;
  if (!files || !uploadInput) return;
  uploadInput.files = files;
  const target = uploadZone.querySelector('p');
  if (target && files[0]) target.textContent = `Selected: ${files[0].name}`;
});

refreshPrivateUI();
