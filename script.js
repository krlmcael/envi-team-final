// ==========================================
// 🗂️ SYSTEM STATE & DATA PERSISTENCE
// ==========================================
let users = JSON.parse(localStorage.getItem('envi_users')) || [
    { username: 'admin', pass: 'admin123', name: 'System Admin', role: 'admin', status: 'Approved' }
];
let records = JSON.parse(localStorage.getItem('scrap_db')) || [];
let currentUser = null;
let charts = {};

// ==========================================
// 🔐 AUTHENTICATION LOGIC
// ==========================================
function login() {
    const userIn = document.getElementById('login-user').value;
    const passIn = document.getElementById('login-pass').value;
    const found = users.find(u => u.username === userIn && u.pass === passIn);

    if (found) {
        if (found.status === 'Disapproved') {
            alert("❌ Access Denied: Your account is currently deactivated.");
            return;
        }
        currentUser = found;
        alert(`✅ Welcome, ${found.name}! Login successful.`);
        
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('logout-btn').classList.remove('hidden');
        updateNav();
        showPage(found.role === 'admin' ? 'admin-dashboard' : 'user-add-scrap');
    } else { 
        alert("⚠️ Invalid Credentials: Please check your username or password."); 
    }
}

function logout() {
    if (confirm("Are you sure you want to log out?")) {
        alert("👋 Logged out successfully.");
        location.reload();
    }
}

// ==========================================
// 🚀 NAVIGATION LOGIC
// ==========================================
function showPage(id) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    
    if(id === 'admin-dashboard') { renderCharts(); renderAdminTable(); }
    if(id === 'admin-users') renderUserList();
    if(id === 'user-view-scrap') renderUserRecords();
}

function updateNav() {
    const nav = document.getElementById('nav-links');
    if(currentUser.role === 'admin') {
        nav.innerHTML = `
            <button onclick="showPage('admin-dashboard')">Analytics</button>
            <button onclick="showPage('admin-users')">User Management</button>
        `;
    } else {
        nav.innerHTML = `
            <button onclick="showPage('user-add-scrap')">Add Entry</button>
            <button onclick="showPage('user-view-scrap')">My Records</button>
        `;
    }
}

// ==========================================
// 📊 ANALYTICS & CHARTS (ADMIN)
// ==========================================
function renderCharts() {
    const types = ['Garbage', 'Carton', 'Waste Pallet', 'Pallet'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Data processing
    const monthlyData = months.map((m, i) => records.filter(r => new Date(r.date).getMonth() === i).reduce((s, r) => s + Number(r.qty), 0));
    const typeCounts = types.map(t => records.filter(r => r.type === t).reduce((s, r) => s + Number(r.qty), 0));
    const sorted = types.map((t, i) => ({ n: t, v: typeCounts[i] })).sort((a, b) => b.v - a.v);
    const userList = [...new Set(records.map(r => r.owner))];
    const userData = userList.map(u => records.filter(r => r.owner === u).reduce((s, r) => s + Number(r.qty), 0));

    // Reset Charts
    Object.values(charts).forEach(c => c.destroy());

    // Initialize Charts
    charts.m = new Chart(document.getElementById('monthlyTrendChart'), { type: 'line', data: { labels: months, datasets: [{ label: 'Volume', data: monthlyData, borderColor: '#00205B', fill: true, backgroundColor: 'rgba(0,32,91,0.1)' }] } });
    charts.t = new Chart(document.getElementById('scrapQtyChart'), { type: 'bar', data: { labels: types, datasets: [{ label: 'Qty', data: typeCounts, backgroundColor: '#E60012' }] } });
    charts.r = new Chart(document.getElementById('rankChart'), { type: 'doughnut', data: { labels: sorted.map(x=>x.n), datasets: [{ data: sorted.map(x=>x.v), backgroundColor: ['#00205B', '#E60012', '#D1D1D1', '#333'] }] } });
    charts.u = new Chart(document.getElementById('userPerformanceChart'), { type: 'bar', data: { labels: userList, datasets: [{ label: 'Performance', data: userData, backgroundColor: '#28a745' }] }, options: { indexAxis: 'y' } });
}

// ==========================================
// 📝 DATA MANAGEMENT (ADD, EDIT, DELETE)
// ==========================================

// --- ADD RECORD ---
document.getElementById('scrap-form').onsubmit = (e) => {
    e.preventDefault();
    const newEntry = {
        id: Date.now(),
        owner: currentUser.username,
        date: document.getElementById('date').value,
        personnel: document.getElementById('personnel').value,
        qty: parseInt(document.getElementById('qty').value),
        type: document.getElementById('scrap-type').value
    };

    records.push(newEntry);
    localStorage.setItem('scrap_db', JSON.stringify(records));
    
    alert("🚀 Success: Data has been recorded!");
    e.target.reset();
    showPage('user-view-scrap');
};

// --- DELETE RECORD ---
function deleteRec(id) {
    if (confirm("❓ Delete this record permanently?")) {
        records = records.filter(r => r.id !== id);
        localStorage.setItem('scrap_db', JSON.stringify(records));
        alert("🗑️ Record deleted.");
        renderUserRecords();
    }
}

// --- ADMIN: USER MANAGEMENT ---
function addUser() {
    const n = document.getElementById('new-name').value;
    const u = document.getElementById('new-username').value;
    const r = document.getElementById('new-role').value;

    if(!n || !u) return alert("⚠️ Please fill all fields.");

    users.push({ username: u, pass: '1234', name: n, role: r, status: 'Approved' });
    localStorage.setItem('envi_users', JSON.stringify(users));
    
    alert(`👤 User Created: ${n}. Default password is '1234'.`);
    renderUserList();
}

function updateStatus(i, v) {
    users[i].status = v;
    localStorage.setItem('envi_users', JSON.stringify(users));
    alert("🔄 Account status updated.");
}

function deleteUser(i) {
    if (confirm("⚠️ Remove this user account?")) {
        users.splice(i, 1);
        localStorage.setItem('envi_users', JSON.stringify(users));
        alert("🗑️ User removed.");
        renderUserList();
    }
}

// ==========================================
// 📋 TABLES RENDERING
// ==========================================
function renderAdminTable() {
    document.getElementById('admin-all-records').innerHTML = records.map(r => `
        <tr><td>${r.date}</td><td>${r.owner}</td><td>${r.type}</td><td>${r.qty}</td></tr>
    `).join('');
}

function renderUserRecords() {
    document.getElementById('scrap-list').innerHTML = records
        .filter(r => r.owner === currentUser.username)
        .map(r => `
            <tr>
                <td>${r.date}</td><td>${r.personnel}</td><td>${r.type}</td><td>${r.qty}</td>
                <td><button class="btn-delete" onclick="deleteRec(${r.id})">Delete</button></td>
            </tr>
        `).join('');
}

function renderUserList() {
    document.getElementById('user-list-body').innerHTML = users.map((u, i) => `
        <tr>
            <td>${u.name}</td><td>${u.role}</td>
            <td>
                <select onchange="updateStatus(${i}, this.value)">
                    <option ${u.status=='Approved'?'selected':''}>Approved</option>
                    <option ${u.status=='Disapproved'?'selected':''}>Disapproved</option>
                </select>
            </td>
            <td><button class="btn-delete" onclick="deleteUser(${i})">Delete</button></td>
        </tr>
    `).join('');
}

// ==========================================
// 📥 EXCEL EXPORT
// ==========================================
function exportToExcel() {
    let csv = "Date,User,Type,Qty,Personnel\n";
    records.forEach(r => csv += `${r.date},${r.owner},${r.type},${r.qty},${r.personnel}\n`);
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    a.download = 'Yamaha_ENVI_Report.csv';
    a.click();
    alert("📥 Report downloaded as CSV.");
}
