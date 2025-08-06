// main.js

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas las rutas
app.use(cors());

app.get('/ficha', async (req, res) => {
  const { dni } = req.query;

  if (!dni || dni.length !== 8 || isNaN(dni)) {
    return res.json({
      success: false,
      message: '❌ DNI inválido. Debe tener 8 dígitos.'
    });
  }

  try {
    const urlAPI = `https://generar-pdf-peapp-production.up.railway.app/generar-ficha?dni=${dni}`;
    const response = await axios.get(urlAPI);
    const data = response.data;

    if (data && Array.isArray(data.urls) && data.urls.length > 0) {
      // Convertimos la lista en propiedades separadas: img1, img2, ...
      const result = {
        success: true,
        message: `✅ Se generaron ${data.urls.length} imágenes.`,
      };

      data.urls.forEach((url, index) => {
        result[`img${index + 1}`] = url;
      });

      return res.json(result);
    } else {
      return res.json({
        success: false,
        message: '❌ No se encontraron imágenes para este DNI.'
      });
    }
  } catch (error) {
    console.error('❌ Error al procesar la ficha:', error.message);
    return res.json({
      success: false,
      message: '❌ Error al generar la ficha. Intenta más tarde.'
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor funcionando en el puerto ${PORT}`);
});
