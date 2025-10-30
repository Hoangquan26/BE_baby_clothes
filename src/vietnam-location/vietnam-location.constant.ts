export type ProvinceType = { 
    code: number,
    name: string,
    slug: string,
    type: string,
    name_with_type: string,
}

export type WardType = {
    name: string;
    type: string;
    slug: string;
    name_with_type: string;
    path: string;
    path_with_type: string;
    code: number;
    parent_code: number;
}