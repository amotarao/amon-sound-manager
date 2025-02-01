// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [".next"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
);
