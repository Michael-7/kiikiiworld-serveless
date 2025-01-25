import jwt from 'jsonwebtoken';

// DOCS:
// https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets_lambda.html
// https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-lambda-authorizer.html
// https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html

const SECRETS_ENDPOINT = `http://localhost:2773/secretsmanager/get?secretId=kiikiiworld-live`;

export const handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));

  const token = event.headers.authorization; // Get the token from the request
  const role = process.env.role; // role depends on environment variable set in AWS

  try {
    const secret = await getSecret();

    var decoded = jwt.verify(token, secret);

    return {
      isAuthorized: decoded.role === role,
    };
  } catch (err) {
    context.fail(`Unauthorized: ${err.message}`);

    return {
      isAuthorized: false,
    };
  }
};

// TODO: Share this function with auth-lambda.js
const getSecret = async () => {
  try {
    const response = await fetch(SECRETS_ENDPOINT, {
      method: 'GET',
      headers: {
        'X-Aws-Parameters-Secrets-Token': process.env.AWS_SESSION_TOKEN,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${errorText}`);
    }

    const data = await response.json();
    const secretString = JSON.parse(data.SecretString);
    return secretString.jwtSecret;
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }
};
