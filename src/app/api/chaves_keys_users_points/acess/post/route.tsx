import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../../config/dbConfig';

export async function POST(req: Request) {
    try {
      const body = await req.json();
  
      const { username, email, chave } = body;
  
      const pool = await getDbConnection();
  
      // Insere o novo usekey no banco de dados
      await pool.request()
        .input('username', username)
        .input('email', email)
        .input('chave', chave)
        .query(`
          INSERT INTO USEKEY (USERNAME, EMAIL, CHAVE) 
          VALUES (@username, @email, @chave);
        `);
  
      return NextResponse.json({ message: 'Chave criada com sucesso' }, { status: 201 });
    } catch (error) {
      console.error('Erro ao criar chave:', error);
      return NextResponse.json({ error: 'Erro ao criar chave' }, { status: 500 });
    }
  }
  