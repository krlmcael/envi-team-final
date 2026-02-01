let users = JSON.parse(localStorage.getItem('envi_users')) || [
    { username: 'admin', pass: 'admin123', name: 'System Admin', role: 'admin', status: 'Approved' }
];
let records = JSON.parse(localStorage.getItem('scrap_db')) || [];
let currentUser = null;
let charts = {};

// --- LOGIN ---
function login() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    const found = users.find(x => x.username === u && x.pass === p);

    if (found) {
        currentUser = found;
        alert("✅ Success!");
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('logout-btn').classList.remove('hidden');
        updateNav();
        showPage(found.role === 'admin' ? 'admin-dashboard' : 'user-add-scrap');
    } else { alert("❌ Invalid Credentials"); }
}

function updateNav() {
    const nav = document.getElementById('nav-links');
    nav.innerHTML = currentUser.role === 'admin' 
        ? `<button onclick="showPage('admin-dashboard')">Analytics</button><button onclick="showPage('admin-users')">Accounts</button>` 
        : `<button onclick="showPage('user-add-scrap')">New Entry</button><button onclick="showPage('user-view-scrap')">View Records</button>`;
}

function showPage(id) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if (id === 'admin-dashboard') setTimeout(renderFixedCharts, 250);
    if (id === 'admin-users') renderUserList();
    if (id === 'user-view-scrap') renderUserLogs();
}

// --- USER: SUBMIT & VIEW (FIXED) ---
document.getElementById('scrap-form').onsubmit = function(e) {
    e.preventDefault();
    records.push({
        id: Date.now(),
        owner: currentUser.username, // FIXED: Ties data to user
        date: document.getElementById('date').value,
        qty: parseInt(document.getElementById('qty').value),
        type: document.getElementById('scrap-type').value
    });
    localStorage.setItem('scrap_db', JSON.stringify(records));
    alert("🚀 Data Recorded!");
    this.reset();
    showPage('user-view-scrap');
};

function renderUserLogs() {
    const list = document.getElementById('scrap-list-body');
    const myData = records.filter(r => r.owner === currentUser.username);
    list.innerHTML = myData.map(r => `<tr><td>${r.date}</td><td>${r.type}</td><td>${r.qty}</td><td>❌</td></tr>`).join('');
}

// --- ADMIN: ADD USER & AUTO-RESET ---
function addUser() {
    const n = document.getElementById('new-name'), u = document.getElementById('new-username'), r = document.getElementById('new-role');
    if(!n.value || !u.value) return alert("Fill fields!");

    users.push({ username: u.value, pass: '1234', name: n.value, role: r.value, status: 'Approved' });
    localStorage.setItem('envi_users', JSON.stringify(users));
    alert("👤 User Created!");
    
    // AUTO-RESET FIELDS
    n.value = ""; u.value = ""; r.selectedIndex = 0;
    renderUserList();
}

// --- FIXED GRAPHS (NO OVERLAP) ---
function renderFixedCharts() {
    const ctx = document.getElementById('scrapQtyChart').getContext('2d');
    const types = ['Garbage', 'Carton', 'Pallet'];
    const dataVals = types.map(t => records.filter(r => r.type === t).reduce((a, b) => a + b.qty, 0));

    // CLEANUP OLD CHART
    if(charts.q) charts.q.destroy(); 
    
    charts.q = new Chart(ctx, {
        type: 'bar',
        data: { labels: types, datasets: [{ label: 'Total kg', data: dataVals, backgroundColor: '#00205B' }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function renderUserList() {
    document.getElementById('user-list-body').innerHTML = users.map(u => `<tr><td>${u.name}</td><td>${u.role}</td><td>${u.status}</td><td>🗑️</td></tr>`).join('');
}

function logout() { location.reload(); }
