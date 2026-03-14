# CALIO Joyería

A modern jewelry e-commerce application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Landing page
- Product catalog with dynamic product listing
- Product detail pages
- Admin panel for managing products (CRUD operations)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Image Storage**: Cloudinary (free tier)
- **Hosting**: Vercel (free tier)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
calio/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── catalog/           # Product catalog page
│   ├── products/[id]/     # Product detail page
│   └── admin/             # Admin panel
├── components/            # React components
├── lib/                   # Utilities and types
│   ├── types.ts          # TypeScript types
│   ├── products.ts       # Product data functions
│   └── utils.ts          # Utility functions
├── data/                  # Static data
│   └── products.json     # Product data (edit this to update products)
└── public/               # Static assets
```

## Current Status

- ✅ Frontend structure with static JSON data
- ✅ Product catalog and detail pages
- ✅ Landing page
- ✅ Admin panel (visualization only)
- 📝 Products stored in `data/products.json`

## How to Update Products

Products are stored in `data/products.json`. To add, edit, or remove products:

1. Upload images to [Cloudinary](https://cloudinary.com) (free account)
2. Copy the image URLs from Cloudinary
3. Edit `data/products.json` and paste the URLs
4. Commit and push changes
5. Vercel will automatically redeploy
