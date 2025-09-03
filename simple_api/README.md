تشغيل سريع (FastAPI + SQLite)

- تثبيت الاعتماديات:
  - python3 -m venv .venv && source .venv/bin/activate
  - pip install -r requirements.txt
- تشغيل الخادم:
  - uvicorn main:app --reload --port 8000
- اختبار:
  - GET http://localhost:8000/projects
  - POST http://localhost:8000/projects {"name":"مشروع تجريبي"}
- التوثيق: http://localhost:8000/docs