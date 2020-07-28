## Board system with ReactJS and Socket IO
---
## Sistema de Board com ReactJS e Socket IO

#### Você pode ver a página em funcionamento [clicando aqui](https://leonardosantos.herokuapp.com/socketboard). Abra duas páginas, mova, crie ou delete os Cards para ver o WebSocket em ação.

Esse é um sistema simples de Quadros inspirado no Trello.

Pelo foco não ser o design, optei por uma estilização simples de CSS puro (dessa vez sem Styled Components), porém limpo e intuitivo.

Os pontos que gostaria de destacar nesse projeto são:
- O sistema de Drag and Drop desenvolvido a partir do existente no próprio HTML, ou seja, sem nenhum plugin ou biblioteca.
- A integração com WebSocket para atualização dos cards em tempo real para todos os clients.

Optei por deixar todo o código do front-end em um único arquivo para evitar a passagem de muitos parâmetros nas funções, por isso o arquivo ficou relativamente longo. Apesar disso, está bem organizado e bem legível. Você pode vê-lo em [src/frontend/src/App.js](https://github.com/syllomex/websocket-board/blob/master/src/frontend/src/App.js)

Já o back-end ficou bem mais simples, somente com algumas funcionalidades do Socket IO e o armazenamento dos cards de forma temporária no próprio servidor. Não há banco de dados pois não é o foco do projeto. Todo o funcionamento do socket pode ser visto em [src/socket.js](https://github.com/syllomex/websocket-board/blob/master/src/socket.js)

[Portfólio completo](https://leonardosantos.herokuapp.com)
