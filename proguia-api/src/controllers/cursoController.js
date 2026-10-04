const { mssql, poolPromise } = require('../config/database');

exports.listarCursos = async (req, res) => {
  try {
    const { busca, gratuito } = req.query;
    const pool = await poolPromise;
    const request = pool.request();

    let query = 'SELECT id, titulo, descricao, categoria, link_curso, gratuito, instituicao FROM cursos WHERE 1=1';

    if (busca) {
      request.input('busca', mssql.VarChar(100), `%${busca}%`);
      query += ' AND (titulo LIKE @busca OR descricao LIKE @busca)';
    }

    if (gratuito !== undefined) {
      const eGratuito = gratuito === 'true' || gratuito === '1';
      request.input('gratuito', mssql.Bit, eGratuito ? 1 : 0);
      query += ' AND gratuito = @gratuito';
    }

    query += ' ORDER BY id DESC';

    const result = await request.query(query);

    return res.status(200).json({
      total: result.recordset.length,
      cursos: result.recordset
    });

  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    return res.status(500).json({
      erro: 'Erro interno ao consultar catálogo de cursos.'
    });
  }
};
