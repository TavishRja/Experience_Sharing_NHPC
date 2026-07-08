document.addEventListener("DOMContentLoaded", function(){
  const params = new URLSearchParams(window.location.search);
const solutionId = params.get("id");
const id = params.get("id");

if (!id) {
  alert("Invalid document");
  window.location.href = "home.html";
}

// ===============================
// LOAD DOCUMENT
// ===============================
function loadSolution(){
  fetch(`http://localhost:3000/api/solutions/${id}`)
  .then(res => res.json())
  .then(item => {

    // BASIC INFO
    document.getElementById("vTitle").innerText = item.title;
    document.getElementById("vArea").innerText = item.area;
    document.getElementById("vAuthor").innerText = item.employee;
    document.getElementById("vDesc").innerText = item.description;
    document.getElementById("vDate").innerText =
      new Date(item.created_at).toLocaleDateString();

    document.getElementById("vViews").innerText = item.views || 0;
    document.getElementById("likeCount").innerText = item.likes || 0;
    document.getElementById("dislikeCount").innerText = item.dislikes || 0;

    // PDF
    if (item.pdf_file) {
      const pdfUrl = `http://localhost:3000/uploads/${item.pdf_file}`;
      document.getElementById("pdfFrame").src = pdfUrl;
      document.getElementById("pdfDownload").href = pdfUrl;
    }

    // ===============================
    // STATUS BASED LOGIC 🔥
    // ===============================
    if (item.status === "Approved") {
      incrementView();
    } else {
      disablePublicActions(item.status);
    }
  })
  .catch(() => {
    alert("Failed to load document");
    window.location.href = "home.html";
  });

}

// ===============================
// INCREMENT VIEW (APPROVED ONLY)
// ===============================
function incrementView() {
  fetch(`http://localhost:3000/api/solutions/${id}/view`, {
    method: "POST"
  });
}


// ===============================
// DISABLE PUBLIC ACTIONS
// ===============================
function disablePublicActions(status) {

  if (!sessionStorage.getItem("token")) {
    document.getElementById("likeBtn").style.display = "none";
    document.getElementById("dislikeBtn").style.display = "none";
  }
  document.getElementById("pdfDownload").style.display = "none";

  const viewText = document.getElementById("vViews");

  if (status === "Pending") {
    viewText.innerText = "Visible after approval";
  }

  if (status === "Rejected") {
    viewText.innerText = "Rejected document";
  }
}


// ===============================
// LIKE / DISLIKE (APPROVED ONLY)
// ===============================
document.getElementById("likeBtn").onclick = () => {
  react(id, "like");
};

document.getElementById("dislikeBtn").onclick = () => {
  react(id, "dislike");
};

function react(id, type) {

  fetch(`http://localhost:3000/api/solutions/${id}/react`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": sessionStorage.getItem("token")
    },
    body: JSON.stringify({ type })
  })
    .then(res => res.json())
    .then(() => {
      loadSolution();  // 🔥 important — reload fresh counts from backend
    })
    .catch(err => console.log("Reaction error:", err));
}


loadSolution();
})