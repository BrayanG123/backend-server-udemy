var express = require('express');

var mdAutentiacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');


// ====================================
// 		Listar Medicos GET
// ====================================
app.get('/', (req, res) =>{

    Medico.find({})
    .populate('usuario', 'nombre email')//para que muestre los datos del usuario q lo creo con sus campos en especifico
    .populate('hospital')//para que muestre los datos del hospital
    .exec( 
        (err, medicos) => {
        if ( err ){
            return res.status(500).json({
                ok: false,
                message: 'Error al cargar Medicos',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            medicos: medicos
        });
    });

} );


// ====================================
// 		Crear Medico POST		
// ====================================
app.post('/', mdAutentiacion.verificarToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img   : body.img,
        usuario : req.usuario._id,
        hospital: body.hospital
    });
    
    medico.save( (err, medicoGuardado) => {
        if ( err ){
            return res.status(400).json({
                ok: false,
                message: 'Error al crear medico',
                err
            });
        }
        
        res.status(201).json({
            ok: true,
            message: 'medico creado con exito',
            medico: medicoGuardado,
            usuario: req.usuario._id,
            hospital: body.hospital
        });
    });

});

// ====================================
// 		Actualizar Medico PUT		
// ====================================
app.put('/:id', mdAutentiacion.verificarToken, (req, res) => {
    var idM = req.params.id;

    var body = req.body;

    Medico.findById(idM, (err, medicoEncontrado) => {
        if ( err ){
            return res.status(500).json({
                ok: false,
                message: 'Error: verifique los datos',
                errors: err
            });
        }
        if ( !medicoEncontrado ){
            return res.status(400).json({
                ok: false,
                message: 'Error: verifique los datos',
                errors: err
            });
        }

        medicoEncontrado.nombre = body.nombre;
        medicoEncontrado.img    = body.img;
        medicoEncontrado.usuario = req.usuario._id;
        medicoEncontrado.hospital= body.hospital;

        medicoEncontrado.save( (err, medicoGuardado) => {
            if ( err ) {
                res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar los datos',
                    errors: err
                });
            }
            res.status(200).json({
                ok:true,
                medico: medicoGuardado
            });
        } );
    });

});

// ====================================
// 		Borrar medico DELETE    		
// ====================================
app.delete('/:id', mdAutentiacion.verificarToken, (req, res) => {
    var idH = req.params.id;

    Medico.findByIdAndRemove(idH, (err, medicoEncontrado) => {
        if ( err ){
            return res.status(500).json({
                ok: false,
                message: 'Error: verifique los datos',
                errors: err
            });
        }
        if ( !medicoEncontrado ){
            return res.status(400).json({
                ok: false,
                message: 'No existe el medico con ese id',
                errors: err
            });
        }
        res.status(200).json({
            ok:true,
            medico: medicoEncontrado
        });
    });

});

module.exports = app;