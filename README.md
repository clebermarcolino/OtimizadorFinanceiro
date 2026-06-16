# Otimizador Financeiro

> Ferramenta web para modelagem e resolução de problemas de **Programação Linear**, desenvolvida como atividade prática da disciplina de Sistemas de Apoio a Gestão com base na questão do **ENADE 2021**.

---

## 🌐 Demo

🔗 **[Acesse o projeto ao vivo no Netlify](https://otimizadorfinanceiro.netlify.app/)**

---

## 📋 Sobre o Projeto

Este projeto transforma um problema real de **otimização de custos de produção** em um modelo matemático de Programação Linear, resolvido de forma automática e interativa pelo navegador.

O problema envolve uma empresa de montagem de computadores que possui duas fábricas — uma na **Zona Franca de Manaus** e outra na **Região Sul** do Brasil — e precisa atender uma demanda mínima de desktops, notebooks e netbooks com o **menor custo possível**.

---

## ⚙️ Funcionalidades

- ✅ **Parâmetros editáveis** — o usuário pode alterar a capacidade de produção, custos e demanda de cada fábrica
- ✅ **Modelo atualizado em tempo real** — a formulação matemática (função objetivo e restrições) reflete os valores inseridos instantaneamente
- ✅ **Solver automático** — encontra a solução ótima pelo método dos vértices da região viável
- ✅ **Verificação das restrições** — exibe se cada restrição foi atendida no ponto ótimo
- ✅ **Detalhamento do cálculo** — mostra o passo a passo de como Z foi calculado
- ✅ **Restaurar padrões** — retorna os valores originais do ENADE 2021 com um clique
- ✅ **Alerta de inviabilidade** — notifica quando os parâmetros não geram solução viável

---

## 🧮 Modelo Matemático

### Variáveis de Decisão

| Variável | Significado |
|----------|-------------|
| `x` | Número de dias de operação da fábrica de **Manaus** |
| `y` | Número de dias de operação da fábrica do **Sul** |

### Função Objetivo

Minimizar o custo total de produção:

```
min Z = 150.000x + 210.000y
```

### Restrições

```
8.000x + 2.000y ≥ 16.000   →   4x + y ≥ 8     // desktops
1.000x + 1.000y ≥  6.000   →    x + y ≥ 6     // notebooks
2.000x + 7.000y ≥ 28.000   →   2x + 7y ≥ 28   // netbooks
x ≥ 0,  y ≥ 0
```

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura e marcação semântica |
| **CSS3** | Estilização, variáveis CSS, layout com Grid e Flexbox |
| **JavaScript** | Lógica do algoritmo, manipulação do DOM, eventos |
| **Google Fonts** | Tipografia: Space Grotesk + JetBrains Mono |
| **Netlify** | Hospedagem e deploy contínuo |

Sem dependências externas, frameworks ou bibliotecas — **100% vanilla**.

---

## 📁 Estrutura do Projeto

```
OtimizadorFinanceiro/
├── assets/
  ├── favicon.png
├── index.html       # Estrutura da interface
├── style.css        # Estilização da interface
├── index.js.js      # Lógica do algoritmo e interatividade
└── README.md        # Documentação do projeto
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos

- [VS Code](https://code.visualstudio.com/)
- Extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/OtimizadorFinanceiro.git

# 2. Abra a pasta no VS Code
cd OtimizadorFinanceiro
code .

# 3. Clique com o botão direito no index.html
#    e selecione "Open with Live Server"
```

O projeto será aberto em `http://127.0.0.1:5500`.

---

## 📖 Como Usar

1. **Ajuste os parâmetros** nos cards de entrada (produção diária, custos e demanda) ou mantenha os valores padrão do ENADE 2021
2. **Observe o modelo** matemático sendo atualizado automaticamente na seção "Formulação em Programação Linear"
3. **Clique em "Calcular"** para executar o projeto
4. **Analise o resultado** — dias de operação de cada fábrica, custo mínimo e verificação de cada restrição
5. **Clique em "Limpar"** para limpar os resultados e voltar aos valores originais

---

## 🧠 Como o projeto Funciona

O algoritmo implementa o **Método dos Vértices** da Programação Linear:

1. Monta as restrições a partir dos inputs do usuário
2. Calcula todas as interseções entre pares de retas de restrição
3. Verifica quais pontos satisfazem **todas** as restrições (região viável)
4. Avalia a função objetivo `Z` em cada vértice viável
5. Retorna o vértice com o **menor valor de Z** como solução ótima

---
