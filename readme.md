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
Na function `setup()` usei o `createCanvas(windowWidth, windowHeight)` para criar a área de trabalho com o tamanho da janela do navegador. O `angleMode(DEGREES)` faz com que o `sin()` e o `cos()` trabalhem em graus, como a latitude e a longitude, e o `noStroke()` tira o contorno aos pontos. Defini o tipo de letra com o `textFont Georgia` e coloquei `criarPontos()` e `criarEstrelas()` para preparar os dados. Depois coloquei o `carregarHistorico()`, que pede as últimas 2 horas da trajetória e `atualizarISS()`, que pede a posição da ISS atual. O `setInterval(atualizarISS, 5000)` repete este pedido de 5 em 5 segundos.

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

Usei a function `distancia(lat1, lon1, lat2, lon2)` para calcular a distância entre dois pontos da terra, em graus, com a fórmula da distância sobre a esfera. O valor `c` é calculado com senos e cossenos das latitudes e das longitudes, e o `acos()` devolve o ângulo entre os dois pontos. Usei o `constrain(c, -1, 1)` porque o `acos()`só aceita valores entre -1 e 1 e pequenos erros de arredondamento  podiam passar disso.

```javascript
function distancia(lat1, lon1, lat2, lon2) {
  const c = sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(lon1 - lon2);
  return acos(constrain(c, -1, 1));
}
```

Com a function `valorDia(visibilidade)` foi possivel transformar o estado que a API devolve num número, 1 se for `dayLight` e 0 se for `eclipse` (na sombra da Terra) e 0,5 em qualquer outro caso. Esse número serve para escolher a cor da trajetória.
```javascript
function valorDia(visibilidade) {
  if (visibilidade === 'daylight') return 1;
  if (visibilidade === 'eclipsed') return 0;
  return 0.5;
}
```

A function `vetor(lat, lon)` converte a latitude e a longitude numa posição 3D [x, y, z] numa esfera de raio 1. O x é `cos(lat) * sin(lon)`, o y é `sin(lat) e o z é `cos(lat) * cos(lon).

```javascript
function vetor(lat, lon) {
  return [cos(lat) * sin(lon), sin(lat), cos(lat) * cos(lon)];
}
```

A `juntarTrajetoria(lista, lat, lon, dia)` junta uma posição á trajetória. Se a nova posição ficar longe da anterior, preenche o caminho com pontos intermédios, o número de passos é a distância dividida por 2 e arredondada para cima com o `ceil()``, ou seja, um ponto por cada 2 graus. Cada ponto intermédio é calculado com o `lerp()` aplicado a x, y e z de `vetor()`, e depois volta a ser posto na superfície da esfera, dividindo pelo comprimento do vetor (`tamanho`, calculado com `sqrt()`). A latitude e a longitude são recuperados com `asin()` e `atan2()`. O valor de dia também é misturado com o `lerp()`, para a cor mudar de forma grafualmente. No fim, o `splice()` mantém só as 1500 posições mais recentes.

```javascript
function juntarTrajetoria(lista, lat, lon, dia) {
  const ant = lista[lista.length - 1];
  if (ant) {
    const passos = ceil(distancia(ant.lat, ant.lon, lat, lon) / 2);
    const a = vetor(ant.lat, ant.lon);
    const b = vetor(lat, lon);
    for (let k = 1; k < passos; k++) {
      const t = k / passos;
      const x = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t), z = lerp(a[2], b[2], t);
      const tamanho = sqrt(x * x + y * y + z * z);
      lista.push({ lat: asin(y / tamanho), lon: atan2(x, z), dia: lerp(ant.dia, dia, t) });
    }
  }
  lista.push({ lat: lat, lon: lon, dia: dia });
  if (lista.length > 1500) lista.splice(0, lista.length - 1500);      
}
```

A function `carregarHistorico()` é `async` e serve para pedir à API os movimentos das últimas 2 horas, um de 3 em 3 minutos, para desenhar o caminho já feito. Como a API aceita no máximo 10 instantes por pedido, o ciclo exterior faz 4 pedidos (`bloco`de 0 a 3) e o ciclo interior cria 10 instantes em cada 180 segundos entre eles, o que dá 40 pontos. Cada pedido usa o `await fetch(...)` com os instantes separados por vírgulas (`join(',')`), e cada ponto recebido é juntado a uma trajetória à parte, o `historico`. Caso ocorra uma falha no pedido, o `try...catch` evita que o erro interrompa o processo, e a trajetória começa a partir da posição atual. Entre pedidos há uma espera de 1.1 segundos com o `setTimeout`, porque a API só permite cerca de 1 pedido por segundo. Entretanto as posições recolhidas são acrescentadas ao histórico e a `trajetoria` passa a ser o `historico`.

```javascript
async function carregarHistorico() {
  const historico = [];
  const inicio = Math.floor(Date.now() / 1000);
  for (let bloco = 0; bloco < 4; bloco++) {
    const instantes = [];
    for (let i = 0; i < 10; i++) instantes.push(inicio - (40 - bloco * 10 - i) * 180);
    try {
      const resposta = await fetch('https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=' + instantes.join(','));
      const lista = await resposta.json();
      for (const d of lista) {
        if (d.latitude !== undefined) juntarTrajetoria(historico, d.latitude, d.longitude, valorDia(d.visibility));
      }
    } catch (erro) { }
    await new Promise(resolve => setTimeout(resolve, 1100));
  }
  for (const p of trajetoria) juntarTrajetoria(historico, p.lat, p.lon, p.dia);
  trajetoria = historico;
}
```

Utilizei a function `draw()`, e em seguida a `background()` para atribuir uma cor ao fundo. Em seguida utilizei o `giro += 0.08` para fazer o globo rodar lentamente. Com o `mills()`é possivel ler o tempo para a variável `agora` e calular o `cosInc` e o `sinInc` uma só vez, poupando muitos cálculos. O raio do globo do ecrã é `min(width, height) * 0.38`, ou seja, adapta-se ao tamanho da janela do navegador. Em seguida, desenha-se as estrelas com `desenharEstrelas()`, todos os pontos são percorridos com `desenharPonto()`, desenha a trajetoria com `se
```javascript
function draw() {
  background(5, 7, 15);
  giro += 0.08;
  agora = millis();
  cosInc = cos(inclinacao);
  sinInc = sin(inclinacao);
  const raio = min(width, height) * 0.38;
  desenharEstrelas(raio);
  for (const p of pontos) desenharPonto(p, raio);
  desenharTrajetoria(raio);
  escreverInfo();
  desenharInfoISS(raio);
}
```

Para colocar os pontos na terra, utilizei a function `desenharPonto()`, que desenha cada ponto da terra em 5 passos.
Primeiramente converte-se a latitude e a longitude numa posição 3D numa esfera de raio 1. O `y` é negativo porque o eixo y do ecrã aponta para baixo, o `giro`soma-se á longitude para o globo rodar e o `z` é maior do que 0 zero porque é a metade virada para nós.
Em seguida, com o `cosInc` e o `sinInc` inclina-se o globo com uma rotação á volta do eixo horizontal e dá os valores `y2`e `z2`. Se o `z2` for menor do que 0, o ponto está atrás do globo e a function termina com `return`, sem o desenhar.
Utilizei `sin(agora * 0.07 + (p.lat + p.lon) * 2)` para calcular o "pulso", ou seja fazer com que os pontos cresçam e encolham devagar. O `sin()` devolve um valor que oscila entre -1 e 1, e como o tempo (`agora`) não pára de aumentar, o valor sobe e desce sem parar. Para cada ponto começar num momento diferente, somei a latitude e a longitude do ponto `p.lat + p.lon`. Assim, os pontos não pulsam todos ao mesmo tempo e os que estão perto uns dos outros pulsam de forma parecida, o que cria uma onda que passa pelo globo. O tamanho do ponto é o tamanho base do seu tipo multiplicado por `1 + 0.25 * pulso`. Quando o `pulso` é 1, o ponto fica 25% maior, e quando é -1%, fica 25% mais pequenos.
Os pontos perto da ISS (brilho acima de 0,02) ficam maiores, com uma pulsação mais rápida e a cor passar para a `COR_ISS` com o `lerp()`, que mistura dois valores sendo 0 o primeiro e 1 o segundo.
Por fim aplico a perspectiva do ponto, ou seja junto á borda do globo onde o `z2` é pequeno, os pontos ficam mais pequenos e transparentes ´tamanho *= (0.4 + 0.6 * z2) * raio / 270` e `fill(r, g, b, 60 + 195 * z2)`. Por fim o `ellipse() desenha o ponto na posição width / 2 + x * raio` e `height / 2 + y2 * raio`.

```javascript
function desenharPonto(p, raio) {

  const x = cos(p.lat) * sin(p.lon + giro);
  const y = -sin(p.lat);                         
  const z = cos(p.lat) * cos(p.lon + giro);      

  const y2 = y * cosInc - z * sinInc;
  const z2 = y * sinInc + z * cosInc;
  if (z2 < 0) return;                            

  const pulso = sin(agora * 0.07 + (p.lat + p.lon) * 2);
  let tamanho = TAMANHO[p.tipo] * (1 + 0.25 * pulso);
  let [r, g, b] = COR[p.tipo];

  if (p.brilho > 0.02) {
    tamanho += p.brilho * (6 + 3 * sin(agora * 0.3));
    r = lerp(r, COR_ISS[0], p.brilho);
    g = lerp(g, COR_ISS[1], p.brilho);
    b = lerp(b, COR_ISS[2], p.brilho);
  }

  tamanho *= (0.4 + 0.6 * z2) * raio / 270;
  fill(r, g, b, 60 + 195 * z2);
  ellipse(width / 2 + x * raio, height / 2 + y2 * raio, tamanho, tamanho);
}
```

## Referências