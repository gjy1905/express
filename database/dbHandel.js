var mongoose = require('mongoose');
var schemas = require('./schemas.js');

for(var m in schemas){
    mongoose.model(m, mongoose.Schema(schemas[m]));
}

// 这个 应该是 个 公共方法！！

// var User = mongoose.model('User');

// var user = new User({
//     name : 'mongoose',
//     author : 'chenjz',
//     publishTime : new Date()
// });

// user.save(function(error) {
//     console.log('save status: ' , error ? 'failed' : 'succeed');
// });


module.exports = { 
    getModel: function(type){ 
        return _getModel(type);
    }
};

var _getModel = function(type){ 
    return mongoose.model(type);
};
