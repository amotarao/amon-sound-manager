'use client';

import { AppNavigation } from '../components/common/AppNavigation';
import { useAuth } from '../hooks/useAuth';
import '../styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { loading, signedIn } = useAuth();

  return (
    <html lang="ja-JP">
      <body>
        <div className="grid h-screen grid-cols-[100%] grid-rows-[64px_minmax(0,1fr)]">
          <AppNavigation />
          <div className="h-full w-full">
            {loading ? (
              <p className="p-4">読み込み中</p>
            ) : !signedIn ? (
              <p className="p-4">ログインしてください</p>
            ) : (
              children
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
