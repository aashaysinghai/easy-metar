var qfe_qnh;
var qfe_qnh_inches;
var action;
// jQuery.noConflict();
$(document).ready(function () {
    $('#metar').on('click', function(){  // capture the click
        if($('#myform').valid()){
           // $('#myform').submit();  // trigger the validation & submit   
           angular.element(document.getElementById('mainApp')).scope().generate();   
        }else{
            alert('Please check all the fields are correct and filled. And Select your Name');
        }
    });
    $('#metreport').on('click', function(){  // capture the click
        if($('#myform').valid()){
           // $('#myform').submit();  // trigger the validation & submit   
           angular.element(document.getElementById('mainApp')).scope().generatePDF();   
        }else{
            alert('Please check all the fields are correct and filled. And Select your Name');
        }
    });
    $('#myform').validate({ // initialize the plugin
        rules: {
            wd: {
                required: true,
                minlength: 3,
                maxlength: 3
            },
            ws: {
                required: true,
                minlength: 2,
                maxlength: 2
            },
            vis:{
                required:true,
                minlength: 4,
                maxlength: 4
            },
            db:{
                required:true
            },
            wb:{
                required:true
            },
            pressure:{
                required:true
            }
        },
        messages :{
            wd : {
                required : 'Enter wind direction',
                minlength: 'Please enter three digit direction',
                maxlength: 'Please enter three digit direction'
            },
            ws : {
                required : 'Enter wind speed',
                minlength: 'Please enter two digit speed',
                maxlength: 'Please enter two digit speed'
            },
            vis:{
                required:'Please Enter visibility in Metres',
                minlength: 'Visibility should be of 4 digits',
                maxlength: 'Visibility should be of 4 digits'

            },db:{
                required:'Enter Dry Bulb Temperature -- E.g 20.6'
            },
            wb:{
                required:'Please enter Wet Bulb Temperature -- E.g 18.4'
            },
            pressure:{
                required:'Please enter pressure -- E.g 951.4'
            }

        }
    });
});

var app = angular.module('myApp', []);
app.controller('formCtrl', function($scope,$http) {
    $scope.qfe_qnh_map = qfe_qnh;
    $scope.qfe_qnh_inches_map = qfe_qnh_inches;

    $scope.showMetar=false;
    $scope.clouds = ['FEW','SCT','BKN','OVC'];
    $scope.c1heights = ['018','020','025','030'];
    $scope.c2heights = ['025','030','080','090','100','250'];
    $scope.generate = function() {
        var date = new Date();
        metarDate = date.getUTCDate()
        //console.log(date.getUTCDate());
        var minutes = date.getUTCMinutes();
        var hours = date.getUTCHours();
        //console.log(minutes + "  " + hours);
        if(minutes > 15 && minutes <= 42){
            minutes = 30;
        }else if(minutes <= 14) {
            minutes = "00";
        }
        else {
            minutes = "00";
            
            if(hours == '23'){
                hours = '00'
                metarDate += 1
            }else {
                hours = hours + 1;
            }
             
        }

        if(hours < 10 && hours != 23)
            hours = "0"+hours; 
        console.log($scope.qfe_qnh_map["950"][9]);
        pres= $scope.pressure;
        arr = pres.split(".");
        $scope.time = hours+ ""+ minutes+"Z";
      
        // finding qnh from old method.
        $scope.qfe = arr[0]
        $scope.qfe_inches = $scope.qfe_qnh_inches_map[arr[0]][arr[1]][0];
        $scope.qnh_inches = $scope.qfe_qnh_inches_map[arr[0]][arr[1]][2];
        qnh = $scope.qfe_qnh_map[arr[0]][arr[1]].split(".")[0];
        $scope.qnh = qnh
        console.log("QNH itna aa raha hai " +  qnh)
        dryBulb = Math.round($scope.db)
        //td = (243.5 * Math.log())
        $http({
            method:'GET',
            url:'dpmap.xlsx',
            responseType:'arraybuffer'
        }).then(function(data) {
            var wb = XLSX.read(data.data, {type:"array"});
            sheet = $scope.wb.split(".")[0]
            var d = XLSX.utils.sheet_to_json(wb.Sheets[sheet]);
    
            //console.log(d[1])
            dbArr = $scope.db.split(".")
            dry = dbArr[0]+dbArr[1]
            wet = $scope.wb.split(".")[1]/2
            dewPoint = d[wet][dry]
            strDP = "" + dewPoint
            
            if(strDP.includes(".")){
                dp = Math.round(dewPoint) 
                $scope.DEWPOINT = dewPoint *10   
            }else {
                dp = Math.round(dewPoint/10)
                $scope.DEWPOINT = dewPoint;
            }
            
            
            if(dewPoint < 0) {
                dp = dp *-1
                if(dewPoint < 10) {
                    dp = "0"+dp
                }
                dp = "M"+dp
            }else if(dp < 10){
                dp = "0"+dp
            }

            if(dryBulb < 10){
                dryBulb = "0"+dryBulb
            }
            console.log("letss seee kya dp "+ $scope.DEWPOINT) 
            var cloud = ""
            if( ($scope.cloud1 !== undefined) && ($scope.c1Height !== undefined) ) {
                height = $scope.c1Height *100
                $scope.cloud = $scope.cloud1+$scope.c1Height
                $scope.metCloud1 =  $scope.cloud1+" " + height + "FT " + "("+ ($scope.c1Height * 30)+" M )"+"$"
                if( ($scope.cloud2 !== undefined) && ($scope.c2Height !== undefined) ){
                        $scope.cloud += " "+$scope.cloud2+$scope.c2Height
                        height = $scope.c2Height *100
                        $scope.metCloud2 =  $scope.cloud2+" " + height + "FT " + "("+ ($scope.c2Height * 30)+" M )"
                }
                
            }else if( ($scope.cloud2 !== undefined ) && ($scope.c2Height !== undefined) ){
                        $scope.cloud = $scope.cloud2+$scope.c2Height
                        height = $scope.c2Height *100
                        $scope.metCloud2 =  $scope.cloud2+" " + height + "FT " + "("+ ($scope.c2Height * 30)+" M )"+"$"
                }
            else{
                $scope.cloud = "NSC"
                console.log("else mein")
            }
            var weather = ""
            if($scope.wx !== undefined){
                weather = $scope.wx
            }
            if(metarDate < 10){
                metarDate = "0"+metarDate
            }
            db =  parseFloat($scope.db)
            wb =  parseFloat($scope.wb)
            ew = 6.112 * Math.exp((17.502 * wb)/(240.97+wb))
            ed = 6.112 * Math.exp((17.502 * db)/(240.97+db))
            A = 0.00066 * (1 + 0.00115 * wb ) 
            humidity = (ew - (A * 900 * (db-wb)))/ed
            console.log(db +" " +wb+" "+ humidity)
            humidity = Math.round(humidity * 100)
            $scope.stuff = "DP = "+ dewPoint + "   QFE & QNH =  "+$scope.qfe_inches + " "+$scope.qfe_qnh_map[arr[0]][arr[1]] +"  "+ $scope.qnh_inches + "  Humidity :: "+ humidity
            $scope.prefixMetar = "SAIN90 VAID "+metarDate+hours+ minutes;
            $scope.metar = "METAR VAID " + metarDate+hours+ minutes + "Z " 
                        +$scope.wd+$scope.ws+"KT " + $scope.vis+ " "+weather+ " "+  $scope.cloud
                        +" " + dryBulb +"/"+dp+ " Q" + qnh + " NOSIG=";
                        
            $scope.showMetar = true;
            
        }, function(err) { console.log(err); });

        // PDF generation....
        // NEED TO CHECK LATER...
        //var doc = new jsPDF();
        //doc.text('Hello world!', 10, 10);
        //var image = 'data:image/jpeg;base64,SIGNATURE.jpeg'
        //doc.addImage(image, 'JPEG', 15, 40, 180, 180);
        //doc.save('a4.pdf');
        
    }

    $scope.generatePDF = function() {
        if($scope.showMetar === true){
            // var doc = new jsPDF();
            // doc.text('MET REPORT VAID  '+ $scope.time , 10, 10);
            // doc.text('VIS  '+ $scope.vis , 10, 30);
            // doc.text('T '+ $scope.db + '   DP  ' + $scope.DEWPOINT , 10, 50);
            // doc.text('QNH 1015 HPA  3002 INS  ' , 10, 70);
            // doc.text('QFE 950 HPA  2889 INS  ' , 10, 90);
            //doc.save('a4.pdf');
            //console.log(doc)
            var html = "<!DOCTYPE HTML>";
            html += '<html lang="en-us">';
            html += '<head><style></style></head>';
            html += "<body><font size='4'>";
            var clouds = "NSC"
            var weather = ""
            if($scope.wx !== undefined){
                weather = $scope.wx
            }

            if($scope.metCloud1 !== undefined) {
                clouds = $scope.metCloud1+" "
            }
            if($scope.metCloud2 !== undefined) {
                if($scope.metCloud1 !== undefined)
                    clouds +=  $scope.metCloud2
                else    
                    clouds  =  $scope.metCloud2 + " "
            }
            console.log("clouds :: "+clouds)
            var time = new Date()
            var date = time.getUTCDate()+ "-"+(time.getUTCMonth()+1)+"-"+time.getUTCFullYear()
            wind = ""
            if(($scope.wd+$scope.wd) == '00000') {
                wind = "CALM"
            }else {
                wind = $scope.wd+" / "+$scope.ws+"KT " 

            }

            // write content here
            if(clouds !== 'NSC'){
                html += "<br>MET REPORT VAID  "+ date+"  "+ $scope.time +"&nbsp;&nbsp;&nbsp;&nbsp; WIND &nbsp;&nbsp;"+  wind    +"<br>"+
                        "<p>VIS " + $scope.vis +" M " +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "+weather + " "+
                        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CLOUDS &nbsp;&nbsp;"+ clouds.split("$")[0] +"<br>"+ 
                        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
                        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+ clouds.split("$")[1] +"<br>"+
                        "T  " + Math.round($scope.db) +"&nbsp;&nbsp;&nbsp;&nbsp;   DP &nbsp;&nbsp; " + Math.round($scope.DEWPOINT/10) +"</p>"+
                        "QNH &nbsp;&nbsp;  "+$scope.qnh+" HPA &nbsp;&nbsp;  "+$scope.qnh_inches+"  INS <br>" + 
                        "QFE &nbsp;&nbsp;&nbsp;  0"+$scope.qfe+"  HPA &nbsp;&nbsp;  "+$scope.qfe_inches+"  INS"+
                        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "+$scope.initials
            }else {
                html += "<br>MET REPORT VAID  "+  date +"  "+$scope.time +"&nbsp;&nbsp;&nbsp;&nbsp; WIND &nbsp;&nbsp;"+  wind  +"<br>"+
                        "<p>VIS " + $scope.vis +" M " +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+weather + " "+
                        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;CLOUDS &nbsp;&nbsp;"+ clouds +"<br><br>"+
                        "T  " + Math.round($scope.db) +"&nbsp;&nbsp;&nbsp;&nbsp;   DP &nbsp;&nbsp; " + Math.round($scope.DEWPOINT/10) +"</p>"+
                        "QNH &nbsp;&nbsp;  "+$scope.qnh+" HPA &nbsp;&nbsp;  "+$scope.qnh_inches+"  INS <br>" + 
                        "QFE &nbsp;&nbsp;&nbsp;  0"+$scope.qfe+"  HPA &nbsp;&nbsp;  "+$scope.qfe_inches+"  INS"+
                        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "+$scope.initials
            }
               
                html += "</font></body>";
            var w = window.open();
            w.document.write(html);
            w.window.print();
            w.document.close();
        }
    }

    $scope.sendToOlbs = function(){
        var metar = {"A1": "ZCZC+038%0D%0ASAIN90+VAID+110000%0D%0AMETAR+VAID+110000Z+10004KT+3000+HZ+HZ+19%2F17+Q1015+NOSIG%3D%0D%0A",
                    "OFCR": "AMSS",
                    "Submit": "Submit"}
        $http({
            method:'POST',
            data:metar,
            url:'http://amssdelhi.gov.in/sendata/Action_send1.php',
           // responseType:'arraybuffer'
        }).then(function(data) {
            console.log("success aaya")
            console.log(data)
        }, function(err) { console.log(err); });            

    }
});