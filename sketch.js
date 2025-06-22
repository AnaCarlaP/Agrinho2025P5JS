let plantas = [];
let contadorPlantas = 0;
let objetivoPlantas = 100;
let tempoRestante = 60;
let estadoJogo = "INICIO"; // INICIO, JOGANDO, GANHOU, PERDEU
let intervaloTimer = null; // Inicializar como null

// Cores
let corCeu;
let corTerra;
let corArroz;
let corTexto;

let distanciaMinimaEntrePlantas = 15;

function setup() {
  createCanvas(600, 400);
  textAlign(CENTER, CENTER);
  textSize(24);

  corCeu = color(135, 206, 250);
  corTerra = color(139, 69, 19);
  corArroz = color(34, 139, 34);
  corTexto = color(0);
  // console.log("Setup: Estado inicial =", estadoJogo);
}

function draw() {
  background(corCeu);
  noStroke();
  fill(corTerra);
  rect(0, height * 0.7, width, height * 0.3); // Chão

  // Desenhar o "agricultor"
  if (estadoJogo !== "GANHOU" && estadoJogo !== "PERDEU") { // Não desenha se o jogo acabou
    fill(255, 224, 189); // Cor de pele
    ellipse(mouseX, mouseY - 20, 30, 30); // Cabeça
    fill(0, 0, 200); // Azul para a roupa
    rect(mouseX - 10, mouseY - 5, 20, 30); // Corpo
  }

  // Desenhar plantas
  for (let planta of plantas) {
    fill(corArroz);
    ellipse(planta.x, planta.y, 10, 15);
    ellipse(planta.x - 5, planta.y + 2, 8, 12);
    ellipse(planta.x + 5, planta.y + 2, 8, 12);
  }

  // Lógica de Estados e Interface
  if (estadoJogo === "INICIO") {
    fill(corTexto);
    textSize(32);
    text("Clique para começar a plantar!", width / 2, height / 2 - 50);
    textSize(18);
    text("Você tem 1 minuto para plantar 100 pés de arroz.", width / 2, height / 2);
  } else if (estadoJogo === "JOGANDO") {
    fill(corTexto);
    textSize(20);
    text(`Tempo: ${tempoRestante}`, 70, 30);
    text(`Plantas: ${contadorPlantas} / ${objetivoPlantas}`, width - 100, 30);

    // Checa vitória
    if (contadorPlantas >= objetivoPlantas) {
      estadoJogo = "GANHOU";
      pararJogo(); // Chama pararJogo aqui também para limpar o timer e parar o loop.
    }
    // Checa derrota por tempo (esta é uma checagem secundária, a primária está no timer)
    // Se o timer mudar o estado para PERDEU, este bloco não será mais "JOGANDO" no próximo frame.
    // Mas se o tempo acabar e o timer ainda não rodou para mudar o estado, o draw pode pegar.
    else if (tempoRestante <= 0) { // Se não ganhou E o tempo acabou
        // A condição `contadorPlantas < objetivoPlantas` é implícita aqui,
        // pois se fosse >=, teria entrado no if de GANHOU.
        estadoJogo = "PERDEU";
        pararJogo();
    }

  } else if (estadoJogo === "GANHOU") {
    fill(0, 128, 0); // Verde para vitória
    textSize(40);
    text("Você CONSEGUIU!", width / 2, height / 2);
    textSize(20);
    text(`Plantou ${contadorPlantas} pés de arroz!`, width / 2, height / 2 + 40);
  } else if (estadoJogo === "PERDEU") {
    fill(255, 0, 0); // Vermelho para derrota
    textSize(40);
    text("Você NÃO conseguiu...", width / 2, height / 2);
    textSize(20);
    let mensagemPerda = `Faltou plantar ${objetivoPlantas - contadorPlantas} pés.`;
    if (objetivoPlantas - contadorPlantas === 1) {
      mensagemPerda = `Faltou plantar 1 pé.`;
    }
    text(mensagemPerda, width / 2, height / 2 + 40);
  }
}

function mousePressed() {
  // Não permite cliques se o jogo já terminou e está mostrando o resultado
  if (estadoJogo === "GANHOU" || estadoJogo === "PERDEU") {
    return;
  }

  if (estadoJogo === "INICIO") {
    // Resetar variáveis para um novo jogo
    plantas = [];
    contadorPlantas = 0;
    tempoRestante = 60;
    estadoJogo = "JOGANDO";

    if (intervaloTimer) {
      clearInterval(intervaloTimer); // Limpa timer antigo, se houver
    }
    intervaloTimer = setInterval(atualizarTimer, 1000);
    // console.log("Jogo iniciado. Timer ID:", intervaloTimer);
    if (!isLooping()){ // Garante que o loop de desenho está ativo
        loop();
    }

  } else if (estadoJogo === "JOGANDO") {
    let yPlantaProposta = constrain(mouseY, height * 0.7 + 10, height - 10);
    let xPlantaProposta = constrain(mouseX, 5, width - 5);

    let podePlantar = true;
    for (let plantaExistente of plantas) {
      let d = dist(xPlantaProposta, yPlantaProposta, plantaExistente.x, plantaExistente.y);
      if (d < distanciaMinimaEntrePlantas) {
        podePlantar = false;
        break;
      }
    }

    if (podePlantar) {
      plantas.push({ x: xPlantaProposta, y: yPlantaProposta });
      contadorPlantas++;
    }
  }
}

function atualizarTimer() {
  if (estadoJogo === "JOGANDO") { // Só processa o timer se estiver jogando
    if (tempoRestante > 0) {
      tempoRestante--;
    }

    // Verifica condição de derrota por tempo APÓS decrementar
    if (tempoRestante <= 0) {
      // Se o tempo acabou e o jogador AINDA não ganhou (estado ainda é JOGANDO)
      // a lógica do draw() para JOGANDO também pegaria isso, mas aqui é mais direto do timer.
      if (contadorPlantas < objetivoPlantas) {
        // console.log("TIMER: Tempo esgotado, objetivo não alcançado. Mudando para PERDEU.");
        estadoJogo = "PERDEU";
        pararJogo(); // Importante chamar pararJogo para limpar o timer e parar o loop
      }
      // Se contadorPlantas >= objetivoPlantas, o estado GANHOU já teria sido
      // definido pelo draw() e pararJogo() chamado, então o timer já estaria limpo.
    }
  } else {
    // Se o estado não é JOGANDO (ex: INICIO, GANHOU, PERDEU),
    // mas o timer ainda está ativo por algum motivo, pare-o.
    pararJogo(); // pararJogo() já verifica se intervaloTimer existe.
  }
}

function pararJogo() {
  // console.log(`pararJogo() chamado. Estado: ${estadoJogo}. Limpando timer.`);
  if (intervaloTimer) {
    clearInterval(intervaloTimer);
    intervaloTimer = null; // Importante para evitar múltiplas limpezas ou verificações erradas
  }
  if (isLooping()) { // Só chama noLoop se o loop estiver ativo
    // console.log("Chamando noLoop()");
    noLoop(); // Para a função draw() de ser executada repetidamente
  }
}