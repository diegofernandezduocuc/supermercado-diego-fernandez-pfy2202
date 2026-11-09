import {Routes,Route} from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Inventory from './pages/Inventory'
import AddProduct from './pages/AddProduct'
import Detail from './pages/Detail'
import Cart from './pages/Cart'
import {About,Stores} from './pages/InfoPages'
import {Empty,PrimaryLink} from './components/UI'
// Rutas centralizadas: navegación principal, informativas y detalle dinámico.
export default function App(){return <Routes><Route element={<Layout/>}><Route index element={<Home/>}/><Route path="inventario" element={<Inventory/>}/><Route path="inventario/:id" element={<Detail/>}/><Route path="agregar" element={<AddProduct/>}/><Route path="carrito" element={<Cart/>}/><Route path="nosotros" element={<About/>}/><Route path="tiendas" element={<Stores/>}/><Route path="*" element={<Empty title="Página no encontrada" description="La dirección solicitada no existe." action={<PrimaryLink to="/">Volver al inicio</PrimaryLink>}/>}/></Route></Routes>}
