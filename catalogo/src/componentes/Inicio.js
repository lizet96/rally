import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Inicio = () => {
    const navigate = useNavigate();

    const wrapperStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center', // Centra verticalmente todos los elementos
        height: '100vh',
        textAlign: 'center',
        marginBottom: '50px', // Ajusta el margen inferior según tus necesidades
        marginTop: '-50px', // Ajusta el margen superior según tus necesidades
    };

    const imageStyle = {
        width: '150px',
        margin: '0 auto', // Centra la imagen horizontalmente
    };

    const titleStyle = {
        fontSize: '2em',
        fontWeight: 'bold',
        marginBottom: '50px', 
        marginTop: '-50px', // Ajusta el margen superior del título
    };

    const buttonStyle = {
        backgroundColor: '#152C58',
        color: 'white',
        padding: '10px 20px',
        margin: '5px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'transform 0.1s',
        marginTop: '10px', // Ajusta el margen superior de los botones
    };
    const buttonStyle2 = {
        backgroundColor: '#2E6199',
        color: 'white',
        padding: '10px 20px',
        margin: '5px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'transform 0.1s',
        marginTop: '10px', // Ajusta el margen superior de los botones
    };

    const goToRegistro = () => {
        navigate('/registro');
    };

    const goToLogin = () => {
        navigate('/login');
    };

    return (
        <div>
            <div style={imageStyle}>
                <img src="logo.jpeg" alt="Imagen" style={imageStyle} />
            </div>
            <div style={wrapperStyle}>
                <h2 style={titleStyle}>Bienvenido al really 2024!</h2>
                <div>
                    <button style={buttonStyle} onClick={goToRegistro}>Registro</button>
                    <button style={buttonStyle2} onClick={goToLogin}>Inicio de Sesión</button>
                </div>
            </div>
        </div>
    );
};

export default Inicio;
