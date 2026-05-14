function mostrarError(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.style.display = "block";
    }

    function limpiarErrores() {
    ["error-nombre","error-email","error-password","error-password2"].forEach(id => {
        document.getElementById(id).style.display = "none";
    });
    document.getElementById("error-general").style.display = "none";
    document.getElementById("success-msg").style.display = "none";
    }

    function validarFormulario(nombre, email, password, password2) {
    let valido = true;

    if (!nombre) {
        mostrarError("error-nombre", "El nombre es obligatorio");
        valido = false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mostrarError("error-email", "Ingresa un correo válido");
        valido = false;
    }
    if (password.length < 8) {
        mostrarError("error-password", "La contraseña debe tener al menos 8 caracteres");
        valido = false;
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
        mostrarError("error-password", "La contraseña debe tener letras y números");
        valido = false;
    }
    if (password !== password2) {
        mostrarError("error-password2", "Las contraseñas no coinciden");
        valido = false;
    }

    return valido;
    }

    async function handleRegistro() {
    limpiarErrores();

    const nombre    = document.getElementById("nombre").value.trim();
    const email     = document.getElementById("email").value.trim();
    const password  = document.getElementById("password").value.trim();
    const password2 = document.getElementById("password2").value.trim();
    const deporte   = document.getElementById("deporte").value;

    if (!validarFormulario(nombre, email, password, password2)) return;

    try {
        const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            full_name: nombre,
            email: email,
            password: password,
            role: "user",
            must_change_password: false,
            metadata: { sports: deporte ? [{ name: deporte }] : [] }
        })
        });

        const data = await response.json();

        if (data.ok) {
        document.getElementById("success-msg").style.display = "block";
        setTimeout(() => { window.location.href = "login.html"; }, 2000);
        } else {
        const errorGeneral = document.getElementById("error-general");
        errorGeneral.textContent = data.message || "Error al registrar usuario";
        errorGeneral.style.display = "block";
        }

    } catch (error) {
        const errorGeneral = document.getElementById("error-general");
        errorGeneral.textContent = "Error al conectar con el servidor";
        errorGeneral.style.display = "block";
    }
    }