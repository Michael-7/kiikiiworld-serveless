import Head from 'next/head';
import Nav from '@/components/nav/nav';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { UserContextType, useUserContext } from '@/contexts/user-context';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';

// https://www.youtube.com/watch?v=viZs1iVsLpA&t=439s
// https://www.youtube.com/watch?v=al5I9v5Y-kA&t=5s
// https://www.youtube.com/watch?v=7Q17ubqLfaM
// 4https://github.com/awslabs/aws-apigateway-lambda-authorizer-blueprints/blob/master/blueprints/nodejs/index.js

const APIURL = process.env.APIGATEWAY;
// TODO: Register with your own name
// const USERNAME = 'opdelop43';

async function signup(username: string, setError: (param: string) => void, setSuccess: (param: string) => void) {
  let options;

  try {
    // 1. Get challenge from server
    const response = await fetch(`${APIURL}/register?username=${username}`, {
      method: 'GET',
      credentials: 'include',
    });

    options = await response.json();
    if (!options.challenge) {
      throw new Error();
    }
  } catch {
    setError('could not connect to the server');
    return;
  }

  // 2. Create passkey
  try {
    const registrationJSON = await startRegistration({ optionsJSON: options });

    // 3. Save passkey in DB
    const verifyResponse = await fetch(`${APIURL}/register`, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationJSON),
    });

    if (verifyResponse.status === 200) {
      console.log(`Successfully registered ${username}`);
      setSuccess(`✅ Welcome to the guest list, ${username}. You can now log in.`);
    }
  } catch {
    console.warn('auth key not succeeded.');
    setError('auth key not succeeded.');
  }
}

async function login(userState: UserContextType, username: string, setError: (param: string) => void, setSuccess: (param: string) => void) {
  try {
    // 1. Get challenge from server
    const response = await fetch(`${APIURL}/login?username=${username}`, {
      method: 'GET',
      credentials: 'include',
    });

    const options = await response.json();

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

    const verifyResponseBody = await verifyResponse.json();
    userState.setValue(verifyResponseBody.token);
    setSuccess(`Welcome back, ${username}. It's lovely to have you again.`);
  } catch {
    console.warn('login failed');
    setError('login failed, doubly check your username?');
  }
}

export default function Login() {
  const userState = useUserContext();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValue('username', userState.value.username);
  }, []);

  const { register, setValue, getValues } =
    useForm<{ username: string }>();

  const startSignup = async () => {
    if (getValues('username')) {
      setError('');
      setLoading(true);
      await signup(getValues('username'), setError, setSuccess);
      setLoading(false);
    } else {
      setError('who are u again?');
    }
  };

  const startLogin = async () => {
    if (getValues('username')) {
      setError('');
      setLoading(true);
      await login(userState, getValues('username'), setError, setSuccess);
      setLoading(false);
    } else {
      setError('who are u again?');
    }
  };

  const startLogout = async () => {
    setError('');
    setSuccess(`Please don't go, I need your attention. 🥺`);
    userState.setValue('');
  };

  return (
    <>
      <Head>
        <title>kiikiiworld</title>
      </Head>
      <Nav></Nav>
      <main id="login">
        <div className="login">
          <h2>WebAuthn Login</h2>
          <p>Currently a user can only have one FIDO2 key attached to her or his account. We're working out a complete
            WebAuthn implementation.</p>
          <div className="login__form-wrapper">
            <div className={`login__form ${loading ? 'login__form--loading' : ''}`}>
              <label className="login__input">
                <p className="login__input-label">username</p>
                <input
                  type="text"
                  id="username"
                  required
                  disabled={!!userState.value.username}
                  {...register('username', { required: true })}
                />
                {(error && !userState.value.username) && <p className="login__input-error">{error}</p>}
                {success && <p className="login__input-success">{success}</p>}
              </label>
              {!userState.value.username && <div className="login__button-group">
                <button onClick={startSignup}>
                  Signup
                </button>
                <button onClick={startLogin}>
                  Login
                </button>
              </div>}
              {userState.value.username && <button onClick={startLogout}>Logout</button>}
            </div>
            {loading && <p className="login__input-message">loading</p>}
          </div>
        </div>
      </main>
    </>
  );
}
