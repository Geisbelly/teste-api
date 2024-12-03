'use client'
import createConquista from '../components/userRoutPost'

export default function Home() {

  return (
    <div>
      <button onClick={createConquista} className='align-center justify-center'>Clique</button>
    </div>
  );
}
