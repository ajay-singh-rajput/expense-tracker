const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  title:String,
  amount: Number,
  category: String,
  description: String,
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
},{
  timestamps:true
});

module.exports = mongoose.model('Expense', expenseSchema);