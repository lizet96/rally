import React from 'react';
import { Link } from 'react-router-dom'; // Importa Link desde react-router-dom

const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        lineHeight: '1.6',
        color: '#333',
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'justify',
    },
    headerContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100px',
        backgroundColor: '#48d1cc',
        borderRadius: '5px',
        margin: '0 0 20px 0',
    },
    header: {
        margin: 0,
    },
    backButton: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#007BFF',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        textDecoration: 'none',
    },
};

const Compania = () => {
    const { container, header, headerContainer, backButton } = styles;

    return (
        <div style={container}>
            <div style={headerContainer}>
                <h1 style={header}>Compañia</h1>
            </div>
            <p>
                Aquí puedes agregar todo el texto y contenido que desees,
                describir tu compañía, tu misión, visión, valores, entre otros.
                Este componente servirá como una página de presentación sobre la
                información más relevante de tu proyecto o empresa.
            </p>
            <Link to="/"><button style={backButton}>Regresar</button></Link> {/* Agrega el botón "Regresar" */}
        </div>
    );
};

export default Compania;