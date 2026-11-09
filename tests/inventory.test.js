import test from 'node:test'
import assert from 'node:assert/strict'
import {reducer,available,cartTotal,filterProducts,totalUnits,validProduct} from '../src/utils/inventory.js'
import {initialProducts,categories} from '../src/data/products.js'
const products=[{id:'a',name:'Manzana',brand:'Local',category:'Frutas',price:1000,stock:2},{id:'b',name:'Leche',brand:'Colun',category:'Lácteos',price:1500,stock:5}]
const state=()=>({products:products.map(p=>({...p})),cart:{}})
test('filtrar no altera el inventario original',()=>{const s=state();const filtered=filterProducts(s.products,'Frutas');assert.equal(filtered.length,1);assert.equal(s.products.length,2);assert.equal(filterProducts(s.products,'Todas').length,2)})
test('agregar descuenta stock disponible y no el original',()=>{let s=state();s=reducer(s,{type:'ADD_TO_CART',id:'a'});assert.equal(available(s.products[0],s.cart),1);assert.equal(s.products[0].stock,2);assert.equal(totalUnits(s.cart),1)})
test('no permite superar las unidades disponibles',()=>{let s=state();for(let i=0;i<5;i++)s=reducer(s,{type:'ADD_TO_CART',id:'a'});assert.equal(s.cart.a,2);assert.equal(available(s.products[0],s.cart),0)})
test('disminuir o eliminar restituye el stock',()=>{let s=state();s=reducer(s,{type:'ADD_TO_CART',id:'a'});s=reducer(s,{type:'ADD_TO_CART',id:'a'});s=reducer(s,{type:'DECREASE_CART',id:'a'});assert.equal(available(s.products[0],s.cart),1);s=reducer(s,{type:'REMOVE_FROM_CART',id:'a'});assert.equal(available(s.products[0],s.cart),2);assert.equal(totalUnits(s.cart),0)})
test('carrito calcula el total correctamente',()=>{let s=state();s=reducer(s,{type:'ADD_TO_CART',id:'a'});s=reducer(s,{type:'ADD_TO_CART',id:'b'});assert.equal(cartTotal(s.products,s.cart),2500)})
test('registrar artículo conserva productos actuales',()=>{const p={id:'c',name:'Pan',brand:'Local',category:'Panadería',price:900,stock:8};const s=reducer(state(),{type:'ADD_PRODUCT',product:p});assert.equal(s.products.length,3);assert.equal(s.products[2].name,'Pan')})
test('rechaza productos incompletos y stock negativo',()=>{assert.ok(validProduct({name:'',brand:'A',category:'A',price:1,stock:1}));assert.ok(validProduct({name:'A',brand:'A',category:'A',price:1,stock:-1}));assert.equal(reducer(state(),{type:'ADD_PRODUCT',product:{id:'x',name:'',brand:'',category:'',price:0,stock:0}}).products.length,2)})
test('acción desconocida no modifica el estado',()=>{const s=state();assert.equal(reducer(s,{type:'OTHER'}),s)})

test('catálogo inicial tiene 12 identificadores únicos y datos válidos',()=>{
  assert.equal(initialProducts.length,12)
  assert.equal(new Set(initialProducts.map(p=>p.id)).size,12)
  for(const product of initialProducts){assert.equal(validProduct(product),'');assert.ok(categories.includes(product.category))}
})

test('cada categoría puede filtrarse y restaurarse sin perder artículos',()=>{
  for(const category of categories){assert.equal(filterProducts(initialProducts,category).length,2)}
  assert.equal(filterProducts(initialProducts,'Todas').length,12)
  assert.equal(filterProducts(initialProducts,'Todas','  COLUN  ')[0].id,'p03')
  assert.equal(filterProducts(initialProducts,'Todas','inexistente').length,0)
})

test('carrito vacío y acciones inexistentes nunca producen cantidades negativas',()=>{
  const s=state()
  assert.equal(cartTotal(s.products,s.cart),0)
  assert.equal(totalUnits(s.cart),0)
  for(const type of ['DECREASE_CART','REMOVE_FROM_CART','ADD_TO_CART']){
    assert.equal(reducer(s,{type,id:'inexistente'}),s)
  }
  assert.equal(reducer(s,{type:'DECREASE_CART',id:'a'}),s)
})

test('reservas conservan el stock total sin mutar el estado anterior',()=>{
  const original=state()
  let s=original
  for(const action of [
    {type:'ADD_TO_CART',id:'a'},{type:'ADD_TO_CART',id:'b'},
    {type:'ADD_TO_CART',id:'a'},{type:'ADD_TO_CART',id:'a'},
    {type:'DECREASE_CART',id:'a'},{type:'REMOVE_FROM_CART',id:'b'},
    {type:'DECREASE_CART',id:'a'},{type:'DECREASE_CART',id:'a'},
  ]){
    s=reducer(s,action)
    for(const p of s.products){assert.equal(available(p,s.cart)+(s.cart[p.id]||0),p.stock)}
  }
  assert.deepEqual(original,state())
  assert.deepEqual(s.cart,{})
})

test('stock cero, identificadores duplicados y valores no finitos se rechazan',()=>{
  const s={products:[{...products[0],stock:0}],cart:{}}
  assert.equal(reducer(s,{type:'ADD_TO_CART',id:'a'}),s)
  const original=state()
  assert.equal(reducer(original,{type:'ADD_PRODUCT',product:products[0]}),original)
  for(const price of [NaN,Infinity,0,-1])assert.ok(validProduct({...products[0],price}))
  for(const stock of [NaN,Infinity,1.5,-1])assert.ok(validProduct({...products[0],stock}))
})
