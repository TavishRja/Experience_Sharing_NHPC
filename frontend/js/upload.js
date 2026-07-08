// let imageData = "";
const params = new URLSearchParams(window.location.search);
const draftId = params.get("draftId");
console.log("Upload JS loaded");




// ===============================
// IMAGE PREVIEW
// ===============================
function previewFile() {

    const file = document.getElementById("fileInput").files[0];
    const preview = document.getElementById("previewImg");

    if (!file) return;

    // image preview only
    if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function () {
            preview.src = reader.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = "none"; // pdf preview nahi
    }
}



// ===============================
// SAVE DRAFT (LOCAL ONLY)
// ===============================

function saveDraft() {

    const title = document.querySelector('input[type="text"]').value;
    const area = document.querySelector('select').value;
    const desc = document.querySelector('textarea').value;

    if (!title || !area || !desc) {
        alert("Fill details before saving draft");
        return;
    }

    fetch("http://localhost:3000/api/solutions/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" ,
            "Authorization": sessionStorage.getItem("token")
        },
        body: JSON.stringify({
            title: title,
            area: area,
            description: desc,
            employee: "EMP102"
        })
    })
        .then(res => res.json())
        .then(data => {
            alert("Draft saved successfully ✅");
            window.location.href = "dashboard.html";
        })
        .catch(err => {
            console.log(err);
            alert("Draft save failed ❌");
        });
}

// ===============================
// CONFIRM SUBMIT (BACKEND)
// ===============================

function confirmSubmit(e) {
    e.preventDefault();

    const title = document.querySelector('input[type="text"]').value.trim();
    const area = document.querySelector('select').value;
    const desc = document.querySelector('textarea').value.trim();

    const imageInput = document.getElementById("imageInput");
    const pdfInput = document.getElementById("pdfInput");

    console.log("Function loaded");



    if (!title || !area || !desc) {
        alert("Fill all text fields");
        return;
    }

    if (!imageInput.files.length && !pdfInput.files.length) {
        alert("Please upload Image or PDF before confirming");
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("area", area);
    formData.append("description", desc);
    formData.append("employee", "EMP102");

    if (imageInput.files.length) {
        formData.append("image", imageInput.files[0]);
    }
    if (pdfInput.files.length) {
        formData.append("pdf", pdfInput.files[0]);
    }

    let url;
    let method;

    if (draftId) {
        url = `http://localhost:3000/api/solutions/${draftId}/confirm`;
        method = "PUT";
    } else {
        url = "http://localhost:3000/api/solutions/confirm-new";
        method = "POST";
    }

    // 👇 IMPORTANT: fetch ko return karo
    fetch(url, {
        method: method,
        headers: {
        "Authorization": sessionStorage.getItem("token")
    },
        body: formData
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error("Server error");
            }
            return res.json();
        })
        .then((data) => {
            alert("Submitted successfully ✅");
            window.location.replace("dashboard.html");
        })
        .catch((err) => {
            console.error("Error:", err);
            alert("Submission failed ❌");
        });
}



function clearDraft() {
    sessionStorage.removeItem("draftSolution");

    alert("Draft cleared. Redirecting to dashboard...");

    // ✅ redirect to dashboard
    window.location.replace("dashboard.html");

}


window.addEventListener("DOMContentLoaded", () => {

    if (draftId) {

        fetch(`http://localhost:3000/api/solutions/draft/${draftId}`, {
            headers: {
                "Authorization": sessionStorage.getItem("token")
            }
        })
        .then(res => {
            if (!res.ok) throw new Error("Unauthorized");
            return res.json();
        })
        .then(data => {

            document.querySelector('input[type="text"]').value = data.title || "";
            document.querySelector('select').value = data.area || "";
            document.querySelector('textarea').value = data.description || "";

        })
        .catch(err => {
            console.log("Draft load error:", err);
        });
    }
});