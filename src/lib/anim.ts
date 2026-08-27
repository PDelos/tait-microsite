import { browser } from '$app/environment';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (browser) gsap.registerPlugin(ScrollTrigger);

/* Animated elements start at opacity 0 in layout.css — [data-reveal] for the
 * element itself, [data-reveal-children] for a staggered list — so nothing
 * flashes between the server-rendered HTML and hydration. That means every tween
 * has to be a fromTo: a plain .from() would read the current opacity (0) as its
 * end value and animate 0 → 0. These are the two halves of a "fade and rise". */
export const HIDDEN = { opacity: 0, y: 24 };
export const SHOWN = { opacity: 1, y: 0 };

/* When a section's timeline fires. Sections are 100dvh, so "the section's bottom
 * edge reaches the bottom of the viewport" would be the moment it has finished
 * filling the screen — which is too late: the timeline is still playing as you
 * scroll on past it. The offset starts it early, once the section is about 65%
 * of the way in, leaving it room to finish. Raise it to animate earlier still,
 * lower it to hold off. This one value paces every section. */
const START = 'bottom bottom+=35%';

type Build = (tl: gsap.core.Timeline) => void;

/**
 * Wires up one section's reveal. Call it from an $effect and return the result so
 * the timeline and its ScrollTrigger are cleaned up on unmount:
 *
 *   $effect(() => reveal(section, (tl) => tl.fromTo('h1', HIDDEN, SHOWN)));
 *
 * Selector strings inside `build` are scoped to the section by gsap.context, so
 * they cannot reach into another component. Pass `immediate` for the hero, which
 * is already on screen when the page loads and so has nothing to scroll into.
 */
export function reveal(section: HTMLElement, build: Build, immediate = false) {
	// Respect the OS setting: show everything at once, animate nothing.
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		gsap.set(section.querySelectorAll('[data-reveal], [data-reveal-children] > *'), {
			opacity: 1
		});
		return;
	}

	const ctx = gsap.context(() => {
		build(
			gsap.timeline({
				defaults: { duration: 0.7, ease: 'power3.out' },
				delay: immediate ? 0.15 : 0,
				scrollTrigger: immediate ? undefined : { trigger: section, start: START, once: true }
			})
		);
	}, section);

	return () => ctx.revert();
}
