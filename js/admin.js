const API = "http://localhost:3000";

    function getToken() {
    return localStorage.getItem("token");
    }

    function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    }

    function mostrarFeedback(msg, tipo) {
    const el = document.getElementById("feedback");
    el.textContent = msg;
    el.className = "feedback " + tipo;
    setTimeout(() => { el.className = "feedback"; }, 3000);
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

    // Cargar nombre admin
    const userGuardado = JSON.parse(localStorage.getItem("user") || "{}");
    if (userGuardado.full_name) {
    document.getElementById("adminName").textContent = userGuardado.full_name;
    }

    // LISTAR USUARIOS
    async function cargarUsuarios() {
    try {
        const res = await fetch(`${API}/api/users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();

        if (!data.ok) return;

        const users = data.data;

        // Estadísticas
        document.getElementById("totalUsuarios").textContent = users.length;
        document.getElementById("totalCoaches").textContent = users.filter(u => u.role === "coach").length;
        document.getElementById("usuariosActivos").textContent = `${users.length} usuarios registrados`;

        // Tabla
        const tbody = document.getElementById("usersTableBody");
        tbody.innerHTML = "";

        users.forEach(user => {
        tbody.innerHTML += `
            <tr>
            <td>${user.id}</td>
            <td>${user.full_name}</td>
            <td>${user.email}</td>
            <td>${badgeRol(user.role)}</td>
            <td>${formatFecha(user.created_at)}</td>
            <td style="display:flex;gap:6px;">
                <button class="btn-blue" onclick="abrirModalEditar(${user.id})">Editar</button>
                <button class="btn-red" onclick="eliminarUsuario(${user.id})">Eliminar</button>
            </td>
            </tr>
        `;
        });

    } catch (e) {
        mostrarFeedback("Error al cargar usuarios", "error");
    }
    }

    // MODAL CREAR
    function abrirModalCrear() {
    document.getElementById("modalTitle").textContent = "Nuevo Usuario";
    document.getElementById("modalUserId").value = "";
    document.getElementById("modalNombre").value = "";
    document.getElementById("modalEmail").value = "";
    document.getElementById("modalRol").value = "user";
    document.getElementById("modalPassword").value = "";
    document.getElementById("modalPassword2").value = "";
    document.getElementById("passwordField").style.display = "block";
    document.getElementById("passwordField2").style.display = "block";
    document.getElementById("modalOverlay").classList.add("active");
    }

    // MODAL EDITAR
    async function abrirModalEditar(id) {
    try {
        const res = await fetch(`${API}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();
        const user = data.data;

        document.getElementById("modalTitle").textContent = "Editar Usuario";
        document.getElementById("modalUserId").value = user.id;
        document.getElementById("modalNombre").value = user.full_name;
        document.getElementById("modalEmail").value = user.email;
        document.getElementById("modalRol").value = user.role;
        document.getElementById("passwordField").style.display = "none";
        document.getElementById("passwordField2").style.display = "none";
        document.getElementById("modalOverlay").classList.add("active");

    } catch (e) {
        mostrarFeedback("Error al cargar usuario", "error");
    }
    }

    function cerrarModal() {
    document.getElementById("modalOverlay").classList.remove("active");
    }

    // GUARDAR (CREAR O EDITAR)
    async function guardarUsuario() {
    const id       = document.getElementById("modalUserId").value;
    const nombre   = document.getElementById("modalNombre").value.trim();
    const email    = document.getElementById("modalEmail").value.trim();
    const rol      = document.getElementById("modalRol").value;
    const password = document.getElementById("modalPassword").value.trim();
    const password2 = document.getElementById("modalPassword2").value.trim();

      // Limpiar errores
    document.querySelectorAll(".error-msg").forEach(e => e.style.display = "none");
    document.querySelectorAll(".input-error").forEach(e => e.classList.remove("input-error"));

    let valido = true;

    if (!nombre) {
        document.getElementById("err-nombre").style.display = "block";
        document.getElementById("modalNombre").classList.add("input-error");
        valido = false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById("err-email").style.display = "block";
        document.getElementById("modalEmail").classList.add("input-error");
        valido = false;
    }
    if (!id && password.length < 8) {
        document.getElementById("err-password").style.display = "block";
        document.getElementById("modalPassword").classList.add("input-error");
        valido = false;
    }
    if (!id && password !== password2) {
        document.getElementById("err-password2").style.display = "block";
        document.getElementById("modalPassword2").classList.add("input-error");
        valido = false;
    }

    if (!valido) return;

    try {
        let res;
        if (id) {
          // EDITAR
        res = await fetch(`${API}/api/users/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
            body: JSON.stringify({ full_name: nombre, email, role: rol })
        });
        } else {
          // CREAR
        res = await fetch(`${API}/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
            body: JSON.stringify({ full_name: nombre, email, password, role: rol, must_change_password: false })
        });
        }

        const data = await res.json();

        if (data.ok) {
        cerrarModal();
        mostrarFeedback(id ? "Usuario actualizado correctamente" : "Usuario creado correctamente", "success");
        cargarUsuarios();
        } else {
        mostrarFeedback(data.message || "Error al guardar", "error");
        }

    } catch (e) {
        mostrarFeedback("Error al conectar con el servidor", "error");
    }
    }

    // ELIMINAR
    async function eliminarUsuario(id) {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
        const res = await fetch(`${API}/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();

        if (data.ok) {
        mostrarFeedback("Usuario eliminado correctamente", "success");
        cargarUsuarios();
        } else {
        mostrarFeedback(data.message || "Error al eliminar", "error");
        }

    } catch (e) {
        mostrarFeedback("Error al conectar con el servidor", "error");
    }
    }

    // Iniciar
    cargarUsuarios();