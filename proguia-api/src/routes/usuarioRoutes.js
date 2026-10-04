const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Rota 1: Cadastrar Usuário (POST /api/usuarios)
router.post('/usuarios', usuarioController.cadastrarUsuario);

// Rota 2: Login do Usuário (POST /api/login)
router.post('/login', usuarioController.loginUsuario);

module.exports = router;