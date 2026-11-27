# Aplicação Ocorrências — GitHub Pages + Supabase

Projeto estático responsivo com login, cadastro, listagem, alteração de situação e exclusão de ocorrências. Os dados ficam no Supabase e podem ser acessados em diferentes dispositivos usando a mesma conta.

## 1. Criar o banco no Supabase

1. Acesse https://supabase.com/ e crie uma conta/projeto.
2. Crie um projeto e guarde a senha do banco em local seguro.
3. No painel do projeto, abra **SQL Editor** > **New query**.
4. Abra `supabase/schema.sql` deste pacote, copie todo o conteúdo e execute no SQL Editor.
5. Em **Project Settings** > **API**, copie a **Project URL** e a chave pública **anon** (ou publishable key, conforme exibida).
6. Abra `src/config.js` e substitua os dois valores de exemplo:
   - `SUPABASE_URL`: URL do projeto.
   - `SUPABASE_ANON_KEY`: chave pública/anon.
   Não use a chave `service_role` nem qualquer chave secreta no navegador.

## 2. Configurar autenticação

1. No Supabase, abra **Authentication** > **Providers** > **Email** e mantenha Email habilitado.
2. Para começar de forma simples, você pode desabilitar temporariamente a confirmação de e-mail em **Authentication** > **Sign In / Providers** (a localização exata pode variar no painel). Em produção, é recomendável manter a confirmação habilitada.
3. Em **Authentication** > **URL Configuration**, adicione a URL publicada do GitHub Pages em **Site URL** e também em **Redirect URLs**. Exemplo: `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`.
4. Crie uma conta na tela do aplicativo. Se a confirmação de e-mail estiver ativa, confirme o e-mail antes de entrar.

## 3. Publicar no GitHub Pages

1. Crie um repositório no GitHub, por exemplo `ocorrencia`.
2. Envie todos os arquivos e pastas deste pacote, preservando a estrutura:
   - `index.html`
   - `src/config.js`
   - `src/app.js`
   - `src/styles.css`
   - `supabase/schema.sql`
   - `README.md`
3. No repositório, abra **Settings** > **Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione a branch `main` e a pasta `/ (root)`. Clique em **Save**.
6. Aguarde a publicação. O GitHub mostrará o endereço do site, normalmente `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`.
7. Volte ao Supabase e confirme que esse endereço está cadastrado nas URLs de autenticação.

## 4. Testar em computador e smartphone

1. Abra a URL do GitHub Pages no computador.
2. Crie uma conta e entre.
3. Cadastre uma ocorrência de teste.
4. Abra a mesma URL no smartphone e entre com a mesma conta.
5. O registro deverá aparecer. Teste também a alteração de situação e a exclusão.

## 5. O que esta versão faz

- Login e criação de conta por e-mail e senha.
- Cadastro de ocorrência com título, local, descrição e situação.
- Listagem ordenada da mais recente para a mais antiga.
- Alteração da situação e exclusão.
- Layout adaptável para celular e computador.
- Isolamento dos dados por usuário usando Row Level Security (RLS).

## Segurança e limites

- A chave `anon`/publishable é pública por natureza; a proteção dos dados depende das políticas RLS do arquivo SQL.
- Nunca publique a chave `service_role`.
- Esta versão é configurada para cada usuário ver apenas os próprios registros. Se várias pessoas precisarem compartilhar a mesma lista de ocorrências, será necessário ajustar o modelo de permissões para equipe/organização.
- Não armazene dados altamente sensíveis sem avaliar requisitos de privacidade, acesso, retenção e proteção.
- O plano gratuito do Supabase tem limites de uso e pode mudar. Consulte a página de preços antes de colocar a aplicação em uso contínuo.
