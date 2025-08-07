
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    let pedidoAtual = [];
    let quantidadesSelecionadas = {}; // Ex: {1: 2, 4: 1}
    let etapaPedido = 'inicio';
    let itemSelecionado = null;
    let dadosCliente = {
        nome: '',
        endereco: ''
    };
    let formaPagamento = '';
    let precisaTroco = false;
    let valorEmMaos = 0;
    const TAXA_ENTREGA = 4.50;

    const cardapio = {
        hamburgueres: [
            { id: 1, nome: "X-Burguer", preco: 15.00 },
            { id: 2, nome: "X-Salada", preco: 17.50 },
            { id: 3, nome: "X-Bacon", preco: 18.50 }
        ],
        acompanhamentos: [
            { id: 4, nome: "Batata Frita", preco: 8.00 },
            { id: 5, nome: "Onion Rings", preco: 9.50 }
        ],
        bebidas: [
            { id: 6, nome: "Refrigerante", preco: 5.00 },
            { id: 7, nome: "Suco Natural", preco: 6.50 }
        ]
    };

    function formatarPreco(valor) {
        return "R$ " + valor.toFixed(2).replace('.', ',');
    }

    function calcularTotalItens() {
        return pedidoAtual.reduce((sum, item) => sum + item.preco, 0);
    }

    function addMessage(text, sender = 'bot') {
        const div = document.createElement('div');
        div.className = sender === 'user' ? 'user-message' : 'bot-message';
        div.innerHTML = text;

        if (sender === 'bot') {
            div.style.animation = 'fadeInUp 0.5s ease forwards';
        }

        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

   function mostrarCardapio() {
    let msg = "<strong>🍔 Cardápio:</strong><br><br>";
    for (const categoria in cardapio) {
        msg += `<strong>${categoria.charAt(0).toUpperCase() + categoria.slice(1)}:</strong><br>`;
        cardapio[categoria].forEach(item => {
            msg += `
                <div class="item-cardapio" style="margin-bottom:10px;">
                    ${item.nome} - ${formatarPreco(item.preco)}<br>
                    <button onclick="alterarQuantidade(${item.id}, -1)">➖</button>
                    <span id="qtd-${item.id}">0</span>
                    <button onclick="alterarQuantidade(${item.id}, 1)">➕</button>
                </div>
            `;
        });
        msg += "<br>";
    }

    msg += `<button onclick="finalizarSelecao()" style="background:#ff7f50;color:white;border:none;padding:10px 15px;border-radius:8px;cursor:pointer;">Finalizar Pedido</button>`;
    etapaPedido = 'cardapio';
    return msg;
}

function alterarQuantidade(id, delta) {
    if (!quantidadesSelecionadas[id]) {
        quantidadesSelecionadas[id] = 0;
    }
    quantidadesSelecionadas[id] += delta;

    if (quantidadesSelecionadas[id] < 0) {
        quantidadesSelecionadas[id] = 0;
    }

    document.getElementById(`qtd-${id}`).innerText = quantidadesSelecionadas[id];
}

function finalizarSelecao() {
    const todasCategorias = [...cardapio.hamburgueres, ...cardapio.acompanhamentos, ...cardapio.bebidas];
    let itensAdicionados = 0;

    for (const id in quantidadesSelecionadas) {
        const quantidade = quantidadesSelecionadas[id];
        const item = todasCategorias.find(i => i.id == id);
        if (item && quantidade > 0) {
            for (let i = 0; i < quantidade; i++) {
                pedidoAtual.push(item);
            }
            itensAdicionados += quantidade;
        }
    }

    if (itensAdicionados === 0) {
        addMessage("Você não selecionou nenhum item. Por favor, selecione antes de finalizar.", 'bot');
        return;
    }

    etapaPedido = 'solicitando-nome';
    const resposta = solicitarDadosCliente();
    setTimeout(() => {
        addMessage(resposta, 'bot');
    }, 1100);
}



function selecionarItem(id) {
    const todasCategorias = [...cardapio.hamburgueres, ...cardapio.acompanhamentos, ...cardapio.bebidas];
    const item = todasCategorias.find(i => i.id === id);
    if (!item) return;

    itemSelecionado = item;
    etapaPedido = 'detalhes';

    let html = `<strong>${item.nome}</strong><br>`;
    html += `Preço unitário: ${formatarPreco(item.preco)}<br><br>`;
    html += `Quantidade: 
        <select id="quantidade-select">
            ${[...Array(10).keys()].map(i => `<option value="${i + 1}">${i + 1}</option>`).join('')}
        </select><br><br>`;
    html += `<button onclick="confirmarQuantidade()">Adicionar ao pedido</button>`;

    addMessage(html, 'bot');
}


function confirmarQuantidade() {
    const qtd = parseInt(document.getElementById('quantidade-select').value);

    if (!itemSelecionado || isNaN(qtd) || qtd < 1) {
        addMessage("Quantidade inválida.", 'bot');
        return;
    }

    for (let i = 0; i < qtd; i++) {
        pedidoAtual.push(itemSelecionado);
    }

    addMessage(`${qtd}x ${itemSelecionado.nome} adicionado(s) ao pedido!`, 'bot');
    etapaPedido = 'cardapio';
}



    function mostrarDetalhesItem(id) {
        const todasCategorias = [...cardapio.hamburgueres, ...cardapio.acompanhamentos, ...cardapio.bebidas];
        const item = todasCategorias.find(i => i.id === id);
        if (!item) {
            etapaPedido = 'cardapio';
            return "Item não encontrado. Por favor, escolha um número válido do cardápio.";
        }
        itemSelecionado = item;
        etapaPedido = 'detalhes';
        return `<strong>${item.nome}</strong><br>Preço: ${formatarPreco(item.preco)}<br><br>Deseja adicionar ao pedido? (sim/não)`;
    }

    function solicitarDadosCliente() {
        if (!dadosCliente.nome) {
            etapaPedido = 'solicitando-nome';
            return "Por favor, digite seu <strong>nome completo</strong>:";
        } else if (!dadosCliente.endereco) {
            etapaPedido = 'solicitando-endereco';
            return "Agora, digite seu <strong>endereço completo</strong>:";
        }
        return false;
    }

    function processarDadosCliente(resposta) {
        if (etapaPedido === 'solicitando-nome') {
            dadosCliente.nome = resposta;
            return solicitarDadosCliente();
        } else if (etapaPedido === 'solicitando-endereco') {
            dadosCliente.endereco = resposta;
            etapaPedido = 'pagamento';
            return solicitarFormaPagamento();
        }
    }

    function solicitarFormaPagamento() {
        const totalItens = calcularTotalItens();
        const totalPedido = totalItens + TAXA_ENTREGA;

        let mensagem = `<div class="total-pedido">TOTAL DO PEDIDO: ${formatarPreco(totalPedido)}</div>`;
        mensagem += "Escolha a <strong>forma de pagamento</strong>:<br><br>";
        mensagem += "1. 💵 Dinheiro<br>2. 📱 PIX<br>3. 💳 Cartão de Crédito<br>4. 🏦 Cartão de Débito<br><br>";
        mensagem += "Digite o número correspondente:";
        etapaPedido = 'escolhendo-pagamento';
        return mensagem;
    }

    function processarFormaPagamento(resposta) {
        const opcoes = {
            "1": "Dinheiro",
            "2": "PIX",
            "3": "Cartão de Crédito",
            "4": "Cartão de Débito"
        };

        if (!opcoes[resposta]) {
            return "Forma de pagamento inválida. Tente novamente.";
        }

        formaPagamento = opcoes[resposta];

        if (formaPagamento === "Dinheiro") {
            etapaPedido = 'precisa-troco';
            return "Você precisa de <strong>troco</strong>? (sim/não)";
        }

        return finalizarPedido();
    }

    /*function finalizarPedido() {
        const total = calcularTotalItens() + TAXA_ENTREGA;
        let mensagem = `Pedido finalizado! 🎉<br><br>
        Nome: ${dadosCliente.nome}<br>
        Endereço: ${dadosCliente.endereco}<br>
        Pagamento: ${formaPagamento}<br>`;

        if (formaPagamento === "Dinheiro" && precisaTroco) {
            const troco = valorEmMaos - total;
            mensagem += `Valor em mãos: ${formatarPreco(valorEmMaos)}<br>`;
            mensagem += `Troco: ${formatarPreco(troco)}<br>`;
        }

        mensagem += `Total com entrega: <strong>${formatarPreco(total)}</strong><br><br>`;
        mensagem += "Obrigado por comprar com a Hamburgueria Lages! 🍔";

        etapaPedido = 'finalizado';
        return mensagem; 
    } */

      function finalizarPedido() {
    const total = calcularTotalItens() + TAXA_ENTREGA;

    // Agrupar itens repetidos
    const itensAgrupados = {};
    pedidoAtual.forEach(item => {
        if (itensAgrupados[item.nome]) {
            itensAgrupados[item.nome].quantidade += 1;
        } else {
            itensAgrupados[item.nome] = { ...item, quantidade: 1 };
        }
    });

    // Montar o resumo do pedido
    let resumo = `🛍️ *Pedido Realizado!*%0A%0A`;

    Object.values(itensAgrupados).forEach(item => {
        const precoTotalItem = item.preco * item.quantidade;
        resumo += `• ${item.quantidade}x ${item.nome} - ${formatarPreco(precoTotalItem)}%0A`;
    });

    resumo += `%0A📍 *Endereço:* ${dadosCliente.endereco}`;
    resumo += `%0A👤 *Cliente:* ${dadosCliente.nome}`;
    resumo += `%0A💳 *Pagamento:* ${formaPagamento}`;
    resumo += `%0A⏳ *Tempo estimado de entrega:* 50 minutos`;

    if (formaPagamento === "Dinheiro" && precisaTroco) {
        const troco = valorEmMaos - total;
        resumo += `%0A💰 *Valor em mãos:* ${formatarPreco(valorEmMaos)}`;
        resumo += `%0A💵 *Troco:* ${formatarPreco(troco)}`;
    }

    resumo += `%0A🚚 *Entrega:* ${formatarPreco(TAXA_ENTREGA)}`;
    resumo += `%0A🧾 *Total:* ${formatarPreco(total)}`;
    resumo += `%0A%0A*Obrigado por comprar com a Hamburgueria Lages!* 🍔`;

    // Número do WhatsApp da loja (com DDI + DDD)
    const numeroWhatsApp = "5521973043816"; // <- Altere aqui

    // Criar link com mensagem pronta
    const url = `https://wa.me/${numeroWhatsApp}?text=${resumo}`;

    // Enviar diretamente (abrir nova aba com a mensagem pronta no WhatsApp)
    window.open(url, "_blank");

    etapaPedido = 'finalizado';
    return "Pedido enviado para o WhatsApp da loja!";
}



    function processMessage(message) {
        const msgLower = message.toLowerCase().trim();

        switch (etapaPedido) {
            case 'inicio':
                if (msgLower.includes('cardápio') || msgLower.includes('menu')) {
                    etapaPedido = 'cardapio';
                    return mostrarCardapio();
                }
                return "Digite 'cardápio' para ver nossas opções!";

            case 'cardapio':
                const num = parseInt(message);
                if (!isNaN(num)) {
                    return mostrarDetalhesItem(num);
                }
                if (msgLower.includes('finalizar')) {
                    if (pedidoAtual.length === 0) {
                        return "Seu pedido está vazio. Por favor, escolha algum item primeiro.";
                    }
                    return solicitarDadosCliente();
                }
                return "Digite o número do item ou 'finalizar'.";

            case 'detalhes':
                if (msgLower === 'sim' || msgLower === 's') {
                    if (itemSelecionado) {
                        pedidoAtual.push(itemSelecionado);
                        etapaPedido = 'cardapio';
                        return `${itemSelecionado.nome} adicionado! Deseja mais alguma coisa?`;
                    }
                }
                etapaPedido = 'cardapio';
                return "Ok! O que mais deseja?";

            case 'solicitando-nome':
            case 'solicitando-endereco':
                return processarDadosCliente(message);

            case 'escolhendo-pagamento':
                return processarFormaPagamento(message);

            case 'precisa-troco':
                if (msgLower === 'sim' || msgLower === 's') {
                    precisaTroco = true;
                    etapaPedido = 'valor-em-maos';
                    return "Quanto você tem em mãos?";
                } else {
                    precisaTroco = false;
                    return finalizarPedido();
                }

            case 'valor-em-maos':
                const valor = parseFloat(message.replace(',', '.'));
                const total = calcularTotalItens() + TAXA_ENTREGA;
                if (isNaN(valor) || valor < total) {
                    return `Valor inválido. O total do pedido é ${formatarPreco(total)}. Informe um valor igual ou superior.`;
                }
                valorEmMaos = valor;
                return finalizarPedido();

            default:
                return "Ocorreu um erro. Digite 'cardápio' para recomeçar.";
        }
    }

    sendButton.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (message === '') return;
        addMessage(message, 'user');

        const resposta = processMessage(message);
        if (resposta) {
            setTimeout(() => {
                addMessage(resposta, 'bot');
            }, 1100);
        }

        userInput.value = '';
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendButton.click();
    });