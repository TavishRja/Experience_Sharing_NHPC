
// ===============================
// LOGIN GUARD (FIXED)
// ===============================

const token = sessionStorage.getItem("token");
const roles = JSON.parse(sessionStorage.getItem("roles") || "[]");

if (!token) {
    window.location.href = "login.html";
}

// ===============================
// GLOBALS
// ===============================
const EMP_ID = "EMP102";
let allSubmissions = [];


// ===============================
// LOGOUT
// ===============================


// function logoutUser() {
//     localStorage.removeItem("loggedInUser");
//     window.location.href = "home.html";
// }

function logoutUser() {
    sessionStorage.clear();
    window.location.href = "home.html";
}



// ===============================
// LOAD DRAFTS
// ===============================
function loadDrafts() {
    fetch(`http://localhost:3000/api/solutions/employee/${EMP_ID}/drafts`, {
        headers: {
            "Authorization": sessionStorage.getItem("token")
        }
    })
        .then(res => res.json())
        .then(data => {

            const table = document.getElementById("draftTable");
            table.innerHTML = "";

            if (!data || data.length === 0) {
                table.innerHTML = "<tr><td colspan='4'>No drafts found</td></tr>";
                return;
            }

            data.forEach(d => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${d.title}</td>
                    <td>${new Date(d.updated_at).toLocaleDateString()}</td>
                    <td>
                        <button onclick="editDraft(${d.id})">Edit</button>
                    </td>
                    <td>
                        <button onclick="deleteDraft(${d.id})">Delete</button>
                    </td>
                `;
                table.appendChild(row);
            });
        })
        .catch(err => console.log("DRAFT LOAD ERROR:", err));
}


function editDraft(id) {
    window.location.href = `upload.html?draftId=${id}`;
}


function deleteDraft(id) {
    if (!confirm("Delete this draft?")) return;
    fetch(`http://localhost:3000/api/solutions/${id}/draft`, {
        method: "DELETE",
        headers: {
            "Authorization": sessionStorage.getItem("token")
        }
    })
        .then(() => loadDrafts())
        .catch(err => console.log("DELETE ERROR:", err));
}


// ===============================
// LOAD SUBMISSIONS (MAIN TABLE)
// ===============================
function loadSubmissions() {
    fetch(`http://localhost:3000/api/solutions/employee/${EMP_ID}`, {
        headers: {
            "Authorization": sessionStorage.getItem("token")
        }
    })
        .then(res => res.json())
        .then(data => {
            allSubmissions = data;
            renderEmployeeTable(data);
        })
        .catch(err => {
            console.log("SUBMISSION LOAD ERROR:", err);
            alert("Failed to load submissions");
        });
}


// ===============================
// RENDER SUBMISSION TABLE
// ===============================
function renderEmployeeTable(data) {

    const table = document.getElementById("tableBody");
    table.innerHTML = "";

    if (!data || data.length === 0) {
        table.innerHTML = "<tr><td colspan='6'>No submissions found</td></tr>";
        return;
    }


    // 🔥 SORT BY DATE (LATEST FIRST)
    data.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at);
        const dateB = new Date(b.updated_at || b.created_at);
        return dateB - dateA;   // latest first

    });


    data.forEach(item => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.title}</td>
            <td>${item.area}</td>
            <td>${item.employee}</td>

            <td class="${item.status === 'Approved' ? 'approved' : 'pending'}">
                ${item.status}
            </td>

            <td>
                ${item.updated_at
                ? new Date(item.updated_at).toLocaleDateString()
                : new Date(item.created_at).toLocaleDateString()}
            </td>

            <td>
              <button onclick="openViewer(${item.id})">View</button>

            </td>
        `;

        table.appendChild(row);
    });
}


function openViewer(id) {
    window.location.href = `viewer.html?id=${id}`;
}

// ===============================
// FILTERS (AREA + DATE)
// ===============================
function applyFilters() {

    const area = document.getElementById("areaFilter").value;
    const from = document.getElementById("fromDate").value;
    const to = document.getElementById("toDate").value;

    let filtered = allSubmissions;

    if (area) {
        filtered = filtered.filter(item => item.area === area);
    }

    if (from) {
        filtered = filtered.filter(item =>
            new Date(item.created_at) >= new Date(from)
        );
    }

    if (to) {
        filtered = filtered.filter(item =>
            new Date(item.created_at) <= new Date(to)
        );
    }

    renderEmployeeTable(filtered);
}


// ===============================
// VIEW MODAL
// ===============================
function viewSolution(id) {

    const item = allSubmissions.find(x => x.id === id);
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
    document.getElementById("mDesc").innerText = item.description;
    document.getElementById("mStatus").innerText = item.status;
    document.getElementById("mDate").innerText =
        new Date(item.created_at).toLocaleDateString();

    if (item.status === "Rejected") {
        document.getElementById("mDesc").innerText +=
            "\n\nReason: " + item.reject_reason;
    }

    document.getElementById("viewModal").style.display = "block";
}


// ===============================
// CLOSE MODAL
// ===============================
function closeModal() {
    document.getElementById("viewModal").style.display = "none";
}


// ===============================
// INIT
// ===============================
window.onload = function () {
    loadDrafts();
    loadSubmissions();

    // filter bindings
    document.getElementById("areaFilter")?.addEventListener("change", applyFilters);
    document.getElementById("fromDate")?.addEventListener("change", applyFilters);
    document.getElementById("toDate")?.addEventListener("change", applyFilters);
}
