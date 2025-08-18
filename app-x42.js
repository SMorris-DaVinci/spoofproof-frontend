// === Helper functions for formatting ===
function normalizeUS(number) {
  // Remove all non-digits
  const digits = number.replace(/\D/g, '');
  if (digits.length === 10) {
    return '+1' + digits; // store internally with +1
  }
  return null; // invalid
}

function displayUS(storedNumber) {
  // stored as +1XXXXXXXXXX → display as (XXX) XXX-XXXX
  const digits = storedNumber.replace('+1', '');
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
}

// === Whitelist logic ===
const whitelistKey = 'whitelistUS';

function getWhitelist() {
  return JSON.parse(localStorage.getItem(whitelistKey)) || [];
}

function saveWhitelist(list) {
  localStorage.setItem(whitelistKey, JSON.stringify(list));
}

function renderWhitelist() {
  const display = document.getElementById('whitelistDisplay');
  display.innerHTML = '';
  getWhitelist().forEach(num => {
    const li = document.createElement('li');
    li.textContent = displayUS(num);
    display.appendChild(li);
  });
}

// === Add to whitelist ===
document.getElementById('addWhitelistBtn').addEventListener('click', () => {
  const input = document.getElementById('whitelistInput');
  const normalized = normalizeUS(input.value);
  if (!normalized) {
    alert('Please enter a valid 10-digit US number');
    return;
  }
  const list = getWhitelist();
  if (!list.includes(normalized)) {
    list.push(normalized);
    saveWhitelist(list);
    renderWhitelist();
  }
  input.value = '';
});

// === Simulate Call ===
document.getElementById('simulateCallBtn').addEventListener('click', () => {
  const input = document.getElementById('callInput');
  const normalized = normalizeUS(input.value);
  const result = document.getElementById('callResult');
  if (!normalized) {
    result.textContent = '❌ Invalid number';
    return;
  }
  if (getWhitelist().includes(normalized)) {
    result.textContent = '✅ Allowed (whitelisted)';
  } else {
    result.textContent = '🚫 Blocked (not whitelisted)';
  }
});
 
// Initial render
renderWhitelist();
