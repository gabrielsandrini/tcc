import { Router } from 'express';
import LogController from './app/controllers/LogController';
import ReportController from './app/controllers/ReportController';
/*
import Brute from 'express-brute';
import BruteRedis from 'express-brute-redis';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import validateUserStore from './app/validators/UserStore';
import validateSessionStore from './app/validators/SessionStore';


const bruteStore = new BruteRedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});
const bruteForce = new Brute(bruteStore);

routes.post('/users', validateUserStore, UserController.store);
routes.post(
  '/sessions',
  bruteForce.prevent,
  validateSessionStore,
  SessionController.store
  );
  */
// import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.get('/', (req, res) => res.json({ hello: 'world' }));

// routes.use(authMiddleware);

routes.post('/log', LogController.store);
routes.get('/relatorio/turma', ReportController.relatorioTurma);
routes.get('/relatorio/aluno', ReportController.relatorioAluno);
routes.get('/relatorio/attempt', ReportController.relatorioQuestao);
routes.get('/relatorio/turma/questoes', ReportController.relatorioQuestaoTurma);

export default routes;
