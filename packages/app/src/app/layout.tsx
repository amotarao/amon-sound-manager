import { AppNavigation } from './AppNavigation';
import { Auth } from './Auth';
import '../styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja-JP">
      <body>
        <div className="grid h-screen grid-cols-[100%] grid-rows-[64px_minmax(0,1fr)]">
          <AppNavigation />
          <div className="h-full w-full">
            <Auth>{children}</Auth>
          </div>
        </div>
      </body>
    </html>
  );
}
