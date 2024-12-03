import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../config/dbConfig';

export async function POST(req: Request) {
    try {
      const body = await req.json();
  
      const { dt, title, descricao, username } = body;
  
      const pool = await getDbConnection();
  
      // Insere o novo usekey no banco de dados
      await pool.request()
        .input('dt', dt)
        .input('title', title)
        .input('descricao', descricao)
        .input('username', username)
        .query(`
          INSERT INTO POSTAGEM (DT, TITLE, DESCRICAO,USERNAME) 
          VALUES (@dt, @title, @descricao, @username);
        `);
  
      return NextResponse.json({ message: 'Postagem criada com sucesso' }, { status: 201 });
    } catch (error) {
      console.error('Erro ao criar postagem:', error);
      return NextResponse.json({ error: 'Erro ao postar' }, { status: 500 });
    }
  }
  