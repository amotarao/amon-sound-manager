import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AppNavigation } from '../components/common/AppNavigation';
import { useAuth } from '../hooks/useAuth';

function MyApp({ Component, pageProps }: AppProps) {
  const { loading, signedIn } = useAuth();

  return (
    <div className="grid h-screen grid-rows-[64px_minmax(0,1fr)]">
      <AppNavigation />
      <div className="h-full">
        {loading ? (
          <p className="p-4">読み込み中</p>
        ) : !signedIn ? (
          <p className="p-4">ログインしてください</p>
        ) : (
          <Component {...pageProps} />
        )}
      </div>
    </div>
  );
}

export default MyApp;
