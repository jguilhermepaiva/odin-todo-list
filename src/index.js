import './styles.css';
const STORAGE_KEY = 'myDataKey';

let appData = {
    todos: [],
}

// Referências aos elementos do DOM
const newTodoInput = document.getElementById('newTodoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoListUl = document.getElementById('todoList');

class Tarefa {
    constructor(id, texto, completada = false)   {
        this.id = id;
        this.texto = texto;
        this.completada = completada;
    }

    toogleCompletada(){
        this.completada = !this.completada;
    }

    getDescricaoFormatada(){
        return `[${this.completada ? 'X' : ' '}] ${this.texto} (ID: ${this.id})`;
    }
}

function carregarDados(){
    const dadosStorage = localStorage.getItem(STORAGE_KEY);

    if (dadosStorage) {
        try{
            const dadosParsed = JSON.parse(dadosStorage);

            if (dadosParsed && Array.isArray(dadosParsed.todos)) {
                appData.todos = dadosParsed.todos.map(tarefa => new Tarefa(tarefa.id, tarefa.texto, tarefa.completada));
            } else {
                appData.todos = [];
            }

        } catch (error) {
            console.error('Erro ao carregar os dados do localStorage:', error);
        }
    }
    renderizarLista();
    
}

function salvarDados() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function renderizarLista() {
    todoListUl.innerHTML = '';

    if(appData.todos.length === 0) {
        const emptyStateLi = document.createElement('li');
        emptyStateLi.className = 'empty-state';
        emptyStateLi.textContent = 'Nenhuma tarefa encontrada.';
        todoListUl.appendChild(emptyStateLi);
        return;
    }

    appData.todos.forEach(tarefa => {
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

        const toogleBtn = document.createElement('button');
        toogleBtn.className = 'btn toggle=btn';
        toogleBtn.innerHTML = tarefa.completada ? '&#x21BA;' : '&#x2713;';
        toogleBtn.title = tarefa.completada ? 'Marcar como não concluída' : 'Marcar como concluída';
        toogleBtn.onclick = () => { alternarEstadoTarefa(tarefa.id); }

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn delete-btn';
        deleteBtn.innerHTML = '&#x1F5D1;';
        deleteBtn.title = 'Excluir tarefa';
        deleteBtn.onclick = () => { excluirTarefa(tarefa.id); }

        actionsDiv.appendChild(toogleBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(spanTexto);
        li.appendChild(actionsDiv);
        todoListUl.appendChild(li);


    });
}

function adicionarTarefa() {
    const texto = newTodoInput.value.trim();

    if (texto === '') {
        alert('Por favor, insira uma tarefa.');
        return;
    }

    const novaTarefa = new Tarefa(Date.now(), texto);
    appData.todos.push(novaTarefa);
    newTodoInput.value = '';
    salvarDados();
    renderizarLista();
}

function alternarEstadoTarefa(idTarefa) {
    const tarefa = appData.todos.find(t => t.id === idTarefa);
    if(tarefa) {
        tarefa.toogleCompletada();
        salvarDados();
        renderizarLista();
    }
}   

function excluirTarefa(idTarefa) {
    appData.todos = appData.todos.filter(t => t.id !== idTarefa);
    salvarDados();
    renderizarLista();
}

// Adicionando eventos

addTodoBtn.addEventListener('click', adicionarTarefa);
newTodoInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        adicionarTarefa();
    }
});

document.addEventListener('DOMContentLoaded', carregarDados);
