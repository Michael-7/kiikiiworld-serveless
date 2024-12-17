import Head from 'next/head';
import Nav from '@/components/nav/nav';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';

// https://www.youtube.com/watch?v=viZs1iVsLpA&t=439s
// https://www.youtube.com/watch?v=al5I9v5Y-kA&t=5s
// https://www.youtube.com/watch?v=7Q17ubqLfaM
// 4https://github.com/awslabs/aws-apigateway-lambda-authorizer-blueprints/blob/master/blueprints/nodejs/index.js

const APIURL = process.env.APIGATEWAY;

async function signup() {
  const username = 'opdelop43';

  // 1. Get challenge from server
  const response = await fetch(`${APIURL}/register?username=${username}`, {
    method: 'GET',
    credentials: 'include',
  });

  const options = await response.json();

  console.log('OPTIONST');
  console.log(options);

  // if (await options.challenge) {
  // 2. Create passkey
  try {
    const registrationJSON = await startRegistration({ optionsJSON: options });
    console.log('REGISTRATION JSON');
    console.log(registrationJSON);

    // 3. Save passkey in DB
    const verifyResponse = await fetch(`${APIURL}/register`, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationJSON),
    });

    const verifyData = await verifyResponse.json();

    if (verifyData.verified) {
      console.log(`Successfully registered ${username}`);
    }
  } catch {
    console.warn('auth key not succeeded.');
  }

  // }


  // console.log(data);
  // console.log(data.rawId);
}

async function login() {
  const username = 'opdelop43';

  // 1. Get challenge from server
  const response = await fetch(`${APIURL}/login?username=${username}`, {
    method: 'GET',
    credentials: 'include',
  });

  const options = await response.json();

  console.log('OPTIONST');
  console.log(options);

  // 2. Get passkey
  const authJSON = await startAuthentication({
    optionsJSON: options,
  });

  // 3. Verify passkey with DB
  const verifyResponse = await fetch(`${APIURL}/login`, {
    credentials: 'include',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(authJSON),
  });

  console.log(verifyResponse);
}

export default function Login() {
  return (
    <>
      <Head>
        <title>kiikiiworld</title>
      </Head>
      <Nav></Nav>
      <main id="index">
        <div className="post-container">
          <div>
            <h1>Login</h1>
            <p>Insert YubiKey</p>
            <button onClick={signup}>Signup</button>
            <button onClick={login}>Login</button>
          </div>

        </div>
      </main>
    </>
  );
}
