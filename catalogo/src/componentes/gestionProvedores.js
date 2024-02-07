import React, { useState, useEffect } from "react";
import Axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';


function GestionProveedores() {
  const [id_provedor, setIdProveedor] = useState(null);
  const [prov_nombre, setNombre] = useState("");
  const [prov_direccion, setDireccion] = useState("");
  const [prov_telefono, setTelefono] = useState("");
  const [prov_estatus, setEstatus] = useState(1);

  const [editar, setEditar] = useState(false);
  const [proveedoresList, setProveedoresList] = useState([]);

  const [filtro, setFiltro] = useState("id");
  const [busqueda, setBusqueda] = useState("");

  const add = (event) => {
    event.preventDefault();
    Axios.post("http://localhost:3001/create_proveedor", {
      prov_nombre: prov_nombre,
      prov_direccion: prov_direccion,
      prov_telefono: prov_telefono,
      prov_estatus: prov_estatus,
    })
      .then(() => {
        getProveedores();
        limpiar();
        Swal.fire({
          title: "<strong>Registro exitoso!</strong>",
          html: `<i>El proveedor <strong>${prov_nombre}</strong> fue registrado con éxito</i>`,
          icon: 'success',
          timer: 3000
        });
      })
      .catch((error) => {
        console.error('Error al registrar:', error);
        Swal.fire(
          'Error',
          'Hubo un problema al registrar al proveedor',
          'error'
        );
      });
  };

  const update = () => {
    if (id_provedor !== null) {
      Axios.put("http://localhost:3001/update_proveedor", {
      id_provedor: id_provedor,
      prov_nombre: prov_nombre,
      prov_direccion: prov_direccion,
      prov_telefono: prov_telefono,
      prov_estatus: parseInt(prov_estatus), 
      
      })
      .then(() => {
        console.log('Proveedor actualizado:', prov_nombre);
        getProveedores();
        limpiar();
        setIdProveedor(null);
        setEditar(false);
        Swal.fire({
          title: "<strong>Actualización exitosa</strong>",
          html: `<i>El proveedor <strong>${prov_nombre}</strong> fue actualizado con éxito</i>`,
          icon: 'success',
          timer: 3000
        });
      })
      .catch((error) => {
        console.error('Error al actualizar:', error);
        Swal.fire(
          'Error',
          'Hubo un problema al actualizar al proveedor',
          'error'
        );
      });
  } else {
    console.error('ID de proveedor no válido.');
  }
};

const eliminar = (id_provedor) => {
  Axios.put(`http://localhost:3001/delete_proveedor/${id_provedor}`).then(() => {
      Swal.fire("Provedor eliminado con éxito!");
      getProveedores();
  });
};

  const limpiar = () => {
    setNombre("");
    setDireccion("");
    setTelefono("");
  };

  const editarProveedor = (val) => {
    setEditar(true);
    setNombre(val.prov_nombre);
    setDireccion(val.prov_direccion);
    setTelefono(val.prov_telefono);
    setIdProveedor(val.id_provedor);
    setEstatus(val.prov_estatus);
  };

  const handleBusquedaChange = (event) => {
    const newValue = event.target.value;
    setBusqueda(newValue);
  
    // Realiza la búsqueda en tiempo real aquí
    buscar(newValue);
  };

  const buscar = (query) => {
    Axios.get(`http://localhost:3001/buscar_proveedor/${filtro}/${query}`)
      .then((response) => {
        setProveedoresList(response.data);
      })
      .catch((error) => {
        console.error('Error en la búsqueda de provedor', error);
      });
  };

  const getProveedores = () => {
    Axios.get("http://localhost:3001/proveedores").then((response) => {
      setProveedoresList(response.data);
    });
  };

  useEffect(() => {
    getProveedores();
  }, []);


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
          GESTIÓN DE PROVEEDORES:
        </div>
        <div className="card-body">
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Nombre:</span>
            <input
              type="text"
              onChange={(event) => { setNombre(event.target.value); }}
              className="form-control"
              value={prov_nombre}
              placeholder="Ingrese el nombre"
              aria-label="Nombre"
              aria-describedby="basic-addon1"
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Dirección:</span>
            <input
              type="text"
              onChange={(event) => { setDireccion(event.target.value); }}
              className="form-control"
              value={prov_direccion}
              placeholder="Ingrese la dirección"
              aria-label="Dirección"
              aria-describedby="basic-addon1"
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Teléfono:</span>
            <input
              type="text"
              onChange={(event) => { setTelefono(event.target.value); }}
              className="form-control"
              value={prov_telefono}
              placeholder="Ingrese el teléfono"
              aria-label="Teléfono"
              aria-describedby="basic-addon1"
            />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Estatus:</span>
            <select
              className="form-select"
              onChange={(event) => setEstatus(parseInt(event.target.value))}
              value={prov_estatus}
              aria-label="Estatus"
              aria-describedby="basic-addon1"
            >
              <option value="1">1</option>
              <option value="0">0</option>
            </select>
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Buscar:</span>
            <select
                className="form-select"
                onChange={(event) => { setFiltro(event.target.value); }}
                value={filtro}
              >

              <option value="id_provedor">ID</option>
              <option value="prov_nombre">Nombre</option>
              <option value="prov_direccion">Dirección</option>
              <option value="prov_telefono">Telefono</option>
              <option value="prov_estatus">Estatus</option>

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
                <button className="btn btn-primary" onClick={getProveedores}>
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
              <th scope="col">Dirección</th>
              <th scope="col">Teléfono</th>
              <th scope="col">Estatus</th>

              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>

          {proveedoresList.map((val) => (            
            <tr key={val.id_provedor}>
              <th>{val.id_provedor}</th>
              <th>{val.prov_nombre}</th>
              <th>{val.prov_direccion}</th>
              <th>{val.prov_telefono}</th>
              <th>{val.prov_estatus}</th> 
              <th>

      <div className="btn-group" role="group" aria-label="Basic example">
        <button
          type="button"
          onClick={() => {
            editarProveedor(val);
          }}
          className="btn btn-warning"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => {
            eliminar(val.id_provedor);
          }}
          className="btn btn-primary"
        >
          Eliminar
        </button>
      </div>
    </th>
  </tr>
))}


          </tbody>
        </table>
      </div>
    </div>
   </div> 
  );
}

export default GestionProveedores;
