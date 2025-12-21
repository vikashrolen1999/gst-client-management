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

  if (index !== null) {
    const c = gstClients[index];
    gstName.value = c.name;
    gstContact.value = c.contact;
    gstFirmCount.value = c.firms;
    gstIn.value = c.gstin;
    gstPortalId.value = c.portalId;
    gstPortalPass.value = c.portalPass;
    gstMonth.value = c.month;
    gstFees.value = c.fees;
  }
}

function closeGSTModal() {
  gstModal.style.display = "none";
  editIndex = null;
  document.querySelectorAll("#gstModal input, #gstModal select")
    .forEach(el => el.value = "");
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
    fees: gstFees.value.trim()
  };

  if (!client.name || !client.gstin || !client.month) {
    alert("Client Name, GSTIN & Month required");
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
        <td>******</td>
        <td>${c.month}</td>
        <td>${c.gstr1}</td>
        <td>${c.gstr3b}</td>
        <td>₹${c.fees}</td>
        <td>
          <span onclick="openGSTModal(${i})" style="cursor:pointer">✏️</span>
          &nbsp;
          <span onclick="deleteGST(${i})" style="cursor:pointer">🗑️</span>
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
    status: "Pending"
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
