// Antes do envio do formulário (Step 5)
document.getElementById("formPeneira").addEventListener("submit", function () {
  localStorage.setItem("nome_responsavel", document.getElementById("nome_responsavel").value);
  localStorage.setItem("nome_atleta", document.getElementById("nome").value);
  localStorage.setItem("data_teste", document.getElementById("dia_teste").value);
  localStorage.setItem("email", document.getElementById("email").value); // <- adiciona isso
});

document.addEventListener("DOMContentLoaded", function () {
  const steps = document.querySelectorAll(".form-step");
  const nextBtns = document.querySelectorAll(".next-btn");
  const prevBtns = document.querySelectorAll(".prev-btn");
  const stepper = document.querySelectorAll(".step");
  let currentStep = 0;

  function showStep(step) {
    steps.forEach((el, i) => {
      el.classList.remove("active");
      el.style.display = "none";
      if (stepper[i]) stepper[i].classList.remove("active");
    });

    if (steps[step]) {
      steps[step].classList.add("active");
      steps[step].style.display = "block";
    }
    if (stepper[step]) {
      stepper[step].classList.add("active");
    }
  }

  showStep(currentStep);

  nextBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      if (validarCampos(steps[currentStep])) {
        currentStep++;
        showStep(currentStep);
      } else {
        alert("Preencha todos os campos obrigatórios corretamente e aceite o termo de responsabilidade!");
      }
    });
  });

  prevBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });

  const form = document.getElementById("formPeneira");
  if (form) {
    form.addEventListener("submit", function (event) {
      if (!validarCampos(steps[currentStep])) {
        event.preventDefault();
        alert("Preencha todos os campos obrigatórios corretamente antes de enviar!");
      }
    });
  }

  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("selectstart", e => e.preventDefault());
  document.addEventListener("keydown", function (event) {
    const forbidden = [
      (event.ctrlKey && event.key === "c"),
      (event.ctrlKey && event.key === "u"),
      (event.ctrlKey && ["s", "p"].includes(event.key)),
      (event.ctrlKey && event.shiftKey && ["I", "J"].includes(event.key))
    ];
    if (forbidden.some(Boolean)) event.preventDefault();
  });

  obterLocalizacao();
    // >>>>> Adicionado: sincronizar campo de e-mail com localStorage
  const emailSalvo = localStorage.getItem("email");
  if (emailSalvo) {
    const campoEmail = document.getElementById("email");
    if (campoEmail) campoEmail.value = emailSalvo;
  }

  const campoEmail = document.getElementById("email");
  if (campoEmail) {
    campoEmail.addEventListener("input", function () {
      localStorage.setItem("email", this.value);
    });
  }
});

function validarCampos(stepElement) {
  const inputs = stepElement.querySelectorAll("input, select, textarea");

  for (let input of inputs) {
    if (input.offsetParent === null) continue;

    if (input.hasAttribute("required")) {
      if (input.type === "checkbox" && !input.checked) return false;
      if (input.type !== "checkbox" && !input.value.trim()) return false;
    }

    if (input.id === "email" && !validarEmail(input)) return false;
    if (input.id === "cpf_responsavel" && !validarCPF(input)) return false;
  }

  return true;
}

function validarEmail(input) {
  const email = input.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailErro = document.getElementById("emailErro");

  const valido = emailRegex.test(email);

  if (emailErro) {
    emailErro.style.display = valido ? "none" : "block";
  }

  return valido;
}

function validarCPF(input) {
  const cpf = input.value.replace(/\D/g, "");
  const cpfErro = document.getElementById("cpfErro");

  if (!cpf || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    if (cpfErro) cpfErro.style.display = "block";
    return false;
  }

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) {
    if (cpfErro) cpfErro.style.display = "block";
    return false;
  }

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) {
    if (cpfErro) cpfErro.style.display = "block";
    return false;
  }

  if (cpfErro) cpfErro.style.display = "none";
  return true;
}

function obterLocalizacao() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(mostrarCidade, erroLocalizacao, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  } else {
    obterCidadePorIP();
  }
}

function mostrarCidade(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
    .then(response => response.json())
    .then(data => {
      const cidade = data.address.city || data.address.town || data.address.village || "sua região";
      const mensagem = document.getElementById("mensagem");
      if (mensagem) {
        mensagem.innerText = `A peneira será realizada em ${cidade} por um credenciado.`;
      }
    })
    .catch(erroLocalizacao);
}

function erroLocalizacao() {
  obterCidadePorIP();
}

function obterCidadePorIP() {
  fetch("https://ipinfo.io/json?token=fa3e60fcb236b0")
    .then((res) => res.json())
    .then((data) => {
      const cidade = data.city || "sua região";
      const mensagem = document.getElementById("mensagem");
      if (mensagem) {
        mensagem.innerText = `A peneira será realizada em ${cidade} por um credenciado.`;
      }
    });
}
function mascararCEP(input) {
  input.value = input.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').substr(0, 9);
}

function buscarCEP() {
  const cepInput = document.getElementById("cep");
  const cep = cepInput.value.replace(/\D/g, '');
  const erro = document.getElementById("cepErro");
  const mensagem = document.getElementById("mensagemCredenciado");
  const indisponivel = document.getElementById("mensagemIndisponivel");
  const estadoManual = document.getElementById("estadoManual");
  const enderecoCompleto = document.getElementById("enderecoCompleto");
  const loading = document.getElementById("loadingEstado");
  const nextBtn = document.getElementById("nextBtnEndereco");

  const endereco = document.getElementById("endereco");
  const cidade = document.getElementById("cidade");
  const estado = document.getElementById("estado");

  const estadosComCredenciado = [
    "SP", "AM", "BA", "CE", "DF", "MA", "MT", "MG", "PA", "RJ",
    "RN", "RS", "PR", "SC", "AL", "PE", "PB", "PI", "SE"
  ];

  erro.style.display = 'none';
  mensagem.style.display = 'none';
  indisponivel.style.display = 'none';
  estadoManual.style.display = 'none';
  enderecoCompleto.style.display = 'block';
  loading.style.display = 'none';
  nextBtn.disabled = true;

  if (!cep || cep.length !== 8) return;

  loading.style.display = 'flex';

  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(res => res.json())
    .then(data => {
      setTimeout(() => {
        loading.style.display = 'none';

        if (data.erro || !data.localidade || !data.uf) {
          erro.style.display = 'inline';
          estadoManual.style.display = 'block';
          enderecoCompleto.style.display = 'none';
          return;
        }

        const logradouro = data.logradouro || '';
        const bairro = data.bairro || '';
        const cidadeVal = data.localidade || '';
        const estadoVal = data.uf || '';

        endereco.value = `${logradouro}, nº , ${bairro} - ${cidadeVal}/${estadoVal}`;
        cidade.value = cidadeVal;
        estado.value = estadoVal;

        if (estadosComCredenciado.includes(estadoVal)) {
          mensagem.style.display = 'block';
          indisponivel.style.display = 'none';
          enderecoCompleto.style.display = 'block';
          estadoManual.style.display = 'none';
          nextBtn.disabled = false;
        } else {
          mensagem.style.display = 'none';
          indisponivel.innerHTML = '⚠️ Ainda não estamos disponíveis neste estado. Selecione um estado com peneira disponível abaixo:';
          indisponivel.style.display = 'block';
          enderecoCompleto.style.display = 'none';
          estadoManual.style.display = 'block';
          nextBtn.disabled = true;
        }
      }, 3000);
    })
    .catch(() => {
      setTimeout(() => {
        loading.style.display = 'none';
        erro.style.display = 'inline';
        estadoManual.style.display = 'block';
        enderecoCompleto.style.display = 'none';
      }, 3000);
    });
}

function estadoSelecionadoManual() {
  const estadoSelecionado = document.getElementById("estadoSelect").value;
  const mensagem = document.getElementById("mensagemCredenciado");
  const indisponivel = document.getElementById("mensagemIndisponivel");
  const estadoCampo = document.getElementById("estado");
  const loading = document.getElementById("loadingEstado");
  const nextBtn = document.getElementById("nextBtnEndereco");

  if (!estadoSelecionado) return;

  estadoCampo.value = estadoSelecionado;

  const estadosComCredenciado = [
    "SP", "AM", "BA", "CE", "DF", "MA", "MT", "MG", "PA", "RJ",
    "RN", "RS", "PR", "SC", "AL", "PE", "PB", "PI", "SE"
  ];

  mensagem.style.display = 'none';
  indisponivel.style.display = 'none';
  loading.style.display = 'flex';
  nextBtn.disabled = true;

  setTimeout(() => {
    loading.style.display = 'none';
    if (estadosComCredenciado.includes(estadoSelecionado)) {
      mensagem.style.display = 'block';
      nextBtn.disabled = false;
    } else {
      mensagem.style.display = 'none';
      indisponivel.innerHTML = '⚠️ Ainda não estamos disponíveis neste estado. Selecione um estado com peneira disponível abaixo:';
      indisponivel.style.display = 'block';
      nextBtn.disabled = true;
    }
  }, 3000);
}
  // Aplica máscara de CPF
  const cpfInput = document.getElementById('cpf_responsavel');
  if (cpfInput) {
    IMask(cpfInput, { mask: '000.000.000-00' });
  }

  function validarCPF(campo) {
    const cpf = campo.value.replace(/[^\d]+/g, '');
    const erro = document.getElementById('cpfErro');

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
      erro.style.display = 'inline';
      return false;
    }

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) {
      erro.style.display = 'inline';
      return false;
    }

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) {
      erro.style.display = 'inline';
      return false;
    }

    erro.style.display = 'none';
    return true;
  }


function gerarPix() {
  document.getElementById("mensagemGerandoPix").style.display = "block";
  document.getElementById("gerarPixArea").style.display = "none";
  fetch("criar_pix.php")
    .then(res => res.json())
    .then(data => {
      document.getElementById("mensagemGerandoPix").style.display = "none";
      if (data.qr_code_base64 && data.qr_code) {
        document.getElementById("qrcodePix").innerHTML = `<img src="${data.qr_code_base64}" style="width:200px;" />`;
        document.getElementById("pixCode").value = data.qr_code;
        document.getElementById("pixInfo").style.display = "block";
        document.getElementById("confirmacaoPagamento").style.display = "block";
      } else {
        alert("Erro ao gerar Pix.");
        document.getElementById("gerarPixArea").style.display = "block";
      }
    })
    .catch(() => {
      alert("Erro ao conectar com o servidor.");
      document.getElementById("mensagemGerandoPix").style.display = "none";
      document.getElementById("gerarPixArea").style.display = "block";
    });
}

function copiarPix() {
  const pixCodeInput = document.getElementById("pixCode");
  pixCodeInput.select();
  pixCodeInput.setSelectionRange(0, 99999); // For mobile devices
  document.execCommand("copy");
  document.getElementById("toast").style.display = "block";
  setTimeout(() => {
    document.getElementById("toast").style.display = "none";
  }, 3000);
}

function refazerQRCodePix() {
  document.getElementById("pixInfo").style.display = "none";
  document.getElementById("confirmacaoPagamento").style.display = "none";
  document.getElementById("gerarPixArea").style.display = "block";
}

function simularPagamento() {
  document.getElementById("statusPagamento").innerText = "Aguardando confirmação do pagamento...";
  document.getElementById("btnPagamento").disabled = true;
  setTimeout(() => {
    document.getElementById("statusPagamento").innerText = "Pagamento confirmado! Sua inscrição foi enviada.";
    document.getElementById("btnEnviar").style.display = "block";
  }, 3000);
}

function abrirMotivoTaxa() {
  document.getElementById("modalMotivoTaxa").style.display = "flex";
}

function fecharMotivoTaxa() {
  document.getElementById("modalMotivoTaxa").style.display = "none";
}

function abrirTermo() {
  document.getElementById("modalTermo").style.display = "flex";
}

function fecharModal() {
  document.getElementById("modalTermo").style.display = "none";
}

function abrirChat() {
  document.getElementById("chat-box").style.display = "flex";
}

function fecharChat() {
  document.getElementById("chat-box").style.display = "none";
}

function enviar() {
  const mensagemInput = document.getElementById("mensagem");
  const chatMensagens = document.getElementById("chat-mensagens");
  const mensagem = mensagemInput.value.trim();

  if (mensagem) {
    const div = document.createElement("div");
    div.classList.add("msg", "usuario");
    div.innerText = mensagem;
    chatMensagens.appendChild(div);
    mensagemInput.value = "";
    chatMensagens.scrollTop = chatMensagens.scrollHeight;

    // Simular resposta do admin
    setTimeout(() => {
      const adminDiv = document.createElement("div");
      adminDiv.classList.add("msg", "admin");
      adminDiv.innerText = "Olá! Recebemos sua mensagem e responderemos em breve.";
      chatMensagens.appendChild(adminDiv);
      chatMensagens.scrollTop = chatMensagens.scrollHeight;
    }, 1000);
  }
}

function removerAcentos(input) {
  input.value = input.value.normalize("NFD").replace(/[^\w\s.]/g, "");
}

function verificarEstadoManual() {
  const estadoInput = document.getElementById("estado");
  const estadoManualDiv = document.getElementById("estadoManual");
  const nextBtn = document.getElementById("nextBtnEndereco");
  const mensagemCredenciado = document.getElementById("mensagemCredenciado");
  const mensagemIndisponivel = document.getElementById("mensagemIndisponivel");

  const estadosComCredenciado = [
    "SP", "AM", "BA", "CE", "DF", "MA", "MT", "MG", "PA", "RJ",
    "RN", "RS", "PR", "SC", "AL", "PE", "PB", "PI", "SE"
  ];

  if (estadoInput.value.trim() !== "") {
    if (estadosComCredenciado.includes(estadoInput.value.toUpperCase())) {
      mensagemCredenciado.style.display = "block";
      mensagemIndisponivel.style.display = "none";
      nextBtn.disabled = false;
    } else {
      mensagemCredenciado.style.display = "none";
      mensagemIndisponivel.innerHTML = "⚠️ Ainda não estamos disponíveis neste estado. Por favor, escolha um estado com peneira disponível abaixo:";
      mensagemIndisponivel.style.display = "block";
      nextBtn.disabled = true;
    }
  } else {
    mensagemCredenciado.style.display = "none";
    mensagemIndisponivel.style.display = "none";
    nextBtn.disabled = true;
  }
}




