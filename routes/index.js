
var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/sanwei', function(req, res, next) {
	if (!req.session.username) {
		res.redirect('/login');
	}
	else{
	  res.render('sanwei', { title: 'sanwei' });
	};
});
//GET myblog
router.get('/ablog', function(req, res, next) {
	var Blog = global.dbHandel.getModel('Blog');
	Blog.find({}, function(err,doc){
		if (err) {
		    req.session.error = '网络异常错误！';
	        res.send(500);
		}else{
			blogs = doc ? doc : {};
			//console.log(doc);
			res.render('ablog',{title: "blog", blogs : blogs});
		}
	}); 
});

//delete blog 还有问题
// router.get('/delete/:id', function(req, res, next) {
// 	var Blog = global.dbHandel.getModel('Blog');
// 	console.log('qqqqq');
// 	Blog.delete({"id":req.params.id},function(err,doc){
// 		if (err) {
// 			console.log('aaaaa');
// 		    req.session.error = '网络异常错误！';
// 	        res.send(500);
// 		}else{
// 			req.session.success = '博客删除成功！';
// 			res.redirect('/ablog');
// 			console.log('zzzzz');
// 		}
// 	});

router.get('/bblog', function(req, res, next) {
	if (!req.session.username) {
		res.redirect('/login');
	}
	else{
	  res.render('bblog', { title: 'myblog' });
	}
});

router.post('/bblog', function(req, res){
	var Blog = global.dbHandel.getModel('Blog');
	var title = req.body.title;
	var content = req.body.content;
	var author = req.session.username;
	 Blog.create({                             // 创建一组blog对象置入model
	        title: title,
	        content: content,
	        author: author,
	    }, function(err,doc) { 
	        if (err) {
	        	req.session.error = err;
	            res.send(500);
	            // console.log(err);
	        } else {
	            req.session.error = '博客创建成功！';
	            res.redirect('/ablog');
	        }
	    });
});


// 注册～
	router.get('/register', function(req, res) {
		res.render('register', { title: '注册' });
	});
	router.post('/register', function(req, res) {
	    //这里的User就是从model中获取user对象，通过global.dbHandel全局方法（这个方法在app.js中已经实现)
	    var User = global.dbHandel.getModel('User');
	    var username = req.body.username;
	    var password = req.body.password;
	    User.findOne({username: username, deleted: false}, function(err, doc){   // 同理 /login 路径的处理方式
	    	// console.log('findOne: ', err, doc);
	        if(err) { 
	            req.session.error = '网络异常错误！';
	            res.send(500);
	            // console.log(err);
	        } else if(doc) { 
	            req.session.error = '用户名已存在！';
	            res.send(500);
	            // console.log('用户名已存在！');
	        } else { 
	            User.create({                             // 创建一组user对象置入model
	                username: username,
	                password: password,
	                createtime: new Date()
	            }, function(err,doc) { 
	                if (err) {
	                	req.session.error = err;
                        res.send(500);
                        // console.log(err);
                    } else {
                        req.session.error = '用户名创建成功！';
                        res.send(200);
                        // console.log('用户名创建成功！');
                    }
	            });
	        }
	    });
	});

	// 登录
	router.get('/login', function(req, res) {
		if (!req.session.username) {
			res.render('login', { title: '登录' });
		} else {
			res.redirect("/");
		}
		
	});
	router.post('/login', function(req, res) {
		//这里的User就是从model中获取user对象，通过global.dbHandel全局方法（这个方法在app.js中已经实现)
	    var User = global.dbHandel.getModel('User');
	    var username = req.body.username;
	    var password = req.body.password;
	    User.findOne({username: username, deleted: false}, function(err, doc){   // 同理 /login 路径的处理方式
	    	console.log('findOne: ', err, doc);
	        if(err) {
	            req.session.error =  '网络异常错误！';
	            res.send(500);
	             //console.log(err);
	        } else if(!doc) {
	            req.session.error = '用户名不存在！';
	            res.send(500);
	             //console.log('用户名不存在！');
	        } else {
	        	if (doc['password'] != password) {
	        		req.session.error = '密码错误！';
                    res.send(500);
                     //console.log('密码错误！');
	        	} else {
	        		req.session.username = username;
                    res.send(200);
                     //console.log('登录成功！');
	        	}
	        }
	    });
	});

//注销
	router.get('/logout', function(req, res) {	 
	    req.session.username = null;  //清空session 
	    req.session.error = null;
    	res.redirect("/");
	});	

//vr页面
	router.get('/vr', function(req, res) {	 
		res.render('vr', { title: 'a-frame'});
	});	

module.exports = router;