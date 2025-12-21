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

/******** SECTION SWITCH ********/
function showSection(type) {
  gstSection.style.display = type === "gst" ? "block" : "none";
  itSection.style.display = type === "it" ? "block" : "none";
  localSection.style.display = type === "local" ? "block" : "none";
}

/* ================= GST CLIENTS ================= */

let gstClients = JSON.parse(localStorage.getItem("gstClients")) || [];
let editIndex = null;

/******** MODAL ********/
function openGSTModal(index = null) {
  gstModal.style.display = "flex";
  editIndex = index;

  restrictPastMonths(); // 🔥 added

  if (index !== null) {
    const c = gstClients[index];
    gstName.value = c.name;
    gstContact.value = c.contact;
    gstFirmCount.value = c.firms;
    gstIn.value = c.gstin;
    gstPortalId.value = c.portalId;
    gstPortalPass.type = "text";
    gstPortalPass.value = c.portalPass;
    gstMonth.value = c.month;
    gstFees.value = c.fees;
  }
}

function closeGSTModal() {
  gstModal.style.display = "none";
  editIndex = null;
  document
    .querySelectorAll("#gstModal input, #gstModal select")
    .forEach((el) => (el.value = ""));
}

/******** SAVE ********/
saveGSTBtn.onclick = () => {
  const client = {
    name: gstName.value.trim(),
    contact: gstContact.value.trim(),
    firms: gstFirmCount.value.trim(),
    gstin: gstIn.value.trim(),
    portalId: gstPortalId.value.trim(),
    portalPass: gstPortalPass.value.trim(),
    month: gstMonth.value,
    gstr1: "Pending",
    gstr3b: "Pending",
    fees: gstFees.value.trim(),
  };

  if (!client.name || !client.gstin || !client.month) {
    alert("Client Name, GSTIN & Month required");
    return;
  }
  if (client.name.length > 20) {
    alert("Client Name cannot exceed 20 characters");
    return;
  }
  if (editIndex !== null) {
    gstClients[editIndex] = client;
  } else {
    gstClients.push(client);
  }

  localStorage.setItem("gstClients", JSON.stringify(gstClients));
  renderGST();
  closeGSTModal();
};

/******** RENDER ********/
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
        <td>${c.month}</td>
 

        <!-- GSTR-1 -->
      <td>
  <select data-type="gstr1" onchange="updateStatus(event, ${i})">
    <option value="Pending" ${
      c.gstr1 === "Pending" ? "selected" : ""
    }>Pending</option>
    <option value="Filed" ${
      c.gstr1 === "Filed" ? "selected" : ""
    }>Filed</option>
  </select>
  &nbsp;<span onclick="sendWhatsApp('${c.contact}', 'gstr1')">💬</span>
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
  &nbsp;<span onclick="sendWhatsApp('${c.contact}', 'gstr3b')">💬</span>
</td>


        <td>₹${c.fees}</td>
        <td style="display: flex; padding-top: 2rem;">
          <span onclick="openGSTModal(${i})">✏️</span>
          &nbsp;
          <span onclick="deleteGST(${i})">🗑️</span>
        </td>
      </tr>
    `;
  });
}

/******** DELETE ********/
function deleteGST(index) {
  if (!confirm("Delete this GST client?")) return;
  gstClients.splice(index, 1);
  localStorage.setItem("gstClients", JSON.stringify(gstClients));
  renderGST();
}

/******** INIT ********/
renderGST();

/* ================= INCOME TAX CLIENTS ================= */

let itClients = JSON.parse(localStorage.getItem("itClients")) || [];

openITModal.onclick = () => {
  itModal.style.display = "flex";
};

closeITModal.onclick = () => {
  itModal.style.display = "none";
};

saveITClient.onclick = () => {
  const name = itClientName.value.trim();
  const pan = itClientPAN.value.trim();
  const ay = itAssessmentYear.value.trim();

  if (!name || !pan || !ay) {
    alert("All fields required");
    return;
  }

  itClients.push({
    name,
    pan,
    ay,
    status: "Pending",
  });

  localStorage.setItem("itClients", JSON.stringify(itClients));
  renderIT();

  itModal.style.display = "none";
  itClientName.value = itClientPAN.value = itAssessmentYear.value = "";
};

function renderIT() {
  itTableBody.innerHTML = "";

  if (itClients.length === 0) {
    itTableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="5">No Income Tax Clients added yet</td>
      </tr>`;
    return;
  }

  itClients.forEach((c, i) => {
    itTableBody.innerHTML += `
      <tr>
        <td>${c.name}</td>
        <td>${c.pan}</td>
        <td>${c.ay}</td>
        <td>${c.status}</td>
        <td>
          <button onclick="deleteIT(${i})">Delete</button>
        </td>
      </tr>
    `;
  });
}

function deleteIT(i) {
  itClients.splice(i, 1);
  localStorage.setItem("itClients", JSON.stringify(itClients));
  renderIT();
}

renderIT();
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

function updateStatus(e, index) {
  const type = e.target.dataset.type;
  const value = e.target.value;

  gstClients[index][type] = value;
  const client = gstClients[index];

  if (client.gstr1 === "Filed" && client.gstr3b === "Filed") {
    const currentMonthIndex = months.indexOf(client.month?.trim());
    if (currentMonthIndex === -1) return;

    const nextMonthIndex = currentMonthIndex === 11 ? 0 : currentMonthIndex + 1;

    const nextMonth = months[nextMonthIndex];

    const exists = gstClients.some(
      (c) =>
        c.gstin === client.gstin &&
        c.name === client.name &&
        c.month === nextMonth
    );

    if (!exists) {
      gstClients.push({
        name: client.name,
        contact: client.contact,
        firms: client.firms || "",
        gstin: client.gstin,
        portalId: client.portalId,
        portalPass: client.portalPass,
        month: nextMonth,
        gstr1: "Pending",
        gstr3b: "Pending",
        fees: client.fees,
      });
    }
  }

  localStorage.setItem("gstClients", JSON.stringify(gstClients));
  renderGST();
}

function restrictPastMonths() {
  const currentMonthIndex = new Date().getMonth();

  [...gstMonth.options].forEach((opt, index) => {
    if (index === 0) return; // Select Month
    opt.disabled = index - 1 < currentMonthIndex;
  });
}

function sendWhatsApp(contact, type) {
  if (!contact) {
    alert("Client contact number not available");
    return;
  }

  const mobile = contact.replace(/\D/g, "");

  let message = "";

  if (type === "gstr1") {
    message =
      "Dear Sir,\nApki GST R1 file ho chuki hai.\nThank you.\nRolen & Associates";
  } else if (type === "gstr3b") {
    message =
      "Dear Sir,\nApki GST GSTR-3B file ho chuki hai.\nThank you.\nRolen & Associates";
  } else {
    message = "Hello";
  }

  const url = `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

const togglePass = document.getElementById("togglePass");
togglePass.onclick = () => {
  if (gstPortalPass.type === "password") {
    gstPortalPass.type = "text";
    togglePass.textContent = "🙈";
  } else {
    gstPortalPass.type = "password";
    togglePass.textContent = "👁️";
  }
};

const profileIcon = document.getElementById("profileIcon");
const profileDropdown = document.getElementById("profileDropdown");

profileIcon.onclick = (e) => {
  e.stopPropagation();
  profileDropdown.style.display =
    profileDropdown.style.display === "block" ? "none" : "block";
};

document.onclick = () => {
  profileDropdown.style.display = "none";
};

function logout() {
  alert("Logout successful");
  localStorage.clear();

  // index.html par redirect
  window.location.href = "index.html";
}
profileIcon.style.width = "30px";
profileIcon.style.height = "30px";
profileIcon.style.borderRadius = "50%";

function register() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Validation
  if (!name || !email || !password) {
    alert("All fields are required");
    return;
  }

  // Get existing users
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // Check if email already exists
  const userExists = users.find((user) => user.email === email);
  if (userExists) {
    alert("User already registered with this email");
    return;
  }

  // Save new user
  users.push({
    name: name,
    email: email,
    password: password,
  });

  localStorage.setItem("users", JSON.stringify(users));

  alert("Registration successful");

  // Redirect to login page
  window.location.href = "index.html";
}

const otherPassInput = document.getElementById("otherPass");
const toggleOtherPass = document.getElementById("toggleOtherPass");

toggleOtherPass.onclick = () => {
  if (otherPassInput.type === "password") {
    otherPassInput.type = "text";
    toggleOtherPass.textContent = "🙈";
  } else {
    otherPassInput.type = "password";
    toggleOtherPass.textContent = "👁️";
  }
};
