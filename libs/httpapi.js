"use strict";
var http = require('https');

class HttpApi{


    constructor(){
    }

    addBasicAuthHeader(username,password){
        this.authHeader = {
            'name': 'Authorization',
            'value': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
        }
    }

    doGetRequest(sb,cb,options){
        
        Homey.log(JSON.stringify(options));
        http.get(options,function(res){
       
        var body = '';
        res.on('data',function(chunk){
            body += chunk;	
        }).on('end',function(){
            sb(body);
        }).on('error',function(data){
            cb(data);
        });


    }).on('error',function(data){
        Homey.log('Error!!');
        Homey.log(data);
    });
    }


    generateOptions(hostname,defaultPath,params){

        var options = {};
        options.host = hostname;
        options.path = defaultPath;
        
        if(this.authHeader != null){
            Homey.log('Add authorization');
            options.headers[this.authHeader.name] = this.authHeader.value;
        }

        for(var i = 0; i < params.length;i++){
            if(i % 2 == 0){
                if(i == 0){
                        options.path = options.path.concat("?");
                }else{
                    options.path = options.path.concat("&");
                }
                
                options.path = options.path.concat(params[i]);
                options.path = options.path.concat("=");
            }else{
                options.path = options.path.concat(encodeURIComponent(params[i]));
            }
        }
        return options;
    }

}

module.exports = HttpApi