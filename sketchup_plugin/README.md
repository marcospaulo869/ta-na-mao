# Tudo Mais Fácil — Plugin SketchUp
## Madeira Forte Planejados · v1.0

Este plugin importa dentro do SketchUp as medições feitas no app **Tudo Mais Fácil** e gera automaticamente a parede 3D com todos os componentes: aberturas (portas e janelas), colunas, vigas, rodapé, tomadas, interruptores, pontos de água, esgoto, gás e registros.

---

## 📦 Instalação (2 minutos)

### 1. Baixe o arquivo `tudo_mais_facil.rbz`

O arquivo já está pronto na pasta `dist/`.

### 2. Instale no SketchUp

1. Abra o SketchUp (versão **2017 ou superior**, Windows ou Mac)
2. No menu superior, vá em **Extensions → Extension Manager**
   *(em versões antigas: Window → Extension Manager)*
3. Clique em **Install Extension…** (canto inferior esquerdo)
4. Selecione o arquivo `tudo_mais_facil.rbz`
5. Se aparecer aviso de "extensão não assinada", clique em **Yes / Sim**
6. Feche o Extension Manager

### 3. Pronto!

O plugin aparece em dois lugares:
- **Menu Extensions → Tudo Mais Fácil — Madeira Forte**
- **Barra de ferramentas "Tudo Mais Fácil"** (arraste para onde preferir)

---

## 🚀 Como usar

### Opção A — Importar arquivo local (offline)

1. No app **Tudo Mais Fácil**, cadastre a parede e clique em **"Exportar SketchUp"** → um arquivo `.tmf.json` é baixado
2. No SketchUp, vá em **Extensions → Tudo Mais Fácil → Importar Parede (arquivo local)…**
3. Selecione o arquivo baixado
4. A parede é gerada automaticamente ✨

### Opção B — Importar direto da nuvem

1. No SketchUp: **Extensions → Tudo Mais Fácil → Configurar URL do App**
   Cole a URL do seu app (padrão: `https://sketch-toolkit-1.preview.emergentagent.com`)
2. Vá em **Extensions → Tudo Mais Fácil → Importar Parede (da nuvem)**
3. Escolha na lista qual parede importar
4. Clique em **Importar** — pronto!

---

## 🧪 Testar sem app

Se quiser ver o plugin funcionando antes de conectar ao app, use o arquivo de exemplo:

`samples/parede_exemplo.tmf.json`

É uma parede de 4m × 2,80m com 1 coluna, 1 viga, 1 porta, 1 janela e vários pontos de instalação. Ideal para validar a instalação.

---

## 🎨 O que é gerado

| Item | Como aparece no SketchUp |
|---|---|
| Parede | Face vertical extrudada com 15 cm de espessura, cor da foto aplicada |
| Portas | Recorte no vão (dimensões exatas) começando no piso |
| Janelas | Recorte a 1,10 m do piso (peitoril padrão) |
| Colunas | Grupo "Coluna N" — extrusão retangular do piso ao teto |
| Vigas | Grupo "Viga N" — extrusão no topo da parede |
| Rodapé | Grupo "Rodapé" — atrás da parede |
| Tomadas | Marcadores azuis 6 cm × 6 cm na parede |
| Interruptores | Marcadores amarelos 6 cm × 6 cm |
| Água / Esgoto / Gás / Registro | Marcadores coloridos (ver legenda de cores) |

**Legenda de cores dos marcadores:**
- 🔵 Tomada · 🟡 Interruptor · 🟢 Registro de água
- 🔷 Saída de água · ⚫ Saída de esgoto · 🟠 Saída de gás

Todos os grupos são nomeados (você pode selecioná-los na Outliner do SketchUp), e a operação inteira é **1 undo** (Ctrl+Z desfaz tudo de uma vez).

---

## 🔧 Solução de problemas

**"Este JSON não é um export válido"** — o arquivo precisa vir do app (`format: "TUDO_MAIS_FACIL_WALL"`). Baixe novamente a partir do botão Exportar.

**"HTTP xxx" na nuvem** — verifique a URL configurada. Testar no navegador: abrir `URL/api/walls` — deve retornar um JSON com a lista.

**Plugin não aparece no menu** — reinicie o SketchUp após instalar. Confira se apareceu em `Extension Manager` com status "Enabled".

---

## 📁 Estrutura interna

```
tudo_mais_facil.rbz  (é um zip renomeado)
├── tudo_mais_facil.rb              # entry point
└── tudo_mais_facil/
    ├── main.rb                     # menus + toolbar
    ├── generator.rb                # cria geometria 3D
    ├── loader.rb                   # baixa da nuvem via HTTPS
    ├── dialog.rb                   # janela de seleção
    └── ui/
        ├── picker.html             # UI da janela (dark/gold)
        └── icon.png                # ícone da toolbar
```

---

**© 2026 Madeira Forte Planejados** · Realizando Sonhos
