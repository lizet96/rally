import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AiFillShopping, AiFillHeart,AiOutlineLock,AiFillFileText,AiOutlineClockCircle } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
    padding: '20px',
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

const Bienvenida = () => {
  const { usuario } = useParams();
  const [productosList, setProductosList] = useState([]);
  const SUCURSALES_URI = 'http://localhost:3001/sucursal/';
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null); 
  const [showSucursales, setShowSucursales] = useState(false);
  const [sucursales, setSucursales] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  
  const navigate = useNavigate();

//FUNCION PARA AGREGAR AL CARRITO 

const handleToggleCarrito = async (id_producto) => {
  try {
    console.log('Usuario:', usuario);
    console.log('ID Producto:', id_producto);
    console.log('ID Sucursal:', sucursalSeleccionada);  
    // Verificar si hay una sucursal seleccionada
    if (sucursalSeleccionada === null) {
      alert('Debe seleccionar una sucursal');
      return;
    }

    // Realizar la solicitud al servidor para agregar/quitar de favoritos
    const response = await axios.post('http://localhost:3001/agregarAcarrito', {
      usuario,
      id_producto,
      sucursalSeleccionada,
    });

    if (response.data.success) {
      const { cantidad, message } = response.data;

      if (cantidad > 1) {
        alert(`Producto agregado al carrito. Ahora tienes ${cantidad} unidades.`);
      } else {
        alert(message || 'Producto agregado al carrito con éxito.'); // Utiliza un mensaje predeterminado si message está undefined
      }

      // Actualizar tus variables temporales según sea necesario
      // Por ejemplo, podrías actualizar la cantidad directamente en el estado de productosList
      const updatedProductosList = productosList.map((product) =>
        product.id_producto === id_producto && product.id_sucursal === sucursalSeleccionada
          ? { ...product, det_cantidad: cantidad }
          : product
      );

      setProductosList(updatedProductosList);

    } else {
      console.error('Error al agregar producto al carrito:', response.data.message);
      alert(response.data.message || 'Error al agregar producto al carrito');  // Utiliza un mensaje predeterminado si message está undefined
    }
  } catch (error) {
    console.error('Error en la petición:', error);
    alert('El producto ya se encuentra en el carrito para esta sucursal.');
  }
};



// FUNCION PARA AGREGAR/ELIMINAR DE FAVORITOS  
const handleToggleFavorito = async (id_producto) => {
  try {
    console.log('Usuario:', usuario);
    console.log('ID Producto:', id_producto);
    console.log('ID Sucursal:', sucursalSeleccionada);  
    // Verificar si hay una sucursal seleccionada
    if (sucursalSeleccionada === null) {
      alert('Debe seleccionar una sucursal');
      return;
    }

    // Realizar la solicitud al servidor para agregar/quitar de favoritos
    const response = await axios.post('http://localhost:3001/favoritos', {
      usuario,
      id_producto,
      sucursalSeleccionada, // Agregar el id_sucursal
    });

    if (response.data.success) {
      // Si la solicitud fue exitosa, actualizar el estado de favoritos
      const updatedFavoritos = favoritos.includes(id_producto)
        ? favoritos.filter((productId) => productId !== id_producto)
        : [...favoritos, id_producto,sucursalSeleccionada];
      setFavoritos(updatedFavoritos);
    } else {
      console.error('Error al agregar/quitar producto de favoritos:', response.data.message);
    }
  } catch (error) {
    console.error('Error en la petición:', error);
  }
};


  // Función para obtener las sucursales
  const fetchSucursales = async () => {
    try {
      const response = await axios.get(SUCURSALES_URI);
      setSucursales(response.data); // Almacena las sucursales en el estado
    } catch (error) {
      console.error('Error al obtener las sucursales:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:3001/logout', { usuario });
      console.log('Respuesta del servidor:', response.data);
  
      if (response.data.success) {
        localStorage.removeItem('usuario');
        localStorage.removeItem('sucursalSeleccionada');
        navigate('/login');
      } else {
        console.error('Error al cerrar sesión:', response.data.message);
      }
    } catch (error) {
      console.error('Error en la petición:', error);
    }
  };
  

  const handleSucursalChange = (sucursalId) => {
    setSucursalSeleccionada(sucursalId);
  
    // Almacenar usuario y sucursal en localStorage
    localStorage.setItem('usuario', usuario);
    localStorage.setItem('sucursalSeleccionada', sucursalId);
  
    axios
      .get(`http://localhost:3001/productos-sucursal/${sucursalId}`)
      .then((response) => {
        setProductosList(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data: ', error);
      });
  };
  // Actualiza los productos cuando cambia la sucursal seleccionada
  
  useEffect(() => {
    const storedUsuario = localStorage.getItem('usuario');
    const storedSucursalSeleccionada = localStorage.getItem('sucursalSeleccionada');
  
    if (!storedUsuario) {
      // Manejar la falta de usuario almacenado, posiblemente redirigir a la página de inicio de sesión
      navigate('/login');
      return;
    }
  
    setSucursalSeleccionada(storedSucursalSeleccionada || null);
  
    const fetchData = async () => {
      try {
        fetchSucursales();
  
        let productsRequest;
  
        if (storedSucursalSeleccionada !== null) {
          productsRequest = axios.get(`http://localhost:3001/productos-sucursal/${storedSucursalSeleccionada}`);
        } else {
          productsRequest = axios.get('http://localhost:3001/productos');
        }
  
        const response = await productsRequest;
  
        const filteredProducts = response.data.filter((product) => product.pr_estatus === 1);
        setProductosList(filteredProducts);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
  
    fetchData();
  }, []); // Arreglo de dependencias vacío para ejecutar solo una vez al montar el componente
  
  

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link to="" className="navbar-brand">
            LIZONE
          </Link>
          <div style={styles.navbarRightContainer}>
            <div className="dropdown">
              <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                onClick={() => setShowSucursales(!showSucursales)}
              >
                {sucursalSeleccionada
                  ? sucursales.find((s) => s.id_sucursal === sucursalSeleccionada)?.suc_nombre
                  : 'Seleccionar Sucursal'}
              </button>
              <ul className={`dropdown-menu ${showSucursales ? 'show' : ''}`}>
                {sucursales.map((sucursal) => (
                  <li key={sucursal.id_sucursal}>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        handleSucursalChange(sucursal.id_sucursal);
                        setShowSucursales(false);
                      }}
                    >
                      {sucursal.suc_nombre}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div style={styles.iconContainer}>
            <Link to={`/favoritos/${usuario}`}>
                <AiFillHeart style={{ ...styles.icon, color: 'white' }} />
            </Link>
            <Link to={`/carrito/${usuario}`}> 
              <AiFillShopping style={{...styles.icon, color: 'white' }} />
            </Link>  
            <Link to={`/facturacion/${usuario}`}> 
              <AiFillFileText style={{...styles.icon, color: 'white' }} />
            </Link>
            <Link to={`/historial/${usuario}`}> 
              <AiOutlineClockCircle style={{...styles.icon, color: 'white' }} />
            </Link>
              <AiOutlineLock style={{...styles.icon,  color: 'white'}} onClick={handleLogout} />
            </div>

          </div>
        </div>
      </nav>

      <div style={styles.container}>
        {productosList.map((product) => (
          <div key={product.id_producto} style={styles.productCard}>
            <img
              style={styles.productImage}
              src={process.env.PUBLIC_URL + '/' + product.imagen}
              alt={product.nombre}
            />
            <span style={styles.productName}>{product.nombre}</span>
            <span style={styles.productDescription}>{product.descripcion}</span>
            <span style={styles.productPrice}>${product.pr_venta}</span>

            <div style={styles.iconContainer}>
              <AiFillShopping style={styles.icon} onClick={() => handleToggleCarrito(product.id_producto)} />
              <AiFillHeart
                style={{ ...styles.icon, color: favoritos.includes(product.id_producto) ? 'red' : 'black' }}
                onClick={() => handleToggleFavorito(product.id_producto)}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bienvenida;
