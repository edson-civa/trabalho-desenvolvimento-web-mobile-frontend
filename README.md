# Playce

Frontend de uma loja de jogos, desenvolvido com Next.js, React, TypeScript e Bootstrap.

## Executar

1. Instale as dependências com `npm ci`.
2. Copie `.env.example` para `.env.local` e ajuste `API_URL` para o endereço da API NestJS, incluindo `/api`.
3. Inicie o backend e execute `npm run dev` neste projeto.
4. Acesse `http://localhost:3000`.

Para executar a versão de produção, use `npm run build` e depois `npm start`. O backend deve continuar disponível no endereço configurado. Reinicie o frontend após alterar a configuração da API.

## Funcionalidades

- Catálogo público, busca e detalhes dos jogos.
- Cadastro, login e acesso conforme o perfil do usuário.
- Carrinho, registro de compras e biblioteca.
- Planos e assinaturas com acesso temporário e descontos.
- Publicação e edição de jogos.
- Administração de usuários e catálogo, com resumo de vendas.

As telas utilizam a API. A instalação de jogos, a execução e as conquistas são demonstrações locais; o pagamento não realiza cobranças reais.

## Organização

- `src/app`: páginas e proteção das rotas.
- `src/components`: componentes compartilhados.
- `src/contexts`: estado de autenticação.
- `src/hooks`: lógica compartilhada do carrinho.
- `src/lib`: comunicação com a API, sessão e adaptação dos dados.
- `src/types`: tipos compartilhados da interface.

Para conferir o código, use `npm run lint` e `npx tsc --noEmit`.

Para a entrega do código, não é necessário incluir `node_modules` nem `.next`: essas pastas são geradas pelos comandos de instalação e execução. Configure o ambiente com `.env.example`.
