'use strict';
var http = require('http');
var fs = require('fs');
const fsp=fs.promises;
var url = require('url'); //http, fs, url 은 모듈
var qs = require('querystring');

function templateHTML(title, list, description){
  var template=`
  <!doctype html>
  <html>
  <head>
    <title>Universe-${title}</title>
    <meta charset="utf-8">
    <link rel="stylesheet" href=./style.css>
    <link rel="shortcut icon" href="images/solar_system.png">
    <script src=./script.js></script>
  </head>
  <body>
    <nav>
      <h1><a href="/">Universe</a></h1>
      ${list}
    </nav>
    <div class="under_Menu">
      <div class="bar">
        <h2>${title}<hr></h2>
        <label for="themecolorButton">Change Theme to:<input type="button" id="themecolorButton" value="green" onclick="changeThemecolor(this,'#95DBE5FF','#078282FF','#339E66FF')"></label>
      </div>
      ${description}
    </div>
  </body>
  </html>
  `;
  return template
}

function getMenulist(contentslist){
  var list='<ul>'
  var i=0;
  while(i<contentslist.length){
    if(contentslist[i]==='index'){
      i++;
      continue;
    }
    list+=`<li><a href="/?menu=${contentslist[i]}">${contentslist[i]}</a></li>`;
    i++;
  }
  return list;
}

fsp.readFileAsync = function(filename) {
    return new Promise(function(resolve, reject) {
        fs.readFile(filename, function(err, data){
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });
};

var app = http.createServer(function(request,response){
  var _url = request.url;
  var pathname=url.parse(_url, true).pathname;
  var queryData=url.parse(_url, true).query;
  var menu=queryData.menu;
  var title=queryData.menu;

  if(pathname==='/'){ //localhost:3000 이후에 아예다른 주소로 갔을 경우 404

      if(queryData.menu===undefined) { //root로 들어올 경우
        fs.readdir('./contents',function(error, contentslist){
          menu='index';
          title='Main';
          fs.readFile(`contents/${menu}`, 'utf8', function(err,description){
            var menulist=getMenulist(contentslist);
            var template=templateHTML(title, menulist, description);
            response.writeHead(200); // 서버가 브라우저에게 200을 주면 성공
            response.end(template); // respond.end의 내용을 브라우저로 전달
            });
         });
      }
      else if(queryData.menu==='review'){ // review페이지
        let menulist;
        let description;
        const create_HTML=new Promise((resolve,reject)=>{
          fs.readdir(`./contents`,function(err,contentslist){
            menulist=getMenulist(contentslist);
            resolve();
          });
        }).then(()=>{
          return new Promise((resolve,reject)=>{
            fs.readFile(`./contents/${menu}`,'utf8',function(err,content){
              description+=content;
              resolve();
            });
          })
        }).then(()=>{
          return new Promise((resolve,reject)=>{
            fs.readdir('./data',function(error,diary_dates){
              resolve(diary_dates);
            });
          });
        }).then(diary_dates=>{
          return new Promise((resolve,reject)=>{
            let diaries;

            for(let i=diary_dates.length-1; i>=0; i--){
              fs.readFile(`./data/${diary_dates[i]}`,'utf8',function(err,diary_text){
                diaries+=`<p><a href='./update?date=${diary_dates[i]}'>${diary_dates[i]}</a><br>${diary_text}</p>`;
                if(i==0){
                  resolve(diaries);
                }
              });
            }
          });
        }).then(diaries=>{

          description+=diaries;
          let template=templateHTML(title, menulist, description);
          response.writeHead(200); // 서버가 브라우저에게 200을 주면 성공
          response.end(template); // respond.end의 내용을 브라우저로 전달
          });
      }
        /*
        fs.readdir('./contents',function(error, contentslist){
          var menulist=getMenulist(contentslist);
          fs.readFile(`contents/${menu}`, 'utf8', function(err,description){
            fs.readdir('./data',function(error, diary_dates){
              const showdiaries = new Promise((resolve,reject)=>{
               for(let i=0;i<diary_dates.length;i++){ //일기들을 출력하는 for
                 fs.readFile(`./data/${diary_dates[i]}`,'utf8',function(err,diary_text){
                   diarylist+=`<p><a href='./update?date=${diary_dates[i]}'>${diary_dates[i]}</a><br>${diary_text}</p>`;
                  });//readfile diary
                  resolve(diarylist);
                 }
              });
              showdiaries.then(var template=templateHTML(title, menulist, description+=diarylist))
              response.writeHead(200); // 서버가 브라우저에게 200을 주면 성공
              response.end(template); // respond.end의 내용을 브라우저로 전달
            });//readdir diary
          });//endof readfile menu
        });//endof readdir menu
        */
      else { // 나머지menu페이지
        fs.readdir('./contents',function(error, contentslist){
          fs.readFile(`contents/${menu}`, 'utf8', function(err,description){
            var menulist=getMenulist(contentslist);
            var template=templateHTML(title, menulist, description);
            response.writeHead(200); // 서버가 브라우저에게 200을 주면 성공
            response.end(template); // respond.end의 내용을 브라우저로 전달
          });
        });
      }
  }
  else if(pathname==='/creat_diary'){
    var body='';
    request.on('data',function(data){
      body+=data; //body의 크기가 너무크면 disconnect 하는 코드를 넣을수도 있다.
    });
    request.on('end',function(){
      var post=qs.parse(body);
      var diary_date=post.diary_date;
      var diary_text=post.diary_text;
      fs.writeFile(`data/${diary_date}`,diary_text,'utf8',function(err){
        response.writeHead(302, {Location:'/?menu=review'});//redirection
        response.end();
      })
    });
  }
  else if(pathname==='/update'){//일기수정 페이지
    fs.readdir('./contents',function(error, contentslist){
      fs.readFile(`contents/${menu}`, 'utf8', function(err,description){
        var menulist=getMenulist(contentslist);
            fs.readFile(`./data/${queryData.date}`,'utf8',function(err,diary_text){
              description=`
              <p>${queryData.date}</p>
              <form id="diary" action="http://localhost:3000/update_diary" method="post">
                <input type="hidden" name="diary_date" value="${queryData.date}">
                <textarea name="diary_text">${diary_text}</textarea>
                <button type="submit">내용수정</button>
              </form>
              `;
              var template=templateHTML('update', menulist, description);
              response.writeHead(200); // 서버가 브라우저에게 200을 주면 성공
              response.end(template); // respond.end의 내용을 브라우저로 전달
            });
          });
        });
  }
  else if(pathname==='/update_diary'){
    var body='';
    request.on('data',function(data){
      body+=data; //body의 크기가 너무크면 disconnect 하는 코드를 넣을수도 있다.
    });
    request.on('end',function(){
      var post=qs.parse(body);
      var diary_date=post.diary_date;
      var diary_text=post.diary_text;
      fs.writeFile(`data/${diary_date}`,diary_text,'utf8',function(err){
        response.writeHead(302, {Location:'/?menu=review'});//redirection
        response.end();
      })
    });
  }
  else {
    response.writeHead(404);
    response.end('Not Found');
  }
});
app.listen(3000);
