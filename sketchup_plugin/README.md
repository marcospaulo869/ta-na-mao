# Tudo Mais Fácil — Plugin SketchUp
## Madeira Forte Planejados · v1.1

Este plugin importa no SketchUp as medições feitas no app **Tudo Mais Fácil** e gera automaticamente a parede 3D com todos os componentes: aberturas (portas e janelas), colunas, vigas, paredes em ângulo, rodapé, tomadas, interruptores, pontos de água, esgoto, gás e registros.

---

## 📦 Instalação passo a passo

**Compatível com SketchUp 2018 até 2026 (Windows e Mac)** — testado com o Ruby bundled 2.2.4 (SU 2018), 2.5.5 (SU 2019/2020), 2.7 (SU 2021/2022) e 3.2 (SU 2023/2024/2025/2026).

### Passo 1 — Baixe o arquivo `.rbz`

Baixe `tudo_mais_facil.rbz` na tela principal do app.

### Passo 2 — Abra o SketchUp e vá até o Gerenciador

**No SketchUp 2026 (versão em português):**

1. Abra o SketchUp
2. No menu superior clique em **Extensões** (fica entre "Janela" e "Ajuda")
3. Clique em **Gerenciador de Extensões**
   *(alguns idiomas mostram: Extension Manager / Extensiones)*

**No SketchUp 2023 e mais antigos:** o caminho é **Janela → Gerenciador de Extensões**.

### Passo 3 — Instale o arquivo

1. Na janela do Gerenciador de Extensões, clique em **Instalar Extensão** (canto inferior esquerdo)
2. Escolha o arquivo `tudo_mais_facil.rbz` que você baixou
3. Se aparecer um aviso de "extensão de terceiros não assinada", clique em **Sim** para confirmar
4. Feche a janela do Gerenciador

### Passo 4 — Pronto! ✨

O plugin aparece em dois lugares:

- **Menu Extensões → Tudo Mais Fácil — Madeira Forte**
- **Barra de ferramentas "Tudo Mais Fácil"** — arraste para onde preferir

---

## 🔁 Não conseguiu achar o Gerenciador?

**Método alternativo** — funciona em qualquer versão do SketchUp:

1. Abra o SketchUp
2. Menu **Extensões → Console Ruby** (Windows) ou **Window → Ruby Console** (Mac)
3. Cole o comando abaixo e pressione Enter:
   ```ruby
   UI.openURL("file:///#{Sketchup.find_support_file('Plugins')}")
   ```
4. Vai abrir a pasta `Plugins` do SketchUp
5. **Arraste** o arquivo `tudo_mais_facil.rbz` para dentro dessa pasta
6. **Feche o SketchUp e abra de novo** — o plugin já vai estar lá

---

## 🚀 Como usar

### Opção A — Importar arquivo (offline)

1. No app **Tudo Mais Fácil**, cadastre a parede e clique em **SKETCHUP** na lista de paredes salvas → baixa um `.tmf.json`
2. No SketchUp: **Extensões → Tudo Mais Fácil → Importar Parede (arquivo local)…**
3. Selecione o arquivo baixado
4. A parede aparece em 3D em segundos ✨

### Opção B — Importar direto da nuvem

1. **Extensões → Tudo Mais Fácil → Configurar URL do App**
2. Cole a URL do seu app (padrão: `https://sketch-toolkit-1.preview.emergentagent.com`)
3. **Extensões → Tudo Mais Fácil → Importar Parede (da nuvem)**
4. Escolha na lista e clique em **Importar**

---

## 🧪 Testar sem app

Baixe também o `parede_exemplo.tmf.json` na tela principal do app. É uma parede de 4 m × 2,80 m com 1 canto chanfrado (135°), 1 coluna, 1 viga, 1 porta, 1 janela e vários pontos de instalação — ideal para validar a instalação.

---

## 🎨 O que é gerado no SketchUp

| Item | Como aparece |
|---|---|
| Parede principal | Face vertical extrudada em 15 cm, cor da foto aplicada |
| Portas | Recorte no vão (dimensões exatas), do piso ao dintel |
| Janelas | Recorte a 1,10 m do piso (peitoril padrão) |
| Colunas | Grupo "Coluna N" — extrusão do piso ao teto |
| Vigas | Grupo "Viga N" — extrusão no topo |
| **Paredes em ângulo** | Grupo "Parede ângulo N (°)" — segmento dobrado a partir do canto direito (135° = chanfro, 90° = L, 180° = extensão reta) |
| Rodapé | Grupo "Rodapé" |
| Tomadas / interruptores / água / esgoto / gás | Marcadores coloridos posicionados na parede |

Legenda de cores:
🔵 Tomada · 🟡 Interruptor · 🟢 Registro de água · 🔷 Saída de água · ⚫ Saída de esgoto · 🟠 Saída de gás

Todos os grupos são nomeados (você pode selecioná-los na Outliner do SketchUp) e a operação inteira é **1 undo** (Ctrl+Z desfaz tudo).

---

## 🔧 Solução de problemas

**"Este JSON não é um export válido"** — o arquivo precisa vir do app (`format: "TUDO_MAIS_FACIL_WALL"`). Baixe novamente pelo botão SKETCHUP.

**"Não achei Gerenciador de Extensões no SketchUp 2026"** — use o Método Alternativo acima (Console Ruby).

**"Erro HTTP xxx" na nuvem** — verifique a URL configurada. Teste no navegador: abrir `URL/api/walls` — deve retornar JSON.

**Plugin não aparece no menu** — feche e abra o SketchUp novamente. Se ainda não aparecer, abra o Gerenciador de Extensões e confira se está com status **"Habilitada"** (Enabled).

**Ícones quebrados no Gerenciador em SketchUp 2026** — problema conhecido em versões PT-BR. O plugin funciona normalmente, é só a UI do Gerenciador. Você ainda consegue instalar e habilitar clicando nos locais certos.

---

## 📁 Estrutura interna

```
tudo_mais_facil.rbz  (é um zip renomeado)
├── tudo_mais_facil.rb              # entry point
└── tudo_mais_facil/
    ├── main.rb                     # menus + toolbar
    ├── generator.rb                # cria geometria 3D (paredes, ângulos, etc.)
    ├── loader.rb                   # baixa da nuvem via HTTPS
    ├── dialog.rb                   # janela de seleção
    └── ui/
        ├── picker.html
        └── icon.png
```

---

**© 2026 Madeira Forte Planejados** · Realizando Sonhos
