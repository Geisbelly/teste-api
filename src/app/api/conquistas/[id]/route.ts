import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../config/dbConfig';

// Função GET para buscar a conquista pelo ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // O acesso ao `params` precisa ser feito de forma assíncrona
    const { id } = await params;

    // Verifica se o 'id' foi fornecido
    if (!id) {
      return NextResponse.json({ error: 'ID da conquista não fornecido' }, { status: 400 });
    }

    // Conexão com o banco de dados
    const pool = await getDbConnection();

    // Consulta no banco de dados para buscar a conquista com o 'id' fornecido
    const result = await pool.request()
      .input('id', id)
      .query(`
        SELECT * 
        FROM CONQUISTAS 
        WHERE ID = @id;
      `);

    // Verifica se a conquista foi encontrada
    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Conquista não encontrada' }, { status: 404 });
    }

    const postagem = result.recordset[0]; // Pega o primeiro resultado

    // Retorna a conquista como resposta
    return NextResponse.json(postagem);

  } catch (error) {
    // Caso haja erro no processo, retorna uma mensagem de erro
    console.error('Erro ao buscar conquista:', error);
    return NextResponse.json({ error: 'Erro ao buscar a conquista' }, { status: 500 });
  }
}
