import { describe, expect, it } from "vitest";
import {
  assertCleanContent,
  containsProfanity,
  ContentPolicyError,
  filterProfanity,
  findBlockedContent,
  findBlockedContentInParts,
  findBlockedUsername,
  findSequenceEvasion,
} from "@/lib/profanity-filter";

describe("profanity-filter", () => {
  it("bloqueia palavrões em português", () => {
    expect(containsProfanity("vai tomar no cu")).toBe(true);
    expect(containsProfanity("que porra é essa")).toBe(true);
    expect(containsProfanity("caralho mano")).toBe(true);
  });

  it("bloqueia palavrões em inglês", () => {
    expect(containsProfanity("what the fuck")).toBe(true);
    expect(containsProfanity("you are a bitch")).toBe(true);
    expect(containsProfanity("piece of shit")).toBe(true);
  });

  it("bloqueia casos reais de DM reportados", () => {
    expect(containsProfanity("Fude")).toBe(true);
    expect(containsProfanity("Fuder")).toBe(true);
    expect(containsProfanity("Sexo")).toBe(true);
    expect(containsProfanity("Sexo anal vamos nos comer vadia")).toBe(true);
    expect(containsProfanity("Preta macaca")).toBe(true);
    expect(containsProfanity("vadia")).toBe(true);
    expect(containsProfanity("Peituda")).toBe(true);
    expect(containsProfanity("Vaginuda")).toBe(true);
    expect(containsProfanity("Bucetuda")).toBe(true);
    expect(containsProfanity("Estrupadq")).toBe(true);
    expect(containsProfanity("Estrupro")).toBe(true);
    expect(containsProfanity("N i i gg a")).toBe(true);
    expect(containsProfanity("Aquela sua prima gostosa e peituda e aberta")).toBe(true);
    expect(containsProfanity("Me passa numero babe")).toBe(true);
    expect(containsProfanity("Pênis meu pênis Adentrando seu cu")).toBe(true);
    expect(containsProfanity("P1nto")).toBe(true);
    expect(containsProfanity("R0LA")).toBe(true);
    expect(containsProfanity("MEU CÜ")).toBe(true);
    expect(containsProfanity("meu cu")).toBe(true);
    expect(containsProfanity("pinto")).toBe(true);
    expect(containsProfanity("rola")).toBe(true);
  });

  it("detecta mensagens fragmentadas em sequência", () => {
    expect(findSequenceEvasion(["mac"], "aca")).not.toBeNull();
    expect(findSequenceEvasion(["Vai", "Se", "fod"], "er")).not.toBeNull();
    expect(findSequenceEvasion(["preta", "mac"], "aca")).not.toBeNull();
    expect(findSequenceEvasion(["vamos", "nos"], "comer")).not.toBeNull();
    expect(findSequenceEvasion(["f.u"], "c.k")).not.toBeNull();
    expect(findBlockedContent("Fuder")).not.toBeNull();
  });

  it("não bloqueia mensagem normal por histórico ofensivo antigo", () => {
    expect(findSequenceEvasion(["Sexo", "anal vadia"], "Olá, tudo bem?")).toBeNull();
    expect(findSequenceEvasion(["Fuder"], "Oi")).toBeNull();
  });

  it("detecta mensagem ofensiva isolada via findBlockedContentInParts", () => {
    expect(findBlockedContentInParts(["Vai", "Se", "Fuder"])).not.toBeNull();
  });

  it("detecta leetspeak e separadores", () => {
    expect(containsProfanity("p0rr4")).toBe(true);
    expect(containsProfanity("c@ralho")).toBe(true);
    expect(containsProfanity("f.u.c.k you")).toBe(true);
    expect(containsProfanity("vai s3 f0d3r")).toBe(true);
  });

  it("detecta frases compostas", () => {
    expect(containsProfanity("filho da puta")).toBe(true);
    expect(containsProfanity("vai se foder")).toBe(true);
  });

  it("permite texto educacional comum", () => {
    expect(containsProfanity("Preciso revisar o curso de matemática")).toBe(false);
    expect(containsProfanity("Hello, how are you studying today?")).toBe(false);
    expect(containsProfanity("Paulo explicou a aula sobre cultura")).toBe(false);
    expect(containsProfanity("Assunto: funções do segundo grau")).toBe(false);
    expect(containsProfanity("Análise combinatória na aula de hoje")).toBe(false);
  });

  it("assertCleanContent lança erro amigável", () => {
    expect(() => assertCleanContent("porra", "publicação")).toThrow(ContentPolicyError);
  });

  it("bloqueia usernames ofensivos", () => {
    expect(findBlockedUsername("porra123")).not.toBeNull();
    expect(findBlockedUsername("estudante_ok")).toBeNull();
  });

  it("filterProfanity mascara termos na exibição", () => {
    expect(filterProfanity("que porra")).not.toContain("porra");
  });
});
