export {};

// Seleção dos botões da barra lateral
const btnAulas = document.getElementById('btn-nav-aulas');
const btnMeet = document.getElementById('btn-nav-meet');
const btnPerfil = document.getElementById('btn-nav-perfil');
const btnSair = document.getElementById('btn-sair');

// Navegação entre as telas
btnAulas?.addEventListener('click', () => {
  window.location.href = 'painel.html';
});

btnMeet?.addEventListener('click', () => {
  window.location.href = 'hexa-meet.html';
});

btnPerfil?.addEventListener('click', () => {
  window.location.href = 'perfil.html';
});

btnSair?.addEventListener('click', () => {
  const querSair = confirm('Tem certeza que deseja sair do Hexavante?');
  if (querSair) {
    window.location.href = 'index.html';
  }
});