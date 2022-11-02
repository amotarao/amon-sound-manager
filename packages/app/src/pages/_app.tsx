import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AppNavigation } from '../components/common/AppNavigation';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="grid h-screen grid-rows-[64px_minmax(0,1fr)]">
      <AppNavigation />
      <div className="h-full">
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
