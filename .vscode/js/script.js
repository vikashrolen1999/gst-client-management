/******** DUPLICATE SCRIPT BLOCKER ********/
if (window.__APP_LOADED__) {
  throw new Error("script.js loaded twice");
}
window.__APP_LOADED__ = true;

/******** SECTION SWITCH ********/
function showSection(type) {
  gstSection.style.display = type === "gst" ? "block" : "none";
  itSection.style.display = type === "it" ? "block" : "none";
  localSection.style.display = type === "local" ? "block" : "none";
}

/* ================= GST CLIENTS ================= */

let gstClients = JSON.parse(localStorage.getItem("gstClients")) || [];

function openGSTModal() {
  gstModal.style.display = "flex";
}
function closeGSTModal() {
  gstModal.style.display = "none";
}

saveGSTBtn.onclick = () => {
  const name = gstName.value.trim();
  const gst = gstNo.value.trim();

  if (!name || !gst) {
    alert("Client Name & GST Number required");
    return;
  }

  gstClients.push({
    name,
    gst,
    months: {
      Jan: { gstr1: "Pending", gstr3b: "Pending" }
    }
  });

  localStorage.setItem("gstClients", JSON.stringify(gstClients));
  renderGST();
  closeGSTModal();

  gstName.value = gstNo.value = "";
};

function renderGST() {
  gstTable.innerHTML = "";

  gstClients.forEach((c, i) => {
    gstTable.innerHTML += `
      <tr>
        <td>${c.name}</td>
        <td>Jan</td>
        <td>${c.months.Jan.gstr1}</td>
        <td>${c.months.Jan.gstr3b}</td>
        <td>
          <button onclick="deleteGST(${i})">Delete</button>
        </td>
      </tr>
    `;
  });
}

function deleteGST(i) {
  gstClients.splice(i, 1);
  localStorage.setItem("gstClients", JSON.stringify(gstClients));
  renderGST();
}

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
