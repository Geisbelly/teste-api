import { NextResponse } from 'next/server';
import { NextApiRequest } from 'next';
import { getDbConnection } from '../../../../../config/dbConfig';

type Params = {
  id: string;
};

export async function GET(request: NextApiRequest, { params }: { params: Params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID do user não fornecido' }, { status: 400 });
    }

    const pool = await getDbConnection();

    const result = await pool.request()
      .input('id', id)
      .query(`
        SELECT * 
        FROM USEKEY 
        WHERE USERNAME = @id;
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'user não encontrada' }, { status: 404 });
    }

    const postagem = result.recordset[0];

    return NextResponse.json(postagem);

  } catch (error) {
    console.error('Erro ao buscar user:', error);
    return NextResponse.json({ error: 'Erro ao buscar user' }, { status: 500 });
  }
}
