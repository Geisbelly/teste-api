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
