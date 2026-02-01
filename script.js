// Database Simulation
let records = JSON.parse(localStorage.getItem('scrap_db')) || [];
let currentUser = null;
let charts = {};

// 1. LOGIN LOGIC
function login() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;

    if (u === 'admin' && p === 'admin123') {
        currentUser = { name: 'Admin', role: 'admin' };
    } else if (u.startsWith('user') && p === '1234') {
        currentUser = { name: u, role: 'user' };
    } else {
        return alert("❌ Maling credentials!");
    }

    alert(`✅ Welcome ${currentUser.name}! Login successful.`);
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('logout-btn').classList.remove('hidden');
    updateNav();
    showPage(currentUser.role === 'admin' ? 'admin-dashboard' : 'user-add-scrap');
}

function updateNav() {
    const nav = document.getElementById('nav-links');
    nav.innerHTML = currentUser.role === 'admin' 
        ? `<button onclick="showPage('admin-dashboard')">Dashboard</button>` 
        : `<button onclick="showPage('user-add-scrap')">New Entry</button>
           <button onclick="showPage('user-view-scrap')">My Logs</button>`;
}

function showPage(id) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if (id === 'admin-dashboard') renderCharts();
    if (id === 'user-view-scrap' || id === 'admin-dashboard') renderTables();
}

// 2. ADD & DELETE LOGIC
document.getElementById('scrap-form').onsubmit = (e) => {
    e.preventDefault();
    const entry = {
        id: Date.now(),
        owner: currentUser.name,
        date: document.getElementById('date').value,
        personnel: document.getElementById('personnel').value,
        qty: parseInt(document.getElementById('qty').value),
        type: document.getElementById('scrap-type').value
    };
    records.push(entry);
    localStorage.setItem('scrap_db', JSON.stringify(records));
    alert("🚀 Success: Record added!");
    e.target.reset();
    showPage('user-view-scrap');
};

function deleteRec(id) {
    if (confirm("❓ Sigurado ka bang gusto mo itong burahin?")) {
        records = records.filter(r => r.id !== id);
        localStorage.setItem('scrap_db', JSON.stringify(records));
        alert("🗑️ Record deleted successfully.");
        renderTables();
    }
}

// 3. CHARTS RENDERING
function renderCharts() {
    const ctxTrend = document.getElementById('monthlyTrendChart').getContext('2d');
    const ctxType = document.getElementById('scrapQtyChart').getContext('2d');

    if(charts.t) charts.t.destroy();
    if(charts.q) charts.q.destroy();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyVals = months.map((m, i) => records.filter(r => new Date(r.date).getMonth() === i).reduce((s, r) => s + r.qty, 0));

    charts.t = new Chart(ctxTrend, {
        type: 'line',
        data: { labels: months, datasets: [{ label: 'Volume', data: monthlyVals, borderColor: '#E60012', fill: true, backgroundColor: 'rgba(230,0,18,0.05)' }] }
    });

    const types = ['Garbage', 'Carton', 'Waste Pallet', 'Pallet'];
    const typeVals = types.map(t => records.filter(r => r.type === t).reduce((s, r) => s + r.qty, 0));

    charts.q = new Chart(ctxType, {
        type: 'bar',
        data: { labels: types, datasets: [{ label: 'Qty', data: typeVals, backgroundColor: '#00205B' }] }
    });
}

function renderTables() {
    const list = document.getElementById('scrap-list');
    const adminList = document.getElementById('admin-all-records');
    
    if(list) list.innerHTML = records.filter(r => r.owner === currentUser.name).map(r => `<tr><td>${r.date}</td><td>${r.type}</td><td>${r.qty}</td><td><button onclick="deleteRec(${r.id})">❌</button></td></tr>`).join('');
    if(adminList) adminList.innerHTML = records.map(r => `<tr><td>${r.date}</td><td>${r.owner}</td><td>${r.type}</td><td>${r.qty}</td></tr>`).join('');
}

function logout() { location.reload(); }
