import {createContext,useContext,useReducer} from 'react'
import {initialProducts} from '../data/products'
import {reducer} from '../utils/inventory'
const InventoryContext=createContext(null)
export function InventoryProvider({children}){
  // useReducer permite compartir las acciones entre todas las pantallas con Context.
  const [state,dispatch]=useReducer(reducer,{products:initialProducts.map(p=>({...p})),cart:{}})
  return <InventoryContext.Provider value={{...state,dispatch}}>{children}</InventoryContext.Provider>
}
export function useInventory(){const context=useContext(InventoryContext);if(!context)throw new Error('InventoryProvider es obligatorio');return context}
