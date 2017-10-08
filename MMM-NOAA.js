/* Magic Mirror
 * Module: MMM-NOAA
 * By cowboysdude and snille 
        modified by barnosch
 */
Module.register("MMM-NOAA", {

    // Module config defaults.
    defaults: {
        updateInterval: 30 * 60 * 1000, // every 10 minutes
        animationSpeed: 3650,
        initialLoadDelay: 875, //  delay
        retryDelay: 1500,
        maxWidth: "100%",
        apiKey: "",
        pws: "KNYELMIR13",
        ampm: true,
        dformat: true,
        showClock: true,
        useAir: false,
        airKEY: "",
        showGreet: false,
        name: "",
        showWind: false,
        showDate: false,
        showForecast: true,
        flash: false,

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
            "nb": "NB",
        }
    },

    // Define required scripts.
    getScripts: function() {
        return ["moment.js"];
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
            nb: "translations/nb.json"
        };
    },

    getStyles: function() {
        return ["MMM-NOAA.css", "weather-icons.css", "font-awesome.css"];
    },

    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name);
        this.config.lang = this.config.lang || config.language; //automatically overrides and sets language :)
        this.config.units = this.config.units || config.units;
        this.sendSocketNotification("CONFIG", this.config);

        // Set locale.  
        var lang = this.config.langTrans[config.language];
        this.url = "http://api.wunderground.com/api/" + this.config.apiKey + "/forecast/lang:" + lang + "/conditions/q/pws:" + this.config.pws + ".json";

        this.forecast = {};
        this.air = {};
        this.srss = {};
        this.alert = [];
        this.today = "";
        this.scheduleUpdate();
    },

    processNoaa: function(data) {
        this.current = data.current_observation;
        this.forecast = data.forecast.simpleforecast.forecastday;
        this.loaded = true;
    },

    processSRSS: function(data) {
        this.srss = data.results;
    },

    processAIR: function(data) {
        this.air = data.data.current.pollution;
    },

    processAlert: function(data) {
        this.alert = data;
    },

    secondsToString: function(seconds) {
        var srss = this.srss.day_length;
        var numhours = Math.floor((srss % 86400) / 3600);
        var numminutes = Math.floor(((srss % 86400) % 3600) / 60);
        return numhours + this.translate(" hours ") + numminutes + this.translate(" minutes ");
    },


    scheduleUpdate: function() {
        setInterval(() => {
            this.getNOAA();
        }, this.config.updateInterval);
        this.getNOAA(this.config.initialLoadDelay);
    },

    getNOAA: function() {
        this.sendSocketNotification("GET_NOAA", this.url);
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
        this.updateDom(this.config.animationSpeed);
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

    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.classList.add("small", "bright");
            wrapper.innerHTML = this.translate("GATHERING WEATHER STUFF");
            return wrapper;
        }

        var current = this.current;

        var d = new Date();
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var month = d.getUTCMonth() + 1; //months from 1-12
        var day = d.getUTCDate();
        var year = d.getUTCFullYear();
        if (this.config.dformat == true) {
            var newdatea = this.translate(days[d.getDay()]) + " " + month + "/" + day + "/" + year;
        } else {
            var newdatea = this.translate(days[d.getDay()]) + " " + day + "/" + month + "/" + year;
        }
        var n = d.getHours();


        if (this.config.showClock == true) {
            var CurTime = document.createElement("div");
            CurTime.classList.add("large", "fontClock");
            CurTime.innerHTML = this.getTime();
            wrapper.appendChild(CurTime);
        }

        if (this.config.showGreet == true) {
            var Greet = document.createElement("div");
            if (this.config.name != "") {
                if (n < 12) {
                    Greet.classList.add("bright", "medium", "amclock");
                    Greet.innerHTML = this.translate("Good Morning ") + this.config.name + "!";
                } else if (n > 12 && n < 18) {
                    Greet.classList.add("bright", "medium", "eclock");
                    Greet.innerHTML = this.translate("Good Afternoon ") + this.config.name + "!";
                } else if (n > 18 && n < 24) {
                    Greet.classList.add("bright", "medium", "pmclock");
                    Greet.innerHTML = this.translate("Good Evening ") + this.config.name + "!";
                }
            } else {
                if (n < 12) {
                    Greet.classList.add("bright", "medium", "amclock");
                    Greet.innerHTML = this.translate("Good Morning!");
                } else if (n > 12 && n < 18) {
                    Greet.classList.add("bright", "medium", "eclock");
                    Greet.innerHTML = this.translate("Good Afternoon!");
                } else if (n > 18 && n < 24) {
                    Greet.classList.add("bright", "medium", "pmclock");
                    Greet.innerHTML = this.translate("Good Evening!");
                }
            }
            wrapper.appendChild(Greet);
        }

        if (this.config.showDate != false) {
            var CurDate = document.createElement("div");
            CurDate.classList.add("medium", "fontClock");
            CurDate.innerHTML = newdatea;
            wrapper.appendChild(CurDate);
        }

        var wDiv = document.createElement("div");
        wDiv.classList.add("wDiv");

        var crtLogo = document.createElement("span");
        crtLogo.classList.add("img");
        if (current.icon != "") {
            crtLogo.innerHTML = "<img class = 'icon2' src='modules/MMM-NOAA/images/" + current.icon + ".png'>";
        } else {
            crtLogo.innerHTML = "<img class = 'icon2' src='modules/MMM-NOAA/images/spacer.png'>";
        }
        wDiv.appendChild(crtLogo);
        wrapper.appendChild(wDiv);


        var cTempHigh = document.createElement("span");
        cTempHigh.classList.add("bright", "wFont");
        if (this.config.units != "metric") {
            if (current.temp_f > 80) {
                cTempHigh.innerHTML = "&nbsp;&nbsp;" + Math.round(current.temp_f) + "&#730;</font>";
            } else {
                cTempHigh.innerHTML = "&nbsp;&nbsp;" + Math.round(current.temp_f) + "&#730;";
            }
        } else {
            if (current.temp_c > 26) {
                cTempHigh.innerHTML = "<font color=#7dfafd>" + Math.round(current.temp_c) + "&#730;</font>";
            } else {
                cTempHigh.innerHTML = Math.round(current.temp_c) + "&#730;";
            }
        }
        wDiv.appendChild(cTempHigh);
        wrapper.appendChild(wDiv);


        var curCon = document.createElement("div");
        curCon.classList.add("xsmall", "bright");
        curCon.innerHTML = this.translate("Currently: ") + current.weather;
        wrapper.appendChild(curCon);


        var cpCondition = document.createElement("div");
        cpCondition.classList.add("xsmall", "bright");
        if (current.UV >= 0 && current.UV < 3) {
            cpCondition.innerHTML = this.translate("UV Index: ") + current.UV + " ~ <font color=#66FF00>" + this.translate("Safe") + "</font>";
        } else if (current.UV > 2 && current.UV < 6) {
            cpCondition.innerHTML = this.translate("UV Index: ") + current.UV + " ~ <font color=#f2f735>" + this.translate("Moderate") + "</font>";
        } else if (current.UV > 5 && current.UV < 8) {
            cpCondition.innerHTML = this.translate("UV Index: ") + current.UV + " ~ <font color=#f5700c>" + this.translate("High") + "</font>";
        } else if (current.UV > 7 && current.UV < 11) {
            cpCondition.innerHTML = this.translate("UV Index: ") + current.UV + " ~ <font color=#ff1313>" + this.translate("Very High") + "</font>";
        } else if (current.UV >= 11) {
            cpCondition.innerHTML = this.translate("UV Index: ") + current.UV + " ~ <font color=#E6E6FA>" + this.translate("Extreme") + "</font>";
        }
        wrapper.appendChild(cpCondition);

        if (this.config.useAir != false || this.air.aqius != 'undefined' || null) {
            var aqius = this.air.aqius;
            var aqi = document.createElement("div");
            aqi.classList.add("xsmall", "bright");
            if (aqius < 51) {
                aqi.innerHTML = this.translate("Air Quality Index: ") + "<font color=#66FF00>" + aqius + "</font>";
            } else if (aqius > 50 && aqius < 101) {
                aqi.innerHTML = this.translate("Air Quality Index: ") + "<font color=#f2f735>" + aqius + "</font>";
            } else if (aqius > 100 && aqius < 151) {
                aqi.innerHTML = this.translate("Air Quality Index: ") + "<font color=#f5700c>" + aqius + "</font>";
            } else if (aqius > 150 && aqius < 201) {
                aqi.innerHTML = this.translate("Air Quality Index: ") + "<font color=#ff1313>" + aqius + "</font>";
            } else {
                aqi.innerHTML = this.translate("Air Quality Index: ") + "<font color=#800000>" + aqius + "</font>";
            }
            wrapper.appendChild(aqi);
        }


        var reHumid = current.relative_humidity.substring(0, 2);
        var ccurHumid = document.createElement("div");
        ccurHumid.classList.add("xsmall", "bright");
        if (reHumid > 80) {
            ccurHumid.innerHTML = this.translate("Humidity: ") + "<b><font color=#ffb7c0>" + current.relative_humidity + "</font></b>";
        } else {
            ccurHumid.innerHTML = this.translate("Humidity: ") + current.relative_humidity;
        }
        wrapper.appendChild(ccurHumid);

        if (this.config.showWind != false) {
            var wind = document.createElement("div");
            wind.classList.add("xsmall", "bright");
            if (this.config.units != "metric") {

                if (current.wind_mph > 0) {
                    wind.innerHTML = this.translate("Wind: ") + current.wind_mph + " mph ~ " + this.translate("From: ") + current.wind_dir;
                }
            } else {
                if (current.wind_kph > 0) {
                    wind.innerHTML = this.translate("Wind: ") + current.wind_kph + " kph ~ " + this.translate("From: ") + current.wind_dir;
                }
            }
            wrapper.appendChild(wind);
        }


        var bP = document.createElement("div");
        bP.classList.add("xsmall", "bright");
        if (this.config.units == "imperial") {
            if (current.pressure_trend === "+") {
                bP.innerHTML = this.translate("Barometer: ") + current.pressure_in + " " + " <img class = img src=modules/MMM-NOAA/images/up.png width=5% height=5%>";
            } else if (current.pressure_trend === "-") {
                bP.innerHTML = this.translate("Barometer: ") + current.pressure_in + " " + "  <img class = img src=modules/MMM-NOAA/images/down.png width=5% height=5%>";
            } else {
                bP.innerHTML = this.translate("Barometer: ") + current.pressure_in + " " + "  <img class = img src=modules/MMM-NOAA/images/even.png width=5% height=5%>";
            }
        } else {
            if (current.pressure_trend === "+") {
                bP.innerHTML = this.translate("hPa: ") + current.pressure_mb + " " + " <img class = img src=modules/MMM-NOAA/images/up.png width=5% height=5%>";
            } else if (current.pressure_trend === "-") {
                bP.innerHTML = this.translate("hPa: ") + current.pressure_mb + " " + "  <img class = img src=modules/MMM-NOAA/images/down.png width=5% height=5%>";
            } else {
                bP.innerHTML = this.translate("hPa: ") + current.pressure_mb + " " + "  <img class = img src=modules/MMM-NOAA/images/even.png width=5% height=5%>";
            }

        }
        wrapper.appendChild(bP);

        var srss = this.srss;

        var Dlength = document.createElement("div");
        Dlength.classList.add("xsmall", "bright", "font");
        Dlength.innerHTML = this.translate("Amount of Daylight");
        wrapper.appendChild(Dlength);

        var Tlength = document.createElement("div");
        Tlength.classList.add("xsmall", "bright");
        Tlength.innerHTML = this.secondsToString();
        wrapper.appendChild(Tlength);



        if (this.config.lat != "" && this.config.lon != "") {
            var sunrise = srss.sunrise;
            var sunset = srss.sunset;
            var utcsunrise = moment.utc(sunrise).toDate();
            var utcsunset = moment.utc(sunset).toDate();
            var sunrise = this.config.ampm == true ? moment(utcsunrise).local().format("h:mm A") : moment(utcsunrise).local().format("H:mm");
            var sunset = this.config.ampm == true ? moment(utcsunset).local().format("h:mm A") : moment(utcsunset).local().format("H:mm");


            var Rdate = document.createElement("div");
            if (n < 12) {
                Rdate.classList.add("bright", "xsmall", "amclock");
            } else if (n > 12 && n < 21) {
                Rdate.classList.add("bright", "xsmall", "eclock");
            } else {
                Rdate.classList.add("bright", "xsmall", "pmclock");
            }
            Rdate.innerHTML = "<img class = srss src='modules/MMM-NOAA/images/sunrise1.png'> " + sunrise + " &nbsp;&nbsp;&nbsp;<img class = srss src='modules/MMM-NOAA/images/sunset1.png'> " + sunset + "<br><br>";
            wrapper.appendChild(Rdate);
        }

        if (this.config.showForecast != false) {
            var top = document.createElement("div");
            //top.classList.add("imgs","text");

            var weatherTable = document.createElement("table");
            //weatherTable.classList.add("text");

            var forecastRow = document.createElement("tr");

            var first = document.createElement("th");
            var tempSymbol = document.createElement("i");
            first.appendChild(tempSymbol);
            forecastRow.appendChild(first);

            var spacer = document.createElement("th");
            forecastRow.appendChild(spacer);

            if (current.temp_f > 32) {
                var second = document.createElement("th");
                var tempSymbol = document.createElement("i");
                tempSymbol.classList.add("wi", "wi-umbrella");
                second.appendChild(tempSymbol);
                forecastRow.appendChild(second);
            } else {
                var second = document.createElement("th");
                var tempSymbol = document.createElement("i");
                tempSymbol.classList.add("wi", "wi-snowflake-cold");
                second.appendChild(tempSymbol);
                forecastRow.appendChild(second);
            }

            var third = document.createElement("th");
            var currentHSymbol = document.createElement("i");
            currentHSymbol.classList.add("wi", "wi-thermometer");
            third.appendChild(currentHSymbol);
            forecastRow.appendChild(third);

            var fourth = document.createElement("th");
            var currentWindSymbol = document.createElement("i");
            currentWindSymbol.classList.add("wi", "wi-thermometer-exterior");
            fourth.appendChild(currentWindSymbol);
            forecastRow.appendChild(fourth);

            var fifth = document.createElement("th");
            var currentWSymbol = document.createElement("i");
            currentWSymbol.classList.add("wi", "wi-humidity");
            fifth.appendChild(currentWSymbol);
            forecastRow.appendChild(fifth);

            weatherTable.appendChild(forecastRow);

            for (i = 0; i < this.forecast.length; i++) {
                var noaa = this.forecast[i];

                var TDrow = document.createElement("tr");
                TDrow.classList.add("xsmall", "bright");
                TDrow.setAttribute('style', 'line-height: 30%;');

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

                 var td1 = document.createElement("td");
                if (noaa.date.weekday_short == n) {
                    td1.innerHTML = this.translate("Today");
                    if (this.config.flash != false){
		td1.classList.add("pulse");	
		}
                } else {
                    td1.innerHTML = this.translate(noaa.date.weekday_short);
                }
                TDrow.appendChild(td1);
                weatherTable.appendChild(TDrow);

                var td2 = document.createElement("td");
                td2.innerHTML = "<img src='modules/MMM-NOAA/images/" + noaa.icon + ".png' height='22' width='28'>&nbsp;&nbsp;";
                TDrow.appendChild(td2);
                weatherTable.appendChild(TDrow);

                var td3 = document.createElement("td");
                //td3.classList.add("small","bright");
                td3.innerHTML = noaa.pop + "%";
                TDrow.appendChild(td3);
                weatherTable.appendChild(TDrow);

                var td5 = document.createElement("td");
                //td5.classList.add("xsmall", "bright");
                if (this.config.units != "metric") {
                    td5.innerHTML = noaa.high.fahrenheit + "&#730;";
                } else {
                    td5.innerHTML = noaa.high.celsius + "&#730;";
                }
                TDrow.appendChild(td5);
                weatherTable.appendChild(TDrow);

                var td7 = document.createElement("td");
                if (this.config.units != "metric") {
                    td7.innerHTML = noaa.low.fahrenheit + "&#730;";
                } else {
                    td7.innerHTML = noaa.low.celsius + "&#730;";
                }
                TDrow.appendChild(td7);
                weatherTable.appendChild(TDrow);

                var td6 = document.createElement("td");
                //td6.classList.add("xsmall", "bright");
                td6.innerHTML = noaa.avehumidity + "%";
                TDrow.appendChild(td6);
                weatherTable.appendChild(TDrow);

                top.appendChild(weatherTable);
                wrapper.appendChild(top);
            }
        }


        var alert = this.alert[0];

        if (typeof alert !== 'undefined') {
            var all = document.createElement("div");
            all.classList.add("bright", "xsmall", "alert");
            all.innerHTML = "<BR>***ALERT***<br><br>";
            wrapper.appendChild(all);

            var Alert = document.createElement("div");
            Alert.classList.add("bright", "xsmall");
            Alert.innerHTML = alert.description + "<br>";
            wrapper.appendChild(Alert);

            var atext = document.createElement("div");
            atext.classList.add("bright", "xsmall");
            atext.innerHTML = "Expires: " + alert.expires;
            wrapper.appendChild(atext);

            var warn = document.createElement("div");
            warn.classList.add("bright", "xsmall");
            warn.innerHTML = alert.message.split(/\s+/).slice(0, 5).join(" ");
            wrapper.appendChild(warn);
        }


        return wrapper;
    },
});
