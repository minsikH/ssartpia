fetch("../data.json")
  .then((response) => response.json())
  .then((data) => {
    const itemList = data.itemList;

    /* 
    0. 현재 시간
*/

    const newDate = new Date();
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0"); // 2자리로 변환
    const day = String(newDate.getDate()).padStart(2, "0");
    const currentDate = `${year}.${month}.${day}`; //2024.00.00
    //console.log(currentDate)

    /* 
    1. 가상아이템 -> 시간 순으로 나열
*/

    const listByDate = itemList.sort(
      (a, b) =>
        new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time)
    );
    //console.log('listByDate : ', listByDate)

    /* 
    2. 공연/전시 분류(2번) -> 공연/전시중,예정,완료 로 분류
*/

    // 1) 현재 날짜와 시간과 리스트 시간 비교하여 공연/전시 중, 예정, 완료 로 구분
    function listProgress(e) {
      let performanceScheduled = []; //예정
      let exhibitionScheduled = [];
      let performanceCompleted = []; //완료
      let exhibitionCompleted = [];

      e.forEach((data) => {
        const listDate = new Date(data.date + " " + data.time);
        const listYear = listDate.getFullYear();
        const listMonth = String(listDate.getMonth() + 1).padStart(2, "0");
        const listDay = String(listDate.getDate()).padStart(2, "0");
        const listProgressDate = `${listYear}.${listMonth}.${listDay}`;

        let progress = "";
        if (data.content === "공연") {
          if (currentDate > listProgressDate) {
            progress = "공연완료";
          } else if (currentDate == listProgressDate) {
            progress = "공연중";
          } else {
            progress = "공연예정";
          }
        } else if (data.content === "전시") {
          if (currentDate > listProgressDate) {
            progress = "전시완료";
          } else if (currentDate == listProgressDate) {
            progress = "전시중";
          } else {
            progress = "전시예정";
          }
        }

        // 진행 상태에 따라 이벤트를 적절한 배열에 추가
        if (progress === "공연중" || progress === "공연예정") {
          performanceScheduled.push(data);
        } else if (progress === "전시중" || progress === "전시예정") {
          exhibitionScheduled.push(data);
        } else if (progress === "공연완료") {
          performanceCompleted.push(data);
        } else if (progress === "전시완료") {
          exhibitionCompleted.push(data);
        }
        data.progress = progress;
      });
      //console.log(performanceScheduled)
      //console.log(exhibitionScheduled)
      //console.log(performanceCompleted)
      //console.log(exhibitionCompleted)
      return {
        performanceScheduled,
        exhibitionScheduled,
        performanceCompleted,
        exhibitionCompleted,
      };
    }

    /* 
    cont_search_area  sub_tab_searchA
    제이쿼리 Datepicker
*/
    $(function () {
      // 버튼 클릭 시 Datepicker가 표시되도록 설정
      $(".date_details_area .datepicker").on("click", function () {
        $(this).prev(".date_details").datepicker("show");
      });

      //input을 datepicker로 선언
      $(".date_details_area")
        .find(".date_details")
        .datepicker({
          dateFormat: "yy-mm-dd", // 달력 날짜 형태
          showOtherMonths: false, // 빈 공간에 현재월의 앞뒤월의 날짜를 표시
          showMonthAfterYear: true, // 월- 년 순서가아닌 년도 - 월 순서
          changeYear: true, // option값 년 선택 가능
          changeMonth: true, // option값 월 선택 가능
          yearSuffix: "", // 달력의 년도 부분 뒤 텍스트
          monthNamesShort: [
            "1월",
            "2월",
            "3월",
            "4월",
            "5월",
            "6월",
            "7월",
            "8월",
            "9월",
            "10월",
            "11월",
            "12월",
          ], // 달력의 월 부분 텍스트
          monthNames: [
            "1월",
            "2월",
            "3월",
            "4월",
            "5월",
            "6월",
            "7월",
            "8월",
            "9월",
            "10월",
            "11월",
            "12월",
          ], // 달력의 월 부분 Tooltip
          dayNamesMin: ["일", "월", "화", "수", "목", "금", "토"], // 달력의 요일 텍스트
          dayNames: [
            "일요일",
            "월요일",
            "화요일",
            "수요일",
            "목요일",
            "금요일",
            "토요일",
          ], // 달력의 요일 Tooltip
          minDate: "-10Y", // 최소 선택일자(-1D:하루전, -1M:한달전, -1Y:일년전)
          maxDate: "+10y", // 최대 선택일자(+1D:하루후, -1M:한달후, -1Y:일년후)
        });
    });

    /* 
    sub_tab 의 li클릭시 검색하기 타입결정 및 결과 타입 결정
*/

    const subTabItems = document.querySelectorAll(".sub_tab li");
    const subTabSearchA = document.querySelector(".sub_tab_searchA");
    const subTabSearchB = document.querySelector(".sub_tab_searchB");
    const subTabResultA = document.querySelector(".sub_tab_resultA");
    const subTabResultB = document.querySelector(".sub_tab_resultB");
    const resultAArea = document.querySelector(".resultA_area");
    const calenderArea = document.querySelector(".calender_area");

    // sub_tab의 li 클릭 이벤트 설정
    subTabItems.forEach((item, index) => {
      item.addEventListener("click", function () {
        // 현재 클릭된 li에는 on 클래스 추가하고 나머지 li에서는 on 클래스 제거
        subTabItems.forEach((subTabItem, subTabIndex) => {
          if (index === subTabIndex) {
            subTabItem.classList.add("on");
          } else {
            subTabItem.classList.remove("on");
          }
        });

        // 클릭된 li가 첫 번째일 때
        if (index === 0) {
          resetFilter(subTabSearchA);
          // sub_tab_searchA에 on 클래스 추가하고 나머지 ul에서는 on 클래스 제거
          subTabSearchA.classList.add("on");
          subTabSearchB.classList.remove("on");

          resultAArea.style.display = "none";

          calenderArea.style.display = "block";

          // sub_tab_resultA에 on 클래스 추가하고 cont_result_area > div에는 on 클래스 제거
          subTabResultA.classList.add("on");
          subTabResultB.classList.remove("on");
        }
        // 클릭된 li가 두 번째일 때
        else if (index === 1) {
          resetFilter(subTabSearchB);
          // sub_tab_searchB에 on 클래스 추가하고 나머지 ul에서는 on 클래스 제거
          subTabSearchB.classList.add("on");
          subTabSearchA.classList.remove("on");

          // sub_tab_resultB에 on 클래스 추가하고 cont_result_area > div에는 on 클래스 제거
          subTabResultB.classList.add("on");
          subTabResultA.classList.remove("on");
          addSlideB(listByDate);
        }
      });

      // 필터 초기화 함수
      function resetFilter() {
        const inputsRadio = document.querySelectorAll(
          '.cont_search_area input[type="radio"]'
        );
        const selects = document.querySelectorAll(".cont_search_area select");
        const searchInputs = document.querySelectorAll(
          '.cont_search_area input[type="text"]'
        );

        inputsRadio.forEach((input, index) => {
          if (index === 0 || index === 4) {
            input.checked = true;
          } else {
            input.checked = false;
          }
        });

        selects.forEach((select) => {
          select.selectedIndex = 0;
        });

        searchInputs.forEach((searchInput) => {
          searchInput.value = "";
        });

        let resetYear = new Date().getFullYear();
        updateYear(resetYear); // 달력의 연도 초기화

        // 현재 년도와 월로 캘린더 초기화 및 데이터 다시 불러오기
        const resetDate = new Date();
        const resetDateYear = resetDate.getFullYear();
        const resetDateMonth = resetDate.getMonth();

        // 캘린더와 데이터를 초기화하고 다시 불러오는 함수 호출
        resetCalendar(resetDateYear, resetDateMonth);
        resetUpdateMonthYear(resetDateYear, resetDateMonth);
      }
    });

    // 캘린더 초기화 및 데이터 다시 불러오기
    function resetCalendar(year, month) {
      createCalendarWithEmptyCells(year, month);
    }
    // 캘린더 년,월 초기화
    function resetUpdateMonthYear(year, month) {
      const formattedMonth = String(month + 1).padStart(2, "0");
      document.getElementById(
        "monthYear"
      ).innerHTML = `${year}. <span>${formattedMonth}</span>`;

      currentYearCal = year;
      currentMonth = month;
    }

    /*  
    sub_tab_resultA  resultA_area 
    : 달력 생성
*/

    let currentYearCal, currentMonth;

    function handleDayClick(td, year, month, day) {
      // 이전에 선택된 날짜 초기화
      const selectedDays = document.querySelectorAll(".selected");
      selectedDays.forEach((selectedDay) => {
        selectedDay.classList.remove("selected");
      });

      //클릭된 날짜 클래스추가
      td.classList.add("selected");
      //console.log(`Selected date: ${year}-${month + 1}-${day}`);
    }

    function updateMonthYear() {
      const formattedMonth = String(currentMonth + 1).padStart(2, "0");
      document.getElementById(
        "monthYear"
      ).innerHTML = `${currentYearCal}. <span>${formattedMonth}</span>`;
    }

    document
      .getElementById("prevMonthBtn")
      .addEventListener("click", prevMonth);
    document
      .getElementById("nextMonthBtn")
      .addEventListener("click", nextMonth);

    function prevMonth() {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYearCal--;
      }
      /* 
    데이터추가를위해 추가한것 
*/
      createCalendarWithEmptyCells(
        currentYearCal,
        currentMonth,
        currentDateCal.getDate()
      ); // 변경된 함수 호출
      updateMonthYear();
    }

    function nextMonth() {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYearCal++;
      }
      createCalendarWithEmptyCells(
        currentYearCal,
        currentMonth,
        currentDateCal.getDate()
      ); // 변경된 함수 호출
      updateMonthYear();
    }

    //초기 달력 생성 (현재 월)
    const currentDateCal = new Date();
    currentYearCal = currentDateCal.getFullYear();
    currentMonth = currentDateCal.getMonth();

    updateMonthYear();

    function createCalendarWithEmptyCells(year, month, today) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfWeek = new Date(year, month, 1).getDay();

      const container = document.getElementById("calendar_table");
      container.innerHTML = "";

      const table = document.createElement("table");

      const headerRow = document.createElement("tr");
      for (let day of ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]) {
        const th = document.createElement("th");
        const p = document.createElement("p");
        p.textContent = day;
        th.appendChild(p);
        headerRow.appendChild(th);
      }
      table.appendChild(headerRow);

      let currentDay = 1;
      for (let i = 0; i < 6; i++) {
        const row = document.createElement("tr");
        let isEmptyRow = true; // 현재 행이 모두 빈 칸인지 여부를 나타냄
        for (let j = 0; j < 7; j++) {
          const td = document.createElement("td");
          if (i === 0 && j < firstDayOfWeek) {
            // 해당 월의 첫 번째 날 이전의 빈 셀
            td.textContent = "";
          } else if (currentDay > daysInMonth) {
            // 해당 월의 마지막 날 이후의 빈 셀
            td.textContent = "";
          } else {
            // 날짜로 달력을 채움
            const span = document.createElement("span"); // span 요소 생성
            span.textContent = currentDay; // span에 날짜 추가
            td.appendChild(span); // td에 span 추가
            // 클릭 이벤트 핸들러 추가

            //현재 날짜에 today클래스 붙이기
            if (
              year === currentDateCal.getFullYear() &&
              month === currentDateCal.getMonth() &&
              currentDay === currentDateCal.getDate()
            ) {
              td.classList.add("today");
            }

            span.addEventListener("click", () =>
              handleDayClick(span, year, month, currentDay)
            ); // span에 클릭 이벤트 추가
            currentDay++;
            isEmptyRow = false; // 현재 행에 실제 날짜가 채워졌으므로 빈 행이 아님을 표시
          }
          row.appendChild(td);
        }
        // 마지막 행이 모두 빈 칸이 아닌 경우에만 추가
        if (!isEmptyRow) {
          table.appendChild(row);
        }
      }

      // B타입 추가
      const ul = document.createElement("ul");

      const todayLi = document.createElement("li");
      todayLi.innerHTML = `
            <div class="date_B date_B_cont_today">
            <p>TODAY</p>
            <p>${today}</p>
        </div>
        <div class="date_B_cont date_B_cont_today_list">
       
       </div>
        `;

      // 클릭 이벤트 핸들러 추가
      todayLi.addEventListener("click", () =>
        handleDayClick(todayLi, year, month, today)
      );

      ul.appendChild(todayLi);
      // 날짜 및 요일을 표시한 li 요소 생성
      for (let i = 0; i < daysInMonth; i++) {
        const li = document.createElement("li");
        const date = i + 1;
        const dayOfWeek = (firstDayOfWeek + i) % 7; // 요일 계산
        const dayName = getDayName(dayOfWeek); // 요일 이름 가져오기

        li.innerHTML = `
         <div class="date_B">
             <p>${date}</p>
             <p>${dayName}</p>
         </div>
         <div class="date_B_cont">

     </div>

     `;

        // 클릭 이벤트 핸들러 추가
        li.addEventListener("click", () =>
          handleDayClick(li, year, month, date)
        );

        ul.appendChild(li);
      }
      container.appendChild(table);
      container.appendChild(ul);
      // 가상 데이터를 캘린더에 추가
      addVirtualDataToCalendar(year, month);
    }

    // 현재 년도와 월 가져오기
    const currentDateCalB = new Date();
    currentYearCal = currentDateCalB.getFullYear();
    currentMonth = currentDateCalB.getMonth();

    // 캘린더 생성
    createCalendarWithEmptyCells(
      currentYearCal,
      currentMonth,
      currentDateCalB.getDate()
    );

    // 요일 이름 가져오는 함수
    function getDayName(dayIndex) {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      return dayNames[dayIndex];
    }

    /* 
    sub_tab_resultA  resultA_area    
    달력 해당 날짜에 맞는 가상데이터 불러오기
*/

    function addVirtualDataToCalendar(year, month) {
      // 켈린더 테이블 요소 가져오기
      const calendarTable = document.getElementById("calendar_table");

      // 해당 월의 가상 데이터 필터링
      const filteredData = itemList.filter((data) => {
        const dateParts = data.date.split(".");
        const dataYear = parseInt(dateParts[0]);
        const dataMonth = parseInt(dateParts[1]) - 1; // JavaScript에서 월은 0부터 시작
        return year === dataYear && month === dataMonth;
      });

      // 공연 데이터만 필터링 (contents_area_performance ID가 있는 경우)
      const performanceData = filteredData.filter((data) => {
        return (
          document.getElementById("contents_area_performance") &&
          data.location !== "1전시실" &&
          data.location !== "2전시실" &&
          data.location !== "전관"
        );
      });

      // 전시 데이터만 필터링 (contents_area_exhibition ID가 있는 경우)
      const exhibitionData = filteredData.filter((data) => {
        return (
          document.getElementById("contents_area_exhibition") &&
          (data.location === "1전시실" ||
            data.location === "2전시실" ||
            data.location === "전관")
        );
      });

      // 필터링된 데이터를 합침
      const mergedData = performanceData.concat(exhibitionData);

      // 오늘 날짜 가져오기
      const todayDate = new Date();
      const todayYear = todayDate.getFullYear();
      const todayMonth = todayDate.getMonth();
      const todayDay = todayDate.getDate();

      // 오늘 날짜의 가상 데이터만 가져오기
      const todayData = mergedData.filter((data) => {
        const dateParts = data.date.split(".");
        const dataYear = parseInt(dateParts[0]);
        const dataMonth = parseInt(dateParts[1]) - 1; // JavaScript에서 월은 0부터 시작
        const dataDay = parseInt(dateParts[2]);
        return (
          todayYear === dataYear &&
          todayMonth === dataMonth &&
          todayDay === dataDay
        );
      });

      // 날짜별로 가상 데이터를 시간순으로 정렬
      const sortedDataByDay = {};
      mergedData.forEach((data) => {
        const dateParts = data.date.split(".");
        const day = parseInt(dateParts[2]);

        if (!sortedDataByDay[day]) {
          sortedDataByDay[day] = [];
        }
        sortedDataByDay[day].push(data);
      });

      // 각 날짜별로 시간순으로 정렬된 가상 데이터를 캘린더에 추가
      for (const day in sortedDataByDay) {
        if (sortedDataByDay.hasOwnProperty(day)) {
          const dataForDay = sortedDataByDay[day];
          dataForDay.sort((a, b) => {
            // 시간으로 정렬
            return a.time.localeCompare(b.time);
          });
          dataForDay.forEach((data) => {
            // 셀 내용 추가
            const div = document.createElement("div");
            div.classList.add("cal_cont");
            let locationClass = "";
            switch (data.location) {
              case "대극장":
                locationClass = "performance_g";
                break;
              case "소극장":
                locationClass = "performance_r";
                break;
              case "로비":
                locationClass = "performance_l";
                break;
              case "알토홀":
                locationClass = "performance_a";
                break;
              case "라운지":
                locationClass = "performance_s";
                break;
              case "무관중":
                locationClass = "performance_m";
                break;
              case "기타":
                locationClass = "performance_e";
                break;
              case "1전시실":
                locationClass = "exhibition_1";
                break;
              case "2전시실":
                locationClass = "exhibition_2";
                break;
              case "전관":
                locationClass = "exhibition_a";
                break;
              default:
                break;
            }

            div.innerHTML = `
                    <a href="detail.html?id=${data.id}" class="${locationClass}">
                        <div class="text_area">
                            <p class="content">${data.type}</p>
                            <span class="title">${data.title}</span>
                        </div>
                    </a>
                `;

            // 해당 날짜의 셀 찾기
            const cells = calendarTable.querySelectorAll("td");
            cells.forEach((cell) => {
              if (parseInt(cell.textContent) === parseInt(day)) {
                cell.appendChild(div);
              }
            });

            // 해당 날짜의 li 요소 찾기
            const lis = calendarTable.querySelectorAll("li");
            lis.forEach((li) => {
              const dayText = li.querySelector(
                ".date_B p:first-child"
              ).textContent; // .date_B 내의 첫 번째 p 요소 선택
              if (parseInt(dayText) === parseInt(day)) {
                // .date_B_cont 내에 div 추가
                const dateBCont = li.querySelector(".date_B_cont");
                dateBCont.appendChild(div.cloneNode(true)); // 새로운 요소를 복제하여 추가
              }
            });
          });
        }
      }

      // today 부분의 데이터 추가
      const todayLi = calendarTable.querySelector(".date_B_cont_today");
      const dateBCont = todayLi.nextElementSibling;
      todayData.forEach((data) => {
        const divB = document.createElement("div");
        divB.classList.add("cal_cont");
        let locationClass = "";
        switch (data.location) {
          case "대극장":
            locationClass = "performance_g";
            break;
          case "소극장":
            locationClass = "performance_r";
            break;
          case "로비":
            locationClass = "performance_l";
            break;
          case "알토홀":
            locationClass = "performance_a";
            break;
          case "라운지":
            locationClass = "performance_s";
            break;
          case "무관중":
            locationClass = "performance_m";
            break;
          case "기타":
            locationClass = "performance_e";
            break;
          case "1전시실":
            locationClass = "exhibition_1";
            break;
          case "2전시실":
            locationClass = "exhibition_2";
            break;
          case "전관":
            locationClass = "exhibition_a";
            break;
          default:
            break;
        }

        divB.innerHTML = `
        <a href="detail.html?id=${data.id}" class="${locationClass}">
                <div class="text_area">
                    <p class="content">${data.type}</p>
                    <span class="title">${data.title}</span>
                </div>
            </a>
        `;

        // today 부분에 데이터 추가
        dateBCont.appendChild(divB);
      });
    }

    /* 
    sub_tab_resultA  resultA_area    
    달력 밑에 공연, 전시 에 따른 장소 불러오기
*/

    // 대극장, 소극장, 로비, 알토홀, 라운지, 무관중, 기타에 해당하는 요소들을 생성하는 함수
    function createPerformanceList() {
      const locations = [
        "대극장",
        "소극장",
        "로비",
        "알토홀",
        "라운지",
        "무관중",
        "기타",
      ];
      const listContainer = document.querySelector(".calendar_typeList");
      if (!listContainer) return;

      for (let i = 0; i < locations.length; i++) {
        listContainer.innerHTML += `
            <li class="${getPerformanceLocationClass(locations[i])}">
                <span>${locations[i]}</span>
            </li>
        `;
      }
    }

    // 1전시실, 2전시실, 전관에 해당하는 요소들을 생성하는 함수
    function createExhibitionList() {
      const exhibitions = ["1전시실", "2전시실", "전관"];
      const listContainer = document.querySelector(".calendar_typeList");
      if (!listContainer) return;

      for (let i = 0; i < exhibitions.length; i++) {
        listContainer.innerHTML += `
            <li class="${getExhibitionLocationClass(exhibitions[i])}">
                <span>${exhibitions[i]}</span>
            </li>
        `;
      }
    }

    // 위치에 따라 해당하는 리스트를 생성하는 함수
    function createLists() {
      const performanceContainer = document.getElementById(
        "contents_area_performance"
      );
      if (performanceContainer) {
        createPerformanceList();
      }

      const exhibitionContainer = document.getElementById(
        "contents_area_exhibition"
      );
      if (exhibitionContainer) {
        createExhibitionList();
      }
    }

    // createLists 함수 호출하여 리스트 생성
    createLists();

    // 위치에 따라 해당하는 클래스를 반환하는 함수
    function getPerformanceLocationClass(location) {
      switch (location) {
        case "대극장":
          return "performance_g";
        case "소극장":
          return "performance_r";
        case "로비":
          return "performance_l";
        case "알토홀":
          return "performance_a";
        case "라운지":
          return "performance_s";
        case "무관중":
          return "performance_m";
        case "기타":
          return "performance_e";
        default:
          return "";
      }
    }

    // 위치에 따라 해당하는 클래스를 반환하는 함수
    function getExhibitionLocationClass(location) {
      switch (location) {
        case "1전시실":
          return "exhibition_1";
        case "2전시실":
          return "exhibition_2";
        case "전관":
          return "exhibition_a";
        default:
          return "";
      }
    }

    /* 
    검색 A버튼 : 필터 조건에 따라 결과 보여지기
*/
    // 1) 버튼 클릭시 필터 조건 정보 가져오기
    const searchButtonA = document.querySelector(
      '.search_selectA button[type="submit"]'
    );
    searchButtonA.addEventListener("click", () => {
      const calenderArea = document.querySelector(".calender_area");
      calenderArea.style.display = "none";

      const resultAArea = document.querySelector(".resultA_area");
      resultAArea.style.display = "block";

      clearContents();

      /*     let bca = null; */
      const startDateInput = document.querySelector(
        ".date_selectA .date_details_area1 input.date_details"
      );
      const endDateInput = document.querySelector(
        ".date_selectA .date_details_area2 input.date_details"
      );
      const typeInputs = document.querySelectorAll(
        '.type_selectA input[type="radio"]'
      );
      const locationSelect = document.querySelector(".location_select");
      const searchInput = document.querySelector(
        ".search_selectA input.search_barA"
      );

      //검색 - 기간선택 정보 가져오기
      const startDate = startDateInput.value.replace(/-/g, "."); // -를 .으로 대체
      const endDate = endDateInput.value.replace(/-/g, ".");

      //검색 - 구분선택 정보 가져오기
      let selectedType = "";
      typeInputs.forEach((input) => {
        if (input.checked) {
          selectedType = input.nextElementSibling.textContent.trim();
        }
      });

      //검색 - 장소선택 정보 가져오기
      let selectedLocation = "";
      if (locationSelect.selectedIndex !== 0) {
        selectedLocation =
          locationSelect.options[locationSelect.selectedIndex].textContent;
      }

      //검색 - 통합검색 정보 가져오기
      const keyword = searchInput.value.trim();

      //console.log("시작일:", startDate);
      //console.log("종료일:", endDate);
      //console.log("구분:", selectedType);
      //console.log("장소:", selectedLocation);
      //console.log("검색어:", keyword);
      //console.log("검색 시작...");

      // 필터링 함수를 이용하여 검색 조건에 맞는 결과를 콘솔에 출력
      let filteredItemsA = filterItemsA(
        startDate,
        endDate,
        selectedType,
        selectedLocation,
        keyword
      );
      //console.log("검색 결과:", filteredItemsA);
      //console.log("--------------");

      const progressData = listProgress(filteredItemsA);

      mainContentsList(progressData);
      pageNation(filteredItemsA);
    });

    function clearContents() {
      const swiperSelector = document.querySelector(
        "#contents_area_performance_resultA"
      )
        ? "#contents_area_performance_resultA"
        : "#contents_area_exhibition_resultA";

      let swiperWrapper = document.querySelector(swiperSelector);

      swiperWrapper.innerHTML = "";
    }

    // 2) 필터 조건 정보( 1)번 )에 따라 결과
    function filterItemsA(startDate, endDate, type, location, keyword) {
      let resultItems = listByDate;
      // 검색 결과를 저장할 배열을 초기화합니다.

      // 기간 선택에 해당하는 항목 필터링
      if (startDate && endDate) {
        resultItems = resultItems.filter((item) => {
          const itemDate = item.date;
          return itemDate >= startDate && itemDate <= endDate;
        });
      }

      // 구분 선택에 해당하는 항목 필터링 (구분은 무조건 포함)
      if (type && type !== "전체") {
        resultItems = resultItems.filter((item) => item.type === type);
      }

      // 장소 선택에 해당하는 항목 필터링 (장소 선택되었을 경우에만)
      if (location) {
        resultItems = resultItems.filter((item) => item.location === location);
      }

      // 통합 검색에 해당하는 항목 필터링 (검색어가 입력되었을 경우에만)
      if (keyword) {
        const regex = new RegExp(
          keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i"
        );
        resultItems = resultItems.filter((item) => regex.test(item.title));
      }

      return resultItems;
    }

    /* 
    공연/전시 list를 결과영역에 추가
*/

    // 1) list를 결과영역에 추가하는 함수
    function addSlide(data) {
      const resultArea =
        data.content === "공연"
          ? "#contents_area_performance_resultA"
          : "#contents_area_exhibition_resultA";

      let contentsArea = document.querySelector(`${resultArea}`);

      if (!contentsArea && data.content === "전시") {
        contentsArea = document.querySelector(`${resultArea}`);
      }
      if (!contentsArea) return;

      const performancePlan = `
    <li>
    <a href="detail.html?id=${data.id}">
      <div class="img_area">
        <img src=".${data.imgSrc}" alt="" onerror="this.style.display='none'">
        <div class="imgCover">
          <div class="view_more">
            <span class="width_line"></span>
            <span class="height_line"></span>
          </div>
        </div>
      </div>
      <div class="text_area">
        <p class="title">${data.title}</p>
        <dl>
            <dt>공연일자</dt>
            <dd>${data.dateDetails}</dd>
        </dl>
        <dl>
            <dt>공연시간</dt>
            <dd>${data.time}</dd>
        </dl>
        <dl>
            <dt>입장료</dt>
            <dd>${data.price}</dd>
        </dl>
        <p class="reservation">예약하기</p>
      </div>
    </a>
  </li>
  `;

      contentsArea.innerHTML += performancePlan; //
    }

    // 2)  list를 결과영역에 추가하는 함수( 1)번 )를   해당 컨텐츠(공연,전시)에 맞게 추가
    function mainContentsList(data) {
      const {
        performanceScheduled,
        exhibitionScheduled,
        performanceCompleted,
        exhibitionCompleted,
      } = data;
      // 공연 예정
      performanceScheduled.forEach((data) => {
        addSlide(data, "#contents_area_performance_resultA");
      });

      // 전시 예정
      exhibitionScheduled.forEach((data) => {
        addSlide(data, "#contents_area_exhibition_resultA");
      });

      // 공연 완료
      performanceCompleted.forEach((data) => {
        addSlide(data, "#contents_area_performance_resultA");
      });

      // 전시 완료
      exhibitionCompleted.forEach((data) => {
        addSlide(data, "#contents_area_exhibition_resultA");
      });
    }

    /* 
    페이지네이션 및 페이지 당 보여질 list개수
*/

    function pageNation(event) {
      const contentsAreaSelector = document.querySelector(
        "#contents_area_performance_resultA"
      )
        ? "#contents_area_performance_resultA"
        : "#contents_area_exhibition_resultA";
      let contentsAreaResult = document.querySelector(contentsAreaSelector);

      const itemsPerPage = 8; // 한 페이지당 보여질 아이템 개수
      const pageButtonsLimit = 5; // 한 번에 표시될 페이지 버튼의 개수

      let performanceItems = event.filter((item) => item.content === "공연");
      let exhibitionItems = event.filter((item) => item.content === "전시");

      let totalPerformanceItems = performanceItems.length;
      let totalExhibitionItems = exhibitionItems.length;
      console.log("totalPerformanceItems : ", totalPerformanceItems);
      console.log("totalExhibitionItems : ", totalExhibitionItems);
      let totalItems = contentsAreaSelector.includes("performance")
        ? totalPerformanceItems
        : totalExhibitionItems;

      let currentPage = 1;

      //공연,전시 의 개수 추가
      const totalItemsTitleTop = contentsAreaSelector.includes("performance")
        ? "공연"
        : "전시";
      const totalItemsTitle = contentsAreaSelector.includes("performance")
        ? "공연이"
        : "전시가";
      let resultNameTop = document.querySelector(".result_name_top");
      resultNameTop.textContent = totalItemsTitleTop;
      let resultName = document.querySelector(".result_name");
      resultName.textContent = totalItemsTitle;
      let resultNum = document.querySelector(".result_num");
      resultNum.textContent = totalItems;

      // 페이지네이션 생성 함수
      function renderPagination() {
        if (contentsAreaResult) {
          const totalPage = Math.ceil(totalItems / itemsPerPage);
          const paginationList = document.getElementById("pagination");
          paginationList.innerHTML = "";

          // 페이지 버튼 추가
          const startPage =
            Math.floor((currentPage - 1) / pageButtonsLimit) *
              pageButtonsLimit +
            1;
          const endPage = Math.min(startPage + pageButtonsLimit - 1, totalPage);
          for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement("li");
            pageButton.classList.add("paginationNum");
            pageButton.innerHTML = `<a href="#" data-page="${i}">${i}</a>`;
            pageButton.addEventListener("click", moveToPage);
            if (i === currentPage) {
              pageButton.classList.add("active");
            }
            paginationList.appendChild(pageButton);
          }

          // 이전 페이지로 이동하는 버튼 추가
          if (startPage > 1) {
            const prevPageButton = document.createElement("li");
            prevPageButton.classList.add("paginationBox_prev");
            prevPageButton.innerHTML =
              '<a href="#" id="prev"><span></span></a>';
            prevPageButton.addEventListener("click", moveToPrevPage);
            paginationList.prepend(prevPageButton); // 이전 버튼을 페이지 버튼 앞에 추가
          }

          // 다음 페이지로 이동하는 버튼 추가
          if (endPage < totalPage) {
            const nextPageButton = document.createElement("li");
            nextPageButton.classList.add("paginationBox_next");
            nextPageButton.innerHTML =
              '<a href="#" id="next"><span></span></a>';
            nextPageButton.addEventListener("click", moveToNextPage);
            paginationList.appendChild(nextPageButton);
          }

          // 첫 페이지로 이동하는 버튼 추가
          const firstPageButton = document.createElement("li");
          firstPageButton.classList.add("paginationBox_first");
          firstPageButton.innerHTML =
            '<a href="#" id="first"><span></span></a>';
          firstPageButton.addEventListener("click", moveToFirstPage);
          paginationList.prepend(firstPageButton); // 첫 페이지 버튼을 페이지 버튼 앞에 추가

          // 마지막 페이지로 이동하는 버튼 추가
          const lastPageButton = document.createElement("li");
          lastPageButton.classList.add("paginationBox_last");
          lastPageButton.innerHTML = '<a href="#" id="last"><span></span></a>';
          lastPageButton.addEventListener("click", moveToLastPage);
          paginationList.appendChild(lastPageButton);
        }
      }

      // 페이지네이션 및 아이템 렌더링 함수
      function renderItems(pageNumber) {
        if (contentsAreaResult) {
          const startIndex = (pageNumber - 1) * itemsPerPage;
          const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

          for (let i = 0; i < contentsAreaResult.children.length; i++) {
            contentsAreaResult.children[i].style.display =
              i >= startIndex && i < endIndex ? "block" : "none";
          }
        }
      }

      // 페이지가 로드된 후에 초기 렌더링을 수행하는 함수
      renderPagination();
      renderItems(currentPage);

      // 페이지 이동 함수
      function moveToPage(event) {
        event.preventDefault();
        currentPage = parseInt(event.target.dataset.page);
        renderItems(currentPage);
        renderPagination();
      }

      // 이전 페이지로 이동하는 함수
      function moveToPrevPage(event) {
        event.preventDefault();
        const totalPage = Math.ceil(totalItems / itemsPerPage);

        // 현재 페이지 그룹의 첫 번째 페이지 계산
        const firstPageOfCurrentGroup = Math.max(
          Math.floor((currentPage - 1) / pageButtonsLimit) * pageButtonsLimit +
            1,
          1
        );

        // 이전 페이지 그룹의 첫 번째 페이지 계산
        const firstPageOfPrevGroup = Math.max(
          firstPageOfCurrentGroup - pageButtonsLimit,
          1
        );

        // 이전 페이지 그룹의 첫 번째 페이지로 이동
        currentPage = firstPageOfPrevGroup;
        renderItems(currentPage);
        renderPagination();
      }

      // 다음 페이지로 이동하는 함수
      function moveToNextPage(event) {
        event.preventDefault();
        const totalPage = Math.ceil(totalItems / itemsPerPage);
        const lastPageOfCurrentGroup = Math.min(
          Math.ceil(currentPage / 5) * 5,
          totalPage
        );
        if (lastPageOfCurrentGroup < totalPage) {
          currentPage = lastPageOfCurrentGroup + 1;
          renderItems(currentPage);
          renderPagination();
        }
      }

      // 첫 페이지로 이동하는 함수
      function moveToFirstPage(event) {
        event.preventDefault();
        currentPage = 1;
        renderItems(currentPage);
        renderPagination();
      }

      // 마지막 페이지로 이동하는 함수
      function moveToLastPage(event) {
        event.preventDefault();
        currentPage = Math.ceil(totalItems / itemsPerPage);
        renderItems(currentPage);
        renderPagination();
      }
    }

    /* 
    검색 영역의 typeB 년도만 표시되는 달력 
*/

    const dateInput = document.getElementById("dateInput");
    const dateBox = document.getElementById("dateBox");
    const prevYearBtn = document.getElementById("prevYearBtn");
    const nextYearBtn = document.getElementById("nextYearBtn");

    let currentYear = new Date().getFullYear(); // 현재 년도 가져오기
    dateBox.textContent = currentYear; // span 요소에 현재 년도 표시
    dateInput.value = currentYear; // 숨겨진 input 요소에도 값 설정

    prevYearBtn.addEventListener("click", function () {
      currentYear--;
      updateYear(currentYear);
    });

    nextYearBtn.addEventListener("click", function () {
      currentYear++;
      updateYear(currentYear);
    });

    function updateYear(year) {
      currentYear = year;
      dateBox.textContent = currentYear;
      dateInput.value = currentYear;

      //데이터도 초기화 시키기
      const yearButtons = document.querySelectorAll(".sub_tab_searchB .btn");
      yearButtons.forEach((button) => {
        button.addEventListener("click", function () {
          if (button.id === "prevYearBtn") {
            currentYear--;
          } else if (button.id === "nextYearBtn") {
            currentYear++;
          }
          dateBox.textContent = currentYear;
          dateInput.value = currentYear;
        });
      });
    }

    /* 
    검색 B버튼 : 필터 조건에 따라 결과 보여지기
*/
    // 1) 버튼 클릭시 필터 조건 정보 가져오기
    /* const searchButtonB = document.querySelector('.search_selectB'); */
    const searchButtonB = document.querySelector(
      '.search_selectB button[type="submit"]'
    );
    searchButtonB.addEventListener("click", () => {
      clearContentsB();

      const typeInputs = document.querySelectorAll(
        '.type_selectB input[type="radio"]'
      );
      const searchInput = document.querySelector(
        ".search_selectB input.search_barB"
      );

      //검색 - 기간선택 정보 가져오기
      const sellectDateInput = dateInput.value;

      //검색 - 구분선택 정보 가져오기
      let selectedType = "";
      typeInputs.forEach((input) => {
        if (input.checked) {
          selectedType = input.nextElementSibling.textContent.trim();
        }
      });

      //검색 - 통합검색 정보 가져오기
      const keyword = searchInput.value.trim();

      //console.log("년도:", sellectDateInput);
      //console.log("구분:", selectedType);
      //console.log("검색어:", keyword);
      //console.log("검색 시작...");

      // 필터링 함수를 이용하여 검색 조건에 맞는 결과를 콘솔에 출력
      let filteredItemsB = filterItemsB(
        sellectDateInput,
        selectedType,
        keyword
      );
      //console.log("검색 결과:", filteredItemsB);
      //console.log("--------------");

      addSlideB(filteredItemsB);
    });

    function clearContentsB() {
      let swiperWrapper = document.querySelector(".resultB_area .date_area");

      swiperWrapper.innerHTML = "";
    }

    function filterItemsB(sellectDateInput, selectedType, keyword) {
      let resultItems = listByDate;

      // 기간 선택에 해당하는 항목 필터링
      if (sellectDateInput) {
        resultItems = resultItems.filter((item) => {
          const itemYear = new Date(item.date).getFullYear();
          return itemYear === parseInt(sellectDateInput);
        });
      }

      // 구분 선택에 해당하는 항목 필터링 (구분은 무조건 포함)
      if (selectedType && selectedType !== "전체") {
        resultItems = resultItems.filter((item) => item.type === selectedType);
      }

      // 통합 검색에 해당하는 항목 필터링 (검색어가 입력되었을 경우에만)
      if (keyword) {
        const regex = new RegExp(
          keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i"
        );
        resultItems = resultItems.filter((item) => regex.test(item.title));
      }

      console.log(resultItems);

      return resultItems;
    }

    window.addEventListener("DOMContentLoaded", () => {
      addSlideB(listByDate);
    });

    /* 
    공연/전시 list를 결과영역에 추가
*/

    // 1) list를 결과영역에 추가하는 함수
    function addSlideB(e) {
      const groupedItems = {};

      // 검색된 결과를 각 월에 맞게 그룹화
      e.forEach((item) => {
        const monthItem = item.date.split(".")[1];
        if (!groupedItems[monthItem]) {
          groupedItems[monthItem] = [];
        }
        groupedItems[monthItem].push(item);
      });
      console.log("groupedItems5", groupedItems);

      // 현재 표시된 데이터의 월을 저장
      const currentDisplayedMonths = document.querySelectorAll(".date_area");

      // 각 월에 해당하는 데이터를 화면에 표시
      Object.keys(groupedItems).forEach((monthItem) => {
        const ulList = document.querySelector(
          `.date_area.date_area${monthItem}`
        );
        if (ulList) {
          ulList.innerHTML = "";
          // 해당 월에 속하는 아이템들을 리스트에 추가
          groupedItems[monthItem].forEach((item) => {
            // 삼항 연산자를 사용하여 해당 컨텐츠 타입에 따라 추가
            const targetId = document.getElementById(
              "contents_area_performance_resultB"
            )
              ? "contents_area_performance_resultB"
              : "contents_area_exhibition_resultB";
            if (
              (targetId === "contents_area_performance_resultB" &&
                item.content === "공연") ||
              (targetId === "contents_area_exhibition_resultB" &&
                item.content === "전시")
            ) {
              const li = document.createElement("li");

              // 아이템 타입에 따라 클래스 추가
              let itemTypeClass = "";
              switch (item.type) {
                case "기획":
                  itemTypeClass = "plan";
                  break;
                case "대관":
                  itemTypeClass = "rental";
                  break;
                case "후원":
                  itemTypeClass = "support";
                  break;
                default:
                  break;
              }

              li.innerHTML = `
                        <span class="resultB_date">${item.date.slice(2)}</span>
                        <a href="detail.html?id=${
                          item.id
                        }" class="resultB_title">
                            <span class="resultB_type ${itemTypeClass}">${
                item.type
              }</span>
                            ${item.title}
                        </a>
                    `;
              ulList.appendChild(li);
            }
          });
        } else {
          console.log(`No ul element found for monthItem ${monthItem}`);
        }
      });

      // 이전에 표시된 데이터의 월 중에서 현재 표시된 월이 아닌 것은 삭제
      currentDisplayedMonths.forEach((month) => {
        const monthNumber = month.classList[1].split("date_area")[1];
        if (!groupedItems[monthNumber]) {
          month.innerHTML = "";
        }
      });
    }
  })
  .catch((error) => console.error("Error:", error));
