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

export { Tarefa };