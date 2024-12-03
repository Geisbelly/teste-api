import sql from 'mssql';

const dbConfig = {
  user: process.env.DB_USER || '', // Defina as variáveis no Vercel
  password: process.env.DB_PASSWORD || '',
  server: process.env.DB_SERVER || '',
  database: process.env.DB_DATABASE || '',
  options: {
    encrypt: true, // Necessário para Azure
    trustServerCertificate: true, // Pode ser necessário para evitar problemas de certificado
    connectionTimeout: 60000, // Timeout de conexão para garantir que não falhe facilmente
    responseLimit: '18mb', // Ajuste para o limite de resposta se necessário
  },
};

// Verifica se as variáveis de ambiente estão corretamente configuradas
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
    console.error('Configuração do banco de dados está incompleta');
    throw new Error('Configuração do banco de dados está incompleta.');
  }

  try {
    console.log('Tentando conectar ao banco de dados...');
    const pool = await sql.connect(dbConfig);
    console.log('Conexão com o banco de dados estabelecida!');
    return pool;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    throw new Error('Falha na conexão com o banco de dados');
  }
};
