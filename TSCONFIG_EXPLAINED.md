# tsconfig.json – Explanation

This document explains the TypeScript configuration used in this project.

The actual `tsconfig.json` file contains **no comments by design**.
All explanations live here instead.

---

## Purpose of tsconfig.json

The `tsconfig.json` file tells TypeScript:

- how the code should be compiled
- how strict the type checking should be
- where input and output files live

The goal is:
> predictable, safe, and easy-to-reason-about code

---

## compilerOptions

### target: "ES2020"

- Defines the JavaScript version that TypeScript outputs
- ES2020 is modern, stable, and well supported by VS Code extensions
- Avoids unnecessary polyfills or legacy output

Why this matters:
> Keeps the output clean and readable, without being outdated

---

### module: "commonjs"

- Required for VS Code extensions
- Matches Node.js module system
- Fully supported by the VS Code extension runtime

Why this matters:
> VS Code extensions expect CommonJS modules

---

### outDir: "out"

- All compiled JavaScript files go into the `out/` folder
- Keeps source code and compiled code separate
- Makes it easy to ignore compiled files in Git

Why this matters:
> Clean project structure and clear build output

---

### rootDir: "src"

- Tells TypeScript where the source code lives
- Everything under `src/` is considered input
- Matches the project folder structure exactly

Why this matters:
> Prevents accidental compilation of unrelated files

---

### strict: true

- Enables all strict TypeScript checks
- Forces explicit handling of:
  - null
  - undefined
  - uninitialized variables
  - unsafe assumptions

Why this matters:
> Bugs are caught early, before runtime

This project **intentionally uses strict mode** to ensure:
- predictable behavior
- safe refactoring
- clear intent for future contributors

---

## Design philosophy

This tsconfig is:

- minimal
- explicit
- conservative
- easy to extend later

No experimental flags.
No magic defaults.
No hidden behavior.

---

## When to change this file

Only change `tsconfig.json` if:

- the VS Code extension runtime requirements change
- a new build step is introduced
- strictness is intentionally adjusted (rare)

Any change should be documented here.

---

## Summary

- `tsconfig.json` is small on purpose
- Safety and clarity are prioritized over convenience
- This configuration supports the project's controlled AI design
