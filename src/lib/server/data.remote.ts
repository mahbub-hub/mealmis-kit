import { query } from "$app/server";

type Post = {
    id: number;
    slug: string;
    title: string;
    content?: string;
    excerpt: string;
    category: string;
    author: string;
    publishedAt: string;
    readTime: string;
    cover: string;
}

const posts: Post[] = [
    {
    id: 1,
    slug: 'sveltekit-2-runes-remote-functions',
    title: 'Building a modern blog with SvelteKit 2, runes, and remote functions',
    excerpt:
      'Learn how to combine Svelte 5 runes with SvelteKit remote functions for a fast, typed, server-powered blog experience.',
    category: 'SvelteKit',
    author: 'Mahbubur Rahman',
    publishedAt: 'Apr 7, 2026',
    readTime: '6 min read',
    cover:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 2,
    slug: 'styling-svelte-with-shadcn-and-daisyui',
    title: 'Styling Svelte with shadcn-svelte and daisyUI',
    excerpt:
      'Blend composable primitives from shadcn-svelte with utility-first daisyUI sections to ship polished layouts quickly.',
    category: 'UI',
    author: 'Mahbubur Rahman',
    publishedAt: 'Apr 4, 2026',
    readTime: '4 min read',
    cover:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 3,
    slug: 'content-strategy-for-dev-blogs',
    title: 'Content strategy for developer blogs that actually gets read',
    excerpt:
      'A practical framework for writing technical posts that are useful, searchable, and worth bookmarking.',
    category: 'Content',
    author: 'Mahbubur Rahman',
    publishedAt: 'Apr 1, 2026',
    readTime: '7 min read',
    cover:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80'
  }
];

export const getPosts = query(async () => {
    return {
    featured: posts[0],
    latest: posts,
    categories: ['All', 'SvelteKit', 'UI', 'Content', 'Performance'],
    trending: [
      'SvelteKit remote functions in production',
      'Why runes make local state simpler',
      'Design systems with shadcn-svelte'
    ],
    newsletter: {
      title: 'Weekly Svelte Dispatch',
      description: 'Get one practical SvelteKit article every Friday.'
    }
  };
    
})
