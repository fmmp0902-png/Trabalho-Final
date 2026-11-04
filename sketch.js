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