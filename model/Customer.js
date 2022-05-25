const mongoose = require('mongoose');
const {Schema} = mongoose;

const Customer = new Schema({
  nombre:  {type: String, required: true},
  apellido: {type: String, required: true},
  telefono: {type: String, require: true},
  direccion: {type: String, required: true},
  date: {type: Date, default: Date.now}
});


module.exports = mongoose.model('Customer', Customer);

