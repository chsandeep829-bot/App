const teamsPool = ['IND', 'AUS', 'ENG', 'NZ', 'PAK', 'SA', 'SL', 'WI', 'AFG', 'BAN'];

const state = {
  balance: 0,
  totalDeposits: 0,
  totalBets: 0,
  otp: null,
  matches: [],
  scorecard: null
};

const el = (id) => document.getElementById(id);
const statementBody = el('statementBody');

function addStatement(type, amount, status, details) {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${new Date().toLocaleString()}</td><td>${type}</td><td>₹${amount}</td><td>${status}</td><td>${details}</td>`;
  statementBody.prepend(tr);
}

function updateBalance() {
  el('balance').textContent = state.balance.toFixed(2);
}

function updateVip() {
  let level = 'Bronze';
  if (state.totalDeposits >= 5000) level = 'Silver';
  if (state.totalDeposits >= 20000) level = 'Gold';
  if (state.totalDeposits >= 50000) level = 'Platinum';
  el('vipLevel').textContent = level;
  el('totalDeposits').textContent = state.totalDeposits;
  el('totalBets').textContent = state.totalBets;
}

function formatDateToken(datetimeString) {
  const dt = new Date(datetimeString);
  if (Number.isNaN(dt.getTime())) return null;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const mm = String(dt.getMinutes()).padStart(2, '0');
  return `${y}${m}${d}${hh}${mm}`;
}

function updateDepositClock() {
  el('depositNow').textContent = new Date().toLocaleString();
}

function randomTeams() {
  const a = teamsPool[Math.floor(Math.random() * teamsPool.length)];
  let b = teamsPool[Math.floor(Math.random() * teamsPool.length)];
  while (a === b) b = teamsPool[Math.floor(Math.random() * teamsPool.length)];
  return `${a} vs ${b}`;
}

function createLiveMatch() {
  return {
    teams: randomTeams(),
    score: `${Math.floor(Math.random() * 180) + 20}/${Math.floor(Math.random() * 8)} (${(Math.random() * 20).toFixed(1)})`,
    odds: Number((1.2 + Math.random() * 1.8).toFixed(2))
  };
}

function createScorecard(match) {
  const [batting] = match.teams.split(' vs ');
  return {
    title: `${match.teams} • Live Scorecard`,
    innings: `${batting} Innings`,
    score: match.score,
    crr: (Math.random() * 3 + 6).toFixed(2),
    batter1: `${Math.floor(Math.random() * 75) + 8} (${Math.floor(Math.random() * 40) + 8})`,
    batter2: `${Math.floor(Math.random() * 70) + 8} (${Math.floor(Math.random() * 36) + 7})`,
    bowler: `${Math.floor(Math.random() * 3)}/${Math.floor(Math.random() * 42) + 10} in ${(Math.random() * 4 + 1).toFixed(1)} overs`,
    lastOver: Array.from({ length: 6 }, () => ['0', '1', '2', '4', '6', 'W'][Math.floor(Math.random() * 6)]).join(' ')
  };
}

function renderScorecard() {
  const wrap = el('liveScorecard');
  if (!state.scorecard) {
    wrap.innerHTML = '<p class="muted">No live scorecard yet.</p>';
    return;
  }

  wrap.innerHTML = `
    <div class="item scorecard">
      <div>
        <strong>${state.scorecard.title}</strong>
        <p class="muted">${state.scorecard.innings} • ${state.scorecard.score} • CRR ${state.scorecard.crr}</p>
        <p>Batter 1: ${state.scorecard.batter1}</p>
        <p>Batter 2: ${state.scorecard.batter2}</p>
        <p>Bowler: ${state.scorecard.bowler}</p>
        <p class="muted">Last Over: ${state.scorecard.lastOver}</p>
      </div>
    </div>
  `;
}

function renderMatches() {
  const wrap = el('liveMatches');
  wrap.innerHTML = '';

  state.matches.forEach((match) => {
    const node = el('matchTemplate').content.firstElementChild.cloneNode(true);
    node.querySelector('.teams').textContent = match.teams;
    node.querySelector('.score').textContent = match.score;
    node.querySelector('.odds').textContent = `Odds ${match.odds.toFixed(2)}`;

    node.querySelectorAll('.bet-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const amount = 100;
        if (state.balance < amount) {
          addStatement('Cricket Bet', amount, 'Failed', 'Insufficient balance (min ₹100)');
          alert('Insufficient balance for minimum cricket bet ₹100.');
          return;
        }
        state.balance -= amount;
        state.totalBets += amount;
        updateBalance();
        updateVip();
        addStatement('Cricket Bet', amount, 'Placed', `${match.teams} at ${match.odds.toFixed(2)}`);
      });
    });

    wrap.appendChild(node);
  });

  el('fancyOdds').innerHTML = state.matches
    .map((m) => `<div class="item"><span>${m.teams} - Next Over Fancy</span><strong>${(Math.random() * 20 + 120).toFixed(2)}</strong></div>`)
    .join('');
}

function runAiRefresh() {
  state.matches = Array.from({ length: 6 }, () => createLiveMatch());
  state.scorecard = createScorecard(state.matches[0]);
  el('aiStatus').textContent = `AI synced ${state.matches.length} matches at ${new Date().toLocaleTimeString()}`;
  renderMatches();
  renderScorecard();
}

el('refreshAiBtn').addEventListener('click', runAiRefresh);

setInterval(() => {
  if (!state.matches.length) return;
  state.matches = state.matches.map((m) => ({
    ...m,
    odds: Math.max(1.2, Math.min(3, m.odds + (Math.random() - 0.5) * 0.08)),
    score: m.score.replace(/\d+\.\d+/, () => (Math.random() * 20).toFixed(1))
  }));
  state.scorecard = createScorecard(state.matches[0]);
  renderMatches();
  renderScorecard();
}, 4000);

el('gmailLoginBtn').addEventListener('click', () => {
  const email = el('email').value.trim();
  if (!email.endsWith('@gmail.com')) {
    alert('Please login with Gmail only.');
    return;
  }
  addStatement('Login', 0, 'Success', `Logged in as ${email}`);
  el('authMessage').textContent = 'Gmail login successful.';
});

el('sendOtpBtn').addEventListener('click', () => {
  const email = el('email').value.trim();
  if (!email.endsWith('@gmail.com')) {
    alert('OTP registration supports Gmail only.');
    return;
  }
  state.otp = String(Math.floor(100000 + Math.random() * 900000));
  el('otpStatus').textContent = `OTP sent: ${state.otp} (demo)`;
  addStatement('OTP', 0, 'Sent', `OTP sent to ${email}`);
});

el('verifyOtpBtn').addEventListener('click', () => {
  const otp = el('otpInput').value.trim();
  if (otp !== state.otp) {
    addStatement('Registration', 0, 'Failed', 'Invalid OTP');
    alert('Invalid OTP.');
    return;
  }
  addStatement('Registration', 0, 'Success', 'OTP verified');
  el('authMessage').textContent = 'Registration complete.';
});

el('depositBtn').addEventListener('click', () => {
  const amount = Number(el('depositAmount').value);
  const utr = el('depositUtr').value.trim();
  const screenshot = el('depositScreenshot').files[0];
  const paymentDateTime = el('depositDateTime').value;

  if (amount < 100) {
    alert('Minimum deposit is ₹100.');
    return;
  }
  if (!utr || !screenshot || !paymentDateTime) {
    addStatement('Deposit', amount || 0, 'Rejected', 'Missing screenshot/UTR/payment datetime');
    alert('Screenshot, UTR, and payment date-time are mandatory.');
    return;
  }

  const paymentDate = new Date(paymentDateTime);
  const diffMinutes = (Date.now() - paymentDate.getTime()) / 60000;
  const timestampToken = formatDateToken(paymentDateTime);

  if (!timestampToken || Number.isNaN(paymentDate.getTime()) || diffMinutes < -2 || diffMinutes > 30) {
    addStatement('Deposit', amount, 'Rejected', 'Invalid payment date-time window');
    alert('Payment date/time must be valid and within last 30 minutes.');
    return;
  }

  const fileName = screenshot.name;
  const utrMatch = fileName.toLowerCase().includes(utr.toLowerCase());
  const timeMatch = fileName.includes(timestampToken);
  if (!utrMatch || !timeMatch) {
    addStatement('Deposit', amount, 'Rejected', 'Screenshot + UTR + datetime mismatch');
    alert('Strict mismatch: screenshot filename must include exact UTR and YYYYMMDDHHMM.');
    return;
  }

  addStatement('Deposit', amount, 'Processing', `UTR ${utr} verified, crediting in 10 seconds.`);
  setTimeout(() => {
    state.balance += amount;
    state.totalDeposits += amount;
    updateBalance();
    updateVip();
    addStatement('Deposit', amount, 'Success', `Credited after strict verification (UTR ${utr}).`);
  }, 10000);
});

el('withdrawBtn').addEventListener('click', () => {
  const amount = Number(el('withdrawAmount').value);
  const upi = el('withdrawUpi').value.trim();

  if (amount < 100) {
    alert('Minimum withdraw is ₹100.');
    return;
  }
  if (!upi.includes('@')) {
    alert('Enter valid UPI ID.');
    return;
  }
  if (state.balance < amount) {
    addStatement('Withdraw', amount, 'Failed', 'Insufficient balance');
    alert('Insufficient balance.');
    return;
  }

  state.balance -= amount;
  updateBalance();
  addStatement('Withdraw', amount, 'Processing', `Transfer to ${upi} in 1 minute.`);
  setTimeout(() => {
    addStatement('Withdraw', amount, 'Success', `Transferred to ${upi}.`);
  }, 60000);
});

el('placeAviatorBet').addEventListener('click', () => {
  const amount = Number(el('aviatorBet').value);
  if (amount < 10) {
    alert('Aviator minimum bet is ₹10.');
    return;
  }
  if (state.balance < amount) {
    addStatement('Aviator Bet', amount, 'Failed', 'Insufficient balance');
    alert('Insufficient balance for aviator bet.');
    return;
  }

  state.balance -= amount;
  state.totalBets += amount;
  updateBalance();
  updateVip();
  addStatement('Aviator Bet', amount, 'Placed', 'Crash game bet placed.');
});

runAiRefresh();
updateBalance();
updateVip();
updateDepositClock();
setInterval(updateDepositClock, 1000);
