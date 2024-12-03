import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../config/dbConfig';

export async function POST(req: Request) {
    try {
      const body = await req.json();
  
      const { title, descricao, meta } = body;
  
      const pool = await getDbConnection();
  
      // Insere o novo usekey no banco de dados
      await pool.request()
        .input('title', title)
        .input('descricao', descricao)
        .input('meta', meta)
        .query(`
          INSERT INTO CONQUISTAS (TITLE, DESCRICAO, MATE) 
          VALUES (@title, @descricao, @meta);
        `);
  
      return NextResponse.json({ message: 'Conquistas criada com sucesso' }, { status: 201 });
    } catch (error) {
      console.error('Erro ao criar conquista:', error);
      return NextResponse.json({ error: 'Erro ao criar conquista' }, { status: 500 });
    }
  }
  