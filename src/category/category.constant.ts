export class CategoryCache {
    static categoryPublicTree(version = 1) {
        return `cat:p:t:v${version}`;
    }

    static categoryListTree(version = 1) {
        return `cat:p:l:v${version}`;
    }

    static categorySelect(version = 1) {
        return `cat:sec:v${version}`;
    }

    static categoryDetail(id: number | string, version = 1) {
        return `cat:dt:${id}:v${version}`;
    }
}