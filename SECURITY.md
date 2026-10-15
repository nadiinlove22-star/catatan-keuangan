# Security notes

- The browser app may contain the Supabase project URL and a publishable key only.
- Never commit Supabase service_role/secret keys, personal access tokens, database passwords, private keys, or real user backups.
- Keep Row Level Security enabled on every table exposed through the Data API and review policies whenever the schema changes.
- The repository is public; all committed source and prior commits may be visible to anyone.
- .gitignore helps prevent future accidental additions, but does not remove secrets from Git history.
- If a secret was ever committed, revoke/rotate it at its issuer immediately, then clean Git history if appropriate.
- Do not store real financial records or credentials in repository files or issue discussions.
