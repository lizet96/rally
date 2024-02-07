const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');

router.post('/generarTicket/:usuario', async (req, res) => {
  try {
    const { detallesCompra, totalCompra } = req.body;
    const usuario = req.params.usuario;

    // Crear un nuevo documento PDF
    const doc = new PDFDocument();
    // Puedes personalizar el formato del ticket según tus necesidades
    doc.text(`¡Gracias por tu compra, ${usuario}!`, 50, 50);
    doc.text('Detalles de la compra:', 50, 80);

    detallesCompra.forEach((producto, index) => {
      doc.text(`${index + 1}. ${producto.nombre} - ${producto.precio}`, 50, 100 + index * 20);
    });

    doc.text(`Total: ${totalCompra}`, 50, 200);

    // Establecer el tipo de contenido y el encabezado para el navegador
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${usuario}_ticket.pdf`);

    // Transmitir el contenido del documento PDF al navegador
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error al generar el ticket:', error);
    res.status(500).json({ error: 'Error al generar el ticket' });
  }
});

module.exports = router;
