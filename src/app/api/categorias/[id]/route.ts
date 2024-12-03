// src/pages/api/categorias/[id]/route.ts
import { NextResponse } from 'next/server';

interface Categoria{
  NOME: string,
  DESCRICAO: string
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'ID da categoria não fornecido' }, { status: 400 });
  }

  // Aqui você pode fazer a consulta à sua base de dados
  const categoria = await fetchCategoriaById(id);

  if (!categoria) {
    return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
  }

  return NextResponse.json(categoria);
}

// Função simulada para buscar a categoria
async function fetchCategoriaById(id: string) {
  try {
    // Aqui simulamos uma chamada para a API que retorna todas as categorias
    const response = await fetch(`https://api-verbix.vercel.app/api/categorias`);
    const categorias = await response.json();


    // Encontre a categoria que corresponde ao 'id'
    const categoria = categorias.find((categoria: Categoria) => categoria.NOME === id);

    return categoria;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return null;
  }
}
