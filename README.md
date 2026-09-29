# EstudeAI

Landing page em português, construída com **HTML5, CSS3 e JavaScript vanilla**, sem frameworks ou dependências de execução. A identidade usa turquesa, verde-água e coral do logotipo original.

## Abrir

Abra `index.html` diretamente no navegador. Para visualizar por um servidor local, com Node.js 18 ou superior:

```sh
npm run dev
```

Acesse `http://127.0.0.1:4173`. Não é necessário executar `npm install`.

## Arquivos

- `index.html`: conteúdo semântico, dashboards, formulário e diálogos.
- `style.css`: tokens visuais, layout, responsividade e animações.
- `script.js`: navegação, controles, demonstração e validação do formulário.
- `assets/logo-estudeai.png`: cópia do logotipo fornecido, preservado sem alterações.
- `tools/`: servidor local e empacotamento estático.
- `tests/`: verificações da lógica do treino e integridade dos recursos locais.

## Interações

- Menu responsivo, navegação por âncoras e destaque da seção atual.
- Prévia do simulado com alternativas selecionáveis.
- Dashboard demonstrativo com períodos de 7 e 30 dias.
- Quatro níveis de pressão, acessíveis por teclado com setas, Home e End.
- Treino de três questões, cronômetro real, opção de pular, contagem de trocas e revisão das respostas.
- Diálogos nativos com suporte a Escape e foco modal.
- Respeito à preferência por movimento reduzido.

## Escopo da demonstração

Os dados dos dashboards são fictícios e estão identificados como demonstrativos. Os percentuais de evolução representam diferenças em pontos percentuais nas séries ilustrativas. O treino calcula resultados apenas no navegador e não constitui avaliação de preparo para exames.

**Não há backend:** envio de materiais, geração por IA, autenticação e cadastro real na lista de espera ainda não estão implementados. O formulário valida os campos e confirma explicitamente que nenhum cadastro foi enviado. Não persiste dados pessoais em cookies ou armazenamento local. Contato e redes sociais mostram uma mensagem informativa porque nenhum canal oficial foi fornecido.

Para ativar a lista de espera, conecte o evento de envio em `script.js` a um endpoint, implemente estados de carregamento/erro/sucesso e atualize os textos de confirmação e privacidade. Use somente links oficiais de contato e redes sociais.

O nome EstudeAI foi mantido também no rodapé para corresponder à identidade fornecida, em vez de usar a menção isolada a PerformAI no texto de referência.

## Verificar e empacotar

```sh
npm run check
npm run build
```

O build copia os três arquivos e `assets/` para `dist/`. Essa pasta pode ser publicada em qualquer hospedagem estática. O código funciona sem conexão com fontes, bibliotecas ou imagens externas; apenas os links de referências científicas abrem sites externos.
