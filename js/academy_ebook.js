fetch("../data.json")
  .then((response) => response.json())
  .then((data) => {
    const ebookList = data.ebookList;
    /* 
    1. 가상아이템 -> 시간 순으로 나열
*/

    const listByDate = ebookList.sort(
      (b, a) => new Date(a.date) - new Date(b.date)
    );
    //console.log('listByDate : ', listByDate)

    /* 
    공연/전시 list를 결과영역에 추가
*/

    // 1) list를 결과영역에 추가하는 함수
    function addSlide(data) {
      let contentsArea = document.querySelector(".contents_area_result");

      data.forEach((item) => {
        const performancePlan = `
      <li>
      <a href="#">
          <div class="img_area">
              <img src=".${item.imgSrc}" alt="" onerror="this.style.display='none'">
              <div class="imgCover">
                  <div class="view_more">
                      <span class="width_line"></span>
                      <span class="height_line"></span>
                  </div>
              </div>
          </div>
          <div class="text_area">
              <p class="title">${item.title}</p>
          </div>
          <div class="text_info"> 
          <dl>
            <dt>강좌운영</dt>
            <dd>${item.course}</dd>
          </dl>
          <dl>
            <dt>문의</dt>
            <dd>${item.inquiry}</dd>
          </dl>
        </div>
      </a>
  </li>
  `;

        contentsArea.innerHTML += performancePlan;
      });
    }

    addSlide(listByDate);

    /* 
    페이지네이션 및 페이지 당 보여질 list개수
*/
    let contentsAreaResult = document.querySelector(".contents_area_result");

    const totalItems = listByDate.length; // 전체 아이템 개수

    const itemsPerPage = 6; // 한 페이지당 보여질 아이템 개수
    const pageButtonsLimit = 5; // 한 번에 표시될 페이지 버튼의 개수

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
