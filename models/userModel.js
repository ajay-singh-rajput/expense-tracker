const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const plm = require('passport-local-mongoose');

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  expenses: [{ type: Schema.Types.ObjectId, ref: 'Expense' }],
  genratedOtp:{
    type:Number,
    default:-1
}
});

userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);
