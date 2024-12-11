import { XMLParser } from 'fast-xml-parser';

export const xmlParserMiddleware = () => {
    return (req, res, next) => {
        if (req.is('application/xml') || req.is('text/xml')) {
            if (!req.body) {
                return next(new Error('Empty request body'));
            }
            try {
                const parser = new XMLParser({ ignoreAttributes: false });
                req.body = parser.parse(req.body);
            } catch (error) {
                return next(error);
            }
        }
        next();
    };
};