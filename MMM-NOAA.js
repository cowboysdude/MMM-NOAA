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
		rotateInterval: 60 * 1000,
		apiKey: "",
		pws: "KNYELMIR13",
		lat: "42.089796",
		lon: "-76.807734",
		ampm: true,
		dformat: true,
		showClock: true,
		useAir: false,
		airKEY: "",
		showGreet: false,
		name: "",
		showWind: false,
		showDate: false,

		langFile: {
			"en": "en-US",
			"de": "de-DE",
			"sv": "sv-SE",
			"es": "es-ES",
			"fr": "fr-FR",
			"zh_cn": "zh-CN"
		}
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	getTranslations: function() {
		return {
			en: "translations/en.json",
			sv: "translations/sv.json",
			de: "translations/de.json",
			es: "translations/es.json",
			fr: "translations/fr.json",
			zh_cn: "translations/zh_cn.json"
		};
	},

	getStyles: function() {
		return ["MMM-NOAA.css"];
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);
		this.config.lang = this.config.lang || config.language; //automatically overrides and sets language :)
		this.config.units = this.config.units || config.units;
		this.sendSocketNotification("CONFIG", this.config);

		// Set locale.
		this.url = "http://api.wunderground.com/api/" + this.config.apiKey + "/forecast/conditions/q/pws:" + this.config.pws + ".json";
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
	},

	processAIR: function(data) {
		this.air = data.data.current.pollution;
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
		wrapper.classList.add("wrapper");
		wrapper.style.maxWidth = this.config.maxWidth;

		if (!this.loaded) {
			wrapper.classList.add("wrapper");
			wrapper.innerHTML = this.translate("GATHERING WEATHER STUFF");
			wrapper.className = "bright light small";
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
					Greet.classList.add("bright", "medium", "amclock", "imgDesInv2");
					Greet.innerHTML = this.translate("Good Morning ") + this.config.name + "!";
				} else if (n > 12 && n < 18) {
					Greet.classList.add("bright", "medium", "eclock", "imgDesInv2");
					Greet.innerHTML = this.translate("Good Afternoon ") + this.config.name + "!";
				} else if (n > 18 && n < 24) {
					Greet.classList.add("bright", "medium", "pmclock", "imgDesInv2");
					Greet.innerHTML = this.translate("Good Evening ") + this.config.name + "!";
				}
			} else {
				if (n < 12) {
					Greet.classList.add("bright", "medium", "amclock", "imgDesInv2");
					Greet.innerHTML = this.translate("Good Morning!");
				} else if (n > 12 && n < 18) {
					Greet.classList.add("bright", "medium", "eclock", "imgDesInv2");
					Greet.innerHTML = this.translate("Good Afternoon!");
				} else if (n > 18 && n < 24) {
					Greet.classList.add("bright", "medium", "pmclock", "imgDesInv2");
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

		var crtLogo = document.createElement("span");
		crtLogo.classList.add("img");
		crtLogo.innerHTML = "<img class = 'icon2' src='modules/MMM-NOAA/images/" + current.icon + ".png'>";
		wrapper.appendChild(crtLogo);

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
				cTempHigh.innerHTML = "<font size=115%>" + Math.round(current.temp_c) + "&#730;</font>"; //changed font size
			}
		}
		wrapper.appendChild(cTempHigh);


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

		if (this.config.useAir != false) {
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
			ccurHumid.innerHTML = this.translate("Humidity: ") + "<b><font color=#fe5469>" + current.relative_humidity + "</font></b>";
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
				} else {
					wind.innerHTML = this.translate("Wind: 0");
				}
			} else {
				if (current.wind_kph > 0) {
					wind.innerHTML = this.translate("Wind: ") + current.wind_kph + " kph ~ " + this.translate("From: ") + current.wind_dir;
				} else {
					wind.innerHTML = this.translate("Wind: 0");
				}
			}
			wrapper.appendChild(wind);
		}


		var bP = document.createElement("div");
		bP.classList.add("xsmall", "bright");
		if (current.pressure_trend === "+") {
			bP.innerHTML = "Barometer: " + current.pressure_in + " " + " <img src=modules/MMM-NOAA/images/up.png width=5% height=5%>";
		} else if (current.pressure_trend === "-") {
			bP.innerHTML = "Barometer: " + current.pressure_in + " " + "  <img src=modules/MMM-NOAA/images/down.png width=5% height=5%>";
		} else {
			bP.innerHTML = "Barometer: " + current.pressure_in + " " + "  <img src=modules/MMM-NOAA/images/even.png width=5% height=5%>";
		}
		wrapper.appendChild(bP);

		var srss = this.srss;

		var date = new Date(null);
		date.setSeconds(srss.day_length);
		var dayLength = date.toISOString().substr(11, 8);
		var longpieces = dayLength.toString().split(":");
		var dHours = longpieces[0];
		var dMins = longpieces[1];

		var Dlength = document.createElement("div");
		Dlength.classList.add("xsmall", "bright", "font");
		Dlength.innerHTML = this.translate("Amount of <font color=yellow>Daylight</font>");
		wrapper.appendChild(Dlength);

		var Tlength = document.createElement("div");
		Tlength.classList.add("xsmall", "bright");
		Tlength.innerHTML = dHours + " " + this.translate(" hours ") + " " + dMins + " " + this.translate(" minutes ") + "<br>";
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
				Rdate.classList.add("bright", "small", "amclock", "imgDesInv2");
			} else if (n > 12 && n < 21) {
				Rdate.classList.add("bright", "small", "eclock", "imgDesInv2");
			} else {
				Rdate.classList.add("bright", "small", "pmclock", "imgDesInv2");
			}
			Rdate.innerHTML = "<img class = srss src='modules/MMM-NOAA/images/sunrise1.png'> " + sunrise + " &nbsp;&nbsp;&nbsp;<img class = srss src='modules/MMM-NOAA/images/sunset1.png'> " + sunset + "<br><br>";
			wrapper.appendChild(Rdate);
		}

		console.log(this.forecast);

		for (i = 0; i < this.forecast.length; i++) {
			var noaa = this.forecast[i];

			var tdDiv = document.createElement("div");
			tdDiv.classList.add("tdh");

			var td1 = document.createElement("span");
			td1.classList.add("xsmall", "bright", "span");
			td1.innerHTML = this.translate(noaa.date.weekday_short);
			tdDiv.appendChild(td1);

			var td2 = document.createElement("span");
			td2.innerHTML = "<img class='icon' src='modules/MMM-NOAA/images/" + noaa.icon + ".png'>&nbsp;&nbsp;";
			tdDiv.appendChild(td2);


			var td3 = document.createElement("span");
			td3.classList.add("xsmall", "bright", "span", "row");
			td3.innerHTML = noaa.pop + "%";
			tdDiv.appendChild(td3);

			var td4 = document.createElement("span");
			td4.classList.add("xsmall", "bright", "span");
			if (this.config.units != "metric") {
				td4.innerHTML = "<b><font color=#FD0E35>&uarr;</font></b>"+ noaa.high.fahrenheit + "&#730; &nbsp;" + "<font color=#2E9AFE><b>&darr;</b></font> " + noaa.low.fahrenheit + "&#730;";
			} else {
				td4.innerHTML = "<b><font color=#FD0E35>&uarr;</font></b>" + noaa.high.celsius + "&#730; &nbsp;" + "<font color=#2E9AFE><b>&darr;</b></font> " + noaa.low.celsius + "&#730;";
			}
			tdDiv.appendChild(td4);


			var td5 = document.createElement("span");
			td5.classList.add("xsmall", "bright", "span");
			td5.innerHTML = this.translate("Humidity: ") + noaa.avehumidity + "%";
			tdDiv.appendChild(td5);


			wrapper.appendChild(tdDiv);
		}
		return wrapper;
	},
});
