# Guía de Despliegue Simple

Esta aplicación funciona sin backend. Solo necesitas modificar el archivo JSON y volver a desplegar.

**Nota:** Las URLs de imágenes en `data/products.json` son ejemplos de Unsplash. Debes reemplazarlas con URLs de Cloudinary cuando subas tus propias imágenes.

## Estructura de Datos

Los productos se almacenan en: `data/products.json`

Cada producto tiene esta estructura:
```json
{
  "id": "1",
  "name": "Nombre del Producto",
  "description": "Descripción del producto",
  "price": 5999.99,
  "image": "URL_DE_LA_IMAGEN",
  "quantity": 5
}
```

## Cómo Agregar/Modificar Productos

1. Edita el archivo `data/products.json`
2. Agrega, modifica o elimina productos según necesites
3. Guarda el archivo
4. Haz commit y push a tu repositorio
5. Vercel desplegará automáticamente los cambios

## Cómo Subir Imágenes con Cloudinary

Cloudinary es el servicio que usamos para almacenar las imágenes. Tiene una interfaz web completa y un plan gratuito generoso.

### Plan Gratuito de Cloudinary

- ✅ **25 GB de almacenamiento** (más que suficiente para una joyería)
- ✅ **25 millones de transformaciones/mes** (redimensionar, optimizar, etc.)
- ✅ **Sin límites de ancho de banda**
- ✅ **Interfaz web completa** - No necesitas usar terminal

### Paso a Paso: Subir Imágenes

1. **Crear cuenta en Cloudinary:**
   - Ve a [https://cloudinary.com](https://cloudinary.com)
   - Haz clic en **Sign Up for Free**
   - Completa el registro (es gratis)

2. **Acceder a Media Library:**
   - Una vez dentro de tu dashboard
   - Haz clic en **Media Library** en el menú lateral izquierdo

3. **Subir una imagen:**
   - Haz clic en el botón **Upload** (arriba a la derecha)
   - Selecciona la imagen desde tu computadora
   - Espera a que se suba (verás una barra de progreso)

4. **Obtener la URL:**
   - Haz clic en la imagen que acabas de subir
   - En el panel derecho, verás la información de la imagen
   - Busca el campo **URL** o **Delivery URL**
   - Haz clic en el ícono de copiar 📋 para copiar la URL
   - La URL se verá algo así: `https://res.cloudinary.com/tu-cloud-name/image/upload/v1234567890/imagen.jpg`

5. **Usar la URL en tu JSON:**
   - Abre `data/products.json`
   - Pega la URL en el campo `image` del producto
   - Guarda el archivo

### Ejemplo de URL de Cloudinary

```json
{
  "id": "1",
  "name": "Anillo de Compromiso",
  "description": "Descripción...",
  "price": 5999.99,
  "image": "https://res.cloudinary.com/tu-cloud-name/image/upload/v1234567890/anillo-compromiso.jpg",
  "quantity": 5
}
```

### Transformaciones de Imagen (Opcional)

Cloudinary permite transformar imágenes directamente desde la URL. Por ejemplo:

- **Redimensionar:** Agrega `w_800,h_800` a la URL
- **Optimizar:** Agrega `f_auto,q_auto` para formato y calidad automáticos
- **Recortar:** Agrega `c_fill` para recortar manteniendo proporción

Ejemplo de URL con transformaciones:
```
https://res.cloudinary.com/tu-cloud-name/image/upload/w_800,h_800,c_fill,f_auto,q_auto/v1234567890/imagen.jpg
```

**Nota:** Para empezar, puedes usar la URL básica sin transformaciones. Cloudinary optimiza automáticamente las imágenes.

## Flujo de Trabajo Recomendado

1. **Preparar imágenes:**
   - Ve a [Cloudinary Media Library](https://cloudinary.com/console/media_library)
   - Sube tus imágenes de joyería
   - Copia las URLs de cada imagen

2. **Editar productos:**
   - Abre `data/products.json`
   - Agrega/modifica productos con las URLs de Cloudinary
   - Guarda el archivo

3. **Desplegar:**
   ```bash
   git add data/products.json
   git commit -m "Actualizar productos"
   git push
   ```
   Vercel desplegará automáticamente los cambios.

## Notas Importantes

- El archivo JSON debe ser válido (verifica la sintaxis)
- Los IDs deben ser únicos
- Los precios están en lempiras (L.)
- Las URLs de imágenes deben ser accesibles públicamente
- Después de cada cambio en `products.json`, necesitas hacer push para que se refleje en producción

## Estructura del JSON

El archivo `products.json` es un array de objetos. Ejemplo:

```json
[
  {
    "id": "1",
    "name": "Anillo de Compromiso",
    "description": "Descripción...",
    "price": 5999.99,
    "image": "https://res.cloudinary.com/tu-cloud-name/image/upload/v1234567890/imagen.jpg",
    "quantity": 5
  }
]
```

