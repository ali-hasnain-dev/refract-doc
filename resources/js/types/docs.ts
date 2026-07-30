export type DocsNavItem = {
    slug: string;
    file: string;
    title: string;
};

export type DocsNavGroup = {
    label: string;
    items: DocsNavItem[];
};

export type DocsTocItem = {
    id: string;
    text: string;
    level: number;
};

export type DocsNeighbour = {
    slug: string;
    title: string;
};

export type DocsSite = {
    name: string;
    tagline: string;
    github: string;
};
