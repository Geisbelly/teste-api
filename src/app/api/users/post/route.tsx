// /app/api/posts/user/route.ts
import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../config/dbConfig';

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
