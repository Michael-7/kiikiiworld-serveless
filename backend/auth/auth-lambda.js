import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import jwt from 'jsonwebtoken';

const tableName = 'kiikiiworld-serverless-users-prd';

const client = new DynamoDBClient({ region: 'eu-central-1' });

// AWS Secret Manager Url
const SECRETS_ENDPOINT = `http://localhost:2773/secretsmanager/get?secretId=kiikiiworld-live`;

// TODO
// const CLIENT_URL = 'http://localhost:3000';
// const RP_ID = 'localhost';

const CLIENT_URL = ['https://kiikiiworld.com', 'https://www.kiikiiworld.com'];
const RP_ID = ['kiikiiworld.com', 'www.kiikiiworld.com'];

export const handler = async (event) => {
  console.log('* event: ', event);

  const domain = event.headers.origin.split('//')[1];

  if (
    event.httpMethod === 'GET' &&
    event.resource === '/register'
  ) {
    const username = event.queryStringParameters['username'];
    console.log(` - CREATE /REGISTER :: ${username} ----------------------------------------------------------`);
    return await register(username, domain);
  } else if (
    event.httpMethod === 'POST' &&
    event.resource === '/register'
  ) {
    console.log(` - CONFIRM /REGISTER ----------------------------------------------------------`);
    const getCookieContent = getCookie('regInfo', event.headers['Cookie']);
    console.log(` - CONFIRM /REGISTER :: ${getCookieContent.username} ----------------------------------------------------------`);
    return await registerVerify(JSON.parse(event.body), getCookieContent);
  } else if (
    event.httpMethod === 'GET' &&
    event.resource === '/login'
  ) {
    console.log(` - CREATE /LOGIN :: ${event.queryStringParameters['username']} ----------------------------------------------------------`);
    return await login(event.queryStringParameters['username'], domain);
  } else if (
    event.httpMethod === 'POST' &&
    event.resource === '/login'
  ) {
    const getCookieContent = getCookie('authInfo', event.headers['Cookie']);
    console.log(JSON.stringify(getCookieContent));
    console.log(` - CONFIRM /LOGIN :: ${getCookieContent.username} ----------------------------------------------------------`);
    return await loginVerify(JSON.parse(event.body), getCookieContent);
  }

  return generateResponse('SKIPPED');
};

async function register(username, domain) {
  if (!username) {
    return generateResponse('Username is required', 400);
  }

  const options = await generateRegistrationOptions({
    rpID: domain,
    rpName: 'kiikii world',
    userName: username,
  });

  const cookieJson = encodeURIComponent(JSON.stringify({
    userId: options.user.id,
    username,
    challenge: options.challenge,
  }));

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `regInfo=${cookieJson}; HttpOnly; Max-Age=600000; Secure; Path=/; SameSite=Strict`,
    },
    body: JSON.stringify(options),
  };
}

async function registerVerify(body, cookie) {
  if (!cookie) {
    return generateResponse('Registration info not found', 400);
  }

  try {
    console.log('COOKIE: ', cookie);

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: cookie.challenge,
      expectedOrigin: CLIENT_URL,
      expectedRPID: RP_ID,
    });

    if (!verification.verified) {
      throw new Error('something went wrong');
    }

    const user = await getUser(cookie.username);
    if (user) {
      throw new Error('User already exists');
    }

    await createUser(cookie.username, {
      role: 'USER',
      keys: [
        {
          id: verification.registrationInfo.credential.id,
          publicKey: verification.registrationInfo.credential.publicKey,
          counter: verification.registrationInfo.credential.counter,
          deviceType: verification.registrationInfo.credentialDeviceType,
          backedUp: verification.registrationInfo.credentialBackedUp,
          transports: body.response.transports,
        },
      ],
    });

    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': `regInfo=deleted; HttpOnly; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; Secure; SameSite=Strict`,
      },
      body: `${cookie.username} has been verified`,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 400,
      headers: {
        'Set-Cookie': `regInfo=deleted; HttpOnly; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; Secure; SameSite=Strict`,
      },
      body: `Looks like something went wrong...`,
    };
  }
}

async function login(username, domain) {
  // GET USER BY USERNAME
  const userPassKey = await getUser(username);

  const options = await generateAuthenticationOptions({
    rpID: domain,
    allowCredentials: userPassKey.keys.map(passkey => ({
      id: passkey.id,
      type: 'public-key',
      transport: passkey.transports,
    })),
  });

  const authJson = encodeURIComponent(JSON.stringify({
    // userId: userPassKey.keys[0].id,
    username: username,
    challenge: options.challenge,
  }));

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `authInfo=${authJson}; HttpOnly; Max-Age=60000; Path=/; Secure; SameSite=Strict`,
    },
    body: JSON.stringify(options),
  };
}

async function loginVerify(body, cookie) {
  if (!cookie) {
    return generateResponse('User info not found', 400);
  }

  console.log('get user');
  // GET USER BY USERNAME
  const user = await getUser(cookie.username);
  const userPassKey = user.keys.find(key => key.id === body.id);
  console.log('Passkey: ', userPassKey);

  console.log('get verification');
  const publicKey = new Uint8Array(Object.values(userPassKey.publicKey));
  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge: cookie.challenge,
    expectedOrigin: CLIENT_URL,
    expectedRPID: RP_ID,
    credential: {
      id: userPassKey.id,
      publicKey,
      counter: userPassKey.counter,
      transports: userPassKey.transports,
    },
  });

  if (verification.verified) {
    // TODO: UPDATE USER COUNTER
    console.log('build tokens');

    const secretKey = await getSecret();
    const payload = {
      username: cookie.username,
      role: user.role, // I set the role manually in the db
    };

    const token = jwt.sign(payload, secretKey, { expiresIn: '12h' });

    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': `authInfo=deleted; HttpOnly; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; Secure; SameSite=Strict`,
      },
      // body: `${cookie.username} has been verified`,
      body: JSON.stringify({
        message: `${cookie.username} has been verified`,
        token,
      }),
    };
  } else {
    return {
      statusCode: 400,
      headers: {
        'Set-Cookie': `authInfo=deleted; HttpOnly; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; Secure; SameSite=Strict`,
      },
      body: `Login failed`,
    };
  }
}

async function createUser(username, data) {
  const putUser = new PutItemCommand({
    TableName: tableName,
    Item: {
      Username: {
        S: username,
      },
      Data: {
        S: JSON.stringify(data),
      },
    },
  });

  return await sendCommand(putUser);
}

async function getUser(username) {
  const queryCmd = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: 'Username = :pk',
    ExpressionAttributeValues: {
      ':pk': {
        S: username,
      },
    },
  });

  const user = await sendCommand(queryCmd);
  if (user.Count === 0) {
    return undefined;
  } else {
    return JSON.parse(user.Items[0].Data.S);
  }
}

async function sendCommand(command) {
  try {
    return await client.send(command);
  } catch (err) {
    console.log('error', err);
  }
}

function getCookie(id, cookie) {
  console.log('--------------------------  COoKEI ------------');
  console.log(cookie);
  const returnCookieArray = cookie.split(';');
  console.log(returnCookieArray);
  const returnCookieFull = returnCookieArray.find(cook => cook.split('=')[0].includes(id));
  console.log(returnCookieFull);
  const returnCookie = returnCookieFull.split('=')[1];

  return JSON.parse(decodeURIComponent(returnCookie));
}

function generateResponse(responseMessage, code = 200) {
  return {
    statusCode: code,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: responseMessage,
    }),
  };
}

// TODO: Share this function with auth-middleware-lambda.js
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
