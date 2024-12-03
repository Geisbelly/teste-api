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
    const response = await fetch('https://api-verbix.vercel.app/api/conquistas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Indica que estamos enviando dados em JSON
      },
      body: JSON.stringify(data), // Convertendo o objeto JavaScript em JSON
    });

    const responseText = await response.text(); // Lê a resposta como texto para debugar
    if (response.ok) {
      let result = {};
      try {
        result = JSON.parse(responseText); // Tenta fazer o parse manualmente
      } catch (e) {
        console.error('Erro ao parsear JSON:', e);
      }
      console.log('Conquista criada:', result);
    } else {
      console.error('Erro na requisição:', response.status, response.statusText, responseText);
    }
  } catch (error) {
    console.error('Erro ao fazer requisição:', error);
  }
}

// Função para buscar todas as conquistas
async function getConquistas() {
  try {
    // Enviar a requisição GET
    const response = await fetch('https://api-verbix.vercel.app/api/conquistas', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    if (response.ok) {
      let result = {};
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Erro ao parsear JSON:', e);
      }
      console.log('Conquistas:', result);
    } else {
      console.error('Erro na requisição:', response.status, response.statusText, responseText);
    }
  } catch (error) {
    console.error('Erro ao fazer requisição:', error);
  }
}

// Chama a função para criar a conquista
export default createConquista;
