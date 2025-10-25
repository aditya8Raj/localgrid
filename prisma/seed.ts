import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create test users
  const passwordHash = await bcrypt.hash('password123', 10)

  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      name: 'John Smith',
      passwordHash,
      bio: 'Professional guitar instructor with 10 years of experience',
      locationLat: 28.6139, // Delhi
      locationLng: 77.2090,
      locationCity: 'New Delhi, India',
      credits: 100,
      role: 'USER',
    },
  })
  console.log('✓ Created user: John Smith')

  const user2 = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      email: 'sarah@example.com',
      name: 'Sarah Johnson',
      passwordHash,
      bio: 'Yoga instructor and wellness coach',
      locationLat: 28.6200, // Delhi (nearby)
      locationLng: 77.2100,
      locationCity: 'New Delhi, India',
      credits: 150,
      role: 'USER',
    },
  })
  console.log('✓ Created user: Sarah Johnson')

  const user3 = await prisma.user.upsert({
    where: { email: 'raj@example.com' },
    update: {},
    create: {
      email: 'raj@example.com',
      name: 'Raj Patel',
      passwordHash,
      bio: 'Full-stack developer and coding mentor',
      locationLat: 28.6000, // Delhi (nearby)
      locationLng: 77.2000,
      locationCity: 'South Delhi, India',
      credits: 200,
      role: 'USER',
    },
  })
  console.log('✓ Created user: Raj Patel')

  const user4 = await prisma.user.upsert({
    where: { email: 'priya@example.com' },
    update: {},
    create: {
      email: 'priya@example.com',
      name: 'Priya Sharma',
      passwordHash,
      bio: 'Professional photographer and photo editing expert',
      locationLat: 28.6300, // Delhi (nearby)
      locationLng: 77.2200,
      locationCity: 'North Delhi, India',
      credits: 120,
      role: 'USER',
    },
  })
  console.log('✓ Created user: Priya Sharma')

  // Create test listings
  const listing1 = await prisma.listing.create({
    data: {
      title: 'Guitar Lessons for Beginners',
      description: 'Learn to play guitar from scratch! I teach acoustic and electric guitar with a focus on your favorite songs. Perfect for complete beginners.',
      skillTags: ['guitar', 'music', 'acoustic', 'lessons'],
      ownerId: user1.id,
      lat: 28.6139,
      lng: 77.2090,
      priceCents: 50000, // ₹500
      durationMins: 60,
      isActive: true,
    },
  })
  console.log('✓ Created listing: Guitar Lessons')

  const listing2 = await prisma.listing.create({
    data: {
      title: 'Yoga Classes - Hatha & Vinyasa',
      description: 'Join my yoga sessions for mind-body wellness. Suitable for all levels. Learn proper breathing techniques and postures.',
      skillTags: ['yoga', 'fitness', 'wellness', 'meditation'],
      ownerId: user2.id,
      lat: 28.6200,
      lng: 77.2100,
      priceCents: 30000, // ₹300
      durationMins: 90,
      isActive: true,
    },
  })
  console.log('✓ Created listing: Yoga Classes')

  const listing3 = await prisma.listing.create({
    data: {
      title: 'Learn React & Next.js - Web Development',
      description: 'Master modern web development with React and Next.js. Build real-world projects and deploy to production. Includes hands-on coding.',
      skillTags: ['coding', 'react', 'nextjs', 'javascript', 'web development'],
      ownerId: user3.id,
      lat: 28.6000,
      lng: 77.2000,
      priceCents: 100000, // ₹1000
      durationMins: 120,
      isActive: true,
    },
  })
  console.log('✓ Created listing: Web Development')

  const listing4 = await prisma.listing.create({
    data: {
      title: 'Photography Basics & Photo Editing',
      description: 'Learn photography fundamentals, composition, lighting, and post-processing with Adobe Lightroom and Photoshop.',
      skillTags: ['photography', 'photo editing', 'lightroom', 'photoshop'],
      ownerId: user4.id,
      lat: 28.6300,
      lng: 77.2200,
      priceCents: 75000, // ₹750
      durationMins: 90,
      isActive: true,
    },
  })
  console.log('✓ Created listing: Photography')

  const listing5 = await prisma.listing.create({
    data: {
      title: 'Spanish Language Tutoring',
      description: 'Native Spanish speaker offering conversational lessons. Learn grammar, vocabulary, and cultural insights.',
      skillTags: ['spanish', 'language', 'tutoring', 'conversation'],
      ownerId: user1.id,
      lat: 28.6150,
      lng: 77.2080,
      priceCents: 40000, // ₹400
      durationMins: 60,
      isActive: true,
    },
  })
  console.log('✓ Created listing: Spanish Tutoring')

  const listing6 = await prisma.listing.create({
    data: {
      title: 'Cooking Indian Cuisine',
      description: 'Learn to cook authentic Indian dishes! From curries to biryanis, master the spices and techniques of Indian cooking.',
      skillTags: ['cooking', 'indian food', 'recipes', 'cuisine'],
      ownerId: user2.id,
      lat: 28.6180,
      lng: 77.2120,
      priceCents: 35000, // ₹350
      durationMins: 120,
      isActive: true,
    },
  })
  console.log('✓ Created listing: Cooking Classes')

  // Create a community project
  const project1 = await prisma.communityProject.create({
    data: {
      title: 'Local Skill Sharing Community',
      description: 'Join our community to share skills and learn together. Open to all skill levels and interests!',
      ownerId: user3.id,
      status: 'ACTIVE',
      members: {
        create: [
          { userId: user1.id, role: 'MEMBER' },
          { userId: user2.id, role: 'MEMBER' },
          { userId: user3.id, role: 'MANAGER' },
        ],
      },
    },
  })
  console.log('✓ Created project: Local Skill Sharing Community')

  // Create some sample reviews
  const review1 = await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Excellent guitar teacher! Very patient and explains concepts clearly.',
      reviewerId: user2.id,
      subjectId: user1.id,
      listingId: listing1.id,
    },
  })
  console.log('✓ Created review for Guitar Lessons')

  const review2 = await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Amazing yoga instructor! Feel so much better after each session.',
      reviewerId: user1.id,
      subjectId: user2.id,
      listingId: listing2.id,
    },
  })
  console.log('✓ Created review for Yoga Classes')

  const review3 = await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Best coding mentor! Helped me land my first web dev job.',
      reviewerId: user4.id,
      subjectId: user3.id,
      listingId: listing3.id,
    },
  })
  console.log('✓ Created review for Web Development')

  // Create some credit transactions
  await prisma.creditTransaction.create({
    data: {
      userId: user1.id,
      amount: 100,
      reason: 'Initial sign-up bonus',
    },
  })

  await prisma.creditTransaction.create({
    data: {
      userId: user2.id,
      amount: 150,
      reason: 'Initial sign-up bonus',
    },
  })

  console.log('✓ Created credit transactions')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
