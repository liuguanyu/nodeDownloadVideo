var parser = require("parseVideo");

var fs = require("fs");

var path = require("path");

var exec = require('child_process').exec;

var downloadInfo = fs.readFileSync("download.txt").toString();

var downloadList = downloadInfo.split("\n");

downloadList.forEach(function (el){
    el = el.trim();
    parser(el, '', function(err, data){
        var dirName = +(new Date()) + "";

        var workPath = path.resolve(__dirname, '.', dirName);

        if (!fs.existsSync(workPath)){
          fs.mkdirSync(workPath);
        }

        var title = data["title"];
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

        // 这里采用http://yonsm.net/mp4merge/的第三种方法解决
        var merge = function (length){
            var tss = [];
        	for(var i = 0 ; i < length; i++){
               tss.push(path.resolve(workPath, '.', i + ".ts"));
        	}

            var targetFile = path.resolve(workPath, '.', "output.mp4");
            var finalFile = path.resolve(__dirname, '.', title + ".mov");

            var cmd = [];
            cmd.push('ffmpeg -i "concat:' + tss.join("|") + '" -acodec copy -vcodec copy -absf aac_adtstoasc ' + targetFile);
            cmd.push('ffmpeg -i ' + targetFile + " " + finalFile);
            cmd.push('rm -fr ' + workPath);

            var finalCmd = cmd.join(";");
            exec(finalCmd, function (err, stdout, stderr){
               if (err){
               }
               else{
               }
            });
        };

        var qiyiEncode = function (i, callback){
            var sourceFile = path.resolve(workPath, '.', i + ".f4v");
            var targetFile = path.resolve(workPath, '.', i + ".mp4");
            var tsFile = path.resolve(workPath, '.', i + ".ts");
            var cmd = [];
            //cmd[0] = "ffmpeg -i " + sourceFile + " " + targetFile;
            cmd.push("ffmpeg -i " + sourceFile + " -vcodec copy -acodec copy -vbsf h264_mp4toannexb " + tsFile);
            //cmd[1] = "rm " + targetFile;
            cmd.push("rm " + sourceFile);

            var finalCmd = cmd.join(";");

            exec(finalCmd, function (err, stdout, stderr){
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

        datas.forEach(function (el, i){
        	var jsonFile = path.resolve(workPath, '.', i + ".json");
            var cmd = "wget -O " + jsonFile + " '"  + el + "'";

            exec(cmd, function (err, stdout, stderr){
            	   if (err){
            	   	  console.log("Running " + cmd + " cause error!");
            	   }
            	   else{
            	   	  qiyiDownload(jsonFile, function (data){
                          qiyiEncode(i, function(){
                              --length;

                              if (length == 0){
                                merge(total);
                              }
                          });
            	   	  });
            	   }
            });
        });
    });
});
