import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';
import { NotFoundError } from '../utils/errors';


export async function getDesigns (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { category, search, sort } = req.query;


        const designs = await productService. getDesigns ({
            category: category as string | undefined,
            search: search as string | undefined,
            sort: sort as string | undefined,
        });

        res.status(200).json({
            success: true,
            data: { designs },
        });
    } catch ( error ) {
        next(error); 

        }
    }


    export async function getSingleDesign(

        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {

            const { slug } = req.params;

            const design = await productService.getDesignBySlug(slug);

            if ( !design ){
                throw new NotFoundError('Design not found');

            }

            res.status(200).json({
                success: true,
                data: { design },
            });
        } catch (error) {
            next(error);
        }
    }

    export async function getCategories (

        _req: Request,
        res: Response,
        next: NextFunction

    ): Promise<void> {
        try{ 

            const categories = await productService.getCategories();

            res.status(200).json({
                success: true,
                data: { categories },
            });
        } catch (error) {
            next(error);
        }
    }
