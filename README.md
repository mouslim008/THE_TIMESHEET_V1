# 🕐 THE TIMESHEET V1

> Smart enterprise time tracking with multi-role approval workflows, project budgeting, and absence management.

![.NET](https://img.shields.io/badge/.NET-8.0-blue?style=flat-square)
![Angular](https://img.shields.io/badge/Angular-17-red?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## ✨ Features

- ⏱ **Weekly timesheets** — Log hours with start/end times, pauses, and automatic totals
- ✅ **Multi-level approval** — Employee → Manager → RH → Direction workflow
- 📁 **Project management** — Budget hours, task assignment, and progress tracking
- 🏖 **Absence management** — Leave requests with approval and duration calculation
- 👥 **5 roles** — Employee, Manager, RH, Direction, Admin
- 🏢 **Service/department** management with manager assignment

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core 8, Entity Framework Core, SQL Server, JWT |
| Frontend | Angular 17, TypeScript, RxJS |
| Auth | JWT Bearer Tokens |
| ORM | Entity Framework Core (Code First) |

---

## 🚀 Quick Start

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- SQL Server (LocalDB or full)
- Angular CLI: `npm install -g @angular/cli`

### 1. Clone
```bash
git clone https://github.com/mouslim008/THE_TIMESHEET_V1.git
cd THE_TIMESHEET_V1
```

### 2. Backend setup
```bash
cd 102back
# Edit appsettings.json → set your DB connection string
dotnet ef database update
dotnet run
# API runs on https://localhost:5001
```

### 3. Frontend setup
```bash
cd 102front
npm install
ng serve
# App runs on http://localhost:4200
```

---

## 📐 Architecture

The system is built around 10 core domain entities:

`Utilisateur` · `FeuilleDeTemps` · `LigneDeTemps` · `Projet` · `Tache` · `Affectation` · `Validation` · `Absence` · `Service` · `Role`

See `/docs/class-diagram.png` for the full UML class diagram.

---



## 📄 License

MIT — free to use, modify, and distribute.

---

## 📬 Contact

Open an issue or reach out at [github.com/mouslim008](https://github.com/mouslim008)
or add me via linkdin at www.linkedin.com/in/abdelmoughit-mouslim-495965235
