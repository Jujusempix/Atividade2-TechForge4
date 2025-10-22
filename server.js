const express = require('express');
const cors = require('cors'); // Importa o pacote cors
const app = express();
const port = 3000;
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const { addUser, findByUsername } = require('./models/userModel');

app.use(cors()); // Habilita o CORS para todas as rotas
app.use(express.json()); // <-- Necessário para ler JSON do corpo da requisição

const fs = require('fs'); // Módulo nativo para manipulação de pastas


const createUploadDirectory = (dir) => { // Função para criar o diretório de upload, se ele não existir.
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Diretório ${dir} criado automaticamente.`);
    }
};

const fileFilter = (req, file, cb) => { // Função para validar o tipo de arquivo (fileFilter).
    // Permite apenas JPG ou PNG.
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true); 
    } else {
        cb(new Error('Tipo de arquivo inválido. Apenas JPG e PNG são permitidos.'), false);
    }
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB em bytes

app.get('/', (req,res) => {
    res.send(('Servidor de upload funcionando'));
});

app.get('/register', (req,res) => {
    return res.json
});

// Rota de cadastro
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body || {};
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'username, email e password são obrigatórios.' });
        }

        const existente = findByUsername(username);
        if (existente) {
            return res.status(400).json({ message: 'Usuário já existe.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const novoUsuario = addUser({ username, email, passwordHash });

        return res.status(201).json({
            message: 'Usuário cadastrado com sucesso.',
            user: { id: novoUsuario.id, username: novoUsuario.username, email: novoUsuario.email }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.listen(port, ()=> {
    console.log(`Servidor esta rodando na porta: ${port}`);
});

const storage = multer.diskStorage({
    destination: function(req,file,cd){
        const uploadDiretorio = 'uploads/';
        createUploadDirectory(uploadDiretorio); // <--- Chamada para verificar/criar pasta
        cd(null, uploadDiretorio); // <--- Usa a constante local 'uploadDir'
    },
    filename: function(req,file,cd){
        cd(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: fileFilter, // <--- Aplica o filtro de tipo
    limits: {              // <--- Aplica os limites de tamanho e quantidade
        fileSize: MAX_FILE_SIZE, 
        files: 10 
    }
});

app.post('/upload', (req, res) => {
    
    upload.array('meusArquivos', 10)(req, res, function (err) { // Chama 'upload.single' (Middleware) e passa uma função de callback (err)
        
        if (err instanceof multer.MulterError) { // Verifica se o erro é uma instância de erro do Multer (limits)
            return res.status(400).json({ 
                message: `Erro do Multer: ${err.code}.`,
                detail: "Verifique o tamanho ou a quantidade de arquivos."
            });
        } 
        
        if (err) { // Captura o erro customizado do fileFilter ou outros erros genéricos.
            return res.status(400).json({ message: err.message });
        }

        
        if (!req.files || req.files.length === 0){ // Lógica de Sucesso
            return res.status(400).json({ message: 'Nenhum arquivo enviado' });
        }

        res.json({
            message: `Arquivos enviados com sucesso: ${req.files.map(file => file.filename).join(', ')}`,
            fileCount: req.files.length
        });
    });
});