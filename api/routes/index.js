import { Router } from 'express';
import usuarioRoutes from './usuarios.js';

const router = Router();

router.use('/usuarios', usuarioRoutes);

export default router;