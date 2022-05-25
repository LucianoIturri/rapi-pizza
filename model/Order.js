const mongoose = require('mongoose');
const {Schema} = mongoose;

const Order = new Schema({
  idClient:  {type: String, required: true},
  idMenu:  {type: String, required: true},
  cantidad: {type: String, require: true},
  importeTotal: {type: String,require: true},
  status: {type: String, default: 'pending'},
  date: {type: Date, default: Date.now}
});

// Crear el modelo
module.exports = mongoose.model('Order', Order);