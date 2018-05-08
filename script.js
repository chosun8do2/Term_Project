var chart; //간트차트
var tq = 0; //타임퀀텀
var sel = 0; //선택된 스케줄링 번호
var sch = 0; //선택된 스케줄링 이름
var Process; //스케줄링한 프로세스
var exe_count = 0; //각 프로세스가 몇번 실행되는지 체크

//구글 차트에서 테이블을 생성하는 코드
google.charts.load('current', {
  'packages': ['table']
});
google.charts.setOnLoadCallback(drawTable);

function drawTable(proc = null, flag = false) { //테이블 생성 함수
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Process');
  data.addColumn('number', 'AT');
  data.addColumn('number', 'BT');
  data.addColumn('number', 'WT');
  data.addColumn('number', 'TT');
  data.addColumn('number', 'NTT');
  data.addColumn('number', 'TQ');

  if (flag) {
    if (tq == 0) tq = null;
    for (var i = 0; i < pro_num; i++) {
      data.addRows([ //각각 해당하는 값들을 위치에 맞게 대입
        [proc[i].proc_num, proc[i].at, proc[i].bt, proc[i].wt, proc[i].tt, proc[i].ntt, parseInt(tq)]
      ]);
    }

    var table = new google.visualization.Table(document.getElementById('table_div'));

    table.draw(data, {
      showRowNumber: true,
      width: '1000',
      height: '300'
    });
  }
}

//구글차트와 표 그리기 함수
function draw(proc) {

  var dps = []; //각 프로세스에 저장된 값들을 배열 형태로 dps에 저장
  var cnt = 0;

  for (var i = 0; i < pro_num; i++) {
    j = 0;
    while (1) {
      if (j >= exe_count[i]) break;
      dps.push({
        x: 10 * (i + 1),
        y: [proc[i].st[j], proc[i].ft[j]],
        label: proc[i].proc_num
      });
      cnt++;
      j++;
    }
  }


  chart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    exportEnabled: true,
    title: {
      text: "Process Scheduler Simulator"
    },
    axisX: {
      title: "프로세스",
      interval: 10
    },
    axisY: {
      includeZero: false,
      title: "시간",
    },
    data: [{
      type: "rangeBar",
      showInLegend: false,
      indexLabel: "{y[#index]}",
      legendText: "Process",
      toolTipContent: "<b>{label}</b>: {y[0]} to {y[1]}",
      dataPoints: dps
    }]
  });
  chart.render();

  drawTable(proc, true);
}

function insertValue(frm) { //입력된 스케줄링 판단

  sel = frm.scheduling.options[frm.scheduling.selectedIndex].value;
  sch = frm.scheduling.options[frm.scheduling.selectedIndex].text;
  if (sel == 2) { //rr일 경우 타임퀀텀을 입력하도록 유도
    tq = prompt("Time quantum을 입력해주세요!");
  } else tq = 0;

}

var oTbl; //프로세스 입력 테이블
var arrive = new Array(); //입력된 도착시간 저장
var burst = new Array(); //입력된 실행시간 저장
var pro_num = 0; //입력된 프로세스의 갯수 저장

function insRow() { //프로세스를 추가할 시 새로 입력할 행 추가
  oTbl = document.getElementById("addTable");
  var oRow = oTbl.insertRow();
  oRow.onmouseover = function() {
    oTbl.clickedRowIndex = this.rowIndex
  };
  var oCell = oRow.insertCell();

  var frmTag = "도착시간 : <input type='text' name='addText[]'' style='width:100px; height:20px;'> ";
  frmTag += "가동시간 : <input type='text' name='addText[]' style='width:100px; height:20px;'>";
  frmTag += " <input type=button value='삭제' onClick='removeRow()' style='cursor:hand'>";
  oCell.innerHTML = frmTag;
}

//Row 삭제
function removeRow() {
  oTbl.deleteRow(oTbl.clickedRowIndex);
}

function frmCheck() { //모든 프로세스에 입력할 값을 적절히 입력했는지 확인
  var frm = document.form;

  for (var i = 0; i <= frm.elements.length - 1; i++) {
    if (frm.elements[i].name == "addText[]") {
      if (!frm.elements[i].value) {
        alert("텍스트박스에 값을 입력하세요!");
        frm.elements[i].focus();
        return;
      }
    }
  }
  flag = true;
  cnt1 = 0;
  cnt2 = 0;
  for (var i = 2; i <= frm.elements.length - 2; i++) {
    if (frm.elements[i].value == "삭제") continue;
    if (flag) {
      arrive[cnt1] = frm.elements[i].value;
      flag = false;
      cnt1++;
    } else {
      burst[cnt2] = frm.elements[i].value;
      flag = true;
      cnt2++;
    }
  }
  pro_num = cnt1;
  if (sel == 1) Process = fcfs(pro_num);
  else if (sel == 2) Process = rr(pro_num);
  else if (sel == 3) Process = spn(pro_num);
  else if (sel == 4) Process = srtn(pro_num);
  else if (sel == 5) Process = hrrn(pro_num);
  draw(Process); //선택된 스케줄링 알고리즘 실행 후 간트차트+표 그리기
}


function proc() { //프로세스 구조체
  var proc_num = "0";
  var achieve = 0; //할당량 중 얼마나 남았는지 계산
  var st = 0;
  var ft = 0;
  var at = 0;
  var rat = 0; //at을 임시로 저장하는 변수
  var bt = 0;
  var rt = 0;
  var wt = 0;
  var tt = 0;
  var ntt = 0;
  var finish = false; //프로세스가 끝났는지 판단
}

function fcfs(num) {
  var pro = new Array(num);
  var total = 0; //지금까지 실행한 시간
  exe_count = new Array(num);

  for (var i = 0; i < num; i++) { //각 프로세스에 주어진 값 대입
    exe_count[i] = 0;
    pro[i] = new proc();
    pro[i].proc_num = "P" + (i + 1);
    pro[i].at = parseInt(arrive[i]);
    pro[i].bt = parseInt(burst[i]);
    pro[i].st = new Array(num);
    pro[i].ft = new Array(num);
  }

  var sortingField = "at"; //at 기준으로 오름차순 정렬
  pro.sort(function(a, b) {
    if(a[sortingField] == b[sortingField]){
      return a["bt"] - b["bt"];
    }
    return a[sortingField] - b[sortingField];
  });
  for (var i = 0; i < num; i++) {
    if (total < pro[i].at) {  //만약 실행할 프로세스가 없으면 total을 다음 at 타임으로 이동
      total = pro[i].at;
      pro[i].st[exe_count[i]] = pro[i].at;
    } else {
      pro[i].st[exe_count[i]] = total;
    }
    total += pro[i].bt; //실행시간만큼 total 이동
    pro[i].ft[exe_count[i]] = total; //끝난 total 시간을 ft로 입력
    exe_count[i]++;
    pro[i].tt = total - pro[i].at; //tt 계산
    pro[i].wt = pro[i].tt - pro[i].bt; //wt 계산
    pro[i].ntt = pro[i].tt / pro[i].bt; //ntt 계산
  }
  return pro;
}

function rr(num) {
  var pro = new Array(num);
  var total = 0;
  exe_count = new Array(num);
  var per_total = new Array(num); //각 프로세스별 최종 끝난 시간 저장

  for (var i = 0; i < num; i++) {
    exe_count[i] = 0;
    pro[i] = new proc();
    pro[i].proc_num = "P" + (i + 1);
    pro[i].at = parseInt(arrive[i]);
    pro[i].rat = parseInt(arrive[i]);
    pro[i].bt = parseInt(burst[i]);
    pro[i].achieve = pro[i].bt;
    pro[i].st = new Array(num);
    pro[i].ft = new Array(num);
  }

  var sortingField = "at";
  pro.sort(function(a, b) {
    if(a[sortingField] == b[sortingField]){
      return a["bt"] - b["bt"];
    }
    return a[sortingField] - b[sortingField];
  });
  while (1) { //모든 프로세스가 끝날 때까지 반복

    var cnt = 0;
    for (var i = 0; i < num; i++) {
      if (pro[i].achieve == 0) {
        cnt++;
        continue;
      }
      if (pro[i].at > total) { //다음 프로세스 설정
          total = pro[i].at;
      }
      var tem_val = 999999999;
      var tem_num = 0;

      for (var j = 0; j < num; j++) { //다음 대기 프로세스가 없을 시 다음 프로세스까지 시간이동
        if (pro[j].at > total) break;
        else {
          if (pro[j].at < tem_val && pro[j].achieve != 0) {
            tem_val = pro[j].at;
            tem_num = j;
          }
        }
      }
      if (pro[tem_num].achieve > parseInt(tq)) { //프로세스의 남은 실행시간이 tq보다 큰 경우
        pro[tem_num].st[exe_count[tem_num]] = total;
        pro[tem_num].achieve -= parseInt(tq);
        total += parseInt(tq);
        pro[tem_num].ft[exe_count[tem_num]] = total;
        pro[tem_num].at = total;
        exe_count[tem_num]++;
      } else { //프로세스의 남은 실행시간이 tq보다 작은 경우
        pro[tem_num].st[exe_count[tem_num]] = total;
        total += pro[tem_num].achieve;
        pro[tem_num].ft[exe_count[tem_num]] = total;
        per_total[tem_num] = total;
        pro[tem_num].achieve = 0;
        exe_count[tem_num]++;
      }
    }
    if (num == cnt) break;
  }

  for (var i = 0; i < num; i++) { //tt, wt, ntt 계산
    pro[i].tt = per_total[i] - pro[i].rat;
    pro[i].wt = pro[i].tt - pro[i].bt;
    pro[i].ntt = pro[i].tt / pro[i].bt;
  }

  return pro;
}

function spn(num) {
  var pro = new Array(num);
  var total = 0;
  var min_num = 999999999;
  var min_val = 999999999;

  exe_count = new Array(num);

  for (var i = 0; i < num; i++) {
    pro[i] = new proc();
    pro[i].proc_num = "P" + (i + 1);
    pro[i].num = i;
    pro[i].at = parseInt(arrive[i]);
    pro[i].bt = parseInt(burst[i]);
    pro[i].st = [0];
    pro[i].ft = [0];
    exe_count[i] = 1;
  }
  var sortingField = "at";
  pro.sort(function(a, b) {
    if(a[sortingField] == b[sortingField]){
      return a["bt"] - b["bt"];
    }
    return a[sortingField] - b[sortingField];
  });
  while (1) {
    var cnt = 0;
    for (var i = 0; i < num; i++) {
      if (pro[i].finish) cnt++;
      if (total >= pro[i].at && min_val > pro[i].bt && !pro[i].finish) {
        //현재 실행되어야 할 가장 작은 프로세스 선택
        min_val = pro[i].bt;
        min_num = i;
      }
    }
    if (cnt == num) break;
    if (min_num == 999999999) {
      for (var i = 0; i < num; i++) {
        if (!pro[i].finish) {
          min_num = i;
          break;
        }
      }
    }

    if (pro[min_num].at > total) total = pro[min_num].at;
    pro[min_num].st[0] = total;
    total += pro[min_num].bt;
    pro[min_num].ft[0] = total;
    pro[min_num].tt = total - pro[min_num].at;
    pro[min_num].wt = pro[min_num].tt - pro[min_num].bt;
    pro[min_num].ntt = pro[min_num].tt / pro[min_num].bt;
    pro[min_num].finish = true;
    min_num = 999999999;
    min_val = 999999999;
  }
  return pro;
}

function srtn(num) {
  var pro = new Array(num);
  exe_count = new Array(num);
  var per_total = new Array(num);

  for (var i = 0; i < num; i++) {
    exe_count[i] = 0;
    pro[i] = new proc();
    pro[i].proc_num = "P" + (i + 1);
    pro[i].at = parseInt(arrive[i]);
    pro[i].bt = parseInt(burst[i]);
    pro[i].achieve = pro[i].bt;
    pro[i].st = new Array(num);
    pro[i].ft = new Array(num);
  }

  var sortingField = "at";
  pro.sort(function(a, b) {
    if(a[sortingField] == b[sortingField]){
      return a["bt"] - b["bt"];
    }
    return a[sortingField] - b[sortingField];
  });
  var time = 0; //현재 시간
  var now_i = 0; //현재 가장 at가 빠른 프로세스
  var flag = false; //선택된 프로세스가 변경되어야 하는가?
  while (1) {
    var cnt = 0;
    for (var i = 0; i < num; i++) {
      if (pro[i].finish) cnt++;
    }
    for (var i = 0; i < num; i++) {
      //끝나지 않은 프로세스 중 at가 가장 빠른 프로세스 선택
      if (!pro[i].finish) {
        now_i = i;
        break;
      }
    }
    if (cnt == num) break;
    s_num = 0;
    s_val = 99999;
    for (var i = 0; i < num; i++) {
      //현재 시간에서 가장 빨리 끝나는 프로세스 선택
      if (!pro[i].finish && pro[i].at <= time) {
        if (pro[i].achieve < s_val) {
          s_num = i;
          s_val = pro[i].achieve;
        }
      }
    }
    if (s_val == 99999) { //위 반복문에서 선택된 프로세스가 없으면 at가 가장 빠른 프로세스 선택
      time = pro[now_i].at;
      continue;
    }
    pro[s_num].st[exe_count[s_num]] = time;
    while (1) {
      time++;
      pro[s_num].achieve -= 1;
      if (pro[s_num].achieve == 0) { //이번 시간에 프로세스가 끝난 경우
        pro[s_num].ft[exe_count[s_num]] = time;
        exe_count[s_num]++;
        pro[s_num].finish = true;
        per_total[s_num] = time;
        break;
      }
      for (var i = 0; i < num; i++) {
        if (!pro[i].finish && pro[i].at <= time && i != s_num) {
          if (pro[i].achieve <= pro[s_num].achieve) { //현재 프로세스보다 빨리 끝나는 프로세스가 존재하는 경우
            if (pro[s_num].st[exe_count[s_num]] != time) {
              pro[s_num].ft[exe_count[s_num]] = time;
              exe_count[s_num]++;
            }
            flag = true;
            break;
          }
        }
      }
      if (flag) {
        flag = false;
        break;
      }
    }
  }
  for (var i = 0; i < num; i++) {
    pro[i].tt = per_total[i] - pro[i].at;
    pro[i].wt = pro[i].tt - pro[i].bt;
    pro[i].ntt = pro[i].tt / pro[i].bt;
  }
  return pro;
}

function hrrn(num) {
  var pro = new Array(num);
  var total = 0;
  var min_num = 0;

  exe_count = new Array(num);

  for (var i = 0; i < num; i++) {
    pro[i] = new proc();
    pro[i].proc_num = "P" + (i + 1);
    pro[i].num = i;
    pro[i].at = parseInt(arrive[i]);
    pro[i].bt = parseInt(burst[i]);
    pro[i].st = [0];
    pro[i].ft = [0];
    exe_count[i] = 1;
  }
  var min_val = pro[0].bt;
  var sortingField = "at";
  pro.sort(function(a, b) {
    if(a[sortingField] == b[sortingField]){
      return a["bt"] - b["bt"];
    }
    return a[sortingField] - b[sortingField];
  });
  while (1) {
    var cnt = 0;
    var t_tmp = new Array(num);
    for (var i = 0; i < num; i++) {
      if (pro[i].finish) cnt++;
    }
    if (cnt == num) break;
    for (var i = 0; i < num; i++) {
      if (total < pro[i].at) {
        t_tmp[i] = 0;
        continue;
      }
      if (pro[i].finish) continue;
      t_tmp[i] = total - pro[i].at; //프로세스가 기다린 시간
    }
    min_val = 0;
    min_num = 99999;
    for (var i = 0; i < num; i++) {
      //response ratio가 가장 큰 프로세스 선택
      if (total >= pro[i].at && min_val < ((t_tmp[i] + pro[i].bt) / pro[i].bt)
       && !pro[i].finish) {
        min_val = ((t_tmp[i] + pro[i].bt) / pro[i].bt);
        min_num = i;
      }
    }
    if (min_num == 99999) {
      for (var i = 0; i < num; i++) {
        if (!pro[i].finish) {
          min_num = i;
          break;
        }
      }
    }
    if (pro[min_num].at > total) total = pro[min_num].at;
    pro[min_num].st[0] = total;
    total += pro[min_num].bt;
    pro[min_num].ft[0] = total;
    pro[min_num].tt = total - pro[min_num].at;
    pro[min_num].wt = pro[min_num].tt - pro[min_num].bt;
    pro[min_num].ntt = pro[min_num].tt / pro[min_num].bt;
    pro[min_num].finish = true;
  }
  return pro;
}
