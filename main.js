// main.js

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas las rutas
app.use(cors());

// Ruta principal para consultar la ficha
app.get('/ficha', async (req, res) => {
  const { dni } = req.query;

  if (!dni || dni.length !== 8 || isNaN(dni)) {
    return res.status(400).json({
      message: '❌ DNI inválido. Debe tener 8 dígitos.',
      urls: null
    });
  }

  try {
    const urlAPI = `https://generar-pdf-peapp-production.up.railway.app/generar-ficha?dni=${dni}`;
    const response = await axios.get(urlAPI);

    const data = response.data;

    if (data && data.urls && Array.isArray(data.urls) && data.urls.length > 0) {
      return res.json({
        message: `✅ Se generaron ${data.urls.length} imágenes correctamente.`,
        urls: data.urls
      });
    } else {
      return res.status(404).json({
        message: '❌ No se encontraron imágenes para este DNI.',
        urls: null
      });
    }
  } catch (error) {
    console.error('❌ Error al procesar la ficha:', error.message);
    return res.status(500).json({
      message: '❌ Error interno del servidor al generar la ficha.',
      urls: null
    });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor funcionando en el puerto ${PORT}`);
});
