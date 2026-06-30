// ===============================
// MODERATOR LOGIN GUARD
// ===============================


const token = sessionStorage.getItem("token");
const roles = JSON.parse(sessionStorage.getItem("roles") || "[]");

if (!token || !roles.includes("moderator")) {
    window.location.href = "home.html";
}



// ===============================
// GLOBAL STATE
// ===============================
let currentStatus = "Pending";

// ===============================
// INIT
// ===============================
window.onload = function () {
    bindTabs();
    loadModeratorData();

};

// ===============================
// TAB HANDLING
// ===============================
function bindTabs() {
    const tabs = document.querySelectorAll(".mod-tab");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            currentStatus = tab.dataset.status;
            loadModeratorData();
        });
    });
}

// ===============================
// FILTER CHANGE
// ===============================
document.getElementById("areaFilter")?.addEventListener("change", loadModeratorData);
document.getElementById("fromDate")?.addEventListener("change", loadModeratorData);
document.getElementById("toDate")?.addEventListener("change", loadModeratorData);


// ===============================
// LOAD DATA (NEW API)
// ===============================
function loadModeratorData() {

    const area = document.getElementById("areaFilter")?.value || "";
    const from = document.getElementById("fromDate")?.value || "";
    const to = document.getElementById("toDate")?.value || "";

    let url = `http://localhost:3000/api/moderator/solutions?status=${currentStatus}`;
    

    if (area) url += `&area=${encodeURIComponent(area)}`;
    if (from && to) url += `&from=${from}&to=${to}`;

    fetch(url, {headers: {
        "Authorization": sessionStorage.getItem("token")}
    })
        .then(res => res.json())
        .then(data => renderTable(data))
        .catch(err => console.log("MODERATOR LOAD ERROR:", err));
}

// ===============================
// RENDER TABLE (OLD STYLE)
// ===============================
function renderTable(data) {

    const table = document.getElementById("modTableBody");
    table.innerHTML = "";

    if (!data || data.length === 0) {
        table.innerHTML = "<tr><td colspan='6'>No records found</td></tr>";
        return;
    }

    data.forEach(item => {

        const row = document.createElement("tr");



        let actionButtons = `
        <div class="action-group">
     <button class="btn read-btn" onclick="openViewer(${item.id})">Read</button>

       `;

        if (currentStatus === "Pending") {
            actionButtons += `
        <button class="btn approve-btn" onclick="approveSolution(${item.id})">
            Approve
        </button>
        <button class="btn reject-btn" onclick="rejectSolution(${item.id})">
            Reject
        </button>
    `;
        }

        actionButtons += `</div>`;

        let rejectText = "-";

        if (currentStatus === "Rejected" && item.reject_reason) {
            rejectText = item.reject_reason;
        }

        row.innerHTML = `
         <td>${item.title}</td>
         <td>${item.area || "-"}</td>
         <td>${item.employee}</td>
         <td>${item.status}</td>
         <td>${new Date(item.updated_at || item.created_at).toLocaleDateString()}</td>
         <td>${actionButtons}</td>
         <td>${rejectText}</td>
        `;


        table.appendChild(row);
    });
    toggleRejectColumn(currentStatus);

}


function openViewer(id) {
    // 🔥 SAME VIEWER PAGE
    window.location.href = `viewer.html?id=${id}&from=moderator`;
}


// ===============================
// APPROVE (UNCHANGED)
// ===============================
function approveSolution(id) {
    fetch(`http://localhost:3000/api/moderator/approve/${id}`, {

        method: "PUT",
         headers: {
        "Authorization": sessionStorage.getItem("token")
    }
    })
        .then(res => res.json())
        .then(() => {
            alert("Approved!");
            loadModeratorData();
        });
}


function toggleRejectColumn(status) {

    const table = document.querySelector(".data-table");
    if (!table) return;

    // 🔍 find Reject Reason column index dynamically
    const headerCells = table.querySelectorAll("thead th");
    let rejectColIndex = -1;

    headerCells.forEach((th, index) => {
        if (th.innerText.trim().toLowerCase() === "reject reason") {
            rejectColIndex = index;
        }
    });

    if (rejectColIndex === -1) return;

    // ✅ toggle header
    headerCells[rejectColIndex].style.display =
        status === "Rejected" ? "" : "none";

    // ✅ toggle body cells
    table.querySelectorAll("tbody tr").forEach(row => {
        if (row.children[rejectColIndex]) {
            row.children[rejectColIndex].style.display =
                status === "Rejected" ? "" : "none";
        }
    });
}



// ===============================
// REJECT (UNCHANGED)
// ===============================

function rejectSolution(id) {

    const reason = prompt("Enter rejection reason:");
    if (!reason || reason.trim() === "") {
        alert("Rejection reason required");
        return;
    }

    fetch(`http://localhost:3000/api/moderator/reject/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" ,
            "Authorization": sessionStorage.getItem("token")
        },
        body: JSON.stringify({ reason: reason.trim() })
    })
        .then(res => res.json())
        .then(() => {
            alert("Rejected successfully");
            loadModeratorData();
        });
}

// ===============================
// READ / VIEW (OLD LOGIC REUSED)
// ===============================
function readSolution(id) {

    fetch(`http://localhost:3000/api/moderator/solutions?status=${currentStatus}`)
        .then(res => res.json())
        .then(data => {

            const item = data.find(x => x.id === id);
            if (!item) return;

            const img = document.getElementById("mImage");
            const pdfBox = document.getElementById("pdfBox");
            const pdfLink = document.getElementById("pdfLink");

            img.style.display = "none";
            pdfBox.style.display = "none";

            if (item.image) {
                img.src = `http://localhost:3000/uploads/${item.image}`;
                img.onerror = () => img.src = "public/placeholder.png";
                img.style.display = "block";
            }

            if (item.pdf_file) {
                pdfLink.href = `http://localhost:3000/uploads/${item.pdf_file}`;
                pdfLink.innerText = "Open PDF";
                pdfBox.style.display = "block";
            }

            document.getElementById("mTitle").innerText = item.title;
            document.getElementById("mArea").innerText = item.area;
            document.getElementById("mDesc").innerText =
                item.description +
                (item.reject_reason ? `\n\nReason: ${item.reject_reason}` : "");
            document.getElementById("mDate").innerText =
                new Date(item.created_at).toLocaleDateString();

            document.getElementById("viewModal").style.display = "block";
        });
}




// ===============================
// CLOSE MODAL
// ===============================
function closeModal() {
    document.getElementById("viewModal").style.display = "none";
}
