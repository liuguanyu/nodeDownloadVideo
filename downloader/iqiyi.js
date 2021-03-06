/**
 * [下载爱奇艺视频并转化为mov]
 * @param  [type] $url [description]
 * @return [type]      [description]
 */
var fs = require("fs");
var path = require("path");
var exec = require('child_process').exec;

module.exports = function (data, workPath, finalDir){

    var title = data["title"];

    var datas = data["高清"];

    var length = datas.length;
    var total = datas.length;

    var downloadVideo = function (jsonFile, callback){
        var JsonObj = JSON.parse(fs.readFileSync(jsonFile));
        var m = jsonFile.match(/\/(\d+?)\.json$/);
        var i = m[1];

        var videoFile = path.resolve(workPath, '.', i + ".f4v");

        var cmd = "wget -U 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4'  -O " + videoFile +  " '" +JsonObj.l + "'";

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
    var mergeVideo = function (length){
        var tss = [];
        for(var i = 0 ; i < length; i++){
             tss.push(path.resolve(workPath, '.', i + ".ts"));
        }

        var targetFile = path.resolve(workPath, '.', "output.mp4");
        var finalFile = path.resolve(finalDir, '.', title + ".mov");

        var cmd = [];
        cmd.push('ffmpeg -i "concat:' + tss.join("|") + '" -acodec copy -vcodec copy -absf aac_adtstoasc ' + targetFile);
        cmd.push('ffmpeg -y -i ' + targetFile + " " + finalFile);
        cmd.push('rm -fr ' + workPath);

        var finalCmd = cmd.join(";");
        exec(finalCmd, function (err, stdout, stderr){
             if (err){
             }
             else{
             }
        });
    };

    var encodeVideo = function (i, callback){
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
      var cmd = "wget -U 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4' -O " + jsonFile + " '"  + el + "'";

      exec(cmd, function (err, stdout, stderr){
           if (err){
              console.info(err);
              console.log("Running " + cmd + " cause error!");
           }
           else{
              downloadVideo(jsonFile, function (data){
                    encodeVideo(i, function(){
                        --length;

                        if (length == 0){
                          mergeVideo(total);
                        }
                    });
              });
           }
      });
    });
}