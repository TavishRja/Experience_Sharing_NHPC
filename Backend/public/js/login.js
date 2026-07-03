
function loginUser(event) {
    event.preventDefault();

    const empId = document.querySelector('input[type="text"]').value;
    const pass = document.querySelector('input[type="password"]').value;

    fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user: empId,
            password: pass
        })
    })
    .then(async res => {
        const data = await res.json().catch(() => ({}));
        console.log("LOGIN RESPONSE:", data);

        if (res.ok && data.success) {
            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("loggedInUser", data.userId);
            sessionStorage.setItem("roles", JSON.stringify(data.roles));

            if (data.roles.includes("moderator")) {
                window.location.href = "home.html";
            } else {
                window.location.href = "home.html";
            }
        } else {
            alert(data.message || "Invalid ID or Password");
        }
    })
    .catch(err => {
        console.log("Login Error:", err);
        alert("Login failed");
    });
}
