document.addEventListener('DOMContentLoaded', function() {
    
    // Obter referências para os elementos do DOM
    const estadoSelect = document.getElementById('estado');
    const redeSelect = document.getElementById('rede');
    const usuarioSelect = document.getElementById('usuario');
    const lojaSelect = document.getElementById('loja');
    const adicionarBtn = document.getElementById('adicionar');
    const enviarBtn = document.getElementById('enviar');
    const listaUl = document.getElementById('lista');

    // Estrutura de dados hierárquica
    const dadosHierarquicos = {
         '----------': {
            '----------': {
                'users': ['----------' ],
                'lojas': ['----------' ]
            },
        },       
        'RN': {
            'Nordestao': {
                'users': ['Mauricio', 'Mateus Eduardo','Cristiane','Amarildo', 'Roteirista' ],
                'lojas': ['Loja 1', 'Loja 2','Loja 3','Loja 4','Loja 5','Loja 6','Loja 7','Loja 8', ]
            },
            'Atacadao': {
                'users': ['Vivian', 'Amarildo', 'Nlson', 'Inacio'],
                'lojas': ['Prudente', 'Parnamirim', 'BR zona sul', 'Zona norte']
            },
            'Assai': {
                'users': ['Miqueias', 'David', 'Cosme', 'Erivan'],
                'lojas': ['Nova Parnamirim', ' BR Zona Sul', 'Zona norte', 'Ponta negra']
            },
            'Carrefour': {
                'users': ['Roteirista'],
                'lojas': ['Zona sul', 'Zona norte']
            },
            'Superfacil': {
                'users': ['Neto', 'Jordão', 'Antônio'],
                'lojas': ['Emaús', 'Olho dágua', 'Nazaré Rod.']
            },
        },
        'PB': {
            'Atacadao': {
                'users': ['Carlos Pereira', 'Daniela Martins'],
                'lojas': ['Loja 20', 'Loja 25']
            },
            'Assaí': {
                'users': ['Eduarda Santos', 'Felipe Oliveira'],
                'lojas': ['Loja 30', 'Loja 33']
            }
        },
        'PE': {
            'Carrefour': {
                'users': ['Gustavo Lima', 'Helena Almeida'],
                'lojas': ['Loja 40', 'Loja 45']
            },
            'Assaí': {
                'users': ['Isabela Souza', 'João Gomes'],
                'lojas': ['Loja 50', 'Loja 51']
            }
        },
        'AL': {
            'Nordestao': {
                'users': ['Juliana Torres', 'Leonardo Reis'],
                'lojas': ['Loja 60', 'Loja 65']
            },
            'Carrefour': {
                'users': ['Mariana Rocha', 'Nuno Fernandes'],
                'lojas': ['Loja 70', 'Loja 71']
            }
        }
    };
    
    // Funções para popular as caixas de seleção
    function popularSelect(element, data) {
        element.innerHTML = ''; // Limpa as opções existentes
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            element.appendChild(option);
        });
    }

    function atualizarEstados() {
        const estados = Object.keys(dadosHierarquicos);
        popularSelect(estadoSelect, estados);
        atualizarRedes();
    }

    function atualizarRedes() {
        const estadoSelecionado = estadoSelect.value;
        const redes = Object.keys(dadosHierarquicos[estadoSelecionado] || {});
        popularSelect(redeSelect, redes);
        atualizarUsuarios();
        atualizarLojas();
    }

    function atualizarUsuarios() {
        const estadoSelecionado = estadoSelect.value;
        const redeSelecionada = redeSelect.value;
        const usuarios = (dadosHierarquicos[estadoSelecionado] && dadosHierarquicos[estadoSelecionado][redeSelecionada]) ? dadosHierarquicos[estadoSelecionado][redeSelecionada].users : [];
        popularSelect(usuarioSelect, usuarios);
    }
    
    function atualizarLojas() {
        const estadoSelecionado = estadoSelect.value;
        const redeSelecionada = redeSelect.value;
        const lojas = (dadosHierarquicos[estadoSelecionado] && dadosHierarquicos[estadoSelecionado][redeSelecionada]) ? dadosHierarquicos[estadoSelecionado][redeSelecionada].lojas : [];
        popularSelect(lojaSelect, lojas);
    }
    
    // Adicionar listeners de evento para as caixas de seleção
    estadoSelect.addEventListener('change', () => {
        atualizarRedes();
    });
    redeSelect.addEventListener('change', () => {
        atualizarUsuarios();
        atualizarLojas();
    });

    // Chamar a função de atualização inicial
    atualizarEstados();

    // Listener para o botão 'Adicionar à Lista'
    adicionarBtn.addEventListener('click', function() {
        // Obter os valores selecionados e digitados
        const produto = document.getElementById('produto').value;
        const caixa = document.getElementById('caixa').value;
        const quantidade = document.getElementById('quantidade').value;

        // Validar a quantidade
        if (quantidade === '' || parseInt(quantidade) <= 0) {
            alert('Por favor, insira uma quantidade válida.');
            return;
        }

        // Criar um novo item de lista (li)
        const novoLi = document.createElement('li');
        novoLi.textContent = `Produto: Banana ${produto} | Tipo de Caixa: ${caixa} | Quantidade: ${quantidade} Cxs`;
        
        // Adicionar o novo item à lista
        listaUl.appendChild(novoLi);
        
        // Limpar o campo de quantidade após a adição
        document.getElementById('quantidade').value = '';
    });

    // Listener para o botão 'Enviar Estoque'
    enviarBtn.addEventListener('click', function() {
        // Coletar os dados principais do formulário
        const estado = estadoSelect.value;
        const rede = redeSelect.value;
        const usuario = usuarioSelect.value;
        const loja = lojaSelect.value;
        
        // Coletar todos os itens da lista
        const listaEstoque = [];
        const itensDaLista = listaUl.getElementsByTagName('li');

        if (itensDaLista.length === 0) {
            alert('Por favor, adicione pelo menos um item à lista antes de enviar.');
            return;
        }

        for (let i = 0; i < itensDaLista.length; i++) {
            const itemTexto = itensDaLista[i].textContent;
            // Usar regex para extrair os valores com mais robustez
            const match = itemTexto.match(/Produto: (.*?) \| Tipo de Caixa: (.*?) \| Quantidade: (.*?)$/);
            
            if (match) {
                listaEstoque.push({
                    produto: match[1].trim(),
                    caixa: match[2].trim(),
                    quantidade: parseInt(match[3].trim())
                });
            }
        }

        // Criar um objeto de dados para enviar ao servidor
        const dadosParaEnvio = {
            estado: estado,
            rede: rede,
            usuario: usuario,
            loja: loja,
            estoque: listaEstoque
        };

        // Enviar os dados para o servidor Python usando a API Fetch
        fetch('/enviar_estoque', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosParaEnvio)
        })
        .then(response => {
            // Verificar se a resposta foi bem-sucedida (status 2xx)
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                alert('Estoque enviado com sucesso!');
                // Limpar a lista após o envio bem-sucedido
                listaUl.innerHTML = '';
            } else {
                alert('Erro no envio: ' + (data.error || 'Erro desconhecido.'));
            }
        })
        .catch(error => {
            console.error('Erro de rede:', error);
            alert('Houve um erro de conexão com o servidor.');
        });
    });
});