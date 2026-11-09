import {NavLink,Outlet,Link} from 'react-router-dom'
import {LayoutDashboard,Boxes,PackagePlus,ShoppingCart,Info,Store,Leaf,Menu,X,ChevronRight} from 'lucide-react'
import {useState,useRef} from 'react'
import {useInventory} from '../context/InventoryContext'
import {totalUnits} from '../utils/inventory'
const primary=[{to:'/',label:'Inicio',icon:LayoutDashboard,end:true},{to:'/inventario',label:'Inventario',icon:Boxes},{to:'/agregar',label:'Agregar artículo',icon:PackagePlus},{to:'/carrito',label:'Carrito',icon:ShoppingCart}]
const secondary=[{to:'/nosotros',label:'Quiénes somos',icon:Info},{to:'/tiendas',label:'Nuestras tiendas',icon:Store}]
function MenuLinks({items,close}){return items.map(({to,label,icon:Icon,end})=><NavLink onClick={close} end={end} className={({isActive})=>`nav-link ${isActive?'nav-link-active':''}`} key={to} to={to}><Icon size={19} strokeWidth={2}/><span>{label}</span><ChevronRight className="ml-auto opacity-40" size={15}/></NavLink>)}
export default function Layout(){
 const [open,setOpen]=useState(false);const menuButton=useRef(null);const closeMenu=()=>{setOpen(false);menuButton.current?.focus()};const {cart}=useInventory();const count=totalUnits(cart)
 return <div className="min-h-screen lg:flex">
   {open&&<button aria-label="Cerrar menú" className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={closeMenu}/>}
   <aside id="menu-principal" onKeyDown={e=>{if(e.key==='Escape')closeMenu()}} className={`fixed inset-y-0 left-0 z-40 w-[264px] transform bg-[#133b2c] text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:visible ${open?'translate-x-0 visible':'-translate-x-full invisible'}`}>
     <div className="flex h-full flex-col px-4 py-6">
       <div className="mb-9 flex items-center gap-3 px-3"><span className="grid size-11 place-items-center rounded-2xl bg-[#b7e674] text-[#173e2e]"><Leaf size={23} strokeWidth={2.5}/></span><div><span className="block text-[21px] font-extrabold tracking-tight">verde<span className="text-[#b7e674]">market</span></span><span className="text-[11px] tracking-[.16em] text-green-200/70">INVENTARIO DIGITAL</span></div><button onClick={closeMenu} aria-label="Cerrar menú" className="ml-auto lg:hidden"><X size={20}/></button></div>
       <p className="sidebar-label">GESTIÓN</p><nav aria-label="Navegación principal" className="space-y-1"><MenuLinks items={primary} close={closeMenu}/></nav>
       <p className="sidebar-label mt-8">INFORMACIÓN</p><nav aria-label="Información del supermercado" className="space-y-1"><MenuLinks items={secondary} close={closeMenu}/></nav>
       <div className="mt-auto rounded-2xl border border-white/10 bg-white/8 p-4"><div className="text-sm font-semibold">Panel de inventario</div><p className="mt-1 text-xs leading-relaxed text-green-100/65">Organiza productos y administra tu carrito en un solo lugar.</p><div className="mt-4 flex items-center gap-2 text-xs text-[#b7e674]"><span className="inline-block size-2 rounded-full bg-[#b7e674]"/> Datos de demostración</div></div>
     </div>
   </aside>
   <div className="min-w-0 flex-1"><header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur"><div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12"><div className="flex items-center gap-3"><button ref={menuButton} aria-expanded={open} aria-controls="menu-principal" className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden" onClick={()=>setOpen(true)} aria-label="Abrir menú"><Menu/></button><div><span className="text-sm font-semibold text-[#153e30]">VerdeMarket</span><span className="hidden text-sm text-slate-400 sm:inline"> / Gestión de supermercado</span></div></div><div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full bg-[#edf6e9] px-3 py-2 text-xs font-semibold text-[#3c7545] sm:flex"><span className="size-2 rounded-full bg-green-500"/> Catálogo disponible</div><Link to="/carrito" aria-label={`Ir al carrito, ${count} productos`} className="relative flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#244f3b] transition hover:border-green-400"><ShoppingCart size={19}/>{count>0&&<span className="absolute -right-2 -top-2 grid min-w-5 place-items-center rounded-full bg-[#e99e45] px-1 text-[11px] font-bold text-white">{count}</span>}</Link><span className="grid size-10 place-items-center rounded-full bg-[#d8edd1] text-sm font-bold text-[#24583d]">DF</span></div></div></header>
   <main id="contenido" className="mx-auto min-h-[calc(100vh-145px)] max-w-[1500px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10"><Outlet/></main>
   <footer className="border-t border-slate-200 bg-white px-5 py-5 text-center text-xs text-slate-500">
     <nav aria-label="Navegación inferior" className="mx-auto mb-4 max-w-[1500px]">
       <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
         {[...primary,...secondary].map(({to,label,end})=><li key={to}><NavLink end={end} to={to} className={({isActive})=>`inline-block rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive?'bg-[#edf6e9] text-[#24583d]':'text-slate-600 hover:bg-[#edf6e9] hover:text-[#24583d]'}`}>{label}</NavLink></li>)}
       </ul>
     </nav>
     <p>© 2026 VerdeMarket · Gestión de inventario</p>
   </footer></div>
 </div>
}
