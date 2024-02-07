import React, { useState, useEffect } from "react";
import Axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';


function GestionClientes() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [domicilio, setDomicilio] = useState("");
  const [telefono, setTelefono] = useState("");
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [tipo, setTipo] = useState(1);
  const [estatus, setEstatus] = useState(1);
  const [id, setId] = useState(1);

  const [editar, setEditar] = useState(false);
  const [empleadosList, setEmpleadosList] = useState([]);

  const [filtro, setFiltro] = useState("id"); 
  const [busqueda, setBusqueda] = useState("");


  const add = () => {
    Axios.post("http://localhost:3001/create", {
      nombre: nombre,
      apellido: apellido,
      domicilio: domicilio,
      telefono: telefono,
      usuario: usuario,
      contrasena: contrasena,
      tipo: tipo,
      estatus: estatus
    })
      .then(() => {
        getEmpleados();
        limpiar();
        Swal.fire({
          title: "<strong>Registro exitoso!</strong>",
          html: `<i>El empleado <strong>${usuario}</strong> fue registrado con éxito</i>`,
          icon: 'success',
          timer: 3000
        });
      })
      .catch((error) => {
        console.error('Error al registrar:', error);
        Swal.fire(
          'Error',
          'Hubo un problema al registrar al cliente',
          'error'
        );
      });
  };

  const update = () => {
    Axios.put(`http://localhost:3001/update/${id}`, {
        id: id, // Asegúrate de enviar el ID
        contrasena: contrasena,
        usuario: usuario,
        apellido: apellido,
        telefono: telefono,
        nombre: nombre,
        domicilio: domicilio,
        tipo: tipo,
        estatus: estatus
    })
      .then(() => {
        console.log('Empleado actualizado:', usuario);
        getEmpleados();
        limpiar();
        Swal.fire({
          title: "<strong>Actualización exitosa</strong>",
          html: `<i>El empleado <strong>${usuario}</strong> fue actualizado con éxito</i>`,
          icon: 'success',
          timer: 3000
        });
      })
      .catch((error) => {
        console.error('Error al actualizar:', error);
        Swal.fire(
          'Error',
          'Hubo un problema al actualizar al cliente',
          'error'
        );
      });
  };

  const eliminar = (id) => {
    Axios.put(`http://localhost:3001/deleteCliente/${id}`).then(() => {
        Swal.fire("Cliente eliminado con éxito!");
        getEmpleados();
    });
  };
  
  

  const limpiar = () => {
    setNombre("");
    setApellido("");
    setDomicilio("");
    setTelefono("");
    setUsuario("");
    setContrasena("");
    setTipo(1);
    setEstatus(1);
    setEditar(false);
  };

  const editarEmpleado = (val) => {
    setEditar(true);
    setNombre(val.nombre);
    setApellido(val.apellido);
    setDomicilio(val.domicilio);
    setTelefono(val.telefono);
    setUsuario(val.usuario);
    setContrasena(val.contrasena);
    setId(val.id);
  };


  const handleBusquedaChange = (event) => {
    const newValue = event.target.value;
    setBusqueda(newValue);

    // Realiza la búsqueda en tiempo real aquí
    buscar(newValue);
  };

  const buscar = (query) => {
    Axios.get(`http://localhost:3001/buscar_cliente/${filtro}/${query}`)
      .then((response) => {
        setEmpleadosList(response.data);
      })
      .catch((error) => {
        console.error('Error en la búsqueda:', error);
      });
  };

  const getEmpleados = () => {
    Axios.get("http://localhost:3001/empleados").then((response) => {
      setEmpleadosList(response.data);
    });
  };

  useEffect(() => {
    getEmpleados();
  }, []);

  const mostrarEmpleados = () => {
    getEmpleados();
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
              <Link to="" className="navbar-brand">LIZONE</Link>
              
              <div className="ml-auto">
                  <Link to="/Administrador" className="navbar-brand">Regresar</Link>
              </div>
          </div>
      </nav>
          
    <div className="container">
      <div className="card text-center">
        <div className="card-header">
          GESTIÓN CLIENTES:
        </div>
        <div className="card-body">
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Nombre:</span>
            <input
              type="text"
              onChange={(event) => { setNombre(event.target.value); }}
              className="form-control"
              value={nombre}
              placeholder="Ingrese el nombre"
              aria-label="Nombre"
              aria-describedby="basic-addon1"
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Apellido:</span>
            <input
              type="text"
              onChange={(event) => { setApellido(event.target.value); }}
              className="form-control"
              value={apellido}
              placeholder="Ingrese el apellido"
              aria-label="Apellido"
              aria-describedby="basic-addon1"
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Domicilio:</span>
            <input
              type="text"
              onChange={(event) => { setDomicilio(event.target.value); }}
              className="form-control"
              value={domicilio}
              placeholder="Ingrese el domicilio"
              aria-label="Domicilio"
              aria-describedby="basic-addon1"
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Teléfono:</span>
            <input
              type="text"
              onChange={(event) => { setTelefono(event.target.value); }}
              className="form-control"
              value={telefono}
              placeholder="Ingrese el teléfono"
              aria-label="Teléfono"
              aria-describedby="basic-addon1"
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Usuario:</span>
            <input
              type="text"
              onChange={(event) => { setUsuario(event.target.value); }}
              className="form-control"
              value={usuario}
              placeholder="Ingrese el usuario"
              aria-label="Usuario"
              aria-describedby="basic-addon1"
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Contraseña:</span>
            <input
              type="password"
              onChange={(event) => { setContrasena(event.target.value); }}
              className="form-control"
              value={contrasena}
              placeholder="Ingrese la contraseña"
              aria-label="Contraseña"
              aria-describedby="basic-addon1"
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Tipo:</span>
            <select
              className="form-select"
              onChange={(event) => { setTipo(event.target.value); }}
              value={tipo}
              aria-label="Tipo"
              aria-describedby="basic-addon1"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Estatus:</span>
            <select
              className="form-select"
              onChange={(event) => { setEstatus(event.target.value); }}
              value={estatus}
              aria-label="Estatus"
              aria-describedby="basic-addon1"
            >
              <option value="0">0</option>
              <option value="1">1</option>
            </select>
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Buscar:</span>
            <select
                className="form-select"
                onChange={(event) => { setFiltro(event.target.value); }}
                value={filtro}
              >

              <option value="id">ID</option>
              <option value="nombre">Nombre</option>
              <option value="apellido">Apellido</option>
              <option value="usuario">Usuario</option>
              <option value="tipo">Tipo</option>
              <option value="estatus">Estatus</option>
            </select>
          </div>

          <div className="input-group mb-3">
          <input
            type="text"
            onChange={handleBusquedaChange}
            value={busqueda}
            className="form-control"
            placeholder={`Buscar por ${filtro}`}
            aria-label="Búsqueda"
            aria-describedby="basic-addon1"
          />
          </div>

          <div className="card-footer text-muted">
            {editar ? (
              <div>
                <button className="btn btn-warning m-2" onClick={update}>
                  Actualizar
                </button>
                <button className="btn btn-info" onClick={limpiar}>
                  Cancelar
                </button>
              </div>
            ) : (
              <div>
                <button className="btn btn-success m-2" onClick={add}>
                  Registrar
                </button>
                <button className="btn btn-primary" onClick={mostrarEmpleados}>
                  Mostrar todo
                </button>
              </div>
            )}
          </div>
        </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nombre</th>
              <th scope="col">Apellido</th>
              <th scope="col">Domicilio</th>
              <th scope="col">Teléfono</th>
              <th scope="col">Usuario</th>
              <th scope="col">Tipo</th>
              <th scope="col">Estatus</th>

              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleadosList.map((val, key) => {
              return (
                <tr key={val.id}>
                  <th>{val.id}</th>
                  <th>{val.nombre}</th>
                  <th>{val.apellido}</th>
                  <th>{val.domicilio}</th>
                  <th>{val.telefono}</th>
                  <th>{val.usuario}</th>
                  <th>{val.tipo}</th>
                  <th>{val.estatus}</th>

                  <th>
                    <div className="btn-group" role="group" aria-label="Basic example">
                      <button type="button" onClick={() => { editarEmpleado(val);}}className="btn btn-warning">Editar</button>
                      <button onClick={() => eliminar(val.id)} className="btn btn-danger">Baja</button>
                    </div>  
                  </th>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

export default GestionClientes;
