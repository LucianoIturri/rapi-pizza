const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser')
const moment = require('moment')
const customer = require('./model/Customer')
const menu = require('./model/Menu')
const order = require('./model/Order')

dotenv.config();
const ObjectID = require('mongodb').ObjectId;

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}));
const port = process.env.ENVIRONMENT_PORT;

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/delivery')
    .then(() => console.log('connected'))
    .catch(e => console.log('error de conexión', e))

let idClient;
let idMenu;
let cantidad;
let importeTotal;
let pago;
let response;
var customer_order = [];

//orden
app.post('/order', (req, res) => {
    console.log(req.body.sessionInfo);
    const tag = req.body.fulfillmentInfo.tag;
    if (!!tag) {
        switch (tag) {
            case 'cargar_order':

                idClient = req.body.sessionInfo.parameters['idClient'];
                idMenu = req.body.sessionInfo.parameters['idMenu'];
                pizza = req.body.sessionInfo.parameters['pizza'];
                cantidad = req.body.sessionInfo.parameters['cantidad'];
                importe = req.body.sessionInfo.parameters['importeTotal'];

                let orderString = cantidad + " " + pizza + " " + importe;
                customer_order.push(orderString)
                importeTotal = importeTotal + importe;

                const newOrder = new Order({ idClient, idMenu, cantidad, importe });
                newOrder.save();
                res.status(200).send({
                    sessionInfo: {
                        parameters: {
                            OrderString: customer_order,
                            importeFinal: importeTotal,
                            idOrder: newOrder._id
                        }
                    }
                });
                break;

            case 'confirm_pago':
                pago = req.body.sessionInfo.parameters['pay'];
                importeFinal = req.body.sessionInfo.parameters['importeFinal'];
                response = 'invalid';
                let valor_1 = parseFloat(pago.toString());
                let valor_2 = parseFloat(importeTotal.toString());
                if (valor_1 >= valor_2) {
                    let vuelto = (valor_1 - valor_2);
                    res.status(200).send({
                        sessionInfo: {
                            parameters: {
                                vuelto: vuelto,
                                response: 'valid'
                            }
                        }
                    });
                }
                else {
                    res.status(200).send({
                        sessionInfo: {
                            parameters: {
                                vuelto: -1,
                                response: response
                            }
                        }
                    });
                }
                break;
        }
    }
});

app.post('/menu', (req, res) => {
    console.log(req.body.sessionInfo);
    const tag = req.body.fulfillmentInfo.tag;
    let menu;
    if (!!tag) {
        switch (tag) {
            case 'consult_menu':
                console.log(req.body.sessionInfo);
                menu = req.body.sessionInfo.parameters['pizza'];
                cantidad = req.body.sessionInfo.parameters['cantidad'];

                var a = Menu.find({
                    descripcion: menu
                }, function callback(error, a) {
                    a.forEach(item => {
                        if (menu.toUpperCase() === item.descripcion.toUpperCase()) {
                            res.status(200).send({
                                sessionInfo: {
                                    parameters: {
                                        idMenu: item._id,
                                        importe: parseFloat(item.precio),
                                        importeTotal: (parseFloat(item.precio) * parseInt(cantidad))
                                    }
                                }
                            });
                        }
                    });
                })
                break;
        }
    }
});

app.post('/client', (req, res) => {
    console.log(req.body.sessionInfo);
    const tag = req.body.fulfillmentInfo.tag;
    let telefono;
    let nombre;
    let estado;
    let apellido;
    let direccion;
    if (!!tag) {
        switch (tag) {
            case 'verificar_client':
                clearArray(customer_order);
                importeTotal = 0;
                console.log(req.body.sessionInfo);
                nombre = req.body.sessionInfo.parameters['given-name'];
                apellido = req.body.sessionInfo.parameters['last-name'];
                telefono = req.body.sessionInfo.parameters['phone-number'];
                estado = 'invalid';

                var a = Client.find({
                    "telefono": telefono, nombre: nombre, apellido: apellido
                }, function callback(error, a) {
                    if (a < 1) {
                        res.status(200).send({
                            sessionInfo: {
                                parameters: {
                                    estado: estado,
                                }
                            }
                        });
                    }
                    else {
                        estado = 'valid';
                        a.forEach(item => {
                            res.status(200).send({
                                sessionInfo: {
                                    parameters: {
                                        estado: estado,
                                        address: item.direccion,
                                        idClient: item._id
                                    }
                                }
                            });
                        });
                    }
                });
                break;

            case 'guardar_client':
                console.log(req.body.sessionInfo);
                nombre = req.body.sessionInfo.parameters['given-name'];
                telefono = req.body.sessionInfo.parameters['phone-number'];
                direccion = req.body.sessionInfo.parameters['address'];
                apellido = req.body.sessionInfo.parameters['last-name'];
                let update = req.body.sessionInfo.parameters['update'];
                let id = req.body.sessionInfo.parameters['idClient'];
                if (update === "true") {
                    console.log(id);
                    console.log(direccion);
                    Client.deleteOne({
                        _id: new
                            ObjectID(id)
                    }).then(data => {
                        res.status(200).send({
                            sessionInfo: {
                                parameters: {
                                    estado: 'valid',
                                    update: 'false',
                                    address: direccion,
                                }
                            }
                        });
                    })
                    const customer = new Client({ _id: new ObjectID(id), nombre, apellido, telefono, direccion });
                    customer.save();
                }
                else {
                    try {

                        var band = false;
                        var a = Client.find({ "telefono": telefono },
                            function callback(error, a) {
                                a.forEach(item => {
                                    if (a < 1) {
                                        estado = 'valid';
                                        band = true;
                                        res.status(200).send({
                                            sessionInfo: {
                                                parameters: {
                                                    estado: estado,
                                                    address: item.direccion,
                                                    idClient: item._id
                                                }
                                            }
                                        });
                                    }
                                });
                            });
                        if (!band) {
                            const customer = new Client({ nombre, apellido, telefono, direccion });
                            customer.save();
                            estado = 'valid';
                            res.status(200).send({
                                sessionInfo: {
                                    parameters: {
                                        estado: estado,
                                        idClient: customer._id
                                    }
                                }
                            });
                        }
                    } catch (error) {
                        console.log(error)
                    }
                }
                break;
        }
    }
});
function clearArray(array) {
    while (array.length) {
        array.pop();
    }
}
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

