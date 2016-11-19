"use strict"
var path = require('path');
var ovApi = require( path.resolve( __dirname, "./9292api.js" ) );


const moment = require('moment');
const ACTION_find_next_departure = "action.9292_find_next_departure";
const ACTION_FIND_ROUTE = "action.9292_find_route";
const ACTION_REPORT_DISTURBANCES = "action.9292_report_disturbance";
const ACTION_REPORT_DISTURBANCES_FILTERED = "action.9292_disturabance_filtered";
const ARGS_STATIONNAME = "station";

 class flowProcessor{

     constructor(){
         Homey.log("init flowprocessor");
         Homey.manager('flow').on(ACTION_find_next_departure,this.getDepartures.bind(this));
         Homey.manager('flow').on(ACTION_find_next_departure+"."+ARGS_STATIONNAME+".autocomplete",this.onFindStation.bind(this))

 
         Homey.manager('flow').on(ACTION_FIND_ROUTE,this.onActionFindRoute.bind(this));
         Homey.manager('flow').on(ACTION_FIND_ROUTE+".destination.autocomplete",this.onFindStation.bind(this));
         Homey.manager('flow').on(ACTION_FIND_ROUTE+".departure.autocomplete",this.onFindStation.bind(this));
         Homey.manager("flow").on(ACTION_REPORT_DISTURBANCES,this.onReportDisturbance.bind(this));
         Homey.manager("flow").on(ACTION_REPORT_DISTURBANCES_FILTERED,this.onReportDisturbance.bind(this));
         

         this.api = new ovApi(Homey.manager( 'i18n' ).getLanguage());
     }

     onReportDisturbance(cb,args){
         Homey.log('onReportDisturbance called');
         this.api.getDisturbances(function(data){
             Homey.log('Disturbances found');
             data.forEach(function(value){
                Homey.manager('speech-output').say(value.title);
                if(value.hasOwnProperty('operatorAdvice')){
                    if(value.operatorAdvice != null && value.operatorAdvice.length > 255){
                         value.operatorAdvice.split(".").forEach(function(v){
                        Homey.manager('speech-output').say(v);  
                         });  
                    }else{
    	                Homey.manager('speech-output').say(value.operatorAdvice);
                    }
                }
             });
         },function(data){
            Homey.log('kapot');
            cb();
         },args.text);
     }
     onActionFindRoute(cb,args){
       
         this.api.searchJourney(function(data){
             
             var speechOptions = {};
             var label = "no_journeys_found";
             var now = moment();

             var index = data.findIndex(function(element){
                    var mDeparture = moment(element.departure);
                    return mDeparture.isSameOrAfter(now);
                });

            
             if(index > -1){
                
                 speechOptions.destination = args.destination.name;
                 speechOptions.departuretime = data[index].departure.replace("T"," ");
                 speechOptions.departure = args.departure.name;
                 speechOptions.arrivaltime = data[index].arrival.replace("T"," ");
                 label = "first_journey";
             }
            
            Homey.manager('speech-output').say(__(label,speechOptions));


             cb(null,true);
         },function(data){

         },args.departure.id,args.destination.id,true,true,true,true,true,"departure",moment().local().format("YYYY-MM-DDTHHmm"));
         
     }

     getDepartures( callback, args){
         this.api.getDepartures(function(data){
             Homey.log(data);
            var speechOptions = {
                 "type": data[0].mode.type,
                 "number": data[0].service,
                 "time": data[0].time,
                 "destination": data[0].destinationName,
                 "delay": data[0].realtimeText == null ? "" : data[0].realtimeText
             };
             Homey.manager('speech-output').say(__("departure_first",speechOptions));
            
             callback(null,true);
         },function(data){
            callback(null,false);
         },args.station.id,args.type);
         callback(null,true);
     }

     onFindStation(cb,args){
         Homey.log('On Find station autocomplete');
         Homey.log(args);
         var returnValue = [];
         if(args.query == ""){
            cb(null,returnValue);
         }else if(args.query.length > 2){
             this.api.searchLocationByName(function(data){
                var responseData = [];
                 data.forEach(function(value,index,array){
                     var record = {};
                     record.id = value.id;
                     
                     if(value.hasOwnProperty('place')){
                         record.name = value.name+", "+value.place.name;
                         record.description = value.place.regionName;
                     }else{
                         record.name = value.name;
                         record.description = value.regionName;
                     }

                    responseData.push(record);
                 });

                 
                cb(null,responseData);
             },function(data){
                cb(null,[]);
             },args);
         }
         
         
     }

     onTrigger(){

     }

 }


 module.exports = flowProcessor