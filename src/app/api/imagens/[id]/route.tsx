import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../config/dbConfig';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID da imagem não fornecido' }, { status: 400 });
    }

    const pool = await getDbConnection();

    const result = await pool.request()
      .input('id', id)
      .query(`
        SELECT * 
        FROM IMAGEM 
        WHERE ID = @id;
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 });
    }

    const postagem = result.recordset[0];

    return NextResponse.json(postagem);

  } catch (error) {
    console.error('Erro ao buscar imagem:', error);
    return NextResponse.json({ error: 'Erro ao buscar a imagem' }, { status: 500 });
  }
}