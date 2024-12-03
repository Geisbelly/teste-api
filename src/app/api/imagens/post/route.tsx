import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../config/dbConfig';

export async function POST(req: Request) {
    try {
      const body = await req.json();
  
      const { url } = body;
  
      const pool = await getDbConnection();
  
      await pool.request()
        .input('url', url)
        .query(`
          INSERT INTO IMAGEM (URL) 
          VALUES (@url);
        `);
  
      return NextResponse.json({ message: 'Imagem criada com sucesso' }, { status: 201 });
    } catch (error) {
      console.error('Erro ao criar imegam:', error);
      return NextResponse.json({ error: 'Erro ao criar imagem' }, { status: 500 });
    }
  }
  