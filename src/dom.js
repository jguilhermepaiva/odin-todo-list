import { adicionarTarefa, adicionarProjeto } from "./utils";
import { carregarDados } from "./storage";
import './styles.css';

export let appData = {
    projects: [],
    currentProjectId: null,
}
export const newTodoInput = document.getElementById('newTodoInput');
export const addTodoBtn = document.getElementById('addTodoBtn');
export const todoListUl = document.getElementById('todoList');

export const newProjectInput = document.getElementById('newProjectInput');
export const addProjectBtn = document.getElementById('addProjectBtn');
export const projectListUl = document.getElementById('projectList');
export const currentProjectNameSpan = document.getElementById('currentProjectName');


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