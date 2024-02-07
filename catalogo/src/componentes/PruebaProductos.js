import React, { useState, useEffect } from 'react';
import './estilos/bienvenida.css';
import { FaShoppingCart, FaHeart, FaUser } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const Bienvenida = () => {
  const { nombreUsuario } = useParams();
  const [productos, setProductos] = useState([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null); // Nuevo estado para la sucursal seleccionada

  const iconStyle = {
    fontSize: '30px',
  };

  // Actualiza los productos cuando cambia la sucursal seleccionada
  useEffect(() => {
    if (sucursalSeleccionada !== null) {
      fetch(`http://localhost:3001/productos/sucursal/${sucursalSeleccionada}`)
        .then(response => response.json())
        .then(data => setProductos(data))
        .catch(error => console.error('Error fetching data: ', error));
    } else {
      // Si no se selecciona una sucursal, obtén todos los productos
      fetch('http://localhost:3001/productos')
        .then(response => response.json())
        .then(data => setProductos(data))
        .catch(error => console.error('Error fetching data: ', error));
    }
  }, [sucursalSeleccionada]);

  return (
    <div>
      <header className="header">
        <div className="header-title">
          <h1>Librofy</h1>
        </div>
        <div className="header-icons">
          <FaShoppingCart className="icon" style={iconStyle} />
          <FaHeart className="icon" style={iconStyle} />
          <FaUser className="icon" style={iconStyle} />
        </div>
      </header>
      <div className="main-content">
        <h2>Bienvenido {nombreUsuario}</h2>
        <h3>Catálogo de Libros</h3>
        <div className="botones-sucursales">
          <button
            className="sucursal-button"
            onClick={() => setSucursalSeleccionada(1)}
          >
            Suc Queretaro
          </button>
          <button
            className="sucursal-button"
            onClick={() => setSucursalSeleccionada(2)}
          >
            Suc Mty
          </button>
          <button
            className="sucursal-button"
            onClick={() => setSucursalSeleccionada(3)}
          >
            Suc nose
          </button>
          <button
            className="sucursal-button"
            onClick={() => setSucursalSeleccionada(null)}
              >
            Mostrar todo
          </button>
        </div>
        <ul className="catalogo">
          {productos.map(producto => (
            <li key={producto.id_producto} className="producto">
              {producto.imagen && (
                <div className="producto-imagen">
                  <img src={`/imagenes/${producto.imagen}`} alt={producto.nombre} />
                </div>
              )}
              <div className="producto-info">
                <p className="producto-nombre">{producto.nombre}</p>
                <p className="producto-autor">Autor: {producto.autor}</p>
                <p className="producto-precio">Precio: ${producto.pr_venta}</p>
                <div className="producto-iconos">
                  <FaShoppingCart className="icon" style={iconStyle} />
                  <FaHeart className="icon" style={iconStyle} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Bienvenida;