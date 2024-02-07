const express = require("express");
const mysql2 = require("mysql2");
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');
const router = express.Router();
const PDFDocument = require('pdfkit');
const pdfkit = require('pdfkit');
const fs = require('fs');
const path = require('path');
const autoTable = require('jspdf-autotable');
const bcrypt = require('bcrypt');





app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const db = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "12345",
    database: "rally_2024"
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conexión a la base de datos exitosa');
});
//CREAR CLIENTE, VERIFICA SI YA EXISTE UN USUARIO CON ESE NOMBRE   
app.post("/create", (req, res) => {
    const Int_1 = req.body.Int_1;
    const Int_2 = req.body.Int_2;
    const Int_3 = req.body.Int_3;
    const cuatrimestre = req.body.cuatrimestre;
    const grupo = req.body.grupo;
    const nom_equipo = req.body.nom_equipo;
    const usuario = req.body.usuario;
    const contrasena = req.body.contrasena;
    const tipo = req.body.tipo || 5;
    const saltRounds = 10;

    bcrypt.hash(contrasena, saltRounds, (err, hashedPassword) => {
      if (err) {
          console.log(err);
          res.status(500).json({ error: "Error al hashear la contraseña" });
          return;
      }

    db.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: "Error al verificar el usuario" });
            return;
        }

        if (result.length > 0) {
            res.status(400).json({ message: "Nombre de usuario ya registrado, intente con otro" });
            return;
        }

        db.query('INSERT INTO usuarios(contrasena, usuario, tipo) VALUES(?,?,?)',
        [hashedPassword, usuario, tipo], 
        (err, insertResult) => {
            if (err) {
                console.log(err);
                res.status(500).json({ error: "Error al registrar el usuario" });
                return;
            } else {
                const id = insertResult.insertId; //obtiene el id del usuario
                 // Crea el carrito del usuario por default
                db.query('INSERT INTO Equipos(id_usuario, Int_1,Int_2, Int_3, cuatrimestre, grupo,nom_equipo) VALUES(?,?,?,?,?,?,?)', [id, Int_1,Int_2, Int_3, cuatrimestre, grupo,nom_equipo], (err, carritoResult) => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({ error: "Error al registrar en la tabla equipo" });
                        return;
                    }

                    res.send({ message: "Usuario registrado con éxito", data: insertResult });
                });
            }
        }
    );
  });
});
});
//INICIO DE SESION, VALIDA EL USUARIO, CONTRASEÑA Y LA SESION
app.post("/login", (req, res) => {
  const { usuario, contrasena } = req.body;

  db.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario], (err, result) => {
      if (err) {
          console.log(err);
          res.status(500).json({ success: false, error: "Error al verificar las credenciales" });
          return;
      }

      if (result.length > 0) {
          const tipoUsuario = result[0].tipo; // Obtener el tipo de usuario desde la base de datos

          bcrypt.compare(contrasena, result[0].contrasena, (bcryptErr, passwordMatch) => {
              if (bcryptErr) {
                  console.log(bcryptErr);
                  res.status(500).json({ success: false, error: "Error al comparar las contraseñas" });
                  return;
              }

              if (passwordMatch) {
                  // Si las contraseñas coinciden, enviar éxito y tipo de usuario
                  res.json({ success: true, message: "Inicio de sesión exitoso", tipo: tipoUsuario });
              } else {
                  // Contraseña incorrecta
                  res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
              }
          });
      } else {
          // Usuario no encontrado
          res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
      }
  });
});


// Ruta para cerrar la sesión del usuario
app.post('/logout', (req, res) => {
    const { usuario } = req.body;
  
    // Realiza una consulta de depuración para verificar que el nombre de usuario se está pasando correctamente
    console.log('Nombre de usuario recibido:', usuario);
  
    db.query('SELECT id, sesion FROM acceso_de_campos WHERE usuario = ?', [usuario], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error al obtener la sesión del usuario' });
      }
  
      if (result.length === 0) {
        // No se encontró ningún usuario con el nombre de usuario proporcionado
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      const userId = result[0].id;
      const userSession = result[0].sesion;
  
      // Si la sesión del usuario es 0, significa que ya está cerrada
      if (userSession === 0) {
        return res.status(403).json({ error: 'La sesión ya está cerrada' });
      }

      // Continúa con la actualización de la sesión a 0 (cerrar sesión)
      db.query('UPDATE acceso_de_campos SET sesion = 0 WHERE usuario = ?', [usuario], (errUpdate, resultUpdate) => {
        if (errUpdate) {
            console.log(errUpdate);
            res.status(500).json({ success: false, error: "Error al actualizar la sesion" });
            return;
        }
        res.json({ success: true, message: "Inicio de sesión exitoso", tipo: result[0].tipo, redirectTo: "/login" });
      });
    });
  });

//MUESTRA LOS CLIENTES EN LA TABLA
app.get("/empleados", (req, res) => {
    db.query('SELECT * FROM acceso_de_campos', (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});
//PERMITE MODIFICAR INFORMACION DEL CLIENTE
app.put("/update/:id", (req, res) => {
    const id = req.params.id;

    const { contrasena, usuario, apellido, telefono, nombre, domicilio, tipo, estatus } = req.body;
    const telefonoValue = telefono ? parseInt(telefono) : null;
    db.query(
        'UPDATE acceso_de_campos SET contrasena=?, usuario=?, apellido=?, telefono=?, nombre=?, domicilio=?, tipo=?, estatus=? WHERE id=?',
        [contrasena, usuario, apellido, telefonoValue, nombre, domicilio, tipo, estatus, id],
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Error al actualizar el registro" });
            } else {
                res.send(result);
            }
        }
    );
});
//NO SE SI ESTE ES EL QUE SIRVE O EL DE ARRIBA XD PERO COMO YA JALA NO LE MUEVAS
app.get("/mostrarEmpleados", (req, res) => {
    db.query('SELECT * FROM acceso_de_campos', (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: "Error al obtener los empleados" });
        } else {
            res.json(result);
        }
    });
});

//CAMBIO DE ESTATUS DEL CLIENTE A 0 LO QUE INDICA BAJA LOGICA:
app.put("/deleteCliente/:id", (req, res) => {
    const id = req.params.id;

    // Actualiza el campo "estatus" a 0 si el registro existe
    db.query('UPDATE acceso_de_campos SET estatus=0 WHERE id=?', [id], (updateErr, updateResult) => {
        if (updateErr) {
            console.error(updateErr);
            res.status(500).json({ error: "Error al Eliminar al cliente" });
        } else {
            res.json({ message: "cliente Eliminado con éxito" });
        }
    });
    
});
//BUSCAR CLIENTE:
app.get('/buscar_cliente/:filtro/:busqueda', (req, res) => {
    const { filtro, busqueda } = req.params;
    const selectQuery = `SELECT * FROM acceso_de_campos WHERE ${filtro} LIKE ?`;
    db.query(selectQuery, ['%' + busqueda + '%'], (err, result) => {
        if (err) {
            console.error('Error en la búsqueda de clientes', err);
            res.status(500).send('Error en la búsqueda');
        } else {
            res.status(200).json(result);
        }
    });
});


app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  });
  
  // CREAR AL PROVEDOR
  app.post("/create_proveedor", (req, res) => {
    const { prov_nombre, prov_direccion, prov_telefono, prov_estatus } = req.body;
    const insertQuery = 'INSERT INTO provedores (prov_nombre, prov_direccion, prov_telefono, prov_estatus) VALUES (?, ?, ?,?)';
    
    db.query(insertQuery, [prov_nombre, prov_direccion, prov_telefono,prov_estatus], (err, result) => {
      if (err) {
        console.error('Error al insertar proveedor:', err);
        res.status(500).json({ error: 'Error al insertar el proveedor', details: err.message });
      } else {
        console.log('Proveedor insertado con éxito');
        res.status(200).json({ message: 'Proveedor insertado con éxito' });
      }
    });
  });
//MODIFIRCAR AL PROVEDOR 
  app.put('/update_proveedor', (req, res) => {
    const { id_provedor, prov_nombre, prov_direccion, prov_telefono, prov_estatus } = req.body;
    const updateQuery = 'UPDATE provedores SET prov_nombre = ?, prov_direccion = ?, prov_telefono = ?,prov_estatus = ? WHERE id_provedor = ?';
    db.query(updateQuery, [prov_nombre, prov_direccion, prov_telefono, prov_estatus, id_provedor], (err, result) => {
        if (err) {
            console.error('Error al actualizar proveedor:', err);
            res.status(500).send('Error al actualizar el proveedor');
        } else {
            console.log('Proveedor actualizado con éxito');
            res.status(200).send('Proveedor actualizado con éxito');
        }
    });
});
//BAJA LOGICA DEL PROVEDOR
app.put("/delete_proveedor/:id_provedor", (req, res) => {
    const id_provedor = req.params.id_provedor;

    // Actualiza el campo "estatus" a 0 si el registro existe
    db.query('UPDATE provedores SET prov_estatus=0 WHERE id_provedor=?', [id_provedor], (updateErr, updateResult) => {
        if (updateErr) {
            console.error(updateErr);
            res.status(500).json({ error: "Error al dar de baja al provedor" });
        } else {
            res.json({ message: "provedor dado de baja con exito" });
        }
    });
    
});
//MUESTRA EN LA TABLA LA LISTA DE PROVEDORES
app.get('/proveedores', (req, res) => {
    const selectQuery = 'SELECT id_provedor, prov_nombre, prov_direccion, prov_telefono, prov_estatus FROM provedores';
    db.query(selectQuery, (err, result) => {
        if (err) {
            console.error('Error al obtener proveedores:', err);
            res.status(500).send('Error al obtener proveedores');
        } else {
            res.status(200).json(result);
        }
    });
});

//BUSCAR PROVEDOR
app.get('/buscar_proveedor/:filtro/:busqueda', (req, res) => {
    const { filtro, busqueda } = req.params;
    const selectQuery = `SELECT * FROM provedores WHERE ${filtro} LIKE ?`;
    db.query(selectQuery, ['%' + busqueda + '%'], (err, result) => {
        if (err) {
            console.error('Error en la búsqueda:', err);
            res.status(500).send('Error en la búsqueda');
        } else {
            res.status(200).json(result);
        }
    });
});

//RUTAS PARA GESTION DE PRODUCTOS:

//INSERT
app.post("/createProducto", (req, res) => {
    const {
        nombre,
        descripcion,
        color,
        pr_compra,
        pr_venta,
        imagen,
        id_provedor,
        pr_estatus,
  
      } = req.body;

      const insertQuery = 'INSERT INTO productos (nombre, descripcion, color, pr_compra, pr_venta, imagen, id_provedor, pr_estatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';    
    db.query(insertQuery, [nombre, descripcion, color, pr_compra, pr_venta, imagen, id_provedor, pr_estatus,], (err, result) => {
      if (err) {
        console.error('Error al insertar el producto:', err);
        res.status(500).json({ error: 'Error al insertar el producto', details: err.message });
      } else {
        console.log('producto insertado con éxito');
        res.status(200).json({ message: 'producto insertado con éxito' });
      }
    });
  });



  //SELECT PARA MOSTRAR EN LA TABLA:
  app.get("/productos", (req, res) => {
    db.query('SELECT * FROM productos', (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});



//ACTUALIZAR DATOS DE PRODUCTOS
app.put("/updateProducto/:id_producto", (req, res) => {
    const id_producto = req.params.id_producto;
    const { nombre, descripcion, color, pr_compra, pr_venta, imagen, id_provedor, pr_estatus } = req.body;
    db.query(
        'UPDATE productos SET nombre=?, descripcion=?, color=?, pr_compra=?, pr_venta=?, imagen=?, id_provedor=?, pr_estatus=? WHERE id_producto=?',
        [nombre, descripcion, color, pr_compra, pr_venta, imagen, id_provedor, pr_estatus, id_producto],
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Error al actualizar el registro" });
            } else {
                res.send(result);
            }
        }
    );
});

//CAMBIO DE ESTATUS DEL PRODUCTO A 0 LO QUE INDICA BAJA LOGICA:
app.put("/deleteProducto/:id_producto", (req, res) => {
    const id_producto = req.params.id_producto;

    // Actualiza el campo "estatus" a 0 si el registro existe
    db.query('UPDATE productos SET pr_estatus=0 WHERE id_producto=?', [id_producto], (updateErr, updateResult) => {
        if (updateErr) {
            console.error(updateErr);
            res.status(500).json({ error: "Error al Eliminar el producto" });
        } else {
            res.json({ message: "Producto Eliminado con éxito" });
        }
    });
    
});

//BUSCAR PRODUCTO:
app.get('/buscar_producto/:filtro/:busqueda', (req, res) => {
    const { filtro, busqueda } = req.params;
    const selectQuery = `SELECT * FROM productos WHERE ${filtro} LIKE ?`;
    db.query(selectQuery, ['%' + busqueda + '%'], (err, result) => {
        if (err) {
            console.error('Error en la búsqueda del producto', err);
            res.status(500).send('Error en la búsqueda');
        } else {
            res.status(200).json(result);
        }
    });
});

//CAMBIO DE ESTATUS DEL PRODUCTO A 1 LO QUE INDICA ALTA LOGICA:
//app.put("/altaProducto/:id_producto", (req, res) => {
//    const id_producto = req.params.id_producto;

    // Actualiza el campo "estatus" a 1 si el registro existe
//    db.query('UPDATE productos SET pr_estatus=1 WHERE id_producto=?', [id_producto], (updateErr, updateResult) => {
///        if (updateErr) {
//            console.error(updateErr);
//            res.status(500).json({ error: "Error al Eliminar el producto" });
//        } else {
//            res.json({ message: "Producto Eliminado con éxito" });
//        }
//    });
    
//});

//CREATE SUCURSAL:
app.post("/createSucursal", (req, res) => {
    const {
        suc_nombre,
        suc_direccion,
        suc_telefono,
        suc_estatus,
      } = req.body;

      const insertQuery = 'INSERT INTO sucursales (suc_nombre, suc_direccion, suc_telefono, suc_estatus) VALUES (?, ?, ?, ?)';    
    db.query(insertQuery, [suc_nombre, suc_direccion, suc_telefono, suc_estatus], (err, result) => {
      if (err) {
        console.error('Error al crear la sucursal:', err);
        res.status(500).json({ error: 'Error al crear la sucursal', details: err.message });
      } else {
        console.log('sucrsal creada con éxito');
        res.status(200).json({ message: 'sucursal creada exitosamente' });
      }
    });
  });

    //SELECT PARA MOSTRAR EN LA TABLA las sucursales existentes:
    app.get("/sucursal", (req, res) => {
        db.query('SELECT * FROM sucursales', (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        });
    });

//Actualiza los datos de Sucursales
    app.put("/updateSucursal/:id_sucursal", (req, res) => {
        const id_sucursal = req.params.id_sucursal;
        const { suc_nombre, suc_direccion, suc_telefono, suc_estatus} = req.body;
        db.query(
            'UPDATE sucursales SET suc_nombre=?, suc_direccion=?, suc_telefono=?, suc_estatus=? WHERE id_sucursal=?',
            [suc_nombre, suc_direccion, suc_telefono, suc_estatus,id_sucursal],
            (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: "Error al actualizar la sucursal" });
                } else {
                    res.send(result);
                }
            }
        );
    });

    //CAMBIO DE ESTATUS DEL LA SUCURSAL A 0 LO QUE INDICA BAJA LOGICA:
app.put("/deleteSucursal/:id_sucursal", (req, res) => {
    const id_sucursal = req.params.id_sucursal;

    // Actualiza el campo "estatus" a 0 si el registro existe
    db.query('UPDATE sucursales SET suc_estatus=0 WHERE id_sucursal=?', [id_sucursal], (updateErr, updateResult) => {
        if (updateErr) {
            console.error(updateErr);
            res.status(500).json({ error: "Error al dar de baja la sucursal" });
        } else {
            res.json({ message: "sucursal Eliminado con éxito" });
        }
    });
    
});

//BUSCAR SUCURSAL
app.get('/buscar_sucursal/:filtro/:busqueda', (req, res) => {
    const { filtro, busqueda } = req.params;
    const selectQuery = `SELECT * FROM sucursales WHERE ${filtro} LIKE ?`;
    db.query(selectQuery, ['%' + busqueda + '%'], (err, result) => {
        if (err) {
            console.error('Error en la búsqueda de la sucursal', err);
            res.status(500).send('Error en la búsqueda');
        } else {
            res.status(200).json(result);
        }
    });
});

//FILTRAR PRODCUTOS POR SUCURSAL:
app.get('/productos-sucursal/:id_sucursal', (req, res) => {
    const { id_sucursal } = req.params;
    // Realiza una consulta a la base de datos para obtener productos relacionados con la sucursal a través de la tabla de inventario
    // Asegúrate de manejar errores y devolver una respuesta adecuada
    // La consulta podría verse algo así:
    db.query(
      'SELECT p.* FROM productos p ' +
      'INNER JOIN inventario i ON p.id_producto = i.id_producto ' +
      'WHERE i.id_sucursal = ? AND p.pr_estatus = 1',
      [id_sucursal],
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).json({ error: 'Error en la consulta de productos por sucursal' });
        } else {
          res.json(result);
        }
      }
    );
  });
  

//CREAR INVENTARIO:
app.post("/createInventario", (req, res) => {
    const {
        inv_cantidad,
        inv_estatus,
        id_sucursal,
        id_producto,
      } = req.body;

      const insertQuery = 'INSERT INTO inventario (inv_cantidad, inv_estatus, id_sucursal, id_producto) VALUES (?, ?, ?, ?)';    
    db.query(insertQuery, [inv_cantidad, inv_estatus, id_sucursal, id_producto], (err, result) => {
      if (err) {
        console.error('Error al crear el inventario:', err);
        res.status(500).json({ error: 'Error al crear el inventario', details: err.message });
      } else {
        console.log('Inventario creado con éxito');
        res.status(200).json({ message: 'Inventario creado exitosamente' });
      }
    });
  });
    //SELECT PARA MOSTRAR EN LA TABLA los inventarios existentes:
    app.get("/inventario", (req, res) => {
        db.query('SELECT * FROM inventario', (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        });
    });
//Actualiza los datos de los inventarios
app.put("/updateInventario/:id_inventario", (req, res) => {
    const id_inventario = req.params.id_inventario;
    const { inv_cantidad, inv_estatus, id_sucursal, id_producto} = req.body;
    db.query(
        'UPDATE inventario SET inv_cantidad=?, inv_estatus=?, id_sucursal=?, id_producto=? WHERE id_inventario=?',
        [inv_cantidad, inv_estatus, id_sucursal, id_producto,id_inventario],
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ 
                    success: false,
                    message: "Error al actualizar el inventario"
                });
            } else {
                res.json({
                    success: true,
                    message: "Inventario actualizado con éxito",
                    data: result
                });
            }
        }
    );
});

 //CAMBIO DE ESTATUS DEL Inventario A 0 LO QUE INDICA BAJA LOGICA:
 app.put("/deleteInventario/:id_inventario", (req, res) => {
    const id_inventario = req.params.id_inventario;

    // Actualiza el campo "estatus" a 0 si el registro existe
    db.query('UPDATE inventario SET inv_estatus=0 WHERE id_inventario=?', [id_inventario], (updateErr, updateResult) => {
        if (updateErr) {
            console.error(updateErr);
            res.status(500).json({ error: "Error al dar de baja el inventario" });
        } else {
            res.json({ success: true, message: "Inventario eliminado con éxito" });
        }
    });
});
  
//AGREGAR A FAVORITOS:
app.post('/favoritos', (req, res) => {
  const { usuario, id_producto, sucursalSeleccionada } = req.body;
  const id_producto_entero = parseInt(id_producto);

  console.log('Nombre de usuario recibido en index:', usuario);
  console.log('ID de sucursal recibido en index:', sucursalSeleccionada);

  db.query('SELECT id, sesion FROM acceso_de_campos WHERE usuario = ?', [usuario], (err, result) => {
      if (err) {
          console.error('Error al obtener la sesión del usuario:', err);
          return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (result.length === 0) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const id = result[0].id;

      const selectQuery = 'SELECT * FROM favoritos WHERE id = ? AND id_producto = ? AND id_sucursal = ?';
      db.query(selectQuery, [id, id_producto_entero, sucursalSeleccionada], (error, result) => {
          if (error) {
              console.error('Error al verificar favorito:', error);
              return res.status(500).json({ error: 'Error interno del servidor' });
          }
          if (result.length > 0) {
            // El producto ya está en favoritos para esa sucursal
            return res.status(400).json({ error: 'El producto ya se encuentra en favoritos para esta sucursal' });
          }

          if (result.length === 0) {
              const insertQuery = 'INSERT INTO favoritos (id, id_producto, id_sucursal) VALUES (?, ?, ?)';
              db.query(insertQuery, [id, id_producto_entero, sucursalSeleccionada], (insertError) => {
                  if (insertError) {
                      console.error('Error al agregar favorito:', insertError);
                      return res.status(500).json({ error: 'Error interno del servidor' });
                  }

                  res.json({ success: true, message: 'Producto agregado a favoritos' });
              });
          } else {
              res.json({ success: true, message: 'El producto ya está en la lista de favoritos' });
          }
      });
  });
});


  // MOSTRAR FAVORITOS
  app.get('/mostrarfavoritos/:usuario', (req, res) => {
    const { usuario } = req.params;
  
    // Sacar el id del cliente mediante su usuario
    db.query('SELECT id FROM acceso_de_campos WHERE usuario = ?', [usuario], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error al obtener la sesión del usuario' });
      }
  
      if (result.length === 0) {
        // No se encontró ningún usuario con el nombre
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      const id = result[0].id;
  
      // Obtener los productos favoritos del usuario
      const query = `
        SELECT p.*, f.id_sucursal FROM productos p
        INNER JOIN favoritos f ON p.id_producto = f.id_producto
        WHERE f.id = ?
      `;
  
      db.query(query, [id], (error, result) => {
        if (error) {
          console.error('Error al obtener los productos favoritos:', error);
          return res.status(500).json({ success: false, message: 'Error al obtener los productos favoritos' });
        }
  
        res.json(result);
      });
    });
  });
  

  //AGREGAR A CARRITO: 
  app.post('/agregarAcarrito', (req, res) => {
    const { usuario, id_producto, sucursalSeleccionada } = req.body;
  
    // Verificar que el nombre de usuario se está pasando correctamente
    console.log('Nombre de usuario recibido:', usuario);
    console.log('ID de sucursal recibido:', sucursalSeleccionada);
    console.log('ID producto:', id_producto);

  
    // Obtener el id y la sesión del usuario
    db.query('SELECT id, sesion FROM acceso_de_campos WHERE usuario = ?', [usuario], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error al obtener la sesión del usuario' });
      }
  
      if (result.length === 0) {
        // No se encontró ningún usuario con el nombre
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      const id = result[0].id;
  
      // Obtener el id_carrito asociado al usuario
      db.query('SELECT id_carrito FROM carrito WHERE id = ?', [id], (carritoErr, carritoResult) => {
        if (carritoErr) {
          console.error('Error al obtener el id_carrito:', carritoErr);
          return res.status(500).json({ error: 'Error al obtener el id_carrito' });
        }
  
        if (carritoResult.length === 0) {
          // No se encontró un carrito asociado al usuario, puedes manejarlo según tu lógica de negocio
          return res.status(404).json({ error: 'No se encontró un carrito asociado al usuario' });
        }
  
        const id_carrito = carritoResult[0].id_carrito;
  
        // Verificar si el producto ya existe en el carrito para esa sucursal
        db.query(
          'SELECT * FROM detalle_carrito WHERE id_carrito = ? AND id_producto = ? AND id_sucursal = ?',
          [id_carrito, id_producto, sucursalSeleccionada],
          (existingProductError, existingProductResult) => {
            if (existingProductError) {
              console.error('Error al verificar si el producto ya existe en el carrito:', existingProductError);
              return res.status(500).json({ error: 'Error al verificar si el producto ya existe en el carrito' });
            }
  
            if (existingProductResult.length > 0) {
              // El producto ya está en el carrito para esa sucursal
              return res.status(400).json({ success: false, message: 'El producto ya se encuentra en el carrito para esta sucursal' });
            }
  
            // Obtener el precio de venta del producto
            db.query('SELECT pr_venta FROM productos WHERE id_producto = ?', [id_producto], (precioVentaError, precioVentaResult) => {
              if (precioVentaError) {
                console.error('Error al obtener el precio de venta:', precioVentaError);
                return res.status(500).json({ error: 'Error al obtener el precio de venta' });
              }
  
              if (precioVentaResult.length === 0) {
                // Manejar la situación donde no se encuentra el producto
                return res.status(404).json({ error: 'No se encontró el producto' });
              }
  
              const pr_venta = precioVentaResult[0].pr_venta;
  
              // Resto de tu lógica para agregar productos al carrito
              // Por ejemplo, puedes agregar el producto al carrito utilizando id_carrito
              db.query(
                'INSERT INTO detalle_carrito (det_cantidad, det_subtotal, id_producto, id_carrito, id_sucursal) VALUES (?, ?, ?, ?, ?)',
                [1, pr_venta, id_producto, id_carrito, sucursalSeleccionada],
                (insertError) => {
                  if (insertError) {
                    console.error('Error al agregar producto al carrito:', insertError);
                    return res.status(500).json({ success: false, message: 'Error al agregar producto al carrito' });
                  }
  
                  res.json({ success: true, id_carrito, message: 'Producto agregado al carrito' });
                }
              );
            });
          }
        );
      });
    });
  });
  


  // MOSTRAR CARRITO
  app.get('/mostrarCarrito/:usuario', (req, res) => {
    const { usuario } = req.params;
  
    // Sacar el id del cliente mediante su usuario
    db.query('SELECT id FROM acceso_de_campos WHERE usuario = ?', [usuario], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error al obtener la sesión del usuario' });
      }
  
      if (result.length === 0) {
        // No se encontró ningún usuario con el nombre
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      const id = result[0].id;
  
      // Obtener el id_carrito asociado al usuario
      db.query('SELECT id_carrito FROM carrito WHERE id = ?', [id], (carritoErr, carritoResult) => {
        if (carritoErr) {
          console.error('Error al obtener el id_carrito:', carritoErr);
          return res.status(500).json({ error: 'Error al obtener el id_carrito' });
        }
  
        if (carritoResult.length === 0) {
          // No se encontró un carrito asociado al usuario, puedes manejarlo según tu lógica de negocio
          return res.status(404).json({ error: 'No se encontró un carrito asociado al usuario' });
        }
  
        const id_carrito = carritoResult[0].id_carrito;
  
        // Obtener los productos del carrito del usuario con cantidades
        const query = `
          SELECT p.*, d.det_cantidad, d.id_sucursal
          FROM productos p
          INNER JOIN detalle_carrito d ON p.id_producto = d.id_producto
          WHERE d.id_carrito = ?;
        `;
  
        db.query(query, [id_carrito], (error, result) => {
          if (error) {
            console.error('Error al obtener los productos del carrito:', error);
            return res.status(500).json({ success: false, message: 'Error al obtener los productos del carrito' });
          }
  
          res.json(result);
        });
      });
    });
  });

// ACTUALIZAR CANTIDAD
app.post('/actualizarCantidad/:usuario/:idProducto/:id_sucursal', (req, res) => {
  const { usuario, idProducto, id_sucursal } = req.params;
  const { cantidad } = req.body;
  console.log('ID del producto recibido', idProducto);
  console.log('Usuario recibido', usuario);
  console.log('Cantidad', cantidad);
  console.log('id de la sucursal', id_sucursal);

  // Verifica que usuario y idProducto son cadenas
  if (typeof usuario !== 'string' || typeof idProducto !== 'string') {
    return res.status(400).json({ success: false, message: 'Parámetros inválidos' });
  }

  // Verifica si la cantidad es un número válido y mayor que cero
  if (typeof cantidad !== 'number' || cantidad <= 0) {
    return res.status(400).json({ success: false, message: 'La cantidad debe ser un número mayor que 0' });
  }

  db.query('SELECT inv_cantidad FROM inventario WHERE id_sucursal = ? AND id_producto = ?', [id_sucursal, idProducto], (invErr, invResult) => {
    if (invErr) {
      console.error('Error al obtener la cantidad del inventario:', invErr);
      return res.status(500).json({ error: 'Error al obtener la cantidad del inventario' });
    }

    if (invResult.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado en el inventario de la sucursal' });
    }

    const cantidadDisponible = invResult[0].inv_cantidad;

    // Verifica si hay suficientes existencias en el inventario
    if (cantidad > cantidadDisponible) {
      return res.status(400).json({
        success: false,
        message: 'No hay suficientes existencias en el inventario',
        availableQuantity: cantidadDisponible,
      });
    }

    // Obtener el id del cliente mediante su usuario
    db.query('SELECT id FROM acceso_de_campos WHERE usuario = ?', [usuario], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error al obtener la sesión del usuario' });
      }
      if (result.length === 0) {
        // No se encontró ningún usuario con el nombre
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const id = result[0].id;

      db.query('SELECT id_carrito FROM carrito WHERE id = ?', [id], (carritoErr, carritoResult) => {
        if (carritoErr) {
          console.error('Error al obtener el id_carrito:', carritoErr);
          return res.status(500).json({ error: 'Error al obtener el id_carrito' });
        }
        if (carritoResult.length === 0) {
          // No se encontró un carrito asociado al usuario
          return res.status(404).json({ error: 'No se encontró un carrito asociado al usuario' });
        }

        const id_carrito = carritoResult[0].id_carrito;

        // Verificar la existencia del producto en el carrito antes de la actualización
        db.query(
          'SELECT * FROM detalle_carrito WHERE id_carrito = ? AND id_producto = ? AND id_sucursal = ?',
          [id_carrito, idProducto, id_sucursal], (existError, existResult) => {
            if (existError) {
              console.error('Error al verificar la existencia del producto en el carrito:', existError);
              return res.status(500).json({ success: false, message: 'Error al verificar la existencia del producto en el carrito' });
            }

            if (existResult.length === 0) {
              // El producto no está en el carrito
              return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
            }

            // Realizar la actualización de la cantidad
            db.query(
              'UPDATE detalle_carrito SET det_cantidad = ? WHERE id_carrito = ? AND id_producto = ? AND id_sucursal = ?',
              [cantidad, id_carrito, idProducto, id_sucursal], (updateError) => {
                if (updateError) {
                  console.error('Error al actualizar la cantidad:', updateError);
                  return res.status(500).json({ success: false, message: 'Error al actualizar la cantidad' });
                }

                res.json({ success: true, message: 'Cantidad actualizada correctamente' });
              }
            );
          }
        );
      });
    });
  });
});

//INSERTAR LA VENTA
app.post('/insertarVenta/:usuario', async (req, res) => {
  const { usuario } = req.params;
  const { ve_total, ve_fecha } = req.body;
  
  db.query('SELECT id FROM acceso_de_campos WHERE usuario = ?', [usuario], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error al obtener la sesión del usuario' });
    }

    if (result.length === 0) {
      // No se encontró ningún usuario con el nombre
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const id = result[0].id;

  const query = 'INSERT INTO t_ventas (id, ve_total, ve_fecha,est_factura) VALUES (?, ?, ?,?)';
  db.query(query, [id, ve_total, ve_fecha, 0], (error, results) => {
    if (error) {
      console.error('Error al insertar la venta:', error);
      return res.status(500).json({ error: 'Error al insertar la venta' });
    }
  
    const idVenta = results.insertId;
  
    res.status(200).json({ id_venta: idVenta, message: 'Venta insertada correctamente' });
  });
});
});

app.post('/insertarDetalleVenta/:usuario', (req, res) => {
  const { usuario } = req.params;
  const { id_producto, det_nombrePro, det_cantidad,det_precioUnit, det_subtotal, id_sucursal, det_iva, idVenta } = req.body;
  console.log('Datos recibidos en insertarDetalleVenta:', req.params, req.body);

  
  db.query('SELECT id FROM acceso_de_campos WHERE usuario = ?', [usuario], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error al obtener la sesión del usuario' });
    }

    if (result.length === 0) {
      // No se encontró ningún usuario con el nombre
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const id = result[0].id;

      const query = 'INSERT INTO detalle_venta (id_venta, id_producto, det_nombre, det_cantidad, det_precioUnit, det_subtotal, id_sucursal, det_iva) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      db.query(query, [idVenta, id_producto, det_nombrePro, det_cantidad, det_precioUnit, det_subtotal, id_sucursal, det_iva], (error, results) => {
        if (error) {
          console.error('Error al insertar en detalle_venta:', error);
          res.status(500).json({ error: 'Error al insertar en detalle_venta' });
        } else {
          console.log('Insert exitoso en detalle_venta');
          res.status(200).json({ success: true, message: 'Detalle de venta insertado correctamente' });
        }
      });
  });
});

app.post('/datosFactura', (req, res) => {
  const { idVenta, rfc, regimenFiscal, razonSocial, usoCFDI } = req.body;
  console.log('ID', idVenta);
  console.log('RFC:', rfc);
  console.log('Régimen Fiscal:', regimenFiscal);
  console.log('Razón Social:', razonSocial);
  console.log('Uso de CFDI:', usoCFDI);

  const query = 'INSERT INTO facturacion (rfc, regimenFiscal, razonSocial, id_venta) VALUES (?, ?, ?, ?)';
  db.query(query, [rfc, regimenFiscal, razonSocial, idVenta], (error, results) => {
    if (error) {
      console.error('Error al insertar en facturacion:', error);
      return res.status(500).json({ success: false, message: 'Error al insertar en facturacion' });
    }
  
    res.status(200).send('Detalle de venta insertado correctamente');
  });
  });
  

app.post('/generarTicket/:usuario', async (req, res) => {
  try {
    const usuario = req.params.usuario;
    const { detallesCompra, totalCompra, id_venta } = req.body;

    // Validación de datos
    if (!detallesCompra || !totalCompra || !id_venta) {
      return res.status(400).json({ success: false, message: 'Datos de compra incompletos' });
    }

    const pdfPath = `./tickets/ticket_${usuario}.pdf`;

    // Obtener datos de la tabla facturacion (reemplaza esto con tu lógica de base de datos)
    const facturacionData = {
      rfc: 'LJ96OG2004MA',
      regimenFiscal: 'Régimen de Actividad Empresarial y Profesional',
      razonSocial: 'LIZONE',
    };

    function formatFecha(fechaString) {
      const fecha = new Date(fechaString);
      const year = fecha.getFullYear();
      const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const day = fecha.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    // Obtener datos de las tablas t_venta y detalle_venta usando promesas
    const [ventaData] = await db.promise().query('SELECT ve_total, ve_fecha FROM t_ventas WHERE id_venta = ?', [id_venta]);
    const [detalleVentasData] = await db.promise().query('SELECT det_nombre, det_cantidad, det_precioUnit, det_subtotal, id_sucursal FROM detalle_venta WHERE id_venta = ?', [id_venta]);

    // Lógica para generar el ticket en PDF
    const pdfDoc = new pdfkit();
    pdfDoc.pipe(fs.createWriteStream(pdfPath));

    // Configuración de formato para el texto
    pdfDoc.font('Courier-Bold');
    pdfDoc.fontSize(12);

    // Información de la empresa (fijo)
    pdfDoc.text('DATOS DE LA EMPRESA', { align: 'center' });
    pdfDoc.text(`RFC: ${facturacionData.rfc}`);
    pdfDoc.text(`Regimen Fiscal: ${facturacionData.regimenFiscal}`);
    pdfDoc.text(`Razon Social: ${facturacionData.razonSocial}`);
    pdfDoc.moveDown(1); // Espacio en blanco

    // Separador
    pdfDoc.text('--------------------------------------', { align: 'center' });
    pdfDoc.moveDown(1); // Espacio en blanco

    // Información de la tabla t_venta
    pdfDoc.text('VENTA:', { align: 'center' });
    pdfDoc.text(`ID Venta: ${id_venta}`);
    pdfDoc.text(`Fecha: ${formatFecha(ventaData[0].ve_fecha)}`);
    pdfDoc.moveDown(1); // Espacio en blanco

    // Información de la tabla detalle_venta
    if (detalleVentasData && detalleVentasData.length > 0) {
      pdfDoc.text('DETALLE DE LA VENTA:', { align: 'center' });
      detalleVentasData.forEach((detalle) => {
        pdfDoc.text(`Producto: ${detalle.det_nombre}`);
        pdfDoc.text(`Cantidad: ${detalle.det_cantidad}`);
        pdfDoc.text(`Precio Unitario: $${detalle.det_precioUnit}`);
        pdfDoc.text(`Subtotal: $${detalle.det_subtotal}`);
        pdfDoc.text(`ID Sucursal: ${detalle.id_sucursal}`);
        pdfDoc.text('--------------------------------------');
      });
    } else {
      pdfDoc.text('No se encontraron detalles de ventas para esta transacción.');
    }
    pdfDoc.moveDown(1); // Espacio en blanco

// Cálculos para el total sin IVA y total con IVA
const totalSinIVA = ventaData[0].ve_total / 1.16; // Divide por 1 + tasa de IVA (0.16)
const iva = ventaData[0].ve_total - totalSinIVA;
const totalConIVA = ventaData[0].ve_total;

pdfDoc.text(`Total sin IVA: $${totalSinIVA.toFixed(2)}`);
pdfDoc.text(`IVA (16%): $${iva.toFixed(2)}`);
pdfDoc.text(`Total con IVA: $${totalConIVA.toFixed(2)}`);

    pdfDoc.end();

    res.status(200).json({ success: true, message: 'Ticket generado con éxito' });
  } catch (error) {
    console.error('Error al generar el ticket:', error);
    res.status(500).json({ success: false, message: 'Error al generar el ticket' });
  }
});



app.get('/descargarTicket/:usuario', (req, res) => {
  try {
    const usuario = req.params.usuario;
    const pdfPath = `./tickets/ticket_${usuario}.pdf`;

    // Verificar si el archivo PDF existe
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ success: false, message: 'El ticket no existe' });
    }

    // Enviar el archivo PDF como respuesta
    const file = fs.createReadStream(pdfPath);
    const stat = fs.statSync(pdfPath);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket_${usuario}.pdf`);
    file.pipe(res);
  } catch (error) {
    console.error('Error al descargar el ticket:', error);
    res.status(500).json({ success: false, message: 'Error al descargar el ticket' });
  }
});

app.delete('/eliminarDetalleCarrito/:usuario', (req, res) => {
  try {
    const usuario = req.params.usuario;
    let id;
    let id_carrito;

    // Obtener el id del usuario
    db.query('SELECT id FROM acceso_de_campos WHERE usuario = ?', [usuario], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error al obtener la sesión del usuario' });
      }
  
      if (result.length === 0) {
        // No se encontró ningún usuario con el nombre
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      id = result[0].id;

      // Obtener el id_carrito del usuario
      db.query('SELECT id_carrito FROM carrito WHERE id = ?', [id], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: 'Error al obtener el carrito del usuario' });
        }
    
        if (result.length === 0) {
          // No se encontró ningún carrito asociado al usuario
          return res.status(404).json({ error: 'Carrito no encontrado' });
        }
    
        id_carrito = result[0].id_carrito;

        // Eliminar la tabla detalle_carrito usando el id_carrito obtenido
        db.query('DELETE FROM detalle_carrito WHERE id_carrito=?', [id_carrito], (updateErr, updateResult) => {
          if (updateErr) {
            console.error(updateErr);
            return res.status(500).json({ error: "Error al Eliminar el carrito" });
          } else {
            res.json({ message: "Carrito Eliminado con éxito" });
          }
        });
      });
    });
  } catch (error) {
    console.error('Error al eliminar detalle_carrito:', error);
    res.status(500).json({ error: 'Error al eliminar detalle_carrito' });
  }
});

app.post('/eliminarProducto', (req, res) => {
  const { usuario, idProducto, idSucursal } = req.body;

  try {
    // Obtener el id del usuario
    db.query('SELECT id FROM acceso_de_campos WHERE usuario = ?', [usuario], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error al obtener la sesión del usuario' });
      }
  
      if (result.length === 0) {
        // No se encontró ningún usuario con el nombre
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      // eslint-disable-next-line no-undef
      id = result[0].id;

      // Obtener el id_carrito del usuario
      // eslint-disable-next-line no-undef
      db.query('SELECT id_carrito FROM carrito WHERE id = ?', [id], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: 'Error al obtener el carrito del usuario' });
        }
    
        if (result.length === 0) {
          // No se encontró ningún carrito asociado al usuario
          return res.status(404).json({ error: 'Carrito no encontrado' });
        }
    
        // eslint-disable-next-line no-undef
        id_carrito = result[0].id_carrito;

        // Eliminar la tabla detalle_carrito usando el id_carrito obtenido
        // eslint-disable-next-line no-undef
        db.query('DELETE FROM detalle_carrito WHERE id_carrito=? AND id_producto=? AND id_sucursal=?', [id_carrito, idProducto, idSucursal], (updateErr, updateResult) => {
          if (updateErr) {
            console.error(updateErr);
            return res.status(500).json({ error: "Error al Eliminar el prodcuto del carrito" });
          } else {
            res.json({ message: "prodcuto eliminado del Carrito con éxito" });
          }
        });
      });
    });
  } catch (error) {
    console.error('Error al eliminar detalle_carrito:', error);
    res.status(500).json({ error: 'Error al eliminar detalle_carrito' });
  }
});

app.get('/mostrarHistorial/:usuario', (req, res) => {
  const usuario = req.params.usuario;

  // Obtener el id del usuario desde la tabla 'acceso_de_campos'
  db.query('SELECT id FROM acceso_de_campos WHERE usuario = ?', [usuario], (err, resultUsuario) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error al obtener la sesión del usuario' });
    }

    if (resultUsuario.length === 0) {
      // No se encontró ningún usuario con el nombre
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const id = resultUsuario[0].id;

    // Obtener las ventas del usuario y sus detalles asociados usando JOIN
    const query = `
      SELECT tv.id_venta, tv.ve_total, tv.ve_fecha, tv.est_factura, dv.det_nombre, dv.det_cantidad, dv.det_precioUnit, dv.det_subtotal, dv.id_sucursal
      FROM t_ventas tv
      JOIN detalle_venta dv ON tv.id_venta = dv.id_venta
      WHERE tv.id = ?
    `;
    db.query(query, [id], (err, resultVentas) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error al obtener las ventas del usuario' });
      }

      if (resultVentas.length === 0) {
        // No se encontraron ventas asociadas al usuario
        return res.status(404).json({ error: 'Ventas no encontradas para el usuario' });
      }

      // Aquí resultVentas contiene las ventas y sus detalles asociados
      const historialUsuario = resultVentas;

      res.json(historialUsuario);
    });
  });
});

app.post('/validarVenta/:id_venta', (req, res) => {
  const { id_venta } = req.params;

  // Verificar si id_venta está definido
  if (!id_venta) {
    return res.status(400).json({ error: 'ID de venta no proporcionado en la solicitud.' });
  }

  db.query('SELECT id_venta FROM t_ventas WHERE id_venta = ? AND est_factura = 0', [id_venta], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error al obtener la sesión del usuario' });
    }

    if (result.length === 0) {
      // No se encontró ningún usuario con el nombre
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    // Asegúrate de que id_venta esté definido antes de usarlo
    const ventaEncontrada = result[0];
    const id_venta_encontrado = ventaEncontrada ? ventaEncontrada.id_venta : null;

    if (!id_venta_encontrado) {
      // Si id_venta no está definido, devuelve un error
      return res.status(500).json({ error: 'Error al obtener la información de la venta' });
    }

    // Enviar un mensaje de éxito
    res.status(200).json({ success: true, message: 'Compra validada con éxito.' });
  });
});

app.post('/generarFactura/:usuario', async (req, res) => {
  try {
    const usuario = req.params.usuario;
    const { id_venta, datosFactura } = req.body;
    console.log('Usuario desde index:', usuario);

    console.log('Datos recibidos en el servidor:', {
      id_venta: id_venta,
      datosFactura: datosFactura,
    });

    // Validación de datos
    if (!datosFactura || !id_venta) {
      return res.status(400).json({ success: false, message: 'Datos de compra incompletos' });
    }

    const pdfDirectory = path.join(__dirname, 'factura');
    const pdfPath = path.join(pdfDirectory, `factura_${usuario}.pdf`);

    // Obtener datos de la tabla facturacion (reemplaza esto con tu lógica de base de datos)
    const facturacionData = {
      rfc: 'LJ96OG2004MA',
      regimenFiscal: 'Régimen de Actividad Empresarial y Profesional',
      razonSocial: 'LIZONE',
    };

    function formatFecha(fechaString) {
      const fecha = new Date(fechaString);
      const year = fecha.getFullYear();
      const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const day = fecha.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Obtener datos de las tablas t_venta y detalle_venta usando promesas
    const [ventaData] = await db.promise().query('SELECT ve_total, ve_fecha FROM t_ventas WHERE id_venta = ?', [id_venta]);
    const [detalleVentasData] = await db.promise().query('SELECT det_nombre, det_cantidad, det_precioUnit, det_subtotal, id_sucursal FROM detalle_venta WHERE id_venta = ?', [id_venta]);
    
    if (!fs.existsSync(pdfDirectory)) {
      fs.mkdirSync(pdfDirectory, { recursive: true });
    } 
    // Lógica para generar el ticket en PDF
    const pdfDoc = new pdfkit();
    pdfDoc.pipe(fs.createWriteStream(pdfPath));

    // Configuración de formato para el texto
    pdfDoc.font('Courier-Bold');
    pdfDoc.fontSize(12);

    // Información de la empresa (fijo)
    pdfDoc.text('DATOS DE LA EMPRESA', { align: 'center' });
    pdfDoc.text(`RFC: ${facturacionData.rfc}`, { width: 300 }); // Alineado a la izquierda
    pdfDoc.text(`Regimen Fiscal: ${facturacionData.regimenFiscal}`, { width: 300 });
    pdfDoc.text(`Razon Social: ${facturacionData.razonSocial}`, { width: 300 });
    pdfDoc.moveDown(1); // Espacio en blanco

    // Separador
    pdfDoc.text('--------------------------------------', { align: 'center' });
    pdfDoc.moveDown(1); // Espacio en blanco

    // Datos de la Factura
    pdfDoc.text('DATOS DEL CLIENTE:', { align: 'center' });
    pdfDoc.text(`ID Venta: ${id_venta}`, { width: 300 }); // Alineado a la izquierda
    pdfDoc.text(`RFC: ${datosFactura.rfc}`, { width: 300 });
    pdfDoc.text(`Regimen Fiscal: ${datosFactura.regimenFiscal}`, { width: 300 });
    pdfDoc.text(`Razon Social: ${datosFactura.razonSocial}`, { width: 300 });
    pdfDoc.text(`Uso de CFDI: ${datosFactura.usoCFDI}`, { width: 300 });
    pdfDoc.moveDown(1); // Espacio en blanco

    // Separador
    pdfDoc.text('--------------------------------------', { align: 'center' });
    pdfDoc.moveDown(1); // Espacio en blanco

    // Información de la tabla t_venta
    pdfDoc.text('VENTA:', { align: 'center' });
    pdfDoc.text(`ID Venta: ${id_venta}`, { width: 300 }); // Alineado a la izquierda
    pdfDoc.text(`Fecha: ${formatFecha(ventaData[0].ve_fecha)}`, { width: 300 });
    pdfDoc.moveDown(1); // Espacio en blanco

    // Información de la tabla detalle_venta
    pdfDoc.text('DETALLE DE LA VENTA:', { align: 'center' });

    if (detalleVentasData && detalleVentasData.length > 0) {
      // Llenar datos de la tabla
      detalleVentasData.forEach((detalle) => {
        pdfDoc.text(`Producto: ${detalle.det_nombre}`, { width: 300 });
        pdfDoc.text(`Cantidad: ${detalle.det_cantidad}`, { width: 300 });
        pdfDoc.text(`Precio Unitario: $${detalle.det_precioUnit.toFixed(2)}`, { width: 300 });
        pdfDoc.text(`Subtotal: $${detalle.det_subtotal.toFixed(2)}`, { width: 300 });
        pdfDoc.text(`ID Sucursal: ${detalle.id_sucursal}`, { width: 300 });
        pdfDoc.moveDown(1); // Espacio en blanco
      });
    } else {
      pdfDoc.text('No se encontraron detalles de ventas para esta transacción.', { width: 300 });
    }

    pdfDoc.moveDown(1); // Espacio en blanco

    // Cálculos para el total sin IVA y total con IVA
    const totalSinIVA = ventaData[0].ve_total / 1.16; // Divide por 1 + tasa de IVA (0.16)
    const iva = ventaData[0].ve_total - totalSinIVA;
    const totalConIVA = ventaData[0].ve_total;

    pdfDoc.text(`Total sin IVA: $${totalSinIVA.toFixed(2)}`, { width: 300 }); // Alineado a la izquierda
    pdfDoc.text(`IVA (16%): $${iva.toFixed(2)}`, { width: 300 });
    pdfDoc.text(`Total con IVA: $${totalConIVA.toFixed(2)}`, { width: 300 });

    pdfDoc.end();

    res.status(200).json({ success: true, message: 'Ticket generado con éxito' });
  } catch (error) {
    console.error('Error al generar el ticket:', error);
    res.status(500).json({ success: false, message: 'Error al generar el ticket' });
  }
});


app.get('/descargarFactura/:usuario/:id_venta', async (req, res) => {
  try {
    const usuario = req.params.usuario;
    const id_venta = req.params.id_venta;

    // Construir la ruta del archivo PDF usando el módulo 'path'
    const pdfPath = path.join(__dirname, 'factura', `factura_${usuario}.pdf`);

    // Verificar si el archivo PDF existe
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ success: false, message: 'La factura no existe' });
    }

    // Enviar el archivo PDF como respuesta
    const file = fs.createReadStream(pdfPath);
    const stat = fs.statSync(pdfPath);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=factura_${usuario}.pdf`);
    file.pipe(res);

    // Actualizar est_factura en la tabla t_venta
    const updateQuery = 'UPDATE t_ventas SET est_factura = 1 WHERE id_venta = ?';
    await db.promise().query(updateQuery, [id_venta]);

  } catch (error) {
    console.error('Error al descargar la factura:', error);
    res.status(500).json({ success: false, message: 'Error al descargar la factura' });
  }
});

app.post('/eliminarFavoritos', (req, res) => {
  const { usuario, idProducto, idSucursal } = req.body;
  console.log('Recibiendo desde index', usuario, idProducto, );
  db.query('SELECT id FROM acceso_de_campos WHERE usuario = ?', [usuario], (err, resultUsuario) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error al obtener la sesión del usuario' });
    }

    if (resultUsuario.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const id = resultUsuario[0].id;

    db.query('DELETE FROM favoritos WHERE id=? AND id_producto=? AND id_sucursal=?', [id, idProducto, idSucursal], (updateErr, updateResult) => {
      if (updateErr) {
        console.error(updateErr);
        return res.status(500).json({ error: "Error al eliminar el producto de favoritos" });
      }

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: "Producto no encontrado en la lista de favoritos" });
      }

      res.json({ message: "Producto eliminado de favoritos con éxito" });
    });
  });
});

app.get('/obtenerCantidadInventario', (req, res) => {
  const { id_producto, id_sucursal } = req.query;

  db.query('SELECT inv_cantidad FROM inventario WHERE id_sucursal = ? AND id_producto = ?', [id_sucursal, id_producto], (err, resultInventario) => {
    if (err) {
      console.error('Error al obtener la cantidad en inventario:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (resultInventario.length === 0) {
      return res.status(404).json({ error: 'Inventario no encontrado' });
    }

    const cantidad = resultInventario[0].inv_cantidad;
    res.status(200).json({ cantidad });
  });
});



app.listen(3001, () => {
    console.log("Corriendo en el puerto 3001");
});