import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../config/dbConfig';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url); // Criando uma instância da URL
    const nome = url.searchParams.get('NOME'); // Obtendo o parâmetro 'NOME'
    console.log('Parâmetro NOME:', nome); // Verificação no log
    console.log('URL:', url); // Verificação no log

    const pool = await getDbConnection();
    let query = 'SELECT * FROM PERSONAGENS';

    const request = pool.request();

    // Adiciona filtro se o parâmetro 'NOME' for fornecido
    if (nome) {
      query += ' WHERE NOME = @NOME';
      request.input('NOME', nome.trim());
    }

    console.log('Query Gerada:', query); // Verificação no log

    const result = await request.query(query);

    // Processar os resultados
    const processedResult = result.recordset.map(item => ({
      ...item,
      IMGS: JSON.parse(item.IMGS.replace(/\\/g, '')) // Tratando imagens no JSON
    }));

    console.log('Resultado Retornado:', processedResult); // Verificação no log

    return NextResponse.json(processedResult); // Retorna os dados filtrados

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return NextResponse.json({ error: 'Erro ao buscar os dados' }, { status: 500 });
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

    return NextResponse.json({ message: 'Personagem criado com sucesso' }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar personagem:', error);
    return NextResponse.json({ error: 'Erro ao criar personagem' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, nome, tipo, descricao, imgs } = body;

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('id', id)
      .input('nome', nome)
      .input('tipo', tipo)
      .input('descricao', descricao)
      .input('imgs', imgs)
      .query(`
        UPDATE PERSONAGENS 
        SET NOME = @nome, TIPO = @tipo, DESCRICAO = @descricao, IMGS = @imgs 
        WHERE ID = @id;
      `);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'Personagem não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Personagem atualizado com sucesso' }, { status: 200 });

  } catch (error) {
    console.error('Erro ao atualizar personagem:', error);
    return NextResponse.json({ error: 'Erro ao atualizar personagem' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('id', id)
      .query(`DELETE FROM PERSONAGENS WHERE ID = @id;`);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'Personagem não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Personagem excluído com sucesso' }, { status: 200 });

  } catch (error) {
    console.error('Erro ao excluir personagem:', error);
    return NextResponse.json({ error: 'Erro ao excluir personagem' }, { status: 500 });
  }
}
