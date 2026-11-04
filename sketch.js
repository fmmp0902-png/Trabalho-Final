const COR = [[70, 105, 165], [130, 180, 240,], [235, 242, 255]];
const TAMANHO = [1.6, 2.4, 3.6];
const COR_ISS = [255, 170, 60];
const RAIO_ISS = 9;
const DURACAO_RASTO = 0.985;
const COR_DIA = [255, 170, 80];
const COR_NOITE = [90, 140, 255];
const N_ESTRELAS = 250;

let pontos = [];                     
let giro = 0;                    
let inclinacao = -20;                
let issLat = 0, issLon = 0;          
let issReal = false;                   
let agora = 0;                         
let cosInc = 1, sinInc = 0;            
let trajetoria = [];                   
let estrelas = []; 

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

function criarPontos() {
  adicionar(OCEANO, 0);
  adicionar(TERRA, 1);
  adicionar(FRONTEIRAS, 2);
}

function adicionar(lista, tipo) {
  for (const [lat, lon] of lista) {
    pontos.push({ lat: lat, lon: lon, tipo: tipo, brilho: 0 }); 
  }
}

function atualizarISS() {
  fetch('https://api.wheretheiss.at/v1/satellites/25544')
    .then(resposta => resposta.json())
    .then(dados => {
      if (dados.latitude === undefined) throw 'sem dados';
      issLat = dados.latitude;
      issLon = dados.longitude;
      issReal = true;
      juntarTrajetoria(trajetoria, issLat, issLon, valorDia(dados.visibility));
      destacarISS();
    })
    .catch(() => {
      issReal = false;
      issSimulada();
      juntarTrajetoria(trajetoria, issLat, issLon, 0.5);
      destacarISS();
    });
}

function issSimulada() {
  const fase = millis() / 1000 * 0.97;
  issLat = 51.6 * sin(fase);              
  issLon = (fase % 360) - 180;  
}

function destacarISS() {
  for (const p of pontos) {
    p.brilho *= DURACAO_RASTO;
    const d = distancia(p.lat, p.lon, issLat, issLon);
    if (d < RAIO_ISS) p.brilho = max(p.brilho, 1 - d / RAIO_ISS);
  }
}

function distancia(lat1, lon1, lat2, lon2) {
  const c = sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(lon1 - lon2);
  return acos(constrain(c, -1, 1));
}

function valorDia(visibilidade) {
  if (visibilidade === 'daylight') return 1;
  if (visibilidade === 'eclipsed') return 0;
  return 0.5;
}

function vetor(lat, lon) {
  return [cos(lat) * sin(lon), sin(lat), cos(lat) * cos(lon)];
}

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
}

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

function criarEstrelas() {
  for (let i = 0; i < N_ESTRELAS; i++) {
    estrelas.push({ x: random(), y: random(), tam: random(0.8, 2.2), fase: random(360) });
  }
}
