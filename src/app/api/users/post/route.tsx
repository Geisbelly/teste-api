import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../config/dbConfig';

export async function POST(req: Request) {
  try {
    const body = await req.json(); // Pega os dados enviados no corpo da requisição

    // Validação dos dados
    if (!body.username || !body.email || !body.nome || !body.anonascimento || !body.avatar || !body.usekey) {
      return NextResponse.json({ error: 'Username, Email, Nome, AnoNascimento, Avatar e UseKey são obrigatórios' }, { status: 400 });
    }

    const { username, email, nome, anonascimento, avatar, usekey } = body;

    const pool = await getDbConnection();

    // Verifica se o usekey existe no banco de dados
    const usekeyCheck = await pool.request()
      .input('usekey', usekey)
      .query(`
        SELECT * FROM USEKEY WHERE USERNAME = @usekey;
      `);

    // Se o usekey não existir, retorna erro
    if (usekeyCheck.recordset.length === 0) {
      return NextResponse.json({ error: 'Chave não encontrada' }, { status: 404 });
    }

    // Verifica se o username ou email já existem no banco de dados
    const checkExistence = await pool.request()
      .input('username', username)
      .input('email', email)
      .query(`
        SELECT * FROM USUARIO WHERE USERNAME = @username OR EMAIL = @email;
      `);

    // Se o username ou email já existirem, retorna erro
    if (checkExistence.recordset.length > 0) {
      return NextResponse.json({ error: 'Username ou Email já existe' }, { status: 409 });
    }

    // Insere o novo usekey no banco de dados
    await pool.request()
      .input('username', username)
      .input('email', email)
      .input('chave', usekey)
      .query(`
        INSERT INTO USEKEY (USERNAME, EMAIL, CHAVE) 
        VALUES (@username, @email, @chave);
      `);

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

    // Retornar uma resposta JSON bem-sucedida
    return NextResponse.json({ message: 'Usuário e chave criados com sucesso' }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar usuário e usekey:', error);
    // Garantir que sempre retorne um corpo JSON
    return NextResponse.json({ error: 'Erro ao criar usuário e chave' }, { status: 500 });
  }
}
