import data from '../data/testimonials.json';

export interface Testimonial {
  id: string;
  message: string;
  name: string;
  company: string;
  role: string;
  article: string;
  featured: boolean;
  createdAt: string;
}

export interface TestimonialIndex {
  syncedAt: string | null;
  count: number;
  featuredCount: number;
  testimonials: Testimonial[];
}

export const testimonialIndex = data as TestimonialIndex;

/** Approved testimonials, featured first (the sync guarantees that order). */
export function allTestimonials(): Testimonial[] {
  return testimonialIndex.testimonials;
}

export function featuredTestimonials(limit = 10): Testimonial[] {
  return allTestimonials().slice(0, limit);
}

/** "Role, Company" — whichever parts were supplied. */
export function attribution(t: Testimonial): string {
  return [t.role, t.company].filter(Boolean).join(', ');
}

/** An article reference may be a URL or a plain title. */
export function articleLink(t: Testimonial): string | null {
  return /^https?:\/\//.test(t.article) ? t.article : null;
}

/** schema.org Review nodes, so quotes can surface as rich results. */
export function reviewSchema(items: Testimonial[], personId: string) {
  return items.map((t) => ({
    '@type': 'Review',
    reviewBody: t.message,
    datePublished: t.createdAt?.slice(0, 10),
    author: {
      '@type': 'Person',
      name: t.name,
      ...(t.company && { worksFor: { '@type': 'Organization', name: t.company } }),
      ...(t.role && { jobTitle: t.role }),
    },
    itemReviewed: { '@id': personId },
  }));
}
