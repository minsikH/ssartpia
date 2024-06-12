fetch("data.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("네트워크 오류: " + response.statusText);
    }
    return response.json();
  })
  .then((data) => {
    const id = new URLSearchParams(window.location.search).get("id");

    if (!id) {
      document.getElementById("detail_content").innerHTML =
        "<p class='no_list'>항목을 찾을 수 없습니다.</p>";
      return;
    }

    let item = null;
    let isItemListText = false;

    // itemList에서 아이템 찾기
    data.itemList.forEach((itemData) => {
      if (itemData.id === parseInt(id)) {
        item = itemData;
      }
    });

    // academyList에서 아이템 찾기
    if (!item) {
      data.academyList.forEach((itemData) => {
        if (itemData.id === parseInt(id)) {
          item = itemData;
          isItemListText = true;
        }
      });
    }

    if (!item) {
      document.getElementById("detail_content").innerHTML =
        "<p class='no_list'>항목을 찾을 수 없습니다.</p>";
      return;
    }

    let detailHtml = "";
    if (isItemListText) {
      // 아카데미인 경우
      detailHtml = `
        <div class="top_area">
          <p>예술아카데미 <span></span></p>
        </div>
        <div class="mid_area academy">
          <div class="info_area">
            <p class="title">${item.title}</p>
            <table>
              <tbody>
                <tr>
                  <th>수강기간</th>
                  <td>${item.dateDetails}</td>
                  <th>수강료</th>
                  <td>${item.price}</td>
                </tr>
                <tr>
                  <th>시간</th>
                  <td>${item.time}</td>
                  <th>전체정원</th>
                  <td>${item.personnel}</td>
                </tr>
                <tr>
                  <th>요일</th>
                  <td>${item.day}</td>
                  <th>강사명</th>
                  <td>${item.lecturer}</td>
                </tr>
                <tr>
                  <th>수업장소</th>
                  <td>${item.type}</td>
                  <th>문의</th>
                  <td>${item.tell}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="bot_area academy">
          <figure>
            <img src="${item.imgSubSrc}" alt="" onerror="this.style.display='none'">
          </figure>
          <span class="btn_list">
            <a href="#" id="backButton">목록으로</a>
          </span>
        </div>
      `;
    } else {
      // 공연 또는 전시인 경우
      let thText1, thText2, tdText1, tdText2, thClass, tdClass;
      if (item.content === "공연") {
        thText1 = "관람연령";
        thText2 = "";
        tdText1 = item.age;
        tdText2 = "";
        thClass = "performance";
        tdClass = "performance";
      } else if (item.content === "전시") {
        thText1 = "장르";
        thText2 = "참여작가";
        tdText1 = item.genre;
        tdText2 = item.participants;
        thClass = "exhibition";
        tdClass = "exhibition";
      }

      detailHtml = `
        <div class="top_area">
          <p>${item.content} 안내 <span>기획 ${item.content}</span></p>
        </div>
        <div class="mid_area">
          <figure>
            <img src="${item.imgSrc}" alt="" onerror="this.style.display='none'">
          </figure>
          <div class="info_area">
            <p class="title">${item.title}</p>
            <table>
              <tbody>
                <tr>
                  <th>일정</th>
                  <td>${item.dateDetails}</td>
                  <th>시간</th>
                  <td>${item.time}</td>
                </tr>
                <tr>
                  <th>장소</th>
                  <td>${item.location}</td>
                  <th>입장료</th>
                  <td>${item.price}</td>
                </tr>
                <tr>
                  <th>주최&middot;주관</th>
                  <td>${item.host}</td>
                  <th>문의</th>
                  <td>${item.tell}</td>
                </tr>
                <tr>
                  <th>${thText1}</th>
                  <td>${tdText1}</td>
                  <th class="${thClass}">${thText2}</th>
                  <td class="${tdClass}">${tdText2}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="bot_area">
          <figure>
            <img src="${item.imgSrc}" alt="" onerror="this.style.display='none'">
          </figure>
          <span class="btn_list">
            <a href="#" id="backButton">목록으로</a>
          </span>
        </div>
      `;
    }

    document.getElementById("detail_content").innerHTML = detailHtml;

    // 목록으로 버튼 클릭 이벤트 처리
    document
      .getElementById("backButton")
      .addEventListener("click", function (event) {
        event.preventDefault(); // 기본 동작 방지
        history.back(); // 브라우저의 뒤로 가기 기능과 동일한 역할
      });
  })
  .catch((error) => console.error("Error:", error));
