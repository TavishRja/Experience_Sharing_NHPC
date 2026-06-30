
const token = sessionStorage.getItem("token");
const roles = JSON.parse(sessionStorage.getItem("roles") || "[]");

// Navbar elements
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const dashboardLink = document.getElementById("dashboardLink");
const moderatorLink = document.getElementById("modLink");

// ===============================
// LOGIN STATE HANDLE
// ===============================

if (token) {

    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline";
    if (dashboardLink) dashboardLink.style.display = "inline";

    if (roles.includes("moderator")) {
        if (moderatorLink) moderatorLink.style.display = "inline";
    }

} else {

    if (loginBtn) loginBtn.style.display = "inline";
    if (logoutBtn) logoutBtn.style.display = "none";
}


let allSolutions = [];
let currentView = "grid";
let searchText = "";

if (roles.includes("moderator")) {
    document.getElementById("modLink").style.display = "inline";
}

window.onload = () => {
    fetchApprovedSolutions();
};

function fetchApprovedSolutions() {
    fetch("http://localhost:3000/api/solutions/approved")
        .then(res => res.json())
        .then(data => {
            allSolutions = data;
            renderSolutions();
        });
}

function handleSearch() {
    searchText = document.getElementById("searchInput").value.toLowerCase();
    renderSolutions();
}

function setView(view) {
    currentView = view;
    renderSolutions();
}

function renderSolutions() {

    const container = document.getElementById("solutionContainer");
    container.className = currentView === "grid" ? "grid-view" : "list-view";
    container.innerHTML = "";

    const filtered = allSolutions.filter(s =>
        s.title.toLowerCase().includes(searchText)
    );

    if (filtered.length === 0) {
        container.innerHTML = "<p>No results found</p>";
        return;
    }

    filtered.forEach(item => {
        const div = document.createElement("div");

        if (currentView === "grid") {
            div.className = "solution-card";
            div.innerHTML = `
                <img src="http://localhost:3000/uploads/${item.image}">
                <h4>${item.title}</h4>
                <p>${item.area}</p>
                <p class="meta">👁 ${item.views || 0}</p>
                 
            `;
        } else {
            div.className = "solution-card solution-row";
            div.innerHTML = `
                 <img src="http://localhost:3000/uploads/${item.image}">
                 <div>
                 <h4>${item.title}</h4>
                 <p>${item.description.slice(0, 120)}...</p>
                 <p class="meta">👁 ${item.views || 0}</p>
                 </div>
                 `;

        }

        // 🔥 Future viewer page hook

        div.onclick = () => {

            const user = sessionStorage.getItem("loggedInUser");

            // ❌ Not logged in
            if (!user) {
                // jis document pe click hua usko save kar lo
                sessionStorage.setItem(
                    "redirectAfterLogin",
                    `viewer.html?id=${item.id}`
                );

                window.location.href = "login.html";
                return;
            }

            // ✅ Logged in
            window.location.href = `viewer.html?id=${item.id}`;
        };



        container.appendChild(div);
    });
}


function logoutUser() {
    sessionStorage.clear();
    window.location.href = "home.html";
}