import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { AiFillShopping,AiOutlineDelete } from 'react-icons/ai';



const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
    padding: '20px',
    overflowX: 'auto',
    flexWrap: 'nowrap', 
  },
  productCard: {
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
     width: '200px',
  },
  productImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  productName: {
    fontWeight: 'bold',
    margin: '10px 0',
  },
  productPrice: {
    fontWeight: 'bold',
    margin: '10px 0',
  },
  productDescription: {
    fontSize: '14px',
    marginBottom: '10px',
  },
  iconContainer: {
    display: 'flex',
    gap: '10px',
  },
  navbarRightContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  icon: {
    width: '24px',
    height: '24px',
    cursor: 'pointer',
  },
};
const Favoritos = () => {
  const [favoritos, setFavoritos] = useState([]);
  const { usuario } = useParams();
  const navigate = useNavigate();
  const [reloadPage, setReloadPage] = useState(false);


  //FUNCION PARA AGREGAR AL CARRITO "PENDIENTE MODIFICAR!!!"
const handleAgregarAlCarrito = async (idProducto) => {
  try {
    // Realiza una solicitud al servidor para agregar o quitar el producto de favoritos
    const response = await axios.post('http://localhost:3001/agregarAcarrito', {
      usuario,
      idProducto,
    });
    if (response.data.success) {
      // Si la solicitud fue exitosa, actualiza el estado de favoritos
      const updatedFavoritos = favoritos.includes(idProducto)
        ? favoritos.filter((productId) => productId !== idProducto)
        : [...favoritos, idProducto];
      setFavoritos(updatedFavoritos);
    } else {
      console.error('Error al agregar/quitar producto de favoritos:', response.data.message);
    }
  } catch (error) {
    console.error('Error en la petición:', error);
  }
};

useEffect(() => {
  // Verificar si hay información en localStorage
  const usuarioLocalStorage = localStorage.getItem('usuario');
  const tipoUsuarioLocalStorage = localStorage.getItem('tipo');

  // Si no hay información, redirigir al usuario a la página de login
  if (!usuarioLocalStorage || !tipoUsuarioLocalStorage) {
    localStorage.clear();
    navigate('/login');
    return;
  }

  const obtenerFavoritos = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/mostrarfavoritos/${usuario}`);
      setFavoritos(response.data);
    } catch (error) {
      console.error('Error al obtener los productos favoritos:', error);
    }
  };

  obtenerFavoritos();
}, [navigate, usuario]);
const eliminarFavoritos = async (idProducto, idSucursal) => {
  try {
    const response = await axios.post('http://localhost:3001/eliminarFavoritos', {
      usuario,
      idProducto,
      idSucursal,
    });

    if (response.data.success) {
      const updatedFavoritos = favoritos.filter(
        (producto) => !(producto.id_producto === idProducto && producto.id_sucursal === idSucursal)
      );

      setFavoritos(updatedFavoritos);
      forceRender();

      // Cambiamos a utilizar navigate en lugar de window.location.reload()
      navigate(`/favoritos/${usuario}`);
    } else {
      console.error('Error al eliminar producto de favoritos:', response.data.message);
      setFavoritos(favoritos);
    }
  } catch (error) {
    console.error('Error en la petición:', error);
  }
};

// Efecto para recargar la página cuando reloadPage cambia
useEffect(() => {
  if (reloadPage) {
    // Recarga la página
    window.location.reload();
  }
}, [reloadPage]);
// Función para forzar la renderización del componente
const forceRender = () => {
  setFavoritos((prev) => [...prev]);
};
  return (
    <div>
<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
    <div className="container">
        <Link to="" className="navbar-brand">LIZONE</Link>
        
        <div className="ml-auto">
            <Link to={`/bienvenida/${usuario}`} className="navbar-brand">Regresar</Link>
        </div>
    </div>
</nav>

      <div style={styles.container}>
        {favoritos.map((producto) => (
          <div key={producto.id} style={styles.productCard}>
            <img
              style={styles.productImage}
              src={process.env.PUBLIC_URL + '/' + producto.imagen}
              alt={producto.nombre}
            />
            <span style={styles.productName}>{producto.nombre}</span>
            {producto.descripcion && (
              <span style={styles.productDescription}>{producto.descripcion}</span>
            )}
            <span style={styles.productPrice}>${producto.pr_venta}</span>
            <div style={styles.iconContainer}>
              <AiFillShopping style={styles.icon} onClick={() => handleAgregarAlCarrito(producto.id_producto)} />

              <AiOutlineDelete style={styles.icon} onClick={() => eliminarFavoritos(producto.id_producto, producto.id_sucursal)} />

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favoritos;