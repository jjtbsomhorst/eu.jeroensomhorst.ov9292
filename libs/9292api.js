"use strict"
var http = require('http');
var path = require('path');
var HttpApi = require( path.resolve( __dirname, "./httpapi.js" ) );
var utils = require( path.resolve( __dirname, "./utils.js" ) );
const baseurl = "api.9292.nl";
const endpoint_disturbances = "/0.1/messages/disturbances";
const endpoint_locations = "/0.1/locations";
const endpoint_location_departures = "/0.1/locations/__stopid__/departure-times";
const endpoint_journey = "/0.1/journeys";

class ovApi extends HttpApi{

    constructor(language){
        super();
        this.language= language;
    }

    

    getDisturbances(success,error,filterText){
        var params = this.getDefaultParams();
        var path = endpoint_disturbances;
        var options = super.generateOptions(baseurl,path,params);
        super.doGetRequest(function(data){
            var disturbances = JSON.parse(data).disturbances;
            if(filterText != null && filterText != ""){
                disturbances = disturbances.filter(utils.filterDisturbances(filterText),this);
            }
            success(disturbances);
        },function(data){
            error(data);
        },options);

    }


    searchJourney(success,error,from,to,byFerry,bySubway,byTram,byTrain,byBus,searchType,time){
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

        var options = this.generateOptions(baseurl,endpoint_journey,params);
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

    getDepartures(success,error,id,transportype){
        var params = this.getDefaultParams();
        var path = __(endpoint_location_departures,{"stopid":id})
        if(transportype == "train"){
            transportype = "trein";
        }else if(transportype == "bus"){
            transportype = "bus";
        }else if(transportype == "tram"){
            transportype = "tram"
        }else if(transportype == "subway"){
            transportype = "metro";
        }else if(transportype == "ferry"){
            transportype = 'veerboot';
        }


       var options = super.generateOptions(baseurl,path,params);
       Homey.log(JSON.stringify(options));
       super.doGetRequest(function(data){
           Homey.log(transportype);
           var departureData = JSON.parse(data);
            
           departureData.tabs.some(function(value){
               if(value.id == transportype){
                   success(value.departures);
                   return true;
               }
           });
       },function(data){
           error(data);
       },options);
    }

    searchLocationByName(success,error,args){

        var params = this.getDefaultParams();
        Homey.log('Arguments : '+JSON.stringify(args));

        if(args.hasOwnProperty('query')){
            if(args.query.length > 2){
                params.push("q");
                params.push(args.query);        
            }
        }
        if(args.args.hasOwnProperty('type')){
            params.push("type");
                    
            if(args.args.type == "train"){
                args.args.type = "station";
            }else if(args.args.type == "bus"){
                args.args.type = "stop";
            }else if(args.args.type == "tram"){
                args.args.type = "stop"
            }else if(args.args.type == "subway"){
                args.args.type = "stop";
            }else if(args.args.type == "ferry"){
                args.args.type = 'stop';
            }
            params.push(args.args.type);
        }
                
        Homey.log(params);
        var options = super.generateOptions(baseurl,endpoint_locations,params);
        Homey.log(JSON.stringify(options));
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
