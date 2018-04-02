This repository is maintained by Cowboysdude and tbbear [SPECIAL THANKS FOR FOR ALL THE HARD WORK!]
[This is the second version of this module for MagicMirror2]

# MMM-NOAA V2.0

**Weather for your mirror**
  Also UV index and Air Quality Index.  [Warning AQI may not work in all areas].

## Examples

![](NOAA.PNG) 

*Automatically adjusts languge and all other settings based on your config.js!

## Your terminal installation instructions

* `git clone https://github.com/cowboysdude/MMM-NOAA` into the `~/MagicMirror/modules` directory.
*  `~MagicMirror/modules/MMM-NOAA`
*  `npm install`

## Get your free API key here [WEATHER, You must also get an AirAPI Key--- see below]

 [https://www.wunderground.com/weather/api](https://www.wunderground.com/weather/api)

* Select the middle plan

## Get your PWS from here


 [https://www.wunderground.com/wundermap](https://www.wunderground.com/wundermap)
 
* For your config.js entry for precise localized weather 

## Get your AirKEY from here

 [https://airvisual.com/api](https://airvisual.com/api)

## Config.js entry and options

Will automatically select translation file and either F or C by reading your defaults from the config.js file [at the top]
Will default to EN if NO translation file is found.  Weather alerts will be in the native language chosen by your config.js automatically and in the correct language!  Thanks tbbear!!!
In this new Version you can select up to 3 different weather locations like in this example. You can also show up names(the one u like) for this places.
U can do the selection of the location my pressing on the city name on touchscreen, with mouse-click or mousepad. 

    {
        module: 'MMM-NOAA',
        config: {

		apiKey: "YOUR API KEY",    // https://www.wunderground.com/weather/api  select the middle plan... 
		airKey: "YOUR API KEY",    // IF you want Air Quality Index
		pws1: "KNYELMIR13",	   // go here to find your pws: https://www.wunderground.com/wundermap
		pws2: "IBIBIONE8", 
		pws3: "IHERAKLI5",  
		loco1: "New York/Us",	   // fill in the name of the location or whatever u want to be displayed
		loco2: "Bibione/It",
		loco3: "Kos/Gr",
	}
    },

If u dont want or need this so like before with only one pws  (location) use this example:

    {
        module: 'MMM-NOAA',
        config: {

		apiKey: "YOUR API KEY",    // https://www.wunderground.com/weather/api  select the middle plan... 
		airKey: "YOUR API KEY",    // IF you want Air Quality Index
		pws1: "KNYELMIR13",	   // go here to find your pws: https://www.wunderground.com/wundermap
	}
    },

## Very important for updating: !!! Please rename ur pws to pws1 !!!

## Start your mirror . . . enjoy! 
