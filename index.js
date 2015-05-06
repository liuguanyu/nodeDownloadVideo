var parser = require("parseVideo");

var fs = require("fs");

var path = require("path");

var dirName = +(new Date()) + "";

var workPath = path.resolve(__dirname, '.', dirName);

if (!fs.existsSync(workPath)){
	fs.mkdirSync(workPath);
}

var exec = require('child_process').exec;  

parser('http://www.iqiyi.com/v_19rrnmbpg0.html#vfrm=2-3-0-1', '', function(err, data){
    var datas = data["高清"];
    var length = datas.length;
    var total = datas.length;

    var qiyiDownload = function (jsonFile, callback){
	    var JsonObj = JSON.parse(fs.readFileSync(jsonFile));
	    var m = jsonFile.match(/\/(\d+?)\.json$/);
	    var i = m[1];

	    var videoFile = path.resolve(workPath, '.', i + ".f4v");

	    var cmd = "wget -O " + videoFile +  " '" +JsonObj.l + "'";  

        exec(cmd, function (err, stdout, stderr){
        	   if (err){
        	   	  callback({
        	   	  	index : i,
        	   	  	status : "error"
        	   	  });
        	   }
        	   else{
        	   	  callback({
        	   	  	index : i,
        	   	  	status : "ok"
        	   	  });
        	   }
        });
    };

    var merge = function (length){

	for(var i = 0 ; i < length; i++){
	    var str = fs.readFileSync( path.resolve(workPath, '.', i + ".f4v"), 'binary');    

	    fs.appendFileSync(path.resolve(workPath, '.',  "final.f4v"), str, "binary");
	}
    };	


    datas.forEach(function (el, i){
    	   var jsonFile = path.resolve(workPath, '.', i + ".json");
        var cmd = "wget -O " + jsonFile + " '"  + el + "'";  

        exec(cmd, function (err, stdout, stderr){
        	   if (err){
        	   	  console.log("Running " + cmd + " cause error!");
        	   }
        	   else{
        	   	  qiyiDownload(jsonFile, function (data){
        	   	  	  --length;

        	   	  	  if (length == 0){
        	   	  	  	merge(total);
        	   	  	  }
        	   	  })
        	   }
        });
    });
});