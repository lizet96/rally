import React, { useState, useEffect} from 'react';
import { PayPalButton } from 'react-paypal-button-v2';
import { useLocation } from 'react-router-dom';
import axios from 'axios'; 
import { Link } from 'react-router-dom';

const PayPal = () => {
  const location = useLocation();
  const total = new URLSearchParams(location.search).get('total');
  const usuario = new URLSearchParams(location.search).get('usuario');
  const productosParaPaypalString = new URLSearchParams(location.search).get('productosParaPaypal');
  // Convierte la cadena JSON a un objeto JavaScript
  const productosParaPaypal = productosParaPaypalString ? JSON.parse(productosParaPaypalString) : [];
  const [pagoExitoso, setPagoExitoso] = useState(false);
  


  const obtenerFechaActual = () => {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const day = fecha.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const insertarVenta = async (details, data) => {
    console.log('Payment success', details, data);
    
    try {
      // Insertar en la tabla t_venta
      const responseVenta = await axios.post(`http://localhost:3001/insertarVenta/${usuario}`, {
        ve_total: total,
        ve_fecha: obtenerFechaActual(),
      });
  
      // Manejar la respuesta de la venta
      console.log('Respuesta de la venta:', responseVenta);
  
      if (responseVenta.status === 200) {
        const idVenta = responseVenta.data.id_venta;
  
        // Insertar en la tabla detalle_venta para cada producto, incluyendo idVenta
        if (productosParaPaypal && productosParaPaypal.length > 0) {
          const insertPromises = productosParaPaypal.map(async (producto) => {
            try {
              await axios.post(`http://localhost:3001/insertarDetalleVenta/${usuario}`, {
                ...producto,
                idVenta: idVenta,
              });
            } catch (error) {
              console.error('Error al insertar en detalle_venta:', error);
              // Manejar el error según tus necesidades
            }
          });

          await Promise.all(insertPromises);
        }
        console.log('Detalles de compra para el ticket:', productosParaPaypal);
        console.log('Total de la compra para el ticket:', total);
        console.log('id_venta de la compra para el ticket:', idVenta);
  
        // Generar el ticket después de la compra exitosa
        await axios.post(`http://localhost:3001/generarTicket/${usuario}`, {
          detallesCompra: productosParaPaypal,
          totalCompra: total,
          id_venta: idVenta,
        });
  
        // Eliminar detalles del carrito después de la compra exitosa
        await axios.delete(`http://localhost:3001/eliminarDetalleCarrito/${usuario}`);
  
        // Actualizar el estado para indicar que el pago fue exitoso
        setPagoExitoso(true);
      } else {
        console.error('Error al insertar la venta:', responseVenta.status, responseVenta.statusText);
        // Manejar el error de acuerdo a tus necesidades
      }
    } catch (error) {
      console.error('Error al procesar la compra:', error);
      // Manejar el error de acuerdo a tus necesidades
    }
  };
  
  
  
  const descargarTicket = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/descargarTicket/${usuario}`, {
        responseType: 'arraybuffer',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket_${usuario}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar el ticket:', error);
    }
  };


  useEffect(() => {
    // Verificar si productosParaPaypal está definido y tiene contenido
    if (productosParaPaypal && productosParaPaypal.length > 0) {
      console.log(`Productos para PayPal impr desde paypal: ${JSON.stringify(productosParaPaypal)}`);
      console.log(`usuario: ${usuario}`);
    }
  }, [productosParaPaypal, usuario]);
  return (
    <div className="paypal-container">
      {pagoExitoso ? (
        <div className="success-container">
          <p className="success-message">Pago exitoso! Gracias por tu compra.</p>
          <div className="invoice-options">
            <p className="invoice-question">Si desea factura debe descargar su ticket</p>
            <Link to={`/bienvenida/${usuario}`}>
              <button className="continue-shopping" onClick={() => console.log('Seguir Comprando')}>
                Seguir Comprando
              </button>
            </Link>
            <Link to={`/facturacion/${usuario}`}>
              <button className="go-to-invoice">Ir a Facturar</button>
            </Link>
            <button className="download-ticket" onClick={descargarTicket}>
              Descargar Ticket
            </button>
          </div>
        </div>
      ) : (
        <div className="paypal-button-container">
          <PayPalButton
            amount={total}
            onSuccess={(details, data) => insertarVenta(details, data)}
            options={{
              clientId: 'AZVO5rkMR6-eczxnOW-4zl_zgZDww8MjQx8jjGsElOGmGFcFMWc0VOydgxi_iKnhj8xMbDjxgpYrfd4e',
              currency: 'MXN',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PayPal;