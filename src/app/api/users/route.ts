// /app/api/getAllUsers/route.ts

import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../config/dbConfig';
import { acquireToken } from '../../../services/authAzure'; // Importa a função de autenticação

export async function GET() {
  try {
    // Adquire o token de autenticação do Azure
    const token = await acquireToken();

    // Verifica se o token foi obtido com sucesso
    if (!token) {
      return NextResponse.json({ error: 'Falha na autenticação com o Azure' }, { status: 401 });
    }

    const pool = await getDbConnection();

    const result = await pool.request().query(`
SELECT 
    u.USERNAME AS id,
    u.EMAIL AS email,
    u.NOME AS nome,
    u.ANONASCIMENTO AS anoNascimento,
    u.AVATAR AS avatar,
    -- Remover barras invertidas e converter o campo de imagem para um array
    JSON_QUERY(REPLACE(p.IMGS, '\\', '')) AS avatarIcone,
    -- Conquistas do usuário
    STRING_AGG(cu.ID_CONQUISTA, ', ') AS conquistas,
    -- Amigos do usuário
    STRING_AGG(a.ID_AMIGO, ', ') AS friends,
    -- Avanços do usuário nas categorias, incluindo Amigos e LoginsTotais
    (
      SELECT 
          SUM(CASE WHEN rc.CATEGORIA = 'Páginas' THEN rj.score ELSE 0 END) AS Páginas,
          SUM(CASE WHEN rc.CATEGORIA = 'Sequências' THEN rj.score ELSE 0 END) AS Sequências,
          SUM(CASE WHEN rc.CATEGORIA = 'Missões' THEN rj.score ELSE 0 END) AS Missões,
          SUM(CASE WHEN rc.CATEGORIA = 'Livros' THEN rj.score ELSE 0 END) AS Livros,
          -- Contagem de amigos e logins
          (SELECT COUNT(*) FROM AMIGOS a WHERE a.ID_USER = u.USERNAME) AS Amigos,
          (SELECT COUNT(*) FROM USER_ACAO ua WHERE ua.USERNAME = u.USERNAME) AS LoginsTotais
      FROM RankingJogadores rj
      JOIN RankingCategorias rc ON rj.ranking_categoria_id = rc.id 
      WHERE rj.USERNAME = u.USERNAME
      FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
    ) AS avanco,
    -- Missoes do usuário
    STRING_AGG(m.TITLE, ', ') AS missoes
FROM 
    USUARIO u
JOIN 
    PERSONAGENS p ON u.AVATAR = p.NOME
LEFT JOIN 
    CONQUISTAS_USUARIO cu ON cu.ID_USUARIO = u.USERNAME
LEFT JOIN 
    AMIGOS a ON a.ID_USER = u.USERNAME
LEFT JOIN 
    MISSOES m ON m.USERNAME = u.USERNAME
LEFT JOIN 
    IMAGEM_USU iu ON iu.USERNAME = u.USERNAME  -- Relacionamento com IMAGEM_USU
LEFT JOIN 
    IMAGEM i ON i.ID = iu.ID_IMG  -- Imagem relacionada
GROUP BY 
    u.USERNAME, u.EMAIL, u.NOME, u.ANONASCIMENTO, u.AVATAR, p.IMGS;
    `);

    // Processar para garantir que os valores sejam JSON corretos
    const processedResult = result.recordset.map(item => ({
      ...item,
      avatarIcone: (() => {
        try {
          return item.avatarIcone ? JSON.parse(item.avatarIcone) : null;
        } catch {
          return null;
        }
      })(),
      avanco: (() => {
        try {
          return item.avanco ? JSON.parse(item.avanco) : null;
        } catch {
          return null;
        }
      })(),
      friends: item.friends ? item.friends.split(', ') : [],
      missoes: item.missoes ? item.missoes.split(', ') : [],
    }));

    return NextResponse.json(processedResult); // Retorna os dados como JSON

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro ao buscar os dados dos usuários' }, { status: 500 });
  }
}
