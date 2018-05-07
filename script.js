<<<<<<< HEAD
var chart;
var tq = 0;
var sel = 0;
var sch = 0;
var chart;
var otherData;
var options;
var Process;
var exe_count = 0;

google.charts.load('current', {
  'packages': ['table']
});
google.charts.setOnLoadCallback(drawTable);

function drawTable(proc = null, flag = false) {
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
      data.addRows([
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


function draw(proc) {

  var dps = [];
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

function insertValue(frm) {

  sel = frm.scheduling.options[frm.scheduling.selectedIndex].value;
  sch = frm.scheduling.options[frm.scheduling.selectedIndex].text;
  if (sel == 2) {
    tq = prompt("Time quantum을 입력해주세요!");
  } else tq = 0;

}

var oTbl;
var arrive = new Array();
var burst = new Array();
var pro_num = 0;

function insRow() {
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

function frmCheck() {
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
  draw(Process);
}


function proc() {
  var proc_num = "0";
  var achieve = 0; //할당량 중 얼마나 남았는지 계산
  var st = 0;
  var ft = 0;
  var at = 0;
  var rat = 0;
  var bt = 0;
  var rt = 0;
  var wt = 0;
  var tt = 0;
  var ntt = 0;
  var finish = false;
}

function fcfs(num) {
  var pro = new Array(num);
  var total = 0;
  exe_count = new Array(num);

  for (var i = 0; i < num; i++) {
    exe_count[i] = 0;
    pro[i] = new proc();
    pro[i].proc_num = "P" + (i + 1);
    pro[i].at = parseInt(arrive[i]);
    pro[i].bt = parseInt(burst[i]);
    pro[i].st = new Array(num);
    pro[i].ft = new Array(num);
  }

  var sortingField = "at";
  pro.sort(function(a, b) {
    return a[sortingField] - b[sortingField];
  });
  for (var i = 0; i < num; i++) {
    if (total < pro[i].at) {
      total = pro[i].at;
      pro[i].st[exe_count[i]] = pro[i].at;
    } else {
      pro[i].st[exe_count[i]] = total;
    }
    total += pro[i].bt;
    pro[i].ft[exe_count[i]] = total;
    exe_count[i]++;
    pro[i].tt = total - pro[i].at;
    pro[i].wt = pro[i].tt - pro[i].bt;
    pro[i].ntt = pro[i].tt / pro[i].bt;
  }
  return pro;
}

function rr(num) {
  var pro = new Array(num);
  var total = 0;
  exe_count = new Array(num);
  var per_total = new Array(num);

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
    return a[sortingField] - b[sortingField];
  });
  while (1) {

    var cnt = 0;
    for (var i = 0; i < num; i++) {
      if (pro[i].achieve == 0) {
        cnt++;
        continue;
      }
      if (pro[i].at > total) {
        if (cnt == i) {
          total = pro[i].at;
        } else continue;
      }
      var tem_val = 999999999;
      var tem_num = 0;
      for (var j = 0; j < num; j++) {
        if (pro[j].at > total) break;
        else {
          if (pro[j].at <= tem_val && pro[j].achieve != 0) {
            tem_val = pro[j].at;
            tem_num = j;
          }
        }
      }
      if (pro[tem_num].achieve > parseInt(tq)) {
        pro[tem_num].st[exe_count[tem_num]] = total;
        pro[tem_num].achieve -= parseInt(tq);
        total += parseInt(tq);
        pro[tem_num].ft[exe_count[tem_num]] = total;
        pro[tem_num].at = total;
        exe_count[tem_num]++;
      } else {
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

  for (var i = 0; i < num; i++) {
    pro[i].tt = per_total[i] - pro[i].rat;
    pro[i].wt = pro[i].tt - pro[i].bt;
    pro[i].ntt = pro[i].tt / pro[i].bt;
  }

  return pro;
}

function spn(num) {
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
    return a[sortingField] - b[sortingField];
  });
  while (1) {
    var cnt = 0;
    for (var i = 0; i < num; i++) {
      if (pro[i].finish) cnt++;
      if (total >= pro[i].at && min_val > pro[i].bt && !pro[i].finish) {
        min_val = pro[i].bt;
        min_num = i;
      }
    }
    if (cnt == num) break;
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
  var total = 0;
  exe_count = new Array(num);
  var per_total = new Array(num);

  for (var i = 0; i < num; i++) {
    exe_count[i] = 0;
    pro[i] = new proc();
    pro[i].proc_num = "P" + (i + 1);
    pro[i].at = parseInt(arrive[i]);
    total += pro[i].bt;
    pro[i].bt = parseInt(burst[i]);
    pro[i].achieve = pro[i].bt;
    pro[i].st = new Array(num);
    pro[i].ft = new Array(num);
  }

  var sortingField = "at";
  pro.sort(function(a, b) {
    return a[sortingField] - b[sortingField];
  });
  var time = 0;
  var start = 0;
  var now_i = 0;
  var flag = false;
  while (1) {
    var cnt = 0;
    for (var i = 0; i < num; i++) {
      if (pro[i].finish) cnt++;
    }
    for(var i=0; i<num; i++){
      if(!pro[i].finish){
        now_i = i;
        break;
      }
    }
    if (cnt == num) break;
    s_num = 0;
    s_val = 99999;
    for (var i = 0; i < num; i++) {
      if (!pro[i].finish && pro[i].at <= time) {
        if (pro[i].achieve < s_val) {
          s_num = i;
          s_val = pro[i].achieve;
        }
      }
    }
    if(s_val == 99999){
      time = pro[now_i].at;
      continue;
    }
    pro[s_num].st[exe_count[s_num]] = time;
    while (1) {
      time++;
      pro[s_num].achieve -= 1;
      if (pro[s_num].achieve == 0) {
        pro[s_num].ft[exe_count[s_num]] = time;
        exe_count[s_num]++;
        pro[s_num].finish = true;
        per_total[s_num] = time;
        break;
      }
      for (var i = 0; i < num; i++) {
        if (!pro[i].finish && pro[i].at <= time && i != s_num) {
          if (pro[i].achieve <= pro[s_num].achieve) {
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
      t_tmp[i] = total - pro[i].at;
    }
    min_val = 0;
    min_num = 0;
    for (var i = 0; i < num; i++) {
      if (total >= pro[i].at && min_val < ((t_tmp[i] + pro[i].bt) / pro[i].bt) && !pro[i].finish) {
        min_val = ((t_tmp[i] + pro[i].bt) / pro[i].bt);
        min_num = i;
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
    min_num = 0;
    min_val = 0;
  }
  return pro;
}
=======
var chart;
var tq = 0;
var sel = 0;
var sch = 0;
var chart;
var otherData;
var options;
var Process;
var exe_count = 0;

google.charts.load('current', {
  'packages': ['table']
});
google.charts.setOnLoadCallback(drawTable);

function drawTable(proc = null, flag = false) {
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
      data.addRows([
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


function draw(proc) {

  var dps = [];
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

function insertValue(frm) {

  sel = frm.scheduling.options[frm.scheduling.selectedIndex].value;
  sch = frm.scheduling.options[frm.scheduling.selectedIndex].text;
  if (sel == 2) {
    tq = prompt("Time quantum을 입력해주세요!");
  } else tq = 0;

}

var oTbl;
var arrive = new Array();
var burst = new Array();
var pro_num = 0;

function insRow() {
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

function frmCheck() {
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
  draw(Process);
}


function proc() {
  var proc_num = "0";
  var achieve = 0; //할당량 중 얼마나 남았는지 계산
  var st = 0;
  var ft = 0;
  var at = 0;
  var rat = 0;
  var bt = 0;
  var rt = 0;
  var wt = 0;
  var tt = 0;
  var ntt = 0;
  var finish = false;
}

function fcfs(num) {
  var pro = new Array(num);
  var total = 0;
  exe_count = new Array(num);

  for (var i = 0; i < num; i++) {
    exe_count[i] = 0;
    pro[i] = new proc();
    pro[i].proc_num = "P" + (i + 1);
    pro[i].at = parseInt(arrive[i]);
    pro[i].bt = parseInt(burst[i]);
    pro[i].st = new Array(num);
    pro[i].ft = new Array(num);
  }

  var sortingField = "at";
  pro.sort(function(a, b) {
    return a[sortingField] - b[sortingField];
  });
  for (var i = 0; i < num; i++) {
    if (total < pro[i].at) {
      total = pro[i].at;
      pro[i].st[exe_count[i]] = pro[i].at;
    } else {
      pro[i].st[exe_count[i]] = total;
    }
    total += pro[i].bt;
    pro[i].ft[exe_count[i]] = total;
    exe_count[i]++;
    pro[i].tt = total - pro[i].at;
    pro[i].wt = pro[i].tt - pro[i].bt;
    pro[i].ntt = pro[i].tt / pro[i].bt;
  }
  return pro;
}

function rr(num) {
  var pro = new Array(num);
  var total = 0;
  exe_count = new Array(num);
  var per_total = new Array(num);

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
    return a[sortingField] - b[sortingField];
  });
  while (1) {

    var cnt = 0;
    for (var i = 0; i < num; i++) {
      if (pro[i].achieve == 0) {
        cnt++;
        continue;
      }
      if (pro[i].at > total) {
        if (cnt == i) {
          total = pro[i].at;
        } else continue;
      }
      var tem_val = 999999999;
      var tem_num = 0;
      for (var j = 0; j < num; j++) {
        if (pro[j].at > total) break;
        else {
          if (pro[j].at <= tem_val && pro[j].achieve != 0) {
            tem_val = pro[j].at;
            tem_num = j;
          }
        }
      }
      if (pro[tem_num].achieve > parseInt(tq)) {
        pro[tem_num].st[exe_count[tem_num]] = total;
        pro[tem_num].achieve -= parseInt(tq);
        total += parseInt(tq);
        pro[tem_num].ft[exe_count[tem_num]] = total;
        pro[tem_num].at = total;
        exe_count[tem_num]++;
      } else {
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

  for (var i = 0; i < num; i++) {
    pro[i].tt = per_total[i] - pro[i].rat;
    pro[i].wt = pro[i].tt - pro[i].bt;
    pro[i].ntt = pro[i].tt / pro[i].bt;
  }

  return pro;
}

function spn(num) {
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
    return a[sortingField] - b[sortingField];
  });
  while (1) {
    var cnt = 0;
    for (var i = 0; i < num; i++) {
      if (pro[i].finish) cnt++;
      if (total >= pro[i].at && min_val > pro[i].bt && !pro[i].finish) {
        min_val = pro[i].bt;
        min_num = i;
      }
    }
    if (cnt == num) break;
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
  var total = 0;
  exe_count = new Array(num);
  var per_total = new Array(num);

  for (var i = 0; i < num; i++) {
    exe_count[i] = 0;
    pro[i] = new proc();
    pro[i].proc_num = "P" + (i + 1);
    pro[i].at = parseInt(arrive[i]);
    total += pro[i].bt;
    pro[i].bt = parseInt(burst[i]);
    pro[i].achieve = pro[i].bt;
    pro[i].st = new Array(num);
    pro[i].ft = new Array(num);
  }

  var sortingField = "at";
  pro.sort(function(a, b) {
    return a[sortingField] - b[sortingField];
  });
  var time = 0;
  var start = 0;
  var now_i = 0;
  var flag = false;
  while (1) {
    var cnt = 0;
    for (var i = 0; i < num; i++) {
      if (pro[i].finish) cnt++;
    }
    for(var i=0; i<num; i++){
      if(!pro[i].finish){
        now_i = i;
        break;
      }
    }
    if (cnt == num) break;
    s_num = 0;
    s_val = 99999;
    for (var i = 0; i < num; i++) {
      if (!pro[i].finish && pro[i].at <= time) {
        if (pro[i].achieve < s_val) {
          s_num = i;
          s_val = pro[i].achieve;
        }
      }
    }
    if(s_val == 99999){
      time = pro[now_i].at;
      continue;
    }
    pro[s_num].st[exe_count[s_num]] = time;
    while (1) {
      time++;
      pro[s_num].achieve -= 1;
      if (pro[s_num].achieve == 0) {
        pro[s_num].ft[exe_count[s_num]] = time;
        exe_count[s_num]++;
        pro[s_num].finish = true;
        per_total[s_num] = time;
        break;
      }
      for (var i = 0; i < num; i++) {
        if (!pro[i].finish && pro[i].at <= time && i != s_num) {
          if (pro[i].achieve <= pro[s_num].achieve) {
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
      t_tmp[i] = total - pro[i].at;
    }
    min_val = 0;
    min_num = 0;
    for (var i = 0; i < num; i++) {
      if (total >= pro[i].at && min_val < ((t_tmp[i] + pro[i].bt) / pro[i].bt) && !pro[i].finish) {
        min_val = ((t_tmp[i] + pro[i].bt) / pro[i].bt);
        min_num = i;
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
    min_num = 0;
    min_val = 0;
  }
  return pro;
}
>>>>>>> ver 1.1
