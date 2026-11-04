const COR = [[70, 105, 165], [130, 180, 240,], [235, 242, 255]];
const TAMANHO = [1.6, 2.4, 3.6];
const COR_ISS = [255, 170, 60];
const RAIO_ISS = 9;
const DURACAO_RASTO = 0.985;
const COR_DIA = [255, 170, 80];
const COR_NOITE = [90, 140, 255];
const N_ESTRELAS = 250;



function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255, 45, 200);
}

function draw() {
  circle(mouseX, mouseY, 60);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
