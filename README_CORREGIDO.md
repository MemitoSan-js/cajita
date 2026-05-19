# Mi Cajita - proyecto corregido

Este paquete deja el backend y el frontend conectados usando el puerto `4001` para evitar el error que tenías con el puerto `4000` ocupado.

## 1. Backend

Abre una terminal en:

```powershell
cd C:\Users\gmemo\Documents\cajita\backend
```

Instala dependencias si la carpeta no tiene `node_modules`:

```powershell
npm install
```

Crea o actualiza el administrador:

```powershell
npm run seed:admin
```

Inicia el backend:

```powershell
npm run dev
```

Debe salir algo como:

```txt
MongoDB conectado: cajitaBD
Servidor corriendo en puerto 4001
```

Prueba en el navegador:

```txt
http://localhost:4001/api/health
```

## 2. Frontend

Abre otra terminal en:

```powershell
cd C:\Users\gmemo\Documents\cajita\frontend
```

Instala dependencias si la carpeta no tiene `node_modules`:

```powershell
npm install
```

Inicia el frontend:

```powershell
npm run dev
```

Entra a la URL que te dé Vite, normalmente:

```txt
http://localhost:5173
```

## 3. Usuario de prueba

```txt
Correo: admin@correo.com
Contraseña: 123456
```

## 4. Base de datos

El archivo `backend/.env` apunta a:

```env
MONGO_URI=mongodb://127.0.0.1:27017/cajitaBD
```

En MongoDB Compass deben aparecer estas colecciones dentro de `cajitaBD`:

```txt
cajas
usuarios
metas_globales
```

No crees colecciones manualmente si no es necesario. El backend las crea cuando guardas datos.

## 5. Importante

El error anterior se debía a que el frontend intentaba conectarse al backend, pero el backend no estaba disponible correctamente. Además, tu puerto `4000` estaba ocupado. Por eso este proyecto quedó configurado para trabajar en `4001`.

## 6. Protección de rutas por rol

Esta versión ya bloquea las rutas por tipo de usuario.

Frontend:

```txt
/login          -> público
/cajita         -> solo rol usuario
/administrador  -> solo rol admin
```

Si un usuario normal intenta entrar manualmente a `/administrador`, el sistema lo regresa a `/cajita`. Si un administrador intenta entrar manualmente a `/cajita`, el sistema lo regresa a `/administrador`.

Backend:

```txt
/api/cajas      -> requiere sesión; usuario solo ve/modifica sus propias cajitas; admin ve/modifica todas
/api/cajitas    -> alias protegido igual que /api/cajas
/api/usuarios   -> solo admin
/api/users      -> solo admin
/api/metas      -> solo admin
/api/auth/login -> público
```

El login ahora devuelve un token de sesión. El frontend lo guarda en `localStorage` como `token` y lo envía en cada petición usando el encabezado `Authorization: Bearer <token>`.

Si después de actualizar te sigue dejando entrar raro, borra la sesión vieja del navegador:

```txt
DevTools > Application > Local Storage > borrar usuario y token
```

O simplemente cierra sesión y vuelve a iniciar sesión.
