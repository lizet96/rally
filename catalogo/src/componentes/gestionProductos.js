import React, { useState, useEffect } from "react";
import Axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';


function GestionProductos() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [color, setColor] = useState("");
  const [pr_compra, setPr_compra] = useState(0);
  const [pr_venta, setPr_venta] = useState(0);
  const [imagen, setImagen] = useState("");
  const [id_provedor, setId_provedor] = useState("");
  const [id_producto, setId_producto] = useState(1);
  const [pr_estatus, setPr_estatus] = useState(1);
  const PROVEDORES_URI = 'http://localhost:3001/proveedores/';
  const [provedores, setprovedores] = useState([]);

  const [filtro, setFiltro] = useState("id"); 
  const [busqueda, setBusqueda] = useState("");

  const [editar, setEditar] = useState(false);
  const [productosList, setProductosList] = useState([]);

 // const [filtro, setFiltro] = useState("id_producto"); // Inicializa con "id" como valor predeterminado
 // const [busqueda, setBusqueda] = useState("");

  const add = () => {
    Axios.post("http://localhost:3001/createProducto", {
      nombre: nombre,
      descripcion: descripcion,
      color: color,
      pr_compra: pr_compra,
      pr_venta: pr_venta,
      imagen: imagen,
      id_provedor: id_provedor,
      pr_estatus: pr_estatus,
    }).then(() => {
        Swal.fire("Producto añadido con éxito!");
        getProductos();
        limpiarProducto();
    });
};

const update = () => {
  Axios.put(`http://localhost:3001/updateProducto/${id_producto}`, {
    nombre: nombre,
    descripcion: descripcion,
    color: color,
    pr_compra: pr_compra,
    pr_venta: pr_venta,
    imagen: imagen,
    id_provedor: id_provedor,
    pr_estatus: pr_estatus,
  }).then(() => {
      Swal.fire("Producto actualizado con éxito!");
      setEditar(false);
      getProductos();
      limpiarProducto();

  });
};

const eliminar = (id_producto) => {
  Axios.put(`http://localhost:3001/deleteProducto/${id_producto}`).then(() => {
      Swal.fire("Producto eliminado con éxito!");
      getProductos();
  });
};

//const alta = (id_producto) => {
//  Axios.put("/altaProducto/:id_producto", (req, res) => {      Swal.fire("Producto dado de alta con éxito!");
//      getProductos();
//  });
//};

const limpiarProducto = () => {
  setNombre("");
  setDescripcion("");
  setColor("");
  setPr_compra("");
  setPr_venta("");
  setImagen("");
  setId_provedor("");
  setId_producto("");
  setPr_estatus(1);
  setEditar(false);
};

const editarProducto = (producto) => {
  setEditar(true);
  setId_producto(producto.id_producto);
  setNombre(producto.nombre);
  setDescripcion(producto.descripcion);
  setColor(producto.color);
  setPr_compra(producto.pr_compra);
  setPr_venta(producto.pr_venta);
  setImagen(producto.imagen);
  setId_provedor(producto.id_provedor);
  setPr_estatus(producto.pr_estatus);
};

useEffect(() => {
  getProductos();
  async function fetchProvedores() {
    try {
      const response = await Axios.get(PROVEDORES_URI);
      setprovedores(response.data);
    } catch (error) {
      console.error("Error al obtener las Provedores:", error);
    }
  }
  fetchProvedores();
}, []);

  const getProductos = () => {
    Axios.get("http://localhost:3001/productos").then((response) => {
        setProductosList(response.data);
    });
};

const handleBusquedaChange = (event) => {
  const newValue = event.target.value;
  setBusqueda(newValue);

  // Realiza la búsqueda en tiempo real aquí
  buscar(newValue);
};

const buscar = (query) => {
  Axios.get(`http://localhost:3001/buscar_producto/${filtro}/${query}`)
    .then((response) => {
      setProductosList(response.data);
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
          GESTIÓN PRODUCTOS:
        </div>
        <div className="card-body">
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Nombre del producto:</span>
            <input type="text" onChange={(event) => setNombre(event.target.value)} className="form-control" value={nombre} placeholder="Ingrese el nombre" />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Descripción:</span>
            <input type="text" onChange={(event) => setDescripcion(event.target.value)} className="form-control" value={descripcion} placeholder="Ingrese la descripción" />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Color:</span>
            <input type="text" onChange={(event) => setColor(event.target.value)} className="form-control" value={color} placeholder="Ingrese El color" />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Precio de Compra:</span>
            <input type="text" onChange={(event) => setPr_compra(event.target.value)} className="form-control" value={pr_compra} placeholder="Ingrese el precio de compra" />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Precio de Venta:</span>
            <input type="text" onChange={(event) => setPr_venta(event.target.value)} className="form-control" value={pr_venta} placeholder="Ingrese el precio de venta" />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Imagen:</span>
            <input type="text" onChange={(event) => setImagen(event.target.value)} className="form-control" value={imagen} placeholder="Ingrese la imagen del producto" />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Provedor:</span>
            <select id="id_producto" value={id_provedor} onChange={(e) => setId_provedor(e.target.value)}>
              {provedores && Array.isArray(provedores) && provedores.map(s => (
                <option key={s.id_provedor} value={s.id_provedor}>
                  {s.prov_nombre}
                </option>
              ))}
              </select>
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Buscar:</span>
            <select
                className="form-select"
                onChange={(event) => { setFiltro(event.target.value); }}
                value={filtro}
              >

              <option value="id_producto">ID</option>
              <option value="nombre">Nombre</option>
              <option value="descripcion">Descripción</option>
              <option value="color">Color</option>
              <option value="pr_compra">Precio de compra</option>
              <option value="pr_venta">Precio de venta</option>
              <option value="pr_estatus">Estatus</option>

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
                <button className="btn btn-info" onClick={limpiarProducto}>
                  Cancelar
                </button>
              </div>
            ) : (
              <div>
                <button className="btn btn-success m-2" onClick={add}>
                  Registrar
                </button>
                <button className="btn btn-primary" onClick={ getProductos}>
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
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Color</th>
              <th>Precio compra</th>
              <th>Precio venta</th>
              <th>Imagen</th>
              <th>provedor</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosList.map((producto) => (
              <tr key={producto.id_producto}>
              <td>{producto.id_producto}</td>
                <td>{producto.nombre}</td>
                <td>{producto.descripcion}</td>
                <td>{producto.color}</td>
                <td>{producto.pr_compra}</td>
                <td>{producto.pr_venta}</td>
                <td>{producto.imagen}</td>
                <td>{producto.id_provedor}</td>
                <td>{producto.pr_estatus}</td>

                <td>
                <div className="btn-group" role="group" aria-label="Basic example">
                    <button type="button" onClick={() => editarProducto(producto)} className="btn btn-warning">Editar</button>
                    <button type="button" onClick={() => eliminar(producto.id_producto)} className="btn btn-danger">Baja</button>
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

export default GestionProductos;


