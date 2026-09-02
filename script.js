/******** GLOBAL ELEMENTS & MODALS ********/
const gstSection = document.getElementById("gstSection");
const itSection = document.getElementById("itSection");
const localSection = document.getElementById("localSection");

const gstModalEl = document.getElementById("gstModal");
const editProfileModalEl = document.getElementById("editProfileModal");
const gstModal = new bootstrap.Modal(gstModalEl);
const editProfileModal = new bootstrap.Modal(editProfileModalEl);

const gstTable = document.getElementById("gstTable");
const gstName = document.getElementById("gstName");
const gstContact = document.getElementById("gstContact");
const gstFirmCount = document.getElementById("gstFirmCount");
const gstIn = document.getElementById("gstIn");
const gstPortalId = document.getElementById("gstPortalId");
const gstPortalPass = document.getElementById("gstPortalPass");
const gstMonth = document.getElementById("gstMonth");
const gstFees = document.getElementById("gstFees");
const saveGSTBtn = document.getElementById("saveGSTBtn");
const gstOtherId = document.getElementById("gstOtherId");
const gstOtherPass = document.getElementById("gstOtherPass");

let editIndex = null;
let currentUser = null;

// ==================== PAGINATION STATE ====================
let currentPage = 1;
const itemsPerPage = 5;
let allGstClients = []; // Master Array

/******** PAGE NAVIGATION ********/
function showPage(pageId) {
  document.getElementById('loginPage').classList.add('d-none');
  document.getElementById('registerPage').classList.add('d-none');
  document.getElementById('dashboardPage').classList.add('d-none');

  document.getElementById(pageId).classList.remove('d-none');

  if (pageId === 'dashboardPage') {
    checkUserSession();
    fetchGST();
  }
}

function showSection(type) {
  gstSection.style.display = type === "gst" ? "block" : "none";
  itSection.style.display = type === "it" ? "block" : "none";
  localSection.style.display = type === "local" ? "block" : "none";
}

/******** MODALS MANAGEMENT ********/
function openGSTModal(index = null) {
  editIndex = index;

  if (index !== null) {
    const c = allGstClients[index];
    gstName.value = c.name || "";
    gstContact.value = c.contact || c.mobile || "";
    gstFirmCount.value = c.firms || c.firmCount || "";
    gstIn.value = c.gstin || "";
    gstPortalId.value = c.portalId || c.gstId || "";
    gstPortalPass.value = c.portalPass || c.gstPass || "";
    gstOtherId.value = c.otherId || "";
    gstOtherPass.value = c.otherPass || "";
    gstMonth.value = c.month || "";
    gstFees.value = c.fees || "";
  } else {
    document.querySelectorAll("#gstModal input, #gstModal select").forEach((el) => (el.value = ""));
  }
  gstModal.show();
}

/******** SAVE GST CLIENT ********/
saveGSTBtn.onclick = async () => {
  const client = {
    name: gstName.value.trim(),
    contact: gstContact.value.trim(),
    firms: gstFirmCount.value.trim(),
    gstin: gstIn.value.trim(),
    portalId: gstPortalId.value.trim(),
    portalPass: gstPortalPass.value.trim(),
    otherId: gstOtherId.value.trim(),
    otherPass: gstOtherPass.value.trim(),
    month: gstMonth.value,
    gstr1: "Pending",
    gstr3b: "Pending",
    fees: gstFees.value.trim(),
    nextGenerated: false,
    orderIndex: editIndex !== null ? allGstClients[editIndex].orderIndex : Date.now()
  };

  if (!client.name || !client.gstin || !client.month) {
    alert("Client Name, GSTIN & Month required");
    return;
  }

  if (editIndex !== null) {
    const id = allGstClients[editIndex].id;
    await db.collection("gstClients").doc(id).set(client, { merge: true });
  } else {
    await db.collection("gstClients").add(client);
  }

  gstModal.hide();
};

/******** FIREBASE DATA FETCH (CONNECTED TO PAGINATION) ********/
function fetchGST() {
  db.collection("gstClients")
    .orderBy("orderIndex")
    .onSnapshot((snapshot) => {
      let clients = [];
      snapshot.forEach((doc) => {
        clients.push({ id: doc.id, ...doc.data() });
      });
      onGSTDataReceived(clients);
    });
}

function onGSTDataReceived(clientList) {
  allGstClients = clientList;
  renderGSTTable();
}

/******** PAGINATED RENDER FUNCTION ********/
function renderGSTTable() {
  gstTable.innerHTML = "";
  const totalItems = allGstClients.length;

  if (totalItems === 0) {
    gstTable.innerHTML = `<tr><td colspan="14" class="text-center text-muted py-4">No records found</td></tr>`;
    updatePaginationControls(0);
    return;
  }

  // Slice array for 5 items limit
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = allGstClients.slice(startIndex, endIndex);

  currentItems.forEach((c, index) => {
    const globalIndex = startIndex + index;
    const serialNumber = globalIndex + 1;

    gstTable.innerHTML += `
      <tr>
        <td>${serialNumber}</td>
        <td>${c.name || ""}</td>
        <td>${c.contact || c.mobile || ""}</td>
        <td>${c.firms || c.firmCount || ""}</td>
        <td>${c.gstin || ""}</td>
        <td>${c.portalId || c.gstId || ""}</td>
        <td>${c.portalPass || c.gstPass || ""}</td>
        <td style="max-width: 150px; word-break: break-all;">${c.otherId || ""}</td>
        <td style="max-width: 150px; word-break: break-all;">${c.otherPass || ""}</td>
        <td>${formatMonth(c.month)}</td>
        <td>
          <select data-type="gstr1" class="form-select form-select-sm d-inline-block w-auto" onchange="updateStatus(event, ${globalIndex})">
            <option value="Pending" ${c.gstr1 === "Pending" ? "selected" : ""}>Pending</option>
            <option value="Filed" ${c.gstr1 === "Filed" ? "selected" : ""}>Filed</option>
          </select>
          ${c.gstr1 === "Filed" ? `<span style="cursor:pointer" onclick="sendWhatsApp('${c.contact}','gstr1')"> 💬</span>` : ""}
        </td>
        <td>
          <select data-type="gstr3b" class="form-select form-select-sm d-inline-block w-auto" onchange="updateStatus(event, ${globalIndex})">
            <option value="Pending" ${c.gstr3b === "Pending" ? "selected" : ""}>Pending</option>
            <option value="Filed" ${c.gstr3b === "Filed" ? "selected" : ""}>Filed</option>
          </select>
          ${c.gstr3b === "Filed" ? `<span style="cursor:pointer" onclick="sendWhatsApp('${c.contact}','gstr3b')"> 💬</span>` : ""}
        </td>
        <td>₹${c.fees || 0}</td>
        <td class="text-center">
          <span style="cursor:pointer" onclick="openGSTModal(${globalIndex})">✏️</span>
          &nbsp;
          <span style="cursor:pointer" onclick="deleteGST(${globalIndex})">🗑️</span>
        </td>
      </tr>
    `;
  });

  updatePaginationControls(totalItems);
}

/******** PAGINATION CONTROLS ********/
function updatePaginationControls(totalItems) {
  const paginationControls = document.getElementById('paginationControls');
  const paginationInfo = document.getElementById('paginationInfo');

  if (!paginationControls || !paginationInfo) return;

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  paginationInfo.innerText = `Showing ${start} to ${end} of ${totalItems} entries`;
  paginationControls.innerHTML = '';

  if (totalPages <= 1) return;

  paginationControls.innerHTML += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="changeGSTPage(${currentPage - 1}); return false;">Previous</a>
    </li>
  `;

  for (let i = 1; i <= totalPages; i++) {
    paginationControls.innerHTML += `
      <li class="page-item ${currentPage === i ? 'active' : ''}">
        <a class="page-link" href="#" onclick="changeGSTPage(${i}); return false;">${i}</a>
      </li>
    `;
  }

  paginationControls.innerHTML += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="changeGSTPage(${currentPage + 1}); return false;">Next</a>
    </li>
  `;
}

function changeGSTPage(page) {
  const totalPages = Math.ceil(allGstClients.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;

  currentPage = page;
  renderGSTTable();
}

/******** DELETE & UPDATE HANDLERS ********/
async function deleteGST(index) {
  if (!confirm("Delete this GST client?")) return;
  const id = allGstClients[index].id;
  await db.collection("gstClients").doc(id).delete();
}

async function updateStatus(event, index) {
  const type = event.target.dataset.type;
  const value = event.target.value;
  const client = allGstClients[index];

  client[type] = value;
  await db.collection("gstClients").doc(client.id).update({ [type]: value });

  if (client.gstr1 === "Filed" && client.gstr3b === "Filed" && !client.nextGenerated) {
    const newClient = {
      name: client.name,
      contact: client.contact,
      firms: client.firms,
      gstin: client.gstin,
      portalId: client.portalId,
      portalPass: client.portalPass,
      otherId: client.otherId,
      otherPass: client.otherPass,
      fees: client.fees,
      month: getNextMonth(client.month),
      gstr1: "Pending",
      gstr3b: "Pending",
      nextGenerated: false,
      orderIndex: (client.orderIndex || 0) + 1
    };

    await db.collection("gstClients").add(newClient);
    await db.collection("gstClients").doc(client.id).update({ nextGenerated: true });
  }
}

/******** AUTH & PROFILE ********/
function checkUserSession() {
  const loggedInEmail = localStorage.getItem("loggedInEmail");
  const users = JSON.parse(localStorage.getItem("users")) || [];
  currentUser = users.find((u) => u.email === loggedInEmail);

  if (currentUser) {
    document.getElementById("topbarName").textContent = currentUser.name;
    if (currentUser.image) {
      document.getElementById("profileIcon").src = currentUser.image;
    }
  }
}

function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const messageDiv = document.getElementById("loginMessage");
  messageDiv.classList.add("d-none");

  if (!email || !password) {
    messageDiv.textContent = "All fields are required";
    messageDiv.className = "alert alert-danger";
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem("loggedInEmail", user.email);
    showPage('dashboardPage');
  } else {
    messageDiv.textContent = "Invalid email or password";
    messageDiv.className = "alert alert-danger";
  }
}

function register() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const messageDiv = document.getElementById("message");
  messageDiv.classList.add("d-none");

  if (!name || !email || !password) {
    messageDiv.textContent = "All fields required";
    messageDiv.className = "alert alert-danger";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.find((u) => u.email === email)) {
    messageDiv.textContent = "User already exists";
    messageDiv.className = "alert alert-danger";
    return;
  }

  users.push({ name, email, password });
  localStorage.setItem("users", JSON.stringify(users));

  messageDiv.textContent = "Registered successfully! Please login.";
  messageDiv.className = "alert alert-success";

  setTimeout(() => showPage('loginPage'), 1500);
}

function logout() {
  localStorage.removeItem("loggedInEmail");
  showPage('loginPage');
}

function openEditProfile() {
  if (!currentUser) return;

  const editNameEl = document.getElementById("editName");
  const previewImg = document.getElementById("previewImage");
  const profileIcon = document.getElementById("profileIcon");
  const editImageInput = document.getElementById("editImage");

  editImageInput.value = "";
  editNameEl.value = currentUser.name || "";
  previewImg.src = currentUser.image || profileIcon.src;
  previewImg.style.display = "block";

  editProfileModal.show();
}

function saveProfile() {
  const newName = document.getElementById("editName").value.trim();
  const newImage = document.getElementById("previewImage").src;

  if (!newName) return alert("Name cannot be empty");

  let users = JSON.parse(localStorage.getItem("users")) || [];
  currentUser.name = newName;
  currentUser.image = newImage;

  users = users.map((u) => (u.email === currentUser.email ? currentUser : u));
  localStorage.setItem("users", JSON.stringify(users));

  checkUserSession();
  editProfileModal.hide();
}

/******** UTILITIES ********/
function togglePassVisibility(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

function toggleRegisterPassword() { togglePassVisibility("password"); }
function toggleLoginPassword() { togglePassVisibility("loginPassword"); }

function formatMonth(m) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[parseInt(m, 10) - 1] || m;
}

function getNextMonth(monthStr) {
  let m = parseInt(monthStr, 10);
  if (isNaN(m)) return "01";
  let next = m + 1;
  return next > 12 ? "01" : String(next).padStart(2, "0");
}

function sendWhatsApp(mobile, type) {
  let phone = mobile.replace(/\D/g, "");
  if (phone.length === 10) phone = "91" + phone;
  const msg = type === "gstr1"
    ? "Dear Sir,\nApki GST R1 file ho chuki hai.\nThank you.\nRolen & Associates"
    : "Dear Sir,\nApki GST GSTR-3B file ho chuki hai.\nThank you.\nRolen & Associates";
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
}

document.querySelectorAll(".sidebar button").forEach((btn) => {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".sidebar button").forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
  });
});

document.getElementById("editImage")?.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const previewImg = document.getElementById("previewImage");
      previewImg.src = e.target.result;
      previewImg.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

/******** AUTO LOGIN ON REFRESH & INITIAL LOAD ********/
document.addEventListener("DOMContentLoaded", () => {
  const loggedInEmail = localStorage.getItem("loggedInEmail");

  if (loggedInEmail) {
    showPage("dashboardPage");
  } else {
    showPage("loginPage");
  }
});

/******** TOGGLE SIDEBAR ********/
function toggleSidebar() {
  const sidebar = document.getElementById("sidebarMenu");
  const mainContent = document.getElementById("mainContent");

  if (sidebar.style.display === "none") {
    sidebar.style.display = "block";
    mainContent.classList.remove("col-12");
    mainContent.classList.add("col-md-9", "ms-sm-auto", "col-lg-10");
  } else {
    sidebar.style.display = "none";
    mainContent.classList.remove("col-md-9", "ms-sm-auto", "col-lg-10");
    mainContent.classList.add("col-12");
  }
}