import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../config/dbConfig';

export async function POST(req: Request) {
    try {
      const body = await req.json();
  
      const { username, title, tipo, meta, dtinicio, dtfim, userprogresso} = body;
  
      const pool = await getDbConnection();
  
      await pool.request()
        .input('username', username)
        .input('title', title)
        .input('tipo', tipo)
        .input('meta', meta)
        .input('dtinicio', dtinicio)
        .input('dtfim', dtfim)
        .input('userprogresso', userprogresso)
        .query(`
          INSERT INTO MISSOES (USERNAME, TITLE, TIPO, META, DTINICIO, DTFIM, USERPROGRESSO) 
          VALUES (@username, title, @tipo, @meta, @dtinicio, @dtfim, @userprogresso);
        `);
  
      return NextResponse.json({ message: 'Missão criada com sucesso' }, { status: 201 });
    } catch (error) {
      console.error('Erro ao criar missão:', error);
      return NextResponse.json({ error: 'Erro ao criar missão' }, { status: 500 });
    }
  }
  