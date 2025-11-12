const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MessageSchema = new Schema({
  conversation: {type: Schema.Types.ObjectId, ref: 'Conversation'},
  from: {type: Schema.Types.ObjectId, ref: 'User'},
  to: {type: Schema.Types.ObjectId, ref: 'User'},
  content: {type:String},
  status: {type: String, enum: ['delivered','read','sent'], default: 'sent'}
}, {timestamps:true});
module.exports = mongoose.model('Message', MessageSchema);
