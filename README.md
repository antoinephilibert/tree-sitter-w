# tree-sitter-w

Parser Tree-sitter pour le langage `W`.

## Quick TODO (apres modif de `grammar.js`)

1. Regenerer le parser:

```bash
npx tree-sitter generate
```

2. Recompiler le parser:

```bash
npx tree-sitter build
```

3. Verifier rapidement sur un fichier `.w`:

```bash
npx tree-sitter parse --scope source.w --config-path /tmp/ts-config.json path/to/file.w
npx tree-sitter query --scope source.w --config-path /tmp/ts-config.json queries/w/highlights.scm path/to/file.w
```

## Etat actuel

Le mot-cle `optional` est deja present dans:
- `grammar.js` (regle `optional` et integration dans `_statement`)
- `queries/w/highlights.scm` (capture `@keyword`)

Si tu as une erreur sur `optional` dans `highlights.scm`, c'est souvent un parser non regenere.

## Prerequis

- Node.js + npm
- `tree-sitter-cli` (installe localement via `npm install` dans ce repo)

## Installation rapide

```bash
npm install
npx tree-sitter generate
npx tree-sitter build
```

## Utilisation

### 1) Parser un fichier

Le scope du langage est `source.w`.

```bash
cat > /tmp/ts-config.json <<EOF2
{
  "parser-directories": ["$(cd .. && pwd)"]
}
EOF2

npx tree-sitter parse \
  --scope source.w \
  --config-path /tmp/ts-config.json \
  path/to/file.w
```

### 2) Verifier la query de highlight

```bash
npx tree-sitter query \
  --scope source.w \
  --config-path /tmp/ts-config.json \
  queries/w/highlights.scm \
  path/to/file.w
```

### 3) Tester le highlighting

```bash
npx tree-sitter highlight \
  --scope source.w \
  --config-path /tmp/ts-config.json \
  --query-paths queries/w/highlights.scm \
  -- path/to/file.w
```

Option stricte:

```bash
npx tree-sitter highlight \
  --check \
  --scope source.w \
  --config-path /tmp/ts-config.json \
  --query-paths queries/w/highlights.scm \
  -- path/to/file.w
```

## Ajouter un nouveau mot-cle

Quand tu ajoutes un mot-cle (ex: `optional`), suis cet ordre:

1. Modifier `grammar.js` (regles/statements/tokens selon le besoin).
2. Mettre a jour `queries/w/highlights.scm` (souvent via la liste de strings capturees en `@keyword`).
3. Regenerer le parser:

```bash
npx tree-sitter generate
npx tree-sitter build
```

4. Revalider parse + query + highlight (commandes ci-dessus).

## Debug: erreur sur `optional` dans `highlights.scm`

### Cas 1: `Invalid node type` ou erreur de query

Le parser compile (`src/parser.c`, `src/node-types.json`) est probablement desynchronise avec `grammar.js`.

Correction:

```bash
npx tree-sitter generate
npx tree-sitter build
```

### Cas 2: erreur sur le scope

Si tu vois `Unknown scope 'source.w'`, utilise une config Tree-sitter avec `parser-directories` qui pointe vers le dossier parent contenant ce repo.

## Fichiers importants

- `grammar.js`: definition de la grammaire
- `src/parser.c`: parser genere
- `src/node-types.json`: types de noeuds generes
- `queries/w/highlights.scm`: captures de highlighting
