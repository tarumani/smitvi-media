export type Ctx = {
  params: Promise<{ slug: string; id: string; path: string[]; username: string }>;
};

export type PageQuery = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export type PageParams<T extends Record<string, string>> = {
  params: Promise<T>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
