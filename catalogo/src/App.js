import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Cambio de importaciones

import Catalogo from './componentes/Inicio';
import AcercaDe from './componentes/AcercaDe';
import Compania from './componentes/compania';
import Login from './componentes/login';
import Registro from './componentes/registro';
import Bienvenida from './componentes/bienvenida';
import Administrador from './componentes/Administrador';
import GestionClientes from './componentes/gestionClientes';
import GestionProveedores from './componentes/gestionProvedores';
import GestionProductos from './componentes/gestionProductos'; // Corregir el nombre de la importación
import GestionSucursales from './componentes/gestionSucursales'; // Nombre corregido
import InventoryForm from './componentes/inventario';
import Favoritos from './componentes/favoritos';
import Carrito from './componentes/carrito';
import PayPal from './componentes/paypal'; 
import Factura from './componentes/facturacion';
import Historial from './componentes/historial';

function App() {
    return (
        <Router>
            <Routes>
                
                <Route path="/acerca-de" element={<AcercaDe />} /> {/* Utiliza 'element' en lugar de 'component' */}
                <Route path="/" element={<Catalogo />} /> {/* Utiliza 'element' en lugar de 'component' */}
                <Route path="/compania" element={<Compania />} /> {/* Utiliza 'element' en lugar de 'component' */}
                <Route path="/login" element={<Login />} /> {/* Utiliza 'element' en lugar de 'component' */}
                <Route path="/registro" element={<Registro/>} /> {/* Utiliza 'element' en lugar de 'component' */}
                <Route path="/bienvenida/:usuario" element={<Bienvenida />} />
                <Route path="/bienvenida" element={<Bienvenida />} />
                <Route path="/administrador" element={<Administrador/>} /> {/* Utiliza 'element' en lugar de 'component' */}
                <Route path="/GestionClientes" element={<GestionClientes/>} /> {/* Utiliza 'element' en lugar de 'component' */}
                <Route path="/gestionProveedores" element={<GestionProveedores />} />
                <Route path="/gestionProductos" element={<GestionProductos />} /> {/* Corregir el nombre de la componente */}
                <Route path="/gestionSucursales" element={<GestionSucursales />} />
                <Route path="/inventario" element={<InventoryForm />} />
                <Route path="/favoritos/:usuario" element={<Favoritos />} />
                <Route path="/carrito/:usuario" element={<Carrito />} />
                <Route path="/paypal" element={<PayPal />} />
                <Route path="/facturacion/:usuario" element={<Factura />} />
                <Route path="/historial/:usuario" element={<Historial />} />


            </Routes>
        </Router>
    );
}

export default App;