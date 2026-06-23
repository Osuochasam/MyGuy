MyGuy
The Friend Who Never Forgets.
A beautiful, personal AI memory companion that actually remembers — powered by decentralized storage.
Built for the 0G Zero Cup.

About MyGuy
MyGuy is an AI-native memory system designed to capture and organize your life in one elegant place. Unlike typical chatbots that forget everything after each conversation, MyGuy treats your memories, goals, reminders, milestones, and images as permanent, searchable assets.
It combines a premium, calm interface with real decentralized persistence using 0G Storage. The result is an application that feels like having a thoughtful, intelligent friend who truly remembers the details that matter.
Key Features

Memory Timeline — A beautiful chronological view of your life events, memories, goals, and milestones with smooth animations.
Memory Vault — Central searchable repository with powerful filtering, tagging, and categorization.
Smart Dashboard — Personalized greetings, today’s focus, memory insights, and recent entries.
Retrieval-First AI Chat — Ask natural questions about your life and get accurate, context-aware answers based only on what you’ve stored.
Reminders — Full management with smart grouping (Today, This Week, Upcoming, Overdue).
Image Memories — Upload photos, screenshots, and documents that become part of your permanent timeline and vault.
0G-Powered Persistence — All core memories and images are stored on 0G Storage.

Design Philosophy
We obsessed over every detail to create an experience that feels premium and calm — inspired by Linear, Notion, Arc, and Apple’s design standards. Dark mode first, generous whitespace, subtle animations, and intentional interactions.
Architecture
MyGuy uses a thoughtful hybrid approach:

Raw content & images → Stored permanently on 0G Storage (decentralized)
Metadata & fast indexing → Stored in Neon Postgres for powerful search and filtering
Frontend & API → Next.js 15 App Router with TypeScript
AI Layer → Vercel AI SDK with retrieval-augmented generation (RAG)

Tech Stack

Framework: Next.js 15 (App Router)
Language: TypeScript
Styling: Tailwind CSS
Animations: Framer Motion
Database: Neon Postgres + Prisma
AI: Vercel AI SDK
Decentralized Storage: 0G Storage
State: Zustand + TanStack Query
Forms: React Hook Form + Zod

Getting Started
Prerequisites

Node.js 20+
A funded 0G Galileo testnet wallet
Neon Postgres database (free tier is sufficient)

Installation
Bash# Clone the repository
git clone https://github.com/yourusername/myguy.git
cd myguy

# Install dependencies
npm install
Environment Setup
Copy the example environment file and fill in your credentials:
Bashcp .env.example .env.local
Key variables you'll need:

DATABASE_URL (your Neon connection string)
0G_PRIVATE_KEY
0G_RPC_URL
0G_INDEXER_URL
Your AI provider key (via Vercel AI SDK)

Running Locally
npm run dev
0G Integration
0G is core to the product. Every memory and image you save is uploaded to 0G Storage. The app maintains a responsive experience while handling decentralized uploads and retrievals.
Project Status
Phase 1 MVP — Focused, polished, and built as a strong foundation for future development. Designed to feel like a real product, not just a demo.
Built For
0G Zero Cup — Exploring the future of personal data ownership with decentralized storage.

Made with care.