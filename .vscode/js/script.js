// 🚨 ABSOLUTE DUPLICATE BLOCKER
if (window.__GST_SCRIPT_LOADED__) {
  alert("script.js loaded multiple times. Fix your HTML.");
  throw new Error("Duplicate script load blocked");
}
window.__GST_SCRIPT_LOADED__ = true;

function register() {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!email || !password) {
    alert("Email & Password required");
    return;
  }

  localStorage.setItem("user", JSON.stringify({ email, password }));
  alert("Registration Successful");
  window.location.href = "index.html";
}

function login() {
  const email = document.getElementById("loginEmail")?.value;
  const password = document.getElementById("loginPassword")?.value;

  const user = JSON.parse(localStorage.getItem("user"));

  if (user && email === user.email && password === user.password) {
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid Login Details");
  }
}

function logout() {
  window.location.href = "index.html";
}

/*************************************************
 GST CLIENT MANAGEMENT (FIXED & STABLE)
*************************************************/
/*************************************************
 GST CLIENT MANAGEMENT – FINAL STABLE VERSION
*************************************************/

// ===== DATA =====
let gstClients = JSON.parse(localStorage.getItem("gstClients")) || [];

// ===== SECTION TOGGLE =====
function showSection(type) {
  document.getElementById("gstSection").style.display =
    type === "gst" ? "block" : "none";
  document.getElementById("itSection").style.display =
    type === "it" ? "block" : "none";
  document.getElementById("localSection").style.display =
    type === "local" ? "block" : "none";
}

// ===== MODAL =====
function openGSTModal() {
  document.getElementById("gstModal").style.display = "block";
}
function closeGSTModal() {
  document.getElementById("gstModal").style.display = "none";
}

// ===== ADD GST CLIENT (ONLY ONE ENTRY) =====
function addGSTClient() {
  const name = document.getElementById("gstName").value.trim();
  const gst = document.getElementById("gstNo").value.trim();

  if (!name || !gst) {
    alert("Client Name & GST Number required");
    return;
  }

  // duplicate GST check
  if (gstClients.some(c => c.gst === gst)) {
    alert("GST number already exists");
    return;
  }

  gstClients.push({
    name,
    gst,
    months: {
      Jan: { gstr1: "Pending", gstr3b: "Pending" },
      Feb: { gstr1: "Pending", gstr3b: "Pending" },
      Mar: { gstr1: "Pending", gstr3b: "Pending" }
    }
  });

  localStorage.setItem("gstClients", JSON.stringify(gstClients));
  renderGST();
  closeGSTModal();

  document.getElementById("gstName").value = "";
  document.getElementById("gstNo").value = "";
}

// ===== RENDER TABLE =====
function renderGST() {
  const table = document.getElementById("gstTable");
  table.innerHTML = "";

  gstClients.forEach((client, i) => {
    Object.keys(client.months).forEach(month => {
      table.innerHTML += `
        <tr>
          <td>${client.name}</td>
          <td>${month}</td>
          <td>
            <select onchange="updateStatus(${i},'${month}','gstr1',this.value)">
              <option ${client.months[month].gstr1 === "Pending" ? "selected":""}>Pending</option>
              <option ${client.months[month].gstr1 === "Filed" ? "selected":""}>Filed</option>
            </select>
          </td>
          <td>
            <select onchange="updateStatus(${i},'${month}','gstr3b',this.value)">
              <option ${client.months[month].gstr3b === "Pending" ? "selected":""}>Pending</option>
              <option ${client.months[month].gstr3b === "Filed" ? "selected":""}>Filed</option>
            </select>
          </td>
          <td>
            <button onclick="deleteGST(${i})">Delete</button>
          </td>
        </tr>
      `;
    });
  });
}

// ===== UPDATE STATUS =====
function updateStatus(i, month, type, value) {
  gstClients[i].months[month][type] = value;
  localStorage.setItem("gstClients", JSON.stringify(gstClients));
}

// ===== DELETE =====
function deleteGST(i) {
  gstClients.splice(i, 1);
  localStorage.setItem("gstClients", JSON.stringify(gstClients));
  renderGST();
}

// ===== INITIAL LOAD =====
renderGST();

// ===== SINGLE EVENT BIND (CRITICAL FIX) =====
document.getElementById("saveGSTBtn").addEventListener("click", addGSTClient);
