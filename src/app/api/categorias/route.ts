// /app/api/getAllUsers/route.ts

import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../config/dbConfig';

export async function GET() {
  try {
    const pool = await getDbConnection();

    const result = await pool.request().query(`
SELECT * from CATEGORIA `);

    return NextResponse.json(result.recordset);  // Retorna os dados como JSON

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro ao buscar os dados dos usuários' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { nome, descricao } = body;

    const pool = await getDbConnection();

    // Insere o novo usekey no banco de dados
    await pool.request()
      .input('nome', nome)
      .input('descricao', descricao)
      .query(`
        INSERT INTO CATEGORIA (NOME, DESCRICAO, CHAVE) 
        VALUES (@nome, @descricao);
      `);

    return NextResponse.json({ message: 'Categoria criada com sucesso' }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 });
  }
}