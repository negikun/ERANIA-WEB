// API Base URL
const API_BASE_URL = window.location.origin + '/api';

// DOM elements
const itemForm = document.getElementById('itemForm');
const itemsList = document.getElementById('itemsList');
const loading = document.getElementById('loading');
const statusMessage = document.getElementById('statusMessage');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const closeModal = document.getElementById('closeModal');
const cancelEdit = document.getElementById('cancelEdit');

// New form buttons
const updateProductBtn = document.getElementById('updateProductBtn');
const deleteProductBtn = document.getElementById('deleteProductBtn');
const clearFormBtn = document.getElementById('clearFormBtn');

// Sidebar elements
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebarToggle = document.getElementById('sidebarToggle');
const navLinks = document.querySelectorAll('.nav-link');
const pageTitle = document.getElementById('pageTitle');

// Inventory elements
// Removed - replaced with Settings functionality

// Current edit item ID and form mode
let currentEditId = null;
let formMode = 'add'; // 'add' or 'edit'

// User management variables
let currentEditEmail = null;
let userFormMode = 'add'; // 'add' or 'edit'

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadItems();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Add item form submission
    itemForm.addEventListener('submit', handleFormSubmit);
    
    // Form buttons
    updateProductBtn.addEventListener('click', handleUpdateFromForm);
    deleteProductBtn.addEventListener('click', handleDeleteFromForm);
    clearFormBtn.addEventListener('click', clearForm);
    
    // Edit form submission
    editForm.addEventListener('submit', handleUpdateItem);
    
    // Modal close events
    closeModal.addEventListener('click', closeEditModal);
    cancelEdit.addEventListener('click', closeEditModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            closeEditModal();
        }
    });
    
    // Sidebar navigation - using event delegation
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
        sidebarNav.addEventListener('click', function(event) {
            const navLink = event.target.closest('.nav-link');
            if (navLink && navLink.hasAttribute('data-section')) {
                handleNavigation(event);
            }
        });
    }
    
    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', toggleSidebar);
    sidebarToggle.addEventListener('click', toggleSidebar);
    
    // Close sidebar when clicking overlay
    sidebarOverlay.addEventListener('click', closeSidebar);
    
    // Handle window resize for responsive behavior
    window.addEventListener('resize', handleWindowResize);
    
    // Print catalog button
    const printCatalogBtn = document.querySelector('.print-catalog-btn-inline');
    if (printCatalogBtn) {
        printCatalogBtn.addEventListener('click', handlePrintCatalog);
    }
    
    // Settings form submission
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSubmit);
    }
    
    // Reset settings button
    const resetSettingsBtn = document.getElementById('resetSettings');
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', loadSettings);
    }
    
    // User form submission
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', handleUserFormSubmit);
    }
    
    // User form buttons
    const updateUserBtn = document.getElementById('updateUserBtn');
    const deleteUserBtn = document.getElementById('deleteUserBtn');
    const clearUserFormBtn = document.getElementById('clearUserFormBtn');
    
    if (updateUserBtn) {
        updateUserBtn.addEventListener('click', handleUpdateUser);
    }
    if (deleteUserBtn) {
        deleteUserBtn.addEventListener('click', handleDeleteUser);
    }
    if (clearUserFormBtn) {
        clearUserFormBtn.addEventListener('click', clearUserForm);
    }
    
    // Category form submission
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategoryFormSubmit);
    }
    
    // Category form buttons
    const clearCategoryFormBtn = document.getElementById('clearCategoryFormBtn');
    if (clearCategoryFormBtn) {
        clearCategoryFormBtn.addEventListener('click', clearCategoryForm);
    }
    
    // Client form submission
    const clientForm = document.getElementById('clientForm');
    if (clientForm) {
        clientForm.addEventListener('submit', handleClientFormSubmit);
    }
    
    // Client form buttons
    const updateClientBtn = document.getElementById('updateClientBtn');
    const deleteClientBtn = document.getElementById('deleteClientBtn');
    const clearClientFormBtn = document.getElementById('clearClientFormBtn');
    
    if (updateClientBtn) {
        updateClientBtn.addEventListener('click', handleUpdateClient);
    }
    if (deleteClientBtn) {
        deleteClientBtn.addEventListener('click', handleDeleteClient);
    }
    if (clearClientFormBtn) {
        clearClientFormBtn.addEventListener('click', clearClientForm);
    }
    
    if (updateClientBtn) {
        updateClientBtn.addEventListener('click', handleUpdateClient);
    }
    if (deleteClientBtn) {
        deleteClientBtn.addEventListener('click', handleDeleteClient);
    }
    if (clearClientFormBtn) {
        clearClientFormBtn.addEventListener('click', clearClientForm);
    }
}

// Handle form submission (add or update based on mode)
function handleFormSubmit(event) {
    event.preventDefault();
    
    if (formMode === 'add') {
        handleAddItem(event);
    } else if (formMode === 'edit') {
        handleUpdateFromForm();
    }
}

// Handle adding new item
async function handleAddItem(event) {
    event.preventDefault();
    
    // Get category original value from selected option
    const categorySelect = document.getElementById('itemCategory');
    const selectedCategoryOption = categorySelect.options[categorySelect.selectedIndex];
    const categoryOriginalValue = selectedCategoryOption ? 
        (selectedCategoryOption.getAttribute('data-original') || selectedCategoryOption.textContent || '') : '';
    
    // Get cloth original value from selected option
    const clothSelect = document.getElementById('itemCloth');
    const selectedClothOption = clothSelect.options[clothSelect.selectedIndex];
    const clothOriginalValue = selectedClothOption ? 
        (selectedClothOption.getAttribute('data-original') || selectedClothOption.textContent || '') : '';
    
    // Get gender original value from selected option
    const genderSelect = document.getElementById('itemGender');
    const selectedGenderOption = genderSelect.options[genderSelect.selectedIndex];
    const genderOriginalValue = selectedGenderOption ? 
        (selectedGenderOption.getAttribute('data-original') || selectedGenderOption.textContent || '') : '';

    const itemData = {
        Name: document.getElementById('itemName').value.trim(),
        Category: categoryOriginalValue,
        Price: parseFloat(document.getElementById('itemPrice').value) || 0,
        Discount: parseFloat(document.getElementById('itemDiscount').value) || 0,
        Stock: parseInt(document.getElementById('itemStock').value) || 0,
        Sold: parseInt(document.getElementById('itemSold').value) || 0,
        Barcode: document.getElementById('itemBarcode').value.trim(),
        Image: document.getElementById('itemImage').value.trim(),
        Cloth: clothOriginalValue,
        Gender: genderOriginalValue,
        Size: document.getElementById('itemSize').value
    };

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        await response.json();
        showStatusMessage('Producto agregado exitosamente!', 'success');
        clearForm();
        loadItems(); // Refresh the items list
    } catch (error) {
        console.error('Error adding item:', error);
        showStatusMessage('Error al agregar producto. Intente nuevamente.', 'error');
    } finally {
        showLoading(false);
    }
}

// Handle updating item from main form
async function handleUpdateFromForm() {
    if (!currentEditId) return;
    
    // Get category original value from selected option
    const categorySelect = document.getElementById('itemCategory');
    const selectedCategoryOption = categorySelect.options[categorySelect.selectedIndex];
    const categoryOriginalValue = selectedCategoryOption ? 
        (selectedCategoryOption.getAttribute('data-original') || selectedCategoryOption.textContent || '') : '';
    
    // Get cloth original value from selected option
    const clothSelect = document.getElementById('itemCloth');
    const selectedClothOption = clothSelect.options[clothSelect.selectedIndex];
    const clothOriginalValue = selectedClothOption ? 
        (selectedClothOption.getAttribute('data-original') || selectedClothOption.textContent || '') : '';
    
    // Get gender original value from selected option
    const genderSelect = document.getElementById('itemGender');
    const selectedGenderOption = genderSelect.options[genderSelect.selectedIndex];
    const genderOriginalValue = selectedGenderOption ? 
        (selectedGenderOption.getAttribute('data-original') || selectedGenderOption.textContent || '') : '';

    const itemData = {
        Name: document.getElementById('itemName').value.trim(),
        Category: categoryOriginalValue,
        Price: parseFloat(document.getElementById('itemPrice').value) || 0,
        Discount: parseFloat(document.getElementById('itemDiscount').value) || 0,
        Stock: parseInt(document.getElementById('itemStock').value) || 0,
        Barcode: document.getElementById('itemBarcode').value.trim(),
        Image: document.getElementById('itemImage').value.trim(),
        Cloth: clothOriginalValue,
        Gender: genderOriginalValue,
        Size: document.getElementById('itemSize').value,
        subcollectionPath: currentSubcollectionPath // Include subcollection path
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${currentEditId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error response:', errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        await response.json();
        showStatusMessage('Producto actualizado exitosamente!', 'success');
        clearForm();
        resetFormMode();
        loadItems(); // Refresh the items list
    } catch (error) {
        console.error('Error updating item:', error);
        showStatusMessage('Error al actualizar producto. Intente nuevamente.', 'error');
    }
}

// Handle deleting item from main form
async function handleDeleteFromForm() {
    if (!currentEditId) return;
    
    if (!confirm('¿Está seguro que desea eliminar este producto?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${currentEditId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subcollectionPath: currentSubcollectionPath })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        await response.json();
        showStatusMessage('Producto eliminado exitosamente!', 'success');
        clearForm();
        resetFormMode();
        loadItems(); // Refresh the items list
    } catch (error) {
        console.error('Error deleting item:', error);
        showStatusMessage('Error al eliminar producto. Intente nuevamente.', 'error');
    }
}

// Clear form fields
function clearForm() {
    itemForm.reset();
    document.getElementById('itemCloth').value = 'NA';
    document.getElementById('itemGender').value = 'NA';
    document.getElementById('itemSize').value = 'NA';
    document.getElementById('itemSold').value = '0';
}

// Reset form to add mode
function resetFormMode() {
    formMode = 'add';
    currentEditId = null;
    currentSubcollectionPath = null; // Reset subcollection path
    
    // Show/hide appropriate buttons
    document.querySelector('.form-section h2').textContent = 'Agregar Producto';
    document.querySelector('button[type="submit"]').textContent = 'Agregar Producto';
    updateProductBtn.style.display = 'none';
    deleteProductBtn.style.display = 'none';
    document.querySelector('button[type="submit"]').style.display = 'block';
}

// Set form to edit mode
function setFormEditMode(item) {
    formMode = 'edit';
    currentEditId = item.id;
    currentSubcollectionPath = item.subcollectionPath || null; // Store subcollection path
    
    // Populate form fields
    // Handle both old structure (direct properties) and new structure (data object)
    const productData = item.data || item;
    
    
    
    
    
    
    
    
    
    // Set simple text/number fields first
    document.getElementById('itemName').value = productData.Name || productData.name || '';
    document.getElementById('itemPrice').value = productData.Price || productData.price || 0;
    document.getElementById('itemDiscount').value = productData.Discount || productData.discount || 0;
    document.getElementById('itemStock').value = productData.Stock || productData.stock || 0;
    document.getElementById('itemSold').value = productData.Sold || productData.sold || 0;
    document.getElementById('itemBarcode').value = productData.Barcode || productData.barcode || '';
    document.getElementById('itemImage').value = productData.Image || productData.image || '';
    
    // Handle dropdown fields with proper value matching
    setTimeout(() => {
        // Category - normalize the stored value to match dropdown options
        const categoryValue = productData.Category || productData.category || '';
        const normalizedCategory = categoryValue.toLowerCase().replace(/\s+/g, '-');
        
        document.getElementById('itemCategory').value = normalizedCategory;
        
        // Cloth field - normalize the stored value to match dropdown options
        const clothValue = productData.Cloth || productData.cloth || 'NA';
        const normalizedCloth = clothValue === 'NA' ? 'NA' : clothValue.toLowerCase().replace(/\s+/g, '-');
        
        document.getElementById('itemCloth').value = normalizedCloth;
        
        // Gender field - normalize the stored value to match dropdown options
        const genderValue = productData.Gender || productData.gender || 'NA';
        const normalizedGender = genderValue === 'NA' ? 'NA' : genderValue.toLowerCase().replace(/\s+/g, '-');
        
        document.getElementById('itemGender').value = normalizedGender;
        
        // Size field
        const sizeValue = productData.Size || productData.size || 'NA';
        document.getElementById('itemSize').value = sizeValue;
        
        
        // Verify all values were set correctly
        
        
        
        
        
    }, 100); // Small delay to ensure dropdowns are populated
    
    // Show/hide appropriate buttons
    document.querySelector('.form-section h2').textContent = 'Editar Producto';
    document.querySelector('button[type="submit"]').style.display = 'none';
    updateProductBtn.style.display = 'block';
    deleteProductBtn.style.display = 'block';
    
    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// Handle updating item
async function handleUpdateItem(event) {
    event.preventDefault();
    
    if (!currentEditId) return;
    
    const itemData = {
        name: document.getElementById('editItemName').value.trim(),
        category: document.getElementById('editItemCategory').value,
        price: parseFloat(document.getElementById('editItemPrice').value) || 0,
        discount: parseFloat(document.getElementById('editItemDiscount').value) || 0,
        stock: parseInt(document.getElementById('editItemStock').value) || 0,
        barcode: document.getElementById('editItemBarcode').value.trim(),
        image: document.getElementById('editItemImage').value.trim(),
        cloth: document.getElementById('editItemCloth').value,
        gender: document.getElementById('editItemGender').value,
        size: document.getElementById('editItemSize').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${currentEditId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        await response.json();
        showStatusMessage('Producto actualizado exitosamente!', 'success');
        closeEditModal();
        loadItems(); // Refresh the items list
    } catch (error) {
        console.error('Error updating item:', error);
        showStatusMessage('Error al actualizar producto. Intente nuevamente.', 'error');
    }
}

// Load categories from API
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const categories = await response.json();
        
        // Update both category dropdowns
        const categorySelects = [
            document.getElementById('itemCategory'),
            document.getElementById('editItemCategory')
        ];
        
        categorySelects.forEach(select => {
            if (select) {
                // Store the currently selected value
                const selectedValue = select.value;
                
                // Clear existing options except the first placeholder
                select.innerHTML = '<option value="">Seleccionar categoría</option>';
                
                // Add dynamic categories
                categories.forEach(categoryName => {
                    const option = document.createElement('option');
                    // Use normalized value for option value
                    option.value = categoryName.toLowerCase().replace(/\s+/g, '-');
                    option.textContent = categoryName;
                    // Store original name as data attribute for reference
                    option.setAttribute('data-original', categoryName);
                    select.appendChild(option);
                });
                
                // Restore selected value if it exists
                if (selectedValue) {
                    select.value = selectedValue;
                }
            }
        });
        
        
    } catch (error) {
        console.error('Error loading categories:', error);
        showStatusMessage('Error cargando categorías.', 'error');
    }
}

// Load items from API
async function loadItems() {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const items = await response.json();
        displayItems(items);
    } catch (error) {
        console.error('Error loading items:', error);
        showStatusMessage('Error loading items. Please refresh the page.', 'error');
        displayItems([]); // Show empty state
    } finally {
        showLoading(false);
    }
}

// Display items in the UI
function displayItems(items) {
    if (!items || items.length === 0) {
        itemsList.innerHTML = `
            <div class="empty-state">
                <h3>No hay productos</h3>
                <p>Agregue su primer producto usando el formulario de la izquierda.</p>
            </div>
        `;
        return;
    }
    
    const tableRows = items.map(item => {
        // Handle both old structure (direct properties) and new structure (data object)
        const productData = item.data || item; // Use data object if available, otherwise use item directly
        const price = productData.Price || productData.price || 0;
        const discount = productData.Discount || productData.discount || 0;
        const stock = productData.Stock || productData.stock || 0;
        const name = productData.Name || productData.name || 'Sin nombre';
        const category = productData.Category || productData.category || 'N/A';
        const barcode = productData.Barcode || productData.barcode || '';
        const image = productData.Image || productData.image || '';
        const size = productData.Size || productData.size || 'N/A';
        const gender = productData.Gender || productData.gender || 'N/A';
        const cloth = productData.Cloth || productData.cloth || '';
        const sold = productData.Sold || productData.sold || 0;
        
        const finalPrice = price - (price * (discount / 100));
        const stockStatus = stock <= 5 ? 'low-stock' : 'in-stock';
        
        // Determine source and path
        const isSubcollection = item.type === 'subcollection';
        const sourceBadge = isSubcollection ? 
            '<span class="badge badge-subcollection">Subcolección</span>' : 
            '<span class="badge badge-main">Principal</span>';
        
        // For subcollection items, use the constructed path, for main items show the simple path
        const pathInfo = isSubcollection ? 
            item.subcollectionPath : 
            'Products/' + item.id;
            
        // Show cloth, size, gender info for subcollection identification
        const hasSubcollectionData = cloth && cloth !== 'NA' && size && size !== 'N/A' && gender && gender !== 'N/A';
        const subcollectionNote = isSubcollection ? 
            '<small class="subcollection-note">Estructura de subcolección</small>' : 
            (hasSubcollectionData ? '<small class="has-subcollection">Disponible en subcolección</small>' : '');
        
        return `
            <tr data-id="${item.id}" class="${isSubcollection ? 'subcollection-row' : 'main-row'}">
                <td class="product-name">${escapeHtml(name)}</td>
                <td>${escapeHtml(getCategoryName(category))}</td>
                <td class="price">$${formatPrice(price)}</td>
                <td class="discount">${discount}%</td>
                <td class="final-price">$${formatPrice(finalPrice)}</td>
                <td class="stock stock-${stockStatus}">${stock}</td>
                <td>${sold}</td>
                <td>${escapeHtml(getSizeName(size))}</td>
                <td>${escapeHtml(getGenderName(gender))}</td>
                <td>${cloth && cloth !== 'NA' ? escapeHtml(getClothName(cloth)) : 'N/A'}</td>
                <td class="barcode">${barcode || 'N/A'}</td>
                <td class="image-url">${image ? `<a href="${image}" target="_blank" title="Ver imagen">Ver</a>` : 'N/A'}</td>
                <td class="actions">
                    <button class="btn-table btn-select" onclick="selectProductForEdit('${item.id}')" title="Seleccionar">📝</button>
                    <button class="btn-table btn-edit" onclick="openEditModal('${item.id}')" title="Editar">✏️</button>
                    <button class="btn-table btn-delete" onclick="quickDeleteItem('${item.id}')" title="Eliminar">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');

    itemsList.innerHTML = `
        <div class="table-wrapper">
            <table class="products-table" id="itemsTable">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Descuento</th>
                        <th>Precio Final</th>
                        <th>Stock</th>
                        <th>Vendidos</th>
                        <th>Talla</th>
                        <th>Género</th>
                        <th>Tipo Tela</th>
                        <th>Código Barras</th>
                        <th>Imagen</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

// Open edit modal
async function openEditModal(itemId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${itemId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const item = await response.json();
        currentEditId = itemId;
        
        // Handle both old structure and new structure
        const productData = item.data || item;
        
        // Populate form fields
        document.getElementById('editItemName').value = productData.Name || productData.name || '';
        document.getElementById('editItemCategory').value = productData.Category || productData.category || '';
        document.getElementById('editItemPrice').value = productData.Price || productData.price || 0;
        document.getElementById('editItemDiscount').value = productData.Discount || productData.discount || 0;
        document.getElementById('editItemStock').value = productData.Stock || productData.stock || 0;
        document.getElementById('editItemSold').value = productData.Sold || productData.sold || 0;
        document.getElementById('editItemBarcode').value = productData.Barcode || productData.barcode || '';
        document.getElementById('editItemImage').value = productData.Image || productData.image || '';
        document.getElementById('editItemCloth').value = productData.Cloth || productData.cloth || 'NA';
        document.getElementById('editItemGender').value = productData.Gender || productData.gender || 'NA';
        document.getElementById('editItemSize').value = productData.Size || productData.size || 'NA';
        
        // Show modal
        editModal.style.display = 'block';
    } catch (error) {
        console.error('Error loading item for edit:', error);
        showStatusMessage('Error al cargar datos del producto.', 'error');
    }
}

// Close edit modal
function closeEditModal() {
    editModal.style.display = 'none';
    currentEditId = null;
    editForm.reset();
}

// Delete item
async function deleteItem(itemId) {
    if (!confirm('¿Está seguro que desea eliminar este producto?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${itemId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        await response.json();
        showStatusMessage('Producto eliminado exitosamente!', 'success');
        loadItems(); // Refresh the items list
    } catch (error) {
        console.error('Error deleting item:', error);
        showStatusMessage('Error al eliminar producto. Intente nuevamente.', 'error');
    }
}

// Show/hide loading indicator
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

// Show status message
function showStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.classList.add('show');
    
    setTimeout(() => {
        statusMessage.classList.remove('show');
    }, 3000);
}

// Utility function to escape HTML
function getSizeName(size) {
    const sizeMap = {
        'XS': 'Extra Pequeña',
        'S': 'Pequeña', 
        'M': 'Mediana',
        'L': 'Grande',
        'XL': 'Extra Grande',
        'XXL': '2XL',
        'CH': 'Chica',
        'NA': 'No aplica'
    };
    return sizeMap[size] || size;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatPrice(price) {
    // Convert to number and format with 2 decimal places
    const num = parseFloat(price) || 0;
    return num.toFixed(2);
}

// Quick update item (opens modal with current data)
async function quickUpdateItem(itemId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${itemId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const item = await response.json();
        currentEditId = itemId;
        
        // Handle both old structure and new structure
        const productData = item.data || item;
        
        // Populate form fields in modal
        document.getElementById('editItemName').value = productData.Name || productData.name || '';
        document.getElementById('editItemCategory').value = productData.Category || productData.category || '';
        document.getElementById('editItemPrice').value = productData.Price || productData.price || 0;
        document.getElementById('editItemDiscount').value = productData.Discount || productData.discount || 0;
        document.getElementById('editItemStock').value = productData.Stock || productData.stock || 0;
        document.getElementById('editItemSold').value = productData.Sold || productData.sold || 0;
        document.getElementById('editItemBarcode').value = productData.Barcode || productData.barcode || '';
        document.getElementById('editItemImage').value = productData.Image || productData.image || '';
        document.getElementById('editItemCloth').value = productData.Cloth || productData.cloth || 'NA';
        document.getElementById('editItemGender').value = productData.Gender || productData.gender || 'NA';
        document.getElementById('editItemSize').value = productData.Size || productData.size || 'NA';
        
        // Show modal
        editModal.style.display = 'block';
        showStatusMessage('Listo para actualizar producto.', 'success');
    } catch (error) {
        console.error('Error loading item for update:', error);
        showStatusMessage('Error al cargar datos del producto.', 'error');
    }
}

// Quick delete item with confirmation
async function quickDeleteItem(itemId) {
    if (!confirm('¿Está seguro que desea eliminar este producto? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${itemId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        await response.json();
        showStatusMessage('Producto eliminado exitosamente!', 'success');
        loadItems(); // Refresh the items list
        
        // Reset form if this item was being edited
        if (currentEditId === itemId) {
            clearForm();
            resetFormMode();
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showStatusMessage('Error al eliminar producto. Intente nuevamente.', 'error');
    }
}

// Select product for editing in main form
async function selectProductForEdit(itemId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${itemId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const item = await response.json();
        item.id = itemId; // Make sure ID is included
        setFormEditMode(item);
        showStatusMessage('Producto seleccionado para editar.', 'success');
    } catch (error) {
        console.error('Error loading item for edit:', error);
        showStatusMessage('Error al cargar datos del producto.', 'error');
    }
}

// Make functions globally available for onclick handlers
window.selectProductForEdit = selectProductForEdit;
window.quickUpdateItem = quickUpdateItem;
window.quickDeleteItem = quickDeleteItem;
window.openEditModal = openEditModal;
window.deleteItem = deleteItem;

// Sidebar Navigation Functions
function toggleSidebar() {
    sidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
}

function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
}

function handleWindowResize() {
    // Close sidebar and overlay when resizing to desktop
    if (window.innerWidth > 1024) {
        closeSidebar();
    }
}

function handleNavigation(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const clickedElement = event.target.closest('.nav-link');
    
    if (!clickedElement) {
        return;
    }
    
    const sectionName = clickedElement.getAttribute('data-section');
    
    if (!sectionName) {
        return;
    }
    
    // Update active navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const navItem = clickedElement.closest('.nav-item');
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Show selected section
    showSection(sectionName);
    
    // Update page title
    updatePageTitle(sectionName);
    
    // Close sidebar on mobile/tablet
    if (window.innerWidth <= 1024) {
        closeSidebar();
    }
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}Section`);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load data for settings section
        if (sectionName === 'ajustes') {
            loadSettings();
        }
        
        // Load data for users section
        if (sectionName === 'usuarios') {
            loadUsers();
        }
        
        // Load data for categories section
        if (sectionName === 'categorias') {
            loadCategoriesForManagement();
        }
        
        // Load data for clients section
        if (sectionName === 'clientes') {
            loadClients();
        }
        
        // Load data for tickets section
        if (sectionName === 'tickets') {
            loadTickets();
        }
        
        // Load data for spendings section
        if (sectionName === 'gastos') {
            loadSpendings();
        }
        
        // Load data for sales statistics section
        if (sectionName === 'estadisticas') {
            loadSalesStatistics();
        }
        
        // For productos section, ensure items are loaded
        if (sectionName === 'productos') {
            // Make sure products are displayed
            if (typeof loadItems === 'function') {
                loadItems();
            }
        }
    }
}

function updatePageTitle(sectionName) {
    const titles = {
        'productos': 'Productos',
        'ajustes': 'Ajustes',
        'usuarios': 'Usuarios',
        'categorias': 'Categorías',
        'clientes': 'Clientes',
        'tickets': 'Tickets',
        'gastos': 'Gastos',
        'estadisticas': 'Estadísticas de Ventas'
    };
    pageTitle.textContent = titles[sectionName] || sectionName;
}

// Settings Functions
async function loadSettings() {
    try {
        showStatusMessage('Cargando configuración...', 'info');
        
        // Try different endpoint variations
        const possibleEndpoints = [
            `${API_BASE_URL}/GlobalVariablesP/Global`,
            `${API_BASE_URL}/settings`,
            `${API_BASE_URL}/globalVariables`,
            `${API_BASE_URL}/global-settings`
        ];
        
        let settings = null;
        let lastError = null;
        
        for (const endpoint of possibleEndpoints) {
            try {
                
                const response = await fetch(endpoint);
                
                if (response.ok) {
                    settings = await response.json();
                    
                    break;
                } else {
                    
                }
            } catch (err) {
                
                lastError = err;
            }
        }
        
        if (settings) {
            populateSettingsForm(settings);
            showStatusMessage('Configuración cargada exitosamente', 'success');
        } else {
            // If all endpoints fail, create a default settings structure
            console.warn('All endpoints failed, using default settings');
            const defaultSettings = {
                Name: '',
                Rfc: '',
                Email: '',
                Phone: '',
                Address: '',
                Colony: '',
                Zip: '',
                DiscountGlobal: 0,
                SalesGoal: 0,
                SalesQtyGoal: 0,
                LastTicketNumber: 0,
                SmallBox: 0,
                Spendings: 0,
                TotalQtySales: 0,
                TotalSales: 0,
                Currency: 'MXN'
            };
            populateSettingsForm(defaultSettings);
            showStatusMessage('No se encontró configuración existente. Usando valores predeterminados.', 'info');
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        showStatusMessage('Error al cargar configuración. Usando valores predeterminados.', 'error');
        // Populate with defaults even on error
        const defaultSettings = {
            Name: '',
            Rfc: '',
            Email: '',
            Phone: '',
            Address: '',
            Colony: '',
            Zip: '',
            DiscountGlobal: 0,
            SalesGoal: 0,
            SalesQtyGoal: 0,
            LastTicketNumber: 0,
            SmallBox: 0,
            Spendings: 0,
            TotalQtySales: 0,
            TotalSales: 0,
            Currency: 'MXN'
        };
        populateSettingsForm(defaultSettings);
    }
}

function populateSettingsForm(settings) {
    // Handle both direct properties and nested data structure
    const settingsData = settings.data || settings;
    
    
    // Populate visible form fields
    const fieldMappings = {
        'businessName': settingsData.Name || '',
        'rfc': settingsData.Rfc || '',
        'email': settingsData.Email || '',
        'phone': settingsData.Phone || '',
        'address': settingsData.Address || '',
        'colony': settingsData.Colony || '',
        'zip': settingsData.Zip || '',
        'discountGlobal': settingsData.DiscountGlobal || 0,
        'salesGoal': settingsData.SalesGoal || 0,
        'salesQtyGoal': settingsData.SalesQtyGoal || 0,
        'lastTicketNumber': settingsData.LastTicketNumber || 0,
        'smallBox': settingsData.SmallBox || 0,
        'spendings': settingsData.Spendings || 0
    };
    
    Object.keys(fieldMappings).forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = fieldMappings[fieldId];
            
        }
    });
    
    // Populate hidden fields (preserve current values from database)
    const totalQtySalesElement = document.getElementById('totalQtySales');
    const totalSalesElement = document.getElementById('totalSales');
    const currencyElement = document.getElementById('currency');
    
    if (totalQtySalesElement) {
        totalQtySalesElement.value = settingsData.TotalQtySales || 0;
        
    }
    if (totalSalesElement) {
        totalSalesElement.value = settingsData.TotalSales || 0;
        
    }
    if (currencyElement) {
        currencyElement.value = settingsData.Currency || 'MXN';
        
    }
}

async function handleSettingsSubmit(event) {
    event.preventDefault();
    
    try {
        showStatusMessage('Guardando configuración...', 'info');
        
        const formData = new FormData(event.target);
        const settingsData = {};
        
        // Convert form data to object with exact Firestore field names
        formData.forEach((value, key) => {
            settingsData[key] = value;
        });
        
        // Convert numeric fields
        const numericFields = ['DiscountGlobal', 'SalesGoal', 'SalesQtyGoal', 'LastTicketNumber', 'SmallBox', 'Spendings', 'TotalQtySales', 'TotalSales'];
        numericFields.forEach(field => {
            if (settingsData[field] !== undefined) {
                settingsData[field] = parseFloat(settingsData[field]) || 0;
            }
        });
        
        // Ensure hidden fields maintain their current values
        const totalQtySalesElement = document.getElementById('totalQtySales');
        const totalSalesElement = document.getElementById('totalSales');
        const currencyElement = document.getElementById('currency');
        
        if (totalQtySalesElement) {
            settingsData.TotalQtySales = parseFloat(totalQtySalesElement.value) || 0;
        }
        if (totalSalesElement) {
            settingsData.TotalSales = parseFloat(totalSalesElement.value) || 0;
        }
        if (currencyElement) {
            settingsData.Currency = currencyElement.value || 'MXN';
        }
        
        
        
        // Try different endpoint variations for saving
        const possibleEndpoints = [
            { url: `${API_BASE_URL}/GlobalVariablesP/Global`, method: 'PUT' },
            { url: `${API_BASE_URL}/GlobalVariablesP`, method: 'PUT' },
            { url: `${API_BASE_URL}/settings`, method: 'POST' },
            { url: `${API_BASE_URL}/settings`, method: 'PUT' },
            { url: `${API_BASE_URL}/globalVariables`, method: 'POST' },
            { url: `${API_BASE_URL}/global-settings`, method: 'POST' }
        ];
        
        let success = false;
        
        for (const endpoint of possibleEndpoints) {
            try {
                
                const response = await fetch(endpoint.url, {
                    method: endpoint.method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(settingsData)
                });
                
                if (response.ok) {
                    
                    await response.json();
                    success = true;
                    break;
                } else {
                    
                }
            } catch (err) {
                
            }
        }
        
        if (success) {
            showStatusMessage('Configuración guardada exitosamente!', 'success');
        } else {
            showStatusMessage('No se pudo guardar la configuración. Verifique la conexión del servidor.', 'error');
        }
        
    } catch (error) {
        console.error('Error saving settings:', error);
        showStatusMessage('Error al guardar configuración. Intente nuevamente.', 'error');
    }
}

// Users Management Functions
async function loadUsers() {
    const usersLoading = document.getElementById('usersLoading');
    const usersList = document.getElementById('usersList');
    
    try {
        if (usersLoading) usersLoading.style.display = 'block';
        
        const response = await fetch(`${API_BASE_URL}/users`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const users = await response.json();
        displayUsers(users);
        
    } catch (error) {
        console.error('Error loading users:', error);
        showStatusMessage('Error al cargar usuarios.', 'error');
        if (usersList) {
            usersList.innerHTML = '<div class="error-message">Error al cargar usuarios</div>';
        }
    } finally {
        if (usersLoading) usersLoading.style.display = 'none';
    }
}

function displayUsers(users) {
    const usersList = document.getElementById('usersList');
    
    if (!users || users.length === 0) {
        usersList.innerHTML = `
            <div class="empty-state">
                <h3>No hay usuarios</h3>
                <p>Agregue el primer usuario usando el formulario de arriba.</p>
            </div>
        `;
        return;
    }
    
    const tableRows = users.map(user => {
        const userData = user.data || user;
        const email = userData.Email || user.id || '';
        const role = userData.Role || 'N/A';
        const access = userData.Access;
        const accessText = access === true || access === 'true' ? 'Activo' : 'Inactivo';
        const accessClass = access === true || access === 'true' ? 'status-active' : 'status-inactive';
        
        return `
            <tr data-email="${escapeHtml(email)}">
                <td class="user-email">${escapeHtml(email)}</td>
                <td class="user-role">${escapeHtml(role)}</td>
                <td class="user-access">
                    <span class="access-status ${accessClass}">${accessText}</span>
                </td>
                <td class="actions">
                    <button class="btn-table btn-edit" onclick="selectUserForEdit('${email}')" title="Editar">✏️</button>
                    <button class="btn-table btn-delete" onclick="confirmDeleteUser('${email}')" title="Eliminar">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');

    usersList.innerHTML = `
        <div class="table-wrapper">
            <table class="users-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Acceso</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

async function handleUserFormSubmit(event) {
    event.preventDefault();
    
    if (userFormMode === 'add') {
        await handleAddUser(event);
    } else if (userFormMode === 'edit') {
        await handleUpdateUser();
    }
}

async function handleAddUser(event) {
    const formData = new FormData(event.target);
    const userData = {};
    
    formData.forEach((value, key) => {
        userData[key] = value;
    });
    
    // Convert Access to boolean
    userData.Access = userData.Access === 'true';
    
    const email = userData.Email;
    
    if (!email) {
        showStatusMessage('Email es requerido.', 'error');
        return;
    }
    
    try {
        showStatusMessage('Agregando usuario...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        await response.json();
        showStatusMessage('Usuario agregado exitosamente!', 'success');
        clearUserForm();
        loadUsers();
        
    } catch (error) {
        console.error('Error adding user:', error);
        showStatusMessage(`Error al agregar usuario: ${error.message}`, 'error');
    }
}

async function handleUpdateUser() {
    if (!currentEditEmail) return;
    
    const userData = {
        Email: document.getElementById('userEmail').value.trim(),
        Password: document.getElementById('userPassword').value.trim(),
        Role: document.getElementById('userRole').value,
        Access: document.getElementById('userAccess').value === 'true'
    };
    
    if (!userData.Email) {
        showStatusMessage('Email es requerido.', 'error');
        return;
    }
    
    try {
        showStatusMessage('Actualizando usuario...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(currentEditEmail)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        await response.json();
        showStatusMessage('Usuario actualizado exitosamente!', 'success');
        clearUserForm();
        resetUserFormMode();
        loadUsers();
        
    } catch (error) {
        console.error('Error updating user:', error);
        showStatusMessage(`Error al actualizar usuario: ${error.message}`, 'error');
    }
}

async function handleDeleteUser() {
    if (!currentEditEmail) return;
    
    if (!confirm('¿Está seguro que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        showStatusMessage('Eliminando usuario...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(currentEditEmail)}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        await response.json();
        showStatusMessage('Usuario eliminado exitosamente!', 'success');
        clearUserForm();
        resetUserFormMode();
        loadUsers();
        
    } catch (error) {
        console.error('Error deleting user:', error);
        showStatusMessage(`Error al eliminar usuario: ${error.message}`, 'error');
    }
}

async function selectUserForEdit(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const user = await response.json();
        const userData = user.data || user;
        
        currentEditEmail = email;
        userFormMode = 'edit';
        
        // Populate form
        document.getElementById('userEmail').value = userData.Email || email;
        document.getElementById('userPassword').value = ''; // Don't show password
        document.getElementById('userRole').value = userData.Role || '';
        document.getElementById('userAccess').value = userData.Access === true || userData.Access === 'true' ? 'true' : 'false';
        
        // Update form UI
        document.getElementById('userFormTitle').textContent = 'Editar Usuario';
        document.getElementById('submitUserBtn').style.display = 'none';
        document.getElementById('updateUserBtn').style.display = 'block';
        document.getElementById('deleteUserBtn').style.display = 'block';
        
        showStatusMessage('Usuario seleccionado para editar.', 'success');
        
        // Make email field readonly when editing
        document.getElementById('userEmail').readOnly = true;
        
    } catch (error) {
        console.error('Error loading user for edit:', error);
        showStatusMessage('Error al cargar datos del usuario.', 'error');
    }
}

function confirmDeleteUser(email) {
    if (confirm(`¿Está seguro que desea eliminar el usuario "${email}"? Esta acción no se puede deshacer.`)) {
        deleteUserDirect(email);
    }
}

async function deleteUserDirect(email) {
    try {
        showStatusMessage('Eliminando usuario...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        await response.json();
        showStatusMessage('Usuario eliminado exitosamente!', 'success');
        loadUsers();
        
        // Clear form if this user was being edited
        if (currentEditEmail === email) {
            clearUserForm();
            resetUserFormMode();
        }
        
    } catch (error) {
        console.error('Error deleting user:', error);
        showStatusMessage(`Error al eliminar usuario: ${error.message}`, 'error');
    }
}

function clearUserForm() {
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.reset();
        document.getElementById('userEmail').readOnly = false;
    }
}

function resetUserFormMode() {
    userFormMode = 'add';
    currentEditEmail = null;
    
    // Update form UI
    document.getElementById('userFormTitle').textContent = 'Agregar Usuario';
    document.getElementById('submitUserBtn').style.display = 'block';
    document.getElementById('updateUserBtn').style.display = 'none';
    document.getElementById('deleteUserBtn').style.display = 'none';
    document.getElementById('userEmail').readOnly = false;
}

// Make user functions globally available
window.selectUserForEdit = selectUserForEdit;
window.confirmDeleteUser = confirmDeleteUser;
window.loadUsers = loadUsers;

// Categories Management Functions
async function loadCategoriesForManagement() {
    const categoriesLoading = document.getElementById('categoriesLoading');
    const categoriesManagementList = document.getElementById('categoriesManagementList');
    
    try {
        if (categoriesLoading) categoriesLoading.style.display = 'block';
        
        const response = await fetch(`${API_BASE_URL}/categories-management`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const categories = await response.json();
        displayCategoriesForManagement(categories);
        
    } catch (error) {
        console.error('Error loading categories for management:', error);
        showStatusMessage('Error al cargar categorías.', 'error');
        if (categoriesManagementList) {
            categoriesManagementList.innerHTML = '<div class="error-message">Error al cargar categorías</div>';
        }
    } finally {
        if (categoriesLoading) categoriesLoading.style.display = 'none';
    }
}

function displayCategoriesForManagement(categories) {
    const categoriesManagementList = document.getElementById('categoriesManagementList');
    
    if (!categories || categories.length === 0) {
        categoriesManagementList.innerHTML = `
            <div class="empty-state">
                <h3>No hay categorías</h3>
                <p>Agregue la primera categoría usando el formulario de arriba.</p>
            </div>
        `;
        return;
    }
    
    const tableRows = categories.map(category => {
        const categoryData = category.data || category;
        const name = categoryData.Name || category.id || '';
        
        return `
            <tr data-name="${escapeHtml(name)}">
                <td class="category-name">${escapeHtml(name)}</td>
                <td class="actions">
                    <button class="btn-table btn-delete" onclick="confirmDeleteCategory('${name}')" title="Eliminar">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');

    categoriesManagementList.innerHTML = `
        <div class="table-wrapper">
            <table class="categories-table">
                <thead>
                    <tr>
                        <th>Nombre de la Categoría</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

async function handleCategoryFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const categoryData = {};
    
    formData.forEach((value, key) => {
        categoryData[key] = value.trim();
    });
    
    const categoryName = categoryData.Name;
    
    if (!categoryName) {
        showStatusMessage('Nombre de categoría es requerido.', 'error');
        return;
    }
    
    try {
        showStatusMessage('Agregando categoría...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/categories-management`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoryData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        await response.json();
        showStatusMessage('Categoría agregada exitosamente!', 'success');
        clearCategoryForm();
        loadCategoriesForManagement();
        
        // Refresh categories in product form
        loadCategories();
        
    } catch (error) {
        console.error('Error adding category:', error);
        showStatusMessage(`Error al agregar categoría: ${error.message}`, 'error');
    }
}

function confirmDeleteCategory(categoryName) {
    if (confirm(`¿Está seguro que desea eliminar la categoría "${categoryName}"? Esta acción no se puede deshacer y puede afectar los productos que usen esta categoría.`)) {
        deleteCategoryDirect(categoryName);
    }
}

async function deleteCategoryDirect(categoryName) {
    try {
        showStatusMessage('Eliminando categoría...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/categories-management/${encodeURIComponent(categoryName)}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        await response.json();
        showStatusMessage('Categoría eliminada exitosamente!', 'success');
        loadCategoriesForManagement();
        
        // Refresh categories in product form
        loadCategories();
        
    } catch (error) {
        console.error('Error deleting category:', error);
        showStatusMessage(`Error al eliminar categoría: ${error.message}`, 'error');
    }
}

function clearCategoryForm() {
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.reset();
    }
}

// Make category functions globally available
window.loadCategoriesForManagement = loadCategoriesForManagement;
window.confirmDeleteCategory = confirmDeleteCategory;

// Helper function to get category display name
function getCategoryName(category) {
    const categoryNames = {
        'electronics': 'Electrónicos',
        'books': 'Libros',
        'clothing': 'Ropa',
        'food': 'Comida',
        'other': 'Otros'
    };
    return categoryNames[category] || category;
}

// Helper function to get gender display name
function getGenderName(gender) {
    const genderNames = {
        'NA': 'NA',
        'hombre': 'Hombre',
        'mujer': 'Mujer',
        'unisex': 'Unisex'
    };
    return genderNames[gender] || gender;
}

// Helper function to get cloth type display name
function getClothName(cloth) {
    const clothNames = {
        'NA': 'NA',
        'calidad-economica': 'Calidad Economica',
        'calidad-economica-plus': 'Calidad Economica plus',
        'calidad-economica-premium': 'Calidad Economica premium',
        'calidad-baja': 'Calidad Baja',
        'calidad-baja-plus': 'Calidad Baja plus',
        'calidad-baja-premium': 'Calidad Baja premium',
        'calidad-media': 'Calidad Media',
        'calidad-media-plus': 'Calidad Media plus',
        'calidad-media-premium': 'Calidad Media premium',
        'calidad-alta': 'Calidad Alta',
        'calidad-alta-plus': 'Calidad Alta plus',
        'calidad-alta-premium': 'Calidad Alta premium',
        'calidad-premium': 'Calidad Premium',
        'calidad-premium-plus': 'Calidad Premium plus',
        'calidad-super-premium': 'Calidad Super premium'
    };
    return clothNames[cloth] || cloth;
}

// Handle print catalog functionality
async function handlePrintCatalog() {
    try {
        showStatusMessage('Generando catálogo PDF...', 'info');
        
        // Get current items data
        const itemsTable = document.querySelector('#itemsTable');
        const rows = itemsTable.querySelectorAll('tbody tr');
        
        if (rows.length === 0) {
            showStatusMessage('No hay productos para incluir en el catálogo', 'error');
            return;
        }
        
        // Create new jsPDF instance
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set document properties
        doc.setProperties({
            title: 'Catálogo de Productos',
            subject: 'Lista de productos del inventario',
            creator: 'Sistema de Gestión'
        });
        
        // Add header
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Catálogo de Productos', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 105, 30, { align: 'center' });
        
        let yPosition = 50;
        let pageHeight = doc.internal.pageSize.height;
        
        // Process each product row
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.querySelectorAll('td');
            
            if (cells.length >= 12) {
                // Extract product data
                const name = cells[0]?.textContent?.trim() || 'Sin nombre';
                const price = cells[2]?.textContent?.trim() || '$0.00';
                const discount = cells[3]?.textContent?.trim() || '0%';
                const size = cells[7]?.textContent?.trim() || 'N/A';
                const gender = cells[8]?.textContent?.trim() || 'N/A';
                const imageLink = cells[11]?.querySelector('a');
                const imageUrl = imageLink ? imageLink.href : null;
                
                // Check if we need a new page
                if (yPosition > pageHeight - 60) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                // Draw product container
                doc.setDrawColor(200);
                doc.rect(10, yPosition - 5, 190, 45);
                
                let xPosition = 15;
                
                // Add product image if available
                if (imageUrl && imageUrl !== '#') {
                    try {
                        // Convert image to base64 for PDF with higher resolution
                        const imgData = await loadImageAsBase64(imageUrl);
                        if (imgData) {
                            doc.addImage(imgData, 'JPEG', xPosition, yPosition, 40, 40);
                        }
                    } catch (error) {
                        console.warn('Error loading image:', error);
                        // Draw placeholder if image fails
                        doc.setFillColor(240);
                        doc.rect(xPosition, yPosition, 40, 40, 'F');
                        doc.setFontSize(8);
                        doc.text('Sin imagen', xPosition + 20, yPosition + 23, { align: 'center' });
                    }
                } else {
                    // Draw placeholder for missing image
                    doc.setFillColor(240);
                    doc.rect(xPosition, yPosition, 40, 40, 'F');
                    doc.setFontSize(8);
                    doc.text('Sin imagen', xPosition + 20, yPosition + 23, { align: 'center' });
                }
                
                xPosition += 50;
                
                // Add product details
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.text(name.substring(0, 40), xPosition, yPosition + 8);
                
                doc.setFont(undefined, 'normal');
                doc.setFontSize(10);
                
                // Price and discount
                let priceText = `Precio: ${price}`;
                if (discount && discount !== '0%') {
                    priceText += ` (Descuento: ${discount})`;
                }
                doc.text(priceText, xPosition, yPosition + 18);
                
                // Size and gender
                doc.text(`Talla: ${size} | Género: ${gender}`, xPosition, yPosition + 26);
                
                yPosition += 55;
            }
        }
        
        // Save PDF
        const filename = `catalogo-productos-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        showStatusMessage('Catálogo PDF generado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error generating PDF catalog:', error);
        showStatusMessage('Error al generar el catálogo PDF', 'error');
    }
}

// Helper function to load image as base64
function loadImageAsBase64(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to higher resolution (120x120) for better quality
            canvas.width = 120;
            canvas.height = 120;
            
            // Draw image scaled to 120x120 with better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, 120, 120);
            
            // Get base64 data with higher quality (0.95 instead of 0.8)
            const dataURL = canvas.toDataURL('image/jpeg', 0.95);
            resolve(dataURL);
        };
        
        img.onerror = function() {
            resolve(null); // Return null if image fails to load
        };
        
        img.src = url;
        
        // Timeout after 5 seconds
        setTimeout(() => {
            resolve(null);
        }, 5000);
    });
}

// Client Management Variables
let currentEditPhone = null;
let clientFormMode = 'add'; // 'add' or 'edit'

// Client Management Functions
async function loadClients() {
    const clientsLoading = document.getElementById('clientsLoading');
    const clientsList = document.getElementById('clientsList');
    
    try {
        if (clientsLoading) clientsLoading.style.display = 'block';
        
        const response = await fetch(`${API_BASE_URL}/clients`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const clients = await response.json();
        displayClients(clients);
        
    } catch (error) {
        console.error('Error loading clients:', error);
        showStatusMessage('Error al cargar clientes.', 'error');
        if (clientsList) {
            clientsList.innerHTML = '<div class="error-message">Error al cargar clientes</div>';
        }
    } finally {
        if (clientsLoading) clientsLoading.style.display = 'none';
    }
}

function displayClients(clients) {
    const clientsList = document.getElementById('clientsList');
    
    if (!clients || clients.length === 0) {
        clientsList.innerHTML = `
            <div class="empty-state">
                <h3>No hay clientes</h3>
                <p>Agregue el primer cliente usando el formulario de arriba.</p>
            </div>
        `;
        return;
    }
    
    const tableRows = clients.map(client => {
        const clientData = client.data || client;
        const phone = clientData.Phone || client.id || '';
        const purchased = parseInt(clientData.Purchased || 0);
        const discount = parseFloat(clientData.Discount || 0).toFixed(2);
        
        return `
            <tr data-phone="${escapeHtml(phone)}">
                <td class="client-phone">${escapeHtml(phone)}</td>
                <td class="client-purchased">${purchased}</td>
                <td class="client-discount">${discount}%</td>
                <td class="actions">
                    <button class="btn-table btn-edit" onclick="selectClientForEdit('${phone}')" title="Editar">✏️</button>
                    <button class="btn-table btn-delete" onclick="confirmDeleteClient('${phone}')" title="Eliminar">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');

    clientsList.innerHTML = `
        <div class="table-wrapper">
            <table class="clients-table">
                <thead>
                    <tr>
                        <th>Teléfono</th>
                        <th>Veces Comprado</th>
                        <th>Descuento</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

async function handleClientFormSubmit(event) {
    event.preventDefault();
    
    if (clientFormMode === 'add') {
        await handleAddClient(event);
    } else if (clientFormMode === 'edit') {
        await handleUpdateClient();
    }
}

async function handleAddClient(event) {
    const formData = new FormData(event.target);
    const clientData = {};
    
    formData.forEach((value, key) => {
        clientData[key] = value.trim();
    });
    
    // Convert numeric fields
    clientData.Purchased = parseInt(clientData.Purchased) || 0;
    clientData.Discount = parseFloat(clientData.Discount) || 0;
    
    const phone = clientData.Phone;
    
    if (!phone) {
        showStatusMessage('Teléfono es requerido.', 'error');
        return;
    }
    
    try {
        showStatusMessage('Agregando cliente...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clientData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        await response.json();
        showStatusMessage('Cliente agregado exitosamente!', 'success');
        clearClientForm();
        loadClients();
        
    } catch (error) {
        console.error('Error adding client:', error);
        showStatusMessage(`Error al agregar cliente: ${error.message}`, 'error');
    }
}

async function handleUpdateClient() {
    if (!currentEditPhone) return;
    
    const clientData = {
        Phone: document.getElementById('clientPhone').value.trim(),
        Purchased: parseInt(document.getElementById('clientPurchased').value) || 0,
        Discount: parseFloat(document.getElementById('clientDiscount').value) || 0
    };
    
    if (!clientData.Phone) {
        showStatusMessage('Teléfono es requerido.', 'error');
        return;
    }
    
    try {
        showStatusMessage('Actualizando cliente...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/clients/${encodeURIComponent(currentEditPhone)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clientData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        await response.json();
        showStatusMessage('Cliente actualizado exitosamente!', 'success');
        clearClientForm();
        resetClientFormMode();
        loadClients();
        
    } catch (error) {
        console.error('Error updating client:', error);
        showStatusMessage(`Error al actualizar cliente: ${error.message}`, 'error');
    }
}

async function handleDeleteClient() {
    if (!currentEditPhone) return;
    
    if (!confirm('¿Está seguro que desea eliminar este cliente? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        showStatusMessage('Eliminando cliente...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/clients/${encodeURIComponent(currentEditPhone)}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        await response.json();
        showStatusMessage('Cliente eliminado exitosamente!', 'success');
        clearClientForm();
        resetClientFormMode();
        loadClients();
        
    } catch (error) {
        console.error('Error deleting client:', error);
        showStatusMessage(`Error al eliminar cliente: ${error.message}`, 'error');
    }
}

async function selectClientForEdit(phone) {
    try {
        const response = await fetch(`${API_BASE_URL}/clients/${encodeURIComponent(phone)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const client = await response.json();
        const clientData = client.data || client;
        
        currentEditPhone = phone;
        clientFormMode = 'edit';
        
        // Populate form
        document.getElementById('clientPhone').value = clientData.Phone || phone;
        document.getElementById('clientPurchased').value = clientData.Purchased || 0;
        document.getElementById('clientDiscount').value = clientData.Discount || 0;
        
        // Update form UI
        document.getElementById('clientFormTitle').textContent = 'Editar Cliente';
        document.getElementById('submitClientBtn').style.display = 'none';
        document.getElementById('updateClientBtn').style.display = 'block';
        document.getElementById('deleteClientBtn').style.display = 'block';
        
        showStatusMessage('Cliente seleccionado para editar.', 'success');
        
        // Make phone field readonly when editing
        document.getElementById('clientPhone').readOnly = true;
        
    } catch (error) {
        console.error('Error loading client for edit:', error);
        showStatusMessage('Error al cargar datos del cliente.', 'error');
    }
}

function confirmDeleteClient(phone) {
    if (confirm(`¿Está seguro que desea eliminar el cliente "${phone}"? Esta acción no se puede deshacer.`)) {
        deleteClientDirect(phone);
    }
}

async function deleteClientDirect(phone) {
    try {
        showStatusMessage('Eliminando cliente...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/clients/${encodeURIComponent(phone)}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        await response.json();
        showStatusMessage('Cliente eliminado exitosamente!', 'success');
        loadClients();
        
        // Clear form if this client was being edited
        if (currentEditPhone === phone) {
            clearClientForm();
            resetClientFormMode();
        }
        
    } catch (error) {
        console.error('Error deleting client:', error);
        showStatusMessage(`Error al eliminar cliente: ${error.message}`, 'error');
    }
}

function clearClientForm() {
    const clientForm = document.getElementById('clientForm');
    if (clientForm) {
        clientForm.reset();
        document.getElementById('clientPhone').readOnly = false;
        document.getElementById('clientPurchased').value = '0';
        document.getElementById('clientDiscount').value = '0';
    }
}

function resetClientFormMode() {
    clientFormMode = 'add';
    currentEditPhone = null;
    
    // Update form UI
    document.getElementById('clientFormTitle').textContent = 'Agregar Cliente';
    document.getElementById('submitClientBtn').style.display = 'block';
    document.getElementById('updateClientBtn').style.display = 'none';
    document.getElementById('deleteClientBtn').style.display = 'none';
    document.getElementById('clientPhone').readOnly = false;
}

// Make client functions globally available
window.selectClientForEdit = selectClientForEdit;
window.confirmDeleteClient = confirmDeleteClient;
window.loadClients = loadClients;

// Tickets Management Functions
async function loadTickets() {
    const ticketsLoading = document.getElementById('ticketsLoading');
    const ticketsList = document.getElementById('ticketsList');
    
    try {
        if (ticketsLoading) ticketsLoading.style.display = 'block';
        
        const response = await fetch(`${API_BASE_URL}/tickets`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tickets = await response.json();
        displayTickets(tickets);
        
    } catch (error) {
        console.error('Error loading tickets:', error);
        showStatusMessage('Error al cargar tickets.', 'error');
        if (ticketsList) {
            ticketsList.innerHTML = '<div class="error-message">Error al cargar tickets</div>';
        }
    } finally {
        if (ticketsLoading) ticketsLoading.style.display = 'none';
    }
}

function displayTickets(tickets) {
    const ticketsList = document.getElementById('ticketsList');
    
    if (!tickets || tickets.length === 0) {
        ticketsList.innerHTML = `
            <div class="empty-state">
                <h3>No hay tickets</h3>
                <p>No se encontraron tickets en el sistema.</p>
            </div>
        `;
        return;
    }
    
    const tableRows = tickets.map(ticket => {
        const ticketData = ticket.data || ticket;
        
        // Format date to UTC-6
        const formatDate = (dateField) => {
            if (!dateField) return 'N/A';
            try {
                let date;
                
                // Try different parsing methods
                if (dateField && typeof dateField === 'object') {
                    // Firestore Timestamp with toDate method
                    if (typeof dateField.toDate === 'function') {
                        date = dateField.toDate();
                    }
                    // Firestore Timestamp with seconds/nanoseconds
                    else if (dateField.seconds !== undefined) {
                        date = new Date(dateField.seconds * 1000);
                    }
                    // Object with _seconds property
                    else if (dateField._seconds !== undefined) {
                        date = new Date(dateField._seconds * 1000);
                    }
                    // Try to parse as is
                    else {
                        date = new Date(dateField);
                    }
                } else {
                    // String or number
                    date = new Date(dateField);
                }
                
                // If still invalid, try current date as fallback
                if (!date || isNaN(date.getTime())) {
                    
                    date = new Date();
                }
                
                const months = [
                    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
                ];
                
                const day = date.getDate();
                const month = months[date.getMonth()];
                const year = date.getFullYear();
                
                return `${day} de ${month} de ${year}`;
            } catch (error) {
                console.error('Date formatting error:', error);
                console.error('Original date field:', dateField);
                return 'Sin fecha';
            }
        };
        
        // Format products array
        const formatProducts = (products) => {
            if (!products || !Array.isArray(products) || products.length === 0) {
                return '<em>Sin productos</em>';
            }
            
            return products.map(product => {
                const cloth = product.Cloth || 'N/A';
                const gender = product.Gender || 'N/A';
                const size = product.Size || 'N/A';
                const quantity = product.Quantity || 0;
                const total = parseFloat(product.Total || 0).toFixed(2);
                const name = product.Name || 'Sin nombre';
                
                return `
                    <div class="product-item">
                        <strong>${escapeHtml(name)}</strong><br>
                        <small>Tela: ${escapeHtml(cloth)} | Género: ${escapeHtml(gender)} | Talla: ${escapeHtml(size)}</small><br>
                        <small>Cantidad: ${quantity} | Total: $${total}</small>
                    </div>
                `;
            }).join('');
        };
        
        const client = escapeHtml(ticketData.Client || 'N/A');
        const date = formatDate(ticketData.Date);
        const discount = parseFloat(ticketData.Discount || 0).toFixed(2);
        const paymentMethod = escapeHtml(ticketData.PaymentMethod || 'N/A');
        const status = escapeHtml(ticketData.Status || 'N/A');
        const subtotal = parseFloat(ticketData.Subtotal || 0).toFixed(2);
        const tax = parseFloat(ticketData.Tax || 0).toFixed(2);
        const ticketID = escapeHtml(ticketData.TicketID || ticket.id || 'N/A');
        const total = parseFloat(ticketData.Total || 0).toFixed(2);
        const products = formatProducts(ticketData.Products);
        
        return `
            <tr data-ticket-id="${escapeHtml(ticketID)}">
                <td class="ticket-client">${client}</td>
                <td class="ticket-date">${date}</td>
                <td class="ticket-discount">${discount}%</td>
                <td class="ticket-payment">${paymentMethod}</td>
                <td class="ticket-status">${status}</td>
                <td class="ticket-subtotal">$${subtotal}</td>
                <td class="ticket-tax">$${tax}</td>
                <td class="ticket-id">${ticketID}</td>
                <td class="ticket-total">$${total}</td>
                <td class="ticket-products">
                    <div class="products-container">
                        ${products}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    ticketsList.innerHTML = `
        <div class="table-wrapper">
            <table class="tickets-table">
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Fecha (UTC-6)</th>
                        <th>Descuento</th>
                        <th>Método Pago</th>
                        <th>Estado</th>
                        <th>Subtotal</th>
                        <th>Impuesto</th>
                        <th>Ticket ID</th>
                        <th>Total</th>
                        <th>Productos</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

async function printAllTickets() {
    try {
        showStatusMessage('Generando PDF de tickets...', 'info');
        
        // Get current tickets data
        const response = await fetch(`${API_BASE_URL}/tickets`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tickets = await response.json();
        
        if (!tickets || tickets.length === 0) {
            showStatusMessage('No hay tickets para imprimir', 'error');
            return;
        }
        
        // Create new jsPDF instance
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set document properties
        doc.setProperties({
            title: 'Reporte de Tickets',
            subject: 'Lista completa de tickets del sistema',
            creator: 'Sistema de Gestión'
        });
        
        // Add header
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Reporte de Tickets', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 105, 30, { align: 'center' });
        doc.text(`Total de tickets: ${tickets.length}`, 105, 40, { align: 'center' });
        
        let yPosition = 60;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        
        // Process each ticket
        for (let i = 0; i < tickets.length; i++) {
            const ticket = tickets[i];
            const ticketData = ticket.data || ticket;
            
            // Check if we need a new page
            if (yPosition > pageHeight - 60) {
                doc.addPage();
                yPosition = 20;
            }
            
            // Ticket header
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(`Ticket #${ticketData.TicketID || ticket.id}`, margin, yPosition);
            
            yPosition += 10;
            
            // Ticket details
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            
            const client = ticketData.Client || 'N/A';
            const date = ticketData.Date ? (ticketData.Date.toDate ? ticketData.Date.toDate() : new Date(ticketData.Date)) : new Date();
            const dateStr = date.toLocaleString('es-MX');
            const total = parseFloat(ticketData.Total || 0).toFixed(2);
            const status = ticketData.Status || 'N/A';
            const paymentMethod = ticketData.PaymentMethod || 'N/A';
            
            doc.text(`Cliente: ${client}`, margin, yPosition);
            doc.text(`Fecha: ${dateStr}`, margin, yPosition + 8);
            doc.text(`Total: $${total}`, margin, yPosition + 16);
            doc.text(`Estado: ${status}`, margin, yPosition + 24);
            doc.text(`Método de Pago: ${paymentMethod}`, margin, yPosition + 32);
            
            yPosition += 45;
            
            // Products
            if (ticketData.Products && Array.isArray(ticketData.Products) && ticketData.Products.length > 0) {
                doc.setFont(undefined, 'bold');
                doc.text('Productos:', margin, yPosition);
                yPosition += 8;
                
                doc.setFont(undefined, 'normal');
                ticketData.Products.forEach(product => {
                    if (yPosition > pageHeight - 20) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    
                    const name = product.Name || 'Sin nombre';
                    const quantity = product.Quantity || 0;
                    const productTotal = parseFloat(product.Total || 0).toFixed(2);
                    const cloth = product.Cloth || 'N/A';
                    const gender = product.Gender || 'N/A';
                    const size = product.Size || 'N/A';
                    
                    doc.text(`• ${name}`, margin + 5, yPosition);
                    doc.text(`  Cantidad: ${quantity} | Total: $${productTotal}`, margin + 5, yPosition + 6);
                    doc.text(`  Tela: ${cloth} | Género: ${gender} | Talla: ${size}`, margin + 5, yPosition + 12);
                    
                    yPosition += 20;
                });
            }
            
            // Add separator line
            yPosition += 10;
            doc.line(margin, yPosition, 190, yPosition);
            yPosition += 15;
        }
        
        // Save PDF
        const filename = `tickets-reporte-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        showStatusMessage('PDF de tickets generado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error generating tickets PDF:', error);
        showStatusMessage('Error al generar el PDF de tickets', 'error');
    }
}

// Make tickets functions globally available
window.loadTickets = loadTickets;
window.printAllTickets = printAllTickets;

// Spendings Management Functions
async function loadSpendings() {
    const spendingsLoading = document.getElementById('spendingsLoading');
    const spendingsList = document.getElementById('spendingsList');
    
    try {
        if (spendingsLoading) spendingsLoading.style.display = 'block';
        
        const response = await fetch(`${API_BASE_URL}/spendings`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const spendings = await response.json();
        displaySpendings(spendings);
        
    } catch (error) {
        console.error('Error loading spendings:', error);
        showStatusMessage('Error al cargar gastos.', 'error');
        if (spendingsList) {
            spendingsList.innerHTML = '<div class="error-message">Error al cargar gastos</div>';
        }
    } finally {
        if (spendingsLoading) spendingsLoading.style.display = 'none';
    }
}

function displaySpendings(spendings) {
    const spendingsList = document.getElementById('spendingsList');
    
    if (!spendings || spendings.length === 0) {
        spendingsList.innerHTML = `
            <div class="empty-state">
                <h3>No hay gastos</h3>
                <p>No se encontraron gastos en el sistema.</p>
            </div>
        `;
        return;
    }
    
    // Group all spending items by date
    const allSpendingItems = [];
    
    spendings.forEach(spendingDoc => {
        const spendingData = spendingDoc.data || spendingDoc;
        const date = spendingDoc.id; // Document ID in format 20-12-2025
        const spendingsList = spendingData.SpendingsList || [];
        
        spendingsList.forEach(item => {
            allSpendingItems.push({
                date: date,
                amount: parseFloat(item.Amount || 0),
                name: item.Name || 'Sin nombre'
            });
        });
    });
    
    // Sort by date (newest first)
    allSpendingItems.sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB - dateA;
    });
    
    const tableRows = allSpendingItems.map(item => {
        const formattedDate = formatSpendingDate(item.date);
        const formattedAmount = item.amount.toFixed(2);
        
        return `
            <tr>
                <td class="spending-date">${escapeHtml(formattedDate)}</td>
                <td class="spending-name">${escapeHtml(item.name)}</td>
                <td class="spending-amount">$${formattedAmount}</td>
            </tr>
        `;
    }).join('');

    // Calculate total
    const totalAmount = allSpendingItems.reduce((sum, item) => sum + item.amount, 0);

    spendingsList.innerHTML = `
        <div class="table-wrapper">
            <div class="spendings-summary">
                <h3>Total de Gastos: $${totalAmount.toFixed(2)}</h3>
                <p>Total de registros: ${allSpendingItems.length}</p>
            </div>
            <table class="spendings-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Descripción</th>
                        <th>Monto</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

// Helper function to parse date from format "20-12-2025" to Date object
function parseDate(dateString) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const year = parseInt(parts[2]);
        return new Date(year, month, day);
    }
    return new Date();
}

// Helper function to format date for display
function formatSpendingDate(dateString) {
    const date = parseDate(dateString);
    const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} de ${month} de ${year}`;
}

async function printAllSpendings() {
    try {
        showStatusMessage('Generando PDF de gastos...', 'info');
        
        // Get current spendings data
        const response = await fetch(`${API_BASE_URL}/spendings`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const spendings = await response.json();
        
        if (!spendings || spendings.length === 0) {
            showStatusMessage('No hay gastos para imprimir', 'error');
            return;
        }
        
        // Group all spending items by date
        const allSpendingItems = [];
        spendings.forEach(spendingDoc => {
            const spendingData = spendingDoc.data || spendingDoc;
            const date = spendingDoc.id;
            const spendingsList = spendingData.SpendingsList || [];
            
            spendingsList.forEach(item => {
                allSpendingItems.push({
                    date: date,
                    amount: parseFloat(item.Amount || 0),
                    name: item.Name || 'Sin nombre'
                });
            });
        });
        
        // Sort by date (newest first)
        allSpendingItems.sort((a, b) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateB - dateA;
        });
        
        // Create new jsPDF instance
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set document properties
        doc.setProperties({
            title: 'Reporte de Gastos',
            subject: 'Lista completa de gastos del sistema',
            creator: 'Sistema de Gestión'
        });
        
        // Add header
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Reporte de Gastos', 105, 20, { align: 'center' });
        
        const totalAmount = allSpendingItems.reduce((sum, item) => sum + item.amount, 0);
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 105, 30, { align: 'center' });
        doc.text(`Total de gastos: ${allSpendingItems.length}`, 105, 40, { align: 'center' });
        doc.text(`Monto total: $${totalAmount.toFixed(2)}`, 105, 50, { align: 'center' });
        
        let yPosition = 70;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        
        // Table headers
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Fecha', margin, yPosition);
        doc.text('Descripción', margin + 50, yPosition);
        doc.text('Monto', margin + 130, yPosition);
        
        // Draw header line
        doc.line(margin, yPosition + 2, 190, yPosition + 2);
        yPosition += 10;
        
        // Process each spending item
        doc.setFont(undefined, 'normal');
        for (let i = 0; i < allSpendingItems.length; i++) {
            const item = allSpendingItems[i];
            
            // Check if we need a new page
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
                
                // Redraw headers on new page
                doc.setFont(undefined, 'bold');
                doc.text('Fecha', margin, yPosition);
                doc.text('Descripción', margin + 50, yPosition);
                doc.text('Monto', margin + 130, yPosition);
                doc.line(margin, yPosition + 2, 190, yPosition + 2);
                yPosition += 10;
                doc.setFont(undefined, 'normal');
            }
            
            const formattedDate = formatSpendingDate(item.date);
            const truncatedName = item.name.length > 25 ? item.name.substring(0, 22) + '...' : item.name;
            const formattedAmount = `$${item.amount.toFixed(2)}`;
            
            doc.text(formattedDate, margin, yPosition);
            doc.text(truncatedName, margin + 50, yPosition);
            doc.text(formattedAmount, margin + 130, yPosition);
            
            yPosition += 8;
        }
        
        // Add total at the bottom
        yPosition += 10;
        if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 30;
        }
        
        doc.line(margin, yPosition, 190, yPosition);
        yPosition += 8;
        doc.setFont(undefined, 'bold');
        doc.text(`TOTAL: $${totalAmount.toFixed(2)}`, margin + 130, yPosition);
        
        // Save PDF
        const filename = `gastos-reporte-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        showStatusMessage('PDF de gastos generado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error generating spendings PDF:', error);
        showStatusMessage('Error al generar el PDF de gastos', 'error');
    }
}

// Make spendings functions globally available
window.loadSpendings = loadSpendings;
window.printAllSpendings = printAllSpendings;

// Sales Statistics Management Functions
async function loadSalesStatistics() {
    const salesStatsLoading = document.getElementById('salesStatsLoading');
    const salesStatsList = document.getElementById('salesStatsList');
    
    try {
        if (salesStatsLoading) salesStatsLoading.style.display = 'block';
        
        const response = await fetch(`${API_BASE_URL}/sales-statistics`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const salesStats = await response.json();
        displaySalesStatistics(salesStats);
        
    } catch (error) {
        console.error('Error loading sales statistics:', error);
        showStatusMessage('Error al cargar estadísticas de ventas.', 'error');
        if (salesStatsList) {
            salesStatsList.innerHTML = '<div class="error-message">Error al cargar estadísticas de ventas</div>';
        }
    } finally {
        if (salesStatsLoading) salesStatsLoading.style.display = 'none';
    }
}

function displaySalesStatistics(salesStats) {
    const salesStatsList = document.getElementById('salesStatsList');
    
    if (!salesStats || salesStats.length === 0) {
        salesStatsList.innerHTML = `
            <div class="empty-state">
                <h3>No hay estadísticas de ventas</h3>
                <p>No se encontraron estadísticas en el sistema.</p>
            </div>
        `;
        return;
    }
    
    // Sort by period (most recent first)
    salesStats.sort((a, b) => {
        const periodA = parsePeriod(a.id);
        const periodB = parsePeriod(b.id);
        return periodB - periodA;
    });
    
    const tableRows = salesStats.map(stat => {
        const statData = stat.data || stat;
        const period = formatPeriod(stat.id);
        const sales = parseInt(statData.Sales || 0);
        const salesMoney = parseFloat(statData.SalesMoney || 0);
        
        return `
            <tr data-period="${escapeHtml(stat.id)}">
                <td class="stats-period">${escapeHtml(period)}</td>
                <td class="stats-sales">${sales.toLocaleString()}</td>
                <td class="stats-money">$${salesMoney.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
        `;
    }).join('');

    // Calculate totals
    const totalSales = salesStats.reduce((sum, stat) => sum + parseInt((stat.data || stat).Sales || 0), 0);
    const totalMoney = salesStats.reduce((sum, stat) => sum + parseFloat((stat.data || stat).SalesMoney || 0), 0);

    salesStatsList.innerHTML = `
        <div class="table-wrapper">
            <div class="sales-stats-summary">
                <div class="summary-card">
                    <h3>Resumen Total</h3>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span class="summary-label">Total de Ventas:</span>
                            <span class="summary-value">${totalSales.toLocaleString()}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Monto Total:</span>
                            <span class="summary-value money">$${totalMoney.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Períodos:</span>
                            <span class="summary-value">${salesStats.length}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Promedio por Período:</span>
                            <span class="summary-value money">$${(totalMoney / salesStats.length).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>
            <table class="sales-stats-table">
                <thead>
                    <tr>
                        <th>Período</th>
                        <th>Cantidad de Ventas</th>
                        <th>Monto Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

// Helper function to parse period from format "diciembre2025" to Date for sorting
function parsePeriod(periodString) {
    const months = {
        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
        'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };
    
    // Extract month and year
    const match = periodString.match(/^([a-záéíóúü]+)(\d{4})$/i);
    if (match) {
        const monthName = match[1].toLowerCase();
        const year = parseInt(match[2]);
        const month = months[monthName];
        if (month !== undefined) {
            return new Date(year, month, 1);
        }
    }
    return new Date(0); // fallback for invalid formats
}

// Helper function to format period for display
function formatPeriod(periodString) {
    const months = {
        'enero': 'Enero', 'febrero': 'Febrero', 'marzo': 'Marzo', 'abril': 'Abril',
        'mayo': 'Mayo', 'junio': 'Junio', 'julio': 'Julio', 'agosto': 'Agosto',
        'septiembre': 'Septiembre', 'octubre': 'Octubre', 'noviembre': 'Noviembre', 'diciembre': 'Diciembre'
    };
    
    // Extract month and year
    const match = periodString.match(/^([a-záéíóúü]+)(\d{4})$/i);
    if (match) {
        const monthName = match[1].toLowerCase();
        const year = match[2];
        const formattedMonth = months[monthName] || match[1];
        return `${formattedMonth} ${year}`;
    }
    return periodString; // fallback to original if can't parse
}

async function printSalesStatistics() {
    try {
        showStatusMessage('Generando PDF de estadísticas de ventas...', 'info');
        
        // Get current sales statistics data
        const response = await fetch(`${API_BASE_URL}/sales-statistics`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const salesStats = await response.json();
        
        if (!salesStats || salesStats.length === 0) {
            showStatusMessage('No hay estadísticas para imprimir', 'error');
            return;
        }
        
        // Sort by period (most recent first)
        salesStats.sort((a, b) => {
            const periodA = parsePeriod(a.id);
            const periodB = parsePeriod(b.id);
            return periodB - periodA;
        });
        
        // Create new jsPDF instance
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set document properties
        doc.setProperties({
            title: 'Estadísticas de Ventas',
            subject: 'Reporte de estadísticas de ventas por período',
            creator: 'Sistema de Gestión'
        });
        
        // Add header
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Estadísticas de Ventas', 105, 20, { align: 'center' });
        
        // Calculate totals
        const totalSales = salesStats.reduce((sum, stat) => sum + parseInt((stat.data || stat).Sales || 0), 0);
        const totalMoney = salesStats.reduce((sum, stat) => sum + parseFloat((stat.data || stat).SalesMoney || 0), 0);
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 105, 30, { align: 'center' });
        doc.text(`Total de períodos: ${salesStats.length}`, 105, 40, { align: 'center' });
        doc.text(`Total de ventas: ${totalSales.toLocaleString()}`, 105, 50, { align: 'center' });
        doc.text(`Monto total: $${totalMoney.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 105, 60, { align: 'center' });
        
        let yPosition = 80;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        
        // Table headers
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Período', margin, yPosition);
        doc.text('Cantidad de Ventas', margin + 60, yPosition);
        doc.text('Monto Total', margin + 120, yPosition);
        
        // Draw header line
        doc.line(margin, yPosition + 2, 170, yPosition + 2);
        yPosition += 10;
        
        // Process each period
        doc.setFont(undefined, 'normal');
        for (let i = 0; i < salesStats.length; i++) {
            const stat = salesStats[i];
            const statData = stat.data || stat;
            
            // Check if we need a new page
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
                
                // Redraw headers on new page
                doc.setFont(undefined, 'bold');
                doc.text('Período', margin, yPosition);
                doc.text('Cantidad de Ventas', margin + 60, yPosition);
                doc.text('Monto Total', margin + 120, yPosition);
                doc.line(margin, yPosition + 2, 170, yPosition + 2);
                yPosition += 10;
                doc.setFont(undefined, 'normal');
            }
            
            const period = formatPeriod(stat.id);
            const sales = parseInt(statData.Sales || 0);
            const salesMoney = parseFloat(statData.SalesMoney || 0);
            
            doc.text(period, margin, yPosition);
            doc.text(sales.toLocaleString(), margin + 60, yPosition);
            doc.text(`$${salesMoney.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, margin + 120, yPosition);
            
            yPosition += 8;
        }
        
        // Add totals at the bottom
        yPosition += 10;
        if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 30;
        }
        
        doc.line(margin, yPosition, 170, yPosition);
        yPosition += 8;
        doc.setFont(undefined, 'bold');
        doc.text(`TOTALES:`, margin, yPosition);
        doc.text(`${totalSales.toLocaleString()}`, margin + 60, yPosition);
        doc.text(`$${totalMoney.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, margin + 120, yPosition);
        
        // Save PDF
        const filename = `estadisticas-ventas-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        showStatusMessage('PDF de estadísticas generado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error generating sales statistics PDF:', error);
        showStatusMessage('Error al generar el PDF de estadísticas', 'error');
    }
}

// Make sales statistics functions globally available
window.loadSalesStatistics = loadSalesStatistics;
window.printSalesStatistics = printSalesStatistics;
