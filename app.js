//Requires
var express = require('express');
var mongoose = require('mongoose');

//Inicializar variables
var app = express();


//Conexion a la BD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, resp) => {

    if ( err ) throw err;

    console.log('BD online');

});


// Rutas
app.get('/', (req, res, next) =>{
    res.status(200).json({
        ok:true,
        mensaje:'Peticion realizada exitosamente'
    });
});

//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000 online');
});
