var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

// test 就是 数据库，但是，表（集合）在哪？？
// 首先～，

// 好吧，它建了一个 叫做 ‘books’ 的集合！！ books！！

// 验证是否 连接成功？
// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function (callback) {
//   // yay!
// });


/**
 * Schema, 数据结构
 * ------------------------------------------------------------
 * 这样做 固然可以，但是，不好 暴露！！Scheme 不好 被外界 获取！！
 *
 */
// var UserSchema = mongoose.Schema({
//     username : {
//         type: String,
//         required : true,    // 必填
//         unique: true        // 唯一
//     },
//     password : {
//         type : String,
//         required : true
//     },
//     email : String,
//     age : {
//         type : Number,
//         default : 0
//     }
//     createtime : Date,
//     deleted : {
//         type : Boolean,
//         default: false
//         // enum : [true, false]    // 枚举值～
//     }
// });

// var BlogSchema = mongoose.Schema({
//     title : String,
//     author : String,
//     ispublic : {
//         type : Boolean,
//         default: true
//     },
//     createtime : Date,
//     updatetime : {
//         type : Data,
//         default : Data.now
//     }
// });


// Modal，这个 也放到 其他 地方 去弄了，这里 只负责 建立 Schema
// mongoose.model('User', UserSchema);

/**
 * Schema, 数据结构
 * ------------------------------------------------------------
 * 另外一种 尝试！这个 才好弄！
 *
 */
module.exports = { 
    User : { 
        username : {
            type: String,
            required : true,    // 必填
            unique: true        // 唯一
        },
        password : {
            type : String,
            required : true
        },
        email : String,
        age : {
            type : Number,
            default : 0
        },
        createtime : Date,
        deleted : {
            type : Boolean,
            default: false
            // enum : [true, false]    // 枚举值～
        }
    },
    Blog : {
        title : String,
        author : String,
        content : String,
        ispublic : {
            type : Boolean,
            default: true
        },
        createtime : Date,
        updatetime : {
            type : Date,
            default : Date.now
        },
        deleted : {
            type : Boolean,
            default: false
        }
    }
};

// function Post(name, title, post) {
//   this.name = name;
//   this.title = title;
//   this.post = post;
// }

// module.exports = Post;

// //存储一篇文章及其相关信息
// Post.prototype.save = function(callback) {
//   var date = new Date();
//   //存储各种时间格式，方便以后扩展
//   var time = {
//       date: date,
//       year : date.getFullYear(),
//       month : date.getFullYear() + "-" + (date.getMonth() + 1),
//       day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
//       minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
//       date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
//   }
//   //要存入数据库的文档
//   var post = {
//       name: this.name,
//       time: time,
//       title: this.title,
//       post: this.post
//   };
//   //打开数据库
//   mongodb.open(function (err, db) {
//     if (err) {
//       return callback(err);
//     }
//     //读取 posts 集合
//     db.collection('posts', function (err, collection) {
//       if (err) {
//         mongodb.close();
//         return callback(err);
//       }
//       //将文档插入 posts 集合
//       collection.insert(post, {
//         safe: true
//       }, function (err) {
//         mongodb.close();
//         if (err) {
//           return callback(err);//失败！返回 err
//         }
//         callback(null);//返回 err 为 null
//       });
//     });
//   });
// };

// //读取文章及其相关信息
// Post.get = function(name, callback) {
//   //打开数据库
//   mongodb.open(function (err, db) {
//     if (err) {
//       return callback(err);
//     }
//     //读取 posts 集合
//     db.collection('posts', function(err, collection) {
//       if (err) {
//         mongodb.close();
//         return callback(err);
//       }
//       var query = {};
//       if (name) {
//         query.name = name;
//       }
//       //根据 query 对象查询文章
//       collection.find(query).sort({
//         time: -1
//       }).toArray(function (err, docs) {
//         mongodb.close();
//         if (err) {
//           return callback(err);//失败！返回 err
//         }
//         callback(null, docs);//成功！以数组形式返回查询的结果
//       });
//     });
//   });
// };

