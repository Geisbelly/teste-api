// Dados a serem enviados no corpo da requisição
const data = {
  title: 'Teste Conquista',
  descricao: 'Descrição da nova conquista',
  meta: 100
};

// Função para fazer o POST para o endpoint
async function createConquista() {
  try {
    // Enviar a requisição POST
    const response = await fetch('https://api-verbix.vercel.app/api/conquistas/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Indica que estamos enviando dados em JSON
      },
      body: JSON.stringify(data), // Convertendo o objeto JavaScript em JSON
    });

    // Verifica se a requisição foi bem-sucedida
    if (response.ok) {
      const result = await response.json(); // Recebe a resposta JSON
      console.log('Conquista criada:', result);
    } else {
      console.error('Erro na requisição:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Erro ao fazer requisição:', error);
  }
}

// Chama a função para criar a conquista
export default createConquista;
