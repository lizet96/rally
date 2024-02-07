import React, { useState, useEffect } from "react";
import Axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';


function GestionSucusales() {
  const [id_sucursal, setId_Sucursal] = useState(1);
  const [suc_nombre, setNombre] = useState("");
  const [suc_direccion, setDireccion] = useState("");
  const [suc_telefono, setSuc_telefono] = useState("");
  const [suc_estatus, setSuc_estatus] = useState(1);

  const [filtro, setFiltro] = useState("id"); 
  const [busqueda, setBusqueda] = useState("");

  const [editar, setEditar] = useState(false);
  const [SucursalList, setSucursalesList] = useState([]);

  const add = () => {
    Axios.post("http://localhost:3001/createSucursal", {
      suc_nombre: suc_nombre,
      suc_direccion: suc_direccion,
      suc_telefono: suc_telefono,
      suc_estatus: suc_estatus,
    }).then(() => {
      Swal.fire("Sucursal creada con éxito!");
      getSucursal();
      limpiarSucursal();
    });
  };

  const update = () => {
    Axios.put(`http://localhost:3001/updateSucursal/${id_sucursal}`, {
      suc_nombre: suc_nombre,
      suc_direccion: suc_direccion,
      suc_telefono: suc_telefono,
      suc_estatus: suc_estatus,
    }).then(() => {
      Swal.fire("Sucursal actualizada con éxito!");
      setEditar(false);
      getSucursal();
      limpiarSucursal();
    });
  };

  const eliminarSucursal = (id_sucursal) => {
    Axios.put(`http://localhost:3001/deleteSucursal/${id_sucursal}`).then(() => {
      Swal.fire("Sucursal dada de baja con éxito!");
      getSucursal();
    });
  };

  const limpiarSucursal = () => {
    setNombre("");
    setDireccion("");
    setSuc_telefono("");
    setSuc_estatus(1);
  };

  const editarSucursal = (sucursal) => {
    setEditar(true);
    setId_Sucursal(sucursal.id_sucursal); // Asegúrate de que id_sucursal esté correctamente definido
    setNombre(sucursal.suc_nombre);
    setDireccion(sucursal.suc_direccion);
    setSuc_telefono(sucursal.suc_telefono);
    setSuc_estatus(sucursal.suc_estatus);
  };

  useEffect(() => {
    getSucursal();
  }, []);

  const getSucursal = () => {
    Axios.get("http://localhost:3001/sucursal").then((response) => {
      setSucursalesList(response.data);
    });
  };

  
const handleBusquedaChange = (event) => {
  const newValue = event.target.value;
  setBusqueda(newValue);

  // Realiza la búsqueda en tiempo real aquí
  buscar(newValue);
};

const buscar = (query) => {
  Axios.get(`http://localhost:3001/buscar_sucursal/${filtro}/${query}`)
    .then((response) => {
      setSucursalesList(response.data);
    })
    .catch((error) => {
      console.error('Error en la búsqueda de productos', error);
    });
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
          GESTIÓN SUCURSALES:
        </div>
        <div className="card-body">
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Nombre de la sucursal:</span>
            <input type="text" onChange={(event) => setNombre(event.target.value)} className="form-control" value={suc_nombre} placeholder="Ingrese el nombre de la sucursal" />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Dirección:</span>
            <input type text="text" onChange={(event) => setDireccion(event.target.value)} className="form-control" value={suc_direccion} placeholder="Ingrese la dirección" />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Teléfono:</span>
            <input type="text" onChange={(event) => setSuc_telefono(event.target.value)} className="form-control" value={suc_telefono} placeholder="Ingrese El telefono de la sucursal" />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Estatus:</span>
            <input type="text" onChange={(event) => setSuc_estatus(event.target.value)} className="form-control" value={suc_estatus} placeholder="Ingrese el estatus de la sucursal" />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Buscar:</span>
            <select
                className="form-select"
                onChange={(event) => { setFiltro(event.target.value); }}
                value={filtro}
              >

              <option value="id_sucursal">ID</option>
              <option value="suc_nombre">Nombre</option>
              <option value="suc_direccion">Dirección</option>
              <option value="suc_telefono">Telefono</option>
              <option value="suc_estatus">Estatus</option>

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
                <button className="btn btn-info" onClick={limpiarSucursal}>
                  Cancelar
                </button>
              </div>
            ) : (
              <div>
                <button className="btn btn-success m-2" onClick={add}>
                  Registrar
                </button>
                <button className="btn btn-primary" onClick={getSucursal}>
                  Mostrar todo
                </button>
              </div>
            )}
          </div>
        </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>  
              <th>Nombre de la sucursal </th>
              <th>Dirección</th>
              <th>telefono</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {SucursalList.map((sucursal) => (
              <tr key={sucursal.id_sucursal}>
                <td>{sucursal.id_sucursal}</td>
                <td>{sucursal.suc_nombre}</td>
                <td>{sucursal.suc_direccion}</td>
                <td>{sucursal.suc_telefono}</td>
                <td>{sucursal.suc_estatus}</td>
                <td>
                <div className="btn-group" role="group" aria-label="Basic example">
                    <button type="button" onClick={() => editarSucursal(sucursal)} className="btn btn-warning">Editar</button>
                    <button type="button" onClick={() => eliminarSucursal(sucursal.id_sucursal)} className="btn btn-danger">Baja</button>
                </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

export default GestionSucusales;
