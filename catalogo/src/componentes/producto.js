import React from 'react'; 

const Producto =({producto}) =>{
    return(
    <div className='card'>
        <div className='card-body'>
            <h5 className='card-title'>{producto.nombre}</h5>
            <p className='card-title'>Precio:${producto.precio}</p>
            <p className='card-title'>Cantidad disponible:${producto.nombre}</p>
            <button className='btn btn-primary'>Agregar a pedidos</button>

        </div>

    </div>
    )
}
export default Producto;