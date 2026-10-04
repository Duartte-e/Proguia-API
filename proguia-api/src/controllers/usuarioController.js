const sql = require('mssql');
const { poolPromise } = require('../config/database');
const bcrypt = require('bcrypt');

// 1. Cadastro de Usuário com novos campos
const cadastrarUsuario = async (req, res) => {
  try {
    const { nome, cpf, telefone, idade, email, senha } = req.body;

    // Validação dos campos obrigatórios
    if (!nome || !cpf || !telefone || !idade || !email || !senha) {
      return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios!' });
    }

    const pool = await poolPromise;

    // Verificar se o e-mail ou CPF já existem no banco
    const checkUser = await pool.request()
      .input('email', sql.VarChar, email)
      .input('cpf', sql.VarChar, cpf)
      .query('SELECT id FROM usuarios WHERE email = @email OR cpf = @cpf');

    if (checkUser.recordset.length > 0) {
      return res.status(409).json({ mensagem: 'E-mail ou CPF já cadastrado.' });
    }

    // Criptografar a senha
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // Inserir com as novas colunas
    const result = await pool.request()
      .input('nome', sql.VarChar, nome)
      .input('cpf', sql.VarChar, cpf)
      .input('telefone', sql.VarChar, telefone)
      .input('idade', sql.Int, parseInt(idade))
      .input('email', sql.VarChar, email)
      .input('senha', sql.VarChar, senhaHash)
      .query(`
        INSERT INTO usuarios (nome, cpf, telefone, idade, email, senha)
        OUTPUT INSERTED.id, INSERTED.nome, INSERTED.cpf, INSERTED.telefone, INSERTED.idade, INSERTED.email, INSERTED.criado_em
        VALUES (@nome, @cpf, @telefone, @idade, @email, @senha)
      `);

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario: result.recordset[0]
    });

  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

// 2. Login de Usuário
const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios!' });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT id, nome, email, senha FROM usuarios WHERE email = @email');

    const usuario = result.recordset[0];

    if (!usuario) {
      return res.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
    }

    res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });

  } catch (error) {
    console.error('Erro ao realizar login:', error);
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

module.exports = {
  cadastrarUsuario,
  loginUsuario
};