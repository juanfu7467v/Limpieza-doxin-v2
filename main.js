// main.js

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Ruta de ficha compatible con AppCreator 24 y múltiples imágenes
app.get('/ficha', async (req, res) => {
  const { dni } = req.query;

  if (!dni || dni.length !== 8 || isNaN(dni)) {
    return res.status(400).json({ message: 'DNI inválido. Debe tener 8 dígitos.' });
  }

  try {
    const urlAPI = `https://generar-pdf-peapp-production.up.railway.app/generar-ficha?dni=${dni}`;
    const response = await axios.get(urlAPI);

    const data = response.data;

    if (data && data.urls && Array.isArray(data.urls) && data.urls.length > 0) {
      // Enviar múltiples respuestas tipo Factiliza, una por imagen
      const resultados = data.urls.map((url) => {
        return { message: 'Ficha generada', url };
      });

      return res.json(resultados);
    } else {
      return res.status(404).json({ message: 'No se encontraron imágenes para este DNI.' });
    }
  } catch (error) {
    console.error('Error al generar ficha:', error.message);
    return res.status(500).json({ message: 'Error al generar la ficha. Intenta nuevamente.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
