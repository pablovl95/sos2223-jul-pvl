import { datos_jorge } from './index-JFS.js';
const rutaJorge = "/api/v3/market-prices-stats";
import Datastore from 'nedb';
var db = new Datastore();

function loadBackend_jorge_v3(app) {
    //POSTMAN DOCUMENTATION API V3
    app.get(rutaJorge + '/docs', function (req, res) {
        res.status(301).redirect('https://documenter.getpostman.com/view/26013124/2s93eSZadu');
    });
    //insertar datos
    db.insert(datos_jorge);
    /*------------GET------------*/
    //GET carga de datos
    app.get(rutaJorge + "/loadInitialData", (req, res) => {
        console.log("New GET to /market-prices-stats/loadInitialData");
        db.find({}, async (err, data) => {
            if (err) {
                console.log(`Algo ha salido mal cargando los datos: ${err}.`);
                res.sendStatus(500);
            } else if (data.length != 0) {
                console.log(`Ya hay datos cargados.`);
                res.sendStatus(400);
            } else {
                db.insert(datos_jorge);
                console.log(`Se han insertado ${datos_jorge.length} datos.`);
                res.sendStatus(201);
            }
        });
    });

    //GET provincia + año
    app.get(rutaJorge + '/:province' + '/:year', (req, res) => {
        const year = parseInt(req.params.year);
        const province = req.params.province;
        const limit = req.query.limit;
        const offset = req.query.offset;
        console.log("New GET to /market-prices-stats/" + province + "/" + year);
        const filteredConditions = new Map();
        filteredConditions.set('province', province);
        filteredConditions.set('year', year);
        var obj;
        const pib_current_price_over = parseFloat(req.query.pib_current_price_over);
        if (!isNaN(pib_current_price_over)) filteredConditions.set('pib_current_price', { '$gte': pib_current_price_over });
        const pib_percentage_structure_over = parseFloat(req.query.pib_percentage_structure_over);
        if (!isNaN(pib_percentage_structure_over)) filteredConditions.set('pib_percentage_structure', { '$gte': pib_percentage_structure_over });
        const pib_variation_rate_over = parseFloat(req.query.pib_variation_rate_over);
        if (!isNaN(pib_variation_rate_over)) filteredConditions.set('pib_variation_rate', { '$gte': pib_variation_rate_over });
        const pib_current_price_lower = parseFloat(req.query.pib_current_price_lower);
        if (!isNaN(pib_current_price_lower)) filteredConditions.set('pib_current_price', { '$lte': pib_current_price_lower });
        const pib_percentage_structure_lower = parseFloat(req.query.pib_percentage_structure_lower);
        if (!isNaN(pib_percentage_structure_lower)) filteredConditions.set('pib_percentage_structure', { '$lte': pib_percentage_structure_lower });
        const pib_variation_rate_lower = parseFloat(req.query.pib_variation_rate_lower);
        if (!isNaN(pib_variation_rate_lower)) filteredConditions.set('pib_variation_rate', { '$lte': pib_variation_rate_lower });
        if (filteredConditions.length === 0) obj = {};
        else obj = Object.fromEntries(filteredConditions);
        db.find(obj).skip(offset).limit(limit).exec(async (err, data) => {
            if (err) {
                console.log(`Algo ha salido mal: ${err}.`);
                res.sendStatus(500);
            } else {
                if (data.length === 0) {
                    res.sendStatus(404);
                    console.log(`No existe ningún recurso para la provincia: ${province}, en el año: ${year}.`);
                } else {
                    const recurso = data.map((x) => {
                        delete x._id;
                        return x;
                    });
                    res.status(200).json(recurso[0]);
                }
            };
        });
    });
    //GET provincia o provincia + periodo concreto 
    app.get(rutaJorge + '/:province', (req, res) => {
        const province = req.params.province;
        const from = req.query.from;
        const to = req.query.to;
        const limit = req.query.limit;
        const offset = req.query.offset;
        const filteredConditions = new Map();
        filteredConditions.set('province', province);
        var obj;
        const year = parseInt(req.query.year);
        if (!isNaN(year)) filteredConditions.set('year', year);
        const pib_current_price_over = parseFloat(req.query.pib_current_price_over);
        if (!isNaN(pib_current_price_over)) filteredConditions.set('pib_current_price', { '$gte': pib_current_price_over });
        const pib_percentage_structure_over = parseFloat(req.query.pib_percentage_structure_over); /* */
        if (!isNaN(pib_percentage_structure_over)) filteredConditions.set('pib_percentage_structure', { '$gte': pib_percentage_structure_over });
        const pib_variation_rate_over = parseFloat(req.query.pib_variation_rate_over);
        if (!isNaN(pib_variation_rate_over)) filteredConditions.set('pib_variation_rate', { '$gte': pib_variation_rate_over });
        const pib_current_price_lower = parseFloat(req.query.pib_current_price_lower);
        if (!isNaN(pib_current_price_lower)) filteredConditions.set('pib_current_price', { '$lte': pib_current_price_lower });
        const pib_percentage_structure_lower = parseFloat(req.query.pib_percentage_structure_lower);
        if (!isNaN(pib_percentage_structure_lower)) filteredConditions.set('pib_percentage_structure', { '$lte': pib_percentage_structure_lower });
        const pib_variation_rate_lower = parseFloat(req.query.pib_variation_rate_lower);
        if (!isNaN(pib_variation_rate_lower)) filteredConditions.set('pib_variation_rate', { '$lte': pib_variation_rate_lower });
        if (filteredConditions.length === 0) obj = {};
        else obj = Object.fromEntries(filteredConditions);
        db.find(obj).skip(offset).limit(limit).exec(async (err, data) => {
            const dataSelec = data.filter(x => x.year >= from && x.year <= to);
            if (err) {
                console.log(`Algo ha salido mal: ${err}.`);
                res.sendStatus(500);
            } else {
                if (data.length === 0) {
                    res.sendStatus(404);
                    console.log(`No existe ningún recurso para la provincia: ${province}.`);
                } else{
                    if (from && to) {
                        if (from >= to) {
                            res.sendStatus(400);
                            console.log(`El rango desde: ${from} hasta ${to} es incorrecto.`);
                        } else {
                            res.json(dataSelec.map((x) => {
                                delete x._id;
                                return x;
                            }));
                            console.log(`New GET to /market-prices-stats/${province}?from=${from}&to=${to}`);
                        }
                    } else {
                        res.json(data.map((x) => {
                            delete x._id;
                            return x;
                        }));
                        console.log("New GET to /market-prices-stats/" + province);
                    }
                }
            };
        });
    });
    
    //GET periodo concreto/año concreto/datos DB
    app.get(rutaJorge, (req, res) => {
        const from = req.query.from;
        const to = req.query.to;
        const limit = req.query.limit;
        const offset = req.query.offset;
        const filteredConditions = new Map();
        var obj;
        const year = parseInt(req.query.year);
        if (!isNaN(year)) filteredConditions.set('year', year);
        const pib_current_price_over = parseFloat(req.query.pib_current_price_over);
        if (!isNaN(pib_current_price_over)) filteredConditions.set('pib_current_price', { '$gte': pib_current_price_over });
        const pib_percentage_structure_over = parseFloat(req.query.pib_percentage_structure_over);
        if (!isNaN(pib_percentage_structure_over)) filteredConditions.set('pib_percentage_structure', { '$gte': pib_percentage_structure_over });
        const pib_variation_rate_over = parseFloat(req.query.pib_variation_rate_over);
        if (!isNaN(pib_variation_rate_over)) filteredConditions.set('pib_variation_rate', { '$gte': pib_variation_rate_over });
        const pib_current_price_lower = parseFloat(req.query.pib_current_price_lower);
        if (!isNaN(pib_current_price_lower)) filteredConditions.set('pib_current_price', { '$lte': pib_current_price_lower });
        const pib_percentage_structure_lower = parseFloat(req.query.pib_percentage_structure_lower);
        if (!isNaN(pib_percentage_structure_lower)) filteredConditions.set('pib_percentage_structure', { '$lte': pib_percentage_structure_lower });
        const pib_variation_rate_lower = parseFloat(req.query.pib_variation_rate_lower);
        if (!isNaN(pib_variation_rate_lower)) filteredConditions.set('pib_variation_rate', { '$lte': pib_variation_rate_lower });
        if (filteredConditions.length === 0) obj = {};
        else obj = Object.fromEntries(filteredConditions);
        db.find(obj).skip(offset).limit(limit).exec(async (err, data) => {
            if (err) {
                console.log(`Algo ha salido mal: ${err}.`);
                res.sendStatus(500);
            } else {
                if (data.length === 0) {
                    res.sendStatus(404);
                    console.log(`No existe ningún recurso.`);
                } else{
                    if (from && to) {
                        const dataSelec = data.filter(x => x.year >= from && x.year <= to);
                        if (from >= to) {
                            res.sendStatus(400);
                            console.log(`El rango desde ${from} hasta ${to} es incorrecto.`);
                        } else {
                            res.status(200).json(dataSelec.map((x) => {
                                delete x._id;
                                return x;
                            }));
                            console.log(`New GET to /market-prices-stats?from=${from}&to=${to}`);
                        }
                    } else {
                        res.status(200).json(data.map((x) => {
                            delete x._id;
                            return x;
                        }));
                        console.log("New GET to /market-prices-stats");
                    }
                }
            };
        });
    });
    /*------------POST------------*/
    //POST rutaJorge
    app.post(rutaJorge, (req, res) => {
        res.status(405).send("POST no está permitido en esta ruta.");
    });
    //POST Ruta específica 
    app.post(rutaJorge + '/:pronvince/:year', (req, res) => {
        res.status(405).send("POST no está permitido en esta ruta.");
    });
    /*------------PUT------------*/
    //PUT actualizar estadistica
    app.put(rutaJorge + '/:province' + '/:year', (req, res) => {
        res.status(405).send("PUT no está permitido en esta ruta.");
    });
    //PUT rutaJorge
    app.put(rutaJorge, (req, res) => {
        res.status(405).send("PUT no está permitido en esta ruta.");
    });
    /*------------DELETE------------*/
    //DELETE rutaJorge
    app.delete(rutaJorge, (req, res) => {
        res.status(405).send("DELETE no está permitido en esta ruta.");
    });
    //DELETE recurso especifido
    app.delete(rutaJorge + "/:province/:year", (req, res) => {
        res.status(405).send("DELETE no está permitido en esta ruta.");
    });
};
export { loadBackend_jorge_v3 };