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

/**
 * The five shown on the home page. Sourced entirely from Firestore — seed the
 * starter set with `npm run seed:testimonials`, approve them in the console,
 * then `npm run sync:testimonials`.
 */
export function homeTestimonials(limit = 5): Testimonial[] {
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

// NOTE: Review structured data was intentionally removed. Testimonials hosted
// on the reviewed entity's own site are "self-serving" and never eligible for
// Google review rich results, and reviewing a Person is invalid (Person is not
// an allowed itemReviewed type — it triggers a Search Console error). The
// quotes still render on the page as ordinary content; they just carry no
// Review/AggregateRating schema. Do not reintroduce it against the #person node.
