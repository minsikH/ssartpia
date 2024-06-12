/* 
  header gnb
*/
let gnbLinks = document.querySelectorAll(".gnb > li > a");

gnbLinks.forEach(function (gnbLink) {
  gnbLink.addEventListener("mouseover", function () {
    this.parentElement.classList.add("on");
    gnbLinks.forEach(function (otherGnbLink) {
      if (otherGnbLink !== gnbLink) {
        otherGnbLink.parentElement.classList.remove("on");
      }
    });
  });
  gnbLink.addEventListener("mouseleave", function () {
    let header = document.querySelector("header");
    header.addEventListener("mouseleave", function () {
      gnbLinks.forEach(function (gnbLink) {
        gnbLink.parentElement.classList.remove("on");
      });
    });
  });
});

/* 
  header btn_menu 
*/
const btnMenu = document.querySelector(".btn_menu");
const menuArea = document.querySelector(".menu_area");

// 버튼 클릭 시 이벤트 핸들러
btnMenu.addEventListener("click", function () {
  this.classList.toggle("on");
  menuArea.classList.toggle("on");
  if (menuArea.classList.contains("on")) {
    disableScroll();
    window.scrollTo(0, 0);
  } else {
    enableScroll();

    menuGnbLists.forEach(function (otherMenuGnbList) {
      otherMenuGnbList.classList.remove("on");
    });
  }
});

// 스크롤 막기 함수
function disableScroll() {
  document.body.style.overflow = "hidden";
}

// 스크롤 허용 함수
function enableScroll() {
  document.body.style.overflow = "";
}

/* 
  header menu_area menu_gnb 
*/
let menuGnbLists = document.querySelectorAll(".menu_gnb > li");

menuGnbLists.forEach(function (menuGnbList) {
  menuGnbList.addEventListener("click", function () {
    this.classList.add("on");
    menuGnbLists.forEach(function (otherMenuGnbList) {
      if (otherMenuGnbList !== menuGnbList) {
        otherMenuGnbList.classList.remove("on");
      }
    });
  });
});

/* 
  header btn_search 
*/
const btnSearch = document.querySelector(".btn_search");
const searchArea = document.querySelector(".search_area");
const logo = document.querySelector("h1");

btnSearch.addEventListener("click", function () {
  searchArea.classList.add("on");
  logo.classList.add("on");
  const btnMenu = document.querySelector(".search_area > .btn_menu");
  btnMenu.addEventListener("click", function () {
    searchArea.classList.remove("on");
    logo.classList.remove("on");
  });
});

/* 
  lnb 
*/
$(function () {
  $(".lnb_depth2").mouseleave(function () {
    $(".sub_depth2").slideUp();
  });

  $(".lnb_depth2").on("click", function () {
    $(".sub_depth2").slideDown();
  });
});

/* 
  footer - FAMILY SITE 
*/
$(function () {
  $(".site_select").mouseleave(function () {
    $(".family_site").removeClass("on");
    $(".site_select > ul").slideUp();
  });

  $(".family_site").on("click", function () {
    if (!$(this).hasClass("on")) {
      $(this).addClass("on");
      $(this).next().slideDown();
    } else {
      $(this).removeClass("on");
      $(this).next().slideUp();
    }
  });
});
