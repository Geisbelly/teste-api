import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../config/dbConfig';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID da categoria não fornecido' }, { status: 400 });
    }

    const pool = await getDbConnection();

    const result = await pool.request()
      .input('id', id)
      .query(`
        SELECT * 
        FROM CATEGORIA
        WHERE NOME = @id;
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    const categoria = result.recordset[0];

    return NextResponse.json(categoria);

  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return NextResponse.json({ error: 'Erro ao buscar a categoria' }, { status: 500 });
  }
}
