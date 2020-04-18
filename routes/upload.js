var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');


// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) =>{

    var tipo = req.params.tipo;
    var id = req.params.id;

    //para validar el tipo de coleccion
    var tiposValidos = ['usuarios','medicos','hospitales'];
    if ( tiposValidos.indexOf(tipo) < 0 ){
        return res.status(400).json({
            ok: false,
            message: 'tipo de coleccion no valida',
            errors: { message: 'tipo de coleccion no valida' }
        });
    }


    if ( !req.files ){
        return res.status(400).json({
            ok: false,
            message: 'Ninguna imagen seleccionada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    //obtener el archivo
    var archivo = req.files.imagen;
    //obtener la extension del archivo
    var extension = archivo.name.split('.').pop(); //se separaran por el punto (el nombre de los archivos son inciertos)

    // las extensiones que solo aceptaremos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if ( extensionesValidas.indexOf(extension) < 0 ){ //-1 si no lo encuentra
        return res.status(400).json({
            ok: false,
            message: 'Archivo no permitido',
            extension: extension,
            errors: { message: 'Solo se permiten archivos de tipo: ' + extensionesValidas.join(', ')}
        });
    }

    //Nombre del archivo personalizado: ej: 1231223-123-png
    //el 1er es el id del usuario, el 2do un # random para prevenir el cache de la img del nav web
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    //Mover el archivo del temporal a un path
    var ruta = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv( ruta, err => {    
        if ( err )
            return res.status(500).json({
                ok: false,
                message: 'Error al mover el archivo',
                ruta,
                error: err
            }); 
           
        subirPorTipo(tipo, id, nombreArchivo, res);   
        // res.status(200).json({
        //     ok:true,
        //     mensaje:'Archivo subido exitosamente'
        // });
    } );

});

function subirPorTipo(tipo, id, nombreArchivo, res){
    switch (tipo) {
        case 'usuarios':
            Usuario.findById(id, (err, usuario)=>{

                if ( !usuario ){
                    return res.status(400).json({
                        ok: false,
                        mensaje:'Usuario no existe',
                    });
                }

                var pathViejo = './uploads/usuarios/'+ usuario.img;

                //si existe elimina la imagen anterior
                if ( fs.existsSync(pathViejo) )
                    fs.unlinkSync(pathViejo);

                usuario.img = nombreArchivo;

                usuario.save( (err, usuarioActualizado)=>{
                    usuarioActualizado.password = ':)';
                    return res.status(200).json({
                        ok:true,
                        mensaje:'Usuario actualizado exitosamente',
                        usuario: usuarioActualizado
                    });
                } );
            });
            break;

        case 'hospitales':
            Hospital.findById(id, (err, hospital)=>{

                if ( !hospital ){
                    return res.status(400).json({
                        ok: false,
                        mensaje:'El hospital no existe',
                    });
                }

                var pathViejo = './uploads/usuarios/'+ hospital.img;

                //si existe elimina la imagen anterior
                if ( fs.existsSync(pathViejo) )
                    fs.unlinkSync(pathViejo);

                hospital.img = nombreArchivo;

                hospital.save( (err, hospitalActualizado)=>{
                    return res.status(200).json({
                        ok:true,
                        mensaje:'Hospital actualizado exitosamente',
                        usuario: hospitalActualizado
                    });
                } );
            });
            break;

        case 'medicos':
            Medico.findById(id, (err, medico)=>{

                if ( !medicos ){
                    return res.status(400).json({
                        ok: false,
                        mensaje:'El medico no existe',
                    });
                }

                var pathViejo = './uploads/usuarios/'+ medico.img;

                //si existe elimina la imagen anterior
                if ( fs.existsSync(pathViejo) )
                    fs.unlinkSync(pathViejo);

                medico.img = nombreArchivo;

                medico.save( (err, medicoActualizado)=>{
                    return res.status(200).json({
                        ok:true,
                        mensaje:'Medico actualizado exitosamente',
                        usuario: medicoActualizado
                    });
                } );
            });
            break;

        default:
            break;
    }
}



module.exports = app;