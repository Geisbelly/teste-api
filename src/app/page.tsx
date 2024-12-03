'use client'
import criarUsuario from '../components/userRoutPost'

export default function Home() {

  return (
    <div>
      <button onClick={criarUsuario} className='w-4 h-4'>Clique</button>
    </div>
  );
}
