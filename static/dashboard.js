// لوحة التحكم - Dashboard JavaScript

class Dashboard {
    constructor() {
        this.currentUser = null;
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.initializeCharts();
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
                <td>${this.formatDate(transaction.created_at)}</td>
                <td>
                    <span class="badge ${transaction.type === 'receipt' ? 'success' : 'danger'}">
                        ${transaction.type === 'receipt' ? 'إيراد' : 'مصروف'}
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
function viewTransaction(id) {
    console.log('Viewing transaction:', id);
    // يمكن إضافة منطق عرض المعاملة هنا
}

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});