import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../config/dbConfig';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID da postagem não fornecido' }, { status: 400 });
    }

    const pool = await getDbConnection();

    const result = await pool.request()
      .input('id', id)
      .query(`
        SELECT * 
        FROM POSTAGEM 
        WHERE ID_POST = @id;
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Postagem não encontrada' }, { status: 404 });
    }

    const postagem = result.recordset[0];

    return NextResponse.json(postagem);

  } catch (error) {
    console.error('Erro ao buscar postagem:', error);
    return NextResponse.json({ error: 'Erro ao buscar a postagem' }, { status: 500 });
  }
}
