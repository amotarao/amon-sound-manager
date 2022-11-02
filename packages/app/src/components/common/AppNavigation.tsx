import classNames from 'classnames';
import { GoogleAuthProvider, signInWithRedirect, signOut } from 'firebase/auth';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../libs/firebase';

const provider = new GoogleAuthProvider();

export type AppNavigationProps = {
  className?: string;
};

export const AppNavigation: React.FC<AppNavigationProps> = ({ className }) => {
  const { loading, signedIn } = useAuth();

  return (
    <nav className={classNames('flex h-full items-center justify-between border-b px-4', className)}>
      <Link href="/">amon sound manager</Link>
      <div>
        {loading ? null : !signedIn ? (
          <button
            className="rounded border px-4 py-1"
            onClick={() => {
              signInWithRedirect(auth, provider);
            }}
          >
            ログイン
          </button>
        ) : (
          <button
            className="rounded border px-4 py-1"
            onClick={() => {
              signOut(auth);
            }}
          >
            ログアウト
          </button>
        )}
      </div>
    </nav>
  );
};
