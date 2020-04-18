var express = require('express');

var mdAutentiacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');


// ====================================
// 		Listar Hospitales GET
// ====================================
app.get('/', (req, res) =>{

    Hospital.find({}) 
    .populate('usuario', 'nombre email') //para que muestre los datos del usuario q lo creo con sus campos en especifico
    .exec(   
        (err, hospitales) => {
        if ( err ){
            return res.status(500).json({
                ok: false,
                message: 'Error al cargar Hospitales',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            hospitales: hospitales
        });
        }
    );

} );


// ====================================
// 		Crear Hospital POST		
// ====================================
app.post('/', mdAutentiacion.verificarToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img   : body.img,
        usuario   : req.usuario._id
    });
    
    hospital.save( (err, hospitalGuardado) => {
        if ( err ){
            return res.status(400).json({
                ok: false,
                message: 'Error al crear Hospital',
                err
            });
        }
        
        res.status(201).json({
            ok: true,
            message: 'Hospital creado con exito',
            hospital: hospitalGuardado,
            usuario: req.usuario._id
        });
    });

});

// ====================================
// 		Actualizar Hospital PUT		
// ====================================
app.put('/:id', mdAutentiacion.verificarToken, (req, res) => {
    var idH = req.params.id;

    var body = req.body;

    Hospital.findById(idH, (err, hospitalEncontrado) => {
        if ( err ){
            return res.status(500).json({
                ok: false,
                message: 'Error: verifique los datos',
                errors: err
            });
        }
        if ( !hospitalEncontrado ){
            return res.status(400).json({
                ok: false,
                message: 'Error: verifique los datos',
                errors: err
            });
        }

        hospitalEncontrado.nombre = body.nombre;
        hospitalEncontrado.img    = body.img;
        hospitalEncontrado.usuario= req.usuario._id;

        hospitalEncontrado.save( (err, hospitalGuardado) => {
            if ( err ) {
                res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar los datos',
                    errors: err
                });
            }
            res.status(200).json({
                ok:true,
                hospital: hospitalGuardado
            });
        } );
    });

});

// ====================================
// 		Borrar Hospital DELETE    		
// ====================================
app.delete('/:id', mdAutentiacion.verificarToken, (req, res) => {
    var idH = req.params.id;

    Hospital.findByIdAndRemove(idH, (err, hospitalEncontrado) => {
        if ( err ){
            return res.status(500).json({
                ok: false,
                message: 'Error: verifique los datos',
                errors: err
            });
        }
        if ( !hospitalEncontrado ){
            return res.status(400).json({
                ok: false,
                message: 'No existe el hospital con ese id',
                errors: err
            });
        }
        res.status(200).json({
            ok:true,
            hospital: hospitalEncontrado
        });
    });

});

module.exports = app;