// /app/api/getAllUsers/route.ts

import { NextResponse } from 'next/server';
import { getDbConnection } from '../../config/dbConfig';

export async function GET() {
  try {
    const pool = await getDbConnection();

    const result = await pool.request().query(`
        SELECT 
        (SELECT * FROM CONQUISTAS FOR JSON PATH) AS CONQUISTAS,
        (SELECT * FROM MISSOES FOR JSON PATH) AS MISSOES,
        (SELECT * FROM USUARIO FOR JSON PATH) AS USUARIO,
        (SELECT * FROM IMAGEM FOR JSON PATH) AS IMAGEM,
        (SELECT * FROM IMAGEM_USU FOR JSON PATH) AS IMAGEM_USU,
        (SELECT * FROM IMAGEM_CONQUISTA FOR JSON PATH) AS IMAGEM_CONQUISTA,
        (SELECT * FROM IMAGEM_MISSAO FOR JSON PATH) AS IMAGEM_MISSAO,
        (SELECT * FROM CATEGORIA FOR JSON PATH) AS CATEGORIA,
        (SELECT * FROM ACAO FOR JSON PATH) AS ACAO,
        (SELECT * FROM USER_ACAO FOR JSON PATH) AS USER_ACAO,
        (SELECT * FROM TIPOREACAO FOR JSON PATH) AS TIPOREACAO,
        (SELECT * FROM IMAGEM_TIPOREACAO FOR JSON PATH) AS IMAGEM_TIPOREACAO,
        (SELECT * FROM POSTAGEM FOR JSON PATH) AS POSTAGEM,
        (SELECT * FROM REACAO FOR JSON PATH) AS REACAO,
        (SELECT * FROM IMAGEM_POSTAGEM FOR JSON PATH) AS IMAGEM_POSTAGEM,
        (SELECT * FROM AMIGOS FOR JSON PATH) AS AMIGOS,
        (SELECT * FROM PERSONAGENS FOR JSON PATH) AS PERSONAGENS,
        (SELECT * FROM RankingCategorias FOR JSON PATH) AS RankingCategorias,
        (SELECT * FROM RankingJogadores FOR JSON PATH) AS RankingJogadores,
        (SELECT * FROM CONQUISTAS_USUARIO FOR JSON PATH) AS CONQUISTAS_USUARIO; `);

    return NextResponse.json(result.recordset);  // Retorna os dados como JSON

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro ao buscar os dados dos usuários' }, { status: 500 });
  }
}
