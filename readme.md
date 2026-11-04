# Trabalho Final

## Intencionalidade

## Processo
Comecei por definir as constantes que se podem alterar para mudar o aspeto do projeto. A `const COR` guarda as três cores dos pontos (mar, terra e fronteiras) e a `const TAMANHO`guarda o diâmetro dos diferentes pontos (1.6 para o mar, 2.4 para a terra e 3.6 paras as fronteiras). A `const COR_ISS` é referente á cor dos pontos perto da ISS e a `const RAIO_ISS` define até que distância da ISS os pontos da Terra são destacados, no caso 9 graus. A `const DURACAO_RASTO` controla o tamanho do resto, sendo que perto de 1 o rasto é longo e perto de 0 é curto. A `const COR_DIA` e a `const COR_NOITE` são as cores do rasto que indicam que parte da terra está dia e noite, e a `const N_ESTRELAS` é o número de estrelas do fundo.

```javascript
const COR = [[70, 105, 165], [130, 180, 240,], [235, 242, 255]];
const TAMANHO = [1.6, 2.4, 3.6];
const COR_ISS = [255, 170, 60];
const RAIO_ISS = 9;
const DURACAO_RASTO = 0.985;
const COR_DIA = [255, 170, 80];
const COR_NOITE = [90, 140, 255];
const N_ESTRELAS = 250;
```
A variável `let pontos` guarda todos os pontos da terra, a `let giro`é a rotação do globo á volta do eixo vertical em graus e a `let inclinacao` é a inclinação do globo, que é negativa para se ver o polo norte. A `let issLat`e a `let issLon` são a posição atual do ISS e a `let issReal` verifica se os dados vieram da API (Application Programming Interface), sendo uma forma de um programa pedir informação a outro programa. A `let agora` guarda o tempo atual, lido uma vez por frame, e a `let consInc` e `let sinInc` guarda o cosseno e o seno da inclinação, calculados também uma vez por frame. A `let trajetoria` guarda as posições da ISS ao longo do tempo, as `let estrelas` guardam as estrelas do fundo e, por fim, a `let dadosISS` guarda tudo o que a API devolveu e fica a `null` quando a posição é simulada.

```javascript
let pontos = [];                     
let giro = 0;                    
let inclinacao = -20;                
let issLat = 0, issLon = 0;          
let issReal = false;                   
let agora = 0;                         
let cosInc = 1, sinInc = 0;            
let trajetoria = [];                   
let estrelas = [];
let dadosISS = null; 
```
Na function `setup()` usei o `createCanvas(windowWidth, windowHeight)` para criar a área de trabalho com o tamnho da janela do navegador. O `angleMode(DEGREES)` faz com que o `sin()` e o `cos()` trabalhem em graus, como a latitude e a longitude, e o `noStroke()` tira o contorno aos pontos. Defini o tipo de letra com o `textFont Georgia` e coloquei `criarPontos()` e `criarEstrelas()` para preparar os dados. Depois coloquei o `carregarHistorico()`, que pede as últimas 2 horas da trajetória e `atualizarISS()`, que pede a posição da ISS atual. O `setInterval(atualizarISS, 5000)` repete este pedido de 5 em 5 segundos.

```javascript
function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  noStroke();
  textFont('Georgia');
  criarPontos();
  criarEstrelas();
  carregarHistorico();
  atualizarISS();
  setInterval(atualizarISS, 5000);
}
```

A function `criarPontos()` serve para chamar três vezes a function `adicionar()`, uma para cada lista de dados (`OCEANO`, `TERRA` e `FRONTEIRAS`), com um número , sendo 0 para o mar, 1 para a terra e 2 para as fronteiras. A function `adicionar(lista, tipo)`percorre cada par `[lat, lon]` da lista com um ciclo `for...of` e guarda um objeto na lista `pontos`, com a latitude, a longitude, o tipo e o `brilho`. O brilho começa a 0, que é o estado normal, e vai até 1, que significa que o ponto está mesmo por baixo da ISS. 

```javascript
function criarPontos() {
  adicionar(OCEANO, 0);
  adicionar(TERRA, 1);
  adicionar(FRONTEIRAS, 2);
}
```
```javascript
function adicionar(lista, tipo) {
  for (const [lat, lon] of lista) {
    pontos.push({ lat: lat, lon: lon, tipo: tipo, brilho: 0 }); 
  }
}
```

Para obter a posição da ISS usei o `fetch`, que faz pedido à API pública. O primeiro `.then` converte a resposta em dados e o segundo verifica se vieram a latitude e a longitude. Se vieram, guarda-as em `issLat`e `ìssLon`, põe `issReal = True`, guarda a resposta completa em `dadosISS`, junta a posição à trajetória com `juntarTrajetoria()`e chama `destacarISS()`. Se o pedido falhar, o `.cacth` põe `issReal = false` e `dadosISS = null`, calcula uma posição com `issSimulada()` e faz o mesmo, mas com o valor de dia 0.5 que significa desconhecido.

```javascript
function atualizarISS() {
  fetch('https://api.wheretheiss.at/v1/satellites/25544')
    .then(resposta => resposta.json())
    .then(dados => {
      if (dados.latitude === undefined) throw 'sem dados';
      issLat = dados.latitude;
      issLon = dados.longitude;
      issReal = true;
      dadosISS = dados;
      juntarTrajetoria(trajetoria, issLat, issLon, valorDia(dados.visibility));
      destacarISS();
    })
    .catch(() => {
      dadosISS = null;
      issReal = false;
      issSimulada();
      juntarTrajetoria(trajetoria, issLat, issLon, 0.5);
      destacarISS();
    });
}
```

A function `issSimulada()` serve para a demonstração funcionar sem internet. A `const fase` é um ângulo que avança com o tempo (`millis () / 1000 * 0,97`, em graus). A latitude é `51,6 * sin(fase)`, por isso a ISS sobe e desce até 51,6 graus de latitude, e a longitude avança com `(fase % 360) - 180`. O tempo é acelerado em relação ao real.

```javascript
function issSimulada() {
  const fase = millis() / 1000 * 0.97;
  issLat = 51.6 * sin(fase);              
  issLon = (fase % 360) - 180;  
}
```

Sempre que a ISS muda de posição, a function `destacarISS()` percorre todos os pontos. Primeiro multiplica o brilho de cada ponto por `DURACAO_RASTO`, o que faz o brilho enfraquecer um pouco e é o que cria o rasto. Depois calcula a distância do ponto à ISS com `distancia()` e, se for menor do que `RAIO_ISS`, o brilho passa a ser o maior entre o valor atual e `1 - d / RAIO_ISS`, de modo que quanto mais perto da ISS, mais brilho.

```javascript
function destacarISS() {
  for (const p of pontos) {
    p.brilho *= DURACAO_RASTO;
    const d = distancia(p.lat, p.lon, issLat, issLon);
    if (d < RAIO_ISS) p.brilho = max(p.brilho, 1 - d / RAIO_ISS);
  }
}
```

A function `distancia(lat1, lon1, lat2, lon2)` calcula a distância entre dois pontos da terra, em graus, com a fórmula da distância sobre a esfera. O valor `c` é calculado com senos e cossenos das latitudes e das longitudes, e o `acos()` devolve o ângulo entre os dois pontos. Usei o `constrain(c, -1, 1)` porque o `acos()`só aceita valores entre -1 e 1 e pequenos erros de arredondamento  podiam passar disso.

```javascript
function distancia(lat1, lon1, lat2, lon2) {
  const c = sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(lon1 - lon2);
  return acos(constrain(c, -1, 1));
}
```


## Referências