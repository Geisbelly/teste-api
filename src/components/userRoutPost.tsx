const criarUsuario = async () => {
    // Dados do usuário
    const body = {
        username: 'exemplo',
        email: 'exemplo@dominio.com',
        nome: 'Novo Usuário',
        anonascimento: '2000-01-01',
        avatar: 'Erica',
      };
      
      fetch('/api/users/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Erro:', error));
      
  };
  
  // Exemplo de como chamar a função (por exemplo, ao clicar em um botão)
export default  criarUsuario;
  