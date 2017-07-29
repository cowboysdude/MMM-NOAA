/* Magic Mirror
 * Module: MMM-NOAA
 *
 * By cowboysdude
 * 
 */
Module.register("MMM-NOAA", {

    // Module config defaults.
    defaults: {
        updateInterval: 30 * 60 * 1000, // Every 10 minutes
        //setInterval: 1000,
        animationSpeed: 0,
        //fadeSpeed: 11120, // Fade in
        initialLoadDelay: 875, // Delay
        retryDelay: 1500,
        maxWidth: "100%",
        rotateInterval: 20 * 1000,
        apiKey: "",
        show: "F", // Show F or C Temps
        pws: "KNYELMIR13",
        lat: "42.089796",
        lon: "-76.807734",
        
        langFile: {'en': 'en-US', 
		   'de': 'de-DE',
    	           'sv': 'sv-SE'
    	   },
    },

    // Define required scripts.
    getScripts: function() {
        return ["moment.js"];
    },
    
    getTranslations: function () {
        return {
            en: "translations/en.json",
            sv: "translations/sv.json",
            de: "translations/de.json"
        };
    },

    getStyles: function() {
        return ["MMM-NOAA.css"];
    },

    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name);
        this.config.lang = this.config.lang || config.language;  // Automatically overrides and sets language :)
        this.config.units = this.config.units || config.units;
        this.sendSocketNotification('CONFIG', this.config);

        // Set locale.
        this.url = "http://api.wunderground.com/api/"+this.config.apiKey+"/forecast10day/conditions/q/pws:"+this.config.pws+".json"
        //this.url = "http://api.wunderground.com/api/"+this.config.apiKey+"/forecast10day/conditions/q/"+this.config.place+".json";
        this.forecast = {};
        this.today = "";
        this.activeItem = 0;
        this.rotateInterval = null;
        this.scheduleUpdate();
    },

    processNoaa: function(data) {
        this.current = data.current_observation;
        this.forecast = data.forecast.simpleforecast.forecastday;
        this.loaded = true;
    },
    
    processSRSS: function(data) {
        this.srss = data.results;
        console.log(this.srss);
    },

    scheduleCarousel: function() {
        console.log("Scheduling Weather stuff...");
        this.rotateInterval = setInterval(() => {
            this.activeItem++;
            this.updateDom(this.config.animationSpeed);
        }, this.config.rotateInterval);
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getNOAA();
        }, this.config.updateInterval);
        this.getNOAA(this.config.initialLoadDelay);
    },

    getNOAA: function() {
        this.sendSocketNotification('GET_NOAA', this.url);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "NOAA_RESULT") {
            this.processNoaa(payload);
            if (this.rotateInterval == null) {
                this.scheduleCarousel();
            }
            this.updateDom(this.config.animationSpeed);
        }
        if (notification === "SRSS_RESULTS") {
             this.processSRSS(payload);
        }
    },

    getTime: function(){
    	var format = this.config.format;
    	var location = config.language;
    	var langFile = this.config.langFile;
    	
    var time = new Date();
    if (config.timeFormat === "12"){
	 time = time.toLocaleString(langFile[location], { hour: 'numeric',minute:'numeric', hour12: true });	
	} else if (config.timeFormat === "24") {
	time = time.toLocaleString(langFile[location], { hour: 'numeric',minute:'numeric', hour12: false });	
	} else {
	time = time.toLocaleString('en-US', { hour: 'numeric',minute:'numeric', hour12: true });	//fallback 
	}
    return time;
    },

    getDom: function() {

        console.log(this.config.units);

        var wrapper = document.createElement("div");
        wrapper.classList.add("wrapper");
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.classList.add("wrapper");
            wrapper.innerHTML = this.translate("GATHERING WEATHER STUFF");
            wrapper.className = "bright light small";
            return wrapper;
        }

        var current = this.current;
        console.log(this.current);  

        var d = new Date();
        var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        var month = d.getUTCMonth() + 1; //months from 1-12
        var day = d.getUTCDate();
        var year = d.getUTCFullYear();
        var newdate = this.translate(days[d.getDay()])+ " " +month + "/" + day + "/" + year;
        var n = d.getHours();
        var CurTime = document.createElement("div");
        CurTime.classList.add("medium","fontClock");
        CurTime.innerHTML =  this.getTime();	
        wrapper.appendChild(CurTime);

        var CurDate = document.createElement("div");
        CurDate.classList.add("small","fontClock");
        CurDate.innerHTML =  newdate;	
        wrapper.appendChild(CurDate);

        var crtLogo = document.createElement("div");
        var crtIcon = document.createElement("img");
        crtIcon.classList.add("imgDesInv");
        crtIcon.src = "modules/MMM-NOAA/images/"+current.icon+".png";
        crtLogo.appendChild(crtIcon);
        wrapper.appendChild(crtLogo);

        var curCon = document.createElement("div");
        curCon.classList.add("xsmall", "bright");
        curCon.innerHTML = this.translate("Currently: ")+current.weather;
        wrapper.appendChild(curCon);
        
        var cTempHigh = document.createElement("div");
        cTempHigh.classList.add("xsmall", "bright");
        if (this.config.units != 'metric') {
            if (current.temp_f > 80) {
                cTempHigh.innerHTML = this.translate("Current Temp: ")+ "<font color=red>"+current.temp_f+"&#730;</font>";
            } else {
                cTempHigh.innerHTML = this.translate("Current Temp: ")+current.temp_f+"&#730;";	
            }
        } else {
            if (current.temp_c > 26) {
                cTempHigh.innerHTML = this.translate("Current Temp: ")+ "<font color=red>"+current.temp_c+"&#730;</font>";
            } else {
                cTempHigh.innerHTML = this.translate("Current Temp: ")+current.temp_c+"&#730;";
            }
        }
        wrapper.appendChild(cTempHigh);

        var cpCondition = document.createElement("div");
        cpCondition.classList.add("xsmall", "bright");
        if (current.UV > 0 && current.UV < 3){
            cpCondition.innerHTML = "UV Index: "+current.UV+ " ~ <font color=#ABFBAE>"+this.translate("Safe")+"</font>";
        } else if (current.UV > 2 && current.UV < 6) {
            cpCondition.innerHTML = "UV Index: "+current.UV+ " ~ <font color=#FDF877>"+this.translate("Moderate")+"</font>";
        } else if (current.UV > 5 && current.UV < 8) {
            cpCondition.innerHTML = "UV Index: "+current.UV+ " ~ <font color=#FECA62>"+this.translate("High")+"</font>";
        }  else if (current.UV > 7 && current.UV < 11) {
            cpCondition.innerHTML = "UV Index: "+current.UV+ " ~ <font color=#FE0F0F>"+this.translate("Very High")+"</font>";
        } else if (current.UV >= 11) {
            cpCondition.innerHTML = "UV Index: "+current.UV+ " ~ <font color=#E6E6FA>"+this.translate("Extreme")+"</font>";
        }
        wrapper.appendChild(cpCondition);

        var ccurHumid = document.createElement("div");
        ccurHumid.classList.add("xsmall", "bright");
         ccurHumid.innerHTML = this.translate("Humidity: ")+current.relative_humidity;
        wrapper.appendChild(ccurHumid);

        var wind = document.createElement("div");
        wind.classList.add("xsmall", "bright");
        if (this.config.units != "metric") {
            if (current.wind_mph > 0 ) {
                wind.innerHTML = this.translate("Wind: ")+current.wind_mph+ " mph ~ "+this.translate("From: ")+current.wind_dir;
            } else {
                wind.innerHTML = this.translate("Wind: 0");
            }
        } else {
            if (current.wind_kph > 0 ) {
                wind.innerHTML = this.translate("Wind: ")+current.wind_kph+ " kph ~ "+this.translate("From: ")+current.wind_dir;
            } else {
                wind.innerHTML = this.translate("Wind: 0");
            }
        }
        wrapper.appendChild(wind);

        var bP = document.createElement("div");
        bP.classList.add("xsmall", "bright");
        if (current.pressure_trend === "+") {
            bP.innerHTML = "Barometer: "+current.pressure_in+ " "+" <img src=modules/MMM-NOAA/images/up.png width=5% height=5%>";
        } else if (current.pressure_trend === "-"){
            bP.innerHTML = "Barometer: "+current.pressure_in+ " "+" <img src=modules/MMM-NOAA/images/down.png width=5% height=5%>";
        } else {
            bP.innerHTML = "Barometer: "+current.pressure_in+ " "+" <img src=modules/MMM-NOAA/images/even.png width=5% height=5%>";
        }
        wrapper.appendChild(bP);

        if (this.config.lat != "" && this.config.lon != "") {
            var srss = this.srss
            var sunrise = srss.sunrise;
            var sunset = srss.sunset;
            var utcsunrise = moment.utc(sunrise).toDate();
            var utcsunset = moment.utc(sunset).toDate();
            if (this.config.ampm == true){
	    var sunrise = moment(utcsunrise).local().format('h:mm A');
            var sunset = moment(utcsunset).local().format('h:mm A');	
			} else {
	    var sunrise = moment(utcsunrise).local().format('h:mm');
            var sunset = moment(utcsunset).local().format('h:mm');	
			}
            var Rdate = document.createElement("div");
            if (n < 12) {
                Rdate.classList.add("bright","small", "amclock", "imgDesInv2");
            } else if (n > 12 && n < 21) {
                Rdate.classList.add("bright","small", "eclock", "imgDesInv2");
            } else {
                Rdate.classList.add("bright","small", "pmclock", "imgDesInv2");
            }
            Rdate.innerHTML = "<img src='modules/MMM-NOAA/images/sunrise1.png' width=10%; height=10%;> "+sunrise+ " &nbsp;&nbsp;&nbsp;<img src='modules/MMM-NOAA/images/sunset1.png' width=10%; height=10%;> "+sunset+"<br><br>";
            wrapper.appendChild(Rdate);
        }

        var keys = Object.keys(this.forecast);
        if (keys.length > 0) {
            if (this.activeItem >= keys.length) {
                this.activeItem = 0;
            }
            var noaa = this.forecast[keys[this.activeItem]];
            var sDiv = document.createElement("div");
            sDiv.classList.add("small", "bright");
            sDiv.innerHTML =  this.translate("~~~ Forecast ~~~<br/>");
            wrapper.appendChild(sDiv);

            var newDate = document.createElement("div");
            newDate.classList.add("xsmall", "bright", "font");
            var myDate =   this.translate(noaa.date.weekday)+" "+noaa.date.month+"/"+noaa.date.day+"/"+noaa.date.year;
            newDate.innerHTML =  myDate;
            wrapper.appendChild(newDate);

            var artLogo = document.createElement("div");
            var artIcon = document.createElement("img");
            artIcon.classList.add("imgDesInv");
            artIcon.src = "modules/MMM-NOAA/images/"+noaa.icon+".png";
            artLogo.appendChild(artIcon);
            wrapper.appendChild(artLogo);

            var UpCondition = document.createElement("div");
            UpCondition.classList.add("xsmall", "bright", "font");
            UpCondition.innerHTML = this.translate(noaa.conditions);
            wrapper.appendChild(UpCondition);

            var TempHigh = document.createElement("div");
            TempHigh.classList.add("xsmall", "bright", "font");
            if (this.config.units != "metric") {
                TempHigh.innerHTML = this.translate("High: ")+noaa.high.fahrenheit+"&#730; &nbsp;&nbsp;&nbsp;"+this.translate("Low: ")+noaa.low.fahrenheit+"&#730;";
            } else {
                TempHigh.innerHTML = this.translate("High: ")+noaa.high.celsius+"&#730; &nbsp;&nbsp;&nbsp;"+this.translate("Low: ")+noaa.low.celsius+"&#730;";
            }
            wrapper.appendChild(TempHigh);
            var CurHumid = document.createElement("div");
            CurHumid.classList.add("xsmall", "bright", "font");
            CurHumid.innerHTML = this.translate("Humidity: ")+noaa.avehumidity+"%";
            wrapper.appendChild(CurHumid);
        }
        return wrapper;
    },
});
