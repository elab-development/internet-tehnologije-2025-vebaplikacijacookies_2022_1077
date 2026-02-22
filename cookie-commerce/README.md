# 🍪 Cookie Commerce

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

> E-commerce platforma sa naprednim *cookie management* sistemom.

---

## 📋 Sadržaj

- [Tehnologije](#-tehnologije)
- [Pokretanje projekta](#-pokretanje-projekta)
  - [Lokalno (bez Docker-a)](#lokalno-bez-docker-a)
  - [Sa Docker-om](#sa-docker-om)
- [Git Workflow](#-git-workflow)
- [API Dokumentacija](#-api-dokumentacija)
- [Testiranje](#-testiranje)
- [Deployment](#-deployment)
- [Test Kredencijali](#-test-kredencijali)

---

## 🛠 Tehnologije

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Baza Podataka:** PostgreSQL
- **Autentifikacija:** JWT (HttpOnly cookies)
- **DevOps:** Docker, GitHub Actions
- **Testing:** Jest, React Testing Library
- **Eksterni API-ji:**
  - Google Charts API (Vizualizacija podataka)
  - OpenWeatherMap API (Meteorološki podaci)

---

## 🚀 Pokretanje projekta

### Lokalno (bez Docker-a)

1. **Kloniraj repozitorijum**
   ```bash
   git clone [https://github.com/elab-development/internet-tehnologije-2025-vebaplikacijacookies_2022_1077.git](https://github.com/elab-development/internet-tehnologije-2025-vebaplikacijacookies_2022_1077.git)
   cd internet-tehnologije-2025-vebaplikacijacookies_2022_1077/cookie-commerce

   ## 📚 API Dokumentacija

Swagger UI dostupna na: **http://localhost:3000/api-docs**

### Swagger JSON

Raw OpenAPI spec: **http://localhost:3000/api/swagger**

### Testiranje API-ja

Možete koristiti:
- Swagger UI (browser)
- `test-all-apis.http` fajl (VS Code REST Client extension)
- Postman/Insomnia (importuj OpenAPI spec)