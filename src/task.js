export class Tarefa {
    constructor(id, texto, details = '', dueDate = '', completada = false) {
        this.id = id;
        this.texto = texto; 
        this.details = details; 
        this.dueDate = dueDate;   
        this.completada = completada;
    }

    toggleCompletada() {
        this.completada = !this.completada;
    }
}
