import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importación de Bootstrap
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

const InventoryForm = () => {
  const [id_inventario, setId_inventario] = useState(null);
  const [inv_cantidad, setCantidad] = useState('');
  const [inv_estatus, setEstatus] = useState('');
  const [id_sucursal, setSucursal] = useState('');
  const [id_producto, setProducto] = useState('');
  const [editar, setEditar] = useState(false);
  const [inventarioList, setInventarioList] = useState([]);
  const SUCURSALES_URI = 'http://localhost:3001/sucursal/';
  const PRODUCTOS_URI = 'http://localhost:3001/productos/';
  const [sucursales, setSucursales] = useState([]);
  const [productos, setproductos] = useState([]);



  const add = () => {
    Axios.post("http://localhost:3001/createInventario", {
      inv_cantidad: inv_cantidad,
      inv_estatus: inv_estatus,
      id_sucursal: id_sucursal,
      id_producto: id_producto,
    }).then((response) => {
      if (response.data.message === 'Inventario creado exitosamente') {
        Swal.fire("Inventario creado con éxito!");
        getInventario();
        limpiarInventario();
      } else {
        Swal.fire("Error al crear el inventario");
      }
    });
  };

  const update = () => {
    Axios.put(`http://localhost:3001/updateInventario/${id_inventario}`, {
      inv_cantidad: inv_cantidad,
      inv_estatus: inv_estatus,
      id_sucursal: id_sucursal,
      id_producto: id_producto,
    }).then((response) => {
      if (response.data.success) {
        Swal.fire("Inventario actualizado con éxito!");
        setEditar(false);
        getInventario();
        limpiarInventario();
      } else {
        Swal.fire("Error al actualizar el inventario");
      }
    });
  };

  const eliminarInventario = (id_inventario) => {
    Axios.put(`http://localhost:3001/deleteInventario/${id_inventario}`).then((response) => {
      if (response.data.success) {
        Swal.fire("Inventario dado de baja con éxito!");
        getInventario();
      } else {
        Swal.fire("Error al dar de baja el inventario");
        getInventario();
      }


    });
  };

  const limpiarInventario = () => {
    setId_inventario("");
    setCantidad("");
    setEstatus("");
    setSucursal("");
    setProducto("");
  };

  const editarInventario = (inventario) => {
    setEditar(true);
    setId_inventario(inventario.id_inventario);
    setCantidad(inventario.inv_cantidad);
    setEstatus(inventario.inv_estatus);
    setSucursal(inventario.id_sucursal);
    setProducto(inventario.id_producto);
  };

  useEffect(() => {
    getInventario();
    async function fetchSucursales() {
      try {
        const response = await Axios.get(SUCURSALES_URI);
        setSucursales(response.data);
      } catch (error) {
        console.error("Error al obtener las sucursales:", error);
      }
    }
    fetchSucursales();

    async function fetchProductos() {
      try {
        const response = await Axios.get(PRODUCTOS_URI);
        setproductos(response.data);
      } catch (error) {
        console.error("Error al obtener los Productos:", error);
      }
    }
    fetchProductos();


  }, []);


  const getInventario = () => {
    Axios.get("http://localhost:3001/inventario").then((response) => {
      setInventarioList(response.data);
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
                    GESTIÓN INVENTARIO:
                </div>
                <div className="card-body">
                    <div className="input-group mb-3">
                        <span className="input-group-text">Producto:</span>
                        <select
                            className="form-control"
                            value={id_producto}
                            onChange={(e) => setProducto(e.target.value)}
                        >
                            {productos &&
                                Array.isArray(productos) &&
                                productos.map((s) => (
                                    <option key={s.id_producto} value={s.id_producto}>
                                        {s.nombre}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="input-group mb-3">
                        <span className="input-group-text">Cantidad:</span>
                        <input
                            type="number"
                            className="form-control"
                            value={inv_cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group mb-3">
                        <span className="input-group-text">Sucursal:</span>
                        <select
                            className="form-control"
                            value={id_sucursal}
                            onChange={(e) => setSucursal(e.target.value)}
                        >
                            {sucursales &&
                                Array.isArray(sucursales) &&
                                sucursales.map((s) => (
                                    <option key={s.id_sucursal} value={s.id_sucursal}>
                                        {s.suc_nombre}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="input-group mb-3">
                        <span className="input-group-text">Estatus:</span>
                        <input
                            type="text"
                            className="form-control"
                            value={inv_estatus}
                            onChange={(e) => setEstatus(e.target.value)}
                            required
                        />
                    </div>
                    <button onClick={editar ? update : add} className="btn btn-primary">
                        {editar ? "Actualizar" : "Agregar al Inventario"}
                    </button>
                </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Sucursal</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inventarioList.map((inventario) => (
              <tr key={inventario.id_inventario}>
                <th>{inventario.id_inventario}</th>
                <th>{inventario.id_producto}</th>
                <th>{inventario.inv_cantidad}</th>
                <th>{inventario.id_sucursal}</th>
                <th>{inventario.inv_estatus}</th>
                <th>
                <div className="btn-group" role="group" aria-label="Basic example">
                    <button type="button" onClick={() => editarInventario(inventario)} className="btn btn-warning">Editar</button>
                    <button type="button" onClick={() => eliminarInventario(inventario.id_inventario)} className="btn btn-danger">Baja</button>
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
};

export default InventoryForm;

