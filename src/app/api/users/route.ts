import { ConfidentialClientApplication } from "@azure/msal-node";
import { NextResponse } from "next/server";
import { getDbConnection } from "../../../config/dbConfig";

// Configuração do MSAL para autenticação com Azure
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  },
};

const app = new ConfidentialClientApplication(msalConfig);

// Função para adquirir o token de acesso do Azure
export const acquireToken = async () => {
  try {
    const response = await app.acquireTokenByClientCredential({
      scopes: [`${process.env.AZURE_RESOURCE_API}/.default`],
    });
    console.log("Token adquirido:", response.accessToken);
    return response.accessToken;
  } catch (error) {
    console.error("Erro ao adquirir token:", error);
    console.error("Detalhes do erro:", error.response);
    throw new Error("Falha na autenticação com o Azure");
  }
};

// Função para buscar todos os usuários no banco de dados
export async function GET() {
  try {
    // Adquire o token de acesso
    const accessToken = await acquireToken();

    // Verificando a validade do token
    if (!accessToken) {
      throw new Error("Token de acesso inválido");
    }

    // Conecta ao banco de dados
    const pool = await getDbConnection();

    // Realiza a consulta SQL para buscar os usuários
    const result = await pool.request().query(`
      SELECT 
        u.USERNAME AS id,
        u.EMAIL AS email,
        u.NOME AS nome,
        u.ANONASCIMENTO AS anoNascimento,
        u.AVATAR AS avatar,
        JSON_QUERY(REPLACE(p.IMGS, '\\', '')) AS avatarIcone,
        STRING_AGG(cu.ID_CONQUISTA, ', ') AS conquistas,
        STRING_AGG(a.ID_AMIGO, ', ') AS friends,
        (
          SELECT 
            SUM(CASE WHEN rc.CATEGORIA = 'Páginas' THEN rj.score ELSE 0 END) AS Páginas,
            SUM(CASE WHEN rc.CATEGORIA = 'Sequências' THEN rj.score ELSE 0 END) AS Sequências,
            SUM(CASE WHEN rc.CATEGORIA = 'Missões' THEN rj.score ELSE 0 END) AS Missões,
            SUM(CASE WHEN rc.CATEGORIA = 'Livros' THEN rj.score ELSE 0 END) AS Livros,
            (SELECT COUNT(*) FROM AMIGOS a WHERE a.ID_USER = u.USERNAME) AS Amigos,
            (SELECT COUNT(*) FROM USER_ACAO ua WHERE ua.USERNAME = u.USERNAME) AS LoginsTotais
          FROM RankingJogadores rj
          JOIN RankingCategorias rc ON rj.ranking_categoria_id = rc.id 
          WHERE rj.USERNAME = u.USERNAME
          FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        ) AS avanco,
        STRING_AGG(m.TITLE, ', ') AS missoes
      FROM 
        USUARIO u
      JOIN 
        PERSONAGENS p ON u.AVATAR = p.NOME
      LEFT JOIN 
        CONQUISTAS_USUARIO cu ON cu.ID_USUARIO = u.USERNAME
      LEFT JOIN 
        AMIGOS a ON a.ID_USER = u.USERNAME
      LEFT JOIN 
        MISSOES m ON m.USERNAME = u.USERNAME
      LEFT JOIN 
        IMAGEM_USU iu ON iu.USERNAME = u.USERNAME
      LEFT JOIN 
        IMAGEM i ON i.ID = iu.ID_IMG
      GROUP BY 
        u.USERNAME, u.EMAIL, u.NOME, u.ANONASCIMENTO, u.AVATAR, p.IMGS;
    `);

    // Processar o resultado da consulta
    const processedResult = result.recordset.map(item => ({
      ...item,
      avatarIcone: item.avatarIcone ? JSON.parse(item.avatarIcone) : null,
      avanco: item.avanco ? JSON.parse(item.avanco) : null,
      friends: item.friends ? item.friends.split(', ') : [],
      missoes: item.missoes ? item.missoes.split(', ') : [],
    }));

    // Retornar os dados como resposta JSON
    return NextResponse.json(processedResult);

  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: 'Erro ao buscar os dados dos usuários' }, { status: 500 });
  }
}
