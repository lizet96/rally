import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const idUser = localStorage.getItem('id_user');
  const IVA_RATE = 0.16; // Tasa de IVA, ajustar según sea necesario

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/carrito/${idUser}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setCartItems(response.data);
      } catch (error) {
        console.error('Error al obtener productos del carrito:', error);
      }
    };

    fetchCartItems();
  }, [idUser]);

  const handleQuantityChange = (index, newQuantity) => {
    const newCartItems = [...cartItems];
    newCartItems[index].car_cantidad = Math.max(1, newQuantity); // Asegurarse de que la cantidad no sea menor que 1
    setCartItems(newCartItems);
  };

  const calculatePriceDetails = (item) => {
    const priceWithoutIVA = item.car_cantidad * item.precio; // Asumiendo que tienes un campo de precio en el ítem
    const IVA = priceWithoutIVA * IVA_RATE;
    const totalPrice = priceWithoutIVA + IVA;
    return { priceWithoutIVA, IVA, totalPrice };
  };

  const updateCart = async (item) => {
    try {
      await axios.put(`http://localhost:3000/carrito/${usuario}/${item.id_producto}`, {
        car_cantidad: item.car_cantidad
        // Agregar otros datos necesarios para la actualización
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Carrito actualizado con éxito');
    } catch (error) {
      console.error('Error al actualizar el carrito:', error);
    }
  };

  return (
    <div>
      <h2>Mi Carrito</h2>
      {cartItems.map((item, index) => {
        const { priceWithoutIVA, IVA, totalPrice } = calculatePriceDetails(item);

        return (
          <div key={index}>
            <p>Producto ID: {item.id_producto}</p>
            <p>Cantidad: 
              <input 
                type="number" 
                value={item.car_cantidad}
                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                min="1"
              />
            </p>
            <p>Precio sin IVA: ${priceWithoutIVA.toFixed(2)}</p>
            <p>IVA: ${IVA.toFixed(2)}</p>
            <p>Total: ${totalPrice.toFixed(2)}</p>
            <button onClick={() => updateCart(item)}>Actualizar</button>
          </div>
        );
      })}
    </div>
  );
};

export default Cart;

export const actualizarCantidadItemCarrito = async (req, res) => {
    const { id_user, id_producto } = req.params;
    const { car_cantidad } = req.body;
  
    try {
      await blogDet_Car.update({ car_cantidad }, {
        where: { 
          id_user: id_user, 
          id_producto: id_producto // Asegúrate de que el modelo tiene estos campos
        }
      });
      res.json({ message: "Item de carrito actualizado exitosamente" });
    } catch (error) {
      res.json({ message: error.message });
    }
  };
  
  ruDet_car.put('/:id_user/:id_producto', actualizarCantidadItemCarrito); }