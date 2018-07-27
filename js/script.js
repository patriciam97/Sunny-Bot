
var country,prevcountry;;
var systemnames=[];
var coordinates=[];
var start=true;
var lat="37.688",lng="35.438";
var map;
var username1="patriciam97";
var username2="s1616316";
var username=username1;
var initialised=false;
var submitB=false;
var markers =  L.markerClusterGroup(
    {
        spderfyOnMaxZoom:true
    }
);
var marker;
var name="";
var tables=[];
var pagination;
var str;
var chart;




$("#profclose").click(function(){
    //whenever the profifle modal closes, we restore this classes in order to always show the details tab first 
    document.getElementById("detailstab").classList.add("active");
    document.getElementById("details").classList.add("active");
    document.getElementById("details").classList.add("show");
    $(".imagelink").attr("src","");
    if(document.getElementById("readingstab").classList.contains("active")){
        document.getElementById("readingstab").classList.remove("active");
        document.getElementById("readingsli").classList.remove("active");
        document.getElementById("readings").classList.remove("active");
        document.getElementById("readings").classList.remove("show");
    }
    if(document.getElementById("statisticstab").classList.contains("active")){
        document.getElementById("statisticstab").classList.remove("active");
        document.getElementById("statisticsli").classList.remove("active");
        document.getElementById("statistics").classList.remove("active");
        document.getElementById("statistics").classList.remove("show");
    }
});
function getCoordinates(c) {
    if(c!="ALL"){
        $.ajax({
            type: "GET" ,
            url: "http://api.geonames.org/search?q=" + c + "&username="+username ,
            dataType: "xml" ,
            success: function(xml) {
                lat = $(xml).find('lat').first().text(); 
                lng = $(xml).find('lng').first().text();
                    if(initialised==false){
                        myMap(lat,lng,8); 
                        initialised=true;
                    }else{
                        moveMap(lat,lng);
                        initialised=true;
                    }               
                },
            error:function(){ 
               if(username==username1){
                   username=username2;
               }else{
                   username=username1;
               }
               getCoordinates();
            }
            });       
        }else{
        if(initialised==false){
            myMap(37.688,35.438,2); 
        }else{
           moveMap(37.688,35.438,2);
        }
    }
}

function myMap(lat,lng,zoomfactor) {
   map = L.map('mapid',{
    minZoom: 0,
    maxZoom: 10
   }).setView([lat,lng], zoomfactor);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(map);
    allPVS();
}

function moveMap(lat,lng,zoomfactor){
    map.panTo([lat,lng],zoomfactor);
    if(submitB==false){
        allPVS();
    }else{
        findPVSystem(name);
        submitB=false;
    }
}

function submit(){
     $('#Searching_Modal').modal("show");
    markers.clearLayers();
    name=document.getElementById("pvname").value;
    if(name!=""){
        submitB=true;
    }
    getCountry();
}
function getCountry(){
    prevcountry=country;
    var countries= document.getElementById("countries");
    country= countries.options[countries.selectedIndex].value;
    if (country=="ALL"){
        swal({title: 'Are you sure?',
            text:"It might take a bit to load the results.", 
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!'
            }).then(result => {
            if (result.value) {
              // handle Confirm button click
              getCoordinates(country);
            } else {
              // handle dismissals
              country=prevcountry;
              countries.value=country;
              getCoordinates(country);
            }
          })
    }else{
     getCoordinates(country);
    }
}

function startProgram(){
    $('#Searching_Modal').modal("show");
   // deleteMarkers();
    getCountry();
}

function findPVSystem(name){
    
    var link="http://localhost:8000/api/pvs/name/"+name;
    var lat,lng;
    var city="";
    var id="";
    var systemname="";
    var power="";
    console.log("Searching for "+ name);
    $.ajax({
        type: "GET",
        crossDomain: true,
        url: link,
        dataType: "json" ,
        success: function(result){
            getPVS(result);
        },
        error:function(){ 
            swal({
                type: 'error',
                title: 'Oops...',
                text: 'No such system!',
            })
            document.getElementById("pvname").value="";
            submit();
        }        
    });
}

function getPVS(result){
    var totalsystempower=0;
    if(result.length==0){
              swal({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            })
            submit();
    }
    $.each(result, function(index,pv){          
        // Get Coordinates
        var crd=pv.Coordinates;
        if(crd!=null){
        var res = crd.toString().split(',',2);
        lat=res[0];
        lng=res[1]; 
        }else{
            lat=0;
            lng=0;
        }
        //Get id
        id=pv._id;
        //get system power
        totalsystempower=parseFloat(totalsystempower)+parseFloat(pv.SystemPower);
        //marker      
        marker =L.marker( [lat,lng]).on('click', function(){
            getProfile(pv._id,pv.System,"<table><tr> <td class=\"mylabel\">City: </td> <td> "+pv.City+"</td></tr> <tr> <td class=\"mylabel\">Zip Code: </td> <td> "+pv.ZipCode+"</td></tr> <tr> <td class=\"mylabel\">System Power: </td> <td> "+pv.SystemPower+"kmh</td></tr>");
        }); 
        markers.addLayer(marker);
        });
        totalsystempower=(parseFloat(totalsystempower).toFixed(4))+" kWp";
        map.addLayer(markers);
        $(".about-title").html(country);
        $("#about").html("<table><tr> <td class=\"mylabel\">Total PV Systems:  </td><td>"+(result.length)+"</td></tr> <tr> <td class=\"mylabel\">Total System Power:  </td><td>"+totalsystempower+"</td></tr></table>");
        $('#Searching_Modal').modal("hide");

}

function getProfile(id,system,str2){
    var table;
    var yr;
    var str1=str2;
    var datalines=[];
    var unit;
    $("#proflabel").html(system);
    $.ajax({
        type: "GET",
        crossDomain: true,
        url:"http://localhost:8000/api/pvs/id/"+id,
        dataType: "json" ,
        success: function(pv) {
                    if(pv.Image!=null){
                        var link;
                      if(pv.Image.toString().includes("blank")==false){ 
                          //if the image is not blank
                        link="https://www.sunnyportal.com"+pv.Image+".jpg";
                      }
                      $(".imagelink").attr("src",link);
                    }
                    if(pv.Operator!=null){
                        str1=str1+"<tr> <td class=\"mylabel\">Operator: </td> <td>"+pv.Operator+"</td></tr>";
                    }
                    if(pv.StartDate!=null){         
                        str1=str1+"<tr> <td class=\"mylabel\">Start Date: </td> <td>"+pv.StartDate+"</td></tr>";
                    }
                    if(pv.SystemAnnualProduction!=null){
                        str1=str1+"<tr> <td class=\"mylabel\">Annual Production: </td> <td> "+pv.SystemAnnualProduction+"</td></tr>";
                    }
                    if(pv.CO2!=null){
                        str1=str1+"<tr> <td class=\"mylabel\">CO2: </td> <td> "+pv.CO2+"</td></tr>";
                    }
                    if(pv.Azimuth!=null){
                        str1=str1+"<tr> <td class=\"mylabel\">Azimuth: </td> <td> "+pv.Azimuth+"</td></tr>";
                    }
                    if(pv.Inclination!=null){
                        str1=str1+"<tr> <td class=\"mylabel\">Inclination: </td> <td> "+pv.Inclination+"</td></tr>";
                    }
                    if(pv.Modules!=null){
                        str1=str1+"<tr> <td class=\"mylabel\">Modules: </td> <td> "+pv.Modules+"</td></tr>";
                    }
                    if(pv.Inverter!=null){
                        str1=str1+"<tr> <td class=\"mylabel\">Inverter: </td> <td> "+pv.Inverter+"</td></tr>";
                    }
                    if(pv.Sensors!=null){
                        str1=str1+"<tr> <td class=\"mylabel\">Sensors: </td> <td> "+pv.Sensors+"</td></tr>";
                    }
                    if(pv.readingsUnit!=null){
                        unit=pv.readingsUnit;
                    }
                    if(pv.descinfo!=null && pv.descinfo!="" && pv.descinfo!==undefined){
                        str1=str1+"<tr> <td class=\"mylabel\">Description: </td> <td> "+pv.descinfo+"</td></tr>";
                    }

                    if(pv.monthlyReadings.length!=0){
                        pagination="<div><nav aria-label=\"Page navigation\"><ul class=\"pagination\">";
                        yr=new Date().getFullYear()+1;
                        c=0;
                        var limit=180;
                        for(x=0;x<pv.monthlyReadings.length;x=x+12){
                                var year;
                                var datapoints=[];
                                d=0;
                                yr=yr-1;
                                if(x<limit){
                                    pagination=pagination+"<li id=\""+yr+"\"onclick=\"getPaging("+yr+","+(pv.monthlyReadings.length/12)+")\" \"class=\"page-item\"><a class=\"page-link\" href=\"#\">"+yr+"</a></li>"
                                }else{
                                    limit=limit*2;
                                    pagination=pagination+"</ul></nav></div>"+"<br><div><nav aria-label=\"Page navigation\"><ul class=\"pagination\">";
                                    pagination=pagination+"<li id=\""+yr+"\"onclick=\"getPaging("+yr+","+(pv.monthlyReadings.length/12)+")\" \"class=\"page-item\"><a class=\"page-link\" href=\"#\">"+yr+"</a></li>"

                                }
                                    table="<table class=\"table table-striped text-center\" ><thead> <tr class=\"text-center\"> <th scope=\"col\">Year</th><th scope=\"col\">Month</th> <th scope=\"col\">Production("+pv.readingsUnit+")</th> </tr> </thead> <tbody>";
                                for(i=x;i<x+12;i++){
                                    var date = new Date(pv.monthlyReadings[i].timestamp);
                                    var value= pv.monthlyReadings[i].value;
                                    locale = "en-us",
                                    month = date.toLocaleString(locale, { month: "long" });
                                    year= date.getFullYear();
                                    table=table+"<tr><th scope=\"row\">"+year+"</th><td>"+month+"</td><td>"+parseFloat(value)+"</td></tr>";
                                    datapoints[d]=[Date.UTC(2018,d),parseInt(value)];
                                    d++;
                                }
                                datalines.push({"name":year,"data":datapoints});
                                table=table+"</tbody></table>";
                                tables[c]=table;
                                c++;
                        }
                        pagination=pagination+"</ul></nav></div>";
                        document.getElementById("readingstab").classList.remove("disabled");
                        if(document.getElementById("statisticstab").classList.contains("disabled")){
                             document.getElementById("statisticstab").classList.remove("disabled");
                        }
                        $("#readings").html(pagination);
                        //creating the chart
                       
                Highcharts.chart('myChart', {
                    title: {
                    text: 'Monthly Readings',
                    style:{ "color": "#333333", "fontSize": "20px" }
                    },
                    yAxis: {
                    title: {
                        text: 'Total Yield   ['+unit+']',
                        style:{ "color": "#333333", "fontSize": "15px" }
                    }
                    },
                    xAxis: {
                        title: {
                            text: 'Months',
                            style:{ "color": "#333333", "fontSize": "15px" }
                        },
                        type:"datetime",
                        dateTimeLabelFormats:{
                          month: '%b'
                        } 
                      },
                    legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle'
                    },
                    series:datalines,
                    plotOptions:{
                        series:{
                            label: {
                                enabled: false,
                            }
                       }
                    },
                    tooltip: {
                        formatter: function() {
                          return '<strong>Yield:</strong>'+this.y;
                        }
                      }
                });
                    }else{
                        document.getElementById("readingstab").classList.add("disabled");
                        document.getElementById("statisticstab").classList.add("disabled");
                    }
                    str1=str1+"</table>";
                    $("#details").html(str1);                 
        },
        error: function(){
            document.getElementById("readingstab").classList.add("disabled");
            document.getElementById("detailstab").classList.add("disabled");
            document.getElementById("statisticstab").classList.add("disabled");
        }
    });
    $("#details").html(str1);
    $('#profmodal').modal("show");
  
}

function getPaging(yr,size){
    var counter,currYear;
    if(yr==new Date().getFullYear()){
        $("#readings").html(pagination+tables[size-1]);
    }else{
        counter=size-1;
        currYear=new Date().getFullYear();
        for (x=currYear;x>yr;x=x-1){
            counter--;
        }
        $("#readings").html(pagination+tables[counter]);
    }
}
function allPVS(){
    $.when( $.ajax({
            type: "GET",
            crossDomain: true,
            url:"http://localhost:8000/api/pvs/country/"+country,
            dataType: "json" ,
            success: function(result) {
                getPVS(result);
            },
            error:function(){ 
                swal({title: 'Oops',
                    text:"Something went wrong!.", 
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Retry!'
                    }).then(result => {
                    if (result.value) {
                    // handle Confirm button click
                    allPVS();
                    } else {
                    // handle dismissals
                    startProgram();
                    }
                })
                    }
                }));            
}

function getWeather(){
   var key="2def6f8857334e03a09c9ce7cef436b6";
   var link="";
}

$(document).ready(function () {
   startProgram();
});
