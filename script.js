let users = JSON.parse(localStorage.getItem('envi_users')) || [
    { username: 'admin', pass: 'admin123', name: 'System Admin', role: 'admin', status: 'Approved' }
];
let records = JSON.parse(localStorage.getItem('scrap_db')) || [];
let currentUser = null;
let charts = {};

// 1. Clock
setInterval(() => {
    const el = document.getElementById('live-clock');
    if(el) el.innerText = new Date().toLocaleString();
}, 1000);

// 2. Auth
function login() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    const found = users.find(x => x.username === u && x.pass === p);

    if (found) {
        currentUser = found;
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('logout-btn').classList.remove('hidden');
        updateNav();
        showPage(found.role === 'admin' ? 'admin-dashboard' : 'user-add-scrap');
    } else { alert("Invalid Credentials"); }
}

function updateNav() {
    const nav = document.getElementById('nav-links');
    nav.innerHTML = currentUser.role === 'admin' 
        ? `<button onclick="showPage('admin-dashboard')">Overview</button><button onclick="showPage('admin-users')">Accounts</button>` 
        : `<button onclick="showPage('user-add-scrap')">New Entry</button><button onclick="showPage('user-view-scrap')">Logs</button>`;
}

function showPage(id) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if (id === 'admin-dashboard') setTimeout(renderCharts, 250);
    if (id === 'admin-users') renderUserList();
    if (id === 'user-view-scrap') renderUserLogs();
}

// 3. Admin Features
function addUser() {
    const n = document.getElementById('new-name'), u = document.getElementById('new-username'), r = document.getElementById('new-role');
    if(!n.value || !u.value || !r.value) return alert("Fill fields");
    users.push({ username: u.value, pass: '1234', name: n.value, role: r.value, status: 'Approved' });
    localStorage.setItem('envi_users', JSON.stringify(users));
    alert("User Created!");
    n.value = ""; u.value = ""; r.selectedIndex = 0; // AUTO RESET
    renderUserList();
}

function renderUserList() {
    document.getElementById('user-list-body').innerHTML = users.map(u => `<tr><td><b>${u.name}</b></td><td>${u.role}</td><td>${u.status}</td><td>❌</td></tr>`).join('');
}

// 4. User Features
document.getElementById('scrap-form').onsubmit = function(e) {
    e.preventDefault();
    records.push({
        id: Date.now(),
        owner: currentUser.username,
        date: document.getElementById('date').value,
        qty: parseInt(document.getElementById('qty').value),
        type: document.getElementById('scrap-type').value
    });
    localStorage.setItem('scrap_db', JSON.stringify(records));
    alert("Record Saved!");
    this.reset(); // AUTO RESET
    showPage('user-view-scrap');
};

function renderUserLogs() {
    const myData = records.filter(r => r.owner === currentUser.username);
    document.getElementById('user-total-qty').innerText = myData.reduce((a, b) => a + b.qty, 0);
    document.getElementById('scrap-list-body').innerHTML = myData.map(r => `<tr><td>${r.date}</td><td>${r.type}</td><td>${r.qty} kg</td><td>Active</td><td>❌</td></tr>`).join('');
}

// 5. Analytics (FIXED OVERLAP)
function renderCharts() {
    document.getElementById('adm-total-qty').innerText = records.reduce((a, b) => a + b.qty, 0);
    document.getElementById('adm-active-users').innerText = users.length;

    const ctx = document.getElementById('scrapQtyChart').getContext('2d');
    if(charts.q) charts.q.destroy(); // CLEANUP
    charts.q = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Garbage', 'Carton', 'Pallet'], datasets: [{ data: [100, 50, 30], backgroundColor: ['#E60012', '#00205B', '#FFD700'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function logout() { location.reload(); }
