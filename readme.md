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

## Referências