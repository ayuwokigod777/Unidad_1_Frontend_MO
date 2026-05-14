const API = "http://localhost:3000";

    function getToken() {
    return localStorage.getItem("token");
    }

    function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    }

    function formatFecha(fecha) {
    if (!fecha) return "–";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-CL");
    }

    function badgeRol(rol) {
    if (rol === "admin") return `<span class="badge-admin">admin</span>`;
    if (rol === "coach") return `<span class="badge-coach">coach</span>`;
    return `<span class="badge-user">user</span>`;
    }

    function mostrarFeedback(id, msg, tipo) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.className = "feedback " + tipo;
    setTimeout(() => { el.className = "feedback"; }, 3000);
    }

    // CARGAR PERFIL DESDE API
    async function cargarPerfil() {
    try {
        const res = await fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();

        if (!data.ok) {
        window.location.href = "login.html";
        return;
        }

        const user = data.data;

        // Sidebar
        document.getElementById("sidebarNombre").textContent = user.full_name;
        document.getElementById("sidebarRol").textContent = user.role;

        // Info actual
        document.getElementById("infoNombre").textContent = user.full_name;
        document.getElementById("infoEmail").textContent = user.email.toLowerCase();
        document.getElementById("infoRol").innerHTML = badgeRol(user.role);
        document.getElementById("infoFecha").textContent = formatFecha(user.birth_date);

        // Prellenar formulario
        document.getElementById("editNombre").value = user.full_name;
        if (user.birth_date) {
        document.getElementById("editFecha").value = user.birth_date.split("T")[0];
        }
        if (user.metadata) {
        document.getElementById("editMetadata").value = JSON.stringify(user.metadata);
        }

    } catch (e) {
        mostrarFeedback("feedbackPerfil", "Error al cargar perfil", "error");
    }
    }

    // GUARDAR PERFIL
    async function guardarPerfil() {
    const nombre = document.getElementById("editNombre").value.trim();
    const fecha  = document.getElementById("editFecha").value;
    const meta   = document.getElementById("editMetadata").value.trim();

      // Limpiar errores
    document.getElementById("err-nombre").style.display = "none";
    document.getElementById("editNombre").classList.remove("input-error");

    if (!nombre) {
        document.getElementById("err-nombre").style.display = "block";
        document.getElementById("editNombre").classList.add("input-error");
        return;
    }

    try {
        const res = await fetch(`${API}/api/auth/me`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
            full_name: nombre,
            birth_date: fecha || null,
            metadata: meta ? { info: meta } : {}
        })
        });

        const data = await res.json();

        if (data.ok) {
        mostrarFeedback("feedbackPerfil", "Perfil actualizado correctamente", "success");
        cargarPerfil();
        } else {
        mostrarFeedback("feedbackPerfil", data.message || "Error al actualizar", "error");
        }

    } catch (e) {
        mostrarFeedback("feedbackPerfil", "Error al conectar con el servidor", "error");
    }
    }

    // CAMBIAR CONTRASEÑA
    async function cambiarPassword() {
    const actual   = document.getElementById("passActual").value.trim();
    const nueva    = document.getElementById("passNueva").value.trim();
    const confirma = document.getElementById("passConfirm").value.trim();

      // Limpiar errores
    document.querySelectorAll(".error-msg").forEach(e => e.style.display = "none");
    document.querySelectorAll(".input-error").forEach(e => e.classList.remove("input-error"));

    let valido = true;

    if (!actual) {
        document.getElementById("err-actual").style.display = "block";
        document.getElementById("passActual").classList.add("input-error");
        valido = false;
    }
    if (nueva.length < 8) {
        document.getElementById("err-nueva").style.display = "block";
        document.getElementById("passNueva").classList.add("input-error");
        valido = false;
    }
    if (nueva !== confirma) {
        document.getElementById("err-confirm").style.display = "block";
        document.getElementById("passConfirm").classList.add("input-error");
        valido = false;
    }

    if (!valido) return;

    try {
        const res = await fetch(`${API}/api/auth/me/password`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
            current_password: actual,
            new_password: nueva,
            confirm_password: confirma
        })
        });

        const data = await res.json();

        if (data.ok) {
        mostrarFeedback("feedbackPassword", "Contraseña actualizada correctamente", "success");
        document.getElementById("passActual").value = "";
        document.getElementById("passNueva").value = "";
        document.getElementById("passConfirm").value = "";
        } else {
        mostrarFeedback("feedbackPassword", data.message || "Error al cambiar contraseña", "error");
        }

    } catch (e) {
        mostrarFeedback("feedbackPassword", "Error al conectar con el servidor", "error");
    }
    }

    // Iniciar
    cargarPerfil();