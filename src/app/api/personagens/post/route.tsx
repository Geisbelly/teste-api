import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../config/dbConfig';

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
  
      return NextResponse.json({ message: 'Personagens criada com sucesso' }, { status: 201 });
    } catch (error) {
      console.error('Erro ao criar personagem:', error);
      return NextResponse.json({ error: 'Erro ao criar personagem' }, { status: 500 });
    }
  }
  