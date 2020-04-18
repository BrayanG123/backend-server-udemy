var express = require('express');
var bcrypt = require('bcryptjs');
// var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');



// ====================================
// 		Obtener Usuarios GET
// ====================================
app.get('/', (req, res, next) =>{

    var desde = req.query.desde || 0; //Esto es para definir desde donde quiere el usuario q se muestre
    desde = Number(desde);  // Para asegurarnos de que sea un numero
    //'desde' es un parametro opcional
    Usuario.find({ }, 'nombre email img role')
    .skip(desde) //Funcion del moongo q permite hacer un salto de los registros (es un parametro opcional)
    .limit(5)
    .exec(
        (err, usuarios) => {

            if (err){
                return res.status(500).json({
                    ok:false,
                    mensaje:'Error cargando usuarios',
                    errors: err
                });
            }

            Usuario.count( {}, (err, conteo) => { //funcion del moongo

                res.status(200).json({
                    ok:true,
                    totalUsuarios: conteo,
                    usuarios:usuarios
                });
            } );
            
        }
    );
});


// ====================================
// 	Actualizar un usuario PUT
// ====================================

app.put( '/:id', mdAutenticacion.verificarToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if ( err ){
            return res.status(500).json({
                ok     :false,
                mensaje:'Error al buscar usuario',
                errors : err
            });
        }

        if ( !usuario ){
            return res.status(400).json({
                ok     :false,
                mensaje:'No existe el usuario con el id: '+ id,
                errors : { message: 'No existe un usuario con ese ID' }
            });
        }    

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( (err, usuarioGuardado) => {
            if (err){         
                return res.status(400).json({
                    ok     :false,
                    mensaje:'Error al actualizar usuario, verifique los datos',
                    errors : err
                });          
            }

            usuarioGuardado.password = '*****',

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        } );

    });
} );

// ====================================
// 		Crear Usuario POST
// ====================================
app.post('/', mdAutenticacion.verificarToken,(req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    //aqui se graba el usuario en la BD
    usuario.save( (err, usuarioGuardado) => {
        if (err){         
            return res.status(400).json({
                ok     :false,
                mensaje:'Error al crear usuario',
                errors : err
            });          
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    } );
    
});


// ====================================
// 	Eliminar Usuario DELETE 		
// ====================================
app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=> {
        if (err){         
            return res.status(500).json({
                ok     :false,
                mensaje:'Error al borrar usuario',
                errors : err
            });          
        }

        if ( !usuarioBorrado ){
            return res.status(400).json({
                ok     :false,
                mensaje:'No existe el usuario con el id: '+ id,
                errors : err
            });
        } 

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
            message: 'Usuario borrado exitosamente'
        });
    });
});


module.exports = app;