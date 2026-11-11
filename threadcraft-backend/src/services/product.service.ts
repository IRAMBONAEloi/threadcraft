import {prisma} from '../config/database';


export async function getDesigns(query: {
    category?: string;
    search?: string;
    sort?: string;
}){

    const where: any = {
        isActive: true,
    };


    if (query.category) {
        where.category = {
            slug: query.category,
        };
    }


    if (query.search) {
        where.OR = [
            {name: {contains: query.search, mode: 'insensitive'}},
            {description: {contains: query.search, mode: 'insensitive'}},
        ];
    }


    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'price_asc')
orderBy = { basePrice: 'asc' };
    if (query.sort === 'price_desc') orderBy = {basePrice: 'desc'};
    if (query.sort === 'name') orderBy = { name: 'asc'};



    const designs = await prisma.design.findMany({
        where,
        orderBy,
        include: {
            category: {
                select: { name: true, slug: true},
            },

            variants: {
                where: {isActive: true},
                select: {id: true, size: true, color: true, currentStock: true },
            },
        },
    });

    return designs;

}


export async function  getDesignBySlug (slug: string) {
    const design = await prisma.design.findUnique({
        where: { slug },
        include: {
            category: {
                select: {name: true, slug: true},
            },
            variants: {
                where: { isActive: true},
                select: {
                    id: true,
                    size: true,
                    color: true,
                    sku: true,
                    currentStock: true,
                    priceOverride: true,
                },
            },
        },
    });

    return design;

}



export async function getCategories() {
    const categories = await prisma.category.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            _count: {
                select: {designs: {where: {isActive: true}}},
            },
        },
    });
    return categories;
}