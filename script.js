// --- SYSTEM DATA ---
let users = JSON.parse(localStorage.getItem('envi_users')) || [
    { username: 'admin', pass: 'admin123', name: 'System Admin', role: 'admin', status: 'Approved' }
];
let records = JSON.parse(localStorage.getItem('scrap_db')) || [];
let currentUser = null;
let charts = {};

// --- AUTHENTICATION ---
function login() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    const found = users.find(user => user.username === u && user.pass === p);

    if (found) {
        if (found.status === 'Disapproved') return alert("❌ Account Deactivated. Contact Admin.");
        currentUser = found;
        alert(`✅ Welcome back, ${found.name}! Login successful.`);
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('logout-btn').classList.remove('hidden');
        updateNav();
        showPage(found.role === 'admin' ? 'admin-dashboard' : 'user-add-scrap');
    } else { alert("⚠️ Invalid credentials. Please try again."); }
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
    const target = document.getElementById(id);
    if(target) target.classList.remove('hidden');
    
    if (id === 'admin-dashboard') renderCharts();
    if (id === 'admin-users') renderUserList();
    renderTables();
}

// --- DATA ENTRY LOGIC ---
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
    alert("🚀 Success: New record committed to database!");
    e.target.reset();
    showPage('user-view-scrap');
};

function deleteRec(id) {
    if (confirm("❓ Are you sure you want to delete this record?")) {
        records = records.filter(r => r.id !== id);
        localStorage.setItem('scrap_db', JSON.stringify(records));
        alert("🗑️ Record deleted.");
        renderTables();
        if(document.getElementById('admin-dashboard').classList.contains('hidden') === false) renderCharts();
    }
}

// --- USER MANAGEMENT & AUTO-RESET ---
function addUser() {
    const nameBox = document.getElementById('new-name');
    const userBox = document.getElementById('new-username');
    const roleBox = document.getElementById('new-role');

    if(!nameBox.value || !userBox.value || !roleBox.value) {
        return alert("⚠️ Please fill in all fields.");
    }

    users.push({ 
        username: userBox.value, 
        pass: '1234', 
        name: nameBox.value, 
        role: roleBox.value, 
        status: 'Approved' 
    });
    
    localStorage.setItem('envi_users', JSON.stringify(users));
    alert(`👤 User Created: ${nameBox.value} successfully registered.`);

    // --- RESET FIELDS ---
    nameBox.value = "";
    userBox.value = "";
    roleBox.selectedIndex = 0;

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
            <td><button class="btn-primary" style="padding:5px 10px; background:#444;" onclick="deleteUser(${i})">Delete</button></td>
        </tr>`).join('');
}

function updateStatus(i, v) { 
    users[i].status = v; 
    localStorage.setItem('envi_users', JSON.stringify(users)); 
    alert("🔄 Account status updated."); 
}

function deleteUser(i) { 
    if(confirm("Delete this user account?")) { 
        users.splice(i,1); 
        localStorage.setItem('envi_users', JSON.stringify(users)); 
        renderUserList(); 
    } 
}

// --- TABLES & CHARTS ---
function renderTables() {
    const list = document.getElementById('scrap-list');
    const adminList = document.getElementById('admin-all-records');
    if(list) list.innerHTML = records.filter(r => r.owner === currentUser.name).map(r => `<tr><td>${r.date}</td><td>${r.type}</td><td>${r.qty}</td><td><button onclick="deleteRec(${r.id})">❌</button></td></tr>`).join('');
    if(adminList) adminList.innerHTML = records.map(r => `<tr><td>${r.date}</td><td>${r.owner}</td><td>${r.type}</td><td>${r.qty}</td></tr>`).join('');
}

function renderCharts() {
    const types = ['Garbage', 'Carton', 'Waste Pallet', 'Pallet'];
    const typeVals = types.map(t => records.filter(r => r.type === t).reduce((s, r) => s + r.qty, 0));
    
    const ctx = document.getElementById('scrapQtyChart').getContext('2d');
    if(charts.q) charts.q.destroy();
    charts.q = new Chart(ctx, { 
        type: 'bar', 
        data: { labels: types, datasets: [{ label: 'Quantity', data: typeVals, backgroundColor: '#00205B' }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function logout() { if(confirm("Are you sure you want to sign out?")) location.reload(); }
