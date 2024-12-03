// /app/api/getAllUsers/route.ts

import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../config/dbConfig';


export async function POST(req: Request) {
  try {
    // Pegando os dados enviados no corpo da requisição
    const body = await req.json();
    console.log('Corpo da requisição:', body);  // Log do corpo para depuração

    // Validação dos dados
    if (!body.username || !body.email || !body.nome || !body.anonascimento || !body.avatar ) {
      return NextResponse.json({ error: 'Username, Email, Nome, AnoNascimento e Avatar são obrigatórios' }, { status: 400 });
    }

    const { username, email, nome, anonascimento, avatar } = body;

    const pool = await getDbConnection();

    // Verifica se o usekey existe em USEKEY
    const usekeyCheck = await pool.request()
      .input('usekey', username)
      .query(`
        SELECT * FROM USEKEY WHERE USERNAME = @usekey;
      `);

    // Se o usekey não existir, retorna erro
    if (usekeyCheck.recordset.length === 0) {
      return NextResponse.json({ error: 'Chave não encontrada' }, { status: 404 });
    }

    // Verifica se o username já existe em USEKEY mas não existe em USUARIO
    const checkExistence = await pool.request()
      .input('username', username)
      .input('email', email)
      .query(`
        SELECT * FROM USEKEY WHERE USERNAME = @username;
      `);

    // Se o username já existe em USEKEY, mas não existe em USUARIO
    if (checkExistence.recordset.length > 0) {
      // Verificar se o email já existe em USUARIO
      const emailCheck = await pool.request()
        .input('email', email)
        .query(`
          SELECT * FROM USUARIO WHERE EMAIL = @email;
        `);

      if (emailCheck.recordset.length > 0) {
        return NextResponse.json({ error: 'Email já existe em USUARIO' }, { status: 409 });
      }

      // Insere o novo usuário no banco de dados, associando ao usekey
      await pool.request()
        .input('username', username)
        .input('email', email)
        .input('nome', nome)
        .input('anonascimento', anonascimento)
        .input('avatar', avatar)
        .query(`
          INSERT INTO USUARIO (USERNAME, EMAIL, NOME, ANONASCIMENTO, AVATAR) 
          VALUES (@username, @email, @nome, @anonascimento, @avatar);
        `);

      // Retorna uma resposta JSON bem-sucedida
      return NextResponse.json({ message: 'Usuário criado com sucesso' }, { status: 201 });

    } else {
      // Se o username não existe em USEKEY, retorna erro
      return NextResponse.json({ error: 'Chave não encontrada em USEKEY' }, { status: 404 });
    }

  } catch (error) {
    console.error('Erro ao criar usuário e chave:', error);
    return NextResponse.json({ error: 'Erro ao criar usuário e chave' }, { status: 500 });
  }
}


export async function GET() {
  try {
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
      avatarIcone: item.avatarIcone ? JSON.parse(item.avatarIcone) : null,
      avanco: item.avanco ? JSON.parse(item.avanco) : null,
      friends: item.friends ? item.friends.split(', ') : [],
      missoes: item.missoes ? item.missoes.split(', ') : []
    }));

    return NextResponse.json(processedResult);  // Retorna os dados como JSON

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro ao buscar os dados dos usuários' }, { status: 500 });
  }
}

