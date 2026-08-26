// js/app.js
// Logica compartida: navegacion, verificacion de sesion (via GET /me, que
// depende de la cookie httpOnly) y helpers de UI. Cada pagina llama a la
// funcion init correspondiente segun window.PAGE.

// Theme Toggle Logic
function initThemeToggle() {
  const savedTheme = localStorage.getItem('theme');
  const toggleBtn = document.getElementById('themeToggle');
  const btnImg = toggleBtn ? toggleBtn.querySelector('img') : null;
  
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (btnImg) btnImg.src = 'img/oscuro.png';
  } else {
    if (btnImg) btnImg.src = 'img/claro.png';
  }
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      
      // Cambiar imagen del botón según tema
      if (btnImg) {
        btnImg.src = isDark ? 'img/oscuro.png' : 'img/claro.png';
      }
    });
  }
}

function showAlert(container, message, type = 'error') {
  container.innerHTML = `<div class="alert ${type}">${message}</div>`;
}

function clearAlert(container) {
  container.innerHTML = '';
}

function renderNav(user) {
  const nav = document.getElementById('nav');
  if (!nav) return;
  if (!user) {
    nav.innerHTML = `<a href="login.html">Iniciar sesion</a>`;
    return;
  }
  
  let links = [];
  if (user.role === 'admin') {
    // Para admin: no mostrar "Espacios", mostrar "Reservas" (pendientes) y "Administracion"
    links.push(`<a href="admin.html#reservas">Reservas</a>`);
    links.push(`<a href="admin.html">Administracion</a>`);
  } else {
    // Para miembros: "Espacios", "Mis reservas" y "Planes" o "Ver mi plan"
    links.push(`<a href="index.html">Espacios</a>`);
    links.push(`<a href="my-reservations.html">Mis reservas</a>`);
    
    // Mostrar "Planes" si no tiene plan, "Ver mi plan" si tiene plan
    if (user.plan) {
      links.push(`<a href="my-plan.html">Ver mi plan</a>`);
    } else {
      links.push(`<a href="select-plan.html">Planes</a>`);
    }
  }
  
  // Menú de perfil desplegable
  const profileMenu = `
    <div class="profile-menu">
      <button class="profile-toggle" id="profileToggle">
        <span class="profile-name">${user.name || 'Usuario'}</span>
        <span class="profile-arrow">▼</span>
      </button>
      <div class="profile-dropdown" id="profileDropdown">
        <div class="profile-info">
          <div class="profile-label">Nombre</div>
          <div class="profile-value">${user.name || 'Usuario'}</div>
        </div>
        <div class="profile-info">
          <div class="profile-label">Correo</div>
          <div class="profile-value">${user.email}</div>
        </div>
        <div class="profile-divider"></div>
        <a href="#" class="profile-logout" id="logoutLink">Cerrar sesión</a>
      </div>
    </div>
  `;
  
  nav.innerHTML = links.join('') + profileMenu;
  
  // Toggle del menú hamburguesa en móvil
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    topbar.addEventListener('click', (e) => {
      // Solo si se hace clic en el botón hamburguesa (::before)
      if (window.getComputedStyle(e.target).content === '"☰"' || 
          e.target === topbar && window.getComputedStyle(topbar, '::before').cursor === 'pointer') {
        nav.classList.toggle('active');
      }
    });
  }
  
  // Toggle del menú desplegable
  const profileToggle = document.getElementById('profileToggle');
  const profileDropdown = document.getElementById('profileDropdown');
  
  if (profileToggle && profileDropdown) {
    profileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('active');
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', () => {
      profileDropdown.classList.remove('active');
    });
    
    profileDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
  
  // Logout
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      await api.logout().catch(() => {});
      window.location.href = 'login.html';
    });
  }
}

// Verifica sesion. Si requireAuth=true y no hay sesion -> redirige a login.
// Si requireRole se define y el usuario no lo cumple -> redirige a index.
// Si skipPlanCheck=true, no redirige por falta de plan (para select-plan.html).
// Por defecto, ya no redirige a select-plan.html automáticamente (los usuarios pueden elegir no tener plan).
async function guardPage({ requireAuth = true, requireRole = null, skipPlanCheck = false } = {}) {
  try {
    const user = await api.me();
    renderNav(user);
    
    // Ya no redirigimos automáticamente a select-plan.html
    // Los usuarios pueden elegir no tener plan (solo escritorios)
    
    if (requireRole && user.role !== requireRole) {
      window.location.href = 'index.html';
      return null;
    }
    return user;
  } catch (err) {
    renderNav(null);
    if (requireAuth) {
      window.location.href = 'login.html';
      return null;
    }
    return null;
  }
}

function formatDateTimeLocalInput(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
