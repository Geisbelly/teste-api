import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../config/dbConfig';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, descricao, meta } = body;

    const pool = await getDbConnection();

    // Verifica se já existe uma conquista com o mesmo título
    const existingConquest = await pool.request()
      .input('title', title)
      .query(`
        SELECT * FROM CONQUISTAS WHERE TITLE = @title;
      `);

      console.warn(existingConquest)
    // Se já existir, retorna um erro
    if (existingConquest.recordset.length > 0) {
      return NextResponse.json({ error: 'Já existe uma conquista com este título' }, { status: 409 });
    } else{
      console.warn('conquista não existe, iniciando criação..')
    }

    // Insere a nova conquista no banco de dados
    await pool.request()
      .input('title', title)
      .input('descricao', descricao)
      .input('meta', meta)
      .query(`
        INSERT INTO CONQUISTAS (TITLE, DESCRICAO, META) 
        VALUES (@title, @descricao, @meta);
      `);

    return NextResponse.json({ message: 'Conquista criada com sucesso' }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar conquista:', error);
    return NextResponse.json({ error: 'Erro ao criar conquista' }, { status: 500 });
  }
}
