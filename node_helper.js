/* Magic Mirror
    * Module: MMM-NOAA
    *
    * By Cowboysdude
    * 
    */
const NodeHelper = require('node_helper');
var request = require('request');
const translate = require('google-translate-api');
const moment = require('moment');
var lat, lon;


module.exports = NodeHelper.create({
	  
    start: function() {
    	console.log("Starting module: " + this.name);
			this.getLatLon();
    },
	
	
    //Subclass socketNotificationReceived received.
    socketNotificationReceived: function(notification, payload) {
    	if(notification === 'CONFIG'){
			this.config = payload;
		} else if (notification === 'GET_NOAA') {
                this.getNOAA(payload);
            } 
         }, 
	
	 imageArray: {
           "200": "tstorms",
            "201": "tstorms",
            "202": "tstorms",
            "230": "tstorms",
			"231": "tstorms",
            "232": "tstorms",
            "233": "tstorms",
            "300": "chancerain",
			"301": "chancerain",
            "302": "chancetstorms",
            "500": "rain",
            "501": "rain",
			"502": "rain",
            "511": "sleet",
			"520": "rain",
            "521": "rain",
			"522": "rain",
            "600": "chancesnow",
            "601": "snow",
            "602": "snow",
			"610": "chancesleet",
            "611": "sleet",
            "612": "sleet",
            "621": "snow",
			"622": "snow",
            "623": "chancesnow",
            "700": "fog",
            "711": "hazy",
			"721": "hazy",
            "731": "hazy",
            "741": "fog",
            "751": "fog",
			"800": "clear",
            "801": "partlycloudy",
            "802": "partlycloudy",
            "803": "partlycloudy",
			"804": "cloudy",
            "900": "na"
        },       

        getLatLon: function() { 
        request({
            url: "http://ip-api.com/json",
            method: 'GET'
        }, (error, response, body) => {
                 info = JSON.parse(body);
                 lat = info.lat;
                 lon = info.lon; 
        });
    },
	
	
    
    
     getNOAA: function(url) {
        request({
            url: "https://api.weatherbit.io/v2.0/forecast/daily?lat="+lat+"&lon="+lon+"&days=4&units=I&key="+this.config.apiKey,
            method: 'GET'
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body);
				var current = result.data[0];
			current = {
                 weather: result.data[0].weather.description,
                 temp_f: Math.round(current.temp),
				 temp_c: Math.round((current.temp - 32) * 5 / 9),
                 icon: this.imageArray[result.data[0].weather.code],
                 relative_humidity: current.rh + "%",
                 pressure_in: Math.round(current.pres*0.02953),
				 pressure_mb:  Math.round(current.pres),
                 UV: Math.round(current.uv),
                 visibility_mi: current.vis,
                 wind_mph: Math.round(current.wind_spd),
				 wind_kph: Math.round(current.wind_spd),
				 		forecast: {
    "0": {fcttext:result.data[0].weather.description,fcttext_metric:result.data[0].weather.description},
    "1": {fcttext:result.data[0].weather.description,fcttext_metric:result.data[0].weather.description}
               }
                   
      };
	   var forecast = [];
        for (var i = 0; i < result.data.length; i++) { 
      
             forecast[i] = result.data[i];
             var now = moment(forecast[i].datetime, "YYYY-MM-DD").format('ddd');
             var newDay = {
                 date: {
                     weekday_short: now
                 }
             };
             forecast[i] = Object.assign(forecast[i], newDay);
             var highF = Math.round(forecast[i].app_max_temp);
             var lowF = Math.round(forecast[i].app_min_temp);

             function toCelsius(f) {
                 return (5 / 9) * (f - 32);
             }
             var highC = Math.round(toCelsius(forecast[i].app_max_temp));
             var lowC = Math.round(toCelsius(forecast[i].app_min_temp));
             var high = {
                 high: {
                     fahrenheit: highF,
                     celsius: highC
                 }
             };
             var low = {
                 low: {
                     fahrenheit: lowF,
                     celsius: lowC
                 }
             };
			let icony = { icon:this.imageArray[forecast[i].weather.code]};

			 forecast[i] = Object.assign(forecast[i], icony);
             forecast[i] = Object.assign(forecast[i], high);
             forecast[i] = Object.assign(forecast[i], low);
        };
	  
         current = {
             current,
             forecast
         }; 
                this.sendSocketNotification('NOAA_RESULT', current);
                this.getSRSS();
                
            }
        });
    },
    
    getSRSS: function(){
     	var self = this;
	 	request({ 
    	    url: "http://api.sunrise-sunset.org/json?lat="+lat+"&lng="+lon+"&formatted=0",
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
    url: "http://api.airvisual.com/v2/nearest_city?lat="+lat+"&lon="+lon+"&rad=100&key="+this.config.airKey,
    	          method: 'GET' 
    	        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                        var airresult = JSON.parse(body);
                        this.sendSocketNotification("AIR_RESULTS", airresult);
                        //this.getAlerts();
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
				if (this.config.lang == "en" && alert != "undefined" || null){
				self.sendSocketNotification("ALERT_RESULTS", alert);
				} else {
				for(var i = 0; i < alert.length; i++) {
					var alerts = alert[i];
					if (alerts != undefined) { 
						if (this.config.lang != 'en') {
							Promise.all([
								translate(alerts.description, {from: 'en', to: this.config.lang})
							]).then(function(results) {
								var desc = results[0].text;
								var level = 2;
								var level = alerts.level_meteoalarm;
 					    	self.sendSocketNotification("ALERT_RESULTS", {desc, level});
		              				})
                	   			}else{
		                  			var desc = alerts.description;
                		  			var level = 2;
							self.sendSocketNotification("ALERT_RESULTS", {desc, level});
						}

					}else{
						    self.sendSocketNotification("ALERT_RESULTS", {desc, level});
					}
				}					
				}
				}     	
	});
   },
 
    });