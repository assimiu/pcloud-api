const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // Módulo nativo para hash

const app = express();
const PORT = 3000;

app.use(fileUpload());

app.post('/carregar', async (req, res) => {
  if (!req.files?.file) {
    return res.status(400).send('Envie um arquivo usando o campo "file"');
  }

  const file = req.files.file;
  
  try {
    // 1. Gera um hash único do conteúdo do arquivo
    const hash = crypto.createHash('sha256').update(file.data).digest('hex');
    const fileExtension = path.extname(file.name);
    const uniqueName = hash + fileExtension;
    const tempPath = `./temp_${uniqueName}`;

    // 2. Salva o arquivo temporariamente
    await file.mv(tempPath);

    // 3. Prepara o upload para o pCloud
    const form = new FormData();
    form.append('auth', 'YKErcXZ8LjuZeNIdydSsIABFNNOd5LfajBIXzmm7');
    form.append('folderid', '0');
    form.append('filename', uniqueName); // Usa o nome com hash
    form.append('file', fs.createReadStream(tempPath));

    // 4. Envia para o pCloud
    const { data } = await axios.post('https://eapi.pcloud.com/uploadfile', form, {
      headers: form.getHeaders()
    });

    // 5. Limpeza e resposta
    fs.unlinkSync(tempPath);
    res.json({
      success: true,
      originalName: file.name,
      uniqueName: uniqueName,
      hash: hash,
      pCloudResponse: data
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data || null
    });
  }
});
