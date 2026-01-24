# 💎 BudgetBud: The Financial Revolution

**BudgetBud** is a state-of-the-art personal finance tracker designed for those who demand both absolute precision and cutting-edge aesthetics. Built with a "Pure Claymorphism" design system, it transforms tedious bookkeeping into a tactile, high-end experience.

![Dashboard Preview](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000)

## ✨ Unique Features

### 🏛️ Pure Claymorphism UI
Forget flat designs. BudgetBud features a unique **Liquid Clay** aesthetic—solid 3D elements, deep shadows, and vibrant accents that make every interaction feel physical and premium.

### 🤖 Automation Engine v1.2
Stop tracking your life manually. Our built-in automation engine allows you to:
- Define **Recurring Templates** (Salary, Rent, Subscriptions).
- Auto-generate transactions based on frequency (**Daily, Weekly, Monthly, Yearly**).
- Intelligent synchronization every time you check your history.

### 🕰️ History Revolution
A high-tech filtering system with frosted glass inspiration (but zero blur, keep it sharp!) and tactile category selectors.

### 🎯 Smart Budgets
3D "Health Indicators" give you immediate visual feedback on your spending. Real-time alerts trigger when you're approaching your limits.

### 🇹🇳 Localized Experience
Fully compatible with **Tunisian Dinar (TND)** and localized in French by default.

## 🔌 Local Connectivity & Troubleshooting

If you experience issues fetching data on `localhost`:

1. **Manual Sync**: Use the new **"Synchroniser"** button in the sidebar (Desktop) to force a data refresh.
2. **ESM Support**: The local server now uses `--esm` for reliable module resolution. Always use `npm run dev:all`.
3. **Session Fallback**: On localhost, the app now automatically fetches data using a `local-dev-user` ID even if you aren't logged in yet.
4. **Neon Database**: Ensure your machine can reach the Neon cluster (port 5432 or pooler ports).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v4 (Custom Claymorphism layer)
- **Framework**: BudgetBud Revolution Engine
- **Database**: PostgreSQL (Neon.tech Serverless)
- **Auth**: Better Auth (Integrated Beta)
- **Icons**: Lucide React
- **Charts**: Recharts

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Neon.tech PostgreSQL instance

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zoubayerBS/budgetbud.git
   cd budgetbud
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` in the root:
   ```env
   DATABASE_URL=your_neon_postgres_url
   BETTER_AUTH_SECRET=your_secret
   ```

4. **Launch the Revolution**
   ```bash
   npm run dev:all
   ```

---

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️ and Precision by ZoubayerBS & BudgetBud Framework.*
