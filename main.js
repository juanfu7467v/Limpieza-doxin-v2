const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Crear carpeta "public" si no existe
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

app.use('/public', express.static(publicDir));

app.get('/ficha', async (req, res) => {
  const { dni } = req.query;

  if (!dni || dni.length !== 8 || isNaN(dni)) {
    return res.status(400).json({ message: 'DNI inválido. Debe tener 8 dígitos.' });
  }

  try {
    // Consultar las imágenes desde la API externa
    const urlAPI = `https://generar-pdf-peapp-production.up.railway.app/generar-ficha?dni=${dni}`;
    const response = await axios.get(urlAPI);

    const data = response.data;

    if (!data || !data.urls || !Array.isArray(data.urls) || data.urls.length === 0) {
      return res.status(404).json({ message: 'No se encontraron imágenes para este DNI.' });
    }

    // Crear PDF con pdf-lib
    const pdfDoc = await PDFDocument.create();

    for (const imageUrl of data.urls) {
      const imageBuffer = await fetch(imageUrl).then(res => res.arrayBuffer());
      const imageExt = imageUrl.split('.').pop().toLowerCase();

      let image;
      if (imageExt === 'png') {
        image = await pdfDoc.embedPng(imageBuffer);
      } else {
        image = await pdfDoc.embedJpg(imageBuffer); // fallback
      }

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    }

    const pdfBytes = await pdfDoc.save();
    const fileName = `${uuidv4()}_${dni}.pdf`;
    const filePath = path.join(publicDir, fileName);

    fs.writeFileSync(filePath, pdfBytes);

    const pdfUrl = `https://tu-dominio.railway.app/public/${fileName}`;

    // 🔁 Formato compatible con AppCreator 24 (como Factiliza)
    return res.json({
      message: 'Ficha generada',
      url: pdfUrl
    });

  } catch (error) {
    console.error('❌ Error al generar el PDF:', error.message);
    return res.status(500).json({ message: 'Error al generar la ficha. Intenta nuevamente.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor activo en el puerto ${PORT}`);
});
