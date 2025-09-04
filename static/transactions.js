// إدارة المعاملات - Transactions JavaScript

class Transactions {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTransactionsData();
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

    async loadTransactionsData() {
        try {
            const response = await fetch('/api/transactions');
            const data = await response.json();

            if (data.success) {
                this.updateTransactionsTable(data.data);
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    }

    updateTransactionsTable(transactions) {
        const tbody = document.getElementById('transactionsTable');
        tbody.innerHTML = '';

        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.transaction_number}</td>
                <td>${this.formatDate(transaction.created_at)}</td>
                <td>
                    <span class="badge ${transaction.type === 'receipt' ? 'success' : 'danger'}">
                        ${transaction.type === 'receipt' ? 'إيراد' : 'مصروف'}
                    </span>
                </td>
                <td>${this.formatCurrency(transaction.amount)}</td>
                <td>${transaction.description}</td>
                <td>${transaction.treasury_name || 'غير محدد'}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewTransaction(${transaction.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="editTransaction(${transaction.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTransaction(${transaction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    showAddTransactionModal() {
        const modal = this.createModal('إضافة معاملة جديدة', this.getTransactionForm());
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
                    <button class="btn btn-primary" onclick="saveTransaction()">حفظ</button>
                </div>
            </div>
        `;
        return modal;
    }

    getTransactionForm() {
        return `
            <div class="form-group">
                <label class="form-label">نوع المعاملة</label>
                <select class="form-select" id="transactionType">
                    <option value="receipt">إيراد</option>
                    <option value="payment">مصروف</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">المبلغ</label>
                <input type="number" class="form-input" id="transactionAmount" step="0.01" required>
            </div>
            <div class="form-group">
                <label class="form-label">الوصف</label>
                <textarea class="form-textarea" id="transactionDescription" required></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">الخزينة</label>
                <select class="form-select" id="transactionTreasury" required>
                    <option value="">اختر الخزينة</option>
                </select>
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

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA');
    }
}

// وظائف عامة
function filterTransactions() {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    const type = document.getElementById('transactionType').value;
    
    // تطبيق الفلاتر
    console.log('Filtering transactions:', { fromDate, toDate, type });
    // يمكن إضافة منطق الفلترة هنا
}

function showAddTransactionModal() {
    window.transactions.showAddTransactionModal();
}

function viewTransaction(id) {
    console.log('Viewing transaction:', id);
}

function editTransaction(id) {
    console.log('Editing transaction:', id);
}

function deleteTransaction(id) {
    if (confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
        console.log('Deleting transaction:', id);
    }
}

function saveTransaction() {
    console.log('Saving transaction...');
    // يمكن إضافة منطق حفظ المعاملة هنا
}

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.transactions = new Transactions();
});