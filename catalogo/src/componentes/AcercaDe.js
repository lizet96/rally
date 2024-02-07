import React from 'react';

// Estilos del componente
const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        lineHeight: '1.6',
        color: '#333',
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto', // Centrar horizontalmente
        textAlign: 'justify',
    },
    headerContainer: {
        display: 'flex',
        color: 'white',
        justifyContent: 'center', // Centrar horizontalmente
        alignItems: 'center',     // Centrar verticalmente
        height: '100px',         // Altura del contenedor del título
        backgroundColor: '#152C58', // Color de fondo para diferenciarlo
        borderRadius: '5px',     // Bordes redondeados para estética
        margin: '0 0 20px 0',    // Margen inferior para separación
    },
    header: {
        margin: 0,               // Eliminar el margen predeterminado de h1
    },
    tableContainer: {
        marginTop: '20px',
        overflowX: 'auto', // Añadido para permitir desplazamiento horizontal en tablas anchas
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        borderRadius: '5px',
        overflow: 'hidden', // Añadido para estética
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)', // Añadido para sombra
    },
    tableHeader: {
        backgroundColor: '#07A5F7',
        color: '#333',
        fontWeight: 'bold',
    },
    tableCell: {
        border: '1px solid #ddd',
        padding: '12px',
        textAlign: 'left',
        fontSize: '16px',
    },
};

const AcercaDe = () => {
    const { container, header, headerContainer, tableContainer, table, tableHeader, tableCell } = styles;

    return (
        <div style={container}>
            <div style={headerContainer}>
                <h1 style={header}>Resultados:</h1>
            </div>
            <div style={tableContainer}>
                <table style={table}>
                    <thead style={tableHeader}>
                        <tr>
                            <th style={tableCell}>Equipo</th>
                            <th style={tableCell}>Aciertos</th>
                            <th style={tableCell}>Tiempo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={tableCell}>Equipo 1</td>
                            <td style={tableCell}>10</td>
                            <td style={tableCell}>30 minutos</td>
                        </tr>
                        <tr>
                            <td style={tableCell}>Equipo 2</td>
                            <td style={tableCell}>8</td>
                            <td style={tableCell}>25 minutos</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AcercaDe;
