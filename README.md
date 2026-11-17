# Peres Tarefas

Sistema simples de **controle de tarefas e responsabilidades** da equipe de um escritório de advocacia.

Ele resolve quatro problemas do dia a dia:

- **Controle das tarefas:** o que está pendente, em andamento e concluído.
- **Responsabilidades:** quem é o responsável por cada tarefa, com prioridade e prazo.
- **Acompanhamento:** painel com a carga de cada pessoa e as tarefas atrasadas.
- **Tudo em um lugar:** observações e atualizações ficam registradas na própria tarefa, em vez de espalhadas no WhatsApp.

O sistema roda **em um computador do próprio escritório**. Não precisa de internet para funcionar, não tem mensalidade e os dados não saem do escritório. Os outros computadores acessam pelo navegador, pela rede local.

---

## Sumário

- [Para o escritório: instalar e usar](#para-o-escritório-instalar-e-usar)
  - [1. Instalar](#1-instalar)
  - [2. Primeiro acesso](#2-primeiro-acesso)
  - [3. Cadastrar a equipe](#3-cadastrar-a-equipe)
  - [4. Usar no dia a dia](#4-usar-no-dia-a-dia)
  - [5. Acessar de outros computadores](#5-acessar-de-outros-computadores)
  - [6. Backup](#6-backup)
  - [7. Esqueci a senha](#7-esqueci-a-senha)
  - [8. Atualizar para uma versão nova](#8-atualizar-para-uma-versão-nova)
  - [9. Problemas comuns](#9-problemas-comuns)
- [Para desenvolvedores](#para-desenvolvedores)

---

## Para o escritório: instalar e usar

### 1. Instalar

Não é preciso instalar nenhum programa.

1. Baixe o arquivo **`PeresTarefas-x.y.z.zip`** na página de [Releases do projeto](https://github.com/rodriguesrai/peresTarefas/releases).
2. Clique com o botão direito no arquivo baixado e escolha **"Extrair tudo..."**.
3. Escolha uma pasta fixa, por exemplo `C:\PeresTarefas`. Evite deixar na pasta Downloads, que costuma ser limpa.
4. Abra a pasta extraída e dê dois cliques em **`Iniciar Peres Tarefas`**.

Uma janela preta vai abrir e, alguns segundos depois, o navegador abre sozinho.

> **Não feche a janela preta** enquanto estiver usando o sistema. Ela é o "motor" do sistema. Para desligar, basta fechá-la.

Na primeira vez, o sistema também cria o atalho **"Peres Tarefas"** na área de trabalho. Das próximas vezes, use esse atalho.

**Se aparecer "O Windows protegeu o computador":** clique em **"Mais informações"** e depois em **"Executar assim mesmo"**. O aviso aparece porque o arquivo foi baixado da internet.

**Se o Windows perguntar sobre o Firewall:** clique em **"Permitir acesso"**. É isso que deixa os outros computadores do escritório usarem o sistema.

### 2. Primeiro acesso

Na primeira vez, o navegador abre a tela **"Bem-vindo ao Peres Tarefas"**.

Cadastre o seu nome, e-mail e uma senha de pelo menos 8 caracteres. Essa pessoa será o **gestor** do sistema.

Pronto: o sistema já está em uso.

### 3. Cadastrar a equipe

1. No menu, entre em **Pessoas** e clique em **Nova pessoa**.
2. Preencha nome, e-mail e cargo, e escolha o perfil:
   - **Colaborador:** vê as próprias tarefas, muda o status e registra observações.
   - **Gestor:** além disso, cria e distribui tarefas, vê o painel da equipe e cadastra pessoas.
3. O sistema mostra uma **senha provisória**, como `abcd-efgh-jkmn`. Passe para a pessoa junto com o e-mail.
4. No primeiro acesso, a pessoa cria a própria senha.

Quando alguém sair do escritório, abra o nome dela em **Pessoas** e clique em **Desativar acesso**. As tarefas dela continuam no histórico.

### 4. Usar no dia a dia

**Para todos:**

- **Minhas tarefas** é a tela inicial. Ela mostra as suas tarefas em aberto, quantas estão em andamento e quantas estão **atrasadas**, destacadas em vermelho.
- Clique em uma tarefa para ver os detalhes.
- Para mudar o status, clique em **Pendente**, **Em andamento** ou **Concluída**. Um clique basta.
- Em **Observações e atualizações**, registre o andamento. Por exemplo: "Cliente enviou os documentos, falta a procuração."

**Para o gestor:**

- **Nova tarefa:** escolha o responsável, a prioridade (baixa, média, alta ou urgente) e o prazo.
- **Todas as tarefas:** lista de tudo, com filtros por responsável, status, prioridade e "só atrasadas".
- **Painel:** visão geral da equipe. Mostra quanto cada pessoa tem pendente, em andamento e atrasado, o que foi concluído nos últimos 7 dias e o que vence nos próximos 3 dias.
- Para trocar o responsável ou o prazo, abra a tarefa e clique em **Editar**. Toda mudança de status, de responsável ou de prazo fica registrada automaticamente nas observações.

> Uma tarefa é **atrasada** quando o prazo já passou e ela ainda não foi concluída. Uma tarefa com prazo para hoje ainda não está atrasada.

### 5. Acessar de outros computadores

A janela preta mostra os endereços do sistema, por exemplo:

```
Neste computador:   http://localhost:3000
Outros computadores: http://192.168.0.10:3000
```

Nos outros computadores do escritório, abra o navegador e digite o endereço de **"Outros computadores"**. Vale salvar nos favoritos.

Para funcionar:

- o computador onde o sistema está instalado precisa estar **ligado** e com a **janela preta aberta**;
- todos precisam estar na **mesma rede**, no mesmo Wi-Fi ou cabo do escritório;
- o acesso no Firewall precisa ter sido permitido (veja o passo 1).

**Dica:** se o endereço mudar de vez em quando, peça para quem cuida da internet do escritório fixar o IP desse computador no roteador.

### 6. Backup

Todas as informações ficam em um único arquivo, dentro da pasta **`dados`**. **Nunca apague essa pasta.**

Para fazer uma cópia de segurança:

1. Dê dois cliques em **`Fazer backup`**. Pode ser com o sistema aberto.
2. A cópia é salva na pasta **`backups`**, com data e hora no nome.
3. Recomendado: **uma vez por semana**, copie a pasta `backups` para um pendrive ou para a nuvem (Google Drive, OneDrive).

O sistema também faz uma cópia automática antes de cada atualização de versão.

**Para restaurar um backup:**

1. Feche a janela preta.
2. Na pasta `dados`, renomeie `peres-tarefas.db` para `peres-tarefas-antigo.db`.
3. Copie o backup desejado da pasta `backups` para a pasta `dados` e renomeie a cópia para `peres-tarefas.db`.
4. Abra o sistema de novo.

### 7. Esqueci a senha

- **Se outra pessoa for gestora:** ela entra em **Pessoas**, abre o seu nome e clica em **Gerar nova senha provisória**.
- **Se você for o único gestor:** no computador onde o sistema está instalado, dê dois cliques em **`Recuperar acesso`**, digite o seu e-mail e use a senha provisória que aparecer.

### 8. Atualizar para uma versão nova

1. Feche a janela preta.
2. Baixe e extraia o zip da versão nova em uma pasta **temporária**.
3. Na pasta onde o sistema está instalado, **apague** as pastas `sistema` e `runtime` e os arquivos `.bat`. **Não apague `dados` nem `backups`.**
4. Copie da versão nova para a pasta instalada: as pastas `sistema` e `runtime` e os arquivos `.bat` e `COMO USAR.txt`.
5. Abra o sistema. Ele atualiza o banco de dados sozinho, depois de fazer uma cópia de segurança.

### 9. Problemas comuns

| Problema | O que fazer |
|---|---|
| O navegador não abriu sozinho | Abra o navegador e digite `http://localhost:3000`. |
| "O sistema já está aberto" | Já existe uma janela preta aberta. O navegador abre com o sistema. |
| Outro computador não acessa | Confira se a janela preta está aberta, se os dois estão na mesma rede e se o Firewall foi liberado. Para liberar depois: *Painel de Controle > Firewall do Windows Defender > Permitir um aplicativo* e marque o **Node.js** em "Privada". |
| "Muitas tentativas. Aguarde 15 minutos" | Proteção contra quem tenta adivinhar senhas. Espere 15 minutos ou peça uma senha nova ao gestor. |
| A janela preta mostrou "ERRO" | Tire um print da janela e envie para quem cuida do sistema. |

---

## Para desenvolvedores

### Tecnologias

- **Next.js 16** (App Router, Server Components e Server Actions) com **React 19** e **TypeScript**
- **Prisma 7** com **SQLite** (driver `better-sqlite3`)
- **Tailwind CSS 4**
- **Zod** para validação e **jose** para a sessão assinada

É um único app: telas e regras de negócio ficam no mesmo projeto, sem API separada.

### Rodar em desenvolvimento

Requisitos: Node.js 22 ou mais novo (o pacote usa o 24).

```bash
npm install          # instala as dependências e gera o cliente do Prisma
npm run db:migrar    # cria o banco em dados/peres-tarefas.db
npm run dev          # http://localhost:3000
```

Na primeira vez, o terminal mostra o link da configuração inicial, com o token. Abra esse link para cadastrar o primeiro gestor.

Também é possível rodar pelo **`Iniciar Peres Tarefas.bat`** na raiz do repositório. Se não houver Node instalado, ele baixa um Node portátil e faz a instalação e o build sozinho.

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento. |
| `npm run build` | Build de produção (saída `standalone`). |
| `npm run lint` | ESLint. |
| `npm run db:migrar` | Aplica as migrações sem o Prisma CLI. |
| `npm run backup` | Copia o banco para `backups/`. |
| `npm run empacotar` | Gera `dist/PeresTarefas-<versão>.zip`, o pacote pronto para o escritório. |
| `npx prisma migrate dev --name <nome>` | Cria uma migração nova depois de alterar `prisma/schema.prisma`. |

### Estrutura

```
src/
  app/                    Rotas (telas)
    (app)/                Área logada: Minhas tarefas, tarefas, painel, pessoas
    login/  alterar-senha/  configuracao-inicial/
  features/               Um módulo por assunto
    auth/                 Login, sessão, senha, configuração inicial
    people/               Cadastro da equipe
    tasks/                Tarefas, status, observações
    dashboard/            Painel do gestor
  components/             Componentes visuais compartilhados
  lib/                    Prisma, caminhos de dados, validações
prisma/                   Schema e migrações
scripts/                  Iniciador, empacotador, migração, backup, recuperação de acesso
```

Cada módulo de `features/` segue o mesmo padrão: `actions.ts` (server actions), `schemas.ts` (validação), `lib/` (consultas e regras) e `components/`.

### Modelo de dados

- **User:** pessoa do escritório, com perfil `GESTOR` ou `COLABORADOR`, situação ativa ou inativa, troca de senha obrigatória e versão de sessão.
- **Task:** título, descrição, status (`PENDENTE`, `EM_ANDAMENTO` ou `CONCLUIDA`), prioridade (`BAIXA`, `MEDIA`, `ALTA` ou `URGENTE`), prazo (só a data), responsável e quem criou.
- **TaskNote:** observações e o histórico automático de mudanças da tarefa.

"Atrasada" não é guardado no banco. É calculado a partir do prazo e do status, no fuso de Brasília.

### Distribuição

`npm run empacotar` gera um zip com esta estrutura:

```
PeresTarefas/
  Iniciar Peres Tarefas.bat   Fazer backup.bat   Recuperar acesso.bat   COMO USAR.txt
  sistema/     build standalone do Next.js, migrações e scripts
  runtime/     node.exe portátil, na mesma versão usada no build
  dados/       criada na primeira execução: banco e segredo da sessão
  backups/     criada no primeiro backup
```

O iniciador (`scripts/iniciar.ps1`) cuida de tudo na execução:
1. aplica as migrações pendentes, com cópia de segurança antes;
2. sobe o servidor em `0.0.0.0:3000`;
3. cria o atalho na área de trabalho;
4. abre o navegador, já com o token da configuração inicial na primeira vez.

Variáveis aceitas:

| Variável | Para quê |
|---|---|
| `PERES_PORTA` | Usar outra porta, em vez da 3000. |
| `PERES_DATA_DIR` | Pasta dos dados (o iniciador sempre define). |
| `COOKIE_SECURE=1` | Exigir HTTPS no cookie de sessão. Use só se publicar com HTTPS. |
| `SESSION_SECRET` | Segredo da sessão (32+ caracteres). Sem ele, é gerado sozinho em `dados/`. |
| `PERES_TESTE=1` | Em testes automáticos: não abre o navegador nem cria atalho. |

### Segurança

- As senhas são guardadas com **scrypt**, com salt aleatório, e nunca em texto.
- A sessão fica num cookie `httpOnly` assinado. Ele é invalidado ao trocar a senha, ao mudar o perfil e ao desativar a pessoa.
- O login tem limite de 5 tentativas a cada 15 minutos, e o tempo de resposta é o mesmo para e-mails existentes e inexistentes.
- Não existe senha padrão. A configuração inicial exige um **token de uso único**, gravado em `dados/`, que só quem tem acesso ao computador do sistema consegue ler.
- O sistema sempre mantém pelo menos um gestor ativo.
- Permissões são conferidas no servidor, em toda ação: o colaborador só acessa as próprias tarefas.
- **Tradeoff conhecido:** por padrão o sistema roda em `http://` na rede local, sem criptografia no tráfego. É adequado para a rede interna do escritório. Para publicar fora dela, coloque um proxy com HTTPS na frente e defina `COOKIE_SECURE=1`.
