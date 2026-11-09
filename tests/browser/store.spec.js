import {test, expect} from '@playwright/test'
import {mkdir} from 'node:fs/promises'
import path from 'node:path'

const evidenceDir = process.env.EVIDENCE_DIR
async function capture(page, name) {
  if (!evidenceDir) return
  await mkdir(evidenceDir, {recursive: true})
  await page.screenshot({path: path.join(evidenceDir, name), fullPage: true, animations: 'disabled'})
}
async function navigate(page, route) {
  // Hash navigation preserves the same document and Context state.
  await page.goto(`${process.env.APP_URL || 'http://127.0.0.1:5173'}/#${route}`)
}
async function noOverflow(page) {
  const dimensions=await page.evaluate(() => ({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('main *')].filter(el=>el.getBoundingClientRect().right>innerWidth).map(el=>({tag:el.tagName,cls:typeof el.className==='string'?el.className:'svg',text:el.textContent.slice(0,80)})).slice(0,8)}))
  expect(dimensions.scroll, `${page.url()} ${JSON.stringify(dimensions)}`).toBeLessThanOrEqual(dimensions.width)
}

test('inventario, registro, filtros, carrito, límites y restitución de stock', async ({page}) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', msg => {if (msg.type() === 'error') errors.push(msg.text())})
  page.on('requestfailed', req => errors.push(`${req.url()}: ${req.failure()?.errorText}`))
  page.on('response', response => {if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`)})
  await navigate(page, '/inventario')
  await expect(page.locator('tbody tr')).toHaveCount(12)
  await capture(page, '01-inventario.png')
  await page.getByLabel('Categoría:', {exact:true}).selectOption('Lácteos')
  await expect(page.locator('tbody tr')).toHaveCount(2)
  await capture(page, '03-filtro-categoria.png')
  await page.getByRole('button', {name:'Limpiar filtros'}).click()
  await expect(page.locator('tbody tr')).toHaveCount(12)
  await expect(page.getByLabel('Buscar artículos')).toHaveCSS('padding-left', '44px')
  await page.getByLabel('Buscar artículos').fill('colun')
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await page.getByLabel('Buscar artículos').fill('producto inexistente')
  await expect(page.getByText('No se encontraron artículos', {exact:true})).toBeVisible()
  await page.getByRole('button', {name:'Limpiar filtros'}).click()
  await page.getByRole('link', {name:'Nuevo artículo', exact:true}).click()
  await page.getByLabel('Nombre del artículo *', {exact:true}).fill('Aceite vegetal 1 L')
  await page.getByLabel('Marca *', {exact:true}).fill('Natura')
  await page.getByLabel('Categoría / Tipo *', {exact:true}).selectOption('Despensa')
  await page.getByLabel('Precio (CLP) *', {exact:true}).fill('2490')
  await page.getByLabel('Cantidad en stock *', {exact:true}).fill('2')
  await page.getByLabel('Descripción', {exact:true}).fill('Aceite vegetal para cocinar.')
  await page.getByRole('button', {name:'Guardar artículo'}).click()
  await expect(page.locator('tbody tr')).toHaveCount(13)
  await expect(page.getByRole('status')).toContainText('Aceite vegetal 1 L')
  await page.getByLabel('Buscar artículos').fill('Aceite vegetal')
  await expect(page.locator('tbody tr')).toContainText('Stock bajo · 2')
  await capture(page, '02-registro-articulo.png')
  await page.getByRole('link', {name:'Ver detalle de Aceite vegetal 1 L', exact:true}).click()
  await expect(page.getByRole('heading', {name:'Aceite vegetal 1 L', level:1})).toBeVisible()
  await capture(page, '04-detalle-articulo.png')
  await page.getByRole('button', {name:'Agregar al carrito', exact:true}).click()
  await expect(page.getByText('Stock bajo · 1', {exact:true})).toBeVisible()
  await page.getByRole('link', {name:'Ver carrito', exact:true}).click()
  await page.getByRole('button', {name:'Aumentar Aceite vegetal 1 L', exact:true}).click()
  await expect(page.getByText('Quedan 0 disponibles', {exact:true})).toBeVisible()
  await expect(page.getByRole('button', {name:'Aumentar Aceite vegetal 1 L', exact:true})).toBeDisabled()
  await expect(page.getByText('$4.980', {exact:true})).toHaveCount(2)
  await page.getByRole('button', {name:'Disminuir Aceite vegetal 1 L', exact:true}).click()
  await expect(page.getByText('Quedan 1 disponibles', {exact:true})).toBeVisible()
  await navigate(page, '/inventario/p03')
  await page.getByRole('button', {name:'Agregar al carrito', exact:true}).click()
  await page.getByRole('link', {name:'Ver carrito', exact:true}).click()
  await expect(page.getByText('$3.680', {exact:true})).toBeVisible()
  await expect(page.getByRole('heading', {name:/Artículos seleccionados.*2 unidades/})).toBeVisible()
  await capture(page, '05-carrito.png')
  await page.getByRole('button', {name:'Eliminar Aceite vegetal 1 L del carrito', exact:true}).click()
  await navigate(page, '/inventario')
  await expect(page.locator('tbody tr')).toHaveCount(13)
  await expect(page.locator('tbody tr').filter({hasText:'Aceite vegetal 1 L'})).toContainText('Stock bajo · 2')
  await expect(page.locator('tbody tr').filter({hasText:'Leche entera 1 L'})).toContainText('Disponible · 35')
  await navigate(page, '/inventario/p03')
  await expect(page.getByText(/Stock total: 36.*En el carrito: 1.*Disponible: 35/)).toBeVisible()
  await capture(page, '06-actualizacion-stock.png')
  await page.getByRole('link', {name:'Ver carrito', exact:true}).click()
  await page.getByRole('button', {name:'Disminuir Leche entera 1 L', exact:true}).click()
  await expect(page.getByText('Tu carrito está vacío', {exact:true})).toBeVisible()
  await expect(page.getByText('$0', {exact:true})).toBeVisible()
  await navigate(page, '/inventario/p03')
  await expect(page.getByText(/Stock total: 36.*En el carrito: 0.*Disponible: 36/)).toBeVisible()
  expect(errors).toEqual([])
})

test('rutas, enlaces, validación y navegación SPA', async ({page}) => {
  const errors=[]
  page.on('pageerror', error=>errors.push(error.message))
  page.on('console', msg=>{if(msg.type()==='error')errors.push(msg.text())})
  await navigate(page, '/')
  let documents = 0
  page.on('request', req => {if (req.isNavigationRequest() && req.resourceType() === 'document') documents++})
  const routes = [
    ['Inventario', 'Inventario de artículos'], ['Agregar artículo', 'Agregar nuevo artículo'],
    ['Carrito', 'Carrito de compras'], ['Quiénes somos', 'Quiénes somos'],
    ['Nuestras tiendas', 'Nuestras tiendas'], ['Inicio', /Todo tu inventario/],
  ]
  for (const [link, heading] of routes) {
    await page.locator('aside').getByRole('navigation').getByRole('link', {name:link, exact:true}).click()
    await expect(page.getByRole('heading', {name:heading, level:1})).toBeVisible()
    await noOverflow(page)
  }
  const footer=page.getByRole('navigation', {name:'Navegación inferior', exact:true})
  await expect(footer.getByRole('link')).toHaveCount(6)
  for(const [link,heading] of routes){
    await footer.getByRole('link', {name:link, exact:true}).click()
    await expect(page.getByRole('heading', {name:heading, level:1})).toBeVisible()
    await expect(footer.getByRole('link', {name:link, exact:true})).toHaveAttribute('aria-current','page')
    await noOverflow(page)
  }
  expect(documents).toBe(0)
  if(process.env.MENU_EVIDENCE_DIR){
    await footer.getByRole('link', {name:'Nuestras tiendas', exact:true}).click()
    await mkdir(process.env.MENU_EVIDENCE_DIR, {recursive:true})
    await page.evaluate(()=>window.scrollTo(0,0))
    await page.screenshot({path:path.join(process.env.MENU_EVIDENCE_DIR,'09-menu-inferior.png'),fullPage:true,animations:'disabled'})
  }
  await navigate(page, '/agregar')
  await page.getByRole('button', {name:'Guardar artículo'}).click()
  await expect(page.locator('#nombre:invalid')).toHaveCount(1)
  await page.getByLabel('Nombre del artículo *', {exact:true}).fill('   ')
  await page.getByLabel('Marca *', {exact:true}).fill('Marca')
  await page.getByLabel('Categoría / Tipo *', {exact:true}).selectOption('Bebidas')
  await page.getByLabel('Precio (CLP) *', {exact:true}).fill('1000')
  await page.getByLabel('Cantidad en stock *', {exact:true}).fill('0')
  await page.getByRole('button', {name:'Guardar artículo'}).click()
  await expect(page.getByRole('alert')).toContainText('Completa el nombre')
  await page.getByLabel('Nombre del artículo *', {exact:true}).fill('Agua sin existencias')
  await page.getByRole('button', {name:'Guardar artículo'}).click()
  await page.getByRole('link', {name:'Ver detalle de Agua sin existencias', exact:true}).click()
  await expect(page.getByRole('button', {name:'Sin stock disponible'})).toBeDisabled()
  await navigate(page, '/inventario/no-existe')
  await expect(page.getByText('Artículo no encontrado', {exact:true})).toBeVisible()
  await navigate(page, '/ruta-inexistente')
  await expect(page.getByText('Página no encontrada', {exact:true})).toBeVisible()
  await page.getByRole('link', {name:'Volver al inicio'}).click()
  await expect(page.getByRole('heading', {level:1})).toContainText('Todo tu inventario')
  expect(errors).toEqual([])
})

test('móvil: menú, inventario, formulario, detalle y carrito', async ({page}) => {
  const errors=[]
  page.on('pageerror', error=>errors.push(error.message))
  page.on('console', msg=>{if(msg.type()==='error')errors.push(msg.text())})
  await page.setViewportSize({width:390, height:844})
  await navigate(page, '/')
  await noOverflow(page)
  await capture(page, '07-vista-movil.png')
  await expect(page.getByRole('navigation', {name:'Navegación principal'})).not.toBeVisible()
  await page.getByRole('button', {name:'Abrir menú', exact:true}).click()
  await expect(page.getByRole('button', {name:'Abrir menú', exact:true})).toHaveAttribute('aria-expanded','true')
  await page.getByRole('button', {name:'Cerrar menú', exact:true}).last().press('Escape')
  await expect(page.getByRole('navigation', {name:'Navegación principal'})).not.toBeVisible()
  await page.getByRole('button', {name:'Abrir menú', exact:true}).click()
  await page.getByRole('navigation', {name:'Navegación principal'}).getByRole('link', {name:'Inventario', exact:true}).click()
  await expect(page.getByRole('heading', {level:1})).toHaveText('Inventario de artículos')
  await expect(page.getByRole('button', {name:'Abrir menú', exact:true})).toBeFocused()
  await noOverflow(page)
  await expect(page.locator('tbody tr')).toHaveCount(12)
  const table = page.locator('table').locator('..')
  expect(await table.evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true)
  await page.getByRole('link', {name:'Nuevo artículo', exact:true}).click()
  await noOverflow(page)
  await navigate(page, '/inventario/p01')
  await noOverflow(page)
  await page.getByRole('button', {name:'Agregar al carrito', exact:true}).click()
  await page.getByRole('link', {name:'Ver carrito', exact:true}).click()
  await expect(page.getByText('Quedan 27 disponibles', {exact:true})).toBeVisible()
  await noOverflow(page)
  await page.setViewportSize({width:320, height:740})
  await noOverflow(page)
  let documents=0
  page.on('request',req=>{if(req.isNavigationRequest()&&req.resourceType()==='document')documents++})
  const footer=page.getByRole('navigation', {name:'Navegación inferior', exact:true})
  for(const [link,heading] of [
    ['Inicio',/Todo tu inventario/],['Inventario','Inventario de artículos'],
    ['Agregar artículo','Agregar nuevo artículo'],['Carrito','Carrito de compras'],
    ['Quiénes somos','Quiénes somos'],['Nuestras tiendas','Nuestras tiendas'],
  ]){
    await footer.getByRole('link', {name:link, exact:true}).click()
    await expect(page.getByRole('heading', {name:heading,level:1})).toBeVisible()
    await expect(footer.getByRole('link', {name:link,exact:true})).toHaveAttribute('aria-current','page')
    await noOverflow(page)
  }
  expect(documents).toBe(0)
  if(process.env.MENU_MOBILE_SCREENSHOT){
    await page.evaluate(()=>window.scrollTo(0,0))
    await page.screenshot({path:process.env.MENU_MOBILE_SCREENSHOT,fullPage:true,animations:'disabled'})
  }
  expect(errors).toEqual([])
})

test('presentación en anchos de 320, 768, 1024 y 1440 píxeles', async ({page}) => {
  for(const width of [320,768,1024,1440]){
    await page.setViewportSize({width,height:900})
    for(const route of ['/','/inventario','/agregar','/carrito','/nosotros','/tiendas','/inventario/p12']){
      await navigate(page,route)
      await expect(page.locator('main')).toBeVisible()
      await noOverflow(page)
    }
  }
})
