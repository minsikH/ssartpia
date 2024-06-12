fetch("../data.json")
  .then((response) => response.json())
  .then((data) => {
    const academyList = data.academyList;

    /* 
    0. 현재 시간
*/
    // 현재 날짜를 가져오는 함수
    function getCurrentDate() {
      const currentDate = new Date();
      // 현재 날짜를 YYYY.MM.DD 형식으로 반환
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      return `${year}.${month}.${day}`;
    }

    /* 
    1. 가상아이템 -> 시간 순으로 나열
*/
    // academyList를 dateDetails의 시작일을 기준으로 정렬
    const listByDate = academyList.sort((a, b) => {
      // dateDetails에서 시작일과 종료일을 추출
      const [startDateA, endDateA] = a.dateDetails.split(" ~ ");
      const [startDateB, endDateB] = b.dateDetails.split(" ~ ");

      // 오른쪽 날짜가 현재 날짜보다 지난 경우 맨 뒤로 이동
      if (endDateA < getCurrentDate()) return 1;
      if (endDateB < getCurrentDate()) return -1;

      // 날짜를 비교하여 정렬
      return new Date(startDateA) - new Date(startDateB);
    });

    /* 
    2. 결과
*/

    const tabLinks = document.querySelectorAll(".filter-tab");
    const semesterSelect = document.querySelector(".semester_select");
    const progressSelect = document.querySelector(".progress_select");
    const searchLecturerInput = document.querySelector(".search_bar_lecturer");
    const searchTitleInput = document.querySelector(".search_bar_title");
    const resultList = document.querySelector(".result_list_area");
    const resultNumElement = document.querySelector(".result_num");

    let currentType = "all"; // 현재 선택된 타입을 추적
    let currentPage = 1; // 현재 페이지를 추적
    const itemsPerPage = 10; // 한 페이지당 보여질 아이템 개수
    const pageButtonsLimit = 5; // 한 번에 표시될 페이지 버튼의 개수

    // 필터링 함수를 정의
    function filterItems(item) {
      const semesterMap = {
        "1학기": "1",
        "2학기": "2",
        여름특강: "3",
        겨울특강: "4",
      };
      const progressMap = {
        접수중: "1",
        접수마감: "2",
      };
      const semesterFilter =
        semesterSelect.value === "0" ||
        semesterMap[item.semester] === semesterSelect.value;
      const progressFilter =
        progressSelect.value === "0" ||
        progressMap[item.progress] === progressSelect.value;
      const lecturerFilter =
        searchLecturerInput.value.trim() === "" ||
        item.lecturer.includes(searchLecturerInput.value.trim());
      const titleFilter =
        searchTitleInput.value.trim() === "" ||
        item.title.includes(searchTitleInput.value.trim());
      const typeFilter = currentType === "all" || item.type === currentType;
      return (
        semesterFilter &&
        progressFilter &&
        lecturerFilter &&
        titleFilter &&
        typeFilter
      );
    }

    tabLinks.forEach((tab) => {
      tab.addEventListener("click", function () {
        resetFilter();
        // 현재 선택된 탭의 부모 li에 "on" 클래스를 추가하고, 나머지 li에서는 제거
        tab.parentElement.parentElement
          .querySelectorAll("li")
          .forEach((li) => li.classList.remove("on"));
        tab.parentElement.classList.add("on");

        currentType = this.dataset.type; // 현재 선택된 타입을 업데이트
        currentPage = 1; // 새로운 탭이 선택되었으므로 페이지를 초기화
        // 필터링된 결과를 표시
        showFilteredResults();
      });
    });
    // 필터 초기화 함수
    function resetFilter() {
      const selects = document.querySelectorAll(".sub_tab_searchA select");
      const searchInputs = document.querySelectorAll(
        '.sub_tab_searchA input[type="text"]'
      );

      selects.forEach((select) => {
        select.selectedIndex = 0;
      });

      searchInputs.forEach((searchInput) => {
        searchInput.value = "";
      });
    }

    // 통합 검색 버튼을 클릭했을 때 필터링 결과를 업데이트
    document
      .querySelector(".search_selectA")
      .addEventListener("click", function () {
        currentPage = 1; // 검색이 다시 시작되므로 페이지를 초기화
        showFilteredResults();
      });

    // 페이지 이동 함수
    function moveToPage(event) {
      event.preventDefault();
      currentPage = parseInt(event.target.dataset.page);
      renderItems(currentPage);
      renderPagination();
    }

    // 페이지네이션을 렌더링하는 함수
    function renderPagination() {
      if (resultNumElement) {
        const totalPage = Math.ceil(
          resultNumElement.textContent / itemsPerPage
        );
        const paginationList = document.getElementById("pagination");
        paginationList.innerHTML = "";

        // 페이지 버튼 추가
        const startPage =
          Math.floor((currentPage - 1) / pageButtonsLimit) * pageButtonsLimit +
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
          prevPageButton.innerHTML = '<a href="#" id="prev"><span></span></a>';
          prevPageButton.addEventListener("click", moveToPrevPage);
          paginationList.prepend(prevPageButton); // 이전 버튼을 페이지 버튼 앞에 추가
        }

        // 다음 페이지로 이동하는 버튼 추가
        if (endPage < totalPage) {
          const nextPageButton = document.createElement("li");
          nextPageButton.classList.add("paginationBox_next");
          nextPageButton.innerHTML = '<a href="#" id="next"><span></span></a>';
          nextPageButton.addEventListener("click", moveToNextPage);
          paginationList.appendChild(nextPageButton);
        }

        // 첫 페이지로 이동하는 버튼 추가
        const firstPageButton = document.createElement("li");
        firstPageButton.classList.add("paginationBox_first");
        firstPageButton.innerHTML = '<a href="#" id="first"><span></span></a>';
        firstPageButton.addEventListener("click", moveToFirstPage);
        paginationList.prepend(firstPageButton); // 첫 페이지 버튼을 페이지 버튼 앞에 추가

        // 마지막 페이지로 이동하는 버튼 추가
        const lastPageButton = document.createElement("li");
        lastPageButton.classList.add("paginationBox_last");
        lastPageButton.innerHTML = '<a href="#" id="last"><span></span></a>';
        lastPageButton.addEventListener("click", moveToLastPage);
        paginationList.appendChild(lastPageButton);

        // 페이지가 변경될 때마다 아이템을 렌더링
        renderItems(currentPage);
      }
    }

    // 이전 페이지로 이동하는 함수
    function moveToPrevPage(event) {
      event.preventDefault();
      const totalPage = Math.ceil(resultList.children.length / itemsPerPage);

      // 현재 페이지 그룹의 첫 번째 페이지 계산
      const firstPageOfCurrentGroup = Math.max(
        Math.floor((currentPage - 1) / pageButtonsLimit) * pageButtonsLimit + 1,
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
      const totalPage = Math.ceil(resultList.children.length / itemsPerPage);
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
      const totalPage = Math.ceil(resultNumElement.textContent / itemsPerPage);
      currentPage = totalPage;
      renderItems(currentPage);
      renderPagination();
    }

    // 페이지네이션 및 아이템 렌더링 함수
    function renderItems(pageNumber) {
      const startIndex = (pageNumber - 1) * itemsPerPage;
      const endIndex = Math.min(
        startIndex + itemsPerPage,
        resultList.children.length
      );

      for (let i = 0; i < resultList.children.length; i++) {
        resultList.children[i].style.display =
          i >= startIndex && i < endIndex ? "flex" : "none";
      }
    }

    // 초기에 필터링된 결과를 표시
    showFilteredResults();

    function showFilteredResults() {
      // 필터링된 결과를 초기화
      resultList.innerHTML = "";
      // 선택된 타입과 일치하는 항목만 표시
      const filteredItems =
        currentType === "all"
          ? listByDate
          : listByDate.filter((item) => item.type === currentType);
      // 추가적인 검색 조건을 적용
      const results = filteredItems.filter(filterItems);

      // 날짜 형식 변환 함수 수정
      function formatDateString(dateString) {
        const [startDate, endDate] = dateString.split(" ~ ");
        const startFormatted = formatSingleDate(startDate);
        const endFormatted = formatSingleDate(endDate);

        return `${startFormatted} <span> ~ </span> ${endFormatted}`;
      }

      // 개별 날짜 형식 변환 함수
      function formatSingleDate(dateString) {
        const [fullDate, weekday] = dateString.split("(");
        const [year, month, day] = fullDate.split(".");
        const formattedYear = year.slice(2); // 년도를 두 자리 숫자로 표시
        return `${formattedYear}.${month}.${day}<span>(${weekday}</span>`;
      }

      results.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `    <a href="detail.html?id=${item.id}">
                                  <div class="contList_date">
                                      <i>${item.progress}</i>
                                      <span>${formatDateString(
                                        item.dateDetails
                                      )}</span>
                                  </div>
                                  <div class="contList_info">
                                      <p>[${item.type}] ${item.title}</p>
                                      <div class="dlList">
                                          <dl>
                                              <dt>구분</dt>
                                              <dd>${item.type}</dd>
                                          </dl>
                                          <dl>
                                              <dt>강사</dt>
                                              <dd>${item.lecturer}</dd>
                                          </dl>
                                          <dl>
                                              <dt>수강료</dt>
                                              <dd>${item.price}</dd>
                                          </dl>
                                          <dl>
                                              <dt style="display: none;">접수상태</dt>
                                              <dd class="progress_type ${
                                                item.progress === "접수중"
                                                  ? "on"
                                                  : ""
                                              }">${item.progress}</dd>
                                          </dl>
                                      </div>
                                  </div>
                              </a>
                              <span class="progress_btn ${
                                item.progress === "접수중" ? "on" : ""
                              }">
                                <a href="javascript:;">${
                                  item.progress === "접수중"
                                    ? "접수신청"
                                    : "접수마감"
                                }</a>
                              </span>`;
        resultList.appendChild(listItem);
      });
      // 검색된 결과의 갯수를 표시
      resultNumElement.textContent = results.length;

      // 필터링된 결과가 변경시 페이지네이션을 다시 렌더링
      renderPagination();
    }
  })
  .catch((error) => console.error("Error:", error));
