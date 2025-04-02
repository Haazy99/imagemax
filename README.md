# ImageMax

A powerful AI-powered image editing application.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The project follows a standard Next.js 13+ structure with the app directory:

```
├── app/
│   ├── api/
│   ├── (auth)/
│   └── page.tsx
├── components/
├── lib/
└── public/
    └── images/
```

## Adding Example Images

To complete the hero section's before/after comparison effect, you need to add two images to the `public/images` directory:

1. `original-image.jpg` - An example image before AI processing
2. `processed-image.jpg` - The same image after AI processing

Recommended image specifications:
- Resolution: 1920x1440px (4:3 aspect ratio)
- Format: JPG
- File size: Optimize for web (< 500KB each)

Example images should demonstrate the capabilities of ImageMax, such as:
- Background removal
- Image upscaling
- Object removal
- Color enhancement

You can use any royalty-free image for demonstration purposes, ensuring you have the proper rights to use it.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
