import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';


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
    backgroundColor: '#152C58',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  buttonsContainer: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#2E6199',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  returnButton: {
    padding: '10px 20px',
    backgroundColor: 'b#2E6199',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },

  imageStyle: {
    width: '150px',
    margin: '0 auto', // Centra la imagen horizontalmente
},
  
};

const Login = () => {
  const [usuario, setusuario] = useState('');
  const [contrasena, setcontrasena] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  const handleusuarioChange = (e) => {
    setusuario(e.target.value);
  };

  const handlecontrasenaChange = (e) => {
    setcontrasena(e.target.value);
  };
  const handleLogin = async () => {
    // Verificar campos vacíos
    if (!usuario || !contrasena) {
      setError('Por favor complete todos los campos.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/login', {
        usuario,
        contrasena,
      });

      const { success, tipo, redirectTo, message } = response.data;

      if (success) {
        setLoggedIn(true);

        // Redirigir según el tipo de usuario
        switch (tipo) {
          case 1:
            navigate('/acerca-de');
            break;
          case 2:
            navigate('/pantalla_tipo_2');
            break;
          case 3:
            navigate('/pantalla_tipo_3');
            break;
          case 4:
            navigate('/pantalla_tipo_4');
            break;
          case 5:
            navigate('');
            break;
          default:
            setError('Tipo de usuario no válido');
        }
      } else {
        setError(message || 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
      setError('Error al intentar iniciar sesión');
    }
  };


  return (
    <div style={styles.container}>
      {loggedIn ? (
        <p>Bienvenido, {usuario}.</p>
      ) : (
        <div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
         <img src="logo.jpeg" alt="Imagen" style={styles.imageStyle} />
         </div>
          <h2 style={styles.title}>Iniciar Sesión</h2>
          <label style={styles.label} htmlFor="usuario">
            Usuario:
          </label>
          <input
            style={styles.input}
            type="text"
            id="usuario"
            value={usuario}
            onChange={handleusuarioChange}
          />
          <label style={styles.label} htmlFor="contrasena">
            Contraseña:
          </label>
          <input
            style={styles.input}
            type="password"
            id="contrasena"
            value={contrasena}
            onChange={handlecontrasenaChange}
          />
          <button style={styles.button} onClick={handleLogin}>Iniciar Sesión</button>
          {error && <p style={{color: 'red'}}>{error}</p>}
          <div style={styles.buttonsContainer}>
            <Link to="/"> {/* Redirección al catálogo */}
              <button style={styles.cancelButton}>Regresar</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;