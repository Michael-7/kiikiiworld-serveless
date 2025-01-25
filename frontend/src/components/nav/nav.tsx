import Link from 'next/link';
import { useUserContext } from '@/contexts/user-context';

export default function Nav() {
  const userState = useUserContext();

  return (
    <div id="nav">
      <div className="container">
        <div className="content">
          <Link className="header" href={{ pathname: '/' }}>
            <h1>kiikiiworld</h1>
          </Link>
          <div className="user">
            {userState.value.username && (
              <Link href={{ pathname: '/login' }}>
                hi, {userState.value.username}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
