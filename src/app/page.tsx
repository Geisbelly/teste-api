'use client'
import criarUsuario from '../components/userRoutPost'

export default function Home() {

  return (
    <div>
      <button onClick={criarUsuario} className='align-center justify-center'>Clique</button>
    </div>
  );
}
