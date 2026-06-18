import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

/**
 * ESLint flat config (ESLint 9+).
 *
 * Camadas de configuração (da mais genérica para a mais específica):
 *  1. Next.js Core Web Vitals — regras de acessibilidade e performance
 *  2. Next.js TypeScript  — regras @typescript-eslint recomendadas
 *  3. Projeto              — customizações locais mais estritas
 *  4. Prettier             — desativa regras de formatação que conflitam com Prettier
 */
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,

  // Customizações do projeto
  {
    rules: {
      // TypeScript
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // Segurança / boas práticas
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",

      // Next.js — forçar uso de next/image e next/link
      "@next/next/no-img-element": "warn",

      // Estilo consistente
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
    },
  },

  // Prettier DEVE ser o último item — desativa regras de formatação
  prettier,
];

export default eslintConfig;
