"use client";

import { useAuth } from "../hooks/useAuth";

type Props = {
  children: React.ReactNode;
};

export function Auth({ children }: Props) {
  const { loading, signedIn } = useAuth();

  return loading ? (
    <p className="p-4">読み込み中</p>
  ) : !signedIn ? (
    <p className="p-4">ログインしてください</p>
  ) : (
    <>{children}</>
  );
}
