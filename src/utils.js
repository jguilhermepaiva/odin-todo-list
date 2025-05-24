import { Projeto } from './project.js';
import { Tarefa } from './task.js';
import { salvarDados } from './storage.js';
import { projectListUl , todoListUl, newProjectInput, newTodoInput, currentProjectNameSpan, newTodoDateInput, newTodoDetailsInput } from './dom.js';
import { appData } from './storage.js';


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
        emptyStateLi.textContent = 'Nenhum projeto encontrado.';
        todoListUl.appendChild(emptyStateLi);
        return;
    }

    if (projetoAtual.todos.length === 0) {
        const emptyStateLi = document.createElement('li');
        emptyStateLi.className = 'empty-state';
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

        const mainContentDiv = document.createElement('div');
        mainContentDiv.className = 'todo-item-main-content';

        const textoContainer = document.createElement('div');
        textoContainer.className = 'todo-text-container';

        const spanTexto = document.createElement('span');
        spanTexto.textContent = tarefa.texto;
        spanTexto.className = 'todo-name';
        textoContainer.appendChild(spanTexto);

        if (tarefa.dueDate) {
            const spanDate = document.createElement('span');
            try {
                // Tenta formatar a data para um formato mais legível
                const dateObj = new Date(tarefa.dueDate + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário na interpretação
                spanDate.textContent = `Data: ${dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`;
            } catch (e) {
                spanDate.textContent = `Data: ${tarefa.dueDate}`; // Fallback se a data não for válida
            }
            spanDate.className = 'todo-due-date';
            textoContainer.appendChild(spanDate);
        }
        // Detalhes serão mostrados ao expandir (Fase 2)
        mainContentDiv.appendChild(textoContainer);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'todo-actions';

        // Botão de expandir (será implementado na Fase 2)
         const expandBtn = document.createElement('button');
         expandBtn.className = 'btn expand-btn';
         expandBtn.innerHTML = '&#x2193;'; 
         expandBtn.title = 'Ver detalhes';
         expandBtn.onclick = () => { toggleDetalhesTarefa(tarefa.id, li); };

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

        actionsDiv.appendChild(expandBtn);
        actionsDiv.appendChild(toggleBtn);
        actionsDiv.appendChild(deleteBtn);
        mainContentDiv.appendChild(actionsDiv);

        li.appendChild(mainContentDiv);

        const detailsEditContainer = document.createElement('div');
        detailsEditContainer.className = 'todo-details-edit-container';
        detailsEditContainer.style.display = 'none'; // Oculto por padrão
        li.appendChild(detailsEditContainer);

        todoListUl.appendChild(li);
    });
}
export function toggleDetalhesTarefa(tarefaId, listItemElement) {
    const projetoAtual = getProjetoAtual();
    if (!projetoAtual) return;
    const tarefa = projetoAtual.todos.find(t => t.id === tarefaId);
    if (!tarefa) return;

    const detailsEditContainer = listItemElement.querySelector('.todo-details-edit-container');
    const expandBtn = listItemElement.querySelector('.expand-btn');

    if (detailsEditContainer.style.display === 'none' || detailsEditContainer.innerHTML === '') {
        detailsEditContainer.innerHTML = '';

        const detailsP = document.createElement('p');
        detailsP.innerHTML = `<strong>Detalhes:</strong><br>${tarefa.details || 'Nenhum detalhe fornecido.'}`;
        detailsP.className = 'task-details-text';

        const editForm = document.createElement('form');
        editForm.className = 'edit-task-form';
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            salvarEdicaoTarefa(
                tarefa.id,
                editForm.querySelector('.edit-task-name').value,
                editForm.querySelector('.edit-task-details').value,
                editForm.querySelector('.edit-task-dueDate').value,
                listItemElement
            );
        });

        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Nome da Tarefa:';
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'edit-task-name';
        nameInput.value = tarefa.texto;
        nameLabel.appendChild(nameInput);

        const detailsLabel = document.createElement('label');
        detailsLabel.textContent = 'Detalhes:';
        const detailsTextarea = document.createElement('textarea');
        detailsTextarea.className = 'edit-task-details';
        detailsTextarea.value = tarefa.details;
        detailsLabel.appendChild(detailsTextarea);

        const dueDateLabel = document.createElement('label');
        dueDateLabel.textContent = 'Data de Vencimento:';
        const dueDateInput = document.createElement('input');
        dueDateInput.type = 'date';
        dueDateInput.className = 'edit-task-dueDate';
        dueDateInput.value = tarefa.dueDate;
        dueDateLabel.appendChild(dueDateInput);

        // Div para agrupar os botões de ação do formulário
        const formActionsDiv = document.createElement('div');
        formActionsDiv.className = 'form-actions'; // Classe para estilização CSS

        const saveButton = document.createElement('button');
        saveButton.type = 'submit';
        saveButton.className = 'btn save-edit-btn';
        saveButton.textContent = 'Salvar Alterações';

        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'btn cancel-edit-btn';
        cancelButton.textContent = 'Cancelar';
        cancelButton.onclick = () => {
            toggleDetalhesTarefa(tarefa.id, listItemElement);
        };

        formActionsDiv.appendChild(saveButton);
        formActionsDiv.appendChild(cancelButton);

        editForm.appendChild(nameLabel);
        editForm.appendChild(detailsLabel);
        editForm.appendChild(dueDateLabel);
        editForm.appendChild(formActionsDiv); // Adiciona o div com os botões

        detailsEditContainer.appendChild(detailsP);
        detailsEditContainer.appendChild(editForm);

        detailsEditContainer.style.display = 'block';
        if (expandBtn) expandBtn.innerHTML = '&#x2191;';
        listItemElement.classList.add('expanded');

    } else {
        detailsEditContainer.style.display = 'none';
        detailsEditContainer.innerHTML = '';
        if (expandBtn) expandBtn.innerHTML = '&#x2193;';
        listItemElement.classList.remove('expanded');
    }
}

function salvarEdicaoTarefa(tarefaId, novoTexto, novosDetalhes, novaData, listItemElement) {
    const projetoAtual = getProjetoAtual();
    if (!projetoAtual) return;
    const tarefa = projetoAtual.todos.find(t => t.id === tarefaId);

    if (tarefa) {
        tarefa.texto = novoTexto.trim();
        tarefa.details = novosDetalhes.trim();
        tarefa.dueDate = novaData;
        salvarDados();
        renderizarLista(); 
    }
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
    // Assegure-se que newTodoInput, newTodoDetailsInput e newTodoDateInput 
    // estão sendo exportados de dom.js e importados aqui.
    const texto = newTodoInput.value.trim();
    const details = newTodoDetailsInput ? newTodoDetailsInput.value.trim() : '';
    const dueDate = newTodoDateInput ? newTodoDateInput.value : '';

    const projetoAtual = getProjetoAtual();

    if (!projetoAtual) {
        alert('Nenhum projeto encontrado.');
        return;
    }

    if (texto === '') {
        alert('Por favor, insira um nome para a tarefa.');
        return;
    }

    const novaTarefa = new Tarefa(Date.now(), texto, details, dueDate);
    projetoAtual.todos.push(novaTarefa);
    newTodoInput.value = '';
    if (newTodoDetailsInput) newTodoDetailsInput.value = '';
    if (newTodoDateInput) newTodoDateInput.value = '';
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

export {
    getProjetoAtual,
    adicionarProjeto,
    adicionarTarefa,
    alternarEstadoTarefa,
    excluirProjeto,
    excluirTarefa,
    renderizarProjetos,
    renderizarLista
};