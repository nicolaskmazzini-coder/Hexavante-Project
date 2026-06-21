/**
 * Gera simulados ENEM completos para ambiente de teste:
 * - 100 questões objetivas (25 por área do conhecimento)
 * - 1 questão dissertativa de Redação ao final (tipo ESSAY)
 *
 * As questões são fictícias, no estilo ENEM, para fins de desenvolvimento e QA.
 * Não reproduzem o conteúdo oficial do INEP.
 */

export type SeedAlternative = { text: string; isCorrect: boolean };

export type SeedMcQuestion = {
  type: "MULTIPLE_CHOICE";
  statement: string;
  alternatives: SeedAlternative[];
  subject?: string;
  explanation?: string;
  difficulty?: number;
};

export type SeedEssayQuestion = {
  type: "ESSAY";
  statement: string;
  expectedAnswer?: string;
};

export type SeedExamQuestion = SeedMcQuestion | SeedEssayQuestion;

export type SeedFullEnemExam = {
  title: string;
  slug: string;
  description: string;
  examType: "ENEM";
  timeLimit: number;
  isPremiumOnly?: boolean;
  questions: SeedExamQuestion[];
};

type EnemArea = {
  code: string;
  name: string;
  start: number;
  topics: string[];
};

const ENEM_AREAS: EnemArea[] = [
  {
    code: "LC",
    name: "Linguagens, Códigos e suas Tecnologias",
    start: 1,
    topics: [
      "interpretação de texto literário",
      "variação linguística e preconceito",
      "funções da linguagem",
      "coesão e coerência textual",
      "gêneros digitais e multimodais",
      "figuras de linguagem",
      "artes e manifestações culturais",
      "língua estrangeira — compreensão global",
      "literatura brasileira contemporânea",
      "produção textual e revisão",
    ],
  },
  {
    code: "CH",
    name: "Ciências Humanas e suas Tecnologias",
    start: 26,
    topics: [
      "Brasil República e cidadania",
      "globalização e economia mundial",
      "geopolítica e conflitos",
      "urbanização e mobilidade",
      "movimentos sociais",
      "direitos humanos",
      "sociologia do trabalho",
      "meio ambiente e sustentabilidade",
      "cultura e identidade",
      "filosofia e ética pública",
    ],
  },
  {
    code: "CN",
    name: "Ciências da Natureza e suas Tecnologias",
    start: 51,
    topics: [
      "ecologia e cadeias alimentares",
      "genética e hereditariedade",
      "fotossíntese e metabolismo",
      "química orgânica aplicada",
      "reações químicas e estequiometria",
      "física — cinemática",
      "física — energia e trabalho",
      "ondas e fenômenos naturais",
      "saúde pública e epidemiologia",
      "sustentabilidade e recursos naturais",
    ],
  },
  {
    code: "MT",
    name: "Matemática e suas Tecnologias",
    start: 76,
    topics: [
      "porcentagem e juros",
      "razão e proporção",
      "função afim e quadrática",
      "geometria plana",
      "geometria espacial",
      "probabilidade e combinatória",
      "estatística — média e mediana",
      "análise de gráficos",
      "trigonometria aplicada",
      "álgebra e equações",
    ],
  },
];

const REDACAO_THEMES: Record<number, { tema: string; orientacao: string }> = {
  2024: {
    tema: "Desafios para a valorização de comunidades e povos tradicionais no Brasil",
    orientacao:
      "Elabore um texto dissertativo-argumentativo em modalidade escrita formal da língua portuguesa sobre o tema, apresentando proposta de intervenção que respeite os direitos humanos.",
  },
  2025: {
    tema: "Persistência da violência contra a mulher na sociedade brasileira",
    orientacao:
      "Elabore um texto dissertativo-argumentativo em modalidade escrita formal da língua portuguesa sobre o tema, apresentando proposta de intervenção que respeite os direitos humanos.",
  },
  2026: {
    tema: "O estigma associado às doenças mentais na sociedade brasileira",
    orientacao:
      "Elabore um texto dissertativo-argumentativo em modalidade escrita formal da língua portuguesa sobre o tema, apresentando proposta de intervenção que respeite os direitos humanos.",
  },
};

const DISTRACTOR_POOL = [
  "Afirmação que contradiz o contexto apresentado no enunciado.",
  "Interpretação literal inadequada do texto-base.",
  "Generalização indevida sem respaldo nos dados.",
  "Confusão entre causa e consequência no raciocínio.",
];

function buildAlternatives(correctText: string, number: number): SeedAlternative[] {
  const labels = ["A", "B", "C", "D", "E"];
  const correctIndex = number % 5;
  const options = labels.map((label, idx) => {
    if (idx === correctIndex) {
      return { text: `${label}) ${correctText}`, isCorrect: true };
    }
    const distractor = DISTRACTOR_POOL[(number + idx) % DISTRACTOR_POOL.length];
    return { text: `${label}) ${distractor}`, isCorrect: false };
  });
  return options;
}

function buildAreaQuestions(area: EnemArea, year: number): SeedMcQuestion[] {
  const questions: SeedMcQuestion[] = [];

  for (let i = 0; i < 25; i++) {
    const number = area.start + i;
    const topic = area.topics[i % area.topics.length];
    const statement = [
      `Questão ${number} — ${area.name} (ENEM ${year})`,
      `Com base em ${topic}, analise a situação apresentada e assinale a alternativa correta.`,
      `Considere os dados do contexto e a abordagem interdisciplinar típica da prova do ENEM.`,
    ].join(" ");

    const correctText = `Resposta coerente com ${topic} no contexto da questão ${number}.`;

    questions.push({
      type: "MULTIPLE_CHOICE",
      statement,
      alternatives: buildAlternatives(correctText, number),
      subject: area.name,
      explanation: `Esta questão trabalha ${topic}. A alternativa correta articula o conceito ao contexto do enunciado, evitando interpretações literais ou generalizações sem respaldo.`,
      difficulty: 1 + (i % 3),
    });
  }

  return questions;
}

function buildRedacaoQuestion(year: number): SeedEssayQuestion {
  const theme = REDACAO_THEMES[year];
  return {
    type: "ESSAY",
    statement: [
      "REDACAO — Proposta de Redação do ENEM",
      `Tema: "${theme.tema}"`,
      theme.orientacao,
      "A redação deve ter no mínimo 7 linhas e no máximo 30 linhas.",
    ].join("\n\n"),
    expectedAnswer: theme.tema,
  };
}

export function buildFullEnemExam(year: number): SeedFullEnemExam {
  const redacao = REDACAO_THEMES[year];
  if (!redacao) {
    throw new Error(`Ano ENEM não suportado no seed: ${year}`);
  }

  const mcQuestions = ENEM_AREAS.flatMap((area) => buildAreaQuestions(area, year));

  return {
    title: `ENEM ${year} — Prova Completa (100 questões + Redação)`,
    slug: `enem-${year}-prova-completa`,
    description: [
      `Simulado completo no formato ENEM ${year} para testes da plataforma.`,
      "100 questões objetivas distribuídas em Linguagens (1-25), Humanas (26-50),",
      "Natureza (51-75) e Matemática (76-100), seguidas da Redação (questão 101).",
      "Questões fictícias no estilo ENEM — não são o conteúdo oficial do INEP.",
    ].join(" "),
    examType: "ENEM",
    timeLimit: 330,
    questions: [...mcQuestions, buildRedacaoQuestion(year)],
  };
}

/** Simulados ENEM completos disponíveis no seed */
export const FULL_ENEM_EXAMS: SeedFullEnemExam[] = [
  buildFullEnemExam(2026),
  buildFullEnemExam(2025),
  buildFullEnemExam(2024),
];

/** Slugs dos simulados parciais antigos — removidos na migração para prova completa */
export const DEPRECATED_PARTIAL_ENEM_SLUGS = [
  "enem-2026-teste-linguagens-e-codigos",
  "enem-2026-teste-matematica-e-suas-tecnologias",
  "enem-2026-teste-ciencias-humanas",
  "enem-2026-teste-ciencias-da-natureza",
  "enem-2026-teste-redacao-e-competencias",
];
