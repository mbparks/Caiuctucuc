// Local storage control. This gives players a visible way to fully reset the
// app's browser storage without needing developer tools.

const CLEAR_FLAG = Symbol.for('caiuctucuc.storageControl');
const APP_KEY_PREFIXES = ['caiuctucuc'];

function appStorageKeys(storage) {
  const keys = [];
  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && APP_KEY_PREFIXES.some(prefix => key.startsWith(prefix))) keys.push(key);
    }
  } catch {
    // Private browsing can make storage unreadable. Return an empty list and
    // let the caller fail gently when attempting to clear.
  }
  return keys;
}

function clearStorageBucket(storage) {
  for (const key of appStorageKeys(storage)) {
    try { storage.removeItem(key); }
    catch { /* private mode or locked storage */ }
  }
}

export function clearCaiuctucucLocalStorage() {
  clearStorageBucket(localStorage);
  // Session toasts are not localStorage, but they are app browser state and can
  // make a freshly reset run look remembered. Clear only our namespaced keys.
  clearStorageBucket(sessionStorage);
}

function toast(text) {
  const toastEl = document.getElementById('toast');
  if (!toastEl) return;
  toastEl.textContent = text;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2200);
}

function makeRow() {
  const row = document.createElement('div');
  row.className = 'row';
  row.id = 'clearStorageRow';

  const label = document.createElement('span');
  label.textContent = 'Storage';

  const button = document.createElement('button');
  button.id = 'clearStorageBtn';
  button.type = 'button';
  button.textContent = 'Clear local storage';
  button.title = 'Clear this game\'s saved browser data, settings, scale preference, and intro state.';

  row.appendChild(label);
  row.appendChild(button);
  return row;
}

function install() {
  if (document.documentElement[CLEAR_FLAG]) return;
  document.documentElement[CLEAR_FLAG] = true;
  const menu = document.getElementById('menu');
  if (!menu || document.getElementById('clearStorageBtn')) return;

  const row = makeRow();
  const feedback = [...menu.querySelectorAll('.row')]
    .find(r => r.textContent.toLowerCase().includes('feedback'));
  menu.insertBefore(row, feedback || null);

  const button = row.querySelector('#clearStorageBtn');
  let armed = false;
  button.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      button.textContent = 'Clear everything?';
      button.style.color = '#d84838';
      toast('Press Clear everything? again to erase this game\'s local browser storage.');
      setTimeout(() => {
        if (!armed) return;
        armed = false;
        button.textContent = 'Clear local storage';
        button.style.color = '';
      }, 5000);
      return;
    }
    armed = false;
    button.textContent = 'Clearing...';
    button.disabled = true;
    clearCaiuctucucLocalStorage();
    toast('Local storage cleared. Reloading clean.');
    setTimeout(() => location.reload(), 450);
  });
}

if (typeof window !== 'undefined') {
  window.CAIUCTUCUC_CLEAR_LOCAL_STORAGE = clearCaiuctucucLocalStorage;
}

install();
