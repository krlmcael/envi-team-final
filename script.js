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
    const found = users.find(user => user.username === u && user.pass === p);

    if (found) {
        if (found.status === 'Disapproved') return alert("❌ Account Deactivated.");
        currentUser = found;
        alert(`✅ Welcome ${found.name}!`);
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('logout-btn').classList.remove('hidden');
        updateNav();
        showPage(found.role === 'admin' ? 'admin-dashboard' : 'user-add-scrap');
    } else { alert("❌ Invalid Credentials."); }
}

function updateNav() {
    const nav = document.getElementById('nav-links');
    nav.innerHTML = currentUser.role === 'admin' 
        ? `<button onclick="showPage('admin-dashboard')">Analytics</button>
           <button onclick="showPage('admin-users')">Account Management</button>` 
        : `<button onclick="showPage('user-add-scrap')">New Entry</button>
           <button onclick="showPage('user-view-scrap')">My Logs</button>`;
}

function showPage(id) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    
    if (id === 'admin-dashboard') setTimeout(renderCharts, 200); 
    if (id === 'admin-users') renderUserList();
    renderTables();
}

// --- USER MANAGEMENT (WITH AUTO-RESET) ---
function addUser() {
    const nBox = document.getElementById('new-name');
    const uBox = document.getElementById('new-username');
    const rBox = document.getElementById('new-role');

    if(!nBox.value || !uBox.value || !rBox.value) return alert("⚠️ Please fill all fields.");

    users.push({ 
        username: uBox.value, 
        pass: '1234', 
        name: nBox.value, 
        role: rBox.value, 
        status: 'Approved' 
    });
    
    localStorage.setItem('envi_users', JSON.stringify(users));
    alert(`✅ User Created: ${nBox.value}`);

    // RESET INPUTS (MAWAWALA NA ANG TEXT DITO)
    nBox.value = "";
    uBox.value = "";
    rBox.selectedIndex = 0;

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
            <td><button class="btn-primary" style="padding:5px 10px; background:#444;" onclick="deleteUser(${i})">❌</button></td>
        </tr>`).join('');
}

// --- ANALYTICS ---
function renderCharts() {
    const types = ['Garbage', 'Carton', 'Waste Pallet', 'Pallet'];
    const typeVals = types.map(t => records.filter(r => r.type === t).reduce((s, r) => s + r.qty, 0));
    
    const canvas = document.getElementById('scrapQtyChart');
    if(!canvas) return;

    if(charts.q) charts.q.destroy();
    charts.q = new Chart(canvas.getContext('2d'), { 
        type: 'bar', 
        data: { labels: types, datasets: [{ label: 'Quantity', data: typeVals, backgroundColor: '#00205B' }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function renderTables() {
    const list = document.getElementById('scrap-list');
    if(list) list.innerHTML = records.filter(r => r.owner === currentUser.name).map(r => `<tr><td>${r.date}</td><td>${r.type}</td><td>${r.qty}</td><td><button onclick="deleteRec(${r.id})">❌</button></td></tr>`).join('');
}

function deleteUser(i) { if(confirm("Delete this user?")) { users.splice(i,1); localStorage.setItem('envi_users', JSON.stringify(users)); renderUserList(); } }
function updateStatus(i, v) { users[i].status = v; localStorage.setItem('envi_users', JSON.stringify(users)); alert("🔄 Updated."); }
function logout() { location.reload(); }
