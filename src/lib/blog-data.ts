/**
 * Static blog data extracted from the original CodingClubWeb-main project.
 * Used by the seed script to populate the database so the blog page renders
 * with content identical to the original hardcoded version.
 */

export type RawBlogPost = {
  title: string
  slug: string
  excerpt: string
  content: string
  authorName: string
  authorAvatar: string
  authorBio: string
  publishedAt: string // ISO date
  readTime: string
  category: string // category name (must match a BlogCategory)
  tags: string[]
  featured: boolean
  image: string
}

const reactContent = `# Getting Started with React in 2024: A Complete Guide

React continues to be one of the most popular frontend frameworks, and 2024 brings exciting new features and best practices. In this comprehensive guide, we'll walk through everything you need to know to start building modern React applications.

## What is React?

React is a JavaScript library for building user interfaces, particularly web applications. Created by Facebook (now Meta), React has revolutionized how we think about building interactive UIs with its component-based architecture and virtual DOM.

## Setting Up Your Development Environment

Before we dive into React, let's set up a proper development environment:

### Prerequisites
- Node.js (version 18 or higher)
- A code editor (VS Code recommended)
- Basic knowledge of HTML, CSS, and JavaScript

### Creating Your First React App

The easiest way to start a new React project is using Create React App or Vite:

\`\`\`bash
# Using Create React App
npx create-react-app my-react-app
cd my-react-app
npm start

# Using Vite (recommended for better performance)
npm create vite@latest my-react-app -- --template react
cd my-react-app
npm install
npm run dev
\`\`\`

## Understanding React Components

Components are the building blocks of React applications. They're reusable pieces of UI that can manage their own state and lifecycle.

### Functional Components

Modern React primarily uses functional components with hooks:

\`\`\`jsx
import React, { useState } from 'react';

function Welcome({ name }) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

export default Welcome;
\`\`\`

## React Hooks

Hooks are functions that let you use state and other React features in functional components:

### useState Hook
Manages local component state:

\`\`\`jsx
const [state, setState] = useState(initialValue);
\`\`\`

### useEffect Hook
Handles side effects like API calls, subscriptions, or DOM manipulation:

\`\`\`jsx
useEffect(() => {
  // Effect logic here
  return () => {
    // Cleanup logic here
  };
}, [dependencies]);
\`\`\`

## Best Practices for 2024

1. **Use TypeScript**: Adds type safety and better developer experience
2. **Component Composition**: Prefer composition over inheritance
3. **Custom Hooks**: Extract reusable logic into custom hooks
4. **Performance Optimization**: Use React.memo, useMemo, and useCallback wisely
5. **Testing**: Write tests for your components using Jest and React Testing Library

## Conclusion

React remains an excellent choice for building modern web applications. With its strong ecosystem, active community, and continuous improvements, learning React in 2024 is a great investment in your development career.

Remember, the best way to learn React is by building projects. Start small, experiment with different concepts, and gradually work your way up to more complex applications.

Happy coding! 🚀
`

const genericContent = (title: string) => `# ${title}

This is a placeholder article body. The Coding Club blog system is fully CMS-driven — once you sign in as a Blog Author or Super Admin, you can create rich markdown articles from the dashboard. This article was seeded so the public blog listing renders identically to the original site.

## Introduction

The Coding Club of NIT Andhra Pradesh empowers students through technology, innovation, and collaborative learning. Our blog features tutorials, interview experiences, and project walkthroughs written by club members and alumni.

## Why Write for Us?

- Reach a wide audience of engineering students
- Build your writing portfolio
- Get feedback from peers and reviewers
- Share knowledge with the community

## How to Contribute

1. Sign in using your @student.nitandhra.ac.in email
2. A Super Admin grants you the BLOG_AUTHOR role
3. Visit /dashboard/member to manage your author profile
4. Visit /dashboard/admin > Blogs to create a new article
5. Write your content using markdown — code blocks, headings, lists all supported

## Conclusion

We look forward to reading your contributions. Together we can build a vibrant knowledge base for the entire NITAP community.
`

export const BLOG_DATA: RawBlogPost[] = [
  {
    title: "Getting Started with React in 2024: A Complete Guide",
    slug: "getting-started-with-react-2024",
    excerpt:
      "Learn the fundamentals of React and build your first modern web application with hooks, components, and best practices.",
    content: reactContent,
    authorName: "Arjun Sharma",
    authorAvatar: "/professional-male-student-president.png",
    authorBio: "Full-stack developer and React enthusiast",
    publishedAt: "2024-01-15",
    readTime: "8 min read",
    category: "Web Development",
    tags: ["React", "JavaScript", "Frontend", "Tutorial"],
    featured: true,
    image: "/web-development-workshop.png",
  },
  {
    title: "My Journey from Beginner to Google SDE: Interview Experience",
    slug: "google-sde-interview-experience",
    excerpt:
      "A detailed account of my preparation strategy, interview rounds, and tips for cracking big tech interviews.",
    content: genericContent("My Journey from Beginner to Google SDE: Interview Experience"),
    authorName: "Aditya Verma",
    authorAvatar: "/alumni-google-engineer.png",
    authorBio: "Software Engineer at Google, NITAP Alumni",
    publishedAt: "2024-01-10",
    readTime: "12 min read",
    category: "Interview Experience",
    tags: ["Interview", "Google", "Career", "DSA"],
    featured: true,
    image: "/alumni-google-engineer.png",
  },
  {
    title: "Building a Machine Learning Model for Sentiment Analysis",
    slug: "ml-sentiment-analysis-tutorial",
    excerpt: "Step-by-step guide to building and deploying a sentiment analysis model using Python and TensorFlow.",
    content: genericContent("Building a Machine Learning Model for Sentiment Analysis"),
    authorName: "Ananya Gupta",
    authorAvatar: "/professional-female-student-ai-ml.png",
    authorBio: "AI/ML Lead, passionate about deep learning",
    publishedAt: "2024-01-08",
    readTime: "15 min read",
    category: "Machine Learning",
    tags: ["Python", "TensorFlow", "NLP", "AI"],
    featured: false,
    image: "/ai-machine-learning-bootcamp.png",
  },
  {
    title: "Top 10 Data Structures Every Programmer Should Know",
    slug: "top-10-data-structures-programmers",
    excerpt: "Master these essential data structures to improve your problem-solving skills and ace coding interviews.",
    content: genericContent("Top 10 Data Structures Every Programmer Should Know"),
    authorName: "Karthik Rao",
    authorAvatar: "/professional-male-student-competitive-programming.png",
    authorBio: "Competitive Programming Lead, Algorithm Expert",
    publishedAt: "2024-01-05",
    readTime: "10 min read",
    category: "DSA Concepts",
    tags: ["DSA", "Algorithms", "Programming", "Interview"],
    featured: false,
    image: "/competitive-programming-contest.png",
  },
  {
    title: "Building a Full-Stack E-commerce App with Next.js",
    slug: "nextjs-ecommerce-app-tutorial",
    excerpt:
      "Create a complete e-commerce application with authentication, payments, and admin dashboard using modern web technologies.",
    content: genericContent("Building a Full-Stack E-commerce App with Next.js"),
    authorName: "Vikash Singh",
    authorAvatar: "/professional-male-student-web-development.png",
    authorBio: "Web Development Lead, Next.js enthusiast",
    publishedAt: "2024-01-03",
    readTime: "20 min read",
    category: "Project Walkthrough",
    tags: ["Next.js", "E-commerce", "Full-stack", "TypeScript"],
    featured: false,
    image: "/web-development-workshop.png",
  },
  {
    title: "Latest Trends in Mobile App Development 2024",
    slug: "mobile-app-development-trends-2024",
    excerpt:
      "Explore the cutting-edge technologies and frameworks shaping the future of mobile application development.",
    content: genericContent("Latest Trends in Mobile App Development 2024"),
    authorName: "Meera Joshi",
    authorAvatar: "/professional-female-student-mobile-development.png",
    authorBio: "Mobile Development Lead, Cross-platform expert",
    publishedAt: "2024-01-01",
    readTime: "7 min read",
    category: "Latest Tech",
    tags: ["Mobile", "React Native", "Flutter", "Trends"],
    featured: false,
    image: "/hackathon-coding-event.png",
  },
]
