Read these files in order:

1. /Users/bruno/Developer/shelvd/docs/CLAUDE_STARTUP_PROMPT.md
2. /Users/bruno/Developer/shelvd/docs/project.md
3. /Users/bruno/Developer/shelvd/docs/CLAUDE_SESSION_LOG.md

Then run:
```
cd /Users/bruno/Developer/shelvd && git status && git log --oneline -5
```

After reading all three files and checking git, give me a brief summary:
- Current app version and state
- Any uncommitted changes
- What's next (pre-release polish items, pending features)

Do NOT ask me to run commands. You have full filesystem, shell, database, and browser access. Use them directly.
