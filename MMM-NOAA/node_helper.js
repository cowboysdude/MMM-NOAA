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
     	var self = this;
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
     	var self = this;
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
   
   getAlerts: function() {
	var self = this;
	request({
		url: "http://api.wunderground.com/api/" + this.config.apiKey + "/alerts/q/pws:" + this.config.pws + ".json",
		method: 'GET'
		}, (error, response, body) => {
			if (!error && response.statusCode === 200) {
				var alert = JSON.parse(body).alerts;
				for(var i = 0; i < alert.length; i++) {
					var alerts = alert[i];
					if (alerts != undefined) { 
						console.log("Alert(" + i + ") found ....");
						if (this.config.lang != 'en') {
							console.log("in Translate");
							Promise.all([
								translate(alerts.description, {from: 'en', to: this.config.lang})
							]).then(function(results) {
								var desc = results[0].text;
								var level = alerts.level_meteoalarm;
 					    	        	self.sendSocketNotification("ALERT_RESULTS", {desc, level});
		              				})
                	   			}else{
		                  			var desc = alerts.description;
                		  			var level = alerts.level_meteoalarm;
							self.sendSocketNotification("ALERT_RESULTS", {desc, level});
						}

					}else{
						self.sendSocketNotification("ALERT_RESULTS", {desc, level});
					}
				}
			}     	
	});
   },

    //Subclass socketNotificationReceived received.
    socketNotificationReceived: function(notification, payload) {
    	if(notification === 'CONFIG'){
			this.config = payload;
		} else if (notification === 'GET_NOAA') {
                this.getNOAA(payload);
            } 
         },  
    });
