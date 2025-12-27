// src/ai/mockRemoteProvider.ts
//
// v6.3 – Mock-implementasjon (KORRIGERT)
// STATUS: GYLDIG MOCK – INGEN NETT – INGEN SIDEFFEKT
//
// Denne versjonen matcher EKSISTERENDE kontrakt i provider.ts:
// AIExplainer.explain(input: string, options?) => Promise<string>
//
// Grunnlag (LÅST):
// - v6.1 Kontrakt (MOCK, ingen nett)
// - BP-TS-RUNTIME-001
// - Faktisk arkitektur i repoet

import { AIAdapter, AIExplainer } from "./provider";

export class MockRemoteAIAdapter implements AIAdapter {
  readonly id = "remote-mock";

  isAvailable(): boolean {
    return true;
  }

  getExplainer(): AIExplainer {
    return {
      explain: async (
        input: string,
        options?: {
          maxLength?: number;
          language?: string;
        }
      ): Promise<string> => {
        // Kontrollerte feilsignaler (mock)
        if (!input) {
          throw new Error("INVALID_INPUT: input mangler");
        }

        if (input === "__TIMEOUT__") {
          throw new Error("TIMEOUT: simulert timeout");
        }

        if (input === "__REJECT__") {
          throw new Error("REJECTED: forespørsel eksplisitt avvist");
        }

        // Deterministisk mock-respons
        let result =
          "Mock AI forklaring. Ingen ekte AI-kall er gjort.";

        if (options?.language) {
          result += ` Språk: ${options.language}.`;
        }

        if (options?.maxLength) {
          result = result.slice(0, options.maxLength);
        }

        return result;
      },
    };
  }
}
