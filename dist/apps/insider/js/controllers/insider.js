'use strict';
app.controller('InsiderListCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', function ($scope, $http, $state, $stateParams, $timeout, global) {
  var token = localStorage.getItem("token")
  var page = 1;
  $scope.pageSize = history.pageSize||$scope.defaultRows;
  $scope.search = {};
  $scope.insider = {}
  $scope.tablestyle = {};

  $scope.departmentList = [
  	'北京市公安部', '天津市公安部','河北省公安部','山西省公安部',
	  '内蒙古自治区公安部', '辽宁省公安部','吉林省公安部','黑龙江省公安部',
	  '上海市公安部', '江苏省公安部','浙江省公安部','安徽省公安部',
	  '福建省公安部', '江西省公安部','山东省公安部','河南省公安部',
	  '湖北省公安部', '湖南省公安部','广东省公安部','广西壮族自治区公安部',
	  '海南省公安部', '重庆市公安部','四川省公安部','贵州省公安部',
	  '云南省公安部', '西藏自治区公安部','陕西省公安部','甘肃省公安部',
	  '青海省公安部', '宁夏回族自治区公安部','新疆维吾尔自治区公安部'
  ]

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
    var conditions = {}
    search.name && (conditions.name = search.name)
	  search.idcard && (conditions.idcard = search.idcard)
	  search.mobile && (conditions.mobile = search.mobile)
	  search.department && (conditions.department = search.department)
	  search.state && (conditions.state = search.state)
	  conditions.token = token
	  conditions.page = page
	  conditions.rows = $scope.pageSize || 20
    $http.get(insiderUri + '/infos', {
      params: conditions
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
