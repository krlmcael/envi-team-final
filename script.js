// System Initialization
let records = JSON.parse(localStorage.getItem('scrap_db')) || [];
let currentUser = null;
let charts = {};

document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

function login() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    
    if (u === 'admin' && p === 'admin123') {
        currentUser = { role: 'admin', name: 'Administrator' };
    } else if (u.startsWith('user') && p === '1234') {
        currentUser = { role: 'user', name: u };
    } else {
        return alert("Access Denied: Invalid Credentials");
    }

    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('logout-btn').classList.remove('hidden');
    updateNav();
    showPage(currentUser.role === 'admin' ? 'admin-dashboard' : 'user-add-scrap');
}

function updateNav() {
    const nav = document.getElementById('nav-links');
    nav.innerHTML = currentUser.role === 'admin' 
        ? `<button class="btn-outline" onclick="showPage('admin-dashboard')">Analytics</button>` 
        : `<button class="btn-outline" onclick="showPage('user-add-scrap')">New Entry</button>
           <button class="btn-outline" onclick="showPage('user-view-scrap')">History</button>`;
}

function showPage(id) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if (id === 'admin-dashboard') refreshDashboard();
    if (id === 'user-view-scrap') renderUserTable();
}

function refreshDashboard() {
    // Calculate Summary Stats
    const total = records.reduce((sum, r) => sum + Number(r.qty), 0);
    document.getElementById('stat-total').innerText = total.toLocaleString();
    
    // Render Analytics
    renderCharts();
}

function renderCharts() {
    const ctxTrend = document.getElementById('monthlyTrendChart').getContext('2d');
    const ctxType = document.getElementById('scrapQtyChart').getContext('2d');

    // Destroy existing charts to prevent memory leaks
    if (charts.trend) charts.trend.destroy();
    if (charts.type) charts.type.destroy();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map((m, i) => records.filter(r => new Date(r.date).getMonth() === i).reduce((s, r) => s + Number(r.qty), 0));

    charts.trend = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{ label: 'Trend', data: monthlyData, borderColor: '#00205B', tension: 0.4, fill: true, backgroundColor: 'rgba(0,32,91,0.05)' }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const types = ['Garbage', 'Carton', 'Waste Pallet', 'Pallet'];
    const typeData = types.map(t => records.filter(r => r.type === t).reduce((s, r) => s + Number(r.qty), 0));

    charts.type = new Chart(ctxType, {
        type: 'doughnut',
        data: {
            labels: types,
            datasets: [{ data: typeData, backgroundColor: ['#E60012', '#00205B', '#D1D1D1', '#334155'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

document.getElementById('scrap-form').onsubmit = (e) => {
    e.preventDefault();
    const newRecord = {
        id: Date.now(),
        date: document.getElementById('date').value,
        personnel: document.getElementById('personnel').value,
        qty: document.getElementById('qty').value,
        type: document.getElementById('scrap-type').value,
        owner: currentUser.name
    };
    records.push(newRecord);
    localStorage.setItem('scrap_db', JSON.stringify(records));
    alert("Record committed successfully!");
    e.target.reset();
};

function logout() { location.reload(); }
