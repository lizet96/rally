import React from 'react';
import './registro.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Registro() {
  const [state, setState] = React.useState({
    Int_1: '',
    Int_2: '',
    Int_3: '',
    cuatrimestre:'',
    grupo: '',
    nom_equipo: '',
    usuario: '',
    contrasena: ''
  });

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setState(prevState => ({ ...prevState, [name]: value }));
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const { Int_1,Int_2, Int_3,cuatrimestre, grupo, nom_equipo, usuario, contrasena } = state;

    const data = {
      Int_1,
      Int_2,
      Int_3,
      cuatrimestre,
      grupo,
      nom_equipo,
      usuario,
      contrasena,
      tipo: 5,  
    };

    axios.post('http://localhost:3001/create', data)
    .then(response => {
      console.log('Respuesta del servidor:', response.data);
      if (response.data.message) {
        alert(response.data.message);
        if (response.data.message === "Usuario registrado con éxito") {
          navigate("/login");  // Redirecciona al login después de un registro exitoso
        }
      }
    })
    .catch(error => {
      console.error('Error en el registro:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      }
    });
  }

  return (
    <div className="App">
      <h1>Registro de Equipos:</h1>
      <form onSubmit={handleSubmit}>
      <div className="form-group">
            <label>Integrante 1:</label>
            <input
              type="text"
              name="Int_1"
              value={state.Int_1}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Integrante 2:</label>
            <input
              type="text"
              name="Int_2"
              value={state.Int_2}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Integrante 3:</label>
            <input
              type="text"
              name="Int_3"
              value={state.Int_3}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Cuatrimestre:</label>
            <input
              type="text"
              name="cuatrimestre"
              value={state.cuatrimestre}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Grupo:</label>
            <input
              type="text"
              name="grupo"
              value={state.grupo}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Nombre del Equipo:</label>
            <input
              type="text"
              name="nom_equipo"
              value={state.nom_equipo}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Usuario:</label>
            <input
              type="text"
              name="usuario"
              value={state.usuario}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña:</label>
            <input
              type="password"
              name="contrasena"
              value={state.contrasena}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Registrarse</button>      
         </form>
      </div>
    );
  }


export default Registro;
