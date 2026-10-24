// Clase Tarea
class Tarea {
    constructor(nombre, completa = false, id = Date.now() + Math.random()) {
        this.id = id;
        this.nombre = nombre;
        this.completa = completa;
    }

    // Actualiza el estado
    completar() {
        this.completa = !this.completa;
    }

    // Edita el contenido de la tarea
    editar(nuevoNombre) {
        this.nombre = nuevoNombre;
    }

    // Elimina la tarea del gestor que la contiene
    eliminar(gestor) {
        gestor.eliminarTarea(this.id);
    }
}

// Clase GestorDeTareas
class GestorDeTareas {
    constructor(lista) {
        this.tareas = [];
        this.lista = lista;
        this.clave = 'reparaciones';
    }

    // Guarda en LocalStorage usando una promesa
    guardar() {
        return new Promise((resolve, reject) => {
            try {
                localStorage.setItem(this.clave, JSON.stringify(this.tareas));
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    // Carga desde LocalStorage usando una promesa
    cargar() {
        return new Promise((resolve, reject) => {
            try {
                const datos = JSON.parse(localStorage.getItem(this.clave)) || [];
                this.tareas = datos.map(({ nombre, completa, id }) => new Tarea(nombre, completa, id));
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    agregarTarea(nombre) {
        this.tareas.push(new Tarea(nombre));
        this.actualizar();
    }

    editarTarea(id, nuevoNombre) {
        const tarea = this.tareas.find((t) => t.id === id);
        if (tarea) {
            tarea.editar(nuevoNombre);
            this.actualizar();
        }
    }

    cambiarEstado(id) {
        const tarea = this.tareas.find((t) => t.id === id);
        if (tarea) {
            tarea.completar();
            this.actualizar();
        }
    }

    eliminarTarea(id) {
        this.tareas = this.tareas.filter((t) => t.id !== id);
        this.actualizar();
    }

    actualizar() {
        this.render();
        this.guardar().catch((error) => console.error('No se pudo guardar:', error));
    }

    render() {
        this.lista.innerHTML = '';
        this.tareas.forEach((tarea) => {
            const li = document.createElement('li');
            li.dataset.id = tarea.id;
            li.className = tarea.completa ? 'completa' : '';
            li.innerHTML = `
                <input type="checkbox" class="chk-tarea" aria-label="Marcar como reparado" ${tarea.completa ? 'checked' : ''}>
                <span class="nombre-tarea"></span>
                <button type="button" class="btn-editar">Editar</button>
                <button type="button" class="btn-eliminar">Eliminar</button>
            `;
            li.querySelector('.nombre-tarea').textContent = tarea.nombre;
            this.lista.appendChild(li);
        });
    }
}

// Logica de la interfaz
const entrada = document.getElementById('nueva-tarea');
const botonAgregar = document.getElementById('agregar-tarea');
const mensajeError = document.getElementById('mensaje-error');
const lista = document.getElementById('lista-tareas');
const gestor = new GestorDeTareas(lista);

const mostrarError = (texto) => {
    mensajeError.textContent = texto;
};

const agregar = () => {
    const nombre = entrada.value.trim();
    if (nombre === '') {
        mostrarError('Escribe el dispositivo y la falla a reparar.');
        return;
    }
    mostrarError('');
    gestor.agregarTarea(nombre);
    entrada.value = '';
    entrada.focus();
};

botonAgregar.addEventListener('click', agregar);
entrada.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') agregar();
});

lista.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const id = Number(li.dataset.id);
    const tarea = gestor.tareas.find((t) => t.id === id);
    if (!tarea) return;

    if (e.target.classList.contains('btn-eliminar')) {
        tarea.eliminar(gestor);
    } else if (e.target.classList.contains('btn-editar')) {
        const nuevoNombre = prompt('Edita el dispositivo o la falla:', tarea.nombre);
        if (nuevoNombre === null) return;
        if (nuevoNombre.trim() === '') {
            mostrarError('La reparación no puede quedar vacía.');
            return;
        }
        mostrarError('');
        gestor.editarTarea(id, nuevoNombre.trim());
    }
});

lista.addEventListener('change', (e) => {
    if (e.target.classList.contains('chk-tarea')) {
        gestor.cambiarEstado(Number(e.target.closest('li').dataset.id));
    }
});

// Cargar tareas guardadas al iniciar
gestor.cargar()
    .then(() => gestor.render())
    .catch((error) => console.error('No se pudo cargar:', error));