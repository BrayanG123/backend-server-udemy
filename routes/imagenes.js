var express = require('express');

var app = express();

const path = require('path');
var fs = require('fs');

app.get('/:tipo/:img', (req, res, next) =>{

    var tipo = req.params.tipo;
    var img = req.params.img;

    // __dirname obtiene toda la ruta en donde me encuentro en este momento
    // sin importar estar en produccion o prueba
    var pathImg = path.resolve( __dirname, `../uploads/${tipo}/${img}` );

    if ( fs.existsSync( pathImg ) )
        res.sendFile( pathImg );
    else{
        var pathNoImg = path.resolve( __dirname, '../assets/no-img.jpg');    
        res.sendFile( pathNoImg );
    }

    // res.status(200).json({
    //     ok:true,
    //     mensaje:'Peticion realizada exitosamente'
    // });
});

module.exports = app;