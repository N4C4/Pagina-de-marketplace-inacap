// ========== VARIABLES GLOBALES ==========
let currentUser = null;
let editingProductId = null;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    let usuarios = limpiarUsuarioCorrupto();
    if (!Array.isArray(usuarios)) {
        usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    }
    if (!usuarios.some(u => u.email === 'admin@inacap.com')) {
        usuarios.push({
            id: generateId(),
            nombre: 'Administrador INACAP',
            email: 'admin@inacap.com',
            password: '123456',
            role: 'admin',
            fecha_registro: new Date().toISOString(),
            membershipActive: false,
            membershipExpiry: null
        });
    }
    if (!usuarios.some(u => u.email === 'emprendedor@inacap.com')) {
        usuarios.push({
            id: generateId(),
            nombre: 'Emprendedor Ejemplo',
            email: 'emprendedor@inacap.com',
            password: '123456',
            role: 'emprendedor',
            fecha_registro: new Date().toISOString(),
            membershipActive: true,
            membershipExpiry: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString()
        });
    }
    if (!usuarios.some(u => u.email === 'estudiante@inacap.com')) {
        usuarios.push({
            id: generateId(),
            nombre: 'Estudiante Ejemplo',
            email: 'estudiante@inacap.com',
            password: '123456',
            role: 'estudiante',
            fecha_registro: new Date().toISOString(),
            membershipActive: false,
            membershipExpiry: null
        });
    }
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    let productos = JSON.parse(localStorage.getItem('productos')) || [];
    const vendedorId = usuarios.find(u => u.email === 'emprendedor@inacap.com').id;
    const adminId = usuarios.find(u => u.email === 'admin@inacap.com').id;
    if (productos.length === 0) {
        productos = crearProductosEjemplo(vendedorId, adminId);
        localStorage.setItem('productos', JSON.stringify(productos));
    } else {
        productos = sincronizarCursosInacap(productos, adminId);
        localStorage.setItem('productos', JSON.stringify(productos));
    }

    if (!Array.isArray(JSON.parse(localStorage.getItem('solicitudes') || '[]'))) {
        localStorage.setItem('solicitudes', JSON.stringify([]));
    }
    if (!Array.isArray(JSON.parse(localStorage.getItem('compras') || '[]'))) {
        localStorage.setItem('compras', JSON.stringify([]));
    }
    if (!Array.isArray(JSON.parse(localStorage.getItem('carrito') || '[]'))) {
        localStorage.setItem('carrito', JSON.stringify([]));
    }
    if (!Array.isArray(JSON.parse(localStorage.getItem('wishlist') || '[]'))) {
        localStorage.setItem('wishlist', JSON.stringify([]));
    }

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showUserPanel();
    }
}

function limpiarUsuarioCorrupto() {
    const corruptedEmail = 'rezeromaster.34@gmail.com';
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const corruptedUser = usuarios.find(u => u.email === corruptedEmail);
    if (!corruptedUser) return usuarios;

    usuarios = usuarios.filter(u => u.email !== corruptedEmail);
    const compras = JSON.parse(localStorage.getItem('compras') || '[]').filter(c => c.compradorId !== corruptedUser.id && c.vendedorId !== corruptedUser.id);
    const productos = JSON.parse(localStorage.getItem('productos') || '[]').filter(p => p.vendedorId !== corruptedUser.id);
    const solicitudes = JSON.parse(localStorage.getItem('solicitudes') || '[]').filter(s => s.usuarioId !== corruptedUser.id);

    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('compras', JSON.stringify(compras));
    localStorage.setItem('productos', JSON.stringify(productos));
    localStorage.setItem('solicitudes', JSON.stringify(solicitudes));

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const usuarioActual = JSON.parse(savedUser);
        if (usuarioActual.email === corruptedEmail) {
            localStorage.removeItem('currentUser');
        }
    }

    return usuarios;
}

function crearProductosEjemplo(vendedorId, adminId) {
    return [
        // Productos INACAP
        {
            id: generateId(),
            vendedorId: adminId,
            title: 'Mochila universitaria resistente',
            description: 'Mochila con múltiples compartimentos ideal para libros, laptop y útiles escolares.',
            price: 12000,
            stock: 35,
            category: 'Útiles',
            source: 'inacap',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: adminId,
            title: 'Botella térmica ecológica',
            description: 'Botella reutilizable para bebidas frías o calientes durante todo el día en el campus.',
            price: 7500,
            stock: 40,
            category: 'Hogar',
            source: 'inacap',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: adminId,
            title: 'Set de útiles escolares',
            description: 'Pack con cuadernos, lápices, marcadores y reglas para estudiantes de todas las carreras.',
            price: 9800,
            stock: 50,
            category: 'Útiles',
            source: 'inacap',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: adminId,
            title: 'Lámpara de escritorio LED',
            description: 'Luz ajustable para estudiar y trabajar cómodamente en tu espacio de estudio.',
            price: 14500,
            stock: 20,
            category: 'Tecnología',
            source: 'inacap',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: adminId,
            title: 'Cargador portátil USB',
            description: 'Powerbank compacto para mantener tu celular y dispositivo cargados fuera de clase.',
            price: 16000,
            stock: 18,
            category: 'Tecnología',
            source: 'inacap',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: vendedorId,
            title: 'Kit de apuntes y resúmenes',
            description: 'Apuntes organizados y resúmenes de materias clave hechos por estudiantes.',
            price: 8500,
            stock: 12,
            category: 'Academia',
            source: 'alumno',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: vendedorId,
            title: 'Tarjeta de transporte recargable',
            description: 'Recarga rápida para viajar entre la casa y la universidad durante el mes.',
            price: 5000,
            stock: 30,
            category: 'Transporte',
            source: 'alumno',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: vendedorId,
            title: 'Camiseta personalizada INACAP',
            description: 'Camiseta cómoda con diseño exclusivo para estudiantes de la intranet.',
            price: 14000,
            stock: 22,
            category: 'Ropa',
            source: 'alumno',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: vendedorId,
            title: 'Bolsa reutilizable para compras',
            description: 'Bolsa resistente y plegable ideal para traer a clases o hacer compras en el campus.',
            price: 6200,
            stock: 25,
            category: 'Hogar',
            source: 'alumno',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: vendedorId,
            title: 'Kit de primeros auxilios básico',
            description: 'Pequeño botiquín para emergencias menores en residencia o viajes cortos.',
            price: 7200,
            stock: 15,
            category: 'Salud',
            source: 'alumno',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: vendedorId,
            title: 'Voucher de comida rápida',
            description: 'Cupón para canjear en la cafetería del campus durante la semana.',
            price: 9000,
            stock: 18,
            category: 'Alimentos',
            source: 'alumno',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: vendedorId,
            title: 'Plantillas de Plan de Negocios',
            description: 'Pack de plantillas y guías para formalizar tu emprendimiento.',
            price: 8000,
            stock: 20,
            category: 'Emprendimiento',
            source: 'alumno',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: vendedorId,
            title: 'Asesoría Básica Legal',
            description: 'Guía práctica para organizar los documentos legales de tu negocio.',
            price: 15000,
            stock: 10,
            category: 'Servicios',
            source: 'alumno',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: vendedorId,
            title: 'Plantillas de Contabilidad Básica',
            description: 'Archivos Excel listos para llevar contabilidad de tu negocio.',
            price: 5500,
            stock: 25,
            category: 'Finanzas',
            source: 'alumno',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: vendedorId,
            title: 'Logo Design Pack',
            description: 'Diseño personalizado de logo para emprendedores y pequeños negocios.',
            price: 25000,
            stock: 8,
            category: 'Diseño',
            source: 'alumno',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: vendedorId,
            title: 'Estrategia de Redes Sociales',
            description: 'Plan estratégico de 30 días para aumentar seguidores y engagement en redes.',
            price: 9500,
            stock: 12,
            category: 'Marketing',
            source: 'alumno',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: vendedorId,
            title: 'Kit de Branding Completo',
            description: 'Identidad visual completa: logo, paleta de colores, tipografía y guía de marca.',
            price: 35000,
            stock: 6,
            category: 'Diseño',
            source: 'alumno',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: vendedorId,
            title: 'Curso de Ventas B2B',
            description: 'Técnicas avanzadas para vender productos y servicios a otras empresas.',
            price: 18000,
            stock: 14,
            category: 'Educación',
            source: 'alumno',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: vendedorId,
            title: 'Plantilla de Propuestas Comerciales',
            description: 'Documentos profesionales para presentar propuestas a potenciales clientes.',
            price: 4500,
            stock: 30,
            category: 'Emprendimiento',
            source: 'alumno',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: vendedorId,
            title: 'Auditoría de Sitio Web',
            description: 'Análisis completo de tu presencia digital y recomendaciones de mejora.',
            price: 22000,
            stock: 9,
            category: 'Digital',
            source: 'alumno',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: vendedorId,
            title: 'Guía de Exportación para Pymes',
            description: 'Manual completo para internacionalizar tu negocio y exportar productos.',
            price: 19500,
            stock: 11,
            category: 'Negocios',
            source: 'alumno',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            vendedorId: vendedorId,
            title: 'Template de Landing Page',
            description: 'Página de ventas lista para convertir visitantes en clientes.',
            price: 7500,
            stock: 18,
            category: 'Digital',
            source: 'alumno',
            dateAdded: new Date().toISOString()
        }
    ];
}

function sincronizarCursosInacap(productos, adminId) {
    const cursosInacap = crearProductosEjemplo(null, adminId).filter(p => p.source === 'inacap');
    productos = productos.filter(p => !(p.source === 'inacap' && p.vendedorId === adminId));
    return productos.concat(cursosInacap);
}

// ========== AUTENTICACIÓN ==========
function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    if (usuario) {
        currentUser = usuario;
        localStorage.setItem('currentUser', JSON.stringify(usuario));
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        showUserPanel();
    } else {
        alert('Correo o contraseña incorrectos');
    }
}

function registerUser(event) {
    event.preventDefault();
    const nombre = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    if (usuarios.some(u => u.email === email)) {
        return alert('Este correo ya está registrado');
    }
    const nuevoUsuario = {
        id: generateId(),
        nombre: nombre,
        email: email,
        password: password,
        role: role,
        fecha_registro: new Date().toISOString(),
        membershipActive: false,
        membershipExpiry: null
    };
    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    currentUser = nuevoUsuario;
    localStorage.setItem('currentUser', JSON.stringify(nuevoUsuario));
    document.getElementById('regName').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regRole').value = '';
    showUserPanel();
}

function showLogin() {
    document.getElementById('registerPanel').classList.remove('active');
    document.getElementById('loginPanel').classList.add('active');
}

function showResetPassword() {
    document.getElementById('resetPasswordBox').style.display = 'block';
}

function hideResetPassword() {
    document.getElementById('resetPasswordBox').style.display = 'none';
}

function restablecerContrasena(event) {
    event.preventDefault();
    const email = document.getElementById('resetEmail').value.trim();
    const password = document.getElementById('resetPasswordInput').value;
    const confirmPassword = document.getElementById('resetPasswordConfirm').value;
    if (password !== confirmPassword) {
        return alert('Las contraseñas no coinciden.');
    }
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.email === email);
    if (!usuario) {
        return alert('No se encontró un usuario con ese correo.');
    }
    usuario.password = password;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    if (currentUser && currentUser.email === email) {
        currentUser.password = password;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    document.getElementById('resetEmail').value = '';
    document.getElementById('resetPasswordInput').value = '';
    document.getElementById('resetPasswordConfirm').value = '';
    hideResetPassword();
    alert('Contraseña restablecida con éxito. Ahora puedes iniciar sesión.');
}

function showRegister() {
    document.getElementById('loginPanel').classList.remove('active');
    document.getElementById('registerPanel').classList.add('active');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById('loginPanel').classList.add('active');
}

// ========== PANELES ==========
function showUserPanel() {
    document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
    if (!currentUser) return;
    if (currentUser.role === 'estudiante' || currentUser.role === 'emprendedor') {
        document.getElementById('estudiantePanel').classList.add('active');
        document.getElementById('userDisplay').textContent = `👤 ${currentUser.nombre}`;
        document.getElementById('ayudaUsuarioId').value = currentUser.id;
        
        const btnEmprendedor = document.getElementById('btnEmprendedor');
        const btnComprarMembresia = document.getElementById('btnComprarMembresia');
        const tieneMembresia = currentUser.membershipActive && currentUser.membershipExpiry && new Date(currentUser.membershipExpiry) > new Date();
        if (tieneMembresia) {
            btnEmprendedor.style.display = 'block';
            btnComprarMembresia.style.display = 'none';
        } else {
            btnEmprendedor.style.display = 'none';
            btnComprarMembresia.style.display = 'block';
        }
        
        loadMarketplace();
        loadMisCompras();
        loadSolicitudesEstudiante();
        updateCartCount();
        updateWishlistCount();
    } else if (currentUser.role === 'admin') {
        document.getElementById('adminPanel').classList.add('active');
        document.getElementById('adminUserDisplay').textContent = `👤 ${currentUser.nombre}`;
        loadAdminStats();
        loadUsuariosAdmin();
        loadSolicitudesAdmin();
    }
}

function showTab(tabId) {
    document.querySelectorAll('#estudiantePanel .tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (tabId === 'mercado') loadMarketplace();
    if (tabId === 'misCompras') loadMisCompras();
    if (tabId === 'carrito') loadCarrito();
    if (tabId === 'deseados') loadDeseados();
    if (tabId === 'ayudaEstudiante') loadSolicitudesEstudiante();
}

function showTabEmprendedor(tabId) {
    document.querySelectorAll('#emprendedorPanel .tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (tabId === 'miMembresia') loadMembresia();
    if (tabId === 'misProductos') loadMisProductos();
    if (tabId === 'ventas') loadVentas();
    if (tabId === 'ayudaEmprendedor') loadSolicitudesEmprendedor();
}

function showTabAdmin(tabId) {
    document.querySelectorAll('#adminPanel .tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (tabId === 'estadisticas') loadAdminStats();
    if (tabId === 'usuarios') loadUsuariosAdmin();
    if (tabId === 'ayudasAdmin') loadSolicitudesAdmin();
}

// ========== MARKETPLACE ESTUDIANTE ==========
function loadMarketplace() {
    const search = document.getElementById('searchProducto')?.value?.toLowerCase() || '';
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const productosInacapContainer = document.getElementById('productosInacap');
    const productosAlumnosContainer = document.getElementById('productosAlumnos');

    const vendedoresConMembresia = new Set(
        usuarios
            .filter(u => u.role === 'emprendedor' && u.membershipActive && u.membershipExpiry && new Date(u.membershipExpiry) > new Date())
            .map(u => u.id)
    );

    const visibles = productos.filter(producto => {
        return producto.title.toLowerCase().includes(search) ||
               producto.category.toLowerCase().includes(search) ||
               producto.description.toLowerCase().includes(search);
    });

    const productosInacap = visibles.filter(producto => producto.source === 'inacap');
    const productosAlumnos = visibles.filter(producto => producto.source === 'alumno' && vendedoresConMembresia.has(producto.vendedorId));

    productosInacapContainer.innerHTML = productosInacap.length > 0
        ? renderProductCards(productosInacap)
        : '<p class="empty-message">No hay cursos o asesorías INACAP disponibles.</p>';

    productosAlumnosContainer.innerHTML = productosAlumnos.length > 0
        ? renderProductCards(productosAlumnos)
        : '<p class="empty-message">No hay productos de alumnos con membresía activa disponibles.</p>';
}

function renderProductCards(productos) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    return productos.map(producto => {
        const enDeseados = wishlist.includes(producto.id);
        return `
        <div class="product-card">
            <div class="sala-header">
                <h3>${producto.title}</h3>
                <div class="sala-rating">${producto.category}</div>
            </div>
            <div class="sala-body">
                <p>${producto.description}</p>
                <p><strong>Precio:</strong> $${producto.price}</p>
                <p><strong>Stock:</strong> ${producto.stock}</p>
                <div class="sala-buttons">
                    <button onclick="agregarAlCarrito('${producto.id}')" ${producto.stock === 0 ? 'disabled' : ''}>🛒 Carrito</button>
                    <button onclick="agregarADeseados('${producto.id}')" class="btn-editar">${enDeseados ? '💔 Remover' : '❤️ Deseado'}</button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function abrirCompra(productId) {
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const producto = productos.find(p => p.id === productId);
    if (!producto) return;
    document.getElementById('compraProductoId').value = producto.id;
    document.getElementById('compraCantidad').value = 1;
    document.getElementById('compraDetails').innerHTML = `
        <p><strong>Producto:</strong> ${producto.title}</p>
        <p><strong>Precio unitario:</strong> $${producto.price}</p>
        <p><strong>Stock disponible:</strong> ${producto.stock}</p>
    `;
    openModal('modalCompra');
}

function confirmarCompra(event, productId = null, cantidad = null) {
    if (event && event.preventDefault) event.preventDefault();
    
    const productIdFinal = productId || document.getElementById('compraProductoId').value;
    const cantidadFinal = cantidad || parseInt(document.getElementById('compraCantidad').value, 10);
    
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const compras = JSON.parse(localStorage.getItem('compras')) || [];
    const producto = productos.find(p => p.id === productIdFinal);
    
    if (!producto) return alert('Producto no encontrado');
    if (cantidadFinal <= 0 || cantidadFinal > producto.stock) return alert('Cantidad inválida o excede el stock');
    
    const total = producto.price * cantidadFinal;
    compras.push({
        id: generateId(),
        productoId: producto.id,
        compradorId: currentUser.id,
        vendedorId: producto.vendedorId,
        cantidad: cantidadFinal,
        total: total,
        fecha: new Date().toISOString()
    });
    
    producto.stock -= cantidadFinal;
    localStorage.setItem('productos', JSON.stringify(productos));
    localStorage.setItem('compras', JSON.stringify(compras));
    
    if (event && event.preventDefault) {
        closeModal('modalCompra');
        alert('Compra realizada con éxito.');
    }
    
    loadMarketplace();
    loadMisCompras();
    if (currentUser.role === 'emprendedor') loadVentas();
}

function loadMisCompras() {
    const compras = JSON.parse(localStorage.getItem('compras')) || [];
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const container = document.getElementById('comprasContainer');
    const misCompras = compras.filter(c => c.compradorId === currentUser.id);
    if (misCompras.length === 0) {
        container.innerHTML = '<p class="empty-message">Aún no tienes compras</p>';
        return;
    }
    container.innerHTML = misCompras.map(compra => {
        const producto = productos.find(p => p.id === compra.productoId) || { title: 'Producto eliminado' };
        return `
            <div class="reserva-card">
                <h4>${producto.title}</h4>
                <div class="reserva-info">
                    <p><strong>Cantidad:</strong> ${compra.cantidad}</p>
                    <p><strong>Total:</strong> $${compra.total}</p>
                    <p><strong>Fecha:</strong> ${formatDate(compra.fecha)}</p>
                </div>
            </div>
        `;
    }).join('');
}

function enviarSolicitudAyuda(event) {
    event.preventDefault();
    const usuarioId = document.getElementById('ayudaUsuarioId')?.value || document.getElementById('ayudaUsuarioIdEmprendedor')?.value;
    const tipo = document.getElementById('tipoAyuda')?.value || document.getElementById('tipoAyudaEmprendedor')?.value;
    const mensaje = document.getElementById('mensajeAyuda')?.value || document.getElementById('mensajeAyudaEmprendedor')?.value;
    if (!usuarioId || !tipo || !mensaje) {
        return alert('Completa todos los datos de la solicitud.');
    }
    const solicitudes = JSON.parse(localStorage.getItem('solicitudes')) || [];
    solicitudes.push({
        id: generateId(),
        usuarioId: usuarioId,
        tipo: tipo,
        mensaje: mensaje,
        status: 'pendiente',
        fecha: new Date().toISOString()
    });
    localStorage.setItem('solicitudes', JSON.stringify(solicitudes));
    document.getElementById('ayudaConfirmacionText').textContent = 'Tu solicitud fue enviada correctamente. Un asesor INACAP te contactará pronto.';
    openModal('modalAyuda');
    if (currentUser.role === 'estudiante') {
        document.getElementById('tipoAyuda').value = '';
        document.getElementById('mensajeAyuda').value = '';
        loadSolicitudesEstudiante();
    } else {
        document.getElementById('tipoAyudaEmprendedor').value = '';
        document.getElementById('mensajeAyudaEmprendedor').value = '';
        loadSolicitudesEmprendedor();
    }
}

function loadSolicitudesEstudiante() {
    const solicitudes = JSON.parse(localStorage.getItem('solicitudes')) || [];
    const container = document.getElementById('misSolicitudes');
    const misSolicitudes = solicitudes.filter(s => s.usuarioId === currentUser.id);
    if (misSolicitudes.length === 0) {
        container.innerHTML = '<p class="empty-message">Aún no tienes solicitudes de ayuda</p>';
        return;
    }
    container.innerHTML = misSolicitudes.map(s => `
        <div class="help-card">
            <p><strong>Tipo:</strong> ${s.tipo}</p>
            <p>${s.mensaje}</p>
            <p><strong>Estado:</strong> ${s.status}</p>
            <p class="text-muted">${formatDate(s.fecha)}</p>
        </div>
    `).join('');
}

function loadSolicitudesEmprendedor() {
    const solicitudes = JSON.parse(localStorage.getItem('solicitudes')) || [];
    const container = document.getElementById('misSolicitudesEmprendedor');
    const misSolicitudes = solicitudes.filter(s => s.usuarioId === currentUser.id);
    if (misSolicitudes.length === 0) {
        container.innerHTML = '<p class="empty-message">Aún no tienes solicitudes de ayuda</p>';
        return;
    }
    container.innerHTML = misSolicitudes.map(s => `
        <div class="help-card">
            <p><strong>Tipo:</strong> ${s.tipo}</p>
            <p>${s.mensaje}</p>
            <p><strong>Estado:</strong> ${s.status}</p>
            <p class="text-muted">${formatDate(s.fecha)}</p>
        </div>
    `).join('');
}

// ========== EMPRENDEDOR ==========
function loadMembresia() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.id === currentUser.id);
    if (!usuario) return;
    const hoy = new Date();
    const expiracion = usuario.membershipExpiry ? new Date(usuario.membershipExpiry) : null;
    const activa = usuario.membershipActive && expiracion && expiracion > hoy;
    if (!activa && usuario.membershipActive) {
        usuario.membershipActive = false;
        usuario.membershipExpiry = null;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
    currentUser = usuario;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    document.getElementById('membresiaEstado').textContent = activa ? 'Activa' : 'Inactiva';
    document.getElementById('membresiaExpira').textContent = activa ? expiracion.toLocaleDateString('es-ES') : 'No aplica';
    // Mostrar detalles adicionales
    document.getElementById('membresiaDuracion').textContent = usuario.membershipDurationDays ? (usuario.membershipDurationDays + ' días') : '30 días';
    document.getElementById('membresiaCosto').textContent = usuario.membershipAmount ? ('$' + usuario.membershipAmount.toLocaleString('es-CL')) : '$3.200';
    document.getElementById('membresiaServicios').textContent = usuario.membershipServices ? usuario.membershipServices : 'Publicación destacada, Banner en marketplace, Soporte prioritario';
    document.getElementById('membresiaPagoFecha').textContent = usuario.membershipStartDate ? formatDate(usuario.membershipStartDate) : 'No registra pago';
}

function comprarMembresia() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.id === currentUser.id);
    if (!usuario) return;
    const hoy = new Date();
    const durationDays = 30;
    const expiracion = new Date(hoy);
    expiracion.setDate(expiracion.getDate() + durationDays);
    const amount = 3200;
    const services = 'Publicación destacada, Banner en marketplace, Soporte prioritario';

    usuario.membershipActive = true;
    usuario.membershipStartDate = hoy.toISOString();
    usuario.membershipExpiry = expiracion.toISOString();
    usuario.membershipDurationDays = durationDays;
    usuario.membershipAmount = amount;
    usuario.membershipServices = services;

    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    currentUser = usuario;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    const mensaje = `Membresía comprada con éxito por $${amount.toLocaleString('es-CL')}.
Duración: ${durationDays} días.
Servicios incluidos: ${services}.
Fecha de pago registrada: ${formatDate(hoy.toISOString())}.
Próximo pago / fin de membresía: ${expiracion.toLocaleDateString('es-ES')}.`;
    alert(mensaje);
    loadMembresia();
    showUserPanel();
    loadMisProductos();
}

function loadMisProductos() {
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const container = document.getElementById('productosVendedor');
    const usuario = JSON.parse(localStorage.getItem('usuarios')).find(u => u.id === currentUser.id);
    const activa = usuario.membershipActive && usuario.membershipExpiry && new Date(usuario.membershipExpiry) > new Date();
    if (!activa) {
        container.innerHTML = '<p class="empty-message">Necesitas una membresía activa para publicar productos.</p>';
        return;
    }
    const misProductos = productos.filter(p => p.vendedorId === currentUser.id);
    if (misProductos.length === 0) {
        container.innerHTML = '<p class="empty-message">Aún no has publicado productos</p>';
        return;
    }
    container.innerHTML = misProductos.map(producto => `
        <div class="product-card">
            <div class="sala-header">
                <h3>${producto.title}</h3>
                <div class="sala-rating">${producto.category}</div>
            </div>
            <div class="sala-body">
                <p>${producto.description}</p>
                <p><strong>Precio:</strong> $${producto.price}</p>
                <p><strong>Stock:</strong> ${producto.stock}</p>
                <div class="sala-buttons">
                    <button class="btn-editar" onclick="showProductoModal('${producto.id}')">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarProducto('${producto.id}')">Eliminar</button>
                </div>
            </div>
        </div>
    `).join('');
}

function showProductoModal(productId = null) {
    const usuario = JSON.parse(localStorage.getItem('usuarios')).find(u => u.id === currentUser.id);
    const activa = usuario.membershipActive && usuario.membershipExpiry && new Date(usuario.membershipExpiry) > new Date();
    if (!activa) return alert('Debes comprar la membresía para publicar productos.');
    editingProductId = productId;
    document.getElementById('modalProductoTitulo').textContent = productId ? 'Editar Producto' : 'Publicar Producto';
    document.getElementById('productoTitulo').value = '';
    document.getElementById('productoDescripcion').value = '';
    document.getElementById('productoPrecio').value = '';
    document.getElementById('productoStock').value = '';
    document.getElementById('productoCategoria').value = '';
    if (productId) {
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        const producto = productos.find(p => p.id === productId);
        if (!producto) return;
        document.getElementById('productoTitulo').value = producto.title;
        document.getElementById('productoDescripcion').value = producto.description;
        document.getElementById('productoPrecio').value = producto.price;
        document.getElementById('productoStock').value = producto.stock;
        document.getElementById('productoCategoria').value = producto.category;
    }
    openModal('modalProducto');
}

function guardarProducto(event) {
    event.preventDefault();
    const title = document.getElementById('productoTitulo').value;
    const description = document.getElementById('productoDescripcion').value;
    const price = parseInt(document.getElementById('productoPrecio').value, 10);
    const stock = parseInt(document.getElementById('productoStock').value, 10);
    const category = document.getElementById('productoCategoria').value;
    let productos = JSON.parse(localStorage.getItem('productos')) || [];
    if (editingProductId) {
        const producto = productos.find(p => p.id === editingProductId);
        if (producto) {
            producto.title = title;
            producto.description = description;
            producto.price = price;
            producto.stock = stock;
            producto.category = category;
        }
    } else {
        productos.push({
            id: generateId(),
            vendedorId: currentUser.id,
            title: title,
            description: description,
            price: price,
            stock: stock,
            category: category,
            source: currentUser.role === 'emprendedor' ? 'alumno' : 'inacap',
            dateAdded: new Date().toISOString()
        });
    }
    localStorage.setItem('productos', JSON.stringify(productos));
    closeModal('modalProducto');
    loadMisProductos();
    alert('Producto guardado correctamente.');
}

function eliminarProducto(productId) {
    if (!confirm('¿Eliminar este producto?')) return;
    let productos = JSON.parse(localStorage.getItem('productos')) || [];
    productos = productos.filter(p => p.id !== productId);
    localStorage.setItem('productos', JSON.stringify(productos));
    loadMisProductos();
}

function loadVentas() {
    const compras = JSON.parse(localStorage.getItem('compras')) || [];
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const container = document.getElementById('ventasContainer');
    const ventas = compras.filter(c => c.vendedorId === currentUser.id);
    if (ventas.length === 0) {
        container.innerHTML = '<p class="empty-message">Aún no tienes ventas</p>';
        return;
    }
    container.innerHTML = ventas.map(venta => {
        const producto = productos.find(p => p.id === venta.productoId) || { title: 'Producto eliminado' };
        return `
            <div class="reserva-card">
                <h4>${producto.title}</h4>
                <div class="reserva-info">
                    <p><strong>Cantidad:</strong> ${venta.cantidad}</p>
                    <p><strong>Total:</strong> $${venta.total}</p>
                    <p><strong>Fecha:</strong> ${formatDate(venta.fecha)}</p>
                </div>
            </div>
        `;
    }).join('');
}

// ========== ADMINISTRADOR ==========
function loadAdminStats() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const compras = JSON.parse(localStorage.getItem('compras')) || [];
    const totalUsuarios = usuarios.length;
    const emprendedores = usuarios.filter(u => u.role === 'emprendedor').length;
    const estudiantes = usuarios.filter(u => u.role === 'estudiante').length;
    const membresiasActivas = usuarios.filter(u => u.membershipActive && u.membershipExpiry && new Date(u.membershipExpiry) > new Date()).length;
    document.getElementById('statUsuarios').textContent = totalUsuarios;
    document.getElementById('statEmprendedores').textContent = emprendedores;
    document.getElementById('statEstudiantes').textContent = estudiantes;
    document.getElementById('statMembresias').textContent = membresiasActivas;
}

function loadUsuariosAdmin() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const container = document.getElementById('usuariosContainer');
    if (usuarios.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay usuarios registrados</p>';
        return;
    }
    container.innerHTML = usuarios.map(usuario => `
        <div class="reserva-card">
            <h4>${usuario.nombre}</h4>
            <div class="reserva-info">
                <p><strong>Correo:</strong> ${usuario.email}</p>
                <p><strong>Rol:</strong> ${usuario.role}</p>
                <p><strong>Registrado:</strong> ${formatDate(usuario.fecha_registro)}</p>
                <p><strong>Membresía:</strong> ${usuario.membershipActive ? 'Activa' : 'Inactiva'}</p>
            </div>
        </div>
    `).join('');
}

function loadSolicitudesAdmin() {
    const solicitudes = JSON.parse(localStorage.getItem('solicitudes')) || [];
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const container = document.getElementById('solicitudesContainer');
    if (solicitudes.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay solicitudes de ayuda</p>';
        return;
    }
    container.innerHTML = solicitudes.map(solicitud => {
        const usuario = usuarios.find(u => u.id === solicitud.usuarioId) || { nombre: 'Usuario Eliminado', role: 'N/A' };
        return `
            <div class="help-card">
                <p><strong>Usuario:</strong> ${usuario.nombre} (${usuario.role})</p>
                <p><strong>Tipo:</strong> ${solicitud.tipo}</p>
                <p>${solicitud.mensaje}</p>
                <p><strong>Estado:</strong> ${solicitud.status}</p>
                <p class="text-muted">${formatDate(solicitud.fecha)}</p>
                <button onclick="toggleSolicitudStatus('${solicitud.id}')">Marcar como completada</button>
            </div>
        `;
    }).join('');
}

function toggleSolicitudStatus(solicitudId) {
    const solicitudes = JSON.parse(localStorage.getItem('solicitudes')) || [];
    const solicitud = solicitudes.find(s => s.id === solicitudId);
    if (!solicitud) return;
    solicitud.status = solicitud.status === 'pendiente' ? 'completada' : 'pendiente';
    localStorage.setItem('solicitudes', JSON.stringify(solicitudes));
    loadSolicitudesAdmin();
}

// ========== CARRITO DE COMPRAS ==========
function agregarAlCarrito(productoId) {
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    
    const itemCarrito = carrito.find(item => item.productoId === productoId);
    if (itemCarrito) {
        itemCarrito.cantidad += 1;
    } else {
        carrito.push({
            productoId: productoId,
            cantidad: 1
        });
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    updateCartCount();
    alert('Producto agregado al carrito');
}

function updateCartCount() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    document.getElementById('cartCount').textContent = total;
}

function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    document.getElementById('wishlistCount').textContent = wishlist.length;
}

function loadCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const container = document.getElementById('carritoContainer');
    const totalDiv = document.getElementById('carritoTotal');
    
    if (carrito.length === 0) {
        container.innerHTML = '<p class="empty-message">Tu carrito está vacío</p>';
        totalDiv.style.display = 'none';
        return;
    }
    
    let total = 0;
    container.innerHTML = carrito.map(item => {
        const producto = productos.find(p => p.id === item.productoId) || { title: 'Producto no encontrado', price: 0 };
        const subtotal = producto.price * item.cantidad;
        total += subtotal;
        
        return `
            <div class="reserva-card">
                <h4>${producto.title}</h4>
                <div class="reserva-info">
                    <p><strong>Precio unitario:</strong> $${producto.price}</p>
                    <p><strong>Cantidad:</strong> 
                        <input type="number" min="1" value="${item.cantidad}" onchange="actualizarCantidadCarrito('${item.productoId}', this.value)" style="width: 50px; padding: 5px;">
                    </p>
                    <p><strong>Subtotal:</strong> $${subtotal}</p>
                </div>
                <button onclick="eliminarDelCarrito('${item.productoId}')" class="btn-eliminar" style="margin-top: 10px;">Eliminar</button>
            </div>
        `;
    }).join('');
    
    document.getElementById('totalCarrito').textContent = total;
    totalDiv.style.display = 'block';
}

function actualizarCantidadCarrito(productoId, cantidad) {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const item = carrito.find(i => i.productoId === productoId);
    if (item) {
        item.cantidad = parseInt(cantidad, 10);
        if (item.cantidad <= 0) {
            eliminarDelCarrito(productoId);
        } else {
            localStorage.setItem('carrito', JSON.stringify(carrito));
            loadCarrito();
            updateCartCount();
        }
    }
}

function eliminarDelCarrito(productoId) {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const filtered = carrito.filter(item => item.productoId !== productoId);
    localStorage.setItem('carrito', JSON.stringify(filtered));
    loadCarrito();
    updateCartCount();
}

function vaciarCarrito() {
    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
        localStorage.setItem('carrito', JSON.stringify([]));
        loadCarrito();
        updateCartCount();
    }
}

function procesarCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carrito.length === 0) return alert('El carrito está vacío');
    
    carrito.forEach(item => {
        confirmarCompra({ preventDefault: () => {} }, item.productoId, item.cantidad);
    });
    
    localStorage.setItem('carrito', JSON.stringify([]));
    loadCarrito();
    updateCartCount();
    loadMisCompras();
}

// ========== LISTA DE DESEADOS ==========
function agregarADeseados(productoId) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (wishlist.find(id => id === productoId)) {
        wishlist.splice(wishlist.indexOf(productoId), 1);
        alert('Producto removido de deseados');
    } else {
        wishlist.push(productoId);
        alert('Producto agregado a deseados');
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    loadMarketplace();
}

function loadDeseados() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const container = document.getElementById('deseadosContainer');
    
    if (wishlist.length === 0) {
        container.innerHTML = '<p class="empty-message">No tienes productos en tu lista de deseados</p>';
        return;
    }
    
    const deseados = productos.filter(p => wishlist.includes(p.id));
    container.innerHTML = deseados.map(producto => `
        <div class="product-card">
            <div class="sala-header">
                <h3>${producto.title}</h3>
                <div class="sala-rating">${producto.category}</div>
            </div>
            <div class="sala-body">
                <p>${producto.description}</p>
                <p><strong>Precio:</strong> $${producto.price}</p>
                <p><strong>Stock:</strong> ${producto.stock}</p>
                <div class="sala-buttons">
                    <button onclick="agregarAlCarrito('${producto.id}')" ${producto.stock === 0 ? 'disabled' : ''}>Comprar</button>
                    <button onclick="agregarADeseados('${producto.id}')" class="btn-editar">Remover de deseados</button>
                </div>
            </div>
        </div>
    `).join('');
}

// ========== ZONA DE EMPRENDEDOR ==========
function abrirZonaEmprendedor() {
    const tieneMembresia = currentUser.membershipActive && currentUser.membershipExpiry && new Date(currentUser.membershipExpiry) > new Date();
    if (!tieneMembresia) {
        alert('Debes tener una membresía activa para acceder a la zona de emprendedor');
        if (confirm('¿Deseas comprar una membresía ahora?')) {
            comprarMembresia();
        }
        return;
    }
    document.getElementById('emprendedorPanel').classList.add('active');
    document.getElementById('emprendedorDisplay').textContent = `👤 ${currentUser.nombre}`;
    document.getElementById('ayudaUsuarioIdEmprendedor').value = currentUser.id;
    loadMembresia();
    loadMisProductos();
    loadVentas();
    loadSolicitudesEmprendedor();
}

function cerrarZonaEmprendedor() {
    document.getElementById('emprendedorPanel').classList.remove('active');
}

// ========== UTILIDADES ==========
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES').slice(0, 5);
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ========== MANEJO DE ESTADO DE RED (ONLINE / OFFLINE) ==========
function updateNetworkStatus() {
    const statusEl = document.getElementById('network-status');
    if (!statusEl) return;
    if (navigator.onLine) {
        statusEl.style.display = 'none';
        statusEl.textContent = '';
    } else {
        statusEl.style.display = 'block';
        statusEl.textContent = 'Conexión perdida — estás offline';
    }
}

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);
document.addEventListener('DOMContentLoaded', updateNetworkStatus);
