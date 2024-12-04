import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../config/dbConfig';

// Função GET: Buscar todos os dados ou um específico com base no parâmetro NOME
export async function GET(req: Request) {
  try {
    // Obtendo o parâmetro 'NOME' diretamente da URL
    const url = new URL(req.url);  // Criando uma instância da URL
    const nome = url.searchParams.get('NOME');  // Obtendo o parâmetro 'NOME'
    console.log(url, nome)

    const pool = await getDbConnection();
    let query = 'SELECT * FROM PERSONAGENS';
    let params = {};

    if (nome) {
      query += ' WHERE NOME = @nome';
      params = { nome }; // Não é necessário converter, pois 'NOME' é string
    }

    const result = await pool.request().input('nome', params.nome).query(query);

    const processedResult = result.recordset.map(item => ({
      ...item,
      IMGS: JSON.parse(item.IMGS.replace(/\\/g, ''))
    }));

    return NextResponse.json(processedResult);

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return NextResponse.json({ error: 'Erro ao buscar os dados' }, { status: 500 });
  }
}

// Função POST: Criar novo dado
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

// Função PUT: Atualizar dado existente
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { nome, tipo, descricao, imgs } = body;

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('nome', nome)
      .input('tipo', tipo)
      .input('descricao', descricao)
      .input('imgs', imgs)
      .query(`
        UPDATE PERSONAGENS 
        SET TIPO = @tipo, DESCRICAO = @descricao, IMGS = @imgs 
        WHERE NOME = @nome;
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

// Função DELETE: Excluir dado
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { nome } = body;

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('nome', nome)
      .query(`DELETE FROM PERSONAGENS WHERE NOME = @nome;`);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'Personagem não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Personagem excluído com sucesso' }, { status: 200 });

  } catch (error) {
    console.error('Erro ao excluir personagem:', error);
    return NextResponse.json({ error: 'Erro ao excluir personagem' }, { status: 500 });
  }
}
