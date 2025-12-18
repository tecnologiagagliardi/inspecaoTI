const form = document.getElementById("negocieForm");
const modal = document.getElementById("modalConfirmacao");
const modalTexto = document.getElementById("modalTexto");

let dadosClientes = [];

/* =========================
   DATA DA INSPEÇÃO (HOJE)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const hoje = new Date();
  document.getElementById("dataInspecao").value =
    hoje.toLocaleDateString("pt-BR");
});

/* =========================
   CARREGAR dados.txt
========================= */
async function carregarArquivo() {
  const response = await fetch("dados.txt");
  const texto = await response.text();

  const linhas = texto.split("\n").map(l => l.trim()).filter(l => l);
  linhas.shift();

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
  this.value = codigo;

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
   CHECKLIST (MAPA DE PERGUNTAS)
========================= */
const checklistPerguntas = {
  propulsora: "PROPULSORA FUNCIONANDO?",
  regulador: "REGULADOR DE PRESSÃO FUNCIONANDO?",
  suporte: "SUPORTE DE PAREDE PRESENTE?",
  mangueiras: "MANGUEIRAS EM BOM ESTADO?",
  bicoDigital: "BICO DOSADOR DIGITAL FUNCIONANDO?",
  inmetro: "BICO DOSADOR CALIBRADO PELO INMETRO?",
  visor: "VISOR DE ACRÍLICO PRESENTE?",
  bacia: "BACIA DE CONTENÇÃO PRESENTE?",
  rotulo: "RÓTULO E ADESIVO DE SEGURANÇA PRESENTE?",
  qualidade: "ADESIVO DA QUALIDADE PRESENTE?",
  certificado: "CERTIFICADO DE QUALIDADE PRESENTE?",
  aspecto: "ASPECTO GERAL LIMPO?",
  contaminantes: "EQUIPAMENTO COBERTO E LIVRE DE CONTAMINANTES?",
  treinamento: "REALIZADO TREINAMENTO PARA MANUSEIO DO KIT?",
  guia: "CLIENTE ORIENTADO QUANTO ÀS INFORMAÇÕES DO GUIA?"
};

const gruposChecklist = Object.keys(checklistPerguntas);

/* =========================
   CHECKBOX EXCLUSIVO
========================= */
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
      alert(`Responda o checklist:\n${checklistPerguntas[nome]}`);
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
  texto += `🔍 Tipo Inspeção: ${get("tipo")}\n`;
  texto += `🧰 Kit: ${get("kit")}\n`;
  texto += `📦 Lote: ${get("numeroLote")}\n`;
  texto += `🔒 Lacre: ${get("lacre")}\n`;
  texto += `🛢️ Qtd. Tanque: ${get("qtdTanque")} Lts\n`;
  texto += `🚚 Última Entrega: ${get("ultimaEntrega")}\n\n`;

  texto += `📝 *CHECKLIST*\n\n`;

  gruposChecklist.forEach(nome => {
    const marcado = document.querySelector(`input[name="${nome}"]:checked`);
    texto += `• ${checklistPerguntas[nome]} ${marcado.value}\n`;
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