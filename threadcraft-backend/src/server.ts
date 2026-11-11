import express,{Express, Request,Response} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv  from 'dotenv';
import {prisma} from './config/database';
import {errorHandler,notFoundHandler} from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import adminRoutes from './routes/admin.routes';
import passport from './config/passport';


dotenv.config();


const app: Express= express();
const PORT = process.env.PORT || 5000;


//MIDDLEWARE

app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    })
);

app.use(passport.initialize());


app.use(morgan('dev'));
app.use(express.json({ limit: '10mb'}));
app.use(express.urlencoded({ extended: true}));



//ROUTES

app.get('/', (req: Request, res: Response)=>{
    console.log(`${req.method} ${req.url}`);
    res.json({
        message:'Threadcraft API/server is running',
        timestamp:new Date().toISOString()
    });
});




app.get('/api/health',(req :  Request, res:Response)=>{
    console.log(`${req.method} ${req.url}`);
    res.json({
        success:true,
        data:{
            status: 'ok',
            timestamp: new Date().toISOString(),
            enviromnment: process.env.NODE_ENV || 'development',
        },
    });
});


//API ROUTES

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

//ERROR HANDLING


app.use(notFoundHandler);
app.use(errorHandler);



//SERVER STARTUP

async function startServer() {
    try{
        await prisma.$connect();
        console.log('Database connected');

        app.listen(PORT, ()=>{
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

}catch(error){
    console.log(' Failed to start server:', error);
    process.exit(1);
  }
}



process.on('SIGINT', async ()=> {
    console.log('\n Shutting down...');
    await prisma.$disconnect();
    process.exit(0);
});


startServer();

