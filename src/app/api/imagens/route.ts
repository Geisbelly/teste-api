// /app/api/getAllUsers/route.ts

import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../config/dbConfig';

export async function GET() {
  try {
    const pool = await getDbConnection();

    const result = await pool.request().query(`SELECT * FROM IMAGEM;`);

    // Processar o resultado para remover as barras invertidas na string
    const processedResult = result.recordset.map(item => ({
      ...item,
      // Remover barras invertidas diretamente
      URL: item.URL.replace(/\\/g, '')
    }));

    return NextResponse.json(processedResult);  // Retorna os dados como JSON

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro ao buscar os dados dos usuários' }, { status: 500 });
  }
}
