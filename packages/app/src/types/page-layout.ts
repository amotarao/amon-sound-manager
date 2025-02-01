export type PagePropsBase<
  T extends Record<string, string> = Record<never, never>,
> = {
  params: Promise<T>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export type LayoutPropsBase = {
  children: React.ReactNode;
};
