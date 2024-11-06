document.addEventListener("DOMContentLoaded", function () {
    let inventory = JSON.parse(localStorage.getItem("inventory")) || [];

    // Función para cargar la tabla con los productos
    function loadInventory() {
        const tableBody = document.querySelector("#inventoryTable tbody");
        tableBody.innerHTML = ""; // Limpiar tabla

        inventory.forEach(item => {
            const row = document.createElement("tr");
            row.dataset.id = item.id;

            row.innerHTML = `
                <td><input type="text" value="${item.name}" class="edit-name" data-id="${item.id}" disabled /></td>
                <td><input type="number" value="${item.bodega}" class="edit-bodega" data-id="${item.id}" disabled /></td>
                <td><input type="number" value="${item.local}" class="edit-local" data-id="${item.id}" disabled /></td>
                <td>
                    <button class="edit-btn" data-id="${item.id}">Editar</button>
                    <button class="delete-btn" data-id="${item.id}">Eliminar</button>
                    <button class="move-to-local-btn" data-id="${item.id}">Mover a Local</button>
                    <button class="move-to-bodega-btn" data-id="${item.id}">Mover a Bodega</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Mostrar productos en la mini carpeta
        const savedProductsDiv = document.getElementById("savedProducts");
        savedProductsDiv.innerHTML = "";  // Limpiar mini carpeta

        inventory.forEach(item => {
            const productDiv = document.createElement("div");
            productDiv.textContent = `${item.name} - Bodega: ${item.bodega}, Local: ${item.local}`;
            savedProductsDiv.appendChild(productDiv);
        });
    }

    // Función para agregar un nuevo producto al inventario
    document.querySelector("#addProductForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.querySelector("#newProductName").value;
        const bodega = parseInt(document.querySelector("#newProductBodega").value);
        const local = parseInt(document.querySelector("#newProductLocal").value);

        // Agregar el nuevo producto
        const newProduct = {
            id: Date.now(), // Usar un ID único
            name: name,
            bodega: bodega,
            local: local
        };

        inventory.push(newProduct);
        localStorage.setItem("inventory", JSON.stringify(inventory)); // Guardar en localStorage
        loadInventory();

        // Limpiar formulario después de agregar
        document.querySelector("#addProductForm").reset();
    });

    // Función para editar el producto
    function editProduct(id) {
        const nameInput = document.querySelector(`.edit-name[data-id="${id}"]`);
        const bodegaInput = document.querySelector(`.edit-bodega[data-id="${id}"]`);
        const localInput = document.querySelector(`.edit-local[data-id="${id}"]`);

        const product = inventory.find(item => item.id === id);
        if (product) {
            product.name = nameInput.value;
            product.bodega = parseInt(bodegaInput.value);
            product.local = parseInt(localInput.value);
            localStorage.setItem("inventory", JSON.stringify(inventory)); // Guardar cambios
        }

        loadInventory();
    }

    // Función para eliminar el producto
    function deleteProduct(id) {
        inventory = inventory.filter(item => item.id !== id);
        localStorage.setItem("inventory", JSON.stringify(inventory)); // Guardar cambios
        loadInventory();
    }

    // Función para mover una unidad de bodega a local
    function moveToLocal(id) {
        const product = inventory.find(item => item.id === id);
        if (product && product.bodega > 0) {
            product.bodega -= 1;
            product.local += 1;
            localStorage.setItem("inventory", JSON.stringify(inventory)); // Guardar cambios
        }

        loadInventory();
    }

    // Función para mover una unidad de local a bodega
    function moveToBodega(id) {
        const product = inventory.find(item => item.id === id);
        if (product && product.local > 0) {
            product.bodega += 1;
            product.local -= 1;
            localStorage.setItem("inventory", JSON.stringify(inventory)); // Guardar cambios
        }

        loadInventory();
    }

    // Función para generar el PDF
    function generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let y = 10;
        doc.setFontSize(16);
        doc.text("Inventario - Monaco Drinks", 10, y);
        y += 10;

        doc.setFontSize(12);
        doc.text("Producto", 10, y);
        doc.text("Bodega", 60, y);
        doc.text("Local", 110, y);
        y += 10;

        inventory.forEach(item => {
            doc.text(item.name, 10, y);
            doc.text(item.bodega.toString(), 60, y);
            doc.text(item.local.toString(), 110, y);
            y += 10;
        });

        doc.save("inventario_monaco_drinks.pdf");

        // Guardar en log de descargas
        const logList = document.getElementById("pdfDownloadLog");
        const logItem = document.createElement("li");
        logItem.textContent = `PDF generado: ${new Date().toLocaleString()}`;
        logList.appendChild(logItem);
    }

    // Cargar los productos guardados al cargar la página
    loadInventory();

    // Eventos de botones
    document.querySelector("#inventoryTable").addEventListener("click", function (event) {
        if (event.target.classList.contains("edit-btn")) {
            const id = parseInt(event.target.dataset.id);
            editProduct(id);
        }

        if (event.target.classList.contains("delete-btn")) {
            const id = parseInt(event.target.dataset.id);
            deleteProduct(id);
        }

        if (event.target.classList.contains("move-to-local-btn")) {
            const id = parseInt(event.target.dataset.id);
            moveToLocal(id);
        }

        if (event.target.classList.contains("move-to-bodega-btn")) {
            const id = parseInt(event.target.dataset.id);
            moveToBodega(id);
        }
    });

    // Evento para generar PDF
    document.querySelector("#exportPdf").addEventListener("click", generatePDF);
});

