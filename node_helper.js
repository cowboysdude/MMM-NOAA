/* Magic Mirror
    * Module: MMM-NOAA
    *
    * By Cowboysdude
    * 
    */
const NodeHelper = require('node_helper');
var request = require('request');
const translate = require('google-translate-api');


module.exports = NodeHelper.create({
	  
    start: function() {
    	console.log("Starting module: " + this.name);
    },
    
     getNOAA: function(url) {
        request({
            url: url,
            method: 'GET'
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body);
                var lat;
                lat = result.current_observation.observation_location.latitude;
                lat2 = lat;
                var lon;
                var lon = result.current_observation.observation_location.longitude;
                lon2 = lon;
                this.sendSocketNotification('NOAA_RESULT', result);
                this.getSRSS();
                
            }
        });
    },
    
    getSRSS: function(){
	 	request({ 
    	    url: "http://api.sunrise-sunset.org/json?lat="+lat2+"&lng="+lon2+"&formatted=0",
    	          method: 'GET' 
    	        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                        var srssresult = JSON.parse(body);
                        this.sendSocketNotification("SRSS_RESULTS", srssresult);
                        this.getAir();
            }
       });
    },
  
    getAir: function(){
 	 	request({ 
    	    url: "http://api.airvisual.com/v2/nearest_city?lat="+this.config.lat+"&lon="+this.config.lon+"&rad=100&key="+this.config.airKey,
    	          method: 'GET' 
    	        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                        var airresult = JSON.parse(body);
                        this.sendSocketNotification("AIR_RESULTS", airresult);
                        this.getAlerts();
            }
       });
   },
   
   getAlerts: function(){
	 	request({ 
    	  	  url: "http://api.wunderground.com/api/" + this.config.apiKey + "/alerts/q/pws:" + this.config.pws + ".json",
    	          method: 'GET' 
    	        }, (error, response, body) => {
     		       if (!error && response.statusCode === 200) {
                     	  var alert = JSON.parse(body).alerts;
			  var keys = Object.keys(alert);
			  var alerts = alert[keys];
			  if (alerts != undefined){
				console.log("STEP 1 with " + this.config.lang);
				console.log(alerts.description);
				if (this.config.lang != 'en'){
			    		translate(alerts.description, {to: this.config.lang}).then(res => {console.log(res.text)});
					translate(alerts.expires, {to: this.config.lang}).then(res => {console.log(res.text)});
					translate(alerts.message, {to: this.config.lang}).then(res => {console.log(res.text)});
				}
			  }         
                          this.sendSocketNotification("ALERT_RESULTS", alerts);
			  console.log(alerts);
              }
         });
   },


    //Subclass socketNotificationReceived received.
    socketNotificationReceived: function(notification, payload) {
    	if(notification === 'CONFIG'){
		this.config = payload;
	    } else if (notification === 'GET_NOAA') {
                this.getNOAA(payload);
            } else if (notification === 'GET_SRSS') {
                this.getSRSS(payload);
	    }  else if (notification === 'GET_AIR') {
		this.getAIR(payload);
	    }
         },  
    });
