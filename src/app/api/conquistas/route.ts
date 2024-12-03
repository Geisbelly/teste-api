// /app/api/getAllUsers/route.ts

import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../config/dbConfig';

export async function GET() {
  try {
    const pool = await getDbConnection();

    // Fazendo a consulta para pegar todas as conquistas
    const result = await pool.request().query(`
      SELECT * FROM CONQUISTAS
    `);

    // Retorna os dados como JSON
    return NextResponse.json(result.recordset);

  } catch (error) {
    console.error('Erro ao buscar conquistas:', error);
    return NextResponse.json({ error: 'Erro ao buscar os dados das conquistas' }, { status: 500 });
  }
}

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

    // Se já existir, retorna um erro
    if (existingConquest.recordset.length > 0) {
      console.warn(`Conquista com o título "${title}" já existe.`);
      return NextResponse.json({ error: 'Já existe uma conquista com este título' }, { status: 409 });
    }

    console.warn(`Conquista com o título "${title}" não existe. Iniciando criação...`);

    // Insere a nova conquista no banco de dados
    await pool.request()
      .input('title', title)
      .input('descricao', descricao)
      .input('meta', meta)
      .query(`
        INSERT INTO CONQUISTAS (TITLE, DESCRICAO, META) 
        VALUES (@title, @descricao, @meta);
      `);

    // Retorna uma mensagem de sucesso
    return NextResponse.json({ message: 'Conquista criada com sucesso' }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar conquista:', error);
    return NextResponse.json({ error: 'Erro ao criar conquista' }, { status: 500 });
  }
}
