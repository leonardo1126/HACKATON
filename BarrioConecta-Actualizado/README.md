# Barrio Conecta - Spring Boot

Proyecto web responsive con Java 17, Spring Boot, Thymeleaf, Spring Data JPA y MySQL.

## Requisitos
- JDK 17
- Visual Studio Code
- Extensiones de VS Code: Extension Pack for Java y Spring Boot Extension Pack
- Maven instalado o soporte Maven de VS Code
- MySQL Server y MySQL Workbench

## 1. Crear la base de datos
1. Abre MySQL Workbench y conéctate a tu servidor MySQL local.
2. Abre `database/barrio_conecta_db.sql`.
3. Ejecuta el script completo.
4. La base se llama `barrio_conecta_db`.

MySQL Workbench es el programa para administrar el servidor; la aplicación Spring Boot se conecta al servicio MySQL local.

## 2. Configurar la conexión
Abre `src/main/resources/application.properties` y revisa:
- `spring.datasource.username`
- `spring.datasource.password`

Por defecto se usa el usuario `root` y contraseña vacía. Cambia la contraseña según tu instalación.

## 3. Abrir en Visual Studio Code
1. Descomprime el ZIP.
2. En VS Code selecciona Archivo > Abrir carpeta.
3. Selecciona la carpeta `BarrioConecta-SpringBoot`.
4. Espera a que Maven descargue las dependencias.
5. Abre `BarrioConectaApplication.java` y pulsa Run, o ejecuta desde la terminal:
   `mvn spring-boot:run`
6. Abre `http://localhost:8080`.

## Funciones incluidas
- Registro e inicio/cierre de sesión de vecinos.
- Publicación y consulta de servicios y productos.
- Muro de favores: ofrecer o solicitar ayuda.
- Reportes comunitarios de emergencia.
- Mapa de publicaciones con coordenadas.
- Perfil básico.
- Diseño responsive.

## Cuenta
Registra una cuenta desde el enlace "Crear cuenta". No hay credenciales predeterminadas.

## Notas
- El mapa necesita Internet para cargar los mosaicos de OpenStreetMap.
- Para ubicar una publicación en el mapa, permite que el navegador comparta ubicación o ingresa coordenadas.
- Este proyecto es una base funcional de demostración. Los reportes no están verificados por autoridades y no sustituyen servicios oficiales de emergencia.
- Antes de desplegarlo públicamente se deben añadir controles antiabuso, verificación de vecinos, protección CSRF completa, HTTPS, políticas de privacidad y gestión de permisos.


## Mapa vecinal mejorado
- El registro permite guardar latitud/longitud con geolocalización del navegador.
- La ubicación puede actualizarse desde Mi perfil.
- Servicios/productos, favores y emergencias aparecen como marcadores de distintos colores si se publican con coordenadas.
- El mapa consulta `/api/mapa/publicaciones` y filtra en un radio configurable de 2 a 30 km.
- Al seleccionar un marcador se abre una burbuja con detalles básicos.
- Las publicaciones anteriores sin coordenadas no aparecerán hasta que se registren nuevamente con ubicación.
- La geolocalización requiere permiso y HTTPS o localhost; el mapa y sus mosaicos necesitan internet.
- Por privacidad, usar una ubicación aproximada y no el domicilio exacto.
- Los botones de las burbujas enlazan a las secciones generales; la mensajería/aceptación de ayuda y las fichas individuales quedan como siguiente mejora.


## Directorio de grupos de apoyo para emergencias
Se agregó un directorio comunitario para registrar y consultar grupos vecinales, voluntariados y servicios de apoyo. Incluye categorías de salud, alimentos/agua, refugio, transporte, rescate/seguridad, herramientas, apoyo emocional y comunicaciones; zona de cobertura, contacto, disponibilidad y ubicación aproximada opcional.

Rutas:
- `GET /emergencias/grupos`: directorio y filtro por categoría.
- `GET /emergencias/grupos/nuevo`: formulario (requiere iniciar sesión).
- `POST /emergencias/grupos/nuevo`: registra un recurso.
- `POST /emergencias/grupos/{id}/desactivar`: permite al autor retirar su publicación.

La tabla `grupos_apoyo` se crea automáticamente con Hibernate al iniciar (`spring.jpa.hibernate.ddl-auto=update`). Los recursos nuevos quedan como **No verificado**. No se deben presentar como entidades oficiales ni asumir que están disponibles sin confirmación. El prototipo aún no incorpora flujo de aprobación administrativa, chat ni confirmación de disponibilidad.

## Mejoras de publicaciones y alertas SOS

- El autor de un servicio o producto puede eliminar su publicación desde la tarjeta correspondiente.
- El autor de una solicitud de ayuda puede marcarla como resuelta cuando ya recibió apoyo; deja de aparecer en el mapa. También puede eliminarla manualmente.
- El autor de una alerta de emergencia puede marcarla como atendida para retirarla del mapa.
- En el mapa se incluye el botón **SOS EMERGENCIA**. Solicita confirmación antes de continuar, obtiene la ubicación del navegador y crea una alerta roja `SOS`.
- El mapa consulta novedades cada 10 segundos. Cuando detecta un SOS nuevo, intenta mostrar una notificación del navegador y reproducir un aviso sonoro. Cada vecino debe activar los avisos desde el botón **Activar avisos y sonido** y conceder permisos.
- Para usar geolocalización se requiere `localhost` o HTTPS. Los avisos se reciben mientras la página del mapa permanece abierta; el navegador puede limitar sonido/notificaciones en segundo plano y no hay notificación push cuando el usuario está desconectado.
- Los grupos de apoyo se simplificaron visualmente como un directorio de recursos vecinales con contacto, zona y disponibilidad.

**Importante:** el botón SOS es una función de coordinación comunitaria del prototipo. No contacta automáticamente a la policía, bomberos ni servicios médicos. Ante una emergencia real, comunícate también con los servicios oficiales.


### Últimas mejoras
- Cadena de favores: el formulario registra únicamente necesidades de ayuda; otras personas pueden contactar al solicitante por correo.
- Servicios/productos: imagen opcional (máximo 5 MB), guardada en la carpeta `uploads` del directorio desde el que se ejecuta la aplicación.


## Mejoras recientes
- La cuenta de usuario admite teléfono/WhatsApp para facilitar el contacto en Cadena de Favores.
- Los recursos vecinales pueden editarse o eliminarse por su propietario.
- Los formularios de publicación y el perfil usan un mapa interactivo Leaflet/OpenStreetMap: buscar una dirección, marcar/mover el punto o usar la ubicación actual.
- La columna `usuarios.telefono` se agrega automáticamente al iniciar porque `spring.jpa.hibernate.ddl-auto=update`.
- Para WhatsApp, los números peruanos de 9 dígitos se interpretan como `+51`; también puedes escribir el prefijo internacional.

## Cambiar la imagen principal del inicio
La imagen de fondo del banner principal se encuentra en:
`src/main/resources/static/images/home-hero-bg.svg`

Puedes reemplazar ese archivo por otra imagen conservando el nombre y la extensión SVG. Si prefieres usar JPG o PNG, guarda la imagen en `static/images/` y cambia la ruta de `--bc-home-hero-image` al final de `static/css/styles.css` (por ejemplo `url('/images/mi-fondo.jpg')`). La imagen se adapta automáticamente a pantallas grandes y móviles.

## Mejoras de servicios: calificaciones y distancia
- Las tarjetas de servicios muestran una imagen compacta a la izquierda.
- La comunidad puede calificar cada publicación de 1 a 5 estrellas. Cada cuenta puede registrar o actualizar su propia calificación.
- Se muestra el promedio y el número de opiniones.
- La distancia aproximada se calcula con la ubicación del visitante y las coordenadas de cada publicación.
- En el directorio se puede ordenar por cercanía.
- La tabla `valoraciones_servicio` se crea automáticamente con Hibernate.
- Las publicaciones sin coordenadas muestran que no tienen ubicación registrada. Al publicar, marca la ubicación con el selector de mapa.
- La ubicación del visitante no se guarda; el cálculo ocurre en el navegador y requiere permiso de geolocalización.
