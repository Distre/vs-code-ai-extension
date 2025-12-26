# VS Code AI (Controlled)

This project is a **controlled VS Code extension** for explaining code.
It is designed to be safe, predictable, and easy to understand.

There are **no hidden background actions** and **no automatic AI usage**.

---

## Core principles

- AI is **OFF by default**
- User must **explicitly enable AI**
- User must **explicitly consent every time**
- No background execution
- No network calls (yet)
- Everything is observable and reversible

---

## package.json structure

The `package.json` file follows a **strict structure**.
It intentionally contains **no comments**, because JSON does not support them.

All explanations for this file live here instead.

### activationEvents

Controls **when the extension is activated**.

- The extension activates **only** when a command is used
- Nothing runs on startup
- No hidden background behavior

Example purpose:
> Prevent unnecessary execution and reduce risk

---

### contributes.commands

Defines **user-facing commands**.

- Commands are triggered manually by the user
- No automatic execution
- Clear entry points for all functionality

Current commands:
- `VS Code AI: Start`
- `VS Code AI: Explain selected code`

---

### contributes.configuration

Defines **user-controlled settings**.

Key setting:
- `vsCodeAI.enableAI`

Behavior:
- Default value: **OFF**
- When OFF:
  - AI-related actions are blocked
  - User is clearly informed
- When ON:
  - User is still asked for consent per action

Purpose:
> Ensure the user always stays in control

---

## Why there are no comments in package.json

- `package.json` must be valid JSON
- JSON does **not** allow comments
- Adding comments would break the extension

Instead, this README explains:
- why each section exists
- how it is intended to be used
- how it can be extended later

---

## Where to find detailed explanations

- **Code behavior** → `src/extension.ts`
- **Architecture decisions** → this README
- **Commented JSON examples** → `package.comments.jsonc` (documentation only)

---

## Extension status

Current state:
- Offline only
- Local explanation stub
- No real AI integration
- Full logging and status indicators
- Ready for controlled AI integration later

Nothing in this project is experimental or hidden.

---

## Next steps (planned)

- Introduce real AI adapter (still controlled)
- Add optional snippets
- Add test coverage
- Keep all safety and control mechanisms intact
