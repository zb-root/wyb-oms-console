'use strict';
app.controller('InsiderListCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', function ($scope, $http, $state, $stateParams, $timeout, global) {
  var token = localStorage.getItem("token")
  var page = 1;
  $scope.pageSize = history.pageSize||$scope.defaultRows;
  $scope.search = {};
  $scope.tablestyle = {};
  if ($scope.isSmartDevice) {
    $scope.tablestyle = {};
  } else {
    $scope.tablestyle = {
      height: $scope.app.navHeight - 220 + 'px',
      border: '1px solid #cccccc'
    }
  }

  $scope.left = function () {
    if ($scope.page > 1) {
      --page;
      $scope.getdata(page);
    }
  }
  $scope.right = function () {
    if ($scope.page < $scope.pages) {
      ++page;
      $scope.getdata(page);
    }
  };
  $scope.getdata = function (_page) {
    if (_page) page = _page;
    $scope.nodata = false;
    $scope.moreLoading = true;
    var search = $scope.search;
    if($scope.agentId) $scope.search.agentlevel = null;
    if($scope.search.agentlevel) $scope.agentId = null;
    $http.get(companyUri + '/insiderList', {
      params: {
        token: token,
        page: page,
        rows: $scope.pageSize || 20,
        agentId: $scope.agentId,
        level: $scope.search.agentlevel,
        search: search.keyword
      }
    }).success(function (result) {
      if (result.err) {
        $scope.error(result.msg);
      } else {
        $scope.moreLoading = false;
        $('html,body').animate({scrollTop: 0}, 100);
        $('.mobilebody').animate({scrollTop: 0}, 0);  //后面的0是延时
        $('.mobilebox').animate({scrollLeft: 0}, 0);
        $scope.insiderList = result.rows;
        if (result.total) {
          $scope.nodata = false;
          $scope.page = result.page;
          $scope.pages = result.pages;
          $scope.total = result.total;
          $scope.totalnumber = global.reg(result.total);
        } else {
          $scope.nodata = true;
          $scope.pages = 0;
          $scope.total = 0;
          $scope.totalnumber = 0;
        }
      }
    }).error(function (msg, code) {
      $scope.errorTips(code);
    });
  }

  // 重置密码
  $scope.resetpassword = function () {
    alert(12341)
  }
  // 激活和封号
  $scope.frozen = function () {

  }
  //  添加成员
  $scope.add = function () {
    if (!$scope.account) {
      $scope.error('账号不可为空');
      return false;
    }
    if ($scope.account.length >= 12) {
      $scope.error('帐号长度必须小于12个字符');
      return false;
    }
    // if($scope.account.length)
    if (!$scope.name || !$scope.area || !$scope.wechat || !$scope.limitMobile) {
      $scope.error('信息不完整');
      return false;
    }
    if ($scope.level == 0) {
      if ($scope.curator && $scope.together) {
        if ($scope.curator + $scope.together >= 100) {
          $scope.error('比例大于100%');
          return false;
        }
      } else {
        $scope.error('分成比例不合法');
        return false;
      }
    } else {
      if ($scope.level == 2) {
        if (!$scope.teaHouseName) {
          $scope.error('信息不完整');
          return false;
        }
      }
      if ($scope.together && $scope.oneLevel) {
        var oneLevel = parseFloat($scope.oneLevel / 100);
        if ($scope.together <= oneLevel) {
          $scope.error('比例不可超出一二级总和');
          return false;
        }
      }
    }

    var post = {
      account: $scope.account
    }
    if($scope.level == 0) post.mp = $scope.search.mpId
    $http.post(agentUri + '/agents', post, {
      params: {
        token: token
      }
    }).success(function (result) {
      var obj = result;
      if (obj.err) {
        $scope.error(obj.msg);
      } else {
        $('#addMember').modal('hide');
        $scope.success("添加成功");
        $scope.getdata();
      }
    }).error(function (msg, code) {
      $scope.errorTips(code);
    });
  }
  // 关闭弹窗
  $scope.cancel = function () {
    $('.modal').modal('hide');
  }

	$scope.addMember = function (row) {
    if(row){
      $scope.name = row.name || ''
    }
		$('#addMember').modal('show');
	}

  // 激活和封
  //查看成员信息
  $scope.html = function (row) {
    return '<form name="formValidate" class="form-horizontal form-validation">' +
      '<div class="form-group ">' +
      '<label class="col-xs-12 control-label"  style="text-align: center">确定 <span style="color: red">' + (row.user.active == true ? '冻结' : '激活') + ' </span>【' + row.user.account + '】用户吗？</label>' +
      '</div>' +
      '</form>';
  };

  // 激活冻结日志
  $scope.changeActiveLog = function (row) {
    var operator = row.user.active == true ? '冻结' : '激活'
    var post = {
      content: operator + '->【' + row.user.account + '】账号'
    }
    $scope.insertLog(post)
  }

  // 重置密码日志
  $scope.savePwdLog = function () {
    var operator = '重置'
    var post = {
      content: operator + '->【' + $scope.account + '】账号的密码'
    }
    $scope.insertLog(post)
  }
  //修改分成比例日志
  $scope.saveRatioLog = function () {
    var operator = '修改分成比例'
    console.log($scope)
    var post = {
      content: operator + '->【' + $scope.account + '】form【' + $scope.oldRatio + '】to【' + $scope.Ratio + '】'
    }
    $scope.insertLog(post)
  }
  //添加成员
  $scope.saveLog = function () {
    var operator = '新增成员'
    console.log($scope)
    var post = {
      content: operator + '->账号【' + $scope.account + '】姓名【' + $scope.name + '】'
    }
    $scope.insertLog(post)
  }

  // 执行日志写入
  $scope.insertLog = function (post) {
    $http.post(logUri + '/logs', post, {
      params: {
        token: token
      }
    })
  }

}]);
