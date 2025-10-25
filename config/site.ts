export const siteConfig = {
  name: "LocalGrid",
  description: "Hyperlocal skill exchange platform connecting urban communities",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og-image.png",
  links: {
    twitter: "https://twitter.com/localgrid",
    github: "https://github.com/localgrid",
  },
}

export const skillCategories = [
  {
    value: "TECHNOLOGY",
    label: "Technology & Digital",
    description: "Web dev, app development, IT support, graphic design",
    icon: "💻",
  },
  {
    value: "ARTS_CRAFTS",
    label: "Arts & Crafts",
    description: "Painting, pottery, woodworking, jewelry making",
    icon: "🎨",
  },
  {
    value: "EDUCATION",
    label: "Education & Tutoring",
    description: "Math, science, test prep, academic tutoring",
    icon: "📚",
  },
  {
    value: "FITNESS_WELLNESS",
    label: "Fitness & Wellness",
    description: "Personal training, yoga, meditation, nutrition",
    icon: "🏃",
  },
  {
    value: "LANGUAGE",
    label: "Languages",
    description: "Language learning, translation, conversation practice",
    icon: "🗣️",
  },
  {
    value: "BUSINESS",
    label: "Business & Finance",
    description: "Consulting, accounting, marketing, legal advice",
    icon: "💼",
  },
  {
    value: "HOME_GARDEN",
    label: "Home & Garden",
    description: "Home repair, gardening, interior design, organization",
    icon: "🏡",
  },
  {
    value: "MUSIC",
    label: "Music",
    description: "Instrument lessons, music theory, vocal training",
    icon: "🎵",
  },
  {
    value: "COOKING",
    label: "Cooking & Culinary",
    description: "Cooking classes, baking, meal prep, nutrition",
    icon: "🍳",
  },
  {
    value: "OTHER",
    label: "Other",
    description: "Other skills and services",
    icon: "✨",
  },
]

export const skillLevels = [
  { value: "BEGINNER", label: "Beginner", description: "Just starting out" },
  { value: "INTERMEDIATE", label: "Intermediate", description: "Some experience" },
  { value: "ADVANCED", label: "Advanced", description: "Highly experienced" },
  { value: "EXPERT", label: "Expert", description: "Professional level" },
]

export const defaultSearchRadius = 10 // kilometers

export const creditRewards = {
  SIGNUP: 100,
  COMPLETE_PROFILE: 50,
  FIRST_SKILL: 25,
  COMPLETE_BOOKING: 10,
  RECEIVE_REVIEW: 5,
  JOIN_PROJECT: 15,
}

export const featureFlags = {
  enableCredits: process.env.NEXT_PUBLIC_ENABLE_CREDITS === "true",
  enableProjects: process.env.NEXT_PUBLIC_ENABLE_PROJECTS === "true",
  enableMessaging: true,
  enableNotifications: true,
  enableBadges: true,
}
