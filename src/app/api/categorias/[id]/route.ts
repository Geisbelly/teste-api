import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../config/dbConfig';

export async function GET(req: Request) {
  try {
    const reqUrl = new URL(req.url);
    const pathname = reqUrl.pathname; // Obtém '/api/categorias/Livros'
    const lastPart = pathname.split('/').pop(); // Extrai 'Livros'
    const id = lastPart;

    if (!id) {
      return NextResponse.json(
        { error: 'Slug não fornecido' },
        { status: 400 }
      );
    }

    const pool = await getDbConnection();

    const result = await pool
      .request()
      .input('id', id)
      .query(`
        SELECT * 
        FROM CATEGORIA
        WHERE NOME = @id;
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    const categoria = result.recordset[0];

    return NextResponse.json(categoria);
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar a categoria' },
      { status: 500 }
    );
  }
}
