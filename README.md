# 🏪 Store Management & Billing System

A Full-Stack store management and billing system designed to replicate the operations of real-world grocery stores and marts. It features secure authentication, 
user role control, real-time billing, inventory management, sales tracking, and powerful admin-side analytics — all wrapped in a clean, user-friendly interface.


## 🚀 Features Overview

### 🔐 Authentication & Roles
- Secure login system using Laravel Sanctum
- Role-based dashboards (Admin & Cashier)

### 🧑‍💼 Admin Panel
- Create and manage users (Admins/Cashiers)
- Add, edit, and delete products
- View all sales
- Access detailed analytics and activity logs

### 🧾 Cashier Panel
- Search products (by name/barcode)
- Add items to cart, apply discounts, and create bills
- Add optional customer
- Print invoice after sale

### 📊 Analytics
- Top performing products
- Top performing cashiers
- Highest sales
- Store performance summary (total revenue, bills, avg sale)
- Full activity logs (logged in/out, created, updated, deleted)


## 📸 Project Walkthrough (PDF)

> 📄 [Click here to view the full project walkthrough (PDF)](https://github.com/ReshalMaryson/Store-Management-System/blob/main/Features%20WalkThrough.pdf)

This document includes screenshots and explanations of every major feature in the system.

## 🛠️ Tech Stack

| Layer       | Tech Used               |
|-------------|--------------------------|
| **Frontend**  | React.js, fetch, html CSS |
| **Backend**   | Laravel 12 (REST API)         |
| **Database**  | MySQL (with migrations & seeders) |
| **Auth**      | Laravel Sanctum           |
| **Charts**    | Chart.js                 |

---

## ⚙️ How to Run Locally

### 1️⃣ Backend (Laravel)
git clone https://github.com/yourname/store-backend.git
cd store-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve

### 1️⃣ Frontend (React.js)
cd store-frontend
npm install
npm run dev
