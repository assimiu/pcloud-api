const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(fileUpload({
  useTempFiles: false, // Importante: não usar arquivos temporários
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
}));

app.post('/carregar', async (req, res) => {
  if (!req.files?.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const file = req.files.file;
  
  try {
    // 1. Gera hash diretamente do buffer (sem salvar em disco)
    const hash = crypto.createHash('sha256').update(file.data).digest('hex');
    const fileExtension = file.name.split('.').pop();
    const uniqueName = `${hash}.${fileExtension}`;

    // 2. Prepara o formulário diretamente do buffer
    const form = new FormData();
    form.append('auth', 'YKErcXZ8LjuZeNIdydSsIABFNNOd5LfajBIXzmm7');
    form.append('folderid', '18314431194');
    form.append('filename', uniqueName);
    form.append('file', file.data, {
      filename: uniqueName,
      contentType: file.mimetype
    });

    // 3. Envia para o pCloud
    const { data } = await axios.post('https://eapi.pcloud.com/uploadfile', form, {
      headers: {
        ...form.getHeaders(),
        'Content-Length': form.getLengthSync()
      }
    });

    res.json({
      success: true,
      filename: uniqueName,
      pcloud: data
    });

  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

module.exports = app;