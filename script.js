const form = document.getElementById("negocieForm");
const modal = document.getElementById("modalConfirmacao");
const modalTexto = document.getElementById("modalTexto");

let dadosClientes = [];

/* =========================
   DATA DA INSPEÇÃO (HOJE)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString("pt-BR");
  document.getElementById("dataInspecao").value = dataFormatada;
});

/* =========================
   CARREGAR dados.txt
   Formato:
   CNPJ/CPF;Cliente;Fluido;TipoInspeção
========================= */
async function carregarArquivo() {
  const response = await fetch("dados.txt");
  const texto = await response.text();

  const linhas = texto.split("\n").map(l => l.trim()).filter(l => l);
  linhas.shift(); // remove cabeçalho

  dadosClientes = linhas.map(linha => {
    const [codigo, razao, fluido, tipo] = linha.split(";").map(p => p.trim());
    return { codigo, razao, fluido, tipo };
  });
}
carregarArquivo();

/* =========================
   BUSCA PELO CÓDIGO
========================= */
document.getElementById("codigo").addEventListener("change", function () {
  const codigo = this.value.trim().toUpperCase();
  const cliente = dadosClientes.find(c => c.codigo === codigo);

  if (cliente) {
    document.getElementById("razao").value = cliente.razao;
    document.getElementById("fluido").value = cliente.fluido;
    document.getElementById("tipo").value = cliente.tipo;
  } else {
    document.getElementById("razao").value = "";
    document.getElementById("fluido").value = "";
    document.getElementById("tipo").value = "";
    alert("Cliente não encontrado.");
  }
});

/* =========================
   CHECKBOX EXCLUSIVO + OBRIGATÓRIO
========================= */
const gruposChecklist = [
  "propulsora", "regulador", "suporte", "mangueiras",
  "bicoDigital", "inmetro", "visor", "bacia",
  "rotulo", "qualidade", "certificado", "aspecto",
  "contaminantes", "treinamento", "guia"
];

gruposChecklist.forEach(nome => {
  const checks = document.querySelectorAll(`input[name="${nome}"]`);
  checks.forEach(check => {
    check.addEventListener("change", () => {
      if (check.checked) {
        checks.forEach(outro => {
          if (outro !== check) outro.checked = false;
        });
      }
    });
  });
});

/* =========================
   VALIDAR CHECKLIST
========================= */
function validarChecklist() {
  for (const nome of gruposChecklist) {
    const marcado = document.querySelector(`input[name="${nome}"]:checked`);
    if (!marcado) {
      alert(`Responda a pergunta do checklist: ${nome.toUpperCase()}`);
      return false;
    }
  }
  return true;
}

/* =========================
   SUBMIT / RESUMO
========================= */
form.addEventListener("submit", e => {
  e.preventDefault();

  if (!validarChecklist()) return;

  const get = id => document.getElementById(id)?.value || "";

  let texto = `📋 *INSPEÇÃO TROCA INTELIGENTE*\n\n`;

  texto += `📅 Data da Inspeção: ${get("dataInspecao")}\n`;
  texto += `👤 Colaborador: ${get("colaborador")}\n`;
  texto += `🏷️ Cliente: ${get("razao")}\n`;
  texto += `🧪 Fluido: ${get("fluido")}\n`;
  texto += `🔍 Tipo: ${get("tipo")}\n`;
  texto += `🧰 Kit: ${get("kit")}\n\n`;

  texto += `📦 Lote: ${get("numeroLote")}\n`;
  texto += `🔒 Lacre: ${get("lacre")}\n`;
  texto += `🛢️ Qtd. Tanque: ${get("qtdTanque")} Lts\n`;
  texto += `🚚 Última Entrega: ${get("ultimaEntrega")}\n\n`;

  texto += `📝 *CHECKLIST*\n`;

  gruposChecklist.forEach(nome => {
    const marcado = document.querySelector(`input[name="${nome}"]:checked`);
    texto += `• ${nome.replace(/([A-Z])/g, " $1").toUpperCase()}: ${marcado.value}\n`;
  });

  const obs = get("observacoes");
  if (obs) {
    texto += `\n🗒️ Observações:\n${obs}\n`;
  }

  modalTexto.textContent = texto;
  modal.style.display = "flex";

  document.getElementById("btnConfirmar").onclick = () => {
    const numeroDestino = "5585991380387";
    const link = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(texto)}`;
    window.open(link, "_blank");
    modal.style.display = "none";
  };

  document.getElementById("btnFechar").onclick = () => {
    modal.style.display = "none";
  };

  window.onclick = ev => {
    if (ev.target === modal) modal.style.display = "none";
  };
});