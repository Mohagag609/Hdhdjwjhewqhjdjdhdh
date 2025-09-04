/**
 * نظام الخزنة الاحترافي - JavaScript
 * Professional Treasury Management System - JavaScript
 */

// متغيرات عامة
let currentUser = null;
let isAuthenticated = false;

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// تهيئة التطبيق
async function initializeApp() {
    // التحقق من حالة المصادقة
    await checkAuthentication();
    
    // إعداد المستمعين للأحداث
    setupEventListeners();
    
    // تحميل البيانات الأولية
    if (isAuthenticated) {
        await loadDashboardData();
    }
}

// إعداد المستمعين للأحداث
function setupEventListeners() {
    // تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // تبديل القائمة الجانبية
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
    
    // التنقل
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // التبويبات
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', handleTabSwitch);
    });
    
    // الأزرار
    setupButtonListeners();
}

// إعداد مستمعي الأزرار
function setupButtonListeners() {
    // إضافة معاملة نقدية
    const addCashBtn = document.getElementById('addCashBtn');
    if (addCashBtn) {
        addCashBtn.addEventListener('click', () => openModal('cashModal'));
    }
    
    // إضافة شيك
    const addCheckBtn = document.getElementById('addCheckBtn');
    if (addCheckBtn) {
        addCheckBtn.addEventListener('click', () => openModal('checkModal'));
    }
    
    // حفظ المعاملة النقدية
    const saveCashBtn = document.getElementById('saveCashBtn');
    if (saveCashBtn) {
        saveCashBtn.addEventListener('click', handleSaveCashTransaction);
    }
    
    // حفظ الشيك
    const saveCheckBtn = document.getElementById('saveCheckBtn');
    if (saveCheckBtn) {
        saveCheckBtn.addEventListener('click', handleSaveCheck);
    }
    
    // إغلاق النوافذ المنبثقة
    const closeBtns = document.querySelectorAll('.close-btn, .btn-secondary');
    closeBtns.forEach(btn => {
        if (btn.id === 'cancelCashBtn' || btn.id === 'cancelCheckBtn') {
            btn.addEventListener('click', closeModal);
        }
    });
    
    // تصفية التقارير
    const filterReportsBtn = document.getElementById('filterReportsBtn');
    if (filterReportsBtn) {
        filterReportsBtn.addEventListener('click', handleFilterReports);
    }
}

// التحقق من المصادقة
async function checkAuthentication() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (data.authenticated) {
            currentUser = data.user;
            isAuthenticated = true;
            showMainScreen();
            updateUserInfo();
        } else {
            showLoginScreen();
        }
    } catch (error) {
        console.error('خطأ في التحقق من المصادقة:', error);
        showLoginScreen();
    }
}

// تسجيل الدخول
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showAlert('يرجى إدخال اسم المستخدم وكلمة المرور', 'error');
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
            currentUser = data.user;
            isAuthenticated = true;
            showMainScreen();
            updateUserInfo();
            await loadDashboardData();
            showAlert('تم تسجيل الدخول بنجاح', 'success');
        } else {
            showAlert(data.error || 'خطأ في تسجيل الدخول', 'error');
        }
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        showAlert('خطأ في الاتصال بالخادم', 'error');
    }
}

// تسجيل الخروج
async function handleLogout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        currentUser = null;
        isAuthenticated = false;
        showLoginScreen();
        showAlert('تم تسجيل الخروج بنجاح', 'success');
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
    }
}

// إظهار شاشة تسجيل الدخول
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainScreen').style.display = 'none';
}

// إظهار الشاشة الرئيسية
function showMainScreen() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainScreen').style.display = 'flex';
}

// تحديث معلومات المستخدم
function updateUserInfo() {
    const currentUserElement = document.getElementById('currentUser');
    if (currentUserElement && currentUser) {
        currentUserElement.textContent = currentUser.full_name;
    }
}

// تبديل القائمة الجانبية
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('open');
    mainContent.classList.toggle('sidebar-open');
}

// التنقل
function handleNavigation(e) {
    e.preventDefault();
    
    const section = e.currentTarget.getAttribute('data-section');
    
    // إزالة النشاط من جميع الروابط
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // إضافة النشاط للرابط المحدد
    e.currentTarget.classList.add('active');
    
    // إخفاء جميع الأقسام
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // إظهار القسم المحدد
    const targetSection = document.getElementById(section);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // تحميل بيانات القسم
        loadSectionData(section);
    }
    
    // إغلاق القائمة الجانبية على الأجهزة المحمولة
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

// تحميل بيانات القسم
async function loadSectionData(section) {
    switch (section) {
        case 'dashboard':
            await loadDashboardData();
            break;
        case 'cash':
            await loadCashTransactions();
            break;
        case 'checks':
            await loadChecks();
            break;
        case 'treasury':
            await loadTreasuries();
            break;
        case 'reports':
            await loadReports();
            break;
        case 'settings':
            await loadSettings();
            break;
    }
}

// تحميل بيانات لوحة التحكم
async function loadDashboardData() {
    try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        
        // تحديث البطاقات
        updateElement('totalCash', formatCurrency(data.total_cash));
        updateElement('dueChecks', data.due_checks);
        updateElement('todaySales', formatCurrency(data.today_sales));
        updateElement('todayExpenses', formatCurrency(data.today_expenses));
        
    } catch (error) {
        console.error('خطأ في تحميل بيانات لوحة التحكم:', error);
    }
}

// تحميل المعاملات النقدية
async function loadCashTransactions() {
    try {
        const response = await fetch('/api/cash/transactions');
        const data = await response.json();
        
        // تحديث جدول سندات القبض
        updateCashTable('receiptsTableBody', data.filter(t => t.type === 'receipt'));
        
        // تحديث جدول سندات الصرف
        updateCashTable('paymentsTableBody', data.filter(t => t.type === 'payment'));
        
    } catch (error) {
        console.error('خطأ في تحميل المعاملات النقدية:', error);
    }
}

// تحديث جدول المعاملات النقدية
function updateCashTable(tableId, transactions) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.transaction_number}</td>
            <td>${formatDate(transaction.transaction_date)}</td>
            <td>${transaction.description}</td>
            <td>${formatCurrency(transaction.amount)}</td>
            <td>${transaction.treasury_name || 'غير محدد'}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="editTransaction(${transaction.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline" onclick="deleteTransaction(${transaction.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// تحميل الشيكات
async function loadChecks() {
    try {
        const response = await fetch('/api/checks');
        const data = await response.json();
        
        // تحديث جدول شيكات القبض
        updateChecksTable('receivedChecksTableBody', data.filter(c => c.type === 'received'));
        
        // تحديث جدول شيكات الدفع
        updateChecksTable('issuedChecksTableBody', data.filter(c => c.type === 'issued'));
        
    } catch (error) {
        console.error('خطأ في تحميل الشيكات:', error);
    }
}

// تحديث جدول الشيكات
function updateChecksTable(tableId, checks) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    checks.forEach(check => {
        const statusClass = getStatusClass(check.status);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${check.check_number}</td>
            <td>${check.party_name || 'غير محدد'}</td>
            <td>${formatCurrency(check.amount)}</td>
            <td>${formatDate(check.due_date)}</td>
            <td><span class="status-badge ${statusClass}">${getStatusText(check.status)}</span></td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="editCheck(${check.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline" onclick="deleteCheck(${check.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// تحميل الخزائن
async function loadTreasuries() {
    try {
        const response = await fetch('/api/treasuries');
        const data = await response.json();
        
        // تحديث بطاقات الخزائن
        updateTreasuryCards(data);
        
    } catch (error) {
        console.error('خطأ في تحميل الخزائن:', error);
    }
}

// تحديث بطاقات الخزائن
function updateTreasuryCards(treasuries) {
    const treasuryGrid = document.querySelector('.treasury-grid');
    if (!treasuryGrid) return;
    
    treasuryGrid.innerHTML = '';
    
    treasuries.forEach(treasury => {
        const card = document.createElement('div');
        card.className = 'treasury-card';
        card.innerHTML = `
            <h3>${treasury.name}</h3>
            <div class="treasury-balance">
                <span class="balance-amount">${formatCurrency(treasury.current_balance)}</span>
                <span class="currency">${treasury.currency}</span>
            </div>
            <div class="treasury-actions">
                <button class="btn btn-sm btn-outline" onclick="viewTreasuryDetails(${treasury.id})">
                    عرض التفاصيل
                </button>
            </div>
        `;
        treasuryGrid.appendChild(card);
    });
}

// تحميل التقارير
async function loadReports() {
    // تعيين التاريخ الافتراضي (آخر 30 يوم)
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    
    document.getElementById('reportFromDate').value = formatDateForInput(fromDate);
    document.getElementById('reportToDate').value = formatDateForInput(toDate);
}

// تصفية التقارير
async function handleFilterReports() {
    const fromDate = document.getElementById('reportFromDate').value;
    const toDate = document.getElementById('reportToDate').value;
    const reportType = document.getElementById('reportType').value;
    
    if (!fromDate || !toDate) {
        showAlert('يرجى اختيار تاريخ البداية والنهاية', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/reports/daily?from_date=${fromDate}&to_date=${toDate}`);
        const data = await response.json();
        
        displayReportResults(data);
        
    } catch (error) {
        console.error('خطأ في تحميل التقارير:', error);
        showAlert('خطأ في تحميل التقارير', 'error');
    }
}

// عرض نتائج التقارير
function displayReportResults(data) {
    const resultsDiv = document.getElementById('reportsResults');
    if (!resultsDiv) return;
    
    let html = '<div class="report-summary">';
    
    // إحصائيات التقرير
    if (data.stats && data.stats.length > 0) {
        html += '<h3>ملخص التقرير</h3><div class="stats-grid">';
        
        data.stats.forEach(stat => {
            const typeText = stat.type === 'receipt' ? 'إجمالي القبض' : 'إجمالي الصرف';
            html += `
                <div class="stat-card">
                    <h4>${typeText}</h4>
                    <p>${formatCurrency(stat.total)} (${stat.count} معاملة)</p>
                </div>
            `;
        });
        
        html += '</div>';
    }
    
    // جدول المعاملات
    if (data.transactions && data.transactions.length > 0) {
        html += '<h3>تفاصيل المعاملات</h3>';
        html += '<div class="table-container"><table class="data-table">';
        html += `
            <thead>
                <tr>
                    <th>رقم المعاملة</th>
                    <th>التاريخ</th>
                    <th>النوع</th>
                    <th>المبلغ</th>
                    <th>الوصف</th>
                    <th>الخزينة</th>
                </tr>
            </thead>
            <tbody>
        `;
        
        data.transactions.forEach(transaction => {
            const typeText = transaction.type === 'receipt' ? 'قبض' : 'صرف';
            html += `
                <tr>
                    <td>${transaction.transaction_number}</td>
                    <td>${formatDate(transaction.transaction_date)}</td>
                    <td>${typeText}</td>
                    <td>${formatCurrency(transaction.amount)}</td>
                    <td>${transaction.description}</td>
                    <td>${transaction.treasury_name || 'غير محدد'}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
    } else {
        html += '<p>لا توجد معاملات في الفترة المحددة</p>';
    }
    
    html += '</div>';
    resultsDiv.innerHTML = html;
}

// تحميل الإعدادات
async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        // تحديث حقول الإعدادات
        updateElement('companyName', data.company_name || '');
        updateElement('baseCurrency', data.base_currency || 'SAR');
        
    } catch (error) {
        console.error('خطأ في تحميل الإعدادات:', error);
    }
}

// حفظ المعاملة النقدية
async function handleSaveCashTransaction() {
    const form = document.getElementById('cashForm');
    const formData = new FormData(form);
    
    const transactionData = {
        type: document.getElementById('transactionType').value,
        amount: parseFloat(document.getElementById('amount').value),
        description: document.getElementById('description').value,
        treasury_id: 1, // الخزينة الرئيسية
        transaction_date: document.getElementById('transactionDate').value
    };
    
    if (!transactionData.amount || !transactionData.description || !transactionData.transaction_date) {
        showAlert('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/cash/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('تم إضافة المعاملة بنجاح', 'success');
            closeModal();
            form.reset();
            await loadCashTransactions();
            await loadDashboardData();
        } else {
            showAlert(data.error || 'خطأ في إضافة المعاملة', 'error');
        }
        
    } catch (error) {
        console.error('خطأ في حفظ المعاملة:', error);
        showAlert('خطأ في الاتصال بالخادم', 'error');
    }
}

// حفظ الشيك
async function handleSaveCheck() {
    const form = document.getElementById('checkForm');
    
    const checkData = {
        check_number: document.getElementById('checkNumber').value,
        type: document.getElementById('checkType').value,
        amount: parseFloat(document.getElementById('checkAmount').value),
        bank_name: document.getElementById('bankName').value,
        party_id: 1, // افتراضياً
        issue_date: document.getElementById('issueDate').value,
        due_date: document.getElementById('dueDate').value
    };
    
    if (!checkData.check_number || !checkData.amount || !checkData.bank_name || 
        !checkData.issue_date || !checkData.due_date) {
        showAlert('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/checks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(checkData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('تم إضافة الشيك بنجاح', 'success');
            closeModal();
            form.reset();
            await loadChecks();
        } else {
            showAlert(data.error || 'خطأ في إضافة الشيك', 'error');
        }
        
    } catch (error) {
        console.error('خطأ في حفظ الشيك:', error);
        showAlert('خطأ في الاتصال بالخادم', 'error');
    }
}

// فتح النافذة المنبثقة
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

// إغلاق النافذة المنبثقة
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('show');
        modal.style.display = 'none';
    });
}

// تبديل التبويبات
function handleTabSwitch(e) {
    e.preventDefault();
    
    const tabId = e.currentTarget.getAttribute('data-tab');
    const parent = e.currentTarget.parentElement;
    
    // إزالة النشاط من جميع التبويبات
    parent.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // إضافة النشاط للتبويب المحدد
    e.currentTarget.classList.add('active');
    
    // إخفاء جميع المحتويات
    const tabContent = parent.nextElementSibling;
    if (tabContent) {
        tabContent.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        // إظهار المحتوى المحدد
        const targetPane = tabContent.querySelector(`#${tabId}`);
        if (targetPane) {
            targetPane.classList.add('active');
        }
    }
}

// دوال مساعدة
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 2
    }).format(amount || 0);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}

function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

function getStatusClass(status) {
    const statusClasses = {
        'pending': 'status-pending',
        'cleared': 'status-success',
        'bounced': 'status-danger',
        'cancelled': 'status-secondary'
    };
    return statusClasses[status] || 'status-secondary';
}

function getStatusText(status) {
    const statusTexts = {
        'pending': 'معلق',
        'cleared': 'مسدد',
        'bounced': 'مرتد',
        'cancelled': 'ملغي'
    };
    return statusTexts[status] || 'غير محدد';
}

function showAlert(message, type = 'info') {
    // إنشاء عنصر التنبيه
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // تحديد لون التنبيه
    const colors = {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#06b6d4'
    };
    alert.style.backgroundColor = colors[type] || colors.info;
    
    alert.textContent = message;
    
    // إضافة التنبيه للصفحة
    document.body.appendChild(alert);
    
    // إزالة التنبيه بعد 5 ثوان
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 5000);
}

// دوال للعمليات (سيتم تطويرها لاحقاً)
function editTransaction(id) {
    console.log('تعديل المعاملة:', id);
    // TODO: تطوير وظيفة التعديل
}

function deleteTransaction(id) {
    if (confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
        console.log('حذف المعاملة:', id);
        // TODO: تطوير وظيفة الحذف
    }
}

function editCheck(id) {
    console.log('تعديل الشيك:', id);
    // TODO: تطوير وظيفة التعديل
}

function deleteCheck(id) {
    if (confirm('هل أنت متأكد من حذف هذا الشيك؟')) {
        console.log('حذف الشيك:', id);
        // TODO: تطوير وظيفة الحذف
    }
}

function viewTreasuryDetails(id) {
    console.log('عرض تفاصيل الخزينة:', id);
    // TODO: تطوير وظيفة عرض التفاصيل
}