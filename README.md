# LocalGrid

A hyperlocal skill exchange platform connecting urban communities.

## 🌟 Features

- **User Authentication**: Secure sign-up/login with Google, GitHub, and email/password
- **Geo-Location Matching**: Discover skills within customizable radius
- **Skill Marketplace**: List and browse skills across multiple categories
- **Booking System**: Built-in calendar with scheduling and reminders
- **Reputation System**: Ratings, reviews, and skill endorsements
- **Community Projects**: Collaborative projects for local initiatives
- **Credit System**: Token-based incentive mechanism
- **Messaging**: Real-time communication between users
- **Accessibility**: WCAG compliant with dark mode support

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth v5 (Auth.js)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Language**: TypeScript

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd localgrid
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
- Database URL from Neon
- NextAuth secret (generate with: `openssl rand -base64 32`)
- OAuth credentials (Google & GitHub)
- Email server configuration (optional)

4. Set up the database:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 OAuth Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env`

## 📊 Database Schema

The platform includes comprehensive models for:
- Users and authentication
- Skills and skill requests
- Bookings and scheduling
- Reviews and ratings
- Badges and verification
- Community projects
- Messaging system
- Transactions and credits
- Notifications

## 🎨 UI/UX

Built with Shadcn UI components for:
- Clean, modern design
- Responsive layouts
- Dark mode support
- Accessible color contrasts
- Intuitive navigation
- Professional aesthetic

## 🔒 Security

- Password hashing with bcrypt
- HTTPS enforcement (production)
- CSRF protection
- Input validation with Zod
- SQL injection prevention (Prisma)
- XSS protection

## 📱 Responsive Design

Fully responsive across all devices:
- Mobile-first approach
- Tablet optimized
- Desktop enhanced
- Touch-friendly interfaces

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

The app will automatically deploy on every push to main branch.

### Environment Variables for Production

Make sure to update:
- `NEXTAUTH_URL` to your production domain
- `NEXT_PUBLIC_APP_URL` to your production domain
- All OAuth redirect URIs in provider settings

## 📚 Project Structure

```
localgrid/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   └── ...
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   └── ...
├── lib/                   # Utility functions
│   ├── auth.ts           # Auth helpers
│   ├── prisma.ts         # Prisma client
│   ├── utils.ts          # General utilities
│   └── validations.ts    # Zod schemas
├── prisma/               # Database schema
│   └── schema.prisma
├── config/               # Configuration files
│   └── site.ts
├── types/                # TypeScript types
└── public/               # Static assets
```

## 🛠️ Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Database commands
npm run db:push        # Push schema to database
npm run db:studio      # Open Prisma Studio
npm run db:migrate     # Create migration
npm run db:seed        # Seed database
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth](https://next-auth.js.org/)
- [Neon](https://neon.tech/)

## 📞 Support

For support, email support@localgrid.com or open an issue on GitHub.

---

Built with ❤️ for local communities
