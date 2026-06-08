// --- LÓGICA DO BOTÃO SAIR ---
const btnSair = document.getElementById('btn-sair');
btnSair?.addEventListener('click', () => {
  const querSair = confirm('Tem certeza que deseja sair do Hexavante?');
  if (querSair) {
    window.location.href = 'index.html';
  }
});

// --- LÓGICA DO HEXA MEET (A TELA NOVA) ---
const btnMeet = document.getElementById('btn-entrar-meet');
btnMeet?.addEventListener('click', () => {
  window.location.href = 'hexa-meet.html';
});

// --- LÓGICA DAS OUTRAS PLATAFORMAS ---
const btnClassroom = document.getElementById('btn-classroom');
btnClassroom?.addEventListener('click', () => {
  window.open('https://classroom.google.com', '_blank');
});

const btnAlura = document.getElementById('btn-alura');
btnAlura?.addEventListener('click', () => {
  window.open('https://www.alura.com.br', '_blank');
});

const btnKhan = document.getElementById('btn-khan');
btnKhan?.addEventListener('click', () => {
  window.open('https://pt.khanacademy.org', '_blank');
});

const btnBradesco = document.getElementById('btn-bradesco');
btnBradesco?.addEventListener('click', () => {
  window.open('https://www.ev.org.br', '_blank');
});

const btnSoloLearn = document.getElementById('btn-sololearn');
btnSoloLearn?.addEventListener('click', () => {
  window.open('https://www.sololearn.com', '_blank');
});
// ==========================================
// --- NAVEGAÇÃO DA BARRA LATERAL E OS CARAIO ---
// ==========================================

const btnNavInicio = document.getElementById('btn-nav-inicio');
btnNavInicio?.addEventListener('click', () => {
  window.location.href = 'inicio.html';
});

const btnNavMeet = document.getElementById('btn-nav-meet');
btnNavMeet?.addEventListener('click', () => {
  window.location.href = 'hexa-meet.html';
});

const btnNavPerfil = document.getElementById('btn-nav-perfil');
btnNavPerfil?.addEventListener('click', () => {
  window.location.href = 'perfil.html';
});