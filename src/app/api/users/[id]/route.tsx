// src/app/api/users/[id]/route.ts

import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../config/dbConfig';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 });
    }

    const pool = await getDbConnection();

    const result = await pool.request()
      .input('id', id)
      .query(`
        SELECT 
            u.USERNAME AS id,
            u.EMAIL AS email,
            u.NOME AS nome,
            u.ANONASCIMENTO AS anoNascimento,
            u.AVATAR AS avatar,
            JSON_QUERY(REPLACE(p.IMGS, '\\', '')) AS avatarIcone,
            STRING_AGG(cu.ID_CONQUISTA, ', ') AS conquistas,
            STRING_AGG(a.ID_AMIGO, ', ') AS friends,
            (
              SELECT 
                  SUM(CASE WHEN rc.CATEGORIA = 'Páginas' THEN rj.score ELSE 0 END) AS Páginas,
                  SUM(CASE WHEN rc.CATEGORIA = 'Sequências' THEN rj.score ELSE 0 END) AS Sequências,
                  SUM(CASE WHEN rc.CATEGORIA = 'Missões' THEN rj.score ELSE 0 END) AS Missões,
                  SUM(CASE WHEN rc.CATEGORIA = 'Livros' THEN rj.score ELSE 0 END) AS Livros,
                  (SELECT COUNT(*) FROM AMIGOS a WHERE a.ID_USER = u.USERNAME) AS Amigos,
                  (SELECT COUNT(*) FROM USER_ACAO ua WHERE ua.USERNAME = u.USERNAME) AS LoginsTotais
              FROM RankingJogadores rj
              JOIN RankingCategorias rc ON rj.ranking_categoria_id = rc.id 
              WHERE rj.USERNAME = u.USERNAME
              FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            ) AS avanco,
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
        WHERE 
            u.USERNAME = @id
        GROUP BY 
            u.USERNAME, u.EMAIL, u.NOME, u.ANONASCIMENTO, u.AVATAR, p.IMGS;
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const user = result.recordset[0];

    const processedUser = {
      ...user,
      avatarIcone: user.avatarIcone ? JSON.parse(user.avatarIcone) : null,
      avanco: user.avanco ? JSON.parse(user.avanco) : null,
      friends: user.friends ? user.friends.split(', ') : [],
      missoes: user.missoes ? user.missoes.split(', ') : [],
    };

    return NextResponse.json(processedUser);

  } catch (error) {
    console.error('Erro ao buscar o usuário:', error);
    return NextResponse.json({ error: 'Erro ao buscar o usuário' }, { status: 500 });
  }
}
