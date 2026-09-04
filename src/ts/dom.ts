/** Queries a single descendant element, typed as T (defaults to Element). */
export function queryOne<T extends Element = Element>(selector: string, root: ParentNode = document): T | null {
    return root.querySelector<T>(selector);
}

/** Queries all matching descendant elements as a real array, typed as T. */
export function queryAll<T extends Element = Element>(selector: string, root: ParentNode = document): T[] {
    return Array.from(root.querySelectorAll<T>(selector));
}

/** The single <main> element every screen template is rendered into. */
export const app = queryOne<HTMLElement>('main');
