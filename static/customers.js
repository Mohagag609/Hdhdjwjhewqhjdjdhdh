// إدارة العملاء - Customers JavaScript

class Customers {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCustomersData();
    }

    setupEventListeners() {
        // تسجيل الخروج
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // تبديل القائمة الجانبية
        document.getElementById('menuToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.getElementById('sidebarToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // إغلاق القائمة الجانبية عند النقر خارجها (على الهواتف)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar');
                const menuToggle = document.getElementById('menuToggle');
                
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }

    async handleLogout() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/';
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }

    async loadCustomersData() {
        try {
            const response = await fetch('/api/parties?type=customer');
            const data = await response.json();

            if (data.success) {
                this.updateCustomersTable(data.data);
            }
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    }

    updateCustomersTable(customers) {
        const tbody = document.getElementById('customersTable');
        tbody.innerHTML = '';
        
        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.phone || '-'}</td>
                <td>${customer.email || '-'}</td>
                <td>${customer.address || '-'}</td>
                <td>${this.formatCurrency(0)}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewCustomer(${customer.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="editCustomer(${customer.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    showAddCustomerModal() {
        const modal = this.createModal('إضافة عميل جديد', this.getCustomerForm());
        document.getElementById('modals').appendChild(modal);
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">إلغاء</button>
                    <button class="btn btn-primary" onclick="saveCustomer()">حفظ</button>
                </div>
            </div>
        `;
        return modal;
    }

    getCustomerForm() {
        return `
            <div class="form-group">
                <label class="form-label">اسم العميل</label>
                <input type="text" class="form-input" id="customerName" required>
            </div>
            <div class="form-group">
                <label class="form-label">الهاتف</label>
                <input type="tel" class="form-input" id="customerPhone">
            </div>
            <div class="form-group">
                <label class="form-label">البريد الإلكتروني</label>
                <input type="email" class="form-input" id="customerEmail">
            </div>
            <div class="form-group">
                <label class="form-label">العنوان</label>
                <textarea class="form-textarea" id="customerAddress"></textarea>
            </div>
        `;
    }

    // وظائف مساعدة
    formatCurrency(amount) {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR'
        }).format(amount);
    }
}

// وظائف عامة
function showAddCustomerModal() {
    window.customers.showAddCustomerModal();
}

function viewCustomer(id) {
    console.log('Viewing customer:', id);
}

function editCustomer(id) {
    console.log('Editing customer:', id);
}

function deleteCustomer(id) {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
        console.log('Deleting customer:', id);
    }
}

function saveCustomer() {
    console.log('Saving customer...');
    // يمكن إضافة منطق حفظ العميل هنا
}

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.customers = new Customers();
});