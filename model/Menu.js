const mongoose = require('mongoose');
const { Schema } = mongoose;

const Menu = new Schema({
  descripcion: { type: String, required: true },
  precio: { type: String, require: true },
  date: { type: Date, default: Date.now }
});

/* const fuga = new Schema({
  descripcion: 'Fugazzeta',
  precio: 800,
  date: Date.now
})

const napo = new Schema({
  descripcion: 'Napolitana',
  precio: 850,
  date: Date.now
})

const ternera = new Schema({
  descripcion: 'Ternera',
  precio: 950,
  date: Date.now
}) */

module.exports = mongoose.model('Menu', Menu);