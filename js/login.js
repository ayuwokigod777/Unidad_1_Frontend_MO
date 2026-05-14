async function handleLogin() {
    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("error-msg");

    errorMsg.style.display = "none";

    try {
        const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();

        if (data.ok) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        const role = data.data.user.role;

        if (role === "user")  window.location.href = "dashboard-usuario.html";
        if (role === "coach") window.location.href = "dashboard-coach.html";
        if (role === "admin") window.location.href = "dashboard-admin.html";

        } else {
        errorMsg.textContent = data.message || "Credenciales incorrectas";
        errorMsg.style.display = "block";
        }

    } catch (error) {
        errorMsg.textContent = "Error al conectar con el servidor";
        errorMsg.style.display = "block";
    }
    }