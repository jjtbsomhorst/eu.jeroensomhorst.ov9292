"use strict"

class Utils{

    static filterDisturbances(term){
        Homey.log("Filter disturbances on "+term);
        return function(element){
            var searchTerm = term.toLowerCase();
            var title = element.title != null ? element.title.toLowerCase(): "";
            var operatorAdvice = element.operatorAdvice != null ? element.operatorAdvice.toLowerCase(): "";

            if(title.indexOf(searchTerm) >= 0){
                return true;
            }
            if(operatorAdvice.indexOf(searchTerm) >= 0){
                return true;
            }

            if(Utils.findTerminLines(element,searchTerm)){
                return true;
            }

            if(Utils.findTermInCluster(element,searchTerm)){
                return true;
            }

            if(Utils.findTermInClusterRange(element,searchTerm)){
                return true;
            }


            return false;
        }
    }

    static findTerminLines(element,term){
        var returnValue = false;
        element.lines.forEach(function(value){
            var name = value.name != null ? value.name : "";
            if(name.indexOf(term) >= 0){
                returnValue = true;
            }
            value.destinationNames.forEach(function(destination){
                if(destination.toLowerCase().indexOf(term) >= 0){
                    returnValue = true;
                }
            });
        });
        return returnValue;
    }

    static findTermInCluster(element,term){
        var returnValue = false;
        element.clusters.forEach(function(value){
            var placeName = value.fallbackPlaceName != null ? value.fallbackPlaceName.toLowerCase() : "";
            var pointName = value.fallbackPointName != null ? value.fallbackPointName.toLowerCase() : "";
            if(placeName.indexOf(term) >= 0 || pointName.indexOf(term) >= 0){
                returnValue = true;
            }
        });
        return returnValue;
    }

    static findTermInClusterRange(element,term){
        var returnValue = false;
        element.clusterRanges.forEach(function(value){
            var startPlaceName = value.start.fallbackPlaceName != null ? value.start.fallbackPlaceName.toLowerCase() : "";
            var startPointName = value.start.fallbackPointName != null ? value.start.fallbackPointName.toLowerCase() : "";

            var endPlaceName = value.end.fallbackPlaceName != null ? value.end.fallbackPlaceName.toLowerCase() : "";
            var endPointName = value.end.fallbackPointName != null ? value.end.fallbackPointName.toLowerCase() : "";

            if(endPlaceName.indexOf(term)>=0 || endPointName.indexOf(term)>=0){
                returnValue = true;
            }
        });
        return returnValue;
    }
}

module.exports = Utils