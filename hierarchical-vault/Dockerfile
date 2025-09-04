# استخدام Node.js 18
FROM node:18-alpine

# تعيين مجلد العمل
WORKDIR /app

# نسخ package.json و package-lock.json
COPY package*.json ./

# تثبيت التبعيات
RUN npm ci --only=production

# نسخ الكود
COPY . .

# إنشاء مستخدم غير root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# تغيير ملكية الملفات
RUN chown -R nodejs:nodejs /app
USER nodejs

# فتح المنفذ
EXPOSE 10000

# تشغيل التطبيق
CMD ["npm", "start"]