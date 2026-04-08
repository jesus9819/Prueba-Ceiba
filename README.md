# Prueba Técnica – Manejo de Fondos (FPV/FIC) – Angular

Aplicación web interactiva y responsiva para:

- Visualizar fondos disponibles.
- Suscribirse a un fondo (validando monto mínimo y saldo disponible).
- Cancelar participación en un fondo (y ver el saldo actualizado).
- Ver historial de transacciones (suscripciones y cancelaciones).
- Seleccionar método de notificación (Email o SMS) al suscribirse.

## Requisitos

- Node.js (recomendado: 20+)
- npm

## UI (Angular Material)

Interfaz basada en **Angular Material 21** (Material 3), con estética **fintech moderna**:

- **Tema**: paleta **violet** (primario) + **rose** (terciario) con soporte **light/dark** vía `color-scheme`.
- **Estilo**: superficies tipo “glass”, jerarquía tipográfica (Roboto + Plus Jakarta Sans) y micro-interacciones sutiles.
- **Feedback**: notificaciones con **MatSnackBar**; éxito en **verde** y entrada suave (fade + slide).

## Instalación y ejecución

```bash
npm install
npm start
```

Abrir `http://localhost:4200/`.

## Onboarding

Al cargar la app se muestra un **tour en 4 pasos** (si aún no lo cerraste para **esta compilación**). Cada paso **resalta en pantalla** el elemento correspondiente y el **panel del tour** muestra título, instrucciones y pistas. Puedes reabrirlo con **Cómo funciona** en la cabecera.

### Cuándo vuelve a salir solo

Antes de **`npm run build`** se ejecuta `scripts/write-build-stamp.mjs`, que actualiza `src/app/core/build-stamp.generated.ts` con la **versión del `package.json` y la fecha/hora**. El tour se considera “nuevo” cuando ese valor cambia respecto a lo guardado en `localStorage` (clave `btg_onboarding_release_v2`).

- **Cada compilación** (`npm run build`) genera un sello distinto → al abrir la app de ese build, el onboarding puede **mostrarse otra vez** hasta que lo cierres o completes.
- Con **`npm start`** (solo desarrollo) el sello no cambia salvo que hayas ejecutado un build antes o ejecutes a mano: `node scripts/write-build-stamp.mjs`.
- Para forzar el tour en desarrollo sin build: borra en el navegador la clave `btg_onboarding_release_v2` o ejecuta el script anterior y recarga.

## Datos y estado (API simulada)

- **Saldo inicial**: COP $500.000 (usuario único).
- **Fondos disponibles** (cargados desde un mock local):
  - 1: `FPV_BTG_PACTUAL_RECAUDADORA` – mínimo COP $75.000 – FPV
  - 2: `FPV_BTG_PACTUAL_ECOPETROL` – mínimo COP $125.000 – FPV
  - 3: `DEUDAPRIVADA` – mínimo COP $50.000 – FIC
  - 4: `FDO-ACCIONES` – mínimo COP $250.000 – FIC
  - 5: `FPV_BTG_PACTUAL_DINAMICA` – mínimo COP $100.000 – FPV

La app persiste saldo/posiciones/transacciones en **`localStorage`** (para simular backend).

- **Reset manual**: borrar la key `btg_funds_state_v1` en el `localStorage` del navegador.

## Scripts útiles

```bash
# dev
npm start

# build
npm run build

# unit tests
npm test
```

## Estructura (alto nivel)

- `src/app/state/portfolio.store.ts`: estado de saldo/posiciones/transacciones (RxJS + BehaviorSubject).
- `src/app/core/services/mock-api.service.ts`: “API” simulada con persistencia en `localStorage`.
- `src/app/features/**`: páginas (fondos, detalle/suscripción, portafolio/cancelación, historial).

