/**
 * Created by home on 3/14/17.
 * From history: http://api.wunderground.com/api/6ea7cf3bc006012f/history_20170314/q/94110.json
 * Forecast: http://api.wunderground.com/api/6ea7cf3bc006012f/forecast/q/94110.json
 */
function AppendWeather(i, day) {
    var w_day = (i==3) ? 'Today' : day.date.weekday;
    $('.list-weather').after(
        '<div class="col-md-2 weather">'+
            '<div>'+
                '<h2 class="w-day">'+w_day+':</h2>'+
                '<div class="row">'+
                    '<div class="col-md-4 col-sm-4 col-xs-4">'+
                        '<img class="w-icon" src="'+day.icon_url+'">'+
                    '</div>'+
                    '<div class="col-md-8 col-sm-8 col-xs-8">'+
                        '<p class="w-type">'+day.conditions+'</p>'+
                        '<p class="w-degrees"><strong>'+day.high.fahrenheit+'&deg; </strong>/ '+day.low.fahrenheit+'&deg; F</p>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'
    );
}

function GetWeatherStartingToday(zip_code) {
    $.ajax({
        url : "http://api.wunderground.com/api/6ea7cf3bc006012f/forecast/q/"+zip_code+".json",
        dataType : "jsonp",
        success : function(data) {
            $.each(data['forecast']['simpleforecast']['forecastday'].reverse(), function(i, day) {
                (i) ? AppendWeather(i, day) : null
            });
            $('.region-title').text('Weather Forecast for '+ data['forecast']['simpleforecast']['forecastday'][0]['date']['tz_long']);
        }
    });
}

function GetWeatherFromHistory(start_date, zip_code) {
    $.ajax({
        url : "http://api.wunderground.com/api/6ea7cf3bc006012f/history_"+start_date+"/q/"+zip_code+".json",
        dataType : "jsonp",
        success : function(data) {
            $.each(data['forecast']['simpleforecast']['forecastday'].reverse(), function(i, day) {
                (i) ? AppendWeather(i, day) : null
            });
        }
    });
}


$(document).ready(function($) {
    GetWeatherStartingToday('94110');
});
