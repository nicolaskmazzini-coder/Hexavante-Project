const formulario = document.querySelector('form');

formulario?.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const emailInput = document.getElementById('email') as HTMLInputElement;
  const senhaInput = document.getElementById('senha') as HTMLInputElement;

  if (emailInput.value && senhaInput.value) {
    // Em vez de dar um alerta chato, nós mandamos o app abrir o Painel!
    window.location.href = 'painel.html';
  }
});