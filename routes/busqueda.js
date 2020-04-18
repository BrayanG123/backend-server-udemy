var express = require('express');

var app = express();

var Hospital = require('../models/hospital'); //Para poder buscar en el hospital hay que importar el modelo
var Medico = require('../models/medico'); //Para poder buscar en el medico hay que importar el modelo
var Usuario = require('../models/usuario'); //Para poder buscar en el usuario hay que importar el modelo


// ====================================
// 		Busqueda por Coleccion
// ====================================
app.get('/coleccion/:tabla/:parametro', (req, res) => {
    var tabla = req.params.tabla;
    var parametro = req.params.parametro;
    var regexp = RegExp( parametro, 'i' ); 

    var promesa;

    switch (tabla) {
        case 'usuario':
            promesa = buscarUsuarios(regexp);
            break;
        case 'hospital':
            promesa = buscarHospitales(regexp);
            break;
        case 'medico':
            promesa = buscarMedicos(regexp);
            break;    
        default: 
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son Usarios, Medicos y Hospitales',
                error: { message: 'Tipo de tabla/coleccion no valido' }
            })
            break;
    }

    promesa.then( respuesta => {
        res.status(200).json({
            ok: true,
            [tabla]: respuesta  //sin las llaves cuadradas solo dira 'tabla' (EcmaScript6)
        })
        }      
    )


});

// ====================================
// 		    Busqueda General
// ====================================
app.get('/todo/:parametro', (req, res, next) =>{
    

    /* ****  Para hacer la busqueda en todas las tablas hay que crear proceso asincronos y
             Esperar a que estos terminen para desplegar los resultados, Caso contrario,   
             Solo va a retornar los resultados de 1 sola tabla (la que termine primero la busqueda)*/


    var parametro = req.params.parametro; // tal parece que el req (request) es el header (investigar)
    var regexp = RegExp( parametro, 'i' ); //Craeamos nuestra expresion regular
    //para que la busqueda sea insensible hay que usar una expresion regular 

    //Del ECMAScript6. incluye enviar 1 arreglo de promesas, ejecutarlas y si todas responden correctamente se hace el then, si 1 falla se va al catch
    Promise.all( [ buscarHospitales(regexp) , 
                  buscarMedicos(regexp) ,   
                  buscarUsuarios(regexp)] )
                .then( respuestas => { //recibe 1 arreglo con las respuestas de cada promesa en el mismo orden que fueron puestas
                    
                    res.status(200).json({
                        ok: true,
                        hospitales: respuestas[0],
                        medicos   : respuestas[1],
                        usuarios  : respuestas[2] 
                    })
    } );  



    /*Hospital.find({nombre: regexp }, (err, hospitales)=>{  ********Metodo para hacer la busqueda en 1 sola tabla

        res.status(200).json({
            ok:true,
            hospitales
        });

    });*/

});

function buscarHospitales( regexp ){

    return new Promise( (resolve, reject) => {
        
        Hospital.find({nombre: regexp }, (err, hospitales)=>{  

            if ( err ) 
                reject('Error al cargar hospitales', err);
            else
                resolve(hospitales);
                      
        });
    });
}

function buscarMedicos( regexp ){

    return new Promise( (resolve, reject) => {
        
        Medico.find({nombre: regexp })
        .populate('hospital', 'nombre')
        .exec(
             (err, medicos)=>{  

            if ( err ) 
                reject('Error al cargar medicos', err);
            else
                resolve(medicos);
                      
        });
    });
}

function buscarUsuarios( regexp ){

    return new Promise( (resolve, reject) => {
        
        Usuario.find({ nombre: regexp }, 'nombre email role' )
        .exec((err, usuarios)=> {  

            if ( err ) 
                reject('Error al cargar usuarios', err);
            else
                resolve(usuarios);
                      
        });
    });
}

module.exports = app;