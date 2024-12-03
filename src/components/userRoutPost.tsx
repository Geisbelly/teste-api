const criarUsuario = async () => {
    // Dados do usuário
    const body = {
        username: 'exemplo', // O 'usekey' que será criado
        email: 'exemplo@dominio.com',
        chave: 'chave_aleatoria_123', // A chave que será associada
      };
      
      const res = await fetch('/api/chaves_keys_users_points/acess/post/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
  };
  
  // Exemplo de como chamar a função (por exemplo, ao clicar em um botão)
export default  criarUsuario;
  