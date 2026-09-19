# FinSight - Personal Finance & Expense Analytics

FinSight is a production-ready, full-stack Personal Finance & Expense Analytics Web Application built with Java Spring Boot, React (Vite), PostgreSQL, and Google Gemini AI.

## 1. Folder Structure

```text
FinSight/
├── .env.example
├── .env
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/finsight/
│       │   ├── controller/      # REST API Controllers (Auth, Transactions, Analytics, AI)
│       │   ├── dto/             # Data Transfer Objects
│       │   ├── entity/          # JPA Entities (User, Transaction, Category)
│       │   ├── repository/      # Spring Data JPA Repositories
│       │   ├── security/        # JWT & Spring Security Config
│       │   └── service/         # Business Logic & Gemini API integration
│       └── main/resources/
│           └── application.yml  # Environment-variable driven configuration
└── frontend/
    ├── package.json
    ├── vite.config.js           # Vite + PWA configuration
    ├── tailwind.config.js       # Tailwind theme configuration
    └── src/
        ├── api/                 # Axios configuration and interceptors
        ├── context/             # AuthContext, ThemeContext
        ├── layouts/             # App Layout (Sidebar/Navbar)
        ├── pages/               # Login, Register, Dashboard, Transactions, Analytics, AiInsights
        └── index.css            # Base Tailwind and CSS variables
```

## 2. Required Dependencies

**Backend (Java 21, Spring Boot 3.2.x):**
- Spring Boot Web, Data JPA, Security, Validation
- PostgreSQL Driver
- io.jsonwebtoken (jjwt-api, jjwt-impl, jjwt-jackson)
- Lombok

**Frontend (React 18, Vite):**
- react-router-dom
- axios
- recharts
- lucide-react
- tailwindcss, postcss, autoprefixer
- vite-plugin-pwa

## 3. Database Schema

The database automatically configures using Hibernate `update`. Core tables generated:
- `users`: id, name, email, password_hash, created_at, updated_at
- `categories`: id, user_id, name, type, created_at
- `transactions`: id, user_id, type, amount, category_id, description, payment_method, transaction_date, notes, created_at, updated_at

## 4. Backend Configuration

All secrets are externalized in environment variables. The `application.yml` uses:
- `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- `JWT_SECRET`
- `GEMINI_API_KEY`

This allows seamless deployment to platforms like NeonDB.

## 5. Frontend Configuration

Vite is configured to proxy requests (if needed) or connect directly to the backend via `VITE_API_BASE_URL`. Tailwind is configured for both dark and light modes via CSS variables in `index.css`.

## 6. API Documentation

**Authentication:**
- `POST /api/auth/register`: Register user
- `POST /api/auth/login`: Authenticate and return JWT
- `PUT /api/auth/profile`: Update user name and/or password

**Transactions:**
- `GET /api/transactions`: List transactions
- `POST /api/transactions`: Create transaction
- `PUT /api/transactions/{id}`: Update transaction
- `DELETE /api/transactions/{id}`: Delete transaction

**Analytics & AI:**
- `GET /api/analytics`: Get income/expenses/savings and category breakdown
- `POST /api/ai/chat`: Send a prompt to Gemini with financial context

## 7. Setup & Run Instructions

**Database Setup:**
1. A `.env` file has been automatically created with your provided NeonDB connection string.
2. The Spring Boot backend will automatically connect to NeonDB and apply the schema using Hibernate.

**Backend Setup:**
1. `cd backend`
2. `mvn clean install`
3. Set environment variables (e.g. in IntelliJ or via export).
4. Run `mvn spring-boot:run`

**Frontend Setup:**
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## 8. Deployment Instructions

**Backend (e.g., Render / Railway):**
1. Connect GitHub repository.
2. Build command: `mvn clean package -DskipTests`
3. Start command: `java -jar target/backend-0.0.1-SNAPSHOT.jar`
4. Provide environment variables (NeonDB URL, JWT Secret, Gemini Key).

**Frontend (e.g., Vercel / Netlify):**
1. Connect GitHub repository (frontend folder).
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set `VITE_API_BASE_URL` to your production backend URL.

## 9. Security Considerations

- Passwords are never stored in plain text (BCrypt is used).
- JWTs are strictly validated on every authenticated request.
- The 15-day "Remember Me" generates a token with a longer expiration.
- CORS is configured to only allow origins you specify.
- Database credentials and API keys are never hardcoded.
- Users are isolated to their own financial data at the Service layer.

## 10. PWA Installation

Because `vite-plugin-pwa` is configured, once deployed with HTTPS (or on localhost), users can install the application as a standalone app.
An explicit "Install App" button is also present in the app header (next to the theme toggle) which triggers the browser's native installation prompt.

## 11. Profile Management

Users can click on their profile in the sidebar to open a modal that allows them to update their name and optionally change their password. This interacts directly with the `PUT /api/auth/profile` endpoint and updates the local JWT session state immediately.
