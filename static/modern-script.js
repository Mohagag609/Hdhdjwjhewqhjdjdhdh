// نظام الخزنة الاحترافي - JavaScript الحديث
// Professional Treasury System - Modern JavaScript

class TreasurySystem {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.initializeCharts();
    }

    setupEventListeners() {
        // تسجيل الدخول
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

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

        // التنقل بين الأقسام
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.getAttribute('data-section');
                this.showSection(section);
            });
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

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            this.showAlert('يرجى إدخال اسم المستخدم وكلمة المرور', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.user;
                this.showMainScreen();
                this.updateUserInfo();
                this.loadDashboardData();
            } else {
                this.showAlert(data.error || 'خطأ في تسجيل الدخول', 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('خطأ في الاتصال بالخادم', 'danger');
        }
    }

    handleLogout() {
        this.currentUser = null;
        this.showLoginScreen();
    }

    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainScreen').style.display = 'none';
    }

    showMainScreen() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainScreen').style.display = 'flex';
    }

    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('currentUser').textContent = this.currentUser.full_name;
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }

    showSection(sectionName) {
        // إخفاء جميع الأقسام
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // إزالة النشط من جميع الروابط
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // إظهار القسم المطلوب
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // تفعيل الرابط المناسب
        const targetLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }

        // تحديث عنوان الصفحة
        this.updatePageTitle(sectionName);
        this.currentSection = sectionName;

        // تحميل بيانات القسم
        this.loadSectionData(sectionName);
    }

    updatePageTitle(sectionName) {
        const titles = {
            'dashboard': 'لوحة التحكم',
            'cash-flow': 'التدفق النقدي',
            'transactions': 'المعاملات',
            'invoices': 'الفواتير',
            'customers': 'العملاء',
            'suppliers': 'الموردين',
            'inventory': 'المخزون',
            'treasury': 'الخزائن',
            'reports': 'التقارير',
            'settings': 'الإعدادات'
        };

        document.getElementById('pageTitle').textContent = titles[sectionName] || 'النظام';
    }

    async loadSectionData(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'transactions':
                await this.loadTransactionsData();
                break;
            case 'invoices':
                await this.loadInvoicesData();
                break;
            case 'customers':
                await this.loadCustomersData();
                break;
            case 'suppliers':
                await this.loadSuppliersData();
                break;
            case 'inventory':
                await this.loadInventoryData();
                break;
            case 'treasury':
                await this.loadTreasuryData();
                break;
        }
    }

    async loadDashboardData() {
        try {
            // تحميل الإحصائيات
            const statsResponse = await fetch('/api/dashboard/stats');
            const stats = await statsResponse.json();

            if (stats.success) {
                this.updateDashboardStats(stats.data);
            }

            // تحميل المعاملات الأخيرة
            const transactionsResponse = await fetch('/api/transactions/recent');
            const transactions = await transactionsResponse.json();

            if (transactions.success) {
                this.updateRecentTransactions(transactions.data);
            }

            // إنشاء الرسوم البيانية
            this.createCashFlowChart();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateDashboardStats(data) {
        document.getElementById('totalIncome').textContent = this.formatCurrency(data.totalIncome || 0);
        document.getElementById('totalExpenses').textContent = this.formatCurrency(data.totalExpenses || 0);
        document.getElementById('netProfit').textContent = this.formatCurrency(data.netProfit || 0);
        document.getElementById('cashBalance').textContent = this.formatCurrency(data.cashBalance || 0);
    }

    updateRecentTransactions(transactions) {
        const tbody = document.getElementById('recentTransactions');
        tbody.innerHTML = '';

        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(transaction.date)}</td>
                <td>
                    <span class="badge ${transaction.type === 'income' ? 'success' : 'danger'}">
                        ${transaction.type === 'income' ? 'إيراد' : 'مصروف'}
                    </span>
                </td>
                <td>${this.formatCurrency(transaction.amount)}</td>
                <td>${transaction.description}</td>
                <td>
                    <span class="badge success">مكتمل</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewTransaction(${transaction.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    createCashFlowChart() {
        const ctx = document.getElementById('cashFlowChart');
        if (!ctx) return;

        // بيانات وهمية للرسم البياني
        const data = {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [{
                label: 'الإيرادات',
                data: [12000, 15000, 18000, 16000, 20000, 22000],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            }, {
                label: 'المصروفات',
                data: [8000, 10000, 12000, 11000, 13000, 14000],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4
            }]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('ar-SA', {
                                    style: 'currency',
                                    currency: 'SAR'
                                }).format(value);
                            }
                        }
                    }
                }
            }
        };

        if (this.charts.cashFlow) {
            this.charts.cashFlow.destroy();
        }

        this.charts.cashFlow = new Chart(ctx, config);
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
                <td>${this.formatDate(transaction.date)}</td>
                <td>
                    <span class="badge ${transaction.type === 'income' ? 'success' : 'danger'}">
                        ${transaction.type === 'income' ? 'إيراد' : 'مصروف'}
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

    async loadInvoicesData() {
        try {
            const response = await fetch('/api/invoices');
            const data = await response.json();

            if (data.success) {
                this.updateInvoicesTable(data.data);
                this.updateInvoicesStats(data.data);
            }
        } catch (error) {
            console.error('Error loading invoices:', error);
        }
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

    async loadSuppliersData() {
        try {
            const response = await fetch('/api/parties?type=supplier');
            const data = await response.json();

            if (data.success) {
                this.updateSuppliersTable(data.data);
            }
        } catch (error) {
            console.error('Error loading suppliers:', error);
        }
    }

    async loadInventoryData() {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();

            if (data.success) {
                this.updateInventoryTable(data.data);
                this.updateInventoryStats(data.data);
            }
        } catch (error) {
            console.error('Error loading inventory:', error);
        }
    }

    async loadTreasuryData() {
        try {
            const response = await fetch('/api/treasuries');
            const data = await response.json();

            if (data.success) {
                this.updateTreasuryTable(data.data);
                this.updateTreasuryStats(data.data);
            }
        } catch (error) {
            console.error('Error loading treasury:', error);
        }
    }

    // دوال تحديث الجداول
    updateInvoicesTable(invoices) {
        const tbody = document.getElementById('invoicesTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        invoices.forEach(invoice => {
            const row = document.createElement('tr');
            const statusClass = this.getInvoiceStatusClass(invoice.status);
            const statusText = this.getInvoiceStatusText(invoice.status);
            
            row.innerHTML = `
                <td>${invoice.invoice_number}</td>
                <td>${this.formatDate(invoice.issue_date)}</td>
                <td>${invoice.customer_name || 'غير محدد'}</td>
                <td>${this.formatCurrency(invoice.total_amount)}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>${this.formatDate(invoice.due_date)}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewInvoice(${invoice.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="editInvoice(${invoice.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateInvoicesStats(invoices) {
        const totalInvoices = invoices.length;
        const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
        const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
        const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;

        document.getElementById('totalInvoices').textContent = totalInvoices;
        document.getElementById('paidInvoices').textContent = paidInvoices;
        document.getElementById('pendingInvoices').textContent = pendingInvoices;
        document.getElementById('overdueInvoices').textContent = overdueInvoices;
    }

    updateCustomersTable(customers) {
        const tbody = document.getElementById('customersTable');
        if (!tbody) return;
        
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
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateSuppliersTable(suppliers) {
        const tbody = document.getElementById('suppliersTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        suppliers.forEach(supplier => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${supplier.name}</td>
                <td>${supplier.phone || '-'}</td>
                <td>${supplier.email || '-'}</td>
                <td>${supplier.address || '-'}</td>
                <td>${this.formatCurrency(0)}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewSupplier(${supplier.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="editSupplier(${supplier.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateInventoryTable(products) {
        const tbody = document.getElementById('inventoryTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        products.forEach(product => {
            const row = document.createElement('tr');
            const statusClass = this.getProductStatusClass(product.quantity, product.min_quantity);
            const statusText = this.getProductStatusText(product.quantity, product.min_quantity);
            
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.quantity} ${product.unit}</td>
                <td>${this.formatCurrency(product.purchase_price)}</td>
                <td>${this.formatCurrency(product.sale_price)}</td>
                <td>${product.category || '-'}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewProduct(${product.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateInventoryStats(products) {
        const totalProducts = products.length;
        const lowStockProducts = products.filter(p => p.quantity <= p.min_quantity && p.quantity > 0).length;
        const outOfStockProducts = products.filter(p => p.quantity === 0).length;

        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('lowStockProducts').textContent = lowStockProducts;
        document.getElementById('outOfStockProducts').textContent = outOfStockProducts;
    }

    updateTreasuryTable(treasuries) {
        const tbody = document.getElementById('treasuriesTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        treasuries.forEach(treasury => {
            const row = document.createElement('tr');
            const statusClass = treasury.is_active ? 'success' : 'danger';
            const statusText = treasury.is_active ? 'نشط' : 'غير نشط';
            
            row.innerHTML = `
                <td>${treasury.name}</td>
                <td>${treasury.description || '-'}</td>
                <td>${treasury.currency}</td>
                <td>${this.formatCurrency(treasury.current_balance)}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewTreasury(${treasury.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="editTreasury(${treasury.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateTreasuryStats(treasuries) {
        const totalTreasuries = treasuries.length;
        const activeTreasuries = treasuries.filter(t => t.is_active).length;

        document.getElementById('totalTreasuries').textContent = totalTreasuries;
        document.getElementById('activeTreasuries').textContent = activeTreasuries;
    }

    // دوال مساعدة للحالة
    getInvoiceStatusClass(status) {
        const statusClasses = {
            'pending': 'warning',
            'paid': 'success',
            'overdue': 'danger',
            'cancelled': 'secondary'
        };
        return statusClasses[status] || 'secondary';
    }

    getInvoiceStatusText(status) {
        const statusTexts = {
            'pending': 'معلق',
            'paid': 'مدفوع',
            'overdue': 'متأخر',
            'cancelled': 'ملغي'
        };
        return statusTexts[status] || 'غير محدد';
    }

    getProductStatusClass(quantity, minQuantity) {
        if (quantity === 0) return 'danger';
        if (quantity <= minQuantity) return 'warning';
        return 'success';
    }

    getProductStatusText(quantity, minQuantity) {
        if (quantity === 0) return 'نافد';
        if (quantity <= minQuantity) return 'قليل';
        return 'متوفر';
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

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;

        // إضافة التنبيه في أعلى الصفحة
        const content = document.querySelector('.content');
        content.insertBefore(alertDiv, content.firstChild);

        // إزالة التنبيه بعد 5 ثوان
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    // النوافذ المنبثقة
    showAddTransactionModal() {
        const modal = this.createModal('إضافة معاملة جديدة', this.getTransactionForm());
        document.getElementById('modals').appendChild(modal);
    }

    showAddInvoiceModal() {
        const modal = this.createModal('إضافة فاتورة جديدة', this.getInvoiceForm());
        document.getElementById('modals').appendChild(modal);
    }

    showAddCustomerModal() {
        const modal = this.createModal('إضافة عميل جديد', this.getCustomerForm());
        document.getElementById('modals').appendChild(modal);
    }

    showAddSupplierModal() {
        const modal = this.createModal('إضافة مورد جديد', this.getSupplierForm());
        document.getElementById('modals').appendChild(modal);
    }

    showAddProductModal() {
        const modal = this.createModal('إضافة منتج جديد', this.getProductForm());
        document.getElementById('modals').appendChild(modal);
    }

    showAddTreasuryModal() {
        const modal = this.createModal('إضافة خزينة جديدة', this.getTreasuryForm());
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
                    <button class="btn btn-primary" onclick="saveForm()">حفظ</button>
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
                    <option value="income">إيراد</option>
                    <option value="expense">مصروف</option>
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

    getInvoiceForm() {
        return `
            <div class="form-group">
                <label class="form-label">رقم الفاتورة</label>
                <input type="text" class="form-input" id="invoiceNumber" required>
            </div>
            <div class="form-group">
                <label class="form-label">العميل</label>
                <select class="form-select" id="invoiceCustomer" required>
                    <option value="">اختر العميل</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">المبلغ</label>
                <input type="number" class="form-input" id="invoiceAmount" step="0.01" required>
            </div>
            <div class="form-group">
                <label class="form-label">تاريخ الاستحقاق</label>
                <input type="date" class="form-input" id="invoiceDueDate" required>
            </div>
        `;
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

    getSupplierForm() {
        return `
            <div class="form-group">
                <label class="form-label">اسم المورد</label>
                <input type="text" class="form-input" id="supplierName" required>
            </div>
            <div class="form-group">
                <label class="form-label">الهاتف</label>
                <input type="tel" class="form-input" id="supplierPhone">
            </div>
            <div class="form-group">
                <label class="form-label">البريد الإلكتروني</label>
                <input type="email" class="form-input" id="supplierEmail">
            </div>
            <div class="form-group">
                <label class="form-label">العنوان</label>
                <textarea class="form-textarea" id="supplierAddress"></textarea>
            </div>
        `;
    }

    getProductForm() {
        return `
            <div class="form-group">
                <label class="form-label">اسم المنتج</label>
                <input type="text" class="form-input" id="productName" required>
            </div>
            <div class="form-group">
                <label class="form-label">الكمية</label>
                <input type="number" class="form-input" id="productQuantity" required>
            </div>
            <div class="form-group">
                <label class="form-label">سعر الشراء</label>
                <input type="number" class="form-input" id="productPurchasePrice" step="0.01" required>
            </div>
            <div class="form-group">
                <label class="form-label">سعر البيع</label>
                <input type="number" class="form-input" id="productSalePrice" step="0.01" required>
            </div>
            <div class="form-group">
                <label class="form-label">التصنيف</label>
                <input type="text" class="form-input" id="productCategory">
            </div>
        `;
    }

    getTreasuryForm() {
        return `
            <div class="form-group">
                <label class="form-label">اسم الخزينة</label>
                <input type="text" class="form-input" id="treasuryName" required>
            </div>
            <div class="form-group">
                <label class="form-label">الوصف</label>
                <textarea class="form-textarea" id="treasuryDescription"></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">العملة</label>
                <select class="form-select" id="treasuryCurrency" required>
                    <option value="SAR">ريال سعودي</option>
                    <option value="USD">دولار أمريكي</option>
                    <option value="EUR">يورو</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">الرصيد الابتدائي</label>
                <input type="number" class="form-input" id="treasuryInitialBalance" step="0.01" value="0">
            </div>
        `;
    }
}

// وظائف عامة
function filterTransactions() {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    const type = document.getElementById('transactionType').value;
    
    // تطبيق الفلاتر
    console.log('Filtering transactions:', { fromDate, toDate, type });
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

function saveForm() {
    console.log('Saving form...');
}

// دوال العرض والتعديل
function viewInvoice(id) {
    console.log('Viewing invoice:', id);
}

function editInvoice(id) {
    console.log('Editing invoice:', id);
}

function viewCustomer(id) {
    console.log('Viewing customer:', id);
}

function editCustomer(id) {
    console.log('Editing customer:', id);
}

function viewSupplier(id) {
    console.log('Viewing supplier:', id);
}

function editSupplier(id) {
    console.log('Editing supplier:', id);
}

function viewProduct(id) {
    console.log('Viewing product:', id);
}

function editProduct(id) {
    console.log('Editing product:', id);
}

function viewTreasury(id) {
    console.log('Viewing treasury:', id);
}

function editTreasury(id) {
    console.log('Editing treasury:', id);
}

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.treasurySystem = new TreasurySystem();
});

// إضافة أنماط النوافذ المنبثقة
const modalStyles = `
<style>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
}

.modal-body {
    padding: 20px;
}

.modal-footer {
    padding: 20px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
}

.badge.success {
    background: #d1fae5;
    color: #065f46;
}

.badge.danger {
    background: #fee2e2;
    color: #991b1b;
}

.badge.warning {
    background: #fef3c7;
    color: #92400e;
}

.btn-sm {
    padding: 6px 12px;
    font-size: 0.875rem;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', modalStyles);