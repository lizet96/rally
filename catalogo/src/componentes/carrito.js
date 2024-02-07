import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
//import PayPal from './paypal';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '20px',
    overflowX: 'auto',
  },
  productCard: {
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row', // Cambiado a 'row' para alinear horizontalmente
    alignItems: 'center', // Alinea los elementos verticalmente al centro
    padding: '15px',
  },
  productImage: {
    width: '80px', // Ancho reducido
    height: '80px', // Altura para mantener la proporción
    objectFit: 'contain',
    marginRight: '15px', // Añadido margen derecho
  },

  productInfo: { // Estilo para el contenedor de la información del producto
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start', // Alinea los textos a la izquierda
    justifyContent: 'center',
    width: 'calc(100% - 80px)', // Restar el ancho de la imagen
  },

   productName: {
    fontWeight: 'bold',
    fontSize: '18px',
  },

  productPrice: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: '16px',
  },
  productDescription: {
    fontSize: '14px',
    color: '#666',
  },
  iconContainer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end', // Alinea los botones a la derecha
    width: '100%',
  },
  button: {
    backgroundColor: '#000',
    color: '#fff',
    padding: '5px 10px', // Ajusta el padding para hacer el botón más pequeño
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    width: '80px',
  },
  quantityButton: {
    background: 'none',
    border: '1px solid #ccc',
    padding: '5px 10px',
    cursor: 'pointer',
    color: '#000000',
  },
  quantityInput: {
    border: '1px solid #ccc',
    textAlign: 'center',
    width: '60px', 
    margin: '0 5px',
  },
};

const Carrito = () => {
  const { usuario } = useParams();
  const [carrito, setCarrito] = useState([]);
  const [totalSinIVA, setTotalSinIVA] = useState(0);
  const [iva, setIVA] = useState(0);
  const [total, setTotal] = useState(0);
  const [productosParaPaypal, setProductosParaPaypal] = useState([]);
  const navigate = useNavigate();
  const [pagoIniciado, setPagoIniciado] = useState(false);


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

    const obtenerCarrito = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/mostrarCarrito/${usuario}`);
        const carritoData = response.data || [];
        setCarrito(carritoData);
        calcularTotalSinIVA(carritoData);
        // Llamar a actualizarProductosParaPaypal solo si hay productos en el carrito
        if (carritoData.length > 0) {
          actualizarProductosParaPaypal(carritoData);
        }
      } catch (error) {
        console.error('Error al obtener los productos en el carrito:', error);
      }
    };
    obtenerCarrito();
  }, [usuario, navigate]);

   // Función para actualizar el estado de productosParaPaypal
   const actualizarProductosParaPaypal = (carritoData) => {
    const productosParaPaypalData = carritoData.map((producto) => ({
      id_producto: producto.id_producto,
      det_nombrePro: producto.nombre,
      det_cantidad: producto.det_cantidad,
      det_precio: producto.pr_venta,
      det_subtotal: producto.det_cantidad * producto.pr_venta,
      id_sucursal: producto.id_sucursal,
      det_iva: iva,
    }));

    return productosParaPaypalData;
  };
  const handlePagar = () => {
    setPagoIniciado(true);
    console.log('Entrando a handlePagar');
    const productosParaPaypalData = actualizarProductosParaPaypal(carrito);

    if (productosParaPaypalData.length > 0) {
      console.log('Productos para PayPal desde handlePagar:', productosParaPaypalData);

      // Codificar los datos como parámetro de consulta
      const productosParaPaypalQueryString = encodeURIComponent(JSON.stringify(productosParaPaypalData));

      // Utiliza navigate en lugar de Link para redirigir
      navigate(`/paypal?total=${total}&usuario=${usuario}&productosParaPaypal=${productosParaPaypalQueryString}`);
    }
  };
  const actualizarCantidad = async (idProducto, nuevaCantidad, id_sucursal) => {
    const updatedCarrito = carrito.map((producto) => {
      if (producto.id_producto === idProducto && producto.id_sucursal === id_sucursal) {
        console.log('ID de la sucursal:', producto.id_sucursal);
  
        return { ...producto, det_cantidad: nuevaCantidad, id_sucursal: producto.id_sucursal };
      }
      return producto;
    });    
    setCarrito(updatedCarrito);
      if (id_sucursal !== undefined) {
      console.log('Solicitud de actualización de cantidad:', {
        usuario,
        idProducto,
        id_sucursal,
        cantidad: nuevaCantidad,
      });
      try {
        await axios.post(`http://localhost:3001/actualizarCantidad/${usuario}/${idProducto}/${id_sucursal}`, {
          cantidad: nuevaCantidad,
        });
      } catch (error) {
        if (error.response && error.response.status === 400) {
          alert(`No hay suficientes existencias en el inventario. Disponibles: ${error.response.data.availableQuantity}`);
        } else {
          console.error('Error al actualizar la cantidad:', error);
        }
      }
    }
    calcularTotalSinIVA(updatedCarrito);
  };
  
  
  
  const calcularIVA = (total, porcentajeIVA) => {
    return total * (porcentajeIVA / (100 + porcentajeIVA));
  };
  

  //CALCULA TOTAL SIN IVA, IVA Y TOTAL
  const calcularTotalSinIVA = (carrito) => {
    const subtotalProductos = carrito.reduce((total, producto) => {
      return total + producto.det_cantidad * producto.pr_venta;
    }, 0);
  
    // Utiliza toFixed(2) para limitar a dos decimales
    const subtotalFormateado = parseFloat(subtotalProductos.toFixed(2));
    setTotalSinIVA(subtotalFormateado);
  
    // Calcular el IVA (16%)
    const porcentajeIVA = 16; // Puedes ajustar esto si es necesario
    const calculoIVA = calcularIVA(subtotalProductos, porcentajeIVA);
  
    // Utiliza toFixed(2) para limitar a dos decimales
    const ivaFormateado = parseFloat(calculoIVA.toFixed(2));
    setIVA(ivaFormateado);
  
    // Calcular el total sumando el total sin IVA y el IVA
    const totalCalculado = subtotalProductos + calculoIVA;
  
    // Utiliza toFixed(2) para limitar a dos decimales
    const totalFormateado = parseFloat(totalCalculado.toFixed(2));
    setTotal(totalFormateado);
  };

  const handleEliminarProducto = async (idProducto) => {
    try {
      await axios.delete(`http://localhost:3001/eliminarProducto/${usuario}/${idProducto}`);
      
      setCarrito((prevCarrito) => prevCarrito.filter((producto) => producto.id !== idProducto));
      

    } catch (error) {
      console.error('Error al eliminar el producto del carrito:', error);
    }
  };

  useEffect(() => {
    if (pagoIniciado && carrito.length > 0) {
      console.log('Antes de handlePagar:', carrito);
      handlePagar(carrito);
    }
  }, [pagoIniciado, carrito]);

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
        {carrito.map((producto) => (
          <div key={producto.id} style={styles.productCard}>
            <img
              style={styles.productImage}
              src={process.env.PUBLIC_URL + '/' + producto.imagen}
              alt={producto.nombre}
            />
            <div style={styles.productInfo}>
            <span key={`nombre-${producto.id}`} style={styles.quantityInput}>
              {producto.nombre}
            </span>
            <span key={`descripcion-${producto.id}`} style={styles.productDescription}>
              {producto.descripcion}
            </span>
            <span key={`precio-${producto.id}`} style={styles.productPrice}>
              ${producto.pr_venta}
            </span>
            </div>
            <div style={styles.iconContainer}>
              <button
                style={styles.button}
                onClick={() => handleEliminarProducto(producto.id_producto)}
              >
                Eliminar
              </button>

              <span key={`subtotal-${producto.id}`} style={styles.productPrice}>
                Subtotal: ${producto.det_cantidad * producto.pr_venta}
              </span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>Cantidad:</span>
             <input
                style={styles.quantityInput}
                type="number"
                value={producto.det_cantidad}
                onChange={(e) => actualizarCantidad(producto.id_producto, parseInt(e.target.value), producto.id_sucursal)}
                min="1"
              />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p> <h4>Total sin IVA: ${totalSinIVA}</h4></p>
      <p><h4>IVA: ${iva}</h4></p>
      <p><h3>Total: ${total}</h3></p>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      {/* Utiliza Link para navegar a la página de PayPal */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        {/* Utiliza la función navigate directamente en el evento onClick */}
        <button onClick={handlePagar} className="paypal-link">
          <h4>Pagar</h4>
        </button>
      </div>

    </div>
    </div>
  );
};

export default Carrito;

