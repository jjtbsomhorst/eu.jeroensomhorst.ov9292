"use strict"
var http = require('http');
var path = require('path');
var HttpApi = require( path.resolve( __dirname, "./httpapi.js" ) );

const baseurl = "api.9292.nl";

class ovApi extends HttpApi{

    constructor(language){
        super();
        this.language= language;
    }

    searchJourney(success,error,from,to,byFerry,bySubway,byTram,byTrain,byBus,searchType,time){
        //https://github.com/thomasbrus/9292-api-spec/blob/master/docs/resources/journeys.md
        //http://api.9292.nl/0.1/journeys?before=1&sequence=1&byFerry=true&bySubway=true&byBus=true&byTram=true&byTrain=true&lang=lang&from=from.id&dateTime=yyyy-mm-ddThhmm&searchType=departure&interchangeTime=standard&after=5&to=to.id
        var params = this.getDefaultParams();

        params.push("from");
        params.push(from);

        params.push("to");
        params.push(to);

        params.push("before");
        params.push("1");
        params.push("sequence");
        params.push("1");

        params.push("after")
        params.push("5");

        params.push("byTram");
        params.push(byTram ? "true":"false");

        params.push("bySubway");
        params.push(bySubway ? "true":"false");

        params.push("byTrain");
        params.push(byTrain ? "true":"false");

        params.push("byFerry");
        params.push(byFerry ? "true":"false");

        params.push("byBus");
        params.push(byBus ? "true":"false");

        params.push("searchType");
        params.push(searchType);

        params.push("dateTime");
        params.push(time);

        var options = this.generateOptions(baseurl,"/0.1/journeys",params);
        super.doGetRequest(function(data){
            var response = JSON.parse(data);
            success(response.journeys);
        },
        function(data){
            Homey.log("Error!!");
        },options);

    }

    getDefaultParams(){
        var params = [];
        params.push("lang");
        if(this.language == "nl"){
            params.push("nl-NL");
        }else{
            params.push("en-GB");
        }
        return params;
    }

    getDepartures(success,error,id,type){
        var params = this.getDefaultParams();
        var path = "/0.1/locations/"+id+"/departure-times"

       var options = super.generateOptions(baseurl,path,params);
       super.doGetRequest(function(data){
           Homey.log(data);
           var departureData = JSON.parse(data);
            
           departureData.tabs.some(function(value){
               if(value.id == type){
                   success(value.departures);
                   return true;
               }
           });
       },function(data){
           error(data);
       },options);
    }

    searchLocationByName(success,error,q,types){

        var params = this.getDefaultParams();

        params.push("q");
        params.push(q);
        
        if(types != null && types != ""){
            params.push('type');
            params.push(types);
        }
        
        var options = super.generateOptions(baseurl,"/0.1/locations",params);
        super.doGetRequest(function(data){

            var locationResponse= JSON.parse(data)
            success(locationResponse.locations);
        },function(data){
            Homey.log('Er ging dus iets kapot!!');
        },options);
        
    }

    _init(){
        Homey.log('Initialize OV Api');
    }
}

module.exports = ovApi
