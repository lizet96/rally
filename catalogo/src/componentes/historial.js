import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '20px',
    overflowX: 'auto',
  },
  purchaseCard: {
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '15px',
  },
  purchaseImage: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    marginRight: '15px',
  },
  purchaseInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: 'calc(100% - 80px)',
  },
  purchaseDate: {
    fontWeight: 'bold',
    fontSize: '18px',
  },
  purchaseItem: {
    fontSize: '14px',
    color: '#666',
  },
  purchasePrice: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: '16px',
  },
};

const Historial = () => {
  const { usuario } = useParams();
  const [historial, setHistorial] = useState([]);
  const navigate = useNavigate();

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

    const obtenerHistorial = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/mostrarHistorial/${usuario}`);
        const historialData = response.data || [];
        console.log('Datos del historial desde el servidor:', historialData);
        setHistorial(historialData);
      } catch (error) {
        console.error('Error al obtener el historial de compras:', error);
      }
    };

    obtenerHistorial();
  }, [usuario, navigate]);
  console.log('est_factura en el cliente:', historial[0]?.est_factura);

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
        {historial.length === 0 ? (
          <p>No hay historial de compras disponible.</p>
        ) : (
          Object.values(
            historial.reduce((agrupado, compra) => {
              if (!agrupado[compra.id_venta]) {
                agrupado[compra.id_venta] = [];
              }
              agrupado[compra.id_venta].push(compra);
              return agrupado;
            }, {})
          ).map((grupoCompras, index) => (
            <div key={index}>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', background: 'black', color: 'white', padding: '10px', marginBottom: '10px' }}>
                <h4>{`ID de la compra: ${grupoCompras[0].id_venta}`}</h4>
                <h4>{`Fecha: ${new Date(grupoCompras[0].ve_fecha).toLocaleDateString()}`}</h4>
                <h4>{`Estado: ${grupoCompras[0].est_factura === 0 ? 'Sin facturar' : 'Facturada'}`}</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {grupoCompras.map((compra, compraIndex) => (
                  <div key={compraIndex} style={styles.purchaseCard}>
                    <div style={styles.purchaseInfo}>
                      <span>{`Producto: ${compra.det_nombre}`}</span>
                      <span>{`Cantidad: ${compra.det_cantidad}`}</span>
                      <span>{`Precio Unitario: $${compra.det_precioUnit}`}</span>
                      <span>{`Subtotal: $${compra.det_subtotal}`}</span>
                      <span>{`Sucursal: ${compra.id_sucursal}`}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={styles.purchaseCard}>
                <div style={styles.purchaseInfo}>
                  <h5>{`Total de la compra: $${grupoCompras[0].ve_total}`}</h5>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Historial;