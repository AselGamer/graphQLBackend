const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Configurar cliente de AWS
const dynamoDBClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  }
});

// Crear cliente de documento de DynamoDB para operaciones más sencillas
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

module.exports =  docClient;