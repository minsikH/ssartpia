fetch("../data.json")
  .then((response) => response.json())
  .then((data) => {
    const csList = data.csList;

    /* 
    탭 
*/

    const tabLinks = document.querySelectorAll(".sub_tab > li");
    const resultItems = document.querySelectorAll(".sub_tab_result > div");

    tabLinks.forEach((tab, index) => {
      tab.addEventListener("click", function () {
        tabLinks.forEach((li) => li.classList.remove("on"));
        tab.classList.add("on");

        resultItems.forEach((item) => item.classList.remove("on"));
        resultItems[index].classList.add("on");
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
    아코디언 
*/
    function accordion() {
      // contentText 숨기기
      $(".contentText").hide();

      // contentTitle 클릭 이벤트 핸들러 등록
      $(".contentTitle").click(function () {
        // 현재 클릭한 contentTitle의 다음 tr의 contentText를 찾음
        var $contentText = $(this).next().find(".contentText");

        // 클릭한 contentText가 보이는지 확인하여 토글
        $contentText.slideToggle();

        // 클릭한 contentText를 제외한 다른 contentText 숨김
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

    const selectBoxOption = document.querySelector(".select_box_option");

    // 필터링 함수를 정의
    function filterItems(item) {
      // 전체가 선택되었을 때의 처리
      if (selectBoxOption.value === "0") {
        const optionFilter =
          searchInput.value.trim() === "" ||
          item.title.includes(searchInput.value.trim()) ||
          item.writer.includes(searchInput.value.trim());
        return optionFilter;
      }
      // 제목이 선택되었을 때의 처리
      else if (selectBoxOption.value === "1") {
        const optionFilter =
          searchInput.value.trim() === "" ||
          item.title.includes(searchInput.value.trim());
        return optionFilter;
      }
      // 작성자가 선택되었을 때의 처리
      else if (selectBoxOption.value === "2") {
        const optionFilter =
          searchInput.value.trim() === "" ||
          item.writer.includes(searchInput.value.trim());
        return optionFilter;
      }

      const optionFilter =
        searchInput.value.trim() === "" ||
        item.lecturer.includes(searchInput.value.trim());
      const searchFilter =
        searchInput.value.trim() === "" ||
        item.lecturer.includes(searchInput.value.trim());
      return optionFilter && searchFilter;
    }

    tabLinksB.addEventListener("click", function () {
      resetAndApplyFilter();
      showFilteredResults();
      accordion();
    });

    // 필터링된 결과를 리셋하고 새로운 필터를 적용하는 함수
    function resetAndApplyFilter() {
      searchInput.value = ""; // 검색어 입력란 초기화
      selectBoxOption.value = 0; // 검색어 입력란 초기화

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
          ? csList
          : csList.filter((item) => item.type === currentType);
      // 추가적인 검색 조건을 적용
      const results = filteredItems.filter(filterItems);

      // 공지와 비공지를 나눕니다.
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
                                            <div>
                                              <p class="contText">${item.text}</p>
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
                                    <div>
                                      <p class="contText">${item.text}</p>
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
