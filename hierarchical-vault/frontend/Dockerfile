# مرحلة البناء
FROM node:18-alpine as build

# تعيين مجلد العمل
WORKDIR /app

# نسخ package.json و package-lock.json
COPY package*.json ./

# تثبيت التبعيات
RUN npm ci

# نسخ الكود
COPY . .

# بناء التطبيق
RUN npm run build

# مرحلة الإنتاج
FROM nginx:alpine

# نسخ الملفات المبنية
COPY --from=build /app/dist /usr/share/nginx/html

# نسخ إعدادات nginx
COPY nginx.conf /etc/nginx/nginx.conf

# فتح المنفذ
EXPOSE 80

# تشغيل nginx
CMD ["nginx", "-g", "daemon off;"]