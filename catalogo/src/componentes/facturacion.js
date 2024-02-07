import React, { useState, useEffect } from 'react';import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '20px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '10px',
    backgroundColor: 'black',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  smallButton: {
    display: 'inline-block',
    padding: '5px',
    backgroundColor: 'black',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  buttonsContainer: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: 'black',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  returnButton: {
    padding: '10px 20px',
    backgroundColor: 'black',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

const Factura = () => {
  const { usuario } = useParams();
  const [idVenta, setIdVenta] = useState('');
  const [rfc, setRfc] = useState('');
  const [regimenFiscal, setRegimenFiscal] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [usoCFDI, setUsoCFDI] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isVentaValida, setIsVentaValida] = useState(false);
  const [isFacturaGenerada, setIsFacturaGenerada] = useState(false);
  const [productosParaPaypal, setProductosParaPaypal] = useState([]); // o el tipo de dato adecuado
  const [total, setTotal] = useState(0);

  const [datosFactura, setDatosFactura] = useState({
    idVenta: '',
    rfc: '',
    regimenFiscal: '',
    razonSocial: '',
    usoCFDI: '',
  });

  const handleIdVentaChange = (e) => {
    setIdVenta(e.target.value);
    setError(null);
    setMessage(null);
    setErrorMessage(null);
    setIsVentaValida(false);
  };

  const handleRfcChange = (e) => {
    setRfc(e.target.value);
  };

  const handleRegimenFiscalChange = (e) => {
    setRegimenFiscal(e.target.value);
  };

  const handleRazonSocialChange = (e) => {
    setRazonSocial(e.target.value);
  };

  const handleUsoCFDIChange = (e) => {
    setUsoCFDI(e.target.value);
  };

  const handleValidation = async () => {
    if (!idVenta) {
      alert('Por favor ingrese el ID de su venta.');
      return;
    }
    try {
      const response = await axios.post(`http://localhost:3001/validarVenta/${idVenta}`);
      console.log('Respuesta de validación:', response.data);

      if (response.data.success) {
        setMessage('Compra validada con éxito.');
        setErrorMessage(null);
        setIsVentaValida(true);
        setDatosFactura({
          idVenta,
          rfc,
          regimenFiscal,
          razonSocial,
          usoCFDI,
        });
      } else {
        setMessage(null);
        setErrorMessage('Compra no encontrada.');
        setIsVentaValida(false); // Establecer el estado de validez en false
        setIsFacturaGenerada(false);
      }

      setError(null);
    } catch (error) {
      setErrorMessage('No se encontró la venta o ya se encuentra facturada, intenta con otro ID.');
      setError('Error al validar la venta. Por favor, inténtalo de nuevo.');
      console.error('Error al validar la venta:', error);
      setIsVentaValida(false); // Establecer el estado de validez en false en caso de error
    }
  };

  const validarCampos = async () => {
    console.log('Haciendo clic en el botón validarCampos');

    // Verificar si todos los campos requeridos están llenos
    if (!rfc || !regimenFiscal || !razonSocial || !usoCFDI) {
      console.log('Campos incompletos');
      alert('Por favor complete todos los campos antes de realizar la factura.');
      setMessage(null);
      return;
    }

    console.log('Antes de la lógica de creación de factura en validarCampos');
    try {
      console.log('Productos para PayPal:', productosParaPaypal);
      console.log('Total:', total);
      const response = await axios.post('http://localhost:3001/datosFactura', {
        idVenta,
        rfc,
        regimenFiscal,
        razonSocial,
        usoCFDI,
      });
      console.log('Respuesta del servidor:', response.data);
      // Generar la factura después de ingresar datos
      console.log('Usuario antes del serv desde:', usuario);

      console.log('Datos a enviar al servidor:', {
        detallesCompra: productosParaPaypal,
        totalCompra: total,
        id_venta: idVenta,
        datosFactura: {
          idVenta: idVenta,
          rfc: rfc,
          regimenFiscal: regimenFiscal,
          razonSocial: razonSocial,
          usoCFDI: usoCFDI,
        },
      });

      axios.post(`http://localhost:3001/generarFactura/${usuario}`, {
        id_venta: idVenta,
        datosFactura: {
          idVenta,
          rfc,
          regimenFiscal,
          razonSocial,
          usoCFDI,
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setIsFacturaGenerada(true);
      // Mensaje en caso de éxito
      setMessage('Factura realizada con éxito.');
      setErrorMessage(null);
    } catch (error) {
      // Mensaje en caso de error
      console.log('Error al realizar la factura:', error);
      setMessage(null);

      // Imprimir detalles del error
      if (error.response) {
        console.error('Respuesta del servidor con datos:', error.response.data);
        console.error('Código de estado HTTP:', error.response.status);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor.');
      } else {
        console.error('Error durante la solicitud:', error.message);
      }

      console.error('Error al realizar la factura:', error);
    }
  };

  const descargarFactura = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/descargarFactura/${usuario}/${idVenta}`, {
        responseType: 'arraybuffer',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura_${usuario}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar la factura:', error);
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
  
    // Verificar si productosParaPaypal está definido y tiene contenido
    if (productosParaPaypal && productosParaPaypal.length > 0) {
      console.log(`Productos para PayPal: ${JSON.stringify(productosParaPaypal)}`);
      console.log(`Total: ${total}`);
    }
  }, [productosParaPaypal, total, navigate]);
  

  return (
    <div style={styles.container}>
      {loggedIn ? (
        <p>Bienvenido, {idVenta}.</p>
      ) : (
        <div>
          <h2 style={styles.title}>Proceso de Facturación</h2>
          <label style={styles.label} htmlFor="idVenta">
            ID Venta:
          </label>
          <input
            style={styles.input}
            type="text"
            id="idVenta"
            value={idVenta}
            onChange={handleIdVentaChange}
          />
          {message && <p style={{ color: 'green' }}>{message}</p>}
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <button style={styles.smallButton} onClick={handleValidation}>
            Validar Compra
          </button>
          <label style={styles.label} htmlFor="rfc">
            RFC:
          </label>
          <input
            style={styles.input}
            type="text"
            id="rfc"
            value={rfc}
            onChange={handleRfcChange}
            disabled={!isVentaValida}
          />
          <label style={styles.label} htmlFor="regimenFiscal">
            Régimen Fiscal:
          </label>
          <input
            style={styles.input}
            type="text"
            id="regimenFiscal"
            value={regimenFiscal}
            onChange={handleRegimenFiscalChange}
            disabled={!isVentaValida}
          />
          <label style={styles.label} htmlFor="razonSocial">
            Razón Social:
          </label>
          <input
            style={styles.input}
            type="text"
            id="razonSocial"
            value={razonSocial}
            onChange={handleRazonSocialChange}
            disabled={!isVentaValida}
          />
          <label style={styles.label} htmlFor="usoCFDI">
            Uso de CFDI:
          </label>
          <input
            style={styles.input}
            type="text"
            id="usoCFDI"
            value={usoCFDI}
            onChange={handleUsoCFDIChange}
            disabled={!isVentaValida}
          />
          <div style={styles.buttonsContainer}>
            <button
              style={styles.button}
              onClick={validarCampos}
              disabled={!isVentaValida || isFacturaGenerada} // Deshabilita el botón si la venta no está validada o la factura ya está generada
            >
              Realizar Factura
            </button>
          </div>
          <div style={styles.buttonsContainer}>
            <Link to={`/bienvenida/${usuario}`}>
              <button style={styles.returnButton}>Regresar</button>
            </Link>
            <button
              className="download-ticket"
              onClick={descargarFactura}
              disabled={!isFacturaGenerada} // Deshabilita el botón si la factura no está generada
            >
              Descargar Factura
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Factura;