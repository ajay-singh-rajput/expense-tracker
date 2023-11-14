const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const plm = require('passport-local-mongoose');

const userSchema = new Schema({
  username: {
    type:String,
    unique:true,
    require:true
  },
  password: String,
  email: String,
  expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }],
  genratedOtp:{
    type:Number,
    default:-1
},
budget:Number
});

userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);
