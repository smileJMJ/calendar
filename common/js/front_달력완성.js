var calendarMake = (function(){
	var dayFormat = [];
	var toYear, toMonth, toDate;
	var curYear, curMonth, curDate;				// 현재 출력되는 년,월,일

	// 생성자
	var CALENDAR = function(opt){
		this.ele = opt.ele;
		this.day = opt.day;			// 요일설정
	};

	var fn = CALENDAR.prototype;

	var _init = function(opt){
		var calendar = new CALENDAR(opt);
		var today = new Date();

		toYear = today.getFullYear();
		toMonth = today.getMonth()+1;
		toDate = today.getDate();

		curYear = toYear;
		curMonth = toMonth;
		curDate = toDate;

		dayFormat = calendar.day;		// 요일 포맷 
		calendar.calDate(curYear, curMonth, curDate);		// 달력계산하기 - 처음 실행은 오늘 날짜로
		calendar.btnClick();															// 달력 버튼 클릭
		

		return calendar;	
	}	

	// 달력 계산하는 함수
	fn.calDate = function(year, month, date){
		var now = _checkDayInfo(year, month, date),			// 오늘 날짜 정보, now.year, now.month, now.date, now.day  있음
		 	allDateArr = _calAllDate(now.year),			// 해당년도 월별 일수
			firstDay = _calFirstDay(now.year, now.month);

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
					tbl += "<td></td>";
				}else{
					if(j==0){
						tbl += "<td class='sunday' data-date='"+curYear+"-"+curMonth+"-"+dCount+"'><strong>"+dCount+"</strong></td>";
					}else if(j==6){
						tbl += "<td class='saturday' data-date='"+curYear+"-"+curMonth+"-"+dCount+"'><strong>"+dCount+"</strong></td>";
					}else{
						tbl += "<td data-date='"+curYear+"-"+curMonth+"-"+dCount+"'><strong>"+dCount+"</strong></td>";
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
			if($(this).data("date") == String(toYear+"-"+toMonth+"-"+toDate)){
				$(this).addClass("today");
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
		});
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
		dayInfo.month = d.getMonth()+1,
		dayInfo.date = d.getDate(),
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

	return _init;

})();