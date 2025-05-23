import './styles.css';
const STORAGE_KEY = 'todoAppProjectsData';

let appData = {
    projects: [],
    currentProjectId: null,
}

// Referências aos elementos do DOM
const newTodoInput = document.getElementById('newTodoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoListUl = document.getElementById('todoList');

const newProjectInput = document.getElementById('newProjectInput');
const addProjectBtn = document.getElementById('addProjectBtn');
const projectListUl = document.getElementById('projectList');
const currentProjectNameSpan = document.getElementById('currentProjectName');

// Botão global para deletar projeto (se você tiver um e quiser manter)
// const globalDeleteProjectBtn = document.getElementById('deleteProjectBtn');

class Tarefa {
    constructor(id, texto, completada = false) {
        this.id = id;
        this.texto = texto;
        this.completada = completada;
    }

    toggleCompletada() { // Corrigido o nome do método
        this.completada = !this.completada;
    }
}
class Projeto {
    constructor(id, nome) {
        this.id = id;
        this.nome = nome;
        this.todos = [];
    }
}


function salvarDados() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function carregarDados() {
    const dadosStorage = localStorage.getItem(STORAGE_KEY);

    if (dadosStorage) {
        try {
            const dadosParsed = JSON.parse(dadosStorage);

            if (dadosParsed && Array.isArray(dadosParsed.projects)) {
                appData.projects = dadosParsed.projects.map(proj => {
                    const novoProjeto = new Projeto(proj.id, proj.nome);
                    novoProjeto.todos = proj.todos.map(tarefa =>
                        new Tarefa(tarefa.id, tarefa.texto, tarefa.completada)
                    );
                    return novoProjeto;
                });
                appData.currentProjectId = dadosParsed.currentProjectId;
            }
        } catch (error) {
            console.error('Erro ao carregar os dados do localStorage:', error);
            appData.projects = []; 
            appData.currentProjectId = null;
        }
    }

    if (appData.projects.length === 0) {
        const projetoPadrao = new Projeto(Date.now(), 'Geral');
        appData.projects.push(projetoPadrao);
        appData.currentProjectId = projetoPadrao.id;
    } else if (!appData.currentProjectId && appData.projects.length > 0) {
        appData.currentProjectId = appData.projects[0].id;
    } else if (appData.currentProjectId && !appData.projects.find(p => p.id === appData.currentProjectId)) {
        appData.currentProjectId = appData.projects.length > 0 ? appData.projects[0].id : null;
    }
    renderizarProjetos();
    renderizarLista();
    salvarDados();
}


function getProjetoAtual() {
    if (!appData.currentProjectId) return null;
    return appData.projects.find(p => p.id === appData.currentProjectId);
}

function renderizarProjetos() {
    if (!projectListUl) {
        return;
    }
    projectListUl.innerHTML = '';
    const projetoAtual = getProjetoAtual();

    if (currentProjectNameSpan) {
        currentProjectNameSpan.textContent = projetoAtual ? projetoAtual.nome : 'Nenhum projeto selecionado';
    }

    appData.projects.forEach(projeto => {
        const li = document.createElement('li');
        li.dataset.projectId = projeto.id;
        li.className = 'project-item';

        const spanNomeProjeto = document.createElement('span');
        spanNomeProjeto.textContent = projeto.nome;
        spanNomeProjeto.className = 'project-name'; // Classe para o nome

        const deleteProjectItemBtn = document.createElement('button');
        deleteProjectItemBtn.innerHTML = '&#x1F5D1;'; // Ícone de lixeira
        deleteProjectItemBtn.className = 'btn delete-project-item-btn'; // Nova classe para o botão
        deleteProjectItemBtn.title = `Excluir projeto "${projeto.nome}"`;

        deleteProjectItemBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Impede que o clique no botão também selecione o projeto
            const confirmacao = confirm(`Você tem certeza que deseja excluir o projeto "${projeto.nome}" e todas as suas tarefas?`);
            if (confirmacao) {
                excluirProjeto(projeto.id);
            }
        });

        li.appendChild(spanNomeProjeto);
        li.appendChild(deleteProjectItemBtn); // Adiciona o botão de excluir ao lado do nome

        if (projeto.id === appData.currentProjectId) {
            li.classList.add('active-project');
        }

        // O listener para selecionar o projeto permanece no 'li'
        li.addEventListener('click', () => {
            appData.currentProjectId = projeto.id;
            salvarDados();
            renderizarProjetos();
            renderizarLista();
        });
        projectListUl.appendChild(li);
    });
}

function renderizarLista() {
    if (!todoListUl) {
        return;
    }
    todoListUl.innerHTML = '';
    const projetoAtual = getProjetoAtual();

    if (!projetoAtual) {
        const emptyStateLi = document.createElement('li');
        emptyStateLi.className = 'empty-state';
        // Mensagem ajustada de acordo com o código original do usuário
        emptyStateLi.textContent = 'Nenhum projeto encontrado.'; 
        todoListUl.appendChild(emptyStateLi);
        return;
    }

    if (projetoAtual.todos.length === 0) {
        const emptyStateLi = document.createElement('li');
        emptyStateLi.className = 'empty-state';
         // Mensagem ajustada de acordo com o código original do usuário
        emptyStateLi.textContent = 'Nenhuma tarefa encontrada.';
        todoListUl.appendChild(emptyStateLi);
        return;
    }

    projetoAtual.todos.forEach(tarefa => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        if (tarefa.completada) {
            li.classList.add('completed');
        }
        li.dataset.id = tarefa.id;

        const spanTexto = document.createElement('span');
        spanTexto.textContent = tarefa.texto;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'todo-actions';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'btn toggle-btn';
        toggleBtn.innerHTML = tarefa.completada ? '&#x21BA;' : '&#x2713;';
        toggleBtn.title = tarefa.completada ? 'Marcar como não concluída' : 'Marcar como concluída';
        toggleBtn.onclick = () => { alternarEstadoTarefa(tarefa.id); };

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn delete-btn';
        deleteBtn.innerHTML = '&#x1F5D1;';
        deleteBtn.title = 'Excluir tarefa';
        deleteBtn.onclick = () => { excluirTarefa(tarefa.id); };

        actionsDiv.appendChild(toggleBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(spanTexto);
        li.appendChild(actionsDiv);
        todoListUl.appendChild(li);
    });
}

function adicionarProjeto() {
    const nomeProjeto = newProjectInput.value.trim();
    if (nomeProjeto === '') {
        alert('Por favor, insira um nome para o projeto.');
        return;
    }
    const novoProjeto = new Projeto(Date.now(), nomeProjeto);
    appData.projects.push(novoProjeto);
    appData.currentProjectId = novoProjeto.id;
    newProjectInput.value = '';
    salvarDados();
    renderizarProjetos();
    renderizarLista();
}

function adicionarTarefa() {
    const texto = newTodoInput.value.trim();
    const projetoAtual = getProjetoAtual();

    if (!projetoAtual) {
        // Mensagem ajustada de acordo com o código original do usuário
        alert('Nenhum projeto encontrado.'); 
        return;
    }

    if (texto === '') {
        alert('Por favor, insira uma tarefa.');
        return;
    }

    const novaTarefa = new Tarefa(Date.now(), texto);
    projetoAtual.todos.push(novaTarefa);
    newTodoInput.value = '';
    salvarDados();
    renderizarLista();
}

function alternarEstadoTarefa(idTarefa) {
    const projetoAtual = getProjetoAtual();
    if (!projetoAtual) {
         // Mensagem ajustada de acordo com o código original do usuário
        alert('Nenhum projeto encontrado.');
        return;
    }
    const tarefa = projetoAtual.todos.find(t => t.id === idTarefa);
    if (tarefa) {
        tarefa.toggleCompletada(); // Corrigido para usar o nome correto do método
        salvarDados();
        renderizarLista();
    }
}

// Esta função é chamada pelos botões de excluir ao lado de cada projeto
function excluirProjeto(idProjeto) {
    // Não permitir excluir o último projeto se ele for o "Geral" ou um único projeto
    if (appData.projects.length === 1) {
        alert('Não é possível excluir o último projeto.');
        return;
    }

    const projetoIndex = appData.projects.findIndex(p => p.id === idProjeto);
    if (projetoIndex !== -1) {
        appData.projects.splice(projetoIndex, 1);
        if (appData.currentProjectId === idProjeto) {
            appData.currentProjectId = appData.projects.length > 0 ? appData.projects[0].id : null;
        }
        salvarDados();
        renderizarProjetos();
        renderizarLista();
    }
}


const globalDeleteProjectBtn = document.getElementById('deleteProjectBtn');
if (globalDeleteProjectBtn) {
    globalDeleteProjectBtn.addEventListener('click', () => {
        const projetoAtual = getProjetoAtual();
        if (!projetoAtual) {
            alert('Nenhum projeto selecionado para excluir.');
            return;
        }
        if (appData.projects.length <= 1) {
             alert('Não é possível excluir o último projeto.');
             return;
        }
        const confirmacao = confirm(`Você tem certeza que deseja excluir o projeto "${projetoAtual.nome}" e todas as suas tarefas?`);
        if (confirmacao) {
            excluirProjeto(projetoAtual.id);
        }
    });
}


function excluirTarefa(idTarefa) {
    const projetoAtual = getProjetoAtual();
    if (!projetoAtual) {
        // Mensagem ajustada de acordo com o código original do usuário
        alert('Nenhum projeto encontrado.');
        return;
    }
    projetoAtual.todos = projetoAtual.todos.filter(t => t.id !== idTarefa);
    salvarDados();
    renderizarLista();
}

// --- Adicionando Event Listeners ---

if (addTodoBtn) {
    addTodoBtn.addEventListener('click', adicionarTarefa);
}
if (newTodoInput) {
    newTodoInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            adicionarTarefa();
        }
    });
}

if (addProjectBtn) {
    addProjectBtn.addEventListener('click', adicionarProjeto);
}
if (newProjectInput) {
    newProjectInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            adicionarProjeto();
        }
    });
}

document.addEventListener('DOMContentLoaded', carregarDados);