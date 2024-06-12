/* 
  탭
*/
document.addEventListener("DOMContentLoaded", function () {
  const tabLinks = document.querySelectorAll(".sub_tab > li");
  const resultItems = document.querySelectorAll(".sub_tab_result > li");

  tabLinks.forEach((tab, index) => {
    tab.addEventListener("click", function () {
      tabLinks.forEach((li) => li.classList.remove("on"));
      tab.classList.add("on");

      resultItems.forEach((item) => item.classList.remove("on"));
      resultItems[index].classList.add("on");
    });
  });
});
