const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do pCloud
const PCLOUD_ACCESS_TOKEN = 'seu_access_token_aqui'; // Substitua pelo seu token
const PCLOUD_API_URL = 'https://eapi.pcloud.com/';

// Middleware para lidar com JSON e upload de arquivos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota para upload de arquivo
app.post('/upload-to-pcloud', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const file = req.files.file;
    const filePath = path.join(__dirname, 'uploads', file.name);

    // Salva o arquivo temporariamente
    await file.mv(filePath);

    // Prepara o formulário para enviar ao pCloud
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('filename', file.name);
    formData.append('folderid', '0'); // 0 é a raiz do pCloud

    // Configuração do cabeçalho
    const headers = {
      ...formData.getHeaders(),
      Authorization: `Bearer ${PCLOUD_ACCESS_TOKEN}`
    };

    // Faz o upload para o pCloud
    const response = await axios.post(
      `${PCLOUD_API_URL}uploadfile`,
      formData,
      { headers }
    );

    // Remove o arquivo temporário
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Arquivo enviado com sucesso para o pCloud',
      pcloudResponse: response.data
    });

  } catch (error) {
    console.error('Erro ao enviar para pCloud:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao enviar arquivo para pCloud',
      details: error.message
    });
  }
});

// ... mantenha suas rotas existentes ...

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    // Cria a pasta uploads se não existir
    if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
      fs.mkdirSync(path.join(__dirname, 'uploads'));
    }
  });
}

module.exports = app;