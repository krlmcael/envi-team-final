let users = JSON.parse(localStorage.getItem('envi_users')) || [
    { username: 'admin', pass: 'admin123', name: 'System Admin', role: 'admin', status: 'Approved' }
];
let records = JSON.parse(localStorage.getItem('scrap_db')) || [];
let currentUser = null;
let charts = {};

// LOGIN
function login() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    const found = users.find(user => user.username === u && user.pass === p);

    if (found) {
        if (found.status === 'Disapproved') return alert("❌ Account Deactivated.");
        currentUser = found;
        alert(`✅ Welcome ${found.name}!`);
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('logout-btn').classList.remove('hidden');
        updateNav();
        showPage(found.role === 'admin' ? 'admin-dashboard' : 'user-add-scrap');
    } else { alert("❌ Invalid Login."); }
}

function updateNav() {
    const nav = document.getElementById('nav-links');
    nav.innerHTML = currentUser.role === 'admin' 
        ? `<button onclick="showPage('admin-dashboard')">Dashboard</button>
           <button onclick="showPage('admin-users')">User Management</button>` 
        : `<button onclick="showPage('user-add-scrap')">New Entry</button>
           <button onclick="showPage('user-view-scrap')">My Logs</button>`;
}

function showPage(id) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if (id === 'admin-dashboard') renderCharts();
    if (id === 'admin-users') renderUserList();
    renderTables();
}

// SCRAP DATA LOGIC
document.getElementById('scrap-form').onsubmit = (e) => {
    e.preventDefault();
    records.push({ 
        id: Date.now(), 
        owner: currentUser.name, 
        date: document.getElementById('date').value, 
        personnel: document.getElementById('personnel').value, 
        qty: parseInt(document.getElementById('qty').value), 
        type: document.getElementById('scrap-type').value 
    });
    localStorage.setItem('scrap_db', JSON.stringify(records));
    alert("🚀 Success: Record Added!");
    e.target.reset();
    showPage('user-view-scrap');
};

function deleteRec(id) {
    if (confirm("❓ Delete this record?")) {
        records = records.filter(r => r.id !== id);
        localStorage.setItem('scrap_db', JSON.stringify(records));
        alert("🗑️ Deleted.");
        renderTables();
    }
}

// USER MANAGEMENT LOGIC
function addUser() {
    const n = document.getElementById('new-name').value;
    const u = document.getElementById('new-username').value;
    const r = document.getElementById('new-role').value;
    if(!n || !u) return alert("⚠️ Fill all fields.");
    users.push({ username: u, pass: '1234', name: n, role: r, status: 'Approved' });
    localStorage.setItem('envi_users', JSON.stringify(users));
    alert("👤 User Created! Default pass: 1234");
    renderUserList();
}

function renderUserList() {
    const body = document.getElementById('user-list-body');
    if(!body) return;
    body.innerHTML = users.map((u, i) => `
        <tr>
            <td>${u.name}</td>
            <td>${u.role}</td>
            <td>
                <select onchange="updateStatus(${i}, this.value)">
                    <option ${u.status=='Approved'?'selected':''}>Approved</option>
                    <option ${u.status=='Disapproved'?'selected':''}>Disapproved</option>
                </select>
            </td>
            <td><button onclick="deleteUser(${i})">❌</button></td>
        </tr>`).join('');
}

function updateStatus(i, v) { users[i].status = v; localStorage.setItem('envi_users', JSON.stringify(users)); alert("🔄 Updated."); }
function deleteUser(i) { if(confirm("Delete user?")) { users.splice(i,1); localStorage.setItem('envi_users', JSON.stringify(users)); renderUserList(); } }

// RENDER TABLES & CHARTS
function renderTables() {
    const list = document.getElementById('scrap-list');
    const adminList = document.getElementById('admin-all-records');
    if(list) list.innerHTML = records.filter(r => r.owner === currentUser.name).map(r => `<tr><td>${r.date}</td><td>${r.type}</td><td>${r.qty}</td><td><button onclick="deleteRec(${r.id})">❌</button></td></tr>`).join('');
    if(adminList) adminList.innerHTML = records.map(r => `<tr><td>${r.date}</td><td>${r.owner}</td><td>${r.type}</td><td>${r.qty}</td></tr>`).join('');
}

function renderCharts() {
    const types = ['Garbage', 'Carton', 'Waste Pallet', 'Pallet'];
    const typeVals = types.map(t => records.filter(r => r.type === t).reduce((s, r) => s + r.qty, 0));
    if(charts.q) charts.q.destroy();
    charts.q = new Chart(document.getElementById('scrapQtyChart'), { 
        type: 'bar', 
        data: { labels: types, datasets: [{ label: 'Qty', data: typeVals, backgroundColor: '#00205B' }] } 
    });
}

function logout() { if(confirm("Sign out?")) location.reload(); }
