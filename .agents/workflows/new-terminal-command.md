---
name: new-terminal-command
description: Register a new command in the interactive terminal.
---

# Workflow: New Terminal Command

1. Read [TERMINAL.md](../../docs/TERMINAL.md) for security rules and registry spec
2. Add command to registry array
3. Implement `execute` function returning `TerminalOutput`
4. If output is dynamic, wire it to admin CMS site content
5. Test command, aliases, and autocomplete
6. Run [DEFINITION-OF-DONE.md](../../docs/DEFINITION-OF-DONE.md) checklist
