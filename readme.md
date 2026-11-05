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

A function `vetor(lat, lon)` converte a latitude e a longitude numa posição 3D [x, y, z] numa esfera de raio 1. O x é `cos(lat) * sin(lon)`, o y é `sin(lat)` e o z é `cos(lat) * cos(lon)`.

```javascript
function vetor(lat, lon) {
  return [cos(lat) * sin(lon), sin(lat), cos(lat) * cos(lon)];
}
```

A `juntarTrajetoria(lista, lat, lon, dia)` junta uma posição á trajetória. Se a nova posição ficar longe da anterior, preenche o caminho com pontos intermédios, o número de passos é a distância dividida por 2 e arredondada para cima com o `ceil()`, ou seja, um ponto por cada 2 graus. Cada ponto intermédio é calculado com o `lerp()` aplicado a x, y e z de `vetor()`, e depois volta a ser posto na superfície da esfera, dividindo pelo comprimento do vetor (`tamanho`, calculado com `sqrt()`). A latitude e a longitude são recuperados com `asin()` e `atan2()`. O valor de dia também é misturado com o `lerp()`, para a cor mudar de forma grafualmente. No fim, o `splice()` mantém só as 1500 posições mais recentes.

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

Utilizei a function `draw()`, e em seguida a `background()` para atribuir uma cor ao fundo. Em seguida utilizei o `giro += 0.08` para fazer o globo rodar lentamente. Com o `mills()`é possivel ler o tempo para a variável `agora` e calular o `cosInc` e o `sinInc` uma só vez, poupando muitos cálculos. O raio do globo do ecrã é `min(width, height) * 0.38`, ou seja, adapta-se ao tamanho da janela do navegador. Em seguida, desenha-se as estrelas com `desenharEstrelas()`, todos os pontos são percorridos com `desenharPonto()`, desenha-se a trajetoria com `desenharTrajetoria`, escre-se a lista com a infomação com `escreverInfo()` e, por último utilizo `desenharInfoISS(raio), para que a caixa que aparece quando o cursor passa por cima da ISS ficar por cima de tudo.

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

Para colocar os pontos na terra, utilizei a function `desenharPonto()`, que desenha cada ponto da terra.
Primeiramente converte-se a latitude e a longitude numa posição 3D numa esfera de raio 1. O `y` é negativo porque o eixo y do ecrã aponta para baixo, o `giro`soma-se á longitude para o globo rodar e o `z` é maior do que 0 zero porque é a metade virada para nós.
Em seguida, com o `cosInc` e o `sinInc` inclina-se o globo com uma rotação á volta do eixo horizontal e dá os valores `y2`e `z2`. Se o `z2` for menor do que 0, o ponto está atrás do globo e a function termina com `return`, sem o desenhar.
Utilizei `sin(agora * 0.07 + (p.lat + p.lon) * 2)` para calcular o "pulso", ou seja fazer com que os pontos cresçam e encolham devagar. O `sin()` devolve um valor que oscila entre -1 e 1, e como o tempo (`agora`) não pára de aumentar, o valor sobe e desce sem parar. Para cada ponto começar num momento diferente, somei a latitude e a longitude do ponto `p.lat + p.lon`. Assim, os pontos não pulsam todos ao mesmo tempo e os que estão perto uns dos outros pulsam de forma parecida, o que cria uma onda que passa pelo globo. O tamanho do ponto é o tamanho base do seu tipo multiplicado por `1 + 0.25 * pulso`. Quando o `pulso` é 1, o ponto fica 25% maior, e quando é -1%, fica 25% mais pequenos.
Os pontos perto da ISS (brilho acima de 0,02) ficam maiores, com uma pulsação mais rápida e a cor passar para a `COR_ISS` com o `lerp()`, que mistura dois valores sendo 0 o primeiro e 1 o segundo.
Por fim aplico a perspectiva do ponto, ou seja junto á borda do globo onde o `z2` é pequeno, os pontos ficam mais pequenos e transparentes `tamanho *= (0.4 + 0.6 * z2) * raio / 270` e `fill(r, g, b, 60 + 195 * z2)`. Por fim o `ellipse()` desenha o ponto na posição `width / 2 + x * raio` e `height / 2 + y2 * raio`.

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

Para criar as estrelas utilizei a function `criar Estrelas()`. Usei um ciclo `for` para criar tantas estrelas como o valor de `N_ESTRELAS` e, em cada volta, guarda uma estrela com 4 valores escolhidos ao acaso com o `random()`, a posição `x`e `y`, o tamanho `random(0.8, 2.2)` e uma fase `random(360)`. A posição fica guardada como fração do ecrã, de 0 a 1, e não em píxeis, por isso as estrelas ajustam-se se a janela mudar de tamanho.

```javascript
function criarEstrelas() {
  for (let i = 0; i < N_ESTRELAS; i++) {
    estrelas.push({ x: random(), y: random(), tam: random(0.8, 2.2), fase: random(360) });
  }
}
```

Para desenhar as estrelas, converti a posição de cada uma para píxeis. Com o `dist()`, verifiquei se a estrela está dentro do globo e, se estiver, saltei-a com o `continue`, porque a Terra tapa as estrelas. As outras são desenhadas com o `ellipse()`. A opacidade das estrelas muda com o `sin(agora * 0.05 + e.false)` e, como cada estrela tem uma fase diferente, cintilam em momentos diferentes. 

```javascript
function desenharEstrelas(raio) {
  for (const e of estrelas) {
    const x = e.x * width;
    const y = e.y * height;
    if (dist(x, y, width / 2, height / 2) < raio) continue;
    fill(210, 220, 255, 120 + 100 * sin(agora * 0.05 + e.fase));
    ellipse(x, y, e.tam, e.tam);
  }
}
```

Com a function `projetar()`, transformei a latitude e a longitude de um ponto na sua posição no ecrã, com a mesma projeção da `desenharPonto()`, mas para ser usada na trajetória. Devolve o `x`e o `y` no ecrã e também o `z`, que indica se o ponto está virado para nós (`z` maior do que 0) ou atrás do globo.

```javascript
function projetar(lat, lon, raio) {
  const x = cos(lat) * sin(lon + giro);
  const y = -sin(lat);
  const z = cos(lat) * cos(lon + giro);
  return { x: width / 2 + x * raio, y: height / 2 + (y * cosInc - z * sinInc) * raio, z: y * sinInc + z * cosInc };
}
```

Para desenhar o rasto luminoso da ISS, usei a function `desenharTrajetoria()` que, se a trajetória tiver a menos de 2 pontos, não faz nada. Com o `map()`e a `projetar()` converti todos os pontos para o ecrã, e com o `blendMode()` ativo soma a luz das camadas que se sobrepõem, deixando as zonas mais claras e criando o efeito de brilho. A linha é desenhada 3 vezes, uma por cima da outra, com larguras e opacidades diferentes (`[4, 0.1], [1.7, 0.3], [0.6, 1]`), o que forma um halo largo, um halo médio e um núcleo fino. Em cada camada, o ciclo liga cada ponto ao anterior com o `line()`e salta os segmentos que ficam atrás do globo. A variável `idade` vai de 0, no ponto mais antigo, a 1, no mais recente. A cor mistura-se com o `lerp()` entre `COR_NOITE` e `COR_DIA`, conforme o ponto estivesse ao sol ou na sombra. A opacidade é `255 * pow(idade, 1.2) * opacidade`, por isso o rasto vai desaparecendo e a espessura do `strokeWeight()`é `(1.5 + 3 * idade) * largura * escala`, por isso a linha engrossa até ao ponto mais recente. Por fim desenhei a cabeça do rasto, onde a ISS se encontra, com dois `ellipse()`, um halo trnasparente que pulsa e um núcleo pequeno e claro. A `escala` (`raio / 270`) faz com que tudo se ajuste ao tamanho do globo.

```javascript
function desenharTrajetoria(raio) {
  const n = trajetoria.length;
  if (n < 2) return;
  const escala = raio / 270;
  const pts = trajetoria.map(p => projetar(p.lat, p.lon, raio));
  blendMode(ADD);                                  
  for (const [largura, opacidade] of [[4, 0.1], [1.7, 0.3], [0.6, 1]]) {
    for (let i = 1; i < n; i++) {
      if (pts[i - 1].z < 0 || pts[i].z < 0) continue;           
      const idade = i / (n - 1);                                 
      const d = trajetoria[i].dia;                               
      stroke(lerp(COR_NOITE[0], COR_DIA[0], d), lerp(COR_NOITE[1], COR_DIA[1], d), lerp(COR_NOITE[2], COR_DIA[2], d),
             255 * pow(idade, 1.2) * opacidade);                
      strokeWeight((1.5 + 3 * idade) * largura * escala);        
      line(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
    }
  }
  noStroke();
  const cabeca = pts[n - 1];                             
  if (cabeca.z > 0) {
    const pulso = 1 + 0.2 * sin(agora * 0.3);
    fill(255, 190, 110, 60);
    ellipse(cabeca.x, cabeca.y, 18 * escala * pulso, 18 * escala * pulso);
    fill(255, 245, 225);
    ellipse(cabeca.x, cabeca.y, 5 * escala, 5 * escala);                    
  }
  blendMode(BLEND);
}
```

Para escrever a informação da ISS que se encontra no canto inferior esquerdo, usei a function `escreverInfor()`. Em seguida pedi as linhas de texto à `linhasInfo()` e, com um ciclo `for`, escreve-as com o `text()`, de baixo para cima, com 20 píxeis de distância entre cada uma

```javascript
function escreverInfo() {
  fill(200, 215, 255);
  textSize(13);
  const estado = issReal ? '' : '  (posição simulada)';
  text('ISS · latitude ' + nf(issLat, 1, 2) + '° · longitude ' + nf(issLon, 1, 2) + '°' + estado, 24, height - 24);
}
```

As `linhasInfo()`devolve as linhas de texto com a informação da ISS. Serve tanto a caixa de texto do canto esquerdo como a caixa de texto que aparece com o cursor sobre o local da ISS, por isso o texto está escrito num só sítio. Se não houver dados da API (`dadosISS` é `null`), mostra só a latitude e a longitude simuladas, formatadas com o `nf()`, e o aviso `posição simulada`. Caso contrário, mostra 6 linhas sendo elas a hora, a altitude em km, a velocidade em km/h, a latitude e a longitude em graus e se a ISS está de dia ou de noite. A hora vem do `timestamp` da API, que está em segundo, por isso multipliquei por 1000 para criar um `Date` e escrevi-a com o `toLocaleTimeString('pt-PT')`. O `Number.isFinite()` verifica se o `timestamp` é um número válido e, se não for, usa a hora atual `(Date.now() / 1000)`, para nunca aparecer "Invalid Date". A linha do dia e da noite depende do campo `visibility`, se for `eclipsed`, a ISS está de noite e, em qualquer outro caso, está de dia.

```javascript
function linhasInfo() {
  if (!dadosISS) {
    return ['Latitude: ' + nf(issLat, 1, 2) + '°', 'Longitude: ' + nf(issLon, 1, 2) + '°', '(posição simulada)'];
  }
  const d = dadosISS;
  const segundos = Number.isFinite(d.timestamp) ? d.timestamp : Date.now() / 1000;
  const hora = new Date(segundos * 1000).toLocaleTimeString('pt-PT');
  return [
    'Hora: ' + hora,
    'Altitude: ' + nf(d.altitude, 1, 2) + ' km',
    'Velocidade: ' + nf(d.velocity, 1, 2) + ' km/h',
    'Latitude: ' + nf(d.latitude, 1, 4) + '°',
    'Longitude: ' + nf(d.longitude, 1, 4) + '°',
    d.visibility === 'eclipsed' ? 'A ISS está de noite' : 'A ISS está de dia'
  ];
}
```

Para desenhar a caixa que aparece ao passar com o cursor na ISS, utilizei a function `desenharInfoISS()`. Primeiramente, com o `projetar()`, calculei onde a ISS está no ecrã e termina logo com o `return` se a ISS estiver atrás do globo (`p.z < 0`) ou se o rato estiver a mais de 20 píxeis dela, medido com o `dist()`. Depois para pedir as linhas, utilizei as `linhasInfo()` calculei o tamanho da caixa, com 190 píxeis de largura e 20 pixeis de altura por linha, mais uma pequena margem. A caixa aparece junto ao rato, a 18 píxeis, e o `min()` impede que saia do ecrã. O retângulo que se encontra no fundo da caixa de texto é desenhada com o `rect()`, com os cantos arredondados e um fundo escuro semitransparente, e o texto é escrito por cima, linha a linha, com o `text()`.

```javascript
function desenharInfoISS(raio) {
  const p = projetar(issLat, issLon, raio);
  if (p.z < 0 || dist(mouseX, mouseY, p.x, p.y) > 20) return;
  const linhas = linhasInfo();
  const w = 190, h = linhas.length * 20 + 16;
  const x = min(mouseX + 18, width - w - 10);
  const y = min(mouseY + 18, height - h - 10);
  fill(10, 15, 30, 220);
  rect(x, y, w, h, 6);
  fill(220, 230, 255);
  textSize(13);
  for (let i = 0; i < linhas.length; i++) text(linhas[i], x + 12, y + 22 + i * 20);
}
```

Utilizei a function `mouseDragged()` para mudar a posição do globo ao arrastar o rato. O movimento na horizontal (`mouseX - pmouseX`) soma-se ao `giro` e faz o globo rodar. O movimento na vertical (`mouseY - pmouseY`) altera a `inclinacao`, que o `constrain()` limita entre -80 e 80 graus.

```javascript
function mouseDragged() {
  giro += (mouseX - pmouseX) * 0.4;
  inclinacao = constrain(inclinacao - (mouseY - pmouseY) * 0.3, -80, 80);
}
```

Para que a janela mude de tamanho, utilizei a function `windowResized()` e em seguida o `resizeCanvas(windowWidth, windowHeight)` para ajustar a área de desenho.

```javascript
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
```

## Dados dos pontos
Para os dados dos pontos, da terra, oceano e fronteiras utilizei a inteligência artificial Claude (Anthropic) para me ajudar a gerá-los. Assim, a AI desenhou e calculou os pontos, e eu coloquei os resultados no fim do `sketch.js`. Por ser um bloco muito grande e que não se altera, deizei-o no fim, depois de todas as functions.
Os dados estão divididos em três listas para cada tipo de ponto, o `OCEANO`, `TERRA` e `FRONTEIRAS`. Cada lista é uma sequência de pares `[latitude, longitude]`, em graus, e cada par é um ponto da Terra.

 Assim sendo, o primeiro número é a latitude e vai de -90 a 90, os valores positivos são a norte do equador e os negativos a sul. A longitude é o segundo número e vai de -180 a 180, os valores positivos são a este do meridiano de Greenwich e os negativos a oeste. O mar e a terra foram criados com uma rede uniforme de pontos, uma esprial de Fibonacci, que espalha os pontos de forma regular pela esfera. Depois, essa rede foi filtrada com uma máscara de terra do Natural Earth. Os pontos que caem em terra foram para a lista `TERRA` e os que caem no mar foram para a lista `OCEANO`. As fronteiras, que incluem as costas, são pontos colocados a distâncias iguais ao longo das linhas do Natural Earth. No código, a function `criarPontos()` chama a `adicionar()` para cada uma destas linhas, e é aí que cada par `[latitude, longitude]` se transforma num ponto que é desenhado no globo.

```javascript
[88.9,0.9],[87.7,139.2],[85.4,-86.3]
```

## Uso de Inteligência Artificial
O conceito do projeto final foi concebido por mim com alguma ajuda da Inteligência Artificial para aprimorar certos detalhes. Na concretização do código em p5.js recorri á IA Claude que elaborou a partir da descrição que fiz do resultado pretendido. O mesmo se verificou na geração dos dados dos pontos da Terra, preparados à parte com a sua ajuda.
O código foi testado ao longo do processo e sujeito a alterações por minha parte, por razões visuais como ajuste de cores, tamanhos e velocidades, e por necessidade de corrigir erros que foram surgindo. Estas intervenções exigiram a compreensão do funcionamento do código, e não apenas a sua utilização. 
Relativamente ao readme, também foi necessária alguma ajuda do claude. No entanto fiz alterações com o objetivo de tornar as explicações o mais claras possíel, reformulando explicações menos compreensiveis e acrescentando a informação em falta.


## Referências
[setup()](https://p5js.org/reference/p5/setup/)
[draw()](https://p5js.org/reference/p5/draw/)
[createCanvas()](https://p5js.org/reference/p5/createCanvas/)
[angleMode()](https://p5js.org/reference/p5/angleMode/)
[noStroke()](https://p5js.org/reference/p5/noStroke/)
[textFont()](https://p5js.org/reference/p5/textFont/)
[background()](https://p5js.org/reference/p5/background/)
[fill()](https://p5js.org/reference/p5/fill/)
[stroke()](https://p5js.org/reference/p5/stroke/)
[strokeWeight()](https://p5js.org/reference/p5/strokeWeight/)
[ellipse()](https://p5js.org/reference/p5/ellipse/)
[line()](https://p5js.org/reference/p5/line/)
[text()](https://p5js.org/reference/p5/text/)
[textSize()](https://p5js.org/reference/p5/textSize/)
[(nf())](https://p5js.org/reference/p5/nf/)
[sin()](https://p5js.org/reference/p5/sin/)
[cos()](https://p5js.org/reference/p5/cos/)
[constrain()](https://p5js.org/reference/p5/constrain/)
[lerp()](https://p5js.org/reference/p5/lerp/)
[dist()](https://p5js.org/reference/p5/dist/)
[random()](https://p5js.org/reference/p5/random/)
[millis()](https://p5js.org/reference/p5/millis/)
[blendMode()](https://p5js.org/reference/p5/blendMode/)
[mouseDragged()](https://p5js.org/reference/p5/mouseDragged/)
[pmouseX()](https://p5js.org/reference/p5/pmouseX/)
[windowResized()](https://p5js.org/reference/p5/windowResized/)
[resizeCanvas()](https://p5js.org/reference/p5/resizeCanvas/)
[FetchAPI](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
[asyncfunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
[trycatch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)
[setInterval()](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval)
[Termsofuse](https://www.naturalearthdata.com/about/terms-of-use/)
[DeveloperAPI](https://wheretheiss.at/w/developer)
