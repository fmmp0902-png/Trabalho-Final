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

function draw() {
  circle(mouseX, mouseY, 60);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
