fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    const itemList = data.itemList;
    const academyList = data.academyList;
    const pressList = data.pressList;
    const notificationList = data.notificationList;

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
      //console.log(performanceScheduled);
      //console.log(exhibitionScheduled);
      //console.log(performanceCompleted);
      //console.log(exhibitionCompleted);
      return {
        performanceScheduled,
        exhibitionScheduled,
        performanceCompleted,
        exhibitionCompleted,
      };
    }

    /* 
  공연,전시,아카데미 클릭시 결과 on
*/

    const tabs = document.querySelectorAll(".tabs li");
    const resultTabs = document.querySelectorAll(".result_tab");

    // 탭 클릭 이벤트 등록
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", function () {
        tabs.forEach((t) => t.classList.toggle("on", t === tab));
        resultTabs.forEach((r, i) => r.classList.toggle("on", i === index));
      });
    });

    /* 
  공연,전시 영역에 현재 년,월 표시
*/
    const currentDateOn = document.querySelectorAll(".current_date > span");
    currentDateOn.forEach((span) => (span.textContent = `${year}.${month}`));
    //console.log(currentDateOn);

    /* 
  공연,전시 영역에 li(해당 월)클릭한곳 on 기능
*/

    // 1) 클릭한 li와 스와이프에 on추가 , 나머지 on제거 기능
    const monthTabs = document.querySelectorAll(".month li");
    const monthTabSwipers = [];

    monthTabs.forEach((month, index) => {
      month.addEventListener("click", function () {
        monthTabs.forEach((m) => m.classList.remove("on"));
        month.classList.add("on");

        monthTabSwipers.forEach((swiper, i) => {
          if (i === index) {
            swiper.el.classList.add("on");
            swiper.slideTo(0);
          } else {
            swiper.el.classList.remove("on");
          }
        });
      });
    });

    // 2) 공연,전시 탭 변경시 현재월의 li에만 on추가하기
    function getCurrentMonth() {
      return new Date().getMonth() + 1;
    }

    function CurrentMonthOn() {
      const currentMonth = getCurrentMonth();
      const swiperTabs = document.querySelectorAll(".swiper_tab");

      document.querySelectorAll(".month li.on").forEach(function (e) {
        e.classList.remove("on");
      });
      document.querySelectorAll(".swiper_tab.on").forEach(function (e) {
        e.classList.remove("on");
      });

      monthTabs[currentMonth - 1].classList.add("on");
      swiperTabs[currentMonth - 1].classList.add("on");
      monthTabs[currentMonth + 11].classList.add("on");
      swiperTabs[currentMonth + 11].classList.add("on");
    }

    CurrentMonthOn();

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        returnToMonth();
      });
    });

    function returnToMonth() {
      CurrentMonthOn();
    }

    /* 
  공연/전시 list를 슬라이드에 추가
*/

    // 1) 슬라이드 추가하는 함수
    function addSlide(data) {
      const eventMonth = new Date(data.date).getMonth() + 1;
      const formattedMonth = eventMonth < 10 ? "0" + eventMonth : eventMonth;
      const swiperSelector =
        data.content === "공연" ? ".swiper_tab01_" : ".swiper_tab02_";

      let swiperWrapper = document.querySelector(
        `.result_swiper01 ${swiperSelector}${formattedMonth} .swiper-wrapper`
      );

      if (!swiperWrapper && data.content === "전시") {
        swiperWrapper = document.querySelector(
          `.result_swiper02 ${swiperSelector}${formattedMonth} .swiper-wrapper`
        );
      }
      if (!swiperWrapper) return;

      const swiperSlide = `
    <div class="swiper-slide">
      <a href="detail.html?id=${data.id}">
        <figure>
          <img src="${data.imgSrc}" alt="${data.title}" onerror="this.style.display='none'">
        </figure>
        <div class="text_area">
          <div class="info">
            <span class="progress">${data.progress}</span> 
            <span class="date">${data.date}</span>
          </div>
          <p class="title">${data.title}</p>
        </div>
      </a>
    </div>
  `;

      swiperWrapper.innerHTML += swiperSlide;
    }

    // 2) 슬라이드 추가함수( 1)번 )를   해당 월에 맞게 추가
    function mainContentsList(data) {
      const {
        performanceScheduled,
        exhibitionScheduled,
        performanceCompleted,
        exhibitionCompleted,
      } = data;
      // 공연 예정
      performanceScheduled.forEach((data) => {
        addSlide(data, ".swiper_tab01_" + (new Date(data.date).getMonth() + 1));
      });

      // 전시 예정
      exhibitionScheduled.forEach((data) => {
        addSlide(data, ".swiper_tab02_" + (new Date(data.date).getMonth() + 1));
      });

      // 공연 완료
      performanceCompleted.forEach((data) => {
        addSlide(data, ".swiper_tab01_" + (new Date(data.date).getMonth() + 1));
      });

      // 전시 완료
      exhibitionCompleted.forEach((data) => {
        addSlide(data, ".swiper_tab02_" + (new Date(data.date).getMonth() + 1));
      });
    }
    const progressData = listProgress(listByDate);
    mainContentsList(progressData);

    // 가상 데이터가 없는 경우
    function addNoDataSlide() {
      const monthWrappers = document.querySelectorAll(
        ".result_swiper .swiper-wrapper"
      );

      monthWrappers.forEach((swiperWrapper) => {
        const tabType = swiperWrapper.closest(".result_swiper01")
          ? "공연"
          : "전시";
        const contentName = tabType === "공연" ? "공연이" : "전시가";

        if (!swiperWrapper.innerHTML.trim()) {
          const noDataSlide = `
        <div class="swiper-slide">
          <div class="no_data">
            <span>예정된 ${contentName} 없습니다.</span>
          </div>
        </div>
      `;
          swiperWrapper.innerHTML = noDataSlide;

          // 슬라이드가 추가된 후에 슬라이드 개수를 업데이트
          const noDataSwiper = monthTabSwipers.find((swiper) =>
            swiper.el.contains(swiperWrapper)
          );
          if (noDataSwiper) {
            noDataSwiper.params.slidesPerView = 1; // 슬라이드 개수를 1개로 설정
            noDataSwiper.params.breakpoints = {}; // 반응형 설정 제거
            noDataSwiper.updateSize(); // 슬라이드 업데이트
          }
        }
      });
    }
    /* 
    3. 예술아카데미
*/
    const resultTab = document.querySelector(".result_tab.result_tab03 ul");
    /* resultTab.innerHTML = ''; */

    // 주석 처리된 순서대로 아이템을 추가
    const order = [121, 124, 125, 120, 119];
    order.forEach((itemId) => {
      const item = academyList.find((item) => item.id === itemId);
      if (item) {
        resultTab.innerHTML += `
      <li>
      <a href="detail.html?id=${item.id}">
          <img src="${item.imgSrc}" alt="${item.title}" />
        </a>
      </li>
    `;
      }
    });

    /* 
    4. 공지사항
 */

    // notice가 "공지"인 항목만 필터링
    const filteredItems = notificationList.filter(
      (item) => item.type === "공지사항"
    );
    // 날짜 순서대로 정렬 (내림차순)
    filteredItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    // 마지막 세 개의 항목 가져오기
    const lastThreeItems = filteredItems.slice(0, 3);

    // noticeList 요소 가져오기
    const noticeList = document.getElementById("noticeList");

    // 기존 내용을 모두 지우기
    noticeList.innerHTML = "";

    // 마지막 세 개의 항목을 HTML로 생성하여 추가하기
    lastThreeItems.forEach((item) => {
      noticeList.innerHTML += `
        <li>
        <a href="../news/notification.html?type=공지사항&id=${item.id}">
            <p class="title">${item.title}</p>
            <p class="sub_title">${item.text}</p>
          </a>
        </li>
      `;
    });
    /* 
    5. 언론보도
*/

    // 날짜 순서대로 정렬 (내림차순)
    pressList.sort((a, b) => new Date(b.date) - new Date(a.date));
    // 마지막 세 개의 항목 가져오기
    const lastSixItems = pressList.slice(0, 6);

    // noticeList 요소 가져오기
    const newsList = document.getElementById("newsList");

    // 기존 내용을 모두 지우기
    newsList.innerHTML = "";

    // 마지막 6 개의 항목을 HTML로 생성하여 추가하기
    lastSixItems.forEach((item) => {
      newsList.innerHTML += `
        <div class="swiper-slide">
          <a href="../news/press.html?id=${item.id}">
            <p class="title">${item.title}</p>
            <p class="sub_title">${item.title}</p>
            <div class="bot_info">
              <span class="news_box">${item.writer}</span>
              <span class="news_date">${item.date}</span>
            </div>
          </a>
        </div>
      `;
    });

    /* 
  main 스와이프
*/

    let mainSwiper = new Swiper(".main_swiper", {
      loop: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });

    /* 
  section01 스와이프
*/
    document.querySelectorAll(".swiper_tab").forEach((swiperTab) => {
      const section01Swiper = new Swiper(swiperTab, {
        slidesPerView: 5.5,
        loopedSlides: 4,
        spaceBetween: 80,
        grabCursor: true,
        loop: false,
        autoplay: false,
        navigation: {
          nextEl: ".result_tab .swiper_button_next",
          prevEl: ".result_tab .swiper_button_prev",
        },
        breakpoints: {
          1920: {
            slidesPerView: 5.5,
            spaceBetween: 80,
          },
          1480: {
            slidesPerView: 5,
            spaceBetween: 80,
          },
          1023: {
            slidesPerView: 4,
            spaceBetween: 30,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          540: {
            slidesPerView: 3,
            spaceBetween: 25,
          },
          1: {
            slidesPerView: 2,
            spaceBetween: 12,
          },
        },
      });
      monthTabSwipers.push(section01Swiper);
    });
    addNoDataSlide();

    /* 
  news_swiper 
*/
    let newsSwiper = new Swiper(".swiper_news", {
      slidesPerView: 2,
      loopedSlides: 2,
      spaceBetween: 30,
      grabCursor: true,
      loop: false,
      autoplay: false,
      observer: true,
      observeParents: true,
      navigation: {
        nextEl: ".news_swiper .news_swiper_button_next",
        prevEl: ".news_swiper .news_swiper_button_prev",
      },
      breakpoints: {
        1680: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
        0: {
          slidesPerView: 1,
          spaceBetween: 0,
        },
      },
    });

    /* 
  gallery_swiper 
*/
    let gallerySwiper = new Swiper(".swiper_gallery", {
      slidesPerView: 1,
      loopedSlides: 2,
      spaceBetween: 0,
      grabCursor: true,
      loop: true,
      autoplay: false,
      observer: true,
      observeParents: true,
      navigation: {
        nextEl: ".gallery_swiper .gallery_swiper_button_next",
        prevEl: ".gallery_swiper .gallery_swiper_button_prev",
      },
      breakpoints: {
        1023: {
          slidesPerView: 1,
          spaceBetween: 0,
        },
        860: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        540: {
          slidesPerView: 1.5,
          spaceBetween: 20,
        },
        1: {
          slidesPerView: 1,
          spaceBetween: 0,
        },
      },
      speed: 1000,
    });
  })
  .catch((error) => console.error("Error:", error));
