import jwt from 'jsonwebtoken';

// DOCS:
// https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-lambda-authorizer.html
// https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html

export const handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));

  const token = event.headers.authorization; // Get the token from the request
  const role = process.env.role; // role depends on environment variable set in AWS
// TODO: Get key from AWS Secrets Manager
  const secretKey = 'somerandomkey'; // Store this securely

  try {
    var decoded = jwt.verify(token, secretKey);

    return {
      isAuthorized: decoded.role === role,
    };
  } catch (err) {
    console.log(err);
    context.fail('Unauthorized');
  }
};
