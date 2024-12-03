// /app/api/getAllUsers/route.ts

import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../config/dbConfig';

export async function GET() {
  try {
    const pool = await getDbConnection();

    const result = await pool.request().query(`
SELECT *
FROM PERSONAGENS;`);

    // Processar o resultado para remover as barras invertidas da string JSON
    const processedResult = result.recordset.map(item => ({
      ...item,
      // Usar JSON.parse e JSON.stringify para limpar as barras invertidas
      IMGS: JSON.parse(item.IMGS.replace(/\\/g, ''))
    }));

    return NextResponse.json(processedResult);  // Retorna os dados como JSON

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro ao buscar os dados dos usuários' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { nome, tipo, descricao, imgs } = body;

    const pool = await getDbConnection();

    await pool.request()
      .input('nome', nome)
      .input('tipo', tipo)
      .input('descricao', descricao)
      .input('imgs', imgs)
      .query(`
        INSERT INTO PERSONAGENS (NOME, TIPO, DESCRICAO, IMGS) 
        VALUES (@nome, @tipo, @descricao, @imgs);
      `);

    return NextResponse.json({ message: 'Personagens criada com sucesso' }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar personagem:', error);
    return NextResponse.json({ error: 'Erro ao criar personagem' }, { status: 500 });
  }
}