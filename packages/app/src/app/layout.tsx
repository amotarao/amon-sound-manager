import "../styles/globals.css";
import { LayoutPropsBase } from "../types/page-layout";
import { AppNavigation } from "./AppNavigation";
import { Auth } from "./Auth";

type Props = LayoutPropsBase;

export default function RootLayout({ children }: Props) {
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
