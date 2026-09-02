# Frontend de la tienda de ropa

Aplicación Angular 21 standalone del e-commerce académico. Consume la API REST
versionada de FastAPI y utiliza Tailwind CSS para la interfaz.

## Preparación

```powershell
npm install
```

La configuración de desarrollo usa:

```text
http://localhost:8000/api/v1
```

La compilación de producción usa `/api/v1`, de modo que el dominio o proxy del
despliegue pueda resolver el backend sin incluir direcciones locales en el
bundle.

## Ejecución

Primero inicia FastAPI en el puerto `8000` y después ejecuta:

```powershell
npm start
```

Abre `http://localhost:4200`. La pantalla inicial informa por separado si
FastAPI y PostgreSQL están disponibles. Si PostgreSQL todavía no fue creado, la
API aparecerá disponible y la base como pendiente.

## Verificación

```powershell
npm test -- --watch=false
npm run build
```

## Organización inicial

- `core/config`: URL e inyección de configuración de la API.
- `core/http`: normalización común de errores HTTP.
- `core/services`: salud de la API y notificaciones SweetAlert2.
- `layouts`: shells de navegación por tipo de experiencia.
- `features`: páginas cargadas de forma lazy.
- `shared`: modelos y elementos visuales reutilizables.

La lógica de seguridad, inventario, precios y permisos siempre tendrá como
autoridad al backend; el frontend solo presenta el estado recibido por la API.

## Autenticación

- `/auth/registro`: alta pública de clientes.
- `/auth/login`: inicio de sesión.
- `/perfil`: información de la cuenta autenticada.
- `/admin/usuarios`: CRUD de usuarios y activación/desactivación.
- `/admin/roles`: CRUD de roles adicionales.
- `/admin/sucursales`: administración de ciudades y sucursales con búsqueda,
  paginación y activación/desactivación.
- `/admin/categorias`: CRUD y activación de categorías.
- `/admin/proveedores`: CRUD de proveedores genéricos con sus datos de contacto.
- `/catalogo`: catálogo público con búsqueda, filtros, paginación y detalle de
  variantes e imágenes.
- `/admin/catalogo`: administración de tallas, colores, temporadas, colecciones,
  productos, variantes e imágenes por URL.
- `/inventario`: panel de existencias, filtros, recepción, ajustes e historial;
  admite administrador, encargado y cajero, con acciones según el rol.

El detalle de `/catalogo/:id` consulta la disponibilidad de la variante
seleccionada y la presenta por sucursal.

El JWT se conserva en `sessionStorage`, se adjunta mediante un interceptor y se
elimina al cerrar sesión o cuando `/auth/me` rechaza la restauración. Las rutas
administrativas generales requieren `administrador`; inventario admite también
`encargado` y `cajero`, pero el backend limita sucursal y acciones. Ocultar
enlaces en la interfaz no sustituye la autorización del backend.
