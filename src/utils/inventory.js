export const money = value => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(value)
export const totalUnits = cart => Object.values(cart).reduce((sum,n)=>sum+n,0)
export const available = (product,cart) => Math.max(0,product.stock-(cart[product.id]||0))
export const cartTotal = (products,cart) => products.reduce((sum,product)=>sum+product.price*(cart[product.id]||0),0)
export const filterProducts = (products,category,search='') => products.filter(product => (category==='Todas' || product.category===category) && `${product.name} ${product.brand} ${product.category}`.toLocaleLowerCase('es').includes(search.trim().toLocaleLowerCase('es')))
export const validProduct = (data) => {
  if (!data.name?.trim() || !data.brand?.trim() || !data.category?.trim()) return 'Completa el nombre, la marca y la categoría.'
  if (!Number.isFinite(data.price) || data.price<=0) return 'El precio debe ser mayor que cero.'
  if (!Number.isInteger(data.stock) || data.stock<0) return 'El stock debe ser un número entero igual o mayor que cero.'
  return ''
}
// El stock disponible se deriva del inventario original menos las reservas del carrito.
export function reducer(state,action){
  switch(action.type){
    case 'ADD_PRODUCT': {
      const error=validProduct(action.product)
      if(error || state.products.some(p=>p.id===action.product.id)) return state
      return {...state,products:[...state.products,action.product]}
    }
    case 'ADD_TO_CART': {
      const product=state.products.find(p=>p.id===action.id)
      if(!product || available(product,state.cart)<1)return state
      return {...state,cart:{...state.cart,[product.id]:(state.cart[product.id]||0)+1}}
    }
    case 'DECREASE_CART': {
      const quantity=state.cart[action.id]||0
      if(!quantity)return state
      const cart={...state.cart}
      if(quantity===1)delete cart[action.id]
      else cart[action.id]=quantity-1
      return {...state,cart}
    }
    case 'REMOVE_FROM_CART': {
      if(!state.cart[action.id])return state
      const cart={...state.cart};delete cart[action.id]
      return {...state,cart}
    }
    case 'RESET_DEMO':return {products:action.products.map(p=>({...p})),cart:{}}
    default:return state
  }
}
