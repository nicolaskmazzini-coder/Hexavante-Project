export {}; // 1. O "escudo" que isola este arquivo dos outros

// Lógica para voltar ao Painel Principal
const btnVoltar = document.getElementById('btn-voltar');
btnVoltar?.addEventListener('click', () => {
  window.location.href = 'painel.html';
});

// --- LÓGICA PARA BUSCAR AS SALAS NO BANCO DE DADOS ---

const urlAPI = 'http://localhost/hexavante-api/salas.php';

// 2. Ensinando o TypeScript o que exatamente é uma Sala
interface Sala {
  nome_aula: string;
  codigo: string;
}

async function carregarSalas(): Promise<void> {
  try {
    const resposta = await fetch(urlAPI);
    const salas = await resposta.json();
    
    const listaSalas = document.getElementById('lista-salas');
    
    if (listaSalas) {
      listaSalas.innerHTML = '';
    }

    if (salas.length === 0) {
      if (listaSalas) listaSalas.innerHTML = '<li>Nenhuma sala ativa no momento.</li>';
      return;
    }

    // 3. Trocamos o "any" por "Sala". O corretor agora fica feliz!
    salas.forEach((sala: Sala) => {
      const itemLista = document.createElement('li');
      
      itemLista.innerHTML = `
        <span><strong>${sala.nome_aula}</strong> <br> <small>Código: ${sala.codigo}</small></span>
        <button style="width: auto; padding: 6px 12px; font-size: 12px;">Entrar</button>
      `;
      
      listaSalas?.appendChild(itemLista);
    });

  } catch (erro) {
    console.error("Erro ao buscar salas:", erro);
    const listaSalas = document.getElementById('lista-salas');
    if (listaSalas) listaSalas.innerHTML = '<li style="color: #e74c3c;">Erro ao conectar com o banco de dados. O Laragon está ligado?</li>';
  }
}

carregarSalas();