import express, { Express } from 'express';
import { flowRoute, nodeRoute, teamRoute, metaRoute } from './routes';
import cors from 'cors';
import BodyParser from 'body-parser';
import path from 'path';

export const createApp = () => {
    const app: Express = express();
    app.use(cors());
    app.use('/', express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'public')))
    app.use(BodyParser.urlencoded({ extended: false }));
    app.use(BodyParser.json());

    app.use('/api/v1/metas', metaRoute);
    app.use('/api/v1/nodes', nodeRoute);
    app.use('/api/v1/flows', flowRoute);
    app.use('/api/v1/teams', teamRoute);

    return app;
}