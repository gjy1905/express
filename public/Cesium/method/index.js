window.onload = function(){
//切换用户状态
	var username = document.getElementById('status2').innerText;
		if (!username)
		{
			$("#status1").show();
		}
		else
		{	
			$("#status2").show();
		}

//控制进度条
	function run(){  
        var bar = document.getElementById("progress-bar"); 
        var total = document.getElementById("total"); 
	    bar.style.width=parseInt(bar.style.width) + 100 + "%";  
	    total.innerHTML = bar.style.width;
	     
	    // if(bar.style.width == "100%"){  
	    //   window.clearTimeout(timeout); 
	    //   return; 
    	// } 
    	// var timeout=window.setTimeout("run()",1); 
  	} 
     $(".btn").click(function(){  
     		run();
    });

//判断是否登录，登录后才能访问
	$("#sanwei").click(function(){ 
			run();
			console.log('jiazai');
		if (!username){
			alert("请先登录才能访问");	
		}
		else {
			window.location.href="/sanwei"; 	
		}
	});
};