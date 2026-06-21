/**
 * Filtro rigoroso de linguagem ofensiva (PT + EN) para DMs, posts e comentários.
 * Detecta variações, leetspeak, separadores, abreviações e mensagens fragmentadas.
 */

export class ContentPolicyError extends Error {
  constructor(message = "Sua mensagem contém linguagem não permitida na plataforma.") {
    super(message);
    this.name = "ContentPolicyError";
  }
}

const BLOCKED_TERMS_PT = [
  "caralho",
  "porra",
  "merda",
  "bosta",
  "buceta",
  "xota",
  "xoxota",
  "xana",
  "cu",
  "cuzao",
  "cuzão",
  "foda",
  "foder",
  "fuder",
  "fude",
  "fodido",
  "fodida",
  "fodase",
  "foda-se",
  "fdp",
  "puta",
  "putaria",
  "puto",
  "putinha",
  "putinho",
  "piranha",
  "vadia",
  "vadiagem",
  "vadiado",
  "viado",
  "viadinho",
  "bicha",
  "boiola",
  "traveco",
  "desgraca",
  "desgraça",
  "arrombado",
  "arrombada",
  "babaca",
  "otario",
  "otário",
  "imbecil",
  "idiota",
  "retardado",
  "retardada",
  "mongol",
  "nazista",
  "nazismo",
  "hitler",
  "estupido",
  "estúpido",
  "estupida",
  "estúpida",
  "estupro",
  "estuprar",
  "vagabundo",
  "vagabunda",
  "pica",
  "pau",
  "pinto",
  "rola",
  "rabo",
  "broxa",
  "punheta",
  "siririca",
  "vsf",
  "vtnc",
  "tnc",
  "pqp",
  "krl",
  "krlh",
  "caralh",
  "cacete",
  "cacetada",
  "sacana",
  "safada",
  "safado",
  "canalha",
  "escroto",
  "boceta",
  "bunda",
  "bundao",
  "cuzuda",
  "cuzudo",
  "vtmnc",
  "noobzao",
  "macaca",
  "macaco",
  "macacada",
  "sexo",
  "sexual",
  "transar",
  "trepar",
  "prostituta",
  "prostituicao",
  "prostituto",
  "pedofilo",
  "pedofilia",
  "necrofilia",
  "zoofilia",
  "incesto",
  "sodomia",
  "orgia",
  "pornografia",
  "porno",
  "pornô",
  "masturbacao",
  "masturbar",
  "ejacular",
  "gozar",
  "penis",
  "pênis",
  "vagina",
  "clitoris",
  "clitóris",
  "anus",
  "ânus",
  "anal",
  "oral",
  "felação",
  "felacao",
  "chupar",
  "lamber",
  "nua",
  "nu",
  "pelada",
  "pelado",
  "nudez",
  "nudes",
  "nude",
  "onlyfans",
  "escort",
  "garota de programa",
  "negrinho",
  "negrinha",
  "pretinho",
  "pretinha",
  "peituda",
  "peitudo",
  "tetuda",
  "tetudo",
  "vaginuda",
  "vaginudo",
  "bucetuda",
  "bucetudo",
  "estuprada",
  "estrupada",
  "estrupadq",
  "estrupro",
];

const BLOCKED_TERMS_EN = [
  "fuck",
  "fucking",
  "fucker",
  "fucked",
  "motherfucker",
  "shit",
  "shitty",
  "bullshit",
  "bitch",
  "bastard",
  "asshole",
  "dick",
  "cock",
  "pussy",
  "cunt",
  "whore",
  "slut",
  "nigger",
  "nigga",
  "faggot",
  "fag",
  "retard",
  "retarded",
  "wtf",
  "stfu",
  "lmfao",
  "douchebag",
  "scumbag",
  "jackass",
  "wanker",
  "bollocks",
  "prick",
  "douche",
  "twat",
  "rape",
  "rapist",
  "pedophile",
  "pedo",
  "sex",
  "porn",
  "porno",
  "nude",
  "nudes",
  "naked",
  "blowjob",
  "handjob",
  "cumshot",
  "orgasm",
  "dildo",
  "vibrator",
  "hentai",
  "milf",
  "threesome",
  "gangbang",
  "bestiality",
  "incest",
  "necrophilia",
];

const BLOCKED_PHRASES = [
  "filho da puta",
  "filha da puta",
  "vai se foder",
  "vai se fuder",
  "va se foder",
  "va se fuder",
  "vai tomar no cu",
  "tomar no cu",
  "se foder",
  "se fuder",
  "filho da p",
  "vai se f",
  "vai a merda",
  "vai pro inferno",
  "piece of shit",
  "go fuck",
  "fuck you",
  "fuck off",
  "suck my",
  "eat shit",
  "son of a bitch",
  "sexo anal",
  "vamos nos comer",
  "vamos transar",
  "preta macaca",
  "preto macaco",
  "macaco preto",
  "macaca preta",
  "vai tomar",
  "nos comer",
  "me come",
  "te como",
  "quero te comer",
  "vou te comer",
  "peituda e aberta",
  "prima gostosa",
  "passa numero",
  "me passa numero",
  "me passa número",
  "penis adentrando",
  "pênis adentrando",
  "adentrando seu",
  "quero dormir quentinho",
  "meu penis",
  "meu pênis",
  "meu cu",
  "meu cú",
  "meu pau",
  "meu pinto",
  "minha rola",
  "sua rola",
];

/** Padrões regex aplicados ao texto normalizado compacto (evasões e variações). */
const BLOCKED_COMPACT_PATTERNS: RegExp[] = [
  /f+u+d+[aeiou]?[a-z]*/,
  /p+u+t+[aeiou]?[a-z]*/,
  /m+a+c+a+c+[ao]/,
  /caralh[oao]?/,
  /porr[aao]?/,
  /merd[aao]?/,
  /vadi[aao]/,
  /sex[o0]/,
  /n+[i1!]+g+[gq0]+[ae4]+/,
  /n+[i1!]+g+[gq0]+e*r/,
  /f+[u0]+c+k/,
  /p+e+i+t+[oa]?ud[aao]?/,
  /t+e+t+[oa]?ud[aao]?/,
  /v+a+g+i+n+[oa]?ud[aao]?/,
  /b+u+c+e+t+[oa]?ud[aao]?/,
  /e+s+t+r?u+p+r+[ao]?[dq]?/,
  /p+e+d+o+f/,
  /p+e+n+i+s/,
  /p+[i1!]+n+t+[o0](?![a-z0-9])/,
  /r+[o0]+l+[a4@](?![a-z0-9])/,
];

/** Raízes ofensivas detectadas dentro de palavras compostas ou typos. */
const BLOCKED_STEMS = [
  "peitud",
  "tetud",
  "vaginud",
  "bucetud",
  "estupr",
  "estrupr",
  "pedofil",
  "pornograf",
  "nigg",
  "niigg",
];

const BLOCKED_TERMS = [...BLOCKED_TERMS_PT, ...BLOCKED_TERMS_EN];

/** Termos que só bloqueiam como palavra isolada (evita "Paulo", "matemática", "sextafeira"). */
const BOUNDARY_ONLY_TERMS = new Set([
  "cu",
  "nu",
  "anal",
  "oral",
  "pau",
  "pinto",
  "rola",
  "sex",
  "sexo",
  "rabo",
  "oral",
]);

const LEET_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "2": "z",
  "3": "e",
  "4": "a",
  "5": "s",
  "6": "g",
  "7": "t",
  "8": "b",
  "9": "g",
  "@": "a",
  $: "s",
  "!": "i",
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

function applyLeet(value: string) {
  let result = value;
  for (const [from, to] of Object.entries(LEET_MAP)) {
    result = result.split(from).join(to);
  }
  return result;
}

function collapseRepeats(value: string) {
  return value.replace(/(.)\1{2,}/g, "$1$1");
}

function normalizeSpaced(text: string) {
  return collapseRepeats(
    stripAccents(applyLeet(text))
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function normalizeCompact(text: string) {
  return normalizeSpaced(text).replace(/\s+/g, "");
}

function wordBoundaryPattern(term: string) {
  const normalized = normalizeSpaced(term).replace(/\s+/g, "\\s+");
  return new RegExp(`(?<![a-z0-9])${normalized}(?![a-z0-9])`, "i");
}

function fuzzyCharPattern(term: string) {
  const chars = normalizeCompact(term).split("");
  if (chars.length === 0) return null;
  const joined = chars.map((char) => `${escapeRegExp(char)}[\\s\\W_*\\-.]*`).join("");
  return new RegExp(joined, "i");
}

function matchesCompactPatterns(text: string): string | null {
  const compact = normalizeCompact(text);
  if (!compact) return null;

  for (const pattern of BLOCKED_COMPACT_PATTERNS) {
    const match = compact.match(pattern);
    if (match) return match[0];
  }

  return null;
}

function matchesStem(text: string): string | null {
  const compact = normalizeCompact(text);
  if (!compact) return null;

  for (const stem of BLOCKED_STEMS) {
    if (stem.length >= 5 && compact.includes(stem)) return stem;
  }

  return null;
}

function matchesTerm(text: string, term: string): boolean {
  const spaced = normalizeSpaced(text);
  const compact = normalizeCompact(text);
  const normalizedTerm = normalizeSpaced(term);
  const compactTerm = normalizeCompact(term);

  if (!normalizedTerm) return false;

  if (BOUNDARY_ONLY_TERMS.has(normalizedTerm)) {
    return wordBoundaryPattern(term).test(spaced);
  }

  if (wordBoundaryPattern(normalizedTerm).test(spaced)) return true;

  if (compactTerm.length >= 3 && compact.includes(compactTerm)) return true;

  if (compactTerm.length >= 3) {
    const fuzzy = fuzzyCharPattern(term);
    if (fuzzy && fuzzy.test(text)) return true;
  }

  return false;
}

function matchesPhrase(text: string, phrase: string): boolean {
  const spaced = normalizeSpaced(text);
  const normalizedPhrase = normalizeSpaced(phrase);
  if (!normalizedPhrase) return false;
  if (spaced.includes(normalizedPhrase)) return true;

  const compact = normalizeCompact(text);
  const compactPhrase = normalizeCompact(phrase);
  if (compactPhrase.length >= 6 && compact.includes(compactPhrase)) return true;

  return false;
}

function scanText(text: string): string | null {
  if (!text.trim()) return null;

  for (const phrase of BLOCKED_PHRASES) {
    if (matchesPhrase(text, phrase)) return phrase;
  }

  for (const term of BLOCKED_TERMS) {
    if (matchesTerm(text, term)) return term;
  }

  const patternHit = matchesCompactPatterns(text);
  if (patternHit) return patternHit;

  const stemHit = matchesStem(text);
  if (stemHit) return stemHit;

  return null;
}

export function findBlockedContent(text: string): string | null {
  return scanText(text);
}

/**
 * Detecta evasão por mensagens curtas em sequência.
 * Não revalida mensagens antigas já enviadas — só combina fragmentos recentes + texto atual.
 */
export function findSequenceEvasion(recentFragments: string[], newText: string): string | null {
  const current = newText.trim();
  if (!current) return null;

  if (scanText(current)) return null;

  const fragments = recentFragments
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !scanText(part));

  if (fragments.length === 0) return null;

  const maxTail = Math.min(fragments.length, 5);
  for (let take = 1; take <= maxTail; take++) {
    const tail = fragments.slice(-take);
    const combined = [...tail, current];

    const hitSpace = scanText(combined.join(" "));
    if (hitSpace) return hitSpace;

    const hitCompact = scanText(combined.join(""));
    if (hitCompact) return hitCompact;
  }

  return null;
}

/** @deprecated Use findSequenceEvasion para DMs; mantido para testes de combinação explícita. */
export function findBlockedContentInParts(parts: string[]): string | null {
  if (parts.length === 0) return null;
  const last = parts[parts.length - 1]?.trim() ?? "";
  const prior = parts.slice(0, -1);
  return findSequenceEvasion(prior, last) ?? findBlockedContent(last);
}

export function containsProfanity(text: string): boolean {
  return findBlockedContent(text) !== null;
}

export function assertCleanContent(text: string, fieldLabel = "mensagem"): void {
  const blocked = findBlockedContent(text);
  if (blocked) {
    throw new ContentPolicyError(
      `Sua ${fieldLabel} contém linguagem não permitida. Revise o texto e tente novamente.`,
    );
  }
}

export function filterProfanity(text: string): string {
  let result = text;

  for (const phrase of BLOCKED_PHRASES) {
    if (!matchesPhrase(result, phrase)) continue;
    const pattern = new RegExp(escapeRegExp(phrase), "gi");
    result = result.replace(pattern, (match) => "*".repeat(Math.max(4, match.length)));
  }

  for (const term of BLOCKED_TERMS) {
    if (!matchesTerm(result, term)) continue;
    const pattern = wordBoundaryPattern(term);
    result = result.replace(pattern, (match) => "*".repeat(Math.max(3, match.length)));
  }

  if (findBlockedContent(result)) {
    result = result
      .split(/\s+/)
      .map((word) => (findBlockedContent(word) ? "*".repeat(Math.max(3, word.length)) : word))
      .join(" ");
  }

  return result;
}

export function findBlockedUsername(username: string): string | null {
  if (!username.trim()) return null;

  for (const phrase of BLOCKED_PHRASES) {
    if (matchesPhrase(username, phrase)) return phrase;
  }

  const compact = normalizeCompact(username);

  for (const term of BLOCKED_TERMS) {
    const compactTerm = normalizeCompact(term);
    if (!compactTerm) continue;
    if (compact === compactTerm) return term;
    if (compactTerm.length >= 4 && compact.includes(compactTerm)) return term;
    if (wordBoundaryPattern(term).test(normalizeSpaced(username))) return term;
  }

  const patternHit = matchesCompactPatterns(username);
  if (patternHit) return patternHit;

  return null;
}

export function assertCleanUsername(username: string): void {
  const blocked = findBlockedUsername(username);
  if (blocked) {
    throw new ContentPolicyError("Este nome de usuário não é permitido.");
  }
}
