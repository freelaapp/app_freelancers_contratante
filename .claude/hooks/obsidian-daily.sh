#!/bin/bash

# Hook Stop do Claude Code — grava nota diária no Obsidian automaticamente
# Detecta arquivos modificados via git e extrai o último output do assistente

VAULT="/Users/thiagomorgado/Desktop/freela-contrantate/Freela_Contratante"
DIARIO="$VAULT/Diario"
PROJECT_ROOT="/Users/thiagomorgado/Desktop/freela-contrantate"
DATE=$(date +"%Y-%m-%d")
TIME=$(date +"%H:%M")
NOTE="$DIARIO/$DATE.md"

mkdir -p "$DIARIO"

# Lê o JSON do stdin
INPUT=$(cat)

# Extrai último output significativo do assistente
LAST_OUTPUT=$(echo "$INPUT" | python3 -c "
import json, sys

try:
    data = json.load(sys.stdin)
except Exception:
    print('Sessao registrada.')
    sys.exit(0)

messages = data.get('messages', [])
outputs = []

for m in reversed(messages):
    if m.get('role') == 'assistant':
        content = m.get('content', '')
        if isinstance(content, list):
            for block in content:
                if isinstance(block, dict) and block.get('type') == 'text':
                    text = block.get('text', '').strip()
                    if len(text) > 30:
                        outputs.append(text)
        elif isinstance(content, str) and len(content.strip()) > 30:
            outputs.append(content.strip())
    if outputs:
        break

print(outputs[0][:2000] if outputs else 'Sessao de trabalho concluida.')
" 2>/dev/null || echo "Sessao de trabalho concluida.")

# Detecta arquivos modificados e criados no git
GIT_MODIFIED=$(cd "$PROJECT_ROOT" && git diff --name-only 2>/dev/null | grep "^src/" | head -15)
GIT_STAGED=$(cd "$PROJECT_ROOT" && git diff --name-only --cached 2>/dev/null | grep "^src/" | head -15)
GIT_UNTRACKED=$(cd "$PROJECT_ROOT" && git ls-files --others --exclude-standard 2>/dev/null | grep "^src/" | head -10)

# Monta bloco de arquivos se houver mudanças
FILES_SECTION=""
if [ -n "$GIT_MODIFIED$GIT_STAGED$GIT_UNTRACKED" ]; then
    FILES_SECTION=$'\n### Arquivos alterados\n\n| Arquivo | Ação |\n|---|---|'
    while IFS= read -r f; do
        [ -n "$f" ] && FILES_SECTION="$FILES_SECTION"$'\n'"| \`$f\` | Modificado |"
    done <<< "$(echo -e "$GIT_MODIFIED\n$GIT_STAGED" | sort -u)"
    while IFS= read -r f; do
        [ -n "$f" ] && FILES_SECTION="$FILES_SECTION"$'\n'"| \`$f\` | Criado |"
    done <<< "$GIT_UNTRACKED"
fi

# Cria nota do dia se não existir
if [ ! -f "$NOTE" ]; then
    cat > "$NOTE" <<EOF
---
title: "$DATE"
tags:
  - diario
  - sessao
date: $DATE
---

# $DATE
EOF
fi

# Adiciona bloco da sessão
cat >> "$NOTE" <<EOF


---

## Sessão $TIME

$LAST_OUTPUT
$FILES_SECTION
EOF

echo "✓ Obsidian atualizado: $NOTE"
