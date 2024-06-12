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
    const currentDate = `${year}.${month}.${day}`; //2024.04.10
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
    공연/전시 list를 결과영역에 추가
*/

    // 1) list를 결과영역에 추가하는 함수
    function addSlide(data) {
      const resultArea =
        data.content === "공연"
          ? "#contents_area_performance_result"
          : "#contents_area_exhibition_result";
      let contentsArea = document.querySelector(resultArea);

      if (!contentsArea && data.content === "전시") {
        contentsArea = document.querySelector(resultArea);
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
              <p class="date">${data.dateDetails}${data.time}</p>
              <p class="location">${data.location}</p>
            </div>
          </a>
        </li>
        `;

      contentsArea.innerHTML += performancePlan;
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
        addSlide(data, "#contents_area_performance_result");
      });

      // 전시 예정
      exhibitionScheduled.forEach((data) => {
        addSlide(data, "#contents_area_exhibition_result");
      });

      // 공연 완료
      performanceCompleted.forEach((data) => {
        addSlide(data, "#contents_area_performance_result");
      });

      // 전시 완료
      exhibitionCompleted.forEach((data) => {
        addSlide(data, "#contents_area_exhibition_result");
      });
    }
    const progressData = listProgress(listByDate);
    mainContentsList(progressData);

    /* 
    페이지네이션 및 페이지 당 보여질 list개수
*/

    const contentsAreaSelector = document.querySelector(
      "#contents_area_performance_result"
    )
      ? "#contents_area_performance_result"
      : "#contents_area_exhibition_result";
    let contentsAreaResult = document.querySelector(contentsAreaSelector);

    let itemsPerPage = 8; // 한 페이지당 보여질 아이템 개수
    const pageButtonsLimit = 5; // 한 번에 표시될 페이지 버튼의 개수

    // 반응형 처리: 화면 너비가 861px에서 1023px 사이인 경우 보여지는 컨텐츠 갯수 변경
    function adjustItemsPerPage() {
      const screenWidth = window.innerWidth;
      if (screenWidth >= 861 && screenWidth <= 1023) {
        itemsPerPage = 9;
      } else {
        itemsPerPage = 8;
      }
    }

    // 반응형 처리
    adjustItemsPerPage();

    // 반응형 처리 : 화면 크기 변경 이벤트 감지
    window.addEventListener("resize", () => {
      adjustItemsPerPage();
      renderItems(currentPage);
      renderPagination();
    });

    const performanceItems = listByDate.filter(
      (item) => item.content === "공연"
    );
    const exhibitionItems = listByDate.filter(
      (item) => item.content === "전시"
    );

    const totalPerformanceItems = performanceItems.length;
    const totalExhibitionItems = exhibitionItems.length;

    const totalItems = contentsAreaSelector.includes("performance")
      ? totalPerformanceItems
      : totalExhibitionItems;

    let currentPage = 1;

    // 페이지네이션 생성 함수
    function renderPagination() {
      if (contentsAreaResult) {
        const totalPage = Math.ceil(totalItems / itemsPerPage);
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
    renderItems(currentPage);
    renderPagination();

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
  })
  .catch((error) => console.error("Error:", error));
