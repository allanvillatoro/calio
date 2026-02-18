# Configuración de Vercel para Despliegue Automático

## ¿Cómo funciona?

Una vez configurado, cada vez que hagas `git push` a tu repositorio de GitHub, Vercel desplegará automáticamente los cambios.

## Paso a Paso: Conectar GitHub con Vercel

### 1. Crear cuenta en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Haz clic en **Sign Up**
3. Selecciona **Continue with GitHub** (recomendado)
4. Autoriza a Vercel a acceder a tus repositorios

### 2. Importar tu Proyecto

1. Una vez dentro del dashboard de Vercel
2. Haz clic en **Add New...** → **Project**
3. Selecciona tu repositorio de GitHub (el que contiene este proyecto)
4. Si no aparece, haz clic en **Adjust GitHub App Permissions** y autoriza el acceso

### 3. Configurar el Proyecto

Vercel detectará automáticamente que es un proyecto Next.js y configurará:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (automático)
- **Output Directory**: `.next` (automático)
- **Install Command**: `npm install` (automático)

**No necesitas cambiar nada**, solo haz clic en **Deploy**

### 4. Variables de Entorno (si las necesitas)

Si en el futuro agregas variables de entorno (como API keys), puedes agregarlas en:
- **Settings** → **Environment Variables**

Por ahora, no necesitas ninguna.

### 5. Primer Despliegue

1. Vercel comenzará a construir tu proyecto
2. Verás el progreso en tiempo real
3. Cuando termine, tendrás una URL como: `tu-proyecto.vercel.app`
4. ¡Listo! Tu sitio está en vivo

## Despliegues Automáticos

### ¿Qué pasa cuando haces push?

1. Haces cambios en tu código local
2. Haces commit: `git commit -m "mensaje"`
3. Haces push: `git push`
4. **Vercel detecta el push automáticamente**
5. Inicia un nuevo build
6. Despliega la nueva versión
7. Tu sitio se actualiza automáticamente

### Tipos de Despliegues

- **Production**: Cada push a la rama `main` (o `master`) despliega a producción
- **Preview**: Cada push a otras ramas crea un preview deployment (URL temporal)

## Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio:

1. Ve a **Settings** → **Domains**
2. Agrega tu dominio
3. Vercel te dará instrucciones para configurar DNS
4. Una vez configurado, tu sitio estará en `tudominio.com`

**Costo:** Solo pagas el dominio (~$10-15/año), Vercel no cobra nada extra.

## Monitoreo

En el dashboard de Vercel puedes ver:
- Historial de despliegues
- Logs de build
- Analytics (si lo habilitas)
- Errores y warnings

## Notas Importantes

- ✅ **Gratis para proyectos personales**
- ✅ **Despliegue automático con cada push**
- ✅ **SSL/HTTPS automático** (gratis)
- ✅ **CDN global** (gratis)
- ✅ **Preview deployments** para cada pull request

## Troubleshooting

### Si el build falla:

1. Revisa los logs en el dashboard de Vercel
2. Verifica que `package.json` tenga todas las dependencias
3. Asegúrate de que el proyecto compile localmente: `npm run build`

### Si no se despliega automáticamente:

1. Verifica que Vercel esté conectado a tu repositorio
2. Ve a **Settings** → **Git** y verifica la conexión
3. Asegúrate de hacer push a la rama correcta (normalmente `main`)

## Comandos Útiles

```bash
# Verificar que el proyecto compile localmente
npm run build

# Probar localmente antes de hacer push
npm run dev

# Ver el estado de tu repositorio
git status

# Hacer commit y push (esto desplegará automáticamente)
git add .
git commit -m "Descripción de los cambios"
git push
```

