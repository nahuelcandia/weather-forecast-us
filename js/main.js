/**
 * Created by home on 3/14/17.
 * APIs Used:
 * https://www.wunderground.com/weather/api/d/docs?d=data/forecast
 * https://www.wunderground.com/weather/api/d/docs?d=data/history
 * https://www.wunderground.com/weather/api/d/docs?d=data/forecast10day
 * https://developers.google.com/maps/documentation/geocoding/intro
 */
var zip_code = getUrlParameter('zip_code');
var input_date = new Date(getUrlParameter('date'));
input_date.setHours( 0,0,0,0 );
var today = new Date();
today.setHours( 0,0,0,0 );
var today_plusten = new Date();
today_plusten.setDate(today.getDate() + 10);

function AppendWeather(day) {
    try {
        var w_day = (day['date']['day'] - today.getDate() === 0) ? 'Today' : day.date.weekday;
        $('.list-weather').after(
            '<div class="col-md-2 weather">'+
                '<div>'+
                    '<h3 class="w-day">'+w_day+':</h3>'+
                    '<div class="row">'+
                        '<div class="col-md-4 col-sm-4 col-xs-4 icon-container">'+
                            '<img src="https://icons.wxug.com/i/c/g/'+day.icon+'.gif">'+
                        '</div>'+
                        '<div class="col-md-8 col-sm-8 col-xs-8">'+
                            '<p class="w-type">'+day.conditions+'</p>'+
                            '<p class="w-degrees"><strong>'+day.high.fahrenheit+'&deg; </strong>/ '+day.low.fahrenheit+'&deg; F</p>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'
        );
    } catch (err){
        $('.container-fluid').remove();
        console.log(err);
    }
}
function GetCityByZIP(zip_code) {
    try {
        $.ajax({
            url : "http://maps.googleapis.com/maps/api/geocode/json?address="+zip_code+"&sensor=false",
            dataType : "json",
            success : function(data) {
                $('.region-title').text('Weather Forecast for '+ data.results[0]['address_components'][1].long_name + ', ' + data.results[0]['address_components'][3].short_name+'.');
            }
        });
    } catch (err){
        $('.container-fluid').remove();
        console.log(err);
    }
}
function GetForecastNow(zip_code, days_toshow) {
    console.log('GetForecastNow');
    try {
        $.ajax({
            url : "http://api.wunderground.com/api/6ea7cf3bc006012f/forecast/q/"+zip_code+".json",
            dataType : "jsonp",
            success : function(data) {
                $.each(data['forecast']['simpleforecast']['forecastday'].reverse(), function(i, day) {
                    if (days_toshow === undefined){
                        (i) ? AppendWeather(day) : null
                    } else {
                        days_toshow +=1;
                        if(day['date']['day'] - today.getDate() <= 1){
                            AppendWeather(day);
                        }
                    }
                });
                GetCityByZIP(zip_code);
            }
        });
    } catch (err){
        $('.container-fluid').remove();
        console.log(err);
    }
}

function GetWeatherFromHistory(zip_code) {
    console.log('GetWeatherFromHistory');
    try {
        var date_split = getUrlParameter('date').split('/');
        var greater_day_number = parseInt(date_split[1])+2;
        for (i = 0; i < 3; i++) {
            var thisday_p = date_split[2] + date_split[0] + (greater_day_number-i);
            var thisday = date_split[0]+'/'+(greater_day_number-i) +'/'+date_split[2];
            var thisday = new Date(thisday);
            thisday.setHours( 0,0,0,0 );

            if(thisday < today) {
                $.ajax({
                    url : "http://api.wunderground.com/api/6ea7cf3bc006012f/history_"+thisday_p+"/q/"+zip_code+".json",
                    dataType : "jsonp",
                    success : function(data) {
                        var day = [];
                        day['high'] = [];
                        day['low'] = [];
                        day['date'] = [];
                        day['icon'] = data['history']['observations'][0]['icon'];
                        day['high']['fahrenheit'] = data['history']['dailysummary'][0]['maxtempi'];
                        day['low']['fahrenheit'] = data['history']['dailysummary'][0]['mintempi'];
                        day['conditions'] = data['history']['observations'][0]['conds'];
                        day['date']['weekday'] = data['history']['observations'][0]['date']['pretty'];
                        AppendWeather(day);
                    }
                });
            } else if(thisday - today === 0) {
                GetForecastNow(zip_code, 2);
            }
        }
        GetCityByZIP(zip_code);
    } catch (err){
        $('.container-fluid').remove();
        console.log(err);
    }

}

function GetFutureWeather(zip_code) {
    console.log('GetFutureWeather');
    try {
        $.ajax({
            url : "http://api.wunderground.com/api/6ea7cf3bc006012f/forecast10day/q/"+zip_code+".json",
            dataType : "jsonp",
            success : function(data) {
                $.each(data['forecast']['simpleforecast']['forecastday'].reverse(), function(i, day) {
                    if (day['date']['day'] >= input_date.getDate() && day['date']['day'] - input_date.getDate() <=2){
                        AppendWeather(day);
                    }
                });
                GetCityByZIP(zip_code);
            }, error: function (err) {
                $('.container-fluid').remove();
                console.log(err);
            }
        });
    } catch (err){
        $('.container-fluid').remove();
        console.log(err);
    }
}

function getUrlParameter(sParam) {
    //Source: http://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
    try {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    } catch (err){
        $('.container-fluid').remove();
        console.log(err);
    }
}

$(document).ready(function($) {
    try {
        if(input_date < today){
            GetWeatherFromHistory(zip_code);
        } else if(input_date - today === 0) {
            GetForecastNow(zip_code);
        } else if (input_date > today && input_date <= today_plusten) {
            GetFutureWeather(zip_code);
        } else {
            console.log('Date is not within the 10 days of future forecast range.');
            $('.container-fluid').remove();
        }
    } catch (err){
        $('.container-fluid').remove();
        console.log(err);
    }
});
window.onerror = function UnhandledError(err) {
    $('.container-fluid').remove();
    console.log(err);
    return false;
}