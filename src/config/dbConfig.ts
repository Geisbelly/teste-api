import sql from 'mssql';

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    // Adicione o limite de conexões se necessário
    connectionTimeout: 30000, // Tempo de timeout da conexão em milissegundos
  },
};


// Função para garantir que todas as variáveis estejam definidas
const isDbConfigValid = () => {
  return (
    dbConfig.user !== '' &&
    dbConfig.password !== '' &&
    dbConfig.server !== '' &&
    dbConfig.database !== ''
  );
};

export const getDbConnection = async () => {
  if (!isDbConfigValid()) {
    throw new Error('Configuração do banco de dados está incompleta.');
  }

  try {
    const pool = await sql.connect(dbConfig); // Agora, todas as variáveis de ambiente estão garantidamente definidas
    return pool;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    throw new Error('Falha na conexão com o banco de dados');
  }
};
