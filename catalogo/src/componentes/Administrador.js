import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import React, { useEffect } from 'react';
    

const styles = {
  container: {
    maxWidth: '500px',
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
  subtitle: {
    textAlign: 'center',
    marginBottom: '30px',
    fontWeight: 'normal',
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '10px',
    backgroundColor: '#black',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  buttonsContainer: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
};

const Administrador = () => {
  const { usuario } = useParams();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:3001/logout', { usuario });
      console.log('Respuesta del servidor:', response.data);

      if (response.data.success) {
        navigate('/login');// Esto te redirige a la página de login
      } else {
        console.error('Error al cerrar sesión:', response.data.message);
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
      localStorage.removeItem('usuario');
      localStorage.removeItem('tipo');
      navigate('/login');
    }
  }, []); // Asegúrate de que este efecto se ejecute solo una vez al montar el componente
  

    
  
  return (
    <div>
<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
    <div className="container">
        <Link to="" className="navbar-brand">LIZONE</Link>
        
        <div className="ml-auto">
        <Link to="" className="navbar-brand" onClick={handleLogout}>
              Cerrar Sesión
        </Link>
        </div>
    </div>
</nav>


      <div style={styles.container}>
        <h2 style={styles.title}>Bienvenido Administrador</h2>
        <h3 style={styles.subtitle}>Gestiones Disponibles</h3>
        <div style={styles.buttonsContainer}>
          <Link to="/GestionProductos"> 
            <button style={styles.button}>Productos</button>
          </Link>
          <Link to="/gestionClientes"> 
            <button style={styles.button}>Clientes</button>
          </Link>
          <Link to="/gestionSucursales">
            <button style={styles.button}>Sucursales</button>
          </Link>
          <Link to="/gestionProveedores">
            <button style={styles.button}>Proveedores</button>
          </Link>
          <Link to="/inventario">
            <button style={styles.button}>Inventario</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Administrador;