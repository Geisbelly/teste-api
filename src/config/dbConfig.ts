import sql from 'mssql';

const dbConfig = {
  user: process.env.DB_USER || '', // Se não estiver definido, coloca um valor default
  password: process.env.DB_PASSWORD || '', // Se não estiver definido, coloca um valor default
  server: process.env.DB_SERVER || '', // Se não estiver definido, coloca um valor default
  database: process.env.DB_DATABASE || '', // Se não estiver definido, coloca um valor default
  options: {
    encrypt: true, // Necessário para o Azure
    trustServerCertificate: true,
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
