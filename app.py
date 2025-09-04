import os
from datetime import datetime, timedelta
from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy

# Get the absolute path of the directory where this file is located
basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
# Configure the SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'treasury.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


# --- Database Models ---

class Treasury(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    # Self-referencing relationship for main/sub treasuries
    parent_id = db.Column(db.Integer, db.ForeignKey('treasury.id'), nullable=True)
    children = db.relationship('Treasury', backref=db.backref('parent', remote_side=[id]), lazy=True)
    transactions = db.relationship('Transaction', backref='treasury', lazy=True)

    def __repr__(self):
        return f'<Treasury {self.name}>'

class Party(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    # Type can be 'Client' or 'Supplier'
    type = db.Column(db.String(50), nullable=False)
    transactions = db.relationship('Transaction', backref='party', lazy=True)

    def __repr__(self):
        return f'<Party {self.name}>'

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    # Type can be 'Revenue' or 'Expense'
    type = db.Column(db.String(50), nullable=False)
    transactions = db.relationship('Transaction', backref='category', lazy=True)

    def __repr__(self):
        return f'<Category {self.name}>'

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    description = db.Column(db.String(255), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    # Type can be 'Receipt' or 'Payment'
    type = db.Column(db.String(50), nullable=False)

    treasury_id = db.Column(db.Integer, db.ForeignKey('treasury.id'), nullable=False)
    party_id = db.Column(db.Integer, db.ForeignKey('party.id'), nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)

    def __repr__(self):
        return f'<Transaction {self.id}>'

# --- Routes ---

@app.route('/')
def index():
    # Main entry point of the app, redirects to the dashboard
    return redirect(url_for('dashboard'))

@app.route('/dashboard')
def dashboard():
    # A simple dashboard showing the last 10 transactions
    recent_transactions = Transaction.query.order_by(Transaction.date.desc()).limit(10).all()
    return render_template('dashboard.html', transactions=recent_transactions)


# --- Transaction Routes ---

@app.route('/transactions/add', methods=['GET', 'POST'])
def add_transaction():
    # The type ('Receipt' or 'Payment') is passed as a URL parameter
    transaction_type = request.args.get('type', 'Payment') # Default to Payment

    if request.method == 'POST':
        date_str = request.form.get('date')
        description = request.form.get('description')
        amount = request.form.get('amount')
        treasury_id = request.form.get('treasury_id')
        category_id = request.form.get('category_id')
        party_id = request.form.get('party_id')

        # Basic validation
        if date_str and amount and treasury_id and category_id:
            date = datetime.strptime(date_str, '%Y-%m-%d')
            amount = float(amount)

            new_transaction = Transaction(
                date=date,
                description=description,
                amount=amount,
                type=transaction_type,
                treasury_id=int(treasury_id),
                category_id=int(category_id),
                party_id=int(party_id) if party_id else None
            )
            db.session.add(new_transaction)
            db.session.commit()
            return redirect(url_for('dashboard'))

    # --- Prepare data for the form ---
    treasuries = Treasury.query.all()
    parties = Party.query.all()

    if transaction_type == 'Receipt':
        categories = Category.query.filter_by(type='Revenue').all()
        title = "إضافة سند قبض"
    else: # Payment
        categories = Category.query.filter_by(type='Expense').all()
        title = "إضافة سند صرف"

    return render_template(
        'transaction_form.html',
        title=title,
        transaction_type=transaction_type,
        treasuries=treasuries,
        categories=categories,
        parties=parties
    )


# --- Category Routes ---

@app.route('/categories')
def list_categories():
    categories = Category.query.all()
    # This will render a template we will create next
    return render_template('categories.html', categories=categories)

@app.route('/categories/add', methods=['GET', 'POST'])
def add_category():
    if request.method == 'POST':
        name = request.form.get('name')
        type = request.form.get('type')
        if name and type:
            new_category = Category(name=name, type=type)
            db.session.add(new_category)
            db.session.commit()
            return redirect(url_for('list_categories'))
    # This will render a form template we will create next
    return render_template('category_form.html', title='Add Category', action_url=url_for('add_category'))

@app.route('/categories/edit/<int:id>', methods=['GET', 'POST'])
def edit_category(id):
    category = Category.query.get_or_404(id)
    if request.method == 'POST':
        category.name = request.form.get('name')
        category.type = request.form.get('type')
        db.session.commit()
        return redirect(url_for('list_categories'))
    return render_template('category_form.html', title='Edit Category', category=category, action_url=url_for('edit_category', id=id))

@app.route('/categories/delete/<int:id>', methods=['POST'])
def delete_category(id):
    category = Category.query.get_or_404(id)
    db.session.delete(category)
    db.session.commit()
    return redirect(url_for('list_categories'))

# --- Party Routes ---

@app.route('/parties')
def list_parties():
    parties = Party.query.all()
    return render_template('parties.html', parties=parties)

@app.route('/parties/add', methods=['GET', 'POST'])
def add_party():
    if request.method == 'POST':
        name = request.form.get('name')
        type = request.form.get('type')
        if name and type:
            new_party = Party(name=name, type=type)
            db.session.add(new_party)
            db.session.commit()
            return redirect(url_for('list_parties'))
    return render_template('party_form.html', title='إضافة طرف جديد', action_url=url_for('add_party'))

@app.route('/parties/edit/<int:id>', methods=['GET', 'POST'])
def edit_party(id):
    party = Party.query.get_or_404(id)
    if request.method == 'POST':
        party.name = request.form.get('name')
        party.type = request.form.get('type')
        db.session.commit()
        return redirect(url_for('list_parties'))
    return render_template('party_form.html', title='تعديل طرف', party=party, action_url=url_for('edit_party', id=id))

@app.route('/parties/delete/<int:id>', methods=['POST'])
def delete_party(id):
    party = Party.query.get_or_404(id)
    db.session.delete(party)
    db.session.commit()
    return redirect(url_for('list_parties'))


# --- Treasury Routes ---

@app.route('/treasuries')
def list_treasuries():
    # Fetch main treasuries (those without a parent)
    main_treasuries = Treasury.query.filter_by(parent_id=None).all()
    return render_template('treasuries.html', main_treasuries=main_treasuries)

@app.route('/treasuries/add', methods=['GET', 'POST'])
def add_treasury():
    if request.method == 'POST':
        name = request.form.get('name')
        parent_id = request.form.get('parent_id')
        if name:
            # If parent_id is an empty string from the form, convert it to None
            parent_id = int(parent_id) if parent_id else None
            new_treasury = Treasury(name=name, parent_id=parent_id)
            db.session.add(new_treasury)
            db.session.commit()
            return redirect(url_for('list_treasuries'))
    # Pass main treasuries to the form for the parent dropdown
    main_treasuries = Treasury.query.filter_by(parent_id=None).all()
    return render_template('treasury_form.html', title='إضافة خزينة', action_url=url_for('add_treasury'), main_treasuries=main_treasuries)

@app.route('/treasuries/edit/<int:id>', methods=['GET', 'POST'])
def edit_treasury(id):
    treasury = Treasury.query.get_or_404(id)
    if request.method == 'POST':
        treasury.name = request.form.get('name')
        parent_id = request.form.get('parent_id')
        treasury.parent_id = int(parent_id) if parent_id else None
        db.session.commit()
        return redirect(url_for('list_treasuries'))
    main_treasuries = Treasury.query.filter_by(parent_id=None).all()
    return render_template('treasury_form.html', title='تعديل خزينة', treasury=treasury, action_url=url_for('edit_treasury', id=id), main_treasuries=main_treasuries)

@app.route('/treasuries/delete/<int:id>', methods=['POST'])
def delete_treasury(id):
    treasury = Treasury.query.get_or_404(id)
    # A simple check to prevent deleting a treasury that has sub-treasuries
    if treasury.children:
        # A proper implementation would flash a message to the user
        return "Error: لا يمكن حذف خزينة رئيسية تحتوي على خزن فرعية.", 400
    db.session.delete(treasury)
    db.session.commit()
    return redirect(url_for('list_treasuries'))


# --- Reporting Routes ---

@app.route('/reports/treasury/<int:id>')
def treasury_statement(id):
    treasury = Treasury.query.get_or_404(id)
    # Get all transactions for the treasury and its children
    treasury_ids = [treasury.id] + [child.id for child in treasury.children]
    transactions = Transaction.query.filter(Transaction.treasury_id.in_(treasury_ids)).order_by(Transaction.date.asc()).all()

    balance = 0
    for t in transactions:
        if t.type == 'Receipt':
            balance += t.amount
        else: # Payment
            balance -= t.amount

    return render_template('treasury_statement.html', treasury=treasury, transactions=transactions, balance=balance)


@app.route('/reports/income-expense')
def income_expense_report():
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    # Base queries
    income_query = db.session.query(db.func.sum(Transaction.amount)).filter(Transaction.type == 'Receipt')
    expense_query = db.session.query(db.func.sum(Transaction.amount)).filter(Transaction.type == 'Payment')

    # Apply date filters if they exist
    if start_date_str:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        income_query = income_query.filter(Transaction.date >= start_date)
        expense_query = expense_query.filter(Transaction.date >= start_date)

    if end_date_str:
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        income_query = income_query.filter(Transaction.date <= end_date)
        expense_query = expense_query.filter(Transaction.date <= end_date)

    # Execute queries to get totals
    total_income = income_query.scalar() or 0
    total_expense = expense_query.scalar() or 0
    net_total = total_income - total_expense

    return render_template(
        'income_expense_report.html',
        total_income=total_income,
        total_expense=total_expense,
        net_total=net_total,
        start_date=start_date_str,
        end_date=end_date_str
    )


if __name__ == '__main__':
    # We will create the database tables before running the app
    with app.app_context():
        db.create_all()
    app.run(debug=True)
