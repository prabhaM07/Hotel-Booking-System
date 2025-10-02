# 🏨 Hotel Booking System

A feature-based Hotel Booking System built with **HTML, JavaScript, and Tailwind CSS**, designed for both **Admin** and **User** roles.  

This project uses a **Mock API** as a lightweight backend for simulating database operations.  

📂 GitHub Repo: [Hotel-Booking-System](https://github.com/prabhaM07/Hotel-Booking-System/tree/main/src)

---

## 🚀 Features  

### 👩‍💼 Admin:  
- 📊 **Dashboard** – View overall system statistics  
- 📑 **Booking Management** – Manage hotel room bookings and refunds  
- 🏨 **Rooms Management** – Add, update, or remove rooms  
- 🛠 **Content Management** – Manage site content  
- 📋 **Feature & Facilities Management** – Add/modify hotel facilities  
- ⭐ **Ratings & Reviews** – View customer reviews and feedback  
- 📝 **Query Management** – Handle customer queries  
- 📂 **Report Management** – Generate and view reports  
- 🔄 **Backup & Recovery** – Data recovery support  

### 👨‍💻 User:  
- 🔑 **Authentication** – Secure login and registration  
- 🏨 **View Rooms** – Browse available rooms with details  
- 📝 **Booking Form** – Submit room reservations  
- 📅 **My Bookings** – Track and manage personal bookings  
- 🛎 **Facilities** – View available hotel facilities  
- 📝 **Profile Management** – Manage personal details  
- 📤 **Contact Query** – Submit queries for admin support  

---

## 📂 Project Structure  

Hotel-Booking-System/
├── admin/
│ └── features/ # Admin-specific features
│ ├── backup-recovery/ # Backup & recovery
│ ├── booking/ # Booking records, refunds
│ ├── content-management/ # Content management
│ ├── dashboard/ # Admin dashboard
│ ├── feature-facilities/ # Facilities management
│ ├── ratings-reviews/ # Ratings & reviews
│ └── rooms/ # Room management
│
├── user/
│ └── features/ # User-specific features
│ ├── aboutUs/ # About us page
│ ├── contact/ # Contact queries
│ ├── facilities/ # Hotel facilities
│ ├── myBookings/ # User bookings
│ ├── profile/ # User profile
│ ├── reservation/ # Room reservation
│ └── rooms/ # Room listing
│
├── user-queries/ # Queries section
├── assets/ # Shared assets (icons, images, css)
├── auth.js # Authentication logic
├── app.js # Root JavaScript
├── index.html # Main entry page
└── mock-api/ # Mock API JSON files or setup


---

🏗️ Architecture

Feature-based structure – Each module (Admin/User) is self-contained

Mock API – Simulates backend data for development

Tailwind CSS – For fast, responsive, and modern UI styling

HTML + JS Modules – Keeps business logic separate for each feature
