import cors from "cors";
import { handler } from "./frontend/build/handler.js";
import express from "express";
import { LoadModulo_Pablo } from './backend/pvl/modulo-pvl.js';
import { LoadModulo_Pablo_v2 } from './backend/pvl/modulo-pvl-v2.js';

var app = express();

app.use(cors());

var port = process.env.PORT || 12345;
app.use(express.json());
//BACKEND
LoadModulo_Pablo(app);
LoadModulo_Pablo_v2(app);

app.use(handler); 

app.listen(port, () => {
    console.log(`Server escuchando en el puerto ${port}`);
});
