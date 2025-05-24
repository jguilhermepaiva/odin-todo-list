import { Projeto } from './project.js';
import { Tarefa } from './task.js';
import './styles.css';

export let appData = {
    projects: [],
    currentProjectId: null,
}
const STORAGE_KEY = 'todoAppProjectsData';

export function salvarDados() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

export function carregarDados() {
    const dadosStorage = localStorage.getItem(STORAGE_KEY);

    if (dadosStorage) {
        try {
            const dadosParsed = JSON.parse(dadosStorage);

            if (dadosParsed && Array.isArray(dadosParsed.projects)) {
                appData.projects = dadosParsed.projects.map(proj => {
                    const novoProjeto = new Projeto(proj.id, proj.nome);
                    novoProjeto.todos = proj.todos.map(tarefa =>
                        new Tarefa(
                            tarefa.id,
                            tarefa.texto,
                            tarefa.details || '', 
                            tarefa.dueDate || '',
                            tarefa.completada
                        )
                    );
                    return novoProjeto;
                });
                appData.currentProjectId = dadosParsed.currentProjectId;
            } else {
                appData.projects = [];
                appData.currentProjectId = null;
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

    } else if ((!appData.currentProjectId || !appData.projects.find(p => p.id === appData.currentProjectId)) && appData.projects.length > 0) {
        appData.currentProjectId = appData.projects[0].id;
    }
}