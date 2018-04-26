'use strict';
app.controller('InsiderListCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', function ($scope, $http, $state, $stateParams, $timeout, global) {
  var token = localStorage.getItem("token")
  var page = 1;
  $scope.pageSize = history.pageSize||$scope.defaultRows;
  $scope.search = {};
  $scope.insider = {}
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
    $http.get(insiderUri + '/infos', {
      params: {
        token: token,
        page: page,
        rows: $scope.pageSize || 20,
        name: search.name,
        idcard:search.idcard,
        mobile:search.mobile,
        department:search.department,
        state:search.state
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

	$scope.getdata()

  //删除确认框
	$scope.html = function(row){
		return '<form name="formValidate" class="form-horizontal form-validation">' +
			'<div class="form-group ">' +
			'<label class="col-xs-12 control-label"  style="text-align: center">确定删除该人员吗？</label>' +
			'</div>' +
			'</form>';
	};

  //  添加成员
  $scope.addMember = function () {
    var data = $scope.insider || {}
	  if(!data.name || !data.idcard || !data.mobile || !data.department || !data.state ) return $scope.error('请完善信息')
    // data.token = token
    $http.post(insiderUri + '/infos', data,{
      params: {
        token:token
      }
    }).success(function (result) {
      console.log(result)
      var obj = result;
      if (obj.err) {
        $scope.error(obj.msg);
      } else {
        $('#addMember').modal('hide');
        $scope.success("添加成功");
	      $scope.insider = {}
        $scope.getdata();
      }
    }).error(function (msg, code) {
	    console.log(msg,code)
      $scope.errorTips(code);
    });
  }

  $scope.updateMember = function () {
    var data = {
      name:$scope.name,
      department:$scope.department,
      state:$scope.state,
      memo:$scope.memo
    }

    if(!data.name || !data.department || !data.state ) return $scope.error('请完善信息')
    if(!$scope.insiderId) return $scope.error('程序错误')
	  $http.post(insiderUri + '/infos/'+$scope.insiderId,data, {
		  params: {
			  token: token
		  }
	  }).success(function (result) {
		  var obj = result;
		  if (obj.err) {
			  $scope.error(obj.msg);
		  } else {
			  $('#updateMember').modal('hide');
			  $scope.success("修改成功");
			  $scope.getdata();
		  }
	  }).error(function (msg, code) {
		  $scope.errorTips(code);
	  });
  }

	$scope.deleteMember = function (row) {

		$scope.openTips({
			title:"提示",
			content: $scope.html(row),
			okTitle:"确定",
			okCallback:function(){
				row = row || {}
				if(!row._id) return false;
				$http.delete(insiderUri + '/infos/'+row._id, {
					params: {
						token: token
					}
				}).success(function (result) {
					var obj = result;
					if (obj.err) {
						$scope.error(obj.msg);
					} else {
						$scope.success("删除成功");
						$scope.getdata();
					}
				}).error(function (msg, code) {
					$scope.errorTips(code);
				});
			}
		});

	}
  // 关闭弹窗
  $scope.cancel = function () {
    $scope.insider = {}
    $('.modal').modal('hide');
  }

	$scope.open = function (row) {
    if(row){
      console.log(row.state)
      $scope.name = row.name || ''
      $scope.idcard = row.idcard || ''
      $scope.mobile = row.mobile || ''
      $scope.department = row.department || ''
      $scope.state = ""+row.state || "1"
      $scope.memo = row.memo || ''
      $scope.insiderId = row._id
	    $('#updateMember').modal('show');
    }else{
      $scope.insider.state = "1"
	    $('#addMember').modal('show');
    }
	}

  // //查看成员信息
  // $scope.html = function (row) {
  //   return '<form name="formValidate" class="form-horizontal form-validation">' +
  //     '<div class="form-group ">' +
  //     '<label class="col-xs-12 control-label"  style="text-align: center">确定 <span style="color: red">' + (row.user.active == true ? '冻结' : '激活') + ' </span>【' + row.user.account + '】用户吗？</label>' +
  //     '</div>' +
  //     '</form>';
  // };


  // 执行日志写入
  $scope.insertLog = function (post) {
    $http.post(logUri + '/logs', post, {
      params: {
        token: token
      }
    })
  }

}]);
