let cliente = {
    mesa: '',
    hora: '',
    pedido: []
};

let categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente');

btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente() {
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    // Validaciones
    // Son evalua por la existencia de un campo vacio y retorna al existirlo
    const camposVacios = [mesa, hora].some(elemento => elemento === '');

    if (camposVacios) {

        // Verifica la existencia de una sola alerta
        const existeAlerta = document.querySelector('.invalid-feedback');

        if (!existeAlerta) {

            // Enviar alerta
            const alerta = document.createElement('div');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alerta);

            setTimeout(() => {
                alerta.remove();
            }, 3000);

        }

        return;
    }

    // Se copia el arreglo original pero se reescribe mesa y hora
    cliente = { ...cliente, mesa, hora };

    // Ocultar modal
    // Seleccion de modal
    const modalFormulario = document.querySelector('#formulario');
    // Busqueda de modal con boostrap
    const modalBoostrap = bootstrap.Modal.getInstance(modalFormulario);
    // Oculta el elemento con un metodo de la instancia
    modalBoostrap.hide();

    // Muestra la funciones
    mostrarSecciones();

    // Obtiene platillos de la api creada en JSON-server
    obtenerPlatillos();

}


function mostrarSecciones() {
    const elementosOcultos = document.querySelectorAll('.d-none');

    elementosOcultos.forEach(seccion => {
        seccion.classList.remove('d-none');
    });
}

function obtenerPlatillos() {
    const url = 'http://localhost:4000/platillos';
    fetch(url)
        .then(respuesta => respuesta.json())
        .then(resultado => {
            mostrarPlatillos(resultado);
        })
        .catch(error => error)
}

function mostrarPlatillos(platillos) {
    platillos.forEach(platillo => {
        const divContenido = document.querySelector('#platillos .contenido');

        const row = document.createElement('div');
        row.classList.add('row', 'py-3', 'border-top');

        const nombre = document.createElement('div');
        nombre.classList.add('col-md-4');
        nombre.textContent = platillo.nombre;

        const precio = document.createElement('div');
        precio.classList.add('col-md-3', 'fw-bold');
        precio.textContent = `$${platillo.precio}`;

        const categoria = document.createElement('div');
        categoria.classList.add('col-md-3');
        categoria.textContent = categorias[platillo.categoria];

        const inputCantidad = document.createElement('input');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0
        inputCantidad.id = `producto-${platillo.id}`;
        inputCantidad.classList.add('form-control');

        // Funcion para detecatar la cantidad
        // Se le asigna una funcion lineal que ejecuta una segunda funcion
        inputCantidad.onchange = function () {
            const cantidad = parseInt(inputCantidad.value);
            // spread operator crea un objeto fucionando objeto y cantidad
            agregarPlatillo({ ...platillo, cantidad });
        };

        // Div contenedor de input
        const divCantidad = document.createElement('div');
        divCantidad.classList.add('col-md-2');
        divCantidad.appendChild(inputCantidad);

        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(divCantidad);

        divContenido.appendChild(row);
    });
}

function agregarPlatillo(producto) {

    let { pedido } = cliente;

    // Revisar que la cantidad sea mayor a cero
    if (producto.cantidad > 0) {

        // Comprueba si el elemento existe en el arreglo
        if (pedido.some(articulo => articulo.id === producto.id)) {
            const pedidoActualizado = pedido.map(articulo => {
                if (articulo.id === producto.id) {
                    articulo.cantidad = producto.cantidad;
                }
                return articulo;
            });

            cliente.pedido = [...pedidoActualizado];
        }
        else {
            cliente.pedido = [...pedido, producto];
        }
    }
    else {
        const resultado = pedido.filter(articulo => articulo.id !== producto.id);
        cliente.pedido = [...resultado];
    }

    // Limpiar html previo
    limpiarHtml();

    // Si es positivo el retorno de length actualiza el resumen
    if (cliente.pedido.length) {
        actualizarResumen();
    } else {
        // Si no lo es crea el mensaje agregar pedido
        mensajePedidoVacio();
    }
}

function actualizarResumen() {
    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('div');
    resumen.classList.add('col-md-6', 'card', 'py-5', 'px-3', 'shadow');

    // Infromacion de la mesa
    const mesa = document.createElement('p');
    mesa.textContent = "Mesa: ";
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('span');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    mesa.appendChild(mesaSpan);

    // Informacion de la hora
    const hora = document.createElement('p');
    hora.textContent = "Hora: ";
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('span');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    hora.appendChild(horaSpan);

    // Titulo de la seccion 
    const heading = document.createElement('h3');
    heading.textContent = 'Platillos consumidos';
    heading.classList.add('my-4', 'text-center');

    // Iteracion sobre el array de pedidos
    const grupo = document.createElement('ul');
    grupo.classList.add('list-group');

    const { pedido } = cliente;

    pedido.forEach(articulo => {
        const { nombre, cantidad, precio, id } = articulo;

        const lista = document.createElement('li');
        lista.classList.add('list-group-item');

        const nombreEl = document.createElement('h4');
        nombreEl.classList.add('py-4');
        nombreEl.textContent = nombre;

        // Cantidad del articulo
        const cantidadEl = document.createElement('p');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('span');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        // Precio del articulo
        const precioEl = document.createElement('p');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio: ';

        const precioValor = document.createElement('span');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `$${precio}`;

        // Subtotal
        const subtotalEl = document.createElement('p');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';

        const subtotalValor = document.createElement('span');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal(cantidad, precio);

        // Boton para eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar del pedido'

        // Funcionalidad de boton
        btnEliminar.onclick = function () {
            eliminarArticulo(id);
        }

        // Agrega a padre
        cantidadEl.appendChild(cantidadValor);
        precioEl.appendChild(precioValor);
        subtotalEl.appendChild(subtotalValor);

        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);

        grupo.appendChild(lista);
    });


    // Agregar al contenido
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(heading);

    // Agrega elementos creados en la iteracion 
    resumen.appendChild(grupo);


    contenido.appendChild(resumen);

}

function eliminarArticulo(id) {
    const { pedido } = cliente;
    const resultado = pedido.filter(articulo => articulo.id !== id);
    cliente.pedido = [...resultado];

    limpiarHtml();

    // Si es positivo el retorno de length actualiza el resumen
    if (cliente.pedido.length) {
        actualizarResumen();
    } else {
        // Si no lo es crea el mensaje agregar pedido
        mensajePedidoVacio();
    }

    // Resetear formulario
     // Actualizar input de formulario
    const inputProducto = document.querySelector(`#producto-${id}`);
    inputProducto.value = 0;
}

const calcularSubtotal = (cantidad, precio) => `$${cantidad * precio}`;

function limpiarHtml() {
    const contenido = document.querySelector('#resumen .contenido');
    while (contenido.firstChild) {
        contenido.removeChild(contenido.firstChild);
    }
}

function mensajePedidoVacio() {
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('p');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos al pedido';

    contenido.appendChild(texto);
}