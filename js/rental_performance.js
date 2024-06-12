fetch("../data.json")
  .then((response) => response.json())
  .then((data) => {
    const rentalPerformanceList = data.rentalPerformanceList;
    /* 
  탭 
*/

    const tabLinks = document.querySelectorAll(".sub_tab > li");
    const resultItems = document.querySelectorAll(".sub_tab_result > div");

    function activateTab(index) {
      tabLinks.forEach((li) => li.classList.remove("on"));
      tabLinks[index].classList.add("on");

      resultItems.forEach((item) => item.classList.remove("on"));
      resultItems[index].classList.add("on");
    }

    // URL 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");

    // URL 파라미터에 해당하는 탭 활성화
    if (tabParam) {
      const tabIndex = Array.from(tabLinks).findIndex(
        (tab) => tab.querySelector(".filter-tab").dataset.tab === tabParam
      );
      if (tabIndex > -1) {
        activateTab(tabIndex);
      }
    } else {
      // URL 파라미터가 없으면 첫 번째 탭 활성화
      activateTab(0);
    }

    tabLinks.forEach((tab, index) => {
      tab.addEventListener("click", function () {
        activateTab(index);
      });
    });

    /* 
  text_area_text > li 중에서  자식요소에 text_area_note 있는경우 text_area_text > li에 before요소제거 
*/

    const textAreaTextItems = document.querySelectorAll(".text_area_text > li");

    textAreaTextItems.forEach((item) => {
      const hasNote = item.querySelector(".text_area_note");

      if (hasNote) {
        item.classList.add("before_off");
      }
    });

    /* 
    검색부분 슬라이드 다운 
*/
    $(document).ready(function () {
      let $arrowIcon = $(".select_box").find("img");

      $(".sub_tab_searchA > .select_box > a").click(function (e) {
        e.preventDefault();

        let $selectBox = $(this).closest(".select_box");
        let $optionList = $selectBox.find(".select_box_option");

        if ($selectBox.hasClass("on")) {
          $optionList.slideUp();
          $selectBox.removeClass("on");
          $arrowIcon.css("transform", "rotate(0deg)");
        } else {
          $(".select_box_option").slideUp();
          $(".select_box").removeClass("on");
          $optionList.slideDown();
          $selectBox.addClass("on");
          $arrowIcon.css("transform", "rotate(180deg)");
        }
      });

      // select_box_option 안의 li>a를 클릭할 때
      $(".select_box_option li a").click(function (e) {
        e.preventDefault();

        let newText = $(this).text(); // 클릭된 요소의 텍스트 가져오기

        let $selectBox = $(this).closest(".select_box");
        let $selectText = $selectBox.find("> a > span");

        $selectText.text(newText); // span 텍스트 교체
        $(".select_box_option").slideUp(500);
        $arrowIcon.css("transform", "rotate(0deg)");
      });

      // select_box 영역에서 마우스가 나갈 때
      $(".select_box").on("mouseleave", function () {
        let $optionList = $(this).find(".select_box_option");
        $optionList.slideUp();
        $(this).removeClass("on");
        $arrowIcon.css("transform", "rotate(0deg)");
      });

      accordion();
    });

    /* 
  아코디언 
*/
    function accordion() {
      $(".contentText").hide();

      $(".contentTitle").click(function () {
        let $contentText = $(this).next().find(".contentText");

        $contentText.slideToggle();

        $(".contentText").not($contentText).slideUp();
      });
    }

    /* 
  결과
*/

    const tabLinksB = document.querySelector(".filter-tab.filterOn");

    const searchInput = document.querySelector(".search_bar_input");

    const resultList = document.querySelector(".result_list_area > tbody");

    let currentType = "all"; // 현재 선택된 타입을 추적
    let currentPage = 1; // 현재 페이지를 추적
    const itemsPerPage = 20; // 한 페이지당 보여질 아이템 개수
    const pageButtonsLimit = 5; // 한 번에 표시될 페이지 버튼의 개수

    // 필터링 함수를 정의
    function filterItems(item) {
      const searchText = searchInput.value.trim().toLowerCase(); // 검색어를 소문자로 변환
      const selectBoxResult = document
        .querySelector(".select_box_result")
        .textContent.trim(); // select_box_result의 텍스트를 가져옴

      // 전체 타입일 때는 모든 항목을 필터링
      if (selectBoxResult === "전체") {
        return (
          item.title.toLowerCase().includes(searchText) ||
          item.writer.toLowerCase().includes(searchText) ||
          item.noticeNum.toLowerCase().includes(searchText) ||
          item.text.toLowerCase().includes(searchText) ||
          item.date.toLowerCase().includes(searchText) ||
          item.boss.toLowerCase().includes(searchText)
        );
      }

      // 제목 타입일 때는 제목만 필터링
      if (selectBoxResult === "제목") {
        return item.title.toLowerCase().includes(searchText);
      }

      // 작성자 타입일 때는 작성자만 필터링
      if (selectBoxResult === "작성자") {
        return item.writer.toLowerCase().includes(searchText);
      }

      // 내용 타입일 때는 공고 번호, 내용, 관장만 필터링
      if (selectBoxResult === "내용") {
        return (
          item.noticeNum.toLowerCase().includes(searchText) ||
          item.text.toLowerCase().includes(searchText) ||
          item.date.toLowerCase().includes(searchText) ||
          item.boss.toLowerCase().includes(searchText)
        );
      }

      console.log("Search Text:", searchText);
      console.log("Select Box Result:", selectBoxResult);

      const typeFilter = currentType === "all" || item.type === currentType;

      return selectBoxResult && searchText && typeFilter;
    }

    tabLinksB.addEventListener("click", function () {
      resetAndApplyFilter();
      showFilteredResults();
      accordion();
    });

    // 필터링된 결과를 리셋하고 새로운 필터를 적용하는 함수
    function resetAndApplyFilter() {
      searchInput.value = ""; // 검색어 입력란 초기화
      document.querySelector(".select_box_result").textContent = "전체"; // selectBoxResult 초기화
      showFilteredResults(); // 필터링된 결과를 업데이트
    }

    // 통합 검색 버튼을 클릭했을 때 필터링 결과를 업데이트
    document
      .querySelector(".search_selectA")
      .addEventListener("click", function () {
        currentPage = 1; // 검색이 다시 시작되므로 페이지를 초기화
        showFilteredResults();
        accordion();
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
      if (resultList) {
        const totalPage = Math.ceil(resultList.children.length / itemsPerPage);
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
      const totalPage = Math.ceil(resultList.children.length / itemsPerPage);
      currentPage = totalPage;
      renderItems(currentPage);
      renderPagination();
    }

    // 페이지네이션 및 아이템 렌더링 함수
    function renderItems(pageNumber) {
      if (resultList) {
        const startIndex = (pageNumber - 1) * itemsPerPage;
        const endIndex = Math.min(
          startIndex + itemsPerPage,
          resultList.children.length
        );

        const displayStyle = window.innerWidth <= 640 ? "block" : "table-row";

        for (let i = 0; i < resultList.children.length; i++) {
          resultList.children[i].style.display =
            i >= startIndex && i < endIndex ? displayStyle : "none";
        }
      }
    }

    // 페이지 로드 시 및 창 크기 변경 시 호출되는 이벤트 리스너 추가
    window.addEventListener("DOMContentLoaded", function () {
      renderItems(1); // 페이지 로드 시 첫 번째 페이지 아이템 렌더링
    });

    window.addEventListener("resize", function () {
      renderItems(1); // 창 크기 변경 시 현재 페이지 아이템 렌더링
    });

    // 초기에 필터링된 결과를 표시
    showFilteredResults();

    function showFilteredResults() {
      // 필터링된 결과를 초기화
      resultList.innerHTML = ``;
      // 선택된 타입과 일치하는 항목만 표시
      const filteredItems =
        currentType === "all"
          ? rentalPerformanceList
          : rentalPerformanceList.filter((item) => item.type === currentType);
      // 추가적인 검색 조건을 적용
      const results = filteredItems.filter(filterItems);

      // 공지와 비공지를 나눔
      const noticeItems = results.filter((item) => item.notice === "공지");
      const nonNoticeItems = results.filter((item) => item.notice !== "공지");

      // 날짜를 기준으로 정렬
      noticeItems.sort((a, b) => new Date(b.date) - new Date(a.date));
      nonNoticeItems.sort((a, b) => new Date(b.date) - new Date(a.date));

      let nonNoticeIndex = nonNoticeItems.length; // 비공지 항목의 순서를 추적하기 위한 변수

      // 결과 리스트에 공지 항목들을 추가
      noticeItems.forEach((item) => {
        const htmlString = `<tr class="contentTitle">
                                          <td data-table="num"><span class="notice">${item.notice}</span></td>
                                          <td data-table="title">${item.title}</td>
                                          <td data-table="writer">${item.writer}</td>
                                          <td data-table="date">${item.date}</td>
                                        </tr>
                                        <tr class="contentAcodian">
                                        <td colspan="4" class="content">
                                          <div class="contentText">
                                            <p class="contNoticeNum">${item.noticeNum}</p>
                                            <div>
                                              <p class="contTitle">${item.title}</p>
                                              <p class="contText">${item.text}</p>
                                              <p class="contDate">${item.date}</p>
                                              <p class="contBoss">${item.boss}</p>
                                            </div>
                                          </div>
                                      </td>
                                        </tr>`;
        resultList.insertAdjacentHTML("beforeend", htmlString);
      });

      nonNoticeItems.forEach((item) => {
        const htmlString = `<tr class="contentTitle">
                                  <td data-table="num">${nonNoticeIndex--}</td>
                                  <td data-table="title">${item.title}</td>
                                  <td data-table="writer">${item.writer}</td>
                                  <td data-table="date">${item.date}</td>
                                </tr>
                                <tr class="contentAcodian">
                                  <td colspan="4" class="content">
                                  <div class="contentText">
                                    <p class="contNoticeNum">${
                                      item.noticeNum
                                    }</p>
                                    <div>
                                      <p class="contTitle">${item.title}</p>
                                      <p class="contText">${item.text}</p>
                                      <p class="contDate">${item.date}</p>
                                      <p class="contBoss">${item.boss}</p>
                                    </div>
                                    </div>
                                  </td>
                                </tr>`;
        resultList.insertAdjacentHTML("beforeend", htmlString);
      });

      // 필터링된 결과가 변경되었으므로 페이지네이션을 다시 렌더링
      renderPagination();
    }
  })
  .catch((error) => console.error("Error:", error));
