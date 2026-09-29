# Huvegrym — web v2

Web oficial de **Huvegrym**, compañía de danza contemporánea de Vega y Hugo Grimalt Arnal.

- **Stack:** [Astro 7](https://astro.build) (HTML estático, 0 frameworks de cliente) + TypeScript + CSS nativo.
- **Idiomas:** español (`/`) e inglés (`/en/`) con URLs traducidas y `hreflang` recíproco.
- **Rendimiento:** Lighthouse 100 en Performance, Accessibility, Best Practices y SEO (móvil y escritorio).

## Desarrollo

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # astro check + build → dist/
npm run preview   # sirve dist/
```

Requiere Node ≥ 22.12.

> **Windows y `UNABLE_TO_VERIFY_LEAF_SIGNATURE` en `npm install`:** algo (antivirus, proxy o VPN)
> intercepta el HTTPS. Solución segura: `$env:NODE_OPTIONS="--use-system-ca"; npm install`
> (Node ≥ 22.15). No desactives `strict-ssl`.

### Medir Lighthouse correctamente

`npm run dev` es el modo desarrollo (código sin optimizar y barra de herramientas): **no sirve para
medir**. Para auditar:

```bash
npm run audit     # build + preview en http://localhost:4321
```

y pasar Lighthouse en una ventana de incógnito (las extensiones del navegador también restan puntos).

## Estructura

```
src/
  data/          ← TODO el contenido editable (textos ES/EN, obras, artistas, lugares, agenda)
  i18n/          ← idiomas, rutas y textos de interfaz
  components/    ← vistas y secciones (.astro, estilos con scope)
  scripts/       ← JS mínimo: hero, menú, revelados, vídeo, consentimiento
  lib/schema.ts  ← datos estructurados JSON-LD (DanceGroup, Person, CreativeWork, DanceEvent…)
  assets/        ← imágenes fuente (Astro genera AVIF/WebP responsive en el build)
public/
  media/video/   ← tráilers comprimidos (720p) y vídeo ambiental
  og/            ← imágenes para redes sociales (1200×630)
  .htaccess      ← redirecciones 301 de la v1, caché, compresión, cabeceras de seguridad
```

### Editar contenido

| Qué                       | Dónde                  |
| ------------------------- | ---------------------- |
| Textos de la compañía     | `src/data/site.ts`     |
| Obras (Cibanal, …)        | `src/data/pieces.ts`   |
| Biografías y proyectos    | `src/data/artists.ts`  |
| Lugares                   | `src/data/venues.ts`   |
| **Próximas actuaciones**  | `src/data/events.ts`   |

Para publicar una fecha basta con añadir un objeto a `events` (hay un ejemplo comentado). La home
muestra la agenda y genera automáticamente datos estructurados `DanceEvent`, que Google puede
mostrar como resultado enriquecido. Las fechas pasadas desaparecen solas en el siguiente build.

## Hero (efecto GTA VI)

Tres capas: fondo limpio (el intérprete se ha eliminado del fondo), logotipo y recorte HD del
intérprete. Al hacer scroll: parallax entre capas y, después, el logotipo se convierte en máscara y
se encoge hasta enmarcar la escena dentro de las letras. Es el mismo efecto en móvil y escritorio
(en vertical se usa un encuadre dirigido).

- `src/components/home/Hero.astro` — capas y fases (CSS a partir de `--p`).
- `src/scripts/hero.ts` — progreso de scroll y transformación de la máscara (geometría SVG, sin
  rasterizar capas gigantes; por eso funciona fluido en móvil).
- Respeta `prefers-reduced-motion` y funciona sin JavaScript (primer fotograma estático).

## Efectos

- **Vídeo dentro de las letras:** al final del hero, el logotipo-máscara muestra un clip en bucle
  (`public/media/video/reel-letters.*`, < 1 MB). Solo se descarga al llegar a esa fase.
- **Transiciones entre páginas:** la foto de la tarjeta se transforma en la cabecera de la página de
  artista u obra (View Transitions nativas). Se activan tras la carga o al llegar desde la propia
  web, para no penalizar el LCP de la primera visita.
- **Vista previa de las obras:** clip corto sin sonido al pasar el ratón (escritorio) o al verse la
  tarjeta (móvil).
- **Grano de película** sutil y titulares que aparecen línea a línea.
- Todo respeta `prefers-reduced-motion` y el modo ahorro de datos.

## Créditos fotográficos

Los fotógrafos se definen en `src/data/credits.ts` y se asignan a cada foto con el campo `credit`
en `src/data/*.ts`. Se muestran como píldora enlazada a su Instagram.

> Los vídeos originales de la v1 no tienen pista de audio. Si existen versiones con sonido, basta
> con sustituir los MP4 de `public/media/video/` y quitar `muted` en `src/scripts/media.ts`
> (`initPlayers`).

## SEO

- Títulos y descripciones por página e idioma, canonical, `hreflang` (es-ES / en / x-default).
- `sitemap.xml` propio con alternates por idioma (`src/pages/sitemap.xml.ts`) y `robots.txt`.
- JSON-LD: `DanceGroup` con miembros, `Person` por artista, `CreativeWork` por obra,
  `BreadcrumbList`, `DanceEvent` para la agenda.
- Open Graph / Twitter Cards con imágenes dedicadas.
- Páginas propias para cada obra (`/obras/cibanal/`) y artista (`/artistas/hugo-grimalt-arnal/`),
  con los nombres completos en la URL: es lo que buscan programadores y público.
- Redirecciones 301 desde las URLs de la v1 (`/pages/portfolio-hugo.html`, …) en `.htaccess`.

## Google Search Console y Analytics

1. **Search Console (imprescindible para el SEO):** alta de la propiedad de dominio `huvegrym.com`
   verificando por DNS (registro TXT). Alternativa: poner el token en `PUBLIC_GSC_VERIFICATION`.
   Después, enviar `https://huvegrym.com/sitemap.xml` en *Sitemaps*.
2. **Google Analytics 4 (opcional):** crear la propiedad, copiar el ID de medición (`G-XXXXXXXXXX`)
   y definirlo en `PUBLIC_GA_ID` (ver `.env.example`) antes de hacer el build.
   - Se muestra un aviso de cookies conforme a RGPD/LSSI («Rechazar» con el mismo peso que «Aceptar»).
   - GA **no se descarga** hasta que el usuario acepta (Consent Mode v2), así que no afecta a
     Lighthouse ni a la privacidad de quien rechaza.
   - La política de cookies está en `/cookies/`.

## Despliegue

El resultado de `npm run build` es la carpeta `dist/`: se sube tal cual al hosting (Apache).
`.htaccess` ya incluye HTTPS, dominio sin `www`, compresión, caché inmutable para `/_astro/`,
cabeceras de seguridad y la página 404.
