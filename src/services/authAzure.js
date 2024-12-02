import { ConfidentialClientApplication } from "@azure/msal-node";

const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  },
};

const app = new ConfidentialClientApplication(msalConfig);

export const acquireToken = async () => {
  try {
    const response = await app.acquireTokenByClientCredential({
      scopes: [process.env.AZURE_RESOURCE_API + "/.default"],
    });
    console.log("Token adquirido:", response.accessToken);
    return response.accessToken;
  } catch (error) {
    console.error("Erro ao adquirir token:", error);
    throw new Error("Falha na autenticação com o Azure");
  }
};
