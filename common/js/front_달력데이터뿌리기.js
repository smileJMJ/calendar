var calendarMake = (function(){
	var dayFormat = [];
	var toYear, toMonth, toDate;
	var curYear, curMonth, curDate, curAllDate;				// 현재 출력되는 년,월,일 공통으로 사용하기 위해 위로 올림

	// 생성자
	var CALENDAR = function(opt){
		this.ele = opt.ele;
		this.day = opt.day;			// 헤더에 표기될 요일 포맷 설정
		this.today = opt.today;
		this.registArea = opt.registArea;

		return this;
	};

	var fn = CALENDAR.prototype;

	var _init = function(opt){
		var calendar = new CALENDAR(opt);
		var today = opt.today;

		// 서버에서 오늘 시간 체크
		toYear = today.year,
		toMonth = today.month,
		toDate = today.date;

		dayFormat = calendar.day;		// 요일 포맷 
		calendar.calDate(toYear, toMonth, toDate);
		calendar.btnClick();															// 달력 버튼 클릭
		calendar.colorSpectrum();				// 일정 등록 컬러피커 실행 

		return calendar;	
	}

	// 일정관리 데이터 받아오는 함수
	fn.getData = function(month){
		var data = sDataParsing.callMonthData(month);
		return data;
	}	

	// 달력 계산하는 함수
	fn.calDate = function(year, month, date){
		var now = _checkDayInfo(year, month, date),			// 오늘 날짜 정보, now.year, now.month, now.date, now.day  있음
		 	allDateArr = _calAllDate(now.year),			// 해당년도 월별 일수
			firstDay = _calFirstDay(now.year, now.month);

		curYear = year;			
		curMonth = month;
		curDate = date;	
		curAllDate = allDateArr[now.month-1];

		this.drawCalendar(now.year, now.month, allDateArr[now.month-1], firstDay);	
	};

	// 달력 그리는 함수
	fn.drawCalendar = function(year, month, allDate, firstDay){
		var $ele = $(this.ele),
			$calendarTop = $ele.find(".calendar_top"),
			$calendarTbl = $ele.find(".calendar_con table");
		var rowNum = Math.floor((allDate-(7-firstDay))/7)+2,
			th = "", tbl = "",
			dCount=1;				// 달력 두번째 행부터 카운트		

		// 요일 header 생성		
		for(var k=0; k<7; k++){
			if(k==0){
				th += "<th scope='col' class='sunday'>"+dayFormat[k]+"</th>";	
			}else if(k==6){
				th += "<th scope='col' class='saturday'>"+dayFormat[k]+"</th>"		
			}else{
				th += "<th scope='col'>"+dayFormat[k]+"</th>"		
			}
		}	

		// 달력 날짜 생성
		for(var i=0; i<rowNum; i++){
			tbl += "<tr>";

			for(var j=0; j<7; j++){				
				if(i==0 && j<firstDay || dCount > allDate) {				// 1일 및 마지막 일 제외한 칸
					tbl += "<td class='none'></td>";
				}else{
					var m = _numLengthMatch(curMonth);
					var d = _numLengthMatch(dCount);

					if(j==0){
						tbl += "<td class='sunday' data-date='"+curYear+"-"+m+"-"+_numLengthMatch(dCount)+"'><strong>"+dCount+"</strong><div class='no_badge_area'></div></td>";
					}else if(j==6){
						tbl += "<td class='saturday' data-date='"+curYear+"-"+m+"-"+d+"'><strong>"+dCount+"</strong><div class='no_badge_area'></div></td>";
					}else{
						tbl += "<td data-date='"+curYear+"-"+m+"-"+d+"'><strong>"+dCount+"</strong><div class='no_badge_area'></div></td>";
					}

					dCount++;
				}
			}

			tbl += "</tr>"
		}

		$calendarTop.find("h4").html(year+"&nbsp;"+month);
		$calendarTbl.find("thead tr").html(th);
		$calendarTbl.find("tbody").html(tbl);
		$calendarTbl.find("td").each(function(i){				// 오늘날짜 today 클래스 추가
			if($(this).data("date") == String(toYear+"-"+_numLengthMatch(toMonth)+"-"+_numLengthMatch(toDate))){
				$(this).addClass("today");
			}
		});
	};

	// 월 데이터 그리기
	fn.drawMonthData = function(month){
		var $this = this,
			$calendar = $(this.ele),
			$cTd = $calendar.find("td").not(".none");
		var data = 	$this.getData(month),
		 	monthData = JSON.stringify(data);		// JSON Array Parsing to string

		if(monthData != undefined){	
			var dataArr = monthData.match(/\{(.*?)}/g),					// 배열로 처리
		 		dataArrLength = dataArr.length;

		 	// 시작일에 타이틀 및 링크 제공	
			/*for(var i=0; i<dataArrLength; i++){
				var d = JSON.parse(dataArr[i]);
				$("[data-date='"+d.startDate+"']").append("<a href='seq="+d.seq+"' style='background:"+d.bgcolor+";'>"+d.title+"</a>");
			}*/

			for(var i=0; i<dataArrLength; i++){
				var d = JSON.parse(dataArr[i]),
				startDate = d.startDate,
				endDate = d.endDate,
				numStartDate = Number(startDate.substring(8,startDate.length)),
				numEndDate = Number(endDate.substring(8,endDate.length)),
				dateFormat = startDate.substring(0,8);

				// 데이터 달력 표기
				for(var j=1; j<=curAllDate; j++){
					if(j == numStartDate) {
						$("[data-date='"+d.startDate+"']").append("<a href='seq="+d.seq+"' class='badge start' style='background:"+d.bgcolor+"; border:1px solid "+d.bgcolor+"'><span>"+d.title+"</span></a>");
					}else if(j == numEndDate) {
						$("[data-date='"+d.endDate+"']").append("<a href='seq="+d.seq+"' class='badge end' style='background:"+d.bgcolor+"; border:1px solid "+d.bgcolor+"'><span>"+d.title+" 종료"+"</span></a>");
					}else if(j > numStartDate && j<numEndDate) {
						var df = dateFormat+_numLengthMatch(j);
						$("[data-date='"+df+"'] .no_badge_area").append("<a href='seq="+d.seq+"' class='no_badge' style='background:"+d.bgcolor+"; border:1px solid "+d.bgcolor+"'></a>");
					}else{

					}
				}

				//$("[data-date='"+d.startDate+"']").append("<a href='seq="+d.seq+"' class='start_badge' style='background:"+d.bgcolor+"; border:1px solid "+d.bgcolor+"'><span>"+d.title+"</span></a>");
				//$("[data-date='"+d.endDate+"']").append("<a href='seq="+d.seq+"' class='end_badge' style='background:"+d.bgcolor+"; border:1px solid "+d.bgcolor+"'><span>"+d.title+" 종료"+"</span></a>");
			}
		}	
	}

	// 해당 일정 매핑하기
	fn.mappingData = function(){
		var $this = this;

	};

	// 달력 색상 컬러피커 실행
	fn.colorSpectrum = function(){
		var $registArea = $(this.registArea);

		$registArea.find("#sBg").spectrum({
			color:"#f00",
			showInput: true,
			allowEmpty: false,
			showPalette: true,
			palette: [
				["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
				["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
				["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
				["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
				["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
				["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
				["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
				["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
			],
			change:function(){
				$(this).spectrum("hide");
			},
			hide:function(color){
				$(this).val(color.toHexString());
			}
		});
	};

	// 달력 버튼 클릭 이벤트
	fn.btnClick = function(){
		var $this = this,
			$calendar = $(this.ele);

		$calendar.find(".calendar_top button").click(function(e){
			if($(this).hasClass("prev")){			// 이전달 
				if(curMonth == 1) {
					curMonth = 12;
					curYear--;
				}else{
					curMonth--;
				}
				$this.calDate(curYear, curMonth, 1);				
			}else if($(this).hasClass("next")){			// 다음달 
				if(curMonth == 12){
					curMonth = 1;
					curYear++;
				}else{
					curMonth++;
				}
				$this.calDate(curYear, curMonth, 1);	
			}else{										// 오늘
				curYear = toYear;
				curMonth = toMonth;	
				$this.calDate(toYear, toMonth, toDate);
			}

			$this.drawMonthData(curMonth);			// 일정 데이터 뿌리기
		});
	};

	// 일정등록 레이어 보이기
	fn.showRegistArea = function(writeDate){
		var $ele = $(this.ele),
			$registArea = $(this.registArea);

		$registArea.find(".write_date").text(writeDate);	
		TweenMax.set($registArea, {display:"block"});
		TweenMax.to($ele, 0.6, {width:"60%", ease:"Cubic.easeOut"});
		TweenMax.to($registArea, 0.6, {autoAlpha:1, right:0, ease:"Cubic.easeOut"});
	};

	// 일정등록 레이어 숨기기
	fn.hideRegistArea = function(){
		var $ele = $(this.ele),
			$registArea = $(this.registArea);

		TweenMax.to($ele, 0.6, {width:"100%", ease:"Cubic.easeOut"});
		TweenMax.to($registArea, 0.6, {autoAlpha:0, right:"-40%", ease:"Cubic.easeOut", onComplete:function(){
			TweenMax.set($registArea, {display:"none"});
		}});
	};

	// 날짜 및 요일 체크
	var _checkDayInfo = function(year, month, date){
		var d;
		var dayInfo = {
			year:0,
			month:0,
			date:0,
			day:""
		};

		d = new Date(year, month-1, date);

		dayInfo.year = d.getFullYear(),
		dayInfo.month = _numLengthMatch(d.getMonth()+1),
		dayInfo.date = _numLengthMatch(d.getDate()),
		dayInfo.day = d.getDay();

		return dayInfo;
	};

	// 월별 총 일수 구하기
	var _calAllDate = function(y){
		var date = [31,28,31,30,31,30,31,31,30,31,30,31];

		if(y%4==0 && y%100!=0 || y%400==0) date[1] = 29;

		return date;
	};

	// 해당 월 1일 요일 인덱스 구하기
	var _calFirstDay = function(year, month){
		var firstDay;
		var f = new Date(year, month-1, 1);
		firstDay = f.getDay();

		return firstDay;
	}

	// 날짜 (월, 일) 두자리수 맞추기
	var _numLengthMatch = function(d){
		var newNum = "";

		if(String(d).length == 1){
			newNum += "0"+d;
		}else{
			newNum = d;
		}

		return newNum;
	};



	return _init;

})();


// 날짜 데이터 파싱
var sDataParsing = (function(){
	var data;
	var newData = new Object;

	var init = function(data){
		_makeNewJson(data);		// 새로운 데이터 만들기
	};

	// 월 데이터(JSON Object) 파싱
	var _makeNewJson = function(data){
		var data = data,
			length = data.length;

		for(var i in data){
			var month = Number(data[i].startDate.substring(5,7));
			newData[month] = new Array();
		}
		
		for(var j in data){
			var n = Number(data[j].startDate.substring(5,7));
			newData[n].push(data[j]);
		}

	};

	// 월 데이터(JSON Object) 가져오기
	var callMonthData = function(m){
		return newData[m];
	}

	return {
		init:init,
		callMonthData:callMonthData
	}
})();