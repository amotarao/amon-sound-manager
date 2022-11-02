import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Link from 'next/link';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="grid h-screen grid-rows-[64px_minmax(0,1fr)]">
      <nav className="flex h-full items-center border-b px-4">
        <Link href="/">amon sound manager</Link>
      </nav>
      <div className="h-full">
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
