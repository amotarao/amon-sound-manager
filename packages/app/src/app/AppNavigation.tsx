'use client';

import classNames from 'classnames';
import { GoogleAuthProvider, signInWithRedirect, signOut } from 'firebase/auth';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../libs/firebase';

const provider = new GoogleAuthProvider();

type Props = {
  className?: string;
};

export function AppNavigation({ className }: Props) {
  const { loading, signedIn } = useAuth();

  return (
    <nav
      className={classNames(
        'grid h-full grid-cols-[minmax(0,1fr)_auto] items-center justify-between border-b px-4',
        className
      )}
    >
      <div>
        <Link href="/">amon sound manager</Link>
      </div>
      <div className="flex gap-4">
        <Link className="rounded border px-4 py-1" href="/upload">
          Uplaod
        </Link>
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
}
