# Plan: catalogo de grabados laser

## Objetivo

Agregar un catalogo publico de muestras de grabado laser en Calio. El catalogo debe verse igual que el catalogo actual de joyas, permitir ver el detalle de una muestra, agregarla al carrito y mezclarla con productos de joyeria.

El acceso al catalogo de grabados debe estar solamente en la seccion de grabado laser de la pagina principal, no en el menu/listado de categorias de joyas.

El catalogo publico de grabados debe titularse: `Explora nuestros grabados`.

## Decision recomendada

Crear una tabla separada para los grabados laser.

Motivos:

- Los grabados no son una categoria de joyeria y no deben aparecer en el menu de joyas.
- Una tabla separada permite que los IDs tengan su propia secuencia, independiente de productos.
- Evita agregar reglas condicionales a la tabla `products`, que hoy esta modelada para piezas fisicas de inventario.
- Permite evolucionar campos especificos de grabados sin contaminar el modelo de productos.

La tabla puede exponer los grabados al frontend con una forma compatible con el catalogo actual. Es decir, internamente serian `laserEngravings`, pero visualmente se renderizarian como items comprables con `id`, `slug`, `name`, `description`, `price`, `quantity`, `images`, `discount` y `priceWithDiscount`.

## Alternativa evaluada: usar `products`

Se podria agregar un campo como `kind` o `productType` a `products`, por ejemplo `jewelry` y `laser_engraving`.

No lo recomiendo para este caso porque:

- Compartiria la misma secuencia numerica de IDs de productos, salvo que se cambie el esquema de IDs.
- Obliga a filtrar grabados en todos los flujos de joyas para que no aparezcan como productos normales.
- Mezcla reglas de producto fisico con reglas de muestras de grabado.
- Hace mas probable que un grabado aparezca accidentalmente en categorias publicas, admin o reportes de productos.

Solo elegiria esta opcion si se quisiera administrar todo como un unico inventario y aceptar IDs compartidos.

## Modelo de datos propuesto

Crear `laser_engravings` en `db/schema.ts`.

Campos iniciales:

- `id`: `bigint` primary key con `generatedByDefaultAsIdentity()`, igual que productos pero con secuencia propia de la tabla.
- `slug`: texto requerido y unico, usado para URLs publicas y SEO.
- `name`: texto requerido.
- `description`: texto requerido.
- `price`: numeric requerido.
- `quantity`: integer requerido.
- `discount`: integer requerido, default `0`.
- `images`: jsonb de `string[]`, requerido.
- `createdAt`: timestamp requerido.
- `updatedAt`: timestamp requerido.

Reglas de negocio:

- Los grabados tienen precio fijo, igual que una pieza vendible.
- Los grabados tienen `quantity` porque representan piezas base con inventario disponible.
- El carrito no debe permitir agregar mas unidades que las disponibles en `quantity`, igual que con joyas.
- Los grabados no tienen `inStore`. Aunque tengan inventario de piezas base, siempre se trabajan primero en laboratorio y luego se coordinan para envio o entrega.

Por que `bigint` + `slug`:

- Mantiene IDs internos simples y consistentes con productos.
- No comparte secuencia con `products` porque vive en una tabla separada.
- Evita URLs largas o poco legibles.
- Mejora SEO y legibilidad con rutas basadas en slug, por ejemplo `/productos/grabado-nombre-fecha`.

Nota importante: los productos de joyeria deben seguir siendo accesibles por ID numerico, por ejemplo `/productos/2`, porque clientes ya tienen enlaces compartidos por referencia. La ruta de detalle tambien puede aceptar slug para joyas y grabados, pero nunca debe romper los enlaces numericos existentes de productos.

## Contrato compartido de catalogo

Hoy el catalogo y el carrito usan `Product`. Para reutilizar el catalogo sin tratar grabados como productos, crear un tipo compartido mas neutral:

```ts
export type CatalogItemKind = 'product' | 'laser-engraving';

export interface CatalogItem {
  id: string;
  sourceId: string;
  slug: string;
  kind: CatalogItemKind;
  name: string;
  description: string;
  price: number;
  discount: number;
  priceWithDiscount: number;
  quantity: number;
  images: string[];
  inStore?: boolean;
  category?: Category;
}
```

Consideraciones:

- `sourceId` guarda el ID real de la tabla.
- `slug` guarda el identificador publico para URL y SEO.
- `inStore` es opcional porque solo aplica a productos de joyeria, no a grabados.
- `id` puede ser una clave estable para UI/carrito, por ejemplo `product:123` o `laser-engraving:1`.
- `kind` permite resolver rutas, mensajes y operaciones sin inferir desde el formato del ID.
- Para productos existentes se mapearia `id: product:${product.id}`, `sourceId: String(product.id)`, `slug: product.slug ?? String(product.id)`, `kind: product`.
- Para grabados se mapearia `id: laser-engraving:${engraving.id}`, `sourceId: String(engraving.id)`, `slug: engraving.slug`, `kind: laser-engraving`.

Esto evita que un producto `123` y un grabado `123` se mezclen en la misma linea del carrito, aunque ambos usen IDs numericos internos.

## Rutas publicas

Agregar:

- `/grabados`: catalogo publico de grabados laser.

Mantener:

- `/catalogo`: catalogo de joyas.
- `/productos/[id-or-slug]`: detalle compartido para joyas y grabados.

Detalle compartido:

- `app/productos/[id]/page.tsx` puede seguir usando el parametro dinamico actual, aunque internamente se trate como `idOrSlug`.
- Si el parametro es numerico, debe resolver producto por ID primero para preservar URLs existentes como `/productos/2`.
- Si no encuentra producto por ID, o si el parametro no es numerico, debe resolver por slug en productos y grabados.
- Los productos de joyeria pueden tener slug publico opcional, por ejemplo `/productos/joya-2`, siempre que no cree conflicto con slugs de grabados.
- El resultado se normaliza a `CatalogItem` para renderizar el mismo layout.
- Las URLs nuevas de cards y carrito pueden apuntar a `/productos/${slug}` cuando el item tenga slug. Para productos sin slug, deben seguir apuntando a `/productos/${sourceId}`.

Regla de slugs:

- Los slugs deben ser unicos en el espacio publico de detalle. No puede existir un producto y un grabado con el mismo slug si ambos viven bajo `/productos/[id-or-slug]`.
- Para garantizarlo, crear una funcion/servicio de resolucion de rutas que verifique conflictos entre productos y grabados antes de guardar o actualizar slugs.
- Si se agrega `slug` a productos, mantener tambien `findById` para compatibilidad permanente con links existentes.

## API y repositorios

Crear una capa paralela a productos:

- `lib/interfaces/laser-engraving.ts`
- `lib/repositories/laser-engravings/laser-engravings-repository.interface.ts`
- `lib/repositories/laser-engravings/drizzle-laser-engravings-repository.ts`
- `lib/repositories/laser-engravings/drizzle-laser-engravings-repository.helpers.ts`
- `app/api/laser-engravings/schemas.ts`
- `app/api/laser-engravings/route.ts`
- `app/api/laser-engravings/[id]/route.ts`, si se necesita CRUD REST por ID interno.

Metodos del repositorio:

- `save`
- `findById`
- `findAll`
- `updateById`
- `deleteById`

Filtros iniciales:

- `query`
- `page`
- `limit`
- `includeOutOfStock`, con la misma regla actual: publico excluye agotados, admin los puede ver

No incluir `category` en grabados.
No incluir `inStore` en grabados.

### Reutilizacion backend

Products y laser engravings comparten muchas propiedades y operaciones: `name`, `description`, `price`, `quantity`, `discount`, `images`, `createdAt`, `updatedAt`, `findAll`, paginacion, busqueda por texto, mapeo de precio con descuento y filtrado de agotados.

Recomendacion:

- Evitar herencia de clases como primera opcion. En TypeScript suele ser mas claro reutilizar funciones puras, tipos compartidos y composicion.
- Crear tipos base para entidades vendibles, por ejemplo `SellableItem`, `SellableItemChanges`, `SellableItemFilters` y `FindAllSellableItemsResult`.
- Extraer helpers genericos de repositorio:
  - `getPagination`
  - `normalizeSellableFilters`
  - `calculatePriceWithDiscount`
  - `buildTextSearchCondition`
  - `buildStockCondition`
  - `mapSellableRowBase`
- Mantener repositorios concretos:
  - `DrizzleProductsRepository`
  - `DrizzleLaserEngravingsRepository`
- Los repositorios concretos reciben su tabla y sus reglas especificas. Productos conserva `category` e `inStore`; grabados conserva `slug` y no tiene `category` ni `inStore`.

Patron sugerido: composicion con helpers compartidos y polimorfismo por interfaz.

```ts
interface SellableItemsRepository<TItem, TChanges, TFilters> {
  save(input: TChanges): Promise<TItem>;
  findById(id: number): Promise<TItem | null>;
  findAll(filters?: TFilters | URLSearchParams): Promise<FindAllResult<TItem>>;
  updateById(id: number, updates: TChanges): Promise<TItem | null>;
  deleteById(id: number): Promise<boolean>;
}
```

Esto permite que catalogo, carrito y admin trabajen contra contratos comunes sin obligar a que productos y grabados sean la misma entidad.

### Busqueda y paginacion

La busqueda por texto y la paginacion deben funcionar en ambos catalogos:

- `/catalogo`: busca y pagina productos de joyeria.
- `/grabados`: busca y pagina grabados laser.
- Ambos deben usar la misma experiencia visual de buscador, grid, empty state, skeleton y controles de paginacion.
- Los query params compartidos pueden mantenerse consistentes: `query`, `page`, `limit`.
- Productos puede seguir aceptando `instore`.
- Grabados no debe aceptar ni mostrar filtro por `category` ni `instore`.

## Reutilizacion de catalogo

Refactor recomendado:

1. Mantener los componentes visuales en `components/catalog`.
2. Cambiar nombres internos de lo estrictamente visual hacia algo reusable:
   - `ProductCard` puede aceptar `CatalogItem` y opcionalmente seguir exportado como `ProductCard` si se quiere evitar un refactor grande.
   - `ProductsGrid` puede aceptar `CatalogItem[]`.
3. Extraer la parte parametrizable de `CatalogContent`:
   - titulo base
   - query key
   - funcion de carga
   - filtros permitidos
   - permisos admin
   - handlers de edicion/eliminacion

Propuesta simple:

- Crear `CatalogContentBase` con props:
  - `title`
  - `searchPlaceholder?`
  - `queryKeyPrefix`
  - `getItems`
  - `getTitle`
  - `adminActions?`
  - `showCategoryFilters`
- `CatalogContent` queda como wrapper para productos.
- `LaserEngravingsCatalogContent` queda como wrapper para grabados y usa el titulo `Explora nuestros grabados`.

Asi se evita duplicar grid, busqueda, paginacion, estados vacios y skeleton.

## Carrito

Actualizar el store para que deje de identificar items solo con `product.id`.

Cambios:

- Renombrar gradualmente `CartProduct` a `CartItemProduct` o `CartCatalogItem`.
- Usar `item.id` como clave estable compuesta, no el ID numerico de DB.
- Cambiar operaciones:
  - `incrementProduct(productId: number)` a `incrementItem(itemId: string)`
  - `decrementProduct(productId: number)` a `decrementItem(itemId: string)`
  - `removeProduct(productId: number)` a `removeItem(itemId: string)`
- Mantener aliases temporales solo si reduce el alcance del cambio, pero los componentes nuevos deberian usar nombres neutrales.

Compatibilidad con carritos ya guardados:

- El localStorage actual `calio-cart` contiene productos con `id` numerico.
- Agregar una migracion de Zustand `persist` para convertir items viejos:
  - `id: product:${oldProduct.id}`
  - `sourceId: String(oldProduct.id)`
  - `slug: String(oldProduct.id)` como compatibilidad inicial, hasta que productos tenga slug real
  - `kind: product`
- Mantener `category` opcional para que grabados no necesiten categoria.

PDF y WhatsApp:

- El PDF puede seguir listando nombre, cantidad, imagen y precio.
- El mensaje de WhatsApp puede seguir igual, aunque se puede agregar un prefijo opcional en el futuro:
  - `Grabado laser: Nombre`
  - `Joya: Nombre`

## Admin

Cambios en `/admin`:

- Renombrar la tarjeta actual `Administrar catálogo` a `Administrar piezas joyería`.
- Mantener esa tarjeta apuntando al admin/catalogo de joyas.
- Agregar una nueva tarjeta/boton `Administrar grabados laser`.
- La administracion de grabados debe estar separada del menu de categorias de joyas.
- El acceso puede apuntar a `/grabados` cuando hay sesion y modo admin, o a una ruta dedicada como `/admin/grabados`. La opcion mas limpia es `/admin/grabados` si se quiere evitar mezclar administracion con pagina publica.

ProductDialog:

- Evaluar reutilizar `ProductDialog` como un formulario base de item vendible.
- Extraer un componente/hook reusable, por ejemplo `SellableItemDialog` o `CatalogItemDialog`, que reciba configuracion:
  - `kind`: `product` o `laser-engraving`
  - campos visibles
  - acciones de crear/actualizar
  - query keys a invalidar
  - validacion/schema correspondiente
- Para productos, mostrar `category` y reglas de descuento por categoria.
- Para grabados, omitir `category` e `inStore`; conservar `slug`, `price`, `quantity`, `discount` e `images`.
- Usar Sonner y errores de campo como el formulario de productos.

Acciones admin:

- Crear server actions separadas para grabados, inspiradas en `product-mutations.action.ts`.
- Reutilizar helpers compartidos para subida de imagenes si aplica.
- Al crear o editar grabados, revalidar `/grabados`, `/admin/grabados` y `/productos/${slug}`.

## Home

En `app/page.tsx`, dentro de la seccion `#personalizacion`:

- Mantener el boton actual `Quiero personalizar` hacia WhatsApp.
- Agregar un segundo boton hacia `/grabados`.
- Texto sugerido: `Ver muestras de grabado`.
- No agregar enlace en `CategoryCarousel` ni en `PRODUCT_CATEGORIES`.

## SEO y metadata

Agregar metadata para `/grabados`:

- Title: `Catalogo de Grabados Laser | CALIO Joyeria`
- Description: `Explora muestras de grabado laser para personalizar joyas CALIO.`
- Canonical: `${NEXT_PUBLIC_SITE_URL}/grabados`

Para detalle:

- Si el item es producto, conservar keywords actuales.
- Si es grabado, usar keywords de personalizacion y grabado laser.

## Migraciones y datos iniciales

Pasos:

1. Agregar tabla `laser_engravings` en `db/schema.ts`.
2. Generar migracion Drizzle.
3. Crear datos iniciales de muestras.
4. Subir imagenes a Cloudinary y guardar solo filenames, igual que productos.
5. Verificar que los IDs de grabados sean numericos con secuencia propia y que los slugs sean unicos.

Los grabados manejaran precio fijo en `price` y stock en `quantity`.

Imagenes:

- Usar imagenes reales de Cloudinary cuando existan.
- Si se necesitan datos de prueba o seed inicial y todavia no hay imagenes finales, se pueden usar placeholders publicos de la web.
- Antes de produccion, preferir subir imagenes definitivas a Cloudinary y guardar solo filenames, igual que productos.

## Pasos de implementacion sugeridos

1. Crear tipos neutrales de catalogo/carrito. Estado: hecho en `d1e813c`.
2. Agregar tabla y migracion de grabados. Estado: hecho en `d1e813c`.
3. Extraer helpers backend reutilizables para entidades vendibles. Estado: hecho en `08f7365`.
4. Agregar repositorio, schemas y API de grabados. Estado: hecho en `08f7365`.
5. Crear `getLaserEngravingsByQuery`. Estado: hecho en `08f7365`.
6. Crear pagina `/grabados` usando el catalogo reusable con titulo `Explora nuestros grabados`. Estado: hecho en `6affb6f`.
7. Agregar boton `Ver muestras de grabado` en la home. Estado: hecho en `6affb6f`.
8. Actualizar `/productos/[id]` para resolver productos por ID numerico, productos por slug y grabados por slug. Estado: hecho en `51da915`.
9. Migrar el carrito a claves compuestas y agregar migracion de localStorage. Estado: hecho en `d04fe64`.
10. Actualizar `/admin`: renombrar `Administrar catálogo` a `Administrar piezas joyería` y agregar `Administrar grabados laser`. Estado: hecho en `dd3c036`.
11. Crear server actions de administracion CRUD de grabados. Estado: hecho en `17e7a4a`.
12. Crear UI de administracion CRUD de grabados. Estado: hecho en `e2d12a7`.
13. Reutilizar o extraer `ProductDialog` para que pueda manejar productos y grabados con configuracion. Estado: hecho en `e2d12a7`.
14. Crear datos iniciales o seed de grabados. Estado: hecho en `8af3163`.
15. Validar conflictos de slug publico entre joyas y grabados. Estado: hecho en `f33e78d`.
16. Ejecutar migracion cuando se confirme el ambiente objetivo. Estado: hecho en testing.
17. Ejecutar import seed de grabados. Estado: hecho en testing.
18. Ejecutar verificacion final. Estado: hecho parcialmente; `npm run lint` y `npm run test` pasan, `npm run build` queda no concluyente porque se queda en `Creating an optimized production build ...`.

## Bitacora de commits

- `d1e813c` - Add laser engraving schema and base types.
- `08f7365` - Add laser engraving repository and API.
- `6affb6f` - Add public laser engraving catalog.
- `51da915` - Resolve product details by slug.
- `d04fe64` - Support mixed cart items.
- `dd3c036` - Add laser engraving admin entry point.
- `17e7a4a` - Add laser engraving server actions.
- `e2d12a7` - Add reusable sellable item admin UI.
- `8af3163` - Add laser engraving seed import.
- `f33e78d` - Validate laser engraving public slug conflicts.

## Migracion e import

La migracion e import ya se ejecutaron en el ambiente `testing`, que es el default cuando `DB_TARGET` no esta definido.

Comandos ejecutados contra testing:

```bash
npm run db:migrate
npm run db:import-laser-engravings
```

Resultado:

- Migracion `0002_lumpy_guardian.sql` aplicada y registrada.
- `laser_engravings` creado.
- `products.slug` creado.
- 4 grabados seed importados.

No ejecutar estos comandos contra produccion hasta confirmar datos finales, imagenes definitivas y ventana de despliegue.

## Pruebas recomendadas

Unitarias:

- Repositorio de grabados: mapea `priceWithDiscount`, pagina, filtra agotados y busca por query.
- Helpers compartidos de items vendibles: paginacion, busqueda, stock y precio con descuento.
- Schemas de API de grabados: valida body y query.
- Carrito: productos y grabados con IDs independientes no colisionan.
- Migracion del carrito: convierte productos viejos con ID numerico a `product:${id}`.
- Catalog grid/card: genera links correctos para productos y grabados.
- Detalle `/productos/[id-or-slug]`: resuelve producto por ID numerico, producto por slug y grabado por slug.
- Admin: muestra `Administrar piezas joyería` y `Administrar grabados laser`.
- Dialog reusable: muestra categoria para productos y la omite para grabados.

Integracion/manual:

- `/catalogo` conserva comportamiento actual.
- `/grabados` muestra solo grabados.
- `/grabados` permite buscar por texto y navegar paginas.
- `/catalogo` mantiene busqueda por texto y paginacion.
- `/productos/2` sigue funcionando para productos existentes.
- `/productos/joya-2` funciona si el producto tiene slug.
- `/productos/grabado-nombre-fecha` funciona para grabados.
- El menu de joyas no muestra grabados.
- `/admin` muestra accesos separados para joyeria y grabados.
- Home muestra los dos botones de grabado.
- Un producto y un grabado pueden convivir en el carrito.
- PDF y WhatsApp incluyen ambos items.

Comandos:

```bash
npm run test
npm run lint
npm run build
```

Resultado final de verificacion:

- `npm run lint`: pasa.
- `npm run test`: pasa con 47 archivos y 349 tests.
- `npm run build`: intentado, pero se detuvo manualmente porque no avanzó despues de 60 segundos en `Creating an optimized production build ...`.

## Riesgos y decisiones abiertas

- Slugs de productos: decidir si se agregan a productos en esta misma version. Los enlaces por ID numerico de productos deben mantenerse de forma permanente.
- Conflictos de slug: los grabados ya validan que su slug no exista en productos antes de guardar. Si se habilita edicion de slugs para joyas en admin, aplicar la misma regla en sentido inverso.
- Ruta admin de grabados: decidir entre `/admin/grabados` o reutilizar `/grabados` en modo admin. Recomendacion: `/admin/grabados`.

## Recomendacion final

Implementar grabados como entidad separada con IDs `bigint`, `slug` unico, precio fijo y `quantity` de inventario. Mantener productos accesibles por ID numerico, agregar soporte opcional de slug para joyas, y resolver grabados por slug bajo el detalle compartido. Reutilizar backend mediante composicion de helpers e interfaces comunes, no herencia prematura. Reutilizar catalogo, carrito y dialogos admin con configuracion por tipo de item.
