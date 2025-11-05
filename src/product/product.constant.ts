export class ProductCache {
    static productSlug(slug: string, version: number = 1) {
        return `p:s:${slug}:v:${version}`
    }

    static productPublic(limit: number, page: number, query: string, sort: string, order: string, version: number = 1) {
        return `p:pub:${query}-${page}-${limit}-${order}-${sort}:v${version}`
    }

    static productAll(limit: number, page: number, query: string, sort: string, order: string, version: number = 1) {
        return `p:all:${query}-${page}-${limit}-${order}-${sort}:v${version}`
    }

    static productId(id: string, version: number = 1) {
        return `p:id:${id}:v:${version}`
    }
    static productKeyVersion = 'p:k:v'
}