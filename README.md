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
- `/reservas/nueva`: confirma una selección de varias prendas pertenecientes a
  una única sucursal, con fecha y hora aproximada de visita.
- `/reservas`: historial y cancelación de reservas del cliente.
- `/reservas/sucursal`: bandeja interna para confirmar, preparar, completar o
  cancelar reservas; admite administrador y encargado.
- `/carrito`: edición de prendas, resumen y confirmación del pedido web; admite
  clientes autenticados.
- `/pedidos`: historial del cliente con detalle y comprobante imprimible.
- `/pedidos/gestion`: consulta operativa por sucursal, canal, estado y fechas;
  admite administrador, encargado y cajero con alcance aplicado por backend.
- `/pos`: búsqueda de existencias por SKU, venta con cliente opcional y
  comprobante imprimible; admite administrador y cajero.
- `/pedidos/:id/pago`: pago real mediante Stripe Payment Element cuando el
  backend usa `PAYMENT_GATEWAY_PROVIDER=stripe`; el adaptador de prueba continúa
  disponible y se identifica explícitamente como simulación.
- `/pedidos/:id/devolucion`: selección de detalles, cantidades y motivos para
  solicitar una devolución parcial.
- `/devoluciones`: historial del cliente, cancelación de solicitudes pendientes
  y estado del reembolso.
- `/devoluciones/gestion`: aprobación, cancelación y finalización con decisiones
  explícitas de reposición y reembolso; admite administrador y encargado.
- `/reportes`: dashboard de ventas, inventario, reservas y devoluciones con
  filtros por período y sucursal; admite administrador y encargado.

El detalle de `/catalogo/:id` consulta la disponibilidad de la variante
seleccionada, la presenta por sucursal y permite añadirla a un borrador de
reserva conservado en `sessionStorage`.

Los totales visibles del carrito y POS ayudan a la interacción, pero el pedido
solo usa los precios, disponibilidad y totales recalculados por FastAPI. Desde
“Mis reservas” el cliente puede escoger cuántas unidades reservadas comprar;
las no elegidas se liberan automáticamente al completar la conversión.

El JWT se conserva en `sessionStorage`, se adjunta mediante un interceptor y se
elimina al cerrar sesión o cuando `/auth/me` rechaza la restauración. Las rutas
administrativas generales requieren `administrador`; inventario admite también
`encargado` y `cajero`, pero el backend limita sucursal y acciones. Ocultar
enlaces en la interfaz no sustituye la autorización del backend.

El dashboard presenta indicadores, tablas y gráficos simples calculados por la
API. El período se aplica a ventas, reservas y devoluciones; inventario conserva
su fotografía actual. La interfaz identifica expresamente que la explicación
con IA está diferida y no condiciona la visualización de los datos.

La pantalla de pago carga Stripe.js con la clave publicable entregada por el
backend y monta Stripe Elements con el `client_secret` de un `PaymentIntent`.
Los datos de tarjeta se envían directamente a Stripe. El navegador no marca el
pedido como pagado por sí mismo: consulta el backend hasta observar el estado
registrado por el webhook firmado.
