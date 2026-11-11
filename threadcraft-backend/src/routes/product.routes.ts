import { Router }  from 'express';
import * as productController from '../controllers/product.controller';



const router = Router();


//get all designs with optional
router.get ('/', productController.getDesigns);



//get all categories and must be defned before slug
router.get('/categories', productController.getCategories);


//get a single design by slug
router.get('/:slug', productController.getSingleDesign);



export default router;