/******** DUPLICATE SCRIPT BLOCKER ********/
if (window.__APP_LOADED__) {
  throw new Error("script.js loaded twice");
}
window.__APP_LOADED__ = true;

/******** GLOBAL ELEMENTS ********/
const gstSection = document.getElementById("gstSection");
const itSection = document.getElementById("itSection");
const localSection = document.getElementById("localSection");

const gstModal = document.getElementById("gstModal");
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

/******** SECTION SWITCH ********/
function showSection(type) {
  gstSection.style.display = type === "gst" ? "block" : "none";
  itSection.style.display = type === "it" ? "block" : "none";
  localSection.style.display = type === "local" ? "block" : "none";
}

/******** SECTION SWITCH ********/
function showSection(type) {
  gstSection.style.display = type === "gst" ? "block" : "none";
  itSection.style.display = type === "it" ? "block" : "none";
  localSection.style.display = type === "local" ? "block" : "none";
}

/******** GST CLIENTS ********/
let gstClients = [];
let editIndex = null;

fetchGST();

/******** MONTH RESTRICTION ********/
function restrictPastMonths() {
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;

  [...gstMonth.options].forEach((opt) => {
    if (opt.value && opt.value < currentMonth) {
      opt.disabled = true;
    }
  });
}

/******** OPEN MODAL ********/
function openGSTModal(index = null) {
  gstModal.style.display = "flex";
  editIndex = index;
  restrictPastMonths();

  if (index !== null) {
    const c = gstClients[index];
    gstName.value = c.name;
    gstContact.value = c.contact;
    gstFirmCount.value = c.firms;
    gstIn.value = c.gstin;
    gstPortalId.value = c.portalId;
    gstPortalPass.type = "text";
    gstPortalPass.value = c.portalPass;

    gstOtherId.value = c.otherId || "";
    gstOtherPass.value = c.otherPass || "";

    gstMonth.value = c.month;
    gstFees.value = c.fees;
  }
}

/******** CLOSE MODAL ********/
function closeGSTModal() {
  gstModal.style.display = "none";
  editIndex = null;
  document
    .querySelectorAll("#gstModal input, #gstModal select")
    .forEach((el) => (el.value = ""));
}

/******** SAVE GST ********/
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
    orderIndex: Date.now(), // 🔥 IMPORTANT
  };

  if (!client.name || !client.gstin || !client.month) {
    alert("Client Name, GSTIN & Month required");
    return;
  }

  if (editIndex !== null) {
    const id = gstClients[editIndex].id;
    await db
      .collection("gstClients")
      .doc(id)
      .set({
        ...client,
        orderIndex: gstClients[editIndex].orderIndex, // preserve order
      });
  } else {
    await db.collection("gstClients").add(client);
  }

  closeGSTModal();
};

/******** RENDER TABLE ********/
function renderGST() {
  gstTable.innerHTML = "";

  gstClients.forEach((c, i) => {
    gstTable.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${c.name}</td>
        <td>${c.contact}</td>
        <td>${c.firms}</td>
        <td>${c.gstin}</td>
        <td>${c.portalId}</td>
        <td>${c.portalPass}</td>
        <td>${c.otherId || ""}</td>
        <td>${c.otherPass || ""}</td>
        <td>${formatMonth(c.month)}</td>

        <td>
          <select data-type="gstr1" onchange="updateStatus(event, ${i})">
            <option value="Pending" ${
              c.gstr1 === "Pending" ? "selected" : ""
            }>Pending</option>
            <option value="Filed" ${
              c.gstr1 === "Filed" ? "selected" : ""
            }>Filed</option>
          </select>
          ${
            c.gstr1 === "Filed"
              ? `<span onclick="sendWhatsApp('${c.contact}','gstr1')"> 💬</span>`
              : ""
          }
        </td>

        <td>
          <select data-type="gstr3b" onchange="updateStatus(event, ${i})">
            <option value="Pending" ${
              c.gstr3b === "Pending" ? "selected" : ""
            }>Pending</option>
            <option value="Filed" ${
              c.gstr3b === "Filed" ? "selected" : ""
            }>Filed</option>
          </select>
          ${
            c.gstr3b === "Filed"
              ? `<span onclick="sendWhatsApp('${c.contact}','gstr3b')"> 💬</span>`
              : ""
          }
        </td>

        <td>₹${c.fees}</td>
        <td>
          <span onclick="openGSTModal(${i})">✏️</span>
          &nbsp;
          <span onclick="deleteGST(${i})">🗑️</span>
        </td>
      </tr>
    `;
  });
}

/******** DELETE ********/
async function deleteGST(index) {
  if (!confirm("Delete this GST client?")) return;
  const id = gstClients[index].id;
  await db.collection("gstClients").doc(id).delete();
}

/******** FETCH ********/
function fetchGST() {
  db.collection("gstClients")
    .orderBy("orderIndex")
    .onSnapshot((snapshot) => {
      gstClients = [];
      snapshot.forEach((doc) => {
        gstClients.push({ id: doc.id, ...doc.data() });
      });
      renderGST();
    });
}

renderGST();

/******** LOGIN / REGISTER / PROFILE ********/
const profileIcon = document.getElementById("profileIcon");
const profileDropdown = document.getElementById("profileDropdown");
const editProfileModal = document.getElementById("editProfileModal");
const editName = document.getElementById("editName");
const editImage = document.getElementById("editImage");
const previewImage = document.getElementById("previewImage");
const topbarName = document.getElementById("topbarName");

let loggedInEmail = localStorage.getItem("loggedInEmail");
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = users.find((u) => u.email === loggedInEmail);

if (currentUser) {
  topbarName.textContent = currentUser.name;
  if (currentUser.image) profileIcon.src = currentUser.image;
}

// Profile dropdown toggle
profileIcon.addEventListener("click", (e) => {
  e.stopPropagation();
  profileDropdown.style.display =
    profileDropdown.style.display === "block" ? "none" : "block";
});

// Close dropdown if clicked outside
document.addEventListener("click", () => {
  profileDropdown.style.display = "none";
});

// Open edit profile modal
function openEditProfile() {
  if (!currentUser) return alert("No user logged in");
  editName.value = currentUser.name || "";
  previewImage.src = currentUser.image || profileIcon.src;
  editProfileModal.style.display = "flex";
}

function closeEditProfile() {
  editProfileModal.style.display = "none";
}

editImage.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

function saveProfile() {
  const newName = editName.value.trim();
  const newImage = previewImage.src;
  if (!newName) return alert("Name cannot be empty");

  currentUser.name = newName;
  currentUser.image = newImage;

  users = users.map((u) => (u.email === currentUser.email ? currentUser : u));
  localStorage.setItem("users", JSON.stringify(users));

  topbarName.textContent = currentUser.name;
  profileIcon.src = currentUser.image;

  closeEditProfile();
  alert("Profile updated successfully");
}

// Logout
function logout() {
  localStorage.removeItem("loggedInEmail");
  window.location.href = "index.html";
}

/******** PASSWORD TOGGLE FUNCTIONS ********/
function toggleRegisterPassword() {
  const passInput = document.getElementById("password");
  const eyeIcon = document.getElementById("registerEye");
  if (passInput.type === "password") {
    passInput.type = "text";
    eyeIcon.textContent = "🙈";
  } else {
    passInput.type = "password";
    eyeIcon.textContent = "👁️";
  }
}

function toggleLoginPassword() {
  const passInput = document.getElementById("loginPassword");
  const eyeIcon = document.getElementById("loginEye");
  if (passInput.type === "password") {
    passInput.type = "text";
    eyeIcon.textContent = "🙈";
  } else {
    passInput.type = "password";
    eyeIcon.textContent = "👁️";
  }
}

/******** REGISTER FUNCTION ********/
function register() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = "";
  messageDiv.classList.remove("success");

  if (!name) {
    messageDiv.textContent = "Name is required";
    return;
  }
  if (!email) {
    messageDiv.textContent = "Email is required";
    return;
  }
  if (!password) {
    messageDiv.textContent = "Password is required";
    return;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    messageDiv.textContent =
      "Password must be at least 8 characters, include uppercase, lowercase, number, and special character";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.find((u) => u.email === email)) {
    messageDiv.textContent = "User already registered with this email";
    return;
  }

  users.push({ name, email, password });
  localStorage.setItem("users", JSON.stringify(users));

  messageDiv.textContent = "Registration successful!";
  messageDiv.classList.add("success");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 2000);
}

/******** LOGIN FUNCTION ********/
function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const messageDiv = document.getElementById("loginMessage");
  messageDiv.textContent = "";
  messageDiv.classList.remove("success");

  if (!email) {
    messageDiv.textContent = "Email is required";
    return;
  }
  if (!password) {
    messageDiv.textContent = "Password is required";
    return;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    messageDiv.textContent =
      "Password must be at least 8 characters, include uppercase, lowercase, number, and special character";
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem("loggedInEmail", user.email);
    messageDiv.textContent = `Welcome, ${user.name}!`;
    messageDiv.classList.add("success");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2000);
  } else {
    messageDiv.textContent = "Invalid email or password";
  }
}

/******** UPDATE STATUS ********/
async function updateStatus(event, index) {
  const type = event.target.dataset.type; // gstr1 / gstr3b
  const value = event.target.value;

  if (!gstClients[index]) {
    console.error("Invalid index:", index);
    return;
  }

  const client = gstClients[index];

  // update local
  client[type] = value;

  // update firebase
  await db
    .collection("gstClients")
    .doc(client.id)
    .update({
      [type]: value,
    });

  // 🔥 NEXT MONTH LOGIC (duplicate safe)
  if (
    client.gstr1 === "Filed" &&
    client.gstr3b === "Filed" &&
    client.nextGenerated !== true
  ) {
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
      orderIndex: (client.orderIndex || 0) + 1,
    };

    await db.collection("gstClients").add(newClient);

    await db.collection("gstClients").doc(client.id).update({
      nextGenerated: true,
    });
  }

  renderGST(); // refresh UI
}

function formatMonth(month) {
  if (!month) return "";

  // YYYY-MM → sirf month name
  if (month.includes("-")) {
    const [, m] = month.split("-");
    return getMonthName(m);
  }

  // old data like "December"
  return month;
}

function getMonthName(m) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[Number(m) - 1] || "";
}

/******** NEXT MONTH ********/
function getNextMonth(monthStr) {
  if (!monthStr) return "";

  // agar old month name ho
  if (!monthStr.includes("-")) {
    const map = {
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12,
    };

    const m = map[monthStr];
    if (!m) return "";

    const y = new Date().getFullYear();
    const d = new Date(y, m - 1);
    d.setMonth(d.getMonth() + 1);

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  // normal YYYY-MM
  const [y, m] = monthStr.split("-").map(Number);
  const d = new Date(y, m - 1);
  d.setMonth(d.getMonth() + 1);

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/******** WHATSAPP ********/
function sendWhatsApp(mobile, type) {
  let phone = mobile.replace(/\D/g, "");
  if (phone.length === 10) phone = "91" + phone;

  let msg =
    type === "gstr1"
      ? "Dear Sir,\nApki GST R1 file ho chuki hai.\nThank you.\nRolen & Associates"
      : "Dear Sir,\nApki GST GSTR-3B file ho chuki hai.\nThank you.\nRolen & Associates";

  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}
document.querySelectorAll(".sidebar button").forEach(btn => {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".sidebar button")
      .forEach(b => b.classList.remove("active"));
    this.classList.add("active");
  });
});
