const criarUsuario = async () => {
    // Dados do usuário
    const body = {
        title: 'Mestre Leitor',
        descricao: 'Leia 50 livros',
        meta: 50,
      };
      
      fetch('/api/conquistas/post', {
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
  