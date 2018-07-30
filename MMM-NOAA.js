/* Magic Mirror
 * Module: MMM-NOAA
 * By cowboysdude and tbbear 
        modified by barnosch
 */
var c = 0;
var l = 1;
var loco = "";
"use strict";

Module.register("MMM-NOAA", {

    // Module config defaults.
    defaults: {
        updateInterval: 70 * 60 * 1000, // every 10 minutes
        animationSpeed: 0,
        initialLoadDelay: 8000,
        rotateInterval: 20 * 1000,
        maxWidth: "100%",
        apiKey: "",
        airKey: "",
	loco1: "xxx",
	loco2: "xxx",
	loco3: "xxx",
	pws: "XXX",
	pws1: "xxx",
	pws2: "xxx",
	pws3: "xxx",

	   langFile: {
            "en": "en-US",
            "de": "de-DE",
            "sv": "sv-SE",
            "es": "es-ES",
            "fr": "fr-FR",
            "zh_cn": "zh-CN",
            "da": "da",
            "nl": "nl-NL",
            "nb": "nb-NO"
        },


        langTrans: {
            "en": "EN",
            "de": "DL",
            "sv": "SW",
            "es": "SP",
            "fr": "FR",
            "zh_cn": "CN",
            "da": "DK",
            "nl": "NL",
            "nb": "NO",
	    "he": "HE",
        },

	levelTrans: {
        "1":"green",
		"2":"yellow",
		"3":"orange",
		"4":"red",
	}				

    },

    getTranslations: function() {
        return {
            en: "translations/en.json",
            da: "translations/da.json",
            sv: "translations/sv.json",
            de: "translations/de.json",
            es: "translations/es.json",
            fr: "translations/fr.json",
            zh_cn: "translations/zh_cn.json",
            nl: "translations/nl.json",
            nb: "translations/nb.json",
	    he: "translations/he.json",
        };
    },



    getStyles: function() {
        return ["MMM-NOAA.css", "weather-icons.css"];
    },
    getScripts: function() {
        return ["moment.js"];
    },

    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name);
        this.activeItem = 0;
        this.rotateInterval = null;
        this.updateInterval = null;
        this.config.lang = this.config.lang || config.language; //automatically overrides and sets language :)
        this.config.units = this.config.units || config.units;
        this.sendSocketNotification("CONFIG", this.config);
		this.scheduleUpdate();

        // Set locale.  
        var lang = this.config.langTrans[config.language];
	l = 1;
	loco = this.config.loco1;
	this.config.pws = this.config.pws1; 
        this.forecast = {};
	    this.forecast2 = {};
        this.air = {};
        this.srss = {};
        //this.alert = [];
	    this.amess = [];
        this.map = [];
        this.city = {};
        this.clphase = {};
        this.current = {};
        this.allDay = {};
        this.today = "";
        
    }, 

    processNoaa: function(data) {
	c = 0;
        this.current = data.current;
        this.forecast = data.forecast;
		console.log(this.current, this.forecast);
    },

    processSRSS: function(data) {
        this.srss = data.results;
    },

    processAIR: function(data) {
        this.air = data.data.current.pollution;
    },

  /*  processAlert: function(data) {
	if (this.config.lang == "en"){
		this.alert = data;
	} else {
	this.alert = data;
	this.amess[c] = this.alert;
	c = c + 1;	
	}
    },
	
    */
	
    scheduleCarousel: function() {
        this.rotateInterval = setInterval(() => {
            this.activeItem++;
            this.updateDom(self.config.animationSpeed);
        }, this.config.rotateInterval);
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getNOAA();
        }, this.config.updateInterval);
        this.getNOAA(this.config.initialLoadDelay);
    },

    getNOAA: function() {
        this.sendSocketNotification("GET_NOAA");
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "NOAA_RESULT") {
            this.processNoaa(payload);
        }
        if (notification === "SRSS_RESULTS") {
            this.processSRSS(payload);
        }
        if (notification === "AIR_RESULTS") {
            this.processAIR(payload);
        }
        if (notification === "ALERT_RESULTS") {
            this.processAlert(payload);
        }
        if (notification === "MAP_RESULTS") {
            this.processMap(payload);
        }
        if (this.rotateInterval == null) {
                this.scheduleCarousel();
        }
        this.updateDom(this.config.animationSpeed);
    },

    /////  Add this function to the modules you want to control with voice //////

    notificationReceived: function(notification, payload) {
        if (notification === 'HIDE_NOAA') {
            this.hide(100);
            this.updateDom(300);
        } else if (notification === 'SHOW_NOAA') {
            this.show(100);
            this.updateDom(300);
        }  else if (notification === 'NEXT_NOAA') {
            this.doact();
	}
    },

    getTime: function() {
        var format = config.timeFormat;
        var location = config.language;
        var langFile = this.config.langFile;

        var time = new Date();
        if (format === 12) {
            time = time.toLocaleString(langFile[location], {
                hour: "numeric",
                minute: "numeric",
                hour12: true
            });
        } else {
            time = time.toLocaleString(langFile[location], {
                hour: "numeric",
                minute: "numeric",
                hour12: false
            });
        }
        return time;
    },

    secondsToString: function(seconds) {
        var srss = this.srss.day_length;
        var numhours = Math.floor((srss % 86400) / 3600);
        var numminutes = Math.floor(((srss % 86400) % 3600) / 60);
        if (numminutes > 0) {
            return numhours + ":" + numminutes;
        } else {
            return numhours + this.translate(" hours ");
        }
    },

    doact: function() {
		l = l + 1;
		if (l == 4) {l = 1};
		var lang = this.config.langTrans[config.language];

		switch (l) {
		case 1:
			loco = this.config.loco1;
			this.config.pws = this.config.pws1;
			break;
		case 2:
			loco = this.config.loco2;
			this.config.pws = this.config.pws2;
			break;
		case 3:
			loco = this.config.loco3;
			this.config.pws = this.config.pws3;
			break;
		}
		this.url = "http://api.wunderground.com/api/" + this.config.apiKey + "/forecast/lang:" + lang + "/conditions/q/pws:" + this.config.pws + ".json";
	    this.sendSocketNotification("CONFIG", this.config);
		this.getNOAA();
		this.updateDom(700);	
	},
	
		secondsToString: function(seconds) {
	    var seconds = this.srss.day_length;
		
		var date = new Date(seconds * 1000);
		var hh = date.getUTCHours();
		var mm = date.getUTCMinutes();
		var ss = date.getSeconds();
		if (hh < 10) {hh = "0"+hh;}
		if (mm < 10) {mm = "0"+mm;}
		if (ss < 10) {ss = "0"+ss;}
		var t = hh+":"+mm;
		  return t;
		    },

    getDom: function() {


        var wrapper = document.createElement("div");

	if (this.config.pws2 != "xxx"){
		var loc = document.createElement("div");
		loc.innerHTML = loco;
		loc.style.cursor = "pointer";
		loc.className = "button";
		loc.addEventListener("click", () => this.doact());
		wrapper.appendChild(loc);
	}

        var current = this.current;

        var d = new Date();
        var n = d.getHours();

        var curCon = document.createElement("div");
        curCon.classList.add("small", "bright", "img");
        curCon.setAttribute('style', 'line-height: 105%;');
    curCon.innerHTML = (n < 18 && n > 6) ? current.weather + "<img class = 'icon2' src='modules/MMM-NOAA/images/" + current.icon + ".png'>" : current.weather + "<img class = 'icon2' src='modules/MMM-NOAA/images/nt_" + current.icon + ".png'>";
        wrapper.appendChild(curCon);

        var cur = document.createElement("div");
        cur.classList.add("large", "bright","tempf");
        cur.setAttribute('style', 'line-height: 5%;');
        cur.setAttribute("style", "padding-bottom:15px;");
	if (config.units != "metric") {
		if (current.temp_f > 80) {
			cur.innerHTML = "<font color=#7dfafd>" + Math.round(current.temp_f) + "&deg;";
		} else {
			cur.innerHTML = Math.round(current.temp_f) + "&deg;";
		}
	} else {
		if (current.temp_c > 26) {
			cur.innerHTML = "<font color=#7dfafd>" + Math.round(current.temp_c) + "&deg;";
		} else {
			cur.innerHTML = Math.round(current.temp_c) + "&deg;";
		}
	}
        wrapper.appendChild(cur);

        var top = document.createElement("div");

        var weatherTable = document.createElement("table");
        weatherTable.classList.add("table");
        
       var xFCRow = document.createElement("tr");
	   var xjumpy = document.createElement("th");
	   xjumpy.setAttribute("colspan", 4);
	   xjumpy.setAttribute("style", "text-align:center");
	   xjumpy.classList.add("forehead");
	   xjumpy.innerHTML = this.translate("Forecast");
	   xFCRow.appendChild(xjumpy);
	   weatherTable.appendChild(xFCRow);
        
       var fRow = document.createElement("tr");
       
        var tt = document.createElement("td");
		tt.classList.add("bright", "xsmall","fmar");
		tt.setAttribute("colspan", 4);
		tt.setAttribute("style", "line-height: 170%;");
		tt.setAttribute("style", "padding-top: 8px");
		
		var allDay = this.current.forecast;
        if (typeof this.current.forecast !== 'undefined'){
		var allDay1 = this.current.forecast[1].fcttext;
		var allDayM1 = this.current.forecast[1].fcttext_metric;
		}
		
		if (this.config.units != "metric") {
	tt.innerHTML = n <= 18 ? "<marquee scrollamount=8 scrolldelay=300><font color=#e3f3f9>Day ~ " + allDay[0].fcttext + "</marquee><br>" 
		: "<marquee scrollamount=8 scrolldelay=300><font color=#e3f3f9>Night ~ " + allDay1 + "</marquee><br>";
		} else {
	tt.innerHTML = n <= 18 ? "<marquee scrollamount=8 scrolldelay=300><font color=#e3f3f9>" + allDay[0].fcttext_metric + "</marquee><br>" 
		: "<marquee scrollamount=8 scrolldelay=300><font color=#e3f3f9>" + allDayM1 + "</marquee><br>";  
		}	
        fRow.appendChild(tt);
        weatherTable.appendChild(fRow);
 
        var hRow = document.createElement("tr");
        var hsecond = document.createElement("th");
        hsecond.setAttribute("colspan", 4);
        hsecond.setAttribute("style", "text-align:center");
        hsecond.classList.add("rheading");
        hsecond.innerHTML = this.translate("Atmospheric Conditions");
        hRow.appendChild(hsecond);
        weatherTable.appendChild(hRow);

        var forecastRow = document.createElement("tr");

        var second = document.createElement("th");
        var tempSymbol = document.createElement("i");
        tempSymbol.classList.add("wi", "wi-humidity", "font", "fontac");
        second.appendChild(tempSymbol);
        forecastRow.appendChild(second);

        var third = document.createElement("th");
        var currentHSymbol = document.createElement("i");
        currentHSymbol.classList.add("wi", "wi-barometer", "font", "fontac");
        third.appendChild(currentHSymbol);
        forecastRow.appendChild(third);

        var fourth = document.createElement("th");
        var currentWindSymbol = document.createElement("i");
        currentWindSymbol.classList.add("wi", "wi-day-fog", "font", "fontac");
        fourth.appendChild(currentWindSymbol);
        forecastRow.appendChild(fourth);

        weatherTable.appendChild(forecastRow);

        var TDrow = document.createElement("tr");
        TDrow.classList.add("xsmall", "bright");

        var td2 = document.createElement("td");
        td2.innerHTML = current.relative_humidity;
        TDrow.appendChild(td2);
        weatherTable.appendChild(TDrow);

        var td3 = document.createElement("td");
	if (config.units != "metric") {
        td3.innerHTML = current.pressure_in;
    	} else {
		td3.innerHTML = current.pressure_mb + " ~ hPa";
	     }
        TDrow.appendChild(td3);
        weatherTable.appendChild(TDrow);

        var td5 = document.createElement("td");
        td5.innerHTML = current.visibility_mi;
        TDrow.appendChild(td5);
        weatherTable.appendChild(TDrow);

        top.appendChild(weatherTable);
        wrapper.appendChild(top);

        var SSRow = document.createElement("tr");
        var jumpy = document.createElement("th");
        jumpy.setAttribute("colspan", 4);
        jumpy.classList.add("rheading");
        jumpy.innerHTML = this.translate("Sunrise/Sunset");
        SSRow.appendChild(jumpy);
        weatherTable.appendChild(SSRow);

        var midRow = document.createElement("tr");

        var sunup = document.createElement("th");
        var SUSymbol = document.createElement("i");
        SUSymbol.classList.add("wi", "wi-sunrise", "font", "fontss");
        sunup.appendChild(SUSymbol);
        midRow.appendChild(sunup);


        var dayHour = document.createElement("th");
        dayHour.classList.add("xsmall", "bright", "fontss");
        dayHour.innerHTML = this.translate("Hours of Light");
        midRow.appendChild(dayHour);

        var sunDown = document.createElement("th");
        var SDSymbol = document.createElement("i");
        SDSymbol.classList.add("wi", "wi-sunset", "font", "fontss");
        sunDown.appendChild(SDSymbol);
        midRow.appendChild(sunDown);

        weatherTable.appendChild(midRow);

        var srss = this.srss;
        var sunrise = srss.sunrise;
        var sunset = srss.sunset;
        var utcsunrise = moment.utc(sunrise).toDate();
        var utcsunset = moment.utc(sunset).toDate();
	var sunrise = config.timeFormat == 12 ? moment(utcsunrise).local().format("h:mm A") : moment(utcsunrise).local().format("HH:mm");
	var sunset = config.timeFormat == 12 ? moment(utcsunset).local().format("h:mm A") : moment(utcsunset).local().format("HH:mm");

        var Midrow = document.createElement("tr");
        Midrow.classList.add("xsmall", "bright");
        Midrow.setAttribute('style', 'line-height: 30%;');

        var SU = document.createElement("td");
        SU.innerHTML = sunrise;
        Midrow.appendChild(SU);
        weatherTable.appendChild(Midrow);

        var DL = document.createElement("td");
        DL.innerHTML = this.secondsToString();
        Midrow.appendChild(DL);
        weatherTable.appendChild(Midrow);

        var SD = document.createElement("td");
        SD.innerHTML = sunset;
        Midrow.appendChild(SD);
        weatherTable.appendChild(Midrow);

        weatherTable.appendChild(Midrow);

        var CRow = document.createElement("tr");
        var ccolumn = document.createElement("th");
        ccolumn.setAttribute("colspan", 4);
        ccolumn.classList.add("rheading");
        ccolumn.innerHTML = this.translate("AQI/UV/Wind");
        CRow.appendChild(ccolumn);
        weatherTable.appendChild(CRow);

        var otherRow = document.createElement("tr");

        var airq = document.createElement("th");
        var aqSymbol = document.createElement("i");
        aqSymbol.classList.add("wi", "wi-smoke", "font", "fontauw");
        airq.appendChild(aqSymbol);
        otherRow.appendChild(airq);

        
        var time = new Date();
        var g = time.getHours();
        var m = time.getMinutes();
        var fun = g+":"+m;
        var done = moment(fun, ["h:mm A"]).format("HH:mm"); 
	var str1 = moment(sunrise, ["h:mm A"]).format("HH:mm");
	var str2 = moment(sunset, ["h:mm A"]).format("HH:mm");
        
        var uvcol = document.createElement("th");
        var uvSymbol = document.createElement("i");
        if (done >= str1 && done <= str2){
		uvSymbol.classList.add("wi", "wi-day-sunny", "font", "fontauw");	
	} else {
		uvSymbol.innerHTML = "<img class='IMG' src='modules/MMM-NOAA/images/smallmoon.png'>";	
	}
        uvcol.appendChild(uvSymbol);
        otherRow.appendChild(uvcol);

        var windcol = document.createElement("th");
        var currentWindSymbol = document.createElement("i");
        currentWindSymbol.classList.add("wi", "wi-strong-wind", "font", "fontauw");
        windcol.appendChild(currentWindSymbol);
        otherRow.appendChild(windcol);

        weatherTable.appendChild(otherRow);

        var nextRow = document.createElement("tr");
        nextRow.classList.add("xsmall", "bright");

        var aqius = this.air.aqius;
        var aqicol = document.createElement("td");
        aqicol.innerHTML = aqius == undefined ? "N/A" : aqius;	
        nextRow.appendChild(aqicol);
        weatherTable.appendChild(nextRow);

        var uvcol = document.createElement("td");
        uvcol.innerHTML = (done >= str1 && done <= str2) ? current.UV : this.translate("Night");
        nextRow.appendChild(uvcol);
        weatherTable.appendChild(nextRow);

        var wincol = document.createElement("td");
        wincol.innerHTML = current.wind_mph;
        nextRow.appendChild(wincol);
        weatherTable.appendChild(nextRow);

        weatherTable.appendChild(nextRow);
        wrapper.appendChild(weatherTable);

        ////// FORECAST ROWS ///////////////////////////////// 

        var ForecastTable = document.createElement("table");
        ForecastTable.classList.add("table")
        ForecastTable.setAttribute('style', 'line-height: 20%;');


        var FCRow = document.createElement("tr");
        var jumpy = document.createElement("th");
        jumpy.setAttribute("colspan", 4);
        jumpy.classList.add("rheading");
        jumpy.innerHTML = this.translate("4 Day Forecast");
        FCRow.appendChild(jumpy);
        ForecastTable.appendChild(FCRow);

        var d = new Date();
        var weekday = new Array(7);
        weekday[0] = "Sun";
        weekday[1] = "Mon";
        weekday[2] = "Tue";
        weekday[3] = "Wed";
        weekday[4] = "Thu";
        weekday[5] = "Fri";
        weekday[6] = "Sat";

        var n = this.translate(weekday[d.getDay()]);


        var nextRow = document.createElement("tr");
        for (i = 0; i < this.forecast.length; i++) {
            var noaa = this.forecast[i];
            var wdshort = document.createElement("td");
            wdshort.classList.add("xsmall", "bright");
            wdshort.setAttribute("style", "padding:11px");
    wdshort.innerHTML = (this.translate(noaa.date.weekday_short) == n) ? this.translate("Today") : this.translate(noaa.date.weekday_short);
            nextRow.appendChild(wdshort);
            ForecastTable.appendChild(nextRow);
        }

        var foreRow = document.createElement("tr");
        for (i = 0; i < this.forecast.length; i++) {
            var noaa = this.forecast[i];
            var fore = document.createElement("td");

            fore.setAttribute("colspan", "1");
            fore.innerHTML = "<img src='modules/MMM-NOAA/images/" + noaa.icon + ".png' height='22' width='28'>";
            foreRow.appendChild(fore);
            ForecastTable.appendChild(foreRow);
        }

        var tempRow = document.createElement("tr");
        for (i = 0; i < this.forecast.length; i++) {
            var noaa = this.forecast[i];
            var temper = document.createElement("td");
            temper.setAttribute("colspan", "1");
            temper.classList.add("xsmall", "bright");
            temper.innerHTML = (config.units != "metric") ? noaa.high.fahrenheit + "/" + noaa.low.fahrenheit : noaa.high.celsius + "/" + noaa.low.celsius;
            tempRow.appendChild(temper);
            ForecastTable.appendChild(tempRow);

        }

        wrapper.appendChild(ForecastTable);

        //////////////////END FORECAST ROWS///////////////////////
 
 /*  if (this.config.lang == "en" && this.alert.length > 0 ){
  	 var ArrayNumber = this.alert.length;
           
  	  var ATable = document.createElement("table");
	        ATable.classList.add("table")
	        ATable.setAttribute('style', 'line-height: 20%;');
	        var aFCRow = document.createElement("tr");
	        var ajumpy = document.createElement("th");
	        ajumpy.setAttribute("colspan", 4);
	        ajumpy.setAttribute("style", "text-align:center");
	        ajumpy.classList.add("wheading","blink_tr");
			ajumpy.innerHTML = (ArrayNumber > 1) ? this.translate(ArrayNumber +" Weather Warnings") : this.translate("Weather Warning");
	        aFCRow.appendChild(ajumpy);
	        ATable.appendChild(aFCRow);

		 var akeys = Object.keys(this.alert);
			if(akeys.length > 0){
           	if(this.activeItem >= akeys.length){
				this.activeItem = 0;
			}
         var alert = this.alert[akeys[this.activeItem]];
         
			awarn = document.createElement("tr");
			awarn.classList.add("bright", "xsmall");
		    awarn.setAttribute("style", "line-height: 170%;");
	awarn.innerHTML = alert.description +" ~ Expires: " + alert.expires;
			ATable.appendChild(awarn);
		}
		wrapper.appendChild(ATable);
		
  } else {
	var alert = this.amess[0];
  
	if (c != 0){			
			
		var Alert = [];
		var Level = [];
	        var ATable = document.createElement("table");
	        ATable.classList.add("table")
	        ATable.setAttribute('style', 'line-height: 20%;');
	        var aFCRow = document.createElement("tr");
	        var ajumpy = document.createElement("th");
	        ajumpy.setAttribute("colspan", 4);
	        ajumpy.setAttribute("style", "text-align:center");
	        ajumpy.classList.add("wheading","blink_tr");
	        ajumpy.innerHTML = this.translate("Weather Warning");
	        aFCRow.appendChild(ajumpy);
	        ATable.appendChild(aFCRow);
 
		for(var i = 0; i < c; i++){
			 
if (alert.desc != 'undefined'|| undefined){
			var alert = this.amess[i];
			Alert[i] = document.createElement("tr");
			Alert[i].classList.add("bright", "xsmall");
		        Alert[i].setAttribute("style", "line-height: 170%;");
			Alert[i].innerHTML = "<marquee scrollamount="+"20"+" scrolldelay="+"300"+"><font color=" + this.config.levelTrans[alert.level] +">" + alert.desc + "</marquee><br>";
			ATable.appendChild(Alert[i]);
		}
		wrapper.appendChild(ATable);

	}
		
  	
  }	}  */

	if (config.timeFormat == 12) {
	        var doutput = moment().format("MM/DD/YYYY");
        	var tinput = document.lastModified;
	        var toutput = (moment(tinput.substring(10, 16), 'HH:mm').format('hh:mm a'));
	} else {
	        var doutput = moment().format("DD.MM.YYYY");
        	var tinput = document.lastModified;
	        var toutput = (moment(tinput.substring(10, 16), 'HH:mm').format('HH:mm'));
	}
        var mod = document.createElement("div");
        mod.classList.add("xxsmall", "bright");
        mod.setAttribute('style', 'line-height: 170%;');
        mod.innerHTML = "[" + this.translate("Updated") + ": " + doutput + " " + toutput + "]";
        wrapper.appendChild(mod);
        return wrapper;
    }, 
});
