# VerdeMarket — Gestión de inventario

VerdeMarket es una aplicación web para gestionar el inventario de un supermercado. Permite consultar los productos disponibles, registrar nuevos artículos, filtrar por categoría y revisar sus detalles. También incluye un carrito que actualiza las existencias al agregar o retirar unidades.

**Asignatura:** Desarrollo Frontend II (PFY2202).

## Funcionalidades

- Página de inicio y navegación entre las secciones.
- Inventario con búsqueda y filtro por categoría.
- Registro de artículos con validación de datos.
- Detalle de productos con precio, descripción y stock disponible.
- Carrito con control de cantidades, actualización de existencias y cálculo del total.
- Diseño adaptable a computadores y teléfonos.

## Tecnologías

React, React Router, JavaScript, Tailwind CSS y Vite. Para compartir el estado del inventario y del carrito se utiliza Context API con useReducer.

## Instalación y uso

Se requiere Node.js compatible y npm.

Desde la carpeta principal del proyecto:

`npm install`

`npm run dev`

Luego se abre en el navegador la dirección local indicada en la terminal.

## Pruebas

`npm test`

`npm run build`

El proyecto también incluye pruebas automatizadas de navegación con Playwright, ejecutables mediante `npm run test:e2e`.

## Sitio web

https://diegofernandezduocuc.github.io/supermercado-diego-fernandez-pfy2202/

Los productos iniciales son datos de ejemplo. Los cambios en el inventario y el carrito se mantienen durante la navegación y se reinician al recargar la aplicación.
